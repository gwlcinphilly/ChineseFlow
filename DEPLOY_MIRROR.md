# Mirror Server Deployment Guide

Deploy ChineseFlow full stack (backend + frontend) to mirror server using Docker.

## 🚀 Quick Deploy

```bash
# Deploy full stack (backend + frontend)
./deploy.sh

# Check status
./deploy.sh status

# View backend logs
./deploy.sh logs

# View frontend logs
./deploy.sh logs-web

# Restart all
./deploy.sh restart

# Deploy frontend only (faster)
./deploy.sh frontend-only
```

## 📋 Configuration

| Service | Value |
|---------|-------|
| Server | `mirror` |
| User | `alu` |
| **Backend** | `http://mirror:8090` |
| **Frontend** | `http://mirror:8082` |
| Directory | `/q/Docker/chineseflow` |
| Backend Container | `chineseflow-api` |
| Frontend Container | `chineseflow-web` |
| Database | Neon PostgreSQL |

## 🌐 Service URLs

After deployment:
- **Frontend**: http://mirror:8082
- **Backend API**: http://mirror:8090
- **API Docs**: http://mirror:8090/docs

## 🔗 Database

**All environments use Neon PostgreSQL** (local, mirror, production):
- Single shared database for data consistency
- No local SQLite fallback
- Connection URL configured automatically

```
postgresql://neondb_owner:npg_itv5qcJlA4TH@ep-purple-fire-airnrw5w-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

See `DATABASE.md` for more details.

## 🐳 Docker Commands

```bash
# SSH to mirror
ssh alu@mirror

# View all containers
docker ps | grep chineseflow

# View backend logs
docker logs -f chineseflow-api

# View frontend logs
docker logs -f chineseflow-web

# Restart backend
docker restart chineseflow-api

# Restart frontend
docker restart chineseflow-web

# Stop all
cd /q/Docker/chineseflow && docker-compose down

# View all logs
cd /q/Docker/chineseflow && docker-compose logs -f
```

## 📁 Deployment Structure

```
/q/Docker/chineseflow/
├── backend/
│   ├── Dockerfile
│   ├── *.py
│   └── data/
├── frontend/
│   ├── Dockerfile
│   └── dist/
└── docker-compose.yml
```

## 📝 Deployment Process

1. **Backend**
   - Sync Python files to `/q/Docker/chineseflow/backend`
   - Build Docker image with Python 3.11
   - Start container on port 8090

2. **Frontend**
   - Build locally with `npm run build`
   - Sync dist files to `/q/Docker/chineseflow/frontend`
   - Build Docker image with Nginx
   - Start container on port 8082

3. **Nginx Proxy**
   - Frontend serves static files
   - API requests (`/api/*`) proxied to backend
   - Handles client-side routing

## 🛠️ Troubleshooting

### Container won't start
```bash
ssh alu@mirror
cd /q/Docker/chineseflow
docker-compose logs
```

### Database connection failed
- Check Neon database is active
- Verify DATABASE_URL in docker-compose.yml

### Port already in use
```bash
ssh alu@mirror
sudo lsof -i :8090  # backend
sudo lsof -i :8082  # frontend
sudo kill -9 <PID>
```

### Frontend 404 errors
```bash
# Rebuild and redeploy frontend only
./deploy.sh frontend-only
```

## ✅ Deployment Status

Run `./deploy.sh status` to see:
- Container status
- Service URLs
- Health check results
- Recent logs
