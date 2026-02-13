# Operational Procedures

## 1. Deployment Procedure

**Prerequisites:**
- CI/CD pipeline passed (Green).
- Docker image tagged and pushed to registry.

**Steps:**
1.  **Notify:** Post in `#engineering-status`: "Starting deployment of v1.2.3".
2.  **Pull:** `docker-compose -f docker-compose.production.yml pull`
3.  **Migrate:** `docker-compose -f docker-compose.production.yml run --rm backend npx prisma migrate deploy`
4.  **Deploy:** `docker-compose -f docker-compose.production.yml up -d`
5.  **Verify:** Check `/health` endpoint.
6.  **Cleanup:** `docker system prune -f`

---

## 2. Rollback Procedure

**Triggers:**
- SEV-1 incident immediately after deploy.
- Crash loop in new container.

**Steps:**
1.  **Revert Image:** Update `.env.production` to previous tag OR use `docker-compose` override.
2.  **Deploy:** `docker-compose -f docker-compose.production.yml up -d`
3.  **Verify:** Ensure system stabilizes.
4.  **Database:** If migration broke backward compatibility, restore DB backup (See Section 5).

---

## 3. Database Migration

**Routine:**
- Migrations run automatically during deployment via CI/CD.

**Manual Migration (Emergency):**
1.  **Backup:** Run `scripts/backup-database.sh`.
2.  **Run:** `npx prisma migrate deploy` inside container.

---

## 4. Scaling Procedure

**Vertical Scaling (More Resources):**
1.  Edit `docker-compose.production.yml`.
2.  Increase `deploy.resources.limits`.
3.  Restart service: `docker-compose up -d`.

**Horizontal Scaling (More Replicas):**
1.  Run: `docker-compose -f docker-compose.production.yml up -d --scale backend=3`
2.  Ensure Load Balancer (Nginx/AWS ALB) is configured to round-robin.

---

## 5. Backup Restoration

**Scenario:** Data corruption or accidental deletion.

**Steps:**
1.  **Stop App:** `docker-compose stop backend`
2.  **Locate Backup:** Find latest `.sql.gz` in `backups/` or S3.
3.  **Drop DB:** `dropdb -U user perfectcorp_db`
4.  **Create DB:** `createdb -U user perfectcorp_db`
5.  **Restore:** `gunzip -c backup.sql.gz | psql -U user -d perfectcorp_db`
6.  **Start App:** `docker-compose start backend`

---

## 6. Cache Invalidation

**Scenario:** Stale data stuck in Redis.

**Steps:**
1.  **Connect:** `docker exec -it perfectcorp_redis_prod redis-cli`
2.  **Flush All (Dangerous):** `FLUSHALL`
3.  **Flush Specific Key:** `DEL "key:name"`
