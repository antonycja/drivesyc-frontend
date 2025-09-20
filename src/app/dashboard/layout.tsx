import { ReactNode } from 'react'

export default function DashboardLayout({
    children,
}: {
    children: ReactNode
}) {
    return (
        <div className="flex justify-between min-h-screen bg-white dark:bg-gray-800">
            <div className="max-w-fit mx-auto pr-4 sm:pr-6 lg:pr-8 py-0">
                <main>
                    {children}
                </main>
            </div>
        </div>
    )
}