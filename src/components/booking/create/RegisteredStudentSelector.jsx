import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import StudentCombobox from "../StudentCombobox";
import { SearchResultsInfo, SearchError, ValidationError } from "../SearchInfo";
import { useStudentSearch } from "@/hooks/useStudentSearch";

export default function RegisteredStudentSelector({
    formData,
    onInputChange,
    onLearnerTypeChange,
    existingUser,
    clearExistingUser,
    errors
}) {
    const {
        searchQuery,
        setSearchQuery,
        searchResults,
        setSearchResults,
        searching,
        searchError,
        triggerSearch
    } = useStudentSearch();

    // Debug logging
    console.log('RegisteredStudentSelector render:', {
        existingUser,
        'formData.learner_id': formData.learner_id,
        searchQuery,
        searchResults: searchResults.length
    });

    // Handle pre-selected user from the "Select This User" flow
    useEffect(() => {
        if (existingUser) {
            console.log('Pre-selecting existing user:', existingUser);

            // Set the learner ID first
            onInputChange('learner_id', existingUser.id);

            // Use the full name for display in the search box
            const displayName = `${existingUser.first_name} ${existingUser.last_name}`.trim();
            setSearchQuery(displayName);

            // Pre-populate search results with the existing user
            const userAsSearchResult = {
                id: existingUser.id,
                first_name: existingUser.first_name,
                last_name: existingUser.last_name,
                email: existingUser.email,
                phone_number: existingUser.phone_number,
                role: existingUser.role || 'learner',
                total_hours_booked: existingUser.total_hours_booked || 0,
                total_hours_completed: existingUser.total_hours_completed || 0,
                total_hours_remaining: existingUser.total_hours_remaining || 0,
                is_active: existingUser.is_active !== false,
                is_email_verified: existingUser.is_email_verified || false,
                approval_status: existingUser.approval_status || 'approved',
                notes: existingUser.notes || ''
            };

            if (setSearchResults) {
                setSearchResults([userAsSearchResult]);
            }

            // Also trigger a proper search using email to get comprehensive results
            triggerSearch(existingUser.email);

            // Clear the existing user after processing
            setTimeout(() => {
                if (clearExistingUser) {
                    clearExistingUser();
                }
            }, 100);
        }
    }, [existingUser]);

    // Find the selected student to display their name in the search box
    const selectedStudent = searchResults.find(student => student.id === formData.learner_id);

    // Update search query when a student is selected (but only if it's different)
    useEffect(() => {
        if (selectedStudent && formData.learner_id) {
            const displayName = `${selectedStudent.first_name} ${selectedStudent.last_name}`.trim();
            // Only update if the current search query doesn't match the selected student's name
            if (searchQuery !== displayName) {
                console.log('Updating search query to selected student name:', displayName);
                setSearchQuery(displayName);
            }
        }
    }, [selectedStudent, formData.learner_id]);

    const handleSearch = (query) => {
        console.log('HandleSearch called with:', query);
        setSearchQuery(query);

        // Clear the selected learner if user is typing something new
        // Only clear if the query doesn't match the currently selected student's name
        if (selectedStudent) {
            const selectedDisplayName = `${selectedStudent.first_name} ${selectedStudent.last_name}`.trim();
            if (query !== selectedDisplayName && formData.learner_id) {
                console.log('Clearing selected learner due to search query change');
                onInputChange('learner_id', null);
            }
        }
    };

    const handleStudentSelect = (studentId) => {
        console.log('Student selected:', studentId);

        // Set the learner ID
        onInputChange('learner_id', studentId);

        // Find the selected student and update the search query to show their full name
        const student = searchResults.find(s => s.id === studentId);
        if (student) {
            const displayName = `${student.first_name} ${student.last_name}`.trim();
            console.log('Setting search query to selected student name:', displayName);
            setSearchQuery(displayName);
        }
    };

    const handleAddNewStudent = () => {
        onLearnerTypeChange(true);
    };

    // Compute the display value for the combobox
    const getDisplayValue = () => {
        if (selectedStudent) {
            return `${selectedStudent.first_name} ${selectedStudent.last_name}`.trim();
        }
        return searchQuery;
    };

    return (
        <div className="space-y-4">
            <div>
                <Label className="text-sm font-medium">
                    Select Registered Student <span className="text-red-500">*</span>
                </Label>
                <div className="mt-2">
                    <StudentCombobox
                        value={formData.learner_id}
                        onChange={handleStudentSelect}
                        students={searchResults}
                        searching={searching}
                        onSearch={handleSearch}
                        placeholder="Search students by name, email, or phone..."
                        error={errors.learner_id}
                        onAddNew={handleAddNewStudent}
                        // Pass the computed display value
                        displayValue={getDisplayValue()}
                        // Also pass the search query for internal use
                        initialQuery={searchQuery}
                    />
                </div>

                <SearchResultsInfo
                    searchQuery={searchQuery}
                    resultsCount={searchResults.length}
                    searching={searching}
                />

                <SearchError error={searchError} />

                <ValidationError error={errors.learner_id} />
            </div>

            {/* Quick Actions */}
            <div className="flex items-center justify-between pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                    Can't find the student you're looking for?
                </p>
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleAddNewStudent}
                    className="text-xs"
                >
                    <Plus className="h-3 w-3 mr-1" />
                    Add New Student
                </Button>
            </div>
        </div>
    );
}