import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import ApiProxy from '@/app/api/lib/proxy'


export function useStudentSearch() {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [searchError, setSearchError] = useState(null);

    const debouncedSearchQuery = useDebounce(searchQuery, 300);

    // Search students using the API
    const searchStudents = async (query) => {
        if (!query || query.trim().length < 2) {
            setSearchResults([]);
            setSearching(false);
            setSearchError(null);
            return;
        }

        setSearching(true);
        setSearchError(null);

        try {
            // console.log('Searching for:', query.trim());

            // Use your API route which internally uses ApiProxy
            const url = `/api/users/search?q=${encodeURIComponent(query.trim())}&limit=20`;
            // console.log('API URL:', url);

            const { data, status } = await ApiProxy.get(url);
            // console.log('Response status:', response.status);

            if (status != 200) {
                throw new Error(errorData.error || errorText || `Search failed: ${status}`);
            }

            console.log("Data: ", data)


            // Filter to only show users with role 'learner' 
            const learners = (data.users || []).filter(user =>
                user.role === 'learner'
            );

            // console.log('Filtered learners:', learners);
            setSearchResults(learners);
        } catch (err) {
            console.error('Error searching students:', err);
            setSearchError(err.message || 'Failed to search students');
            setSearchResults([]);
        } finally {
            setSearching(false);
        }
    };

    // Effect to trigger search when debounced query changes
    useEffect(() => {
        searchStudents(debouncedSearchQuery);
    }, [debouncedSearchQuery]);

    // Manually trigger search (for external calls)
    const triggerSearch = (query) => {
        setSearchQuery(query);
        if (query && query.length >= 2) {
            searchStudents(query);
        }
    };

    // Method to manually set search results (for pre-population)
    const setManualResults = (results) => {
        setSearchResults(results);
    };

    // Clear all search state
    const clearSearch = () => {
        setSearchQuery('');
        setSearchResults([]);
        setSearching(false);
        setSearchError(null);
    };

    return {
        searchQuery,
        setSearchQuery,
        searchResults,
        setSearchResults: setManualResults, // Expose setter for manual population
        searching,
        searchError,
        searchStudents,
        triggerSearch,
        clearSearch
    };
}