import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";

export function SearchResultsInfo({ searchQuery, resultsCount, searching }) {
    if (searching || !searchQuery) return null;
    
    return (
        <div className="mt-2 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
                {resultsCount === 0
                    ? `No students found matching "${searchQuery}"`
                    : `${resultsCount} student${resultsCount === 1 ? '' : 's'} found`
                }
            </p>
            {resultsCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                    {resultsCount} results
                </Badge>
            )}
        </div>
    );
}

export function SearchError({ error }) {
    if (!error) return null;
    
    return (
        <p className="text-sm text-destructive mt-2 flex items-center space-x-1">
            <AlertCircle className="h-4 w-4" />
            <span>Search error: {error}</span>
        </p>
    );
}

export function ValidationError({ error }) {
    if (!error) return null;
    
    return (
        <p className="text-sm text-destructive mt-2 flex items-center space-x-1">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
        </p>
    );
}