# Troubleshooting Runbooks

## 1. High Error Rate (HTTP 5xx)

**Symptoms:**
- Alert: `High Error Rate > 5%`
- Users see "Something went wrong"

**Diagnostic Steps:**
1.  **Check Logs:** `docker-compose logs --tail=100 backend`
2.  **Filter Errors:** Look for `FATAL`, `EXCEPTION`, or `Uncaught`.
3.  **Check Database:** Is Postgres accepting connections?
4.  **Check Dependencies:** Is Redis up? Is Perfect Corp API failing?

**Common Causes:**
- Bad deployment (syntax error).
- Database credentials expired/changed.
- External API down (Perfect Corp).

**Resolution:**
- **Bad Deploy:** Revert to previous docker tag.
- **External API:** Enable "Circuit Breaker" feature flag to disable AR try-on.

---

## 2. Slow Response Times (Latency)

**Symptoms:**
- Alert: `P95 Latency > 1000ms`
- App feels sluggish.

**Diagnostic Steps:**
1.  **Identify Bottleneck:** Check New Relic / APM. Is it App, DB, or External?
2.  **Check DB Logs:** Look for `[Slow Query]` warnings in logs.
3.  **Check Resources:** `docker stats`. Is CPU/RAM maxed out?

**Common Causes:**
- Missing database index.
- N+1 query in loop.
- Redis cache miss storm.

**Resolution:**
- **DB Index:** Add missing index (see specific runbook).
- **Restart:** Memory leak might cause GC thrashing. Restart container.

---

## 3. Database Connection Exhaustion

**Symptoms:**
- Logs show `TimeoutError: Timed out fetching a new connection from the connection pool`.
- API returns 500s.

**Diagnostic Steps:**
1.  **Check Active Connections:** Run query `SELECT count(*) FROM pg_stat_activity`.
2.  **Check Pool Config:** Is `connection_limit` defined in `docker-compose`?

**Common Causes:**
- Traffic spike exceeds max connections.
- Connections not releasing (zombie transactions).

**Resolution:**
- **Short Term:** Restart backend service to kill hanging connections.
- **Long Term:** Increase `connection_limit` or implement PgBouncer.

---

## 4. Memory Usage High (Potential Leak)

**Symptoms:**
- Alert: `Memory Usage > 90%`
- Container restarts periodically (OOM Killed).

**Diagnostic Steps:**
1.  **Check Metrics:** Is memory usage linear? (Leak) or spiky? (Load).
2.  **Inspect Heap:** If Node.js, take a snapshot (expert only).

**Resolution:**
- **Immediate:** Restart container.
- **Investigation:** Check recent code changes for global variables or uncleared timers.
