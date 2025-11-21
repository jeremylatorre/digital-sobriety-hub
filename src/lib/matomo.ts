import { createInstance, MatomoProvider } from '@datapunt/matomo-tracker-react';

// Get configuration from environment variables
const MATOMO_URL = import.meta.env.VITE_MATOMO_URL || 'http://localhost:8080';
const MATOMO_SITE_ID = parseInt(import.meta.env.VITE_MATOMO_SITE_ID || '1', 10);
const TRACKING_ENABLED = import.meta.env.VITE_MATOMO_TRACKING_ENABLED === 'true';

// Check if user has Do Not Track enabled
const isDNTEnabled = () => {
    return (
        navigator.doNotTrack === '1' ||
        (window as any).doNotTrack === '1' ||
        (navigator as any).msDoNotTrack === '1'
    );
};

// Create Matomo instance with privacy‑first settings
export const matomoInstance = createInstance({
    urlBase: MATOMO_URL,
    siteId: MATOMO_SITE_ID,
    disabled: !TRACKING_ENABLED || isDNTEnabled(), // Respect DNT and toggle
    heartBeat: {
        active: true,
        seconds: 15,
    },
    linkTracking: true,
    configurations: {
        disableCookies: true, // No cookies for privacy
        setSecureCookie: MATOMO_URL.startsWith('https'), // Secure only on HTTPS
        setRequestMethod: 'POST',
    },
});

// Helper to track a page view (called from RouteTracker)
export const trackPageView = (customTitle?: string) => {
    if (!TRACKING_ENABLED || isDNTEnabled()) return;
    matomoInstance.trackPageView({
        documentTitle: customTitle || document.title,
    });
};

// Generic event tracking
export const trackEvent = (category: string, action: string, name?: string, value?: number) => {
    if (!TRACKING_ENABLED || isDNTEnabled()) return;
    matomoInstance.trackEvent({
        category,
        action,
        name,
        value,
    });
};

// Assessment‑specific helpers
export const trackAssessmentStarted = (level: 'essential' | 'recommended' | 'advanced') => {
    trackEvent('Assessment', 'Started', level);
};

export const trackAssessmentCompleted = (level: string, score: number) => {
    trackEvent('Assessment', 'Completed', level, score);
};

export const trackQuestionAnswered = (questionId: string, status: string) => {
    trackEvent('Assessment', 'Question Answered', `${questionId}-${status}`);
};

export const trackExport = (format: 'excel' | 'pdf') => {
    trackEvent('Export', 'Report Downloaded', format);
};

export const trackUserAction = (action: string, detail?: string) => {
    trackEvent('User Action', action, detail);
};

// Export MatomoProvider for wrapping the app
export { MatomoProvider };
