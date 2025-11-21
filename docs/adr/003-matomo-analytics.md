# ADR-003: Self-Hosted Matomo for Analytics

## Status
Accepted

## Context
The Digital Sobriety Hub application needs analytics to understand user behavior, improve UX, and measure the effectiveness of the digital sobriety assessment tool. However, traditional analytics solutions like Google Analytics raise privacy concerns that contradict the project's digital sobriety and ethical responsibility principles.

## Decision
We will use **Matomo** (formerly Piwik), a self-hosted, open-source analytics platform, deployed in Docker containers alongside the application.

## Rationale

### Why Analytics Are Needed
- **User Insights**: Understand how users interact with the assessment tool
- **Improvement**: Identify friction points in the UX
- **Metrics**: Track assessment completion rates, popular sections
- **Performance**: Monitor which pages/features are most used

### Why Matomo
1. **Privacy-First**
   - GDPR and CCPA compliant out of the box
   - IP anonymization built-in
   - Respects Do Not Track (DNT) headers
   - Data stays on our servers (no third-party data sharing)

2. **Digital Sobriety Alignment**
   - Self-hosted = control over data and infrastructure
   - No external tracking pixels/scripts
   - Ethical, transparent analytics
   - Can be configured for cookie-less tracking

3. **Open Source**
   - Full transparency of code
   - Active community
   - No vendor lock-in
   - Free (cost-effective for digital sobriety)

4. **Features**
   - Real-time analytics
   - Event tracking
   - Custom dimensions
   - Goal tracking
   - API for programmatic access

### Why Not Alternatives

**Google Analytics**
- ❌ Third-party data sharing
- ❌ Privacy concerns
- ❌ Not aligned with digital sobriety principles
- ❌ Requires cookies

**Plausible/Umami**
- ✅ Privacy-focused
- ⚠️ Less feature-rich than Matomo
- ⚠️ Relatively new (Matomo is mature)

**No Analytics**
- ❌ Miss critical user insights
- ❌ Unable to measure impact
- ❌ Harder to improve UX

## Implementation

### Docker Setup
- **matomo**: Matomo server (port 8080)
- **matomo-db**: MariaDB database for Matomo data
- Persistent volumes for data retention
- Isolated network for security

### Frontend Integration
- `@datapunt/matomo-tracker-react` package
- Cookie-less tracking enabled
- DNT header respect enabled
- Automatic page view tracking
- Custom event tracking for assessments

### Privacy Configuration
1. IP anonymization (2 bytes)
2. Respect Do Not Track headers
3. Cookie-less mode
4. No cross-domain tracking
5. Data retention: 13 months (configurable)

## Consequences

### Positive
- ✅ Privacy-respecting analytics
- ✅ Full data ownership
- ✅ GDPR/CCPA compliant
- ✅ Aligns with digital sobriety ethics
- ✅ No third-party dependencies for analytics
- ✅ Transparent to users

### Negative
- ⚠️ Additional infrastructure to maintain
- ⚠️ Requires Docker/server resources
- ⚠️ No built-in A/B testing (need plugins)
- ⚠️ Learning curve for Matomo UI

### Neutral
- Manual setup required (one-time)
- Need to configure privacy settings explicitly
- Requires regular updates for security

## Monitoring & Maintenance
- Regular Matomo updates via Docker image updates
- Database backups (matomo-db volume)
- Monitor disk usage (analytics data grows over time)
- Review and purge old data per retention policy

## References
- [Matomo Official Site](https://matomo.org/)
- [Matomo Docker](https://github.com/matomo-org/docker)
- [GDPR Compliance](https://matomo.org/gdpr/)
- [Privacy Features](https://matomo.org/privacy/)

## Date
2025-11-21
