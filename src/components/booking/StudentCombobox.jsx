import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X, ChevronDown } from "lucide-react";
import StudentCard from "./StudentCard";
import { LoadingState, NoResultsState, EmptyState } from "./DropdownStates";

export default function StudentCombobox({
    value,
    onChange,
    students,
    searching,
    onSearch,
    placeholder,
    error,
    onAddNew,
    initialQuery // Add this new prop
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [lastExternalValue, setLastExternalValue] = useState(null);
    const inputRef = useRef();
    const listRef = useRef();
    const userTypingTimeoutRef = useRef();

    // Handle initial query from parent (for pre-population)
    useEffect(() => {
        if (initialQuery && initialQuery !== query) {
            setQuery(initialQuery);
            // If the initial query looks like an email and we have a matching user,
            // update the display to show the user's full name instead
            if (initialQuery.includes('@') && students.length > 0) {
                const matchingUser = students.find(s => s.email === initialQuery);
                if (matchingUser && value && value.toString() === matchingUser.id.toString()) {
                    const fullName = `${matchingUser.first_name} ${matchingUser.last_name}`;
                    setQuery(fullName);
                }
            }
        }
    }, [initialQuery, students, value]);

    // Handle external value changes (from props) - only update if it's truly external
    useEffect(() => {
        // Skip if this is the same value we just processed
        if (value === lastExternalValue) return;

        if (value && value !== '') {
            const selectedStudent = students.find(s => s.id.toString() === value.toString());
            if (selectedStudent) {
                const fullName = `${selectedStudent.first_name} ${selectedStudent.last_name}`;
                // Update query to match the selected student
                setQuery(fullName);
                setLastExternalValue(value);
            }
        } else if (!value && query !== '') {
            // Clear query only if value is explicitly cleared externally
            if (lastExternalValue !== null) {
                setQuery('');
            }
        }

        setLastExternalValue(value);
    }, [value, students]);

    const handleInputChange = (e) => {
        const newQuery = e.target.value;
        setQuery(newQuery);

        // Clear any pending timeout
        if (userTypingTimeoutRef.current) {
            clearTimeout(userTypingTimeoutRef.current);
        }

        // If query doesn't match selected student, clear the selection
        if (value) {
            const selectedStudent = students.find(s => s.id.toString() === value.toString());
            if (selectedStudent) {
                const fullName = `${selectedStudent.first_name} ${selectedStudent.last_name}`;
                if (newQuery !== fullName && !newQuery.includes(selectedStudent.first_name)) {
                    onChange('');
                    setLastExternalValue(null);
                }
            }
        }

        onSearch(newQuery);
        setIsOpen(true);
        setHighlightedIndex(-1);
    };

    const handleSelect = (student) => {
        const fullName = `${student.first_name} ${student.last_name}`;
        setQuery(fullName);
        setLastExternalValue(student.id);
        onChange(student.id);
        setIsOpen(false);
        setHighlightedIndex(-1);
    };

    const handleClear = () => {
        setQuery('');
        setLastExternalValue(null);
        onChange('');
        onSearch('');
        setIsOpen(false);
        setHighlightedIndex(-1);
    };

    const handleKeyDown = (e) => {
        if (!isOpen) {
            if (e.key === 'Enter' || e.key === 'ArrowDown') {
                setIsOpen(true);
                setHighlightedIndex(0);
                e.preventDefault();
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex(prev =>
                    prev < students.length - 1 ? prev + 1 : 0
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev =>
                    prev > 0 ? prev - 1 : students.length - 1
                );
                break;
            case 'Enter':
                e.preventDefault();
                if (highlightedIndex >= 0 && highlightedIndex < students.length) {
                    handleSelect(students[highlightedIndex]);
                }
                break;
            case 'Escape':
                setIsOpen(false);
                setHighlightedIndex(-1);
                break;
        }
    };

    const handleAddNewClick = () => {
        onAddNew();
        setIsOpen(false);
    };

    // Auto-scroll highlighted item into view
    useEffect(() => {
        if (highlightedIndex >= 0 && listRef.current) {
            const highlightedElement = listRef.current.children[highlightedIndex];
            if (highlightedElement) {
                highlightedElement.scrollIntoView({
                    block: 'nearest',
                    behavior: 'smooth'
                });
            }
        }
    }, [highlightedIndex]);

    return (
        <div className="relative">
            <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                <Input
                    ref={inputRef}
                    value={query}
                    onChange={handleInputChange}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className={`pl-10 pr-20 ${error ? 'border-destructive' : ''}`}
                />
                <div className="absolute right-1 top-1 flex items-center space-x-1">
                    {query && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleClear}
                            className="h-8 w-8 p-0 hover:bg-gray-100"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsOpen(!isOpen)}
                        className="h-8 w-8 p-0 hover:bg-gray-100"
                    >
                        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </Button>
                </div>
            </div>

            {isOpen && (
                <>
                    <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-72 overflow-hidden">
                        <div ref={listRef} className="max-h-72 overflow-auto">
                            {searching ? (
                                <LoadingState />
                            ) : students.length === 0 && query ? (
                                <NoResultsState
                                    query={query}
                                    onAddNew={handleAddNewClick}
                                />
                            ) : students.length === 0 ? (
                                <EmptyState />
                            ) : (
                                students.map((student, index) => (
                                    <StudentCard
                                        key={student.id}
                                        student={student}
                                        isSelected={value && value.toString() === student.id.toString()}
                                        isHighlighted={index === highlightedIndex}
                                        onClick={handleSelect}
                                    />
                                ))
                            )}
                        </div>
                    </div>

                    {/* Overlay to close dropdown */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                </>
            )}
        </div>
    );
}