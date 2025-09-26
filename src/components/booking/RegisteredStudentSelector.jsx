import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import StudentCombobox from "./StudentCombobox";
import { SearchResultsInfo, SearchError, ValidationError } from "./SearchInfo";
import { useStudentSearch } from "@/hooks/useStudentSearch";

export default function RegisteredStudentSelector({
    formData,
    onInputChange,
    onLearnerTypeChange,
    existingUser, // Add this prop to receive the existing user from parent
    clearExistingUser, // Add this prop to clear the existing user
    errors
}) {
    const {
        searchQuery,
        setSearchQuery,
        searchResults,
        setSearchResults, // Make sure this is destructured
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

            // Use email for search instead of full name (avoids space issues)
            const searchTerm = existingUser.email;
            setSearchQuery(searchTerm);

            // Pre-populate search results with the existing user
            // This ensures the user appears in the dropdown immediately
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

            // Set the search results immediately with this user
            if (setSearchResults) {
                setSearchResults([userAsSearchResult]);
            }

            // Also trigger a proper search using email to get comprehensive results
            triggerSearch(searchTerm);

            // Clear the existing user after processing to prevent re-triggering
            setTimeout(() => {
                if (clearExistingUser) {
                    clearExistingUser();
                }
            }, 100);
        }
    }, [existingUser]); // Simplified dependencies - only watch existingUser

    const handleSearch = (query) => {
        console.log('HandleSearch called with:', query);
        setSearchQuery(query);
    };

    const handleStudentSelect = (studentId) => {
        console.log('Student selected:', studentId);
        onInputChange('learner_id', studentId);
    };

    const handleAddNewStudent = () => {
        onLearnerTypeChange(true);
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
                        // Pass the search query to help with pre-population
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