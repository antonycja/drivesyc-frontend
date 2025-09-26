import { User, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LoadingState() {
    return (
        <div className="p-4 text-center text-muted-foreground">
            <div className="animate-pulse">Searching students...</div>
        </div>
    );
}

export function NoResultsState({ query, onAddNew }) {
    return (
        <div className="p-4 text-center">
            <div className="flex flex-col items-center space-y-3">
                <User className="h-8 w-8 text-muted-foreground" />
                <div className="space-y-1">
                    <p className="text-sm font-medium">No students found</p>
                    <p className="text-xs text-muted-foreground">
                        No students match "{query}"
                    </p>
                </div>
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={onAddNew}
                    className="text-xs"
                >
                    <Plus className="h-3 w-3 mr-1" />
                    Add as New Student
                </Button>
            </div>
        </div>
    );
}

export function EmptyState() {
    return (
        <div className="p-4 text-center text-muted-foreground">
            <div className="flex flex-col items-center space-y-2">
                <Search className="h-6 w-6" />
                <p className="text-sm">Start typing to search students...</p>
            </div>
        </div>
    );
}