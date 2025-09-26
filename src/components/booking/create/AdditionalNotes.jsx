import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

export default function AdditionalNotes({
    formData,
    onInputChange
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
                <textarea
                    value={formData.notes}
                    onChange={(e) => onInputChange('notes', e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background min-h-[100px] resize-vertical"
                    placeholder="Any additional notes, special requirements, or specific areas to focus on during the lesson..."
                />
                <p className="text-xs text-muted-foreground mt-1">
                    Optional: Add any specific instructions for the instructor
                </p>
            </CardContent>
        </Card>
    );
}