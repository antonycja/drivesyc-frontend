import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingSkeleton() {
    return (
        <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
            <div className="space-y-2">
                {[...Array(8)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                ))}
            </div>
        </div>
    );
}