# Monitoring Alert Playbooks

## 1. Metric: CPU Usage (Container)

- **Alert Name:** `HighCPUUsage`
- **Threshold:** > 80% for 5 minutes.
- **Severity:** SEV-3 (Warning), SEV-2 if > 95%.
- **Runbook:**
    1.  Check `docker stats`.
    2.  Is it a specific process? (Node vs System).
    3.  If Node, take heap snap/profile if setup allows.
    4.  Action: Scale up CPU limit or add replicas.

## 2. Metric: Memory Usage

- **Alert Name:** `HighMemoryUsage`
- **Threshold:** > 85% for 5 minutes.
- **Severity:** SEV-2 (Critical - Risk of OOM Kill).
- **Runbook:**
    1.  Check if usage is growing linearly (Leak).
    2.  Action: Restart container to clear memory (Temporary).
    3.  Action: Investigate code for leaks (Permanent).

## 3. Metric: API Latency (p95)

- **Alert Name:** `HighApiLatency`
- **Threshold:** > 500ms for 5 minutes.
- **Severity:** SEV-3.
- **Runbook:**
    1.  Check Database performance (Slow queries).
    2.  Check External API (Perfect Corp) latency.
    3.  Action: Check logs for timeouts.

## 4. Metric: Error Rate (5xx)

- **Alert Name:** `HighErrorRate`
- **Threshold:** > 1% of requests.
- **Severity:** SEV-1 (if > 5%).
- **Runbook:**
    1.  See [Troubleshooting Runbook - High Error Rate](TROUBLESHOOTING.md#1-high-error-rate-http-5xx).

## 5. Metric: Database Connections

- **Alert Name:** `DbConnectionSpike`
- **Threshold:** > 80% of pool size.
- **Severity:** SEV-2.
- **Runbook:**
    1.  See [Troubleshooting Runbook - Database Connection Exhaustion](TROUBLESHOOTING.md#3-database-connection-exhaustion).
