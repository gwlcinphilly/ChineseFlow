# Mirror Server Deployment Guide

Deploy ChineseFlow backend to mirror server using Docker.

## 🚀 Quick Deploy

```bash
# Deploy to mirror
./deploy.sh

# Check status
./deploy.sh status

# View logs
./deploy.sh logs

# Restart
./deploy.sh restart
```

## 📋 Configuration

| Setting | Value |
|---------|-------|
| Server | `mirror` |
| User | `alu` |
| Port | `8090` |
| Directory | `/q/Docker/chineseflow` |
| Container | `chineseflow-api` |
| Database | Neon PostgreSQL |

## 🔗 Database

Using Neon PostgreSQL (already configured):
```
postgresql://neondb_owner:npg_itv5qcJlA4TH@ep-purple-fire-airnrw5w-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

## 🌐 API Endpoints

After deployment:
- Health: `http://mirror:8090/`
- API: `http://mirror:8090/api/characters`
- Docs: `http://mirror:8090/docs`

## 🐳 Docker Commands

```bash
# SSH to mirror and manage container
ssh alu@mirror

# View logs
docker logs -f chineseflow-api

# Restart
docker restart chineseflow-api

# Stop
docker stop chineseflow-api

# Enter container
docker exec -it chineseflow-api bash
```

## 🔄 Update Frontend API URL

Update frontend to use mirror backend:

```bash
# In frontend/.env.production
VITE_API_URL=http://mirror:8090/api
```

Then redeploy frontend to Vercel.

## 📝 Deployment Process

1. **Sync Files** - Copy backend code to `/q/Docker/chineseflow`
2. **Build Image** - Create Docker image with Python 3.11
3. **Start Container** - Run on port 8090
4. **Health Check** - Verify API is responding

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
sudo lsof -i :8090
sudo kill -9 <PID>
```

## 🎯 Next Steps

1. ✅ Run `./deploy.sh` to deploy backend
2. ✅ Update frontend `VITE_API_URL` to `http://mirror:8090/api`
3. ✅ Redeploy frontend to Vercel
4. ✅ Test end-to-end
