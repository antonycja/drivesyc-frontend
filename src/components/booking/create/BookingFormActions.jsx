import { Button } from "@/components/ui/button";
import { Save, Loader2 } from "lucide-react";

export default function BookingFormActions({ submitting, onBack, onNavigate }) {
    return (
        <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button
                type="button"
                variant="outline"
                onClick={onBack || (() => onNavigate && onNavigate('create-booking'))}
                disabled={submitting}
            >
                Cancel
            </Button>
            <Button
                type="submit"
                disabled={submitting}
                className="flex items-center space-x-2"
            >
                {submitting ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Creating Booking...</span>
                    </>
                ) : (
                    <>
                        <Save className="h-4 w-4" />
                        <span>Create Booking</span>
                    </>
                )}
            </Button>
        </div>
    );
}
