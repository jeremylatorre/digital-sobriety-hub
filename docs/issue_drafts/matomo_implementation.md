---
title: Implement Matomo Analytics
labels: enhancement, analytics, privacy
assignees: []
---

## 🚀 Feature Request

### Description
Integrate **Matomo Analytics** to track user engagement and application usage patterns while respecting user privacy and digital sobriety principles. Matomo is a privacy-friendly alternative to Google Analytics that aligns with our values.

### Goals
- Monitor site traffic and user behavior (page views, session duration).
- Track key conversion events (Assessment completion, Tool usage).
- Ensure full GDPR compliance and data ownership.

### Technical Tasks
- [ ] Install `matomo-tracker-react` (or configure via script tag if preferred).
- [ ] Add environment variables for Matomo configuration:
    - `VITE_MATOMO_URL`
    - `VITE_MATOMO_SITE_ID`
- [ ] Initialize Matomo tracking in `App.tsx` or a dedicated provider.
- [ ] Implement route change tracking (for SPA).
- [ ] Add custom event tracking for:
    - Assessment started/completed.
    - "Quick Mode" vs "Standard Mode" selection.
    - Tools page filters/clicks.
- [ ] (Optional) Add a "Privacy Policy" link/modal if cookies are used (prefer cookieless configuration if possible).

### Acceptance Criteria
- [ ] Matomo script loads correctly on all pages.
- [ ] Page views are recorded in the Matomo dashboard.
- [ ] "Assessment Completed" event is triggered and recorded.
- [ ] No personal data (PII) is sent to the Matomo server.
- [ ] The implementation does not significantly impact Lighthouse performance score.
