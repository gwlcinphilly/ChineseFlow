#!/bin/bash
#
# ChineseFlow Full Stack Deployment Script
# Deploys both backend and frontend to mirror server via SSH
# Usage: ./deploy.sh
#

set -e

# Configuration
REMOTE_HOST="mirror"
REMOTE_USER="alu"
REMOTE_DIR="/q/Docker/chineseflow"
FRONTEND_DIR="frontend"

# Ports
BACKEND_PORT="8090"
FRONTEND_PORT="8082"

# Container names
BACKEND_CONTAINER="chineseflow-api"
FRONTEND_CONTAINER="chineseflow-web"

# Neon PostgreSQL URL
DATABASE_URL="${DATABASE_URL:-postgresql://neondb_owner:npg_itv5qcJlA4TH@ep-purple-fire-airnrw5w-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require}"

echo "=========================================="
echo "ChineseFlow Full Stack Deployment"
echo "=========================================="
echo ""
echo "Remote: ${REMOTE_USER}@${REMOTE_HOST}"
echo "Target: ${REMOTE_DIR}"
echo ""
echo "Backend: http://${REMOTE_HOST}:${BACKEND_PORT}"
echo "Frontend: http://${REMOTE_HOST}:${FRONTEND_PORT}"
echo "Database: Neon PostgreSQL"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check SSH key
check_ssh() {
    log_step "Checking SSH connection..."
    if ! ssh -o ConnectTimeout=5 -o BatchMode=yes ${REMOTE_USER}@${REMOTE_HOST} "echo OK" 2>/dev/null; then
        log_error "SSH connection failed. Please ensure SSH key is added to ssh-agent."
        log_info "Try: eval \$(ssh-agent -s) && ssh-add ~/.ssh/id_rsa"
        exit 1
    fi
    log_info "SSH connection OK"
}

# Prepare remote directory
prepare_remote() {
    log_step "Preparing remote directory..."
    ssh ${REMOTE_USER}@${REMOTE_HOST} "
        mkdir -p ${REMOTE_DIR}/backend 2>/dev/null || sudo mkdir -p ${REMOTE_DIR}/backend
        mkdir -p ${REMOTE_DIR}/frontend/dist 2>/dev/null || sudo mkdir -p ${REMOTE_DIR}/frontend/dist
        sudo chown ${REMOTE_USER}:${REMOTE_USER} ${REMOTE_DIR} 2>/dev/null || true
    "
}

# ==================== BACKEND DEPLOYMENT ====================

# Create backend Dockerfile locally
create_backend_dockerfile() {
    log_step "Creating backend Dockerfile..."
    
    cat > backend/Dockerfile << 'BACKENDDOCKER'
FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
RUN mkdir -p /app/data

ENV PYTHONUNBUFFERED=1
ENV PORT=8000
EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
BACKENDDOCKER
}

# Sync backend files to remote
sync_backend() {
    log_step "Syncing backend files to remote..."
    
    # Create .dockerignore
    cat > backend/.dockerignore << 'EOF'
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
venv/
env/
ENV/
*.egg-info/
dist/
build/
*.log
.git
.gitignore
.env
*.local
.DS_Store
EOF
    
    rsync -avz --delete \
        --exclude='__pycache__' \
        --exclude='venv' \
        --exclude='*.pyc' \
        --exclude='.git' \
        --exclude='data/*.json' \
        --exclude='*.log' \
        backend/ ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/backend/
    
    log_info "Backend files synced successfully"
}

# ==================== FRONTEND DEPLOYMENT ====================

# Build frontend locally
build_frontend() {
    log_step "Building frontend locally..."
    
    if [ ! -d "${FRONTEND_DIR}" ]; then
        log_error "Frontend directory not found: ${FRONTEND_DIR}"
        exit 1
    fi
    
    cd ${FRONTEND_DIR}
    
    if [ ! -d "node_modules" ]; then
        log_info "Installing npm dependencies..."
        npm install
    fi
    
    log_info "Building frontend with production settings..."
    VITE_API_URL="http://${REMOTE_HOST}:${BACKEND_PORT}/api" npm run build
    
    cd ..
    log_info "Frontend build completed"
}

# Create nginx config
create_nginx_config() {
    log_step "Creating nginx configuration..."
    
    cat > ${FRONTEND_DIR}/dist/nginx.conf << 'NGINXCONF'
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml;

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://chineseflow-api:8000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINXCONF
}

# Create frontend Dockerfile locally
create_frontend_dockerfile() {
    log_step "Creating frontend Dockerfile..."
    
    cat > ${FRONTEND_DIR}/Dockerfile << 'FRONTENDDOCKER'
FROM nginx:alpine
COPY dist /usr/share/nginx/html
COPY dist/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
FRONTENDDOCKER
}

# Sync frontend to remote
sync_frontend() {
    log_step "Syncing frontend build to remote..."
    
    rsync -avz --delete \
        ${FRONTEND_DIR}/dist/ ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/frontend/dist/
    
    # Copy Dockerfile
    rsync -avz ${FRONTEND_DIR}/Dockerfile ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/frontend/
    
    log_info "Frontend synced successfully"
}

# ==================== DOCKER COMPOSE ====================

create_docker_compose() {
    log_step "Creating docker-compose.yml..."
    
    ssh ${REMOTE_USER}@${REMOTE_HOST} "cat > ${REMOTE_DIR}/docker-compose.yml << COMPOSE
version: '3.8'

services:
  api:
    build: ./backend
    container_name: ${BACKEND_CONTAINER}
    restart: unless-stopped
    ports:
      - "${BACKEND_PORT}:8000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - CORS_ORIGINS=*
      - PYTHONUNBUFFERED=1
    volumes:
      - ./backend/data:/app/data
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    networks:
      - chineseflow-net

  web:
    build: ./frontend
    container_name: ${FRONTEND_CONTAINER}
    restart: unless-stopped
    ports:
      - "${FRONTEND_PORT}:80"
    depends_on:
      - api
    networks:
      - chineseflow-net

networks:
  chineseflow-net:
    driver: bridge
COMPOSE"
}

# ==================== DEPLOYMENT ====================

deploy() {
    log_step "Building and deploying Docker containers..."
    
    ssh ${REMOTE_USER}@${REMOTE_HOST} "
        cd ${REMOTE_DIR}
        
        echo 'Stopping existing containers...'
        docker-compose down 2>/dev/null || true
        docker stop ${BACKEND_CONTAINER} ${FRONTEND_CONTAINER} 2>/dev/null || true
        docker rm ${BACKEND_CONTAINER} ${FRONTEND_CONTAINER} 2>/dev/null || true
        
        echo 'Building Docker images...'
        docker-compose build --no-cache
        
        echo 'Starting containers...'
        docker-compose up -d
        
        echo 'Waiting for containers to be ready...'
        sleep 10
        
        echo 'Checking container status...'
        docker ps --filter name=chineseflow --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
    "
}

# Show status
show_status() {
    log_step "Deployment status:"
    ssh ${REMOTE_USER}@${REMOTE_HOST} "
        echo ''
        echo '========================================'
        echo 'Container Status'
        echo '========================================'
        docker ps --filter name=chineseflow --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' 2>/dev/null || echo 'No containers running'
        
        echo ''
        echo '========================================'
        echo 'Service URLs'
        echo '========================================'
        echo \"Frontend: http://${REMOTE_HOST}:${FRONTEND_PORT}\"
        echo \"Backend:  http://${REMOTE_HOST}:${BACKEND_PORT}\"
        echo \"API Docs: http://${REMOTE_HOST}:${BACKEND_PORT}/docs\"
        
        echo ''
        echo '========================================'
        echo 'Health Checks'
        echo '========================================'
        echo -n 'Backend: '
        curl -s http://localhost:${BACKEND_PORT}/ 2>/dev/null && echo '' || echo 'FAILED'
        echo -n 'Frontend: '
        curl -s -o /dev/null -w '%{http_code}' http://localhost:${FRONTEND_PORT}/ 2>/dev/null && echo '' || echo 'FAILED'
        echo ''
    "
}

# Cleanup
cleanup() {
    log_warn "Cleaning up old Docker images..."
    ssh ${REMOTE_USER}@${REMOTE_HOST} "
        docker system prune -f --volumes
    "
}

# ==================== MAIN ====================

main() {
    log_step "Starting full stack deployment..."
    
    check_ssh
    prepare_remote
    
    # Backend
    create_backend_dockerfile
    sync_backend
    
    # Frontend
    build_frontend
    create_nginx_config
    create_frontend_dockerfile
    sync_frontend
    
    # Docker
    create_docker_compose
    deploy
    show_status
    
    log_info "=========================================="
    log_info "Full Stack Deployment Complete!"
    log_info "=========================================="
    echo ""
    log_info "Frontend: http://${REMOTE_HOST}:${FRONTEND_PORT}"
    log_info "Backend:  http://${REMOTE_HOST}:${BACKEND_PORT}"
    log_info "API Docs: http://${REMOTE_HOST}:${BACKEND_PORT}/docs"
    echo ""
    log_info "Commands:"
    log_info "  Logs backend:  ssh ${REMOTE_USER}@${REMOTE_HOST} 'docker logs -f ${BACKEND_CONTAINER}'"
    log_info "  Logs frontend: ssh ${REMOTE_USER}@${REMOTE_HOST} 'docker logs -f ${FRONTEND_CONTAINER}'"
    log_info "  Stop all:      ssh ${REMOTE_USER}@${REMOTE_HOST} 'cd ${REMOTE_DIR} && docker-compose down'"
}

# Handle script arguments
case "${1:-}" in
    status)
        show_status
        ;;
    logs)
        ssh ${REMOTE_USER}@${REMOTE_HOST} "docker logs -f ${BACKEND_CONTAINER}"
        ;;
    logs-web)
        ssh ${REMOTE_USER}@${REMOTE_HOST} "docker logs -f ${FRONTEND_CONTAINER}"
        ;;
    stop)
        log_warn "Stopping containers..."
        ssh ${REMOTE_USER}@${REMOTE_HOST} "cd ${REMOTE_DIR} && docker-compose down"
        ;;
    restart)
        log_warn "Restarting containers..."
        ssh ${REMOTE_USER}@${REMOTE_HOST} "cd ${REMOTE_DIR} && docker-compose restart"
        show_status
        ;;
    restart-web)
        log_warn "Restarting frontend..."
        ssh ${REMOTE_USER}@${REMOTE_HOST} "docker restart ${FRONTEND_CONTAINER}"
        ;;
    cleanup)
        cleanup
        ;;
    frontend-only)
        log_step "Deploying frontend only..."
        check_ssh
        prepare_remote
        build_frontend
        create_nginx_config
        create_frontend_dockerfile
        sync_frontend
        ssh ${REMOTE_USER}@${REMOTE_HOST} "cd ${REMOTE_DIR} && docker-compose build web && docker-compose up -d web"
        log_info "Frontend redeployed!"
        ;;
    *)
        main
        ;;
esac
