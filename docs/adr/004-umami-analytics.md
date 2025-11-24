# ADR-004: Umami for Analytics

## Status
Accepted

## Context
We previously selected Matomo (ADR-003) for privacy-focused analytics. However, the self-hosted Matomo setup via Docker proved to be heavy and complex to maintain for the project's current needs. We want a simpler, lightweight alternative that still respects user privacy and digital sobriety principles.

## Decision
We will switch from Matomo to **Umami**, a lightweight, privacy-focused, open-source analytics solution.

## Rationale
1.  **Simplicity**: Umami is significantly lighter than Matomo. It doesn't require a complex Docker setup with a dedicated database if we use a managed version or a simpler self-hosted instance.
2.  **Privacy**: Umami is GDPR compliant, does not use cookies by default, and anonymizes data.
3.  **Performance**: The tracking script is tiny (< 2KB) compared to Matomo's, aligning better with our digital sobriety goals.
4.  **Ease of Integration**: Integration is as simple as adding a script tag, with a simple API for custom events.

## Implementation
-   Replace `@datapunt/matomo-tracker-react` with a custom lightweight wrapper around the Umami `window.umami` object.
-   Configure via environment variables: `VITE_UMAMI_SCRIPT_URL` and `VITE_UMAMI_WEBSITE_ID`.
-   Inject the script tag dynamically in the application if the environment variables are present.

## Consequences
### Positive
-   Reduced bundle size (removing Matomo React SDK).
-   Simplified local development (no need to run Matomo containers).
-   Better performance for end-users.

### Negative
-   Umami has fewer advanced features than Matomo (e.g., heatmaps, complex funnels), but these are not currently required.

## Supersedes
-   [ADR-003: Self-Hosted Matomo for Analytics](./003-matomo-analytics.md)
