// Umami Analytics Wrapper

// Define the Umami window object type
declare global {
    interface Window {
        umami?: {
            track: (payload: Record<string, any> | string, data?: Record<string, any>) => void;
        };
    }
}

const SCRIPT_URL = import.meta.env.VITE_UMAMI_SCRIPT_URL;
const WEBSITE_ID = import.meta.env.VITE_UMAMI_WEBSITE_ID;

/**
 * Injects the Umami script into the document head if configured.
 * This should be called once at app startup.
 */
export const initAnalytics = () => {
    if (!SCRIPT_URL || !WEBSITE_ID) {
        console.warn('Umami Analytics: Missing configuration (VITE_UMAMI_SCRIPT_URL or VITE_UMAMI_WEBSITE_ID). Tracking disabled.');
        return;
    }

    if (document.getElementById('umami-script')) {
        return; // Already injected
    }

    const script = document.createElement('script');
    script.id = 'umami-script';
    script.async = true;
    script.defer = true;
    script.src = SCRIPT_URL;
    script.setAttribute('data-website-id', WEBSITE_ID);

    // Optional: Auto-track can be disabled if we want full manual control, 
    // but usually we want it on. Umami auto-tracks pageviews by default.
    // script.setAttribute('data-auto-track', 'true'); 

    document.head.appendChild(script);
};

/**
 * Tracks a page view.
 * Umami tracks page views automatically on history changes if the script is loaded,
 * but this can be used for manual tracking if needed.
 */
export const trackPageView = (url?: string) => {
    if (window.umami) {
        // Umami automatically handles page views, but we can force one if needed
        // or just rely on its auto-detection. 
        // For compatibility with the old interface, we keep this.
        // If we want to manually track a view:
        // window.umami.track((props) => ({ ...props, url: url || window.location.pathname }));

        // However, standard Umami script auto-tracks. 
        // We'll leave this empty or log for dev unless we disable auto-track.
    }
};

/**
 * Tracks a custom event.
 * @param eventName The name of the event (e.g., 'Assessment Started')
 * @param eventData Optional object with additional data
 */
export const trackEvent = (eventName: string, eventData?: Record<string, any>) => {
    if (window.umami) {
        window.umami.track(eventName, eventData);
    } else {
        // console.debug('Analytics (Mock):', eventName, eventData);
    }
};

// --- Compatibility Helpers ---

export const trackAssessmentStarted = (level: 'essential' | 'recommended' | 'advanced') => {
    trackEvent('Assessment Started', { level });
};

export const trackAssessmentCompleted = (level: string, score: number) => {
    trackEvent('Assessment Completed', { level, score });
};

export const trackQuestionAnswered = (questionId: string, status: string) => {
    // To avoid spamming events, we might want to debounce this or just not track every single click
    // But for now, we keep parity.
    trackEvent('Question Answered', { questionId, status });
};

export const trackExport = (format: 'excel' | 'pdf') => {
    trackEvent('Report Downloaded', { format });
};

export const trackUserAction = (action: string, detail?: string) => {
    trackEvent(action, { detail });
};
