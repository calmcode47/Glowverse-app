# Incident Response Runbook

## 1. Severity Definitions

| Severity | Definition | Response Time (SLA) | Examples |
|----------|------------|---------------------|----------|
| **SEV-1 (Critical)** | System is down or unusable for >10% of users. Data loss risk. | 15 minutes | Database outage, Login broken, Payment failure. |
| **SEV-2 (High)** | Major feature broken. Workaround available but painful. | 1 hour | Search down, Image upload failing, AR feature lagging. |
| **SEV-3 (Medium)** | Minor feature broken. Low impact. | 4 hours | UI glitch, specific email notification missing. |
| **SEV-4 (Low)** | Cosmetic issue or non-urgent bug. | 24 hours | Typo in email, footer link broken. |

## 2. Escalation Paths

### Primary On-Call
- **Role:** First responder.
- **Action:** Acknowledge alert, triage severity, start investigation.

### Secondary On-Call
- **Role:** Backup if Primary doesn't Ack in 15m.
- **Action:** Assist Primary if SEV-1.

### Engineering Manager
- **Role:** Communication lead for SEV-1.
- **Action:** Update stakeholders, manage external comms.

## 3. Incident Process

### Phase 1: Detection & Triage
1.  **Alert Received**: PagerDuty/Slack alert fires.
2.  **Ack**: On-call engineer acknowledges within 5 mins.
3.  **Triage**: Check dashboards. Is this real? Set Severity.

### Phase 2: Containment (Stop the Bleeding)
1.  **Rollback**: If caused by recent deploy, ROLLBACK IMMEDIATELY.
2.  **Scale**: If load issue, add capacity.
3.  **Rate Limit**: If attack, block IPs or aggressive throttling.
4.  **Feature Flag**: Disable broken feature if possible.

### Phase 3: Resolution
1.  **Investigate**: Deep dive into logs/metrics.
2.  **Fix**: Apply hotfix if rollback didn't work.
3.  **Verify**: Ensure system is stable.

### Phase 4: Post-Mortem
1.  **Review**: Within 24-48 hours.
2.  **Analyze**: Root cause (5 Whys).
3.  **Action Items**: Prevent recurrence.

## 4. Communication Templates

### internal-status Channel
**Title:** [SEV-1] Production Database Unreachable
**Impact:** Users cannot login or checkout.
**Status:** Investigating.
**Lead:** @jane.doe
**Next Update:** 15 mins.

### External Status Page
**Status:** Investigating
**Message:** We are currently experiencing issues with our login service. Our team is investigating. We apologize for the inconvenience.
