export class NavigationState {
    static STORAGE_KEY = 'currentView';

    static saveView(view) {
        if (typeof window !== 'undefined') {
            localStorage.setItem(this.STORAGE_KEY, view);

            // Also update URL for better UX
            const newUrl = new URL(window.location);
            if (view !== 'dashboard') {
                newUrl.searchParams.set('view', view);
            } else {
                newUrl.searchParams.delete('view');
            }
            window.history.replaceState(null, '', newUrl.toString());
        }
    }

    static getView() {
        if (typeof window !== 'undefined') {
            // Check URL params first
            const urlParams = new URLSearchParams(window.location.search);
            const viewParam = urlParams.get('view');
            if (viewParam) return viewParam;

            // Check hash
            const hash = window.location.hash.substring(1);
            if (hash) return hash;

            // Check localStorage
            return localStorage.getItem(this.STORAGE_KEY) || 'dashboard';
        }
        return 'dashboard';
    }

    static clearView() {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(this.STORAGE_KEY);
        }
    }

    static getCurrentUrl() {
        if (typeof window !== 'undefined') {
            const currentView = this.getView();
            const basePath = window.location.pathname;

            if (currentView && currentView !== 'dashboard') {
                return `${basePath}?view=${currentView}`;
            }

            return basePath;
        }
        return '';
    }
}