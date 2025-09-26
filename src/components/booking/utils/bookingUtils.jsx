export const getStatusBadge = (status) => {
    const variants = {
        confirmed: "default",
        completed: "secondary",
        pending: "outline",
        cancelled: "destructive",
    };
    return variants[status] || "outline";
};

export const getRelativeDate = (dateObj) => {
    if (!dateObj || !(dateObj instanceof Date)) return "-";
    try {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        const dateOnly = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
        const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const tomorrowOnly = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());
        const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

        if (dateOnly.getTime() === todayOnly.getTime()) return "Today";
        if (dateOnly.getTime() === tomorrowOnly.getTime()) return "Tomorrow";
        if (dateOnly.getTime() === yesterdayOnly.getTime()) return "Yesterday";
        
        return dateObj.toLocaleDateString("en-ZA", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
    } catch (error) {
        return "-";
    }
};

export const formatTime = (dateObj) => {
    if (!dateObj || !(dateObj instanceof Date)) return "-";
    try {
        return dateObj.toLocaleTimeString("en-ZA", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
        });
    } catch (error) {
        return "-";
    }
};

export const isPast = (dateObj) => {
    if (!dateObj || !(dateObj instanceof Date)) return false;
    return dateObj < new Date();
};