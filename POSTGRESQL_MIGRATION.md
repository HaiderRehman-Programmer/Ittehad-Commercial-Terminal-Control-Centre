/**
 * PostgreSQL Migration Guide
 * Real Estate ERP - SQLite to PostgreSQL
 */

# POSTGRESQL SETUP GUIDE

## Option 1: Local Development Setup (Windows)

### Install PostgreSQL
1. Download from https://www.postgresql.org/download/windows/
2. Install with default settings
3. Remember the password for `postgres` user

### Create Development Database
```
$ psql -U postgres
postgres=# CREATE DATABASE real_estate_erp;
postgres=# \q
```

### Update .env for PostgreSQL
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/real_estate_erp"
```

## Option 2: Cloud Setup (AWS RDS - Recommended for Production)

### Create AWS RDS Instance
```
- DB Engine: PostgreSQL 15+
- Instance: db.t3.small (for testing), db.t4g.medium (production)
- Storage: 20GB (gp3)
- Multi-AZ: Yes (for production)
- Backup retention: 7 days
- Publicly accessible: No (Use bastion/VPN)
```

### Connection String
```env
DATABASE_URL="postgresql://admin:STRONG_PASSWORD@real-estate-erp.xxxxx.us-east-1.rds.amazonaws.com:5432/real_estate_erp"
```

## MIGRATION STEPS (AUTOMATED)

### 1. Update .env
Set your `DATABASE_URL` to your PostgreSQL instance in your `.env` file.

### 2. Synchronize Schema
This will create the tables in your PostgreSQL database.
```bash
npm run db:migrate-pg
```

### 3. Migrate Data
This will move all data from your SQLite `dev.db` to PostgreSQL.
```bash
npm run db:migrate-data
```

### 4. Verify & Cleanup
- Check your PostgreSQL database to ensure all records exist.
- Once verified, you can delete `prisma/dev.db` and `prisma/sqlite.prisma`.

## POSTGRESQL TUNING FOR PRODUCTION

### Connection Pooling (PgBouncer Recommended)
Install PgBouncer or use AWS RDS Proxy:
```ini
[databases]
real_estate_erp = host=localhost port=5432 dbname=real_estate_erp

[pgbouncer]
pool_mode = transaction
max_client_conn = 100
default_pool_size = 25
reserve_pool_size = 5
reserve_pool_timeout = 3
```

### Enable Query Logging
```sql
ALTER SYSTEM SET log_min_duration_statement = 1000;  -- Log queries > 1 second
SELECT pg_reload_conf();
```

### Create Indexes (Critical for Performance)
```sql
-- From schema.prisma - add these after migration
CREATE INDEX idx_user_email ON "User"(email);
CREATE INDEX idx_user_role ON "User"(role);
CREATE INDEX idx_booking_customer_id ON "Booking"(customer_id);
CREATE INDEX idx_booking_property_id ON "Booking"(property_id);
CREATE INDEX idx_booking_status ON "Booking"(status);
CREATE INDEX idx_transaction_customer_id ON "Transaction"(customer_id);
CREATE INDEX idx_transaction_date ON "Transaction"(date);
CREATE INDEX idx_transaction_account_id ON "Transaction"(account_id);
CREATE INDEX idx_customer_cnic ON "Customer"(cnic);
CREATE INDEX idx_property_status ON "Property"(status);
CREATE INDEX idx_token_status ON "Token"(status);

-- Composite indexes for common queries
CREATE INDEX idx_booking_customer_date ON "Booking"(customer_id, date);
CREATE INDEX idx_transaction_date_account ON "Transaction"(date, account_id);
```

### Enable Full-Text Search (Optional - Advanced)
```sql
CREATE INDEX idx_customer_search ON "Customer" 
  USING GIN(to_tsvector('english', name || ' ' || COALESCE(phone, '')));
```

## VALIDATION CHECKLIST

- [ ] PostgreSQL database created and accessible
- [ ] Connection string in .env
- [ ] Prisma migration successful
- [ ] Historic data migrated via seed
- [ ] All indexes created
- [ ] Connection pooling configured
- [ ] Query logging enabled
- [ ] Backups automated (AWS RDS automatic)
- [ ] Performance tested with 1000 records minimum
- [ ] Login/auth tested
- [ ] Reports queries tested
- [ ] Rollback plan documented

## ROLLBACK PLAN (If Issues Occur)

1. Keep SQLite database backup: `cp prisma/dev.db prisma/dev.db.backup`
2. Revert DB connection in .env to SQLite
3. Restore from RDS backup if using AWS

