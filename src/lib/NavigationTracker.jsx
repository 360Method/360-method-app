import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * NavigationTracker - Posts navigation changes to parent window
 * Base44 logging has been disabled since we now use Clerk + Supabase
 */
export default function NavigationTracker() {
    const location = useLocation();

    // Post navigation changes to parent window (for iframe embedding)
    useEffect(() => {
        window.parent?.postMessage({
            type: "app_changed_url",
            url: window.location.href
        }, '*');
    }, [location]);

    return null;
}