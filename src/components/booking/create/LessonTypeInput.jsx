import { AlertCircle } from "lucide-react";

export function LessonTypeInput({ value, onChange, error, className = "" }) {
    return (
        <div className={className}>
            <label className="block text-sm font-medium mb-2">
                Lesson Type <span className="text-red-500">*</span>
            </label>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md bg-background ${
                    error ? 'border-destructive' : 'border-input'
                }`}
                placeholder="e.g., Regular lesson, Highway practice, Parking, Test preparation"
            />
            {error && (
                <p className="text-sm text-destructive mt-1 flex items-center space-x-1">
                    <AlertCircle className="h-4 w-4" />
                    <span>{error}</span>
                </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
                Describe the type or focus of this lesson
            </p>
        </div>
    );
}