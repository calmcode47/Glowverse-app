# On-Call Procedures

## 1. Schedule & Responsibilities
- **Rotation:** Weekly rotation, starting Monday 12:00 PM UTC.
- **Primary:** Responsible for all SEV-1/SEV-2 alerts.
- **Secondary:** Backup for Primary.
- **Tools:** PagerDuty (Scheduling), Slack (Comms), Jira (Tracking).

## 2. Shift Handoff
**When:** Monday 12:00 PM UTC.
**Checklist:**
1.  **Review Incidents:** Discuss any SEV-1/SEV-2 from the past week.
2.  **Review Alerts:** Discuss "noisy" alerts that need tuning.
3.  **Access Check:** Verify access to production (Bastion, secrets).
4.  **Confirm:** Post in `#engineering-oncall`: "Handing off to @incoming-engineer. All quiet/Active issues...".

## 3. During Shift
- **Notification Settings:** Override Do Not Disturb for PagerDuty.
- **Response Time (SLA):**
    - SEV-1: 15 mins (Ack), 30 mins (Action).
    - SEV-2: 60 mins (Action).
- **Communication:** Post updates in incident channels every 30-60 mins during SEV-1.

## 4. Escalation Policy
If you cannot resolve an issue within 60 minutes or need domain expertise:
1.  **Check Service Owners:** Look up `service.yaml` or asking in `#dev-backend`.
2.  **Page EM:** If SEV-1 affects business continuity (payments, logic), page Engineer Manager.
3.  **Vendor Support:** For AWS/Perfect Corp outages, open support tickets immediately.

## 5. Post-Incident
- Create Post-Mortem doc for any SEV-1.
- creating Jira tickets for follow-up actions (Preventative).
