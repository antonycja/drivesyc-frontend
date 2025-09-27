import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Loader2 } from "lucide-react";

export function InstructorSelect({
    instructors,
    selectedInstructorId,
    onInstructorChange,
    loading,
    error,
    className = ""
}) {
    return (
        <div className={className}>
            <label className="block text-sm font-medium mb-2">
                Instructor <span className="text-red-500">*</span>
            </label>
            <Select
                value={instructors.length === 0 ? "no-instructors" : selectedInstructorId?.toString() || ''}
                onValueChange={(value) => onInstructorChange(value !== "no-instructors" ? value : '')}
                disabled={loading}
            >
                <SelectTrigger
                    className={`
                        ${error ? 'border-destructive' : ''} 
                        ${loading ? 'opacity-50' : ''}
                        ${instructors.length === 0 ? 'text-muted-foreground' : ''}
                    `}
                >
                    <SelectValue
                        placeholder={
                            loading
                                ? "Loading available instructors..."
                                : instructors.length === 0
                                    ? "No instructors available for this time"
                                    : "Select instructor"
                        }
                    />
                </SelectTrigger>
                <SelectContent>
                    {instructors.map((instructor) => (
                        <SelectItem key={instructor.id} value={instructor.id.toString()}>
                            {instructor.name}
                            {instructor.is_available === false && (
                                <span className="text-xs text-muted-foreground ml-2">(Unavailable)</span>
                            )}
                        </SelectItem>
                    ))}
                    {instructors.length === 0 && !loading && (
                        <SelectItem value="no-instructors" disabled className="text-muted-foreground">
                            No instructors available for this time slot
                        </SelectItem>
                    )}
                </SelectContent>
            </Select>
            {loading && (
                <div className="flex items-center space-x-2 mt-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-xs text-muted-foreground">
                        Checking instructor availability...
                    </span>
                </div>
            )}
            {error && (
                <p className="text-sm text-destructive mt-1 flex items-center space-x-1">
                    <AlertCircle className="h-4 w-4" />
                    <span>{error}</span>
                </p>
            )}
            {!loading && instructors.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                    Showing {instructors.length} available instructor{instructors.length !== 1 ? 's' : ''} for selected time
                </p>
            )}
        </div>
    );
}