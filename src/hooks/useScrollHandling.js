import { useState, useEffect } from "react";

export function useScrollHandling() {
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const scrolled = window.scrollY > 100;
            setShowScrollTop(window.scrollY > 400);
            setIsScrolled(scrolled);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return { showScrollTop, isScrolled, scrollToTop };
}
