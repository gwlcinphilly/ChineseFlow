#!/bin/bash
#
# ChineseFlow Backend Deployment Script
# Deploys to mirror server via SSH
# Usage: ./deploy.sh
#

set -e

# Configuration
REMOTE_HOST="mirror"
REMOTE_USER="alu"
REMOTE_DIR="/q/Docker/chineseflow"
CONTAINER_NAME="chineseflow-api"
PORT="8090"

# Neon PostgreSQL URL (from environment or settings)
# Format: postgresql://user:password@host:port/dbname
DATABASE_URL="${DATABASE_URL:-postgresql://neondb_owner:npg_itv5qcJlA4TH@ep-purple-fire-airnrw5w-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require}"

echo "=========================================="
echo "ChineseFlow Backend Deployment"
echo "=========================================="
echo ""
echo "Remote: ${REMOTE_USER}@${REMOTE_HOST}"
echo "Target: ${REMOTE_DIR}"
echo "Port: ${PORT}"
echo "Database: Neon PostgreSQL"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check SSH key
check_ssh() {
    log_info "Checking SSH connection..."
    if ! ssh -o ConnectTimeout=5 -o BatchMode=yes ${REMOTE_USER}@${REMOTE_HOST} "echo OK" 2>/dev/null; then
        log_error "SSH connection failed. Please ensure SSH key is added to ssh-agent."
        log_info "Try: eval \$(ssh-agent -s) && ssh-add ~/.ssh/id_rsa"
        exit 1
    fi
    log_info "SSH connection OK"
}

# Prepare remote directory
prepare_remote() {
    log_info "Preparing remote directory..."
    ssh ${REMOTE_USER}@${REMOTE_HOST} "
        # Try without sudo first, fallback to sudo only if needed
        mkdir -p ${REMOTE_DIR} 2>/dev/null || sudo mkdir -p ${REMOTE_DIR}
        # Ensure ownership
        if [[ \$(stat -c '%U' ${REMOTE_DIR} 2>/dev/null) != '${REMOTE_USER}' ]]; then
            sudo chown ${REMOTE_USER}:${REMOTE_USER} ${REMOTE_DIR} 2>/dev/null || true
        fi
    "
}

# Sync files to remote
sync_files() {
    log_info "Syncing files to remote..."
    
    # Create temp directory with necessary files
    LOCAL_TEMP=$(mktemp -d)
    
    # Copy backend files
    cp -r backend/* ${LOCAL_TEMP}/
    
    # Create .dockerignore
    cat > ${LOCAL_TEMP}/.dockerignore << 'EOF'
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
    
    # Sync to remote
    rsync -avz --delete \
        --exclude='__pycache__' \
        --exclude='venv' \
        --exclude='*.pyc' \
        --exclude='.git' \
        --exclude='data/*.json' \
        --exclude='*.log' \
        ${LOCAL_TEMP}/ ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/
    
    # Cleanup
    rm -rf ${LOCAL_TEMP}
    
    log_info "Files synced successfully"
}

# Create Dockerfile on remote
create_dockerfile() {
    log_info "Creating Dockerfile..."
    
    ssh ${REMOTE_USER}@${REMOTE_HOST} "cat > ${REMOTE_DIR}/Dockerfile << 'DOCKERFILE'
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create data directory
RUN mkdir -p /app/data

# Environment variables
ENV PYTHONUNBUFFERED=1
ENV PORT=8000

# Expose port
EXPOSE 8000

# Run the application
CMD [\"uvicorn\", \"main:app\", \"--host\", \"0.0.0.0\", \"--port\", \"8000\"]
DOCKERFILE"
}

# Create docker-compose.yml
create_compose() {
    log_info "Creating docker-compose.yml..."
    
    ssh ${REMOTE_USER}@${REMOTE_HOST} "cat > ${REMOTE_DIR}/docker-compose.yml << COMPOSE
version: '3.8'

services:
  api:
    build: .
    container_name: ${CONTAINER_NAME}
    restart: unless-stopped
    ports:
      - "${PORT}:8000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - CORS_ORIGINS=*
      - PYTHONUNBUFFERED=1
    volumes:
      - ./data:/app/data
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Optional: Add nginx reverse proxy
  nginx:
    image: nginx:alpine
    container_name: chineseflow-nginx
    restart: unless-stopped
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      - api
    profiles:
      - with-nginx
COMPOSE"
}

# Create nginx config (optional)
create_nginx() {
    log_info "Creating nginx configuration..."
    
    ssh ${REMOTE_USER}@${REMOTE_HOST} "cat > ${REMOTE_DIR}/nginx.conf << 'NGINX'
server {
    listen 80;
    server_name localhost;

    location / {
        proxy_pass http://api:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
NGINX"
}

# Build and deploy
deploy() {
    log_info "Building and deploying Docker container..."
    
    ssh ${REMOTE_USER}@${REMOTE_HOST} "
        cd ${REMOTE_DIR}
        
        # Stop and remove existing container
        echo 'Stopping existing container...'
        docker-compose down 2>/dev/null || true
        docker stop ${CONTAINER_NAME} 2>/dev/null || true
        docker rm ${CONTAINER_NAME} 2>/dev/null || true
        
        # Build and start new container
        echo 'Building Docker image...'
        docker-compose build --no-cache
        
        echo 'Starting container...'
        docker-compose up -d
        
        # Wait for container to be ready
        echo 'Waiting for container to be ready...'
        sleep 5
        
        # Check health
        if docker ps | grep -q ${CONTAINER_NAME}; then
            echo 'Container is running!'
        else
            echo 'ERROR: Container failed to start'
            docker logs ${CONTAINER_NAME}
            exit 1
        fi
    "
}

# Show status
show_status() {
    log_info "Deployment status:"
    ssh ${REMOTE_USER}@${REMOTE_HOST} "
        echo '--- Container Status ---'
        docker ps --filter name=${CONTAINER_NAME} --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
        echo ''
        echo '--- Health Check ---'
        curl -s http://localhost:${PORT}/ || echo 'Health check failed'
        echo ''
        echo '--- Logs (last 20 lines) ---'
        docker logs --tail 20 ${CONTAINER_NAME} 2>&1 || echo 'No logs available'
    "
}

# Cleanup old images
cleanup() {
    log_warn "Cleaning up old Docker images..."
    ssh ${REMOTE_USER}@${REMOTE_HOST} "
        docker system prune -f --volumes
    "
}

# Main deployment flow
main() {
    check_ssh
    prepare_remote
    sync_files
    create_dockerfile
    create_compose
    create_nginx
    deploy
    show_status
    
    log_info "=========================================="
    log_info "Deployment completed successfully!"
    log_info "=========================================="
    echo ""
    log_info "API URL: http://${REMOTE_HOST}:${PORT}"
    log_info "Health Check: http://${REMOTE_HOST}:${PORT}/"
    log_info ""
    log_info "To view logs: ssh ${REMOTE_USER}@${REMOTE_HOST} 'docker logs -f ${CONTAINER_NAME}'"
    log_info "To restart: ssh ${REMOTE_USER}@${REMOTE_HOST} 'docker restart ${CONTAINER_NAME}'"
}

# Handle script arguments
case "${1:-}" in
    status)
        show_status
        ;;
    logs)
        ssh ${REMOTE_USER}@${REMOTE_HOST} "docker logs -f ${CONTAINER_NAME}"
        ;;
    stop)
        log_warn "Stopping container..."
        ssh ${REMOTE_USER}@${REMOTE_HOST} "docker stop ${CONTAINER_NAME}"
        ;;
    restart)
        log_warn "Restarting container..."
        ssh ${REMOTE_USER}@${REMOTE_HOST} "docker restart ${CONTAINER_NAME}"
        show_status
        ;;
    cleanup)
        cleanup
        ;;
    *)
        main
        ;;
esac
