# Database Configuration

ChineseFlow uses **Neon PostgreSQL** as the primary database for all environments.

## Database URL

All environments (local, mirror, production) use the same Neon PostgreSQL database:

```
postgresql://neondb_owner:npg_itv5qcJlA4TH@ep-purple-fire-airnrw5w-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

## Environments

### 1. Local Development

**Using start script:**
```bash
./start-backend.sh
```
The script automatically sets `DATABASE_URL` environment variable.

**Using Docker:**
```bash
docker-compose up
```

**Manual:**
```bash
cd backend
export DATABASE_URL="postgresql://neondb_owner:npg_itv5qcJlA4TH@ep-purple-fire-airnrw5w-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
python main.py
```

### 2. Mirror Server (Production)

Deployed automatically via `./deploy.sh`:
```bash
./deploy.sh
```

The deployment script configures `DATABASE_URL` in docker-compose.yml.

**Services:**
- Frontend: http://mirror:8082
- Backend: http://mirror:8090

### 3. Render (Cloud)

Set environment variable in Render Dashboard:
```
DATABASE_URL=postgresql://neondb_owner:npg_itv5qcJlA4TH@ep-purple-fire-airnrw5w-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

## Legacy SQLite Support

The codebase still contains SQLite fallback code for emergency use only. To use SQLite:

1. Modify `db_manager.py`:
```python
def get_db_type() -> str:
    return 'sqlite'  # Force SQLite
```

2. Or set environment variable:
```bash
unset DATABASE_URL  # Remove PostgreSQL URL
```

**Note:** SQLite is not recommended as it doesn't support concurrent access well.

## Database Schema

### Tables

- **characters** - Character learning data
- **words** - Word definitions and translations  
- **users** - User accounts
- **character_progress** - Learning progress tracking
- **character_schedule** - Learning schedule
- **user_character_progress** - Per-user progress

### Migration from SQLite

If you have data in local SQLite that needs to be migrated to Neon:

```bash
cd backend
python migrate_to_postgres.py --force
```

This will copy all data from SQLite to Neon PostgreSQL.

## Troubleshooting

### Connection Failed

1. Check if `DATABASE_URL` is set:
```bash
echo $DATABASE_URL
```

2. Verify Neon database is active:
- Login to https://neon.tech
- Check project status

3. Check SSL settings:
The URL must include `sslmode=require`

### Data Not Syncing

All environments share the same database, so data is automatically synced. If you don't see data:

1. Check which database is being used:
```bash
ssh alu@mirror "docker logs chineseflow-api | grep -i database"
```

2. Should show: `Database initialized (postgresql)`

3. If it shows `Database initialized (sqlite)`, redeploy:
```bash
./deploy.sh
```
