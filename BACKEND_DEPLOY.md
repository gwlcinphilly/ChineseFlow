# 后端部署指南

## 🛠️ 技术栈

- **框架**: FastAPI (Python)
- **服务器**: Uvicorn
- **数据库**: SQLite (本地) / PostgreSQL (生产)
- **依赖**: pypinyin, jieba

---

## 🚀 部署方案对比

| 方案 | 价格 | 难度 | 推荐度 | 说明 |
|------|------|------|--------|------|
| **Render** | 免费/付费 | ⭐⭐ | ⭐⭐⭐⭐⭐ | 最推荐，免费额度够用 |
| **Railway** | 免费/付费 | ⭐⭐ | ⭐⭐⭐⭐ | 简单易用 |
| **PythonAnywhere** | 免费/付费 | ⭐⭐ | ⭐⭐⭐ | 适合初学者 |
| **阿里云/腾讯云** | 付费 | ⭐⭐⭐ | ⭐⭐⭐ | 国内访问快 |
| **Vercel** | 付费 | ⭐⭐ | ⭐⭐ | Serverless，需适配 |

---

## 方案 1: Render (⭐ 最推荐)

### 优点
- ✅ 免费额度：Web Service 永不下线（每月 750 小时）
- ✅ 自动 HTTPS
- ✅ 自动部署（Git push 触发）
- ✅ PostgreSQL 数据库免费

### 步骤

#### 1. 准备文件

创建 `render.yaml`:
```yaml
services:
  - type: web
    name: chineseflow-api
    runtime: python
    buildCommand: "pip install -r requirements.txt"
    startCommand: "uvicorn main:app --host 0.0.0.0 --port $PORT"
    envVars:
      - key: PYTHON_VERSION
        value: 3.11.0
      - key: DATABASE_URL
        fromDatabase:
          name: chineseflow-db
          property: connectionString

databases:
  - name: chineseflow-db
    databaseName: chineseflow
    user: chineseflow
```

更新 `requirements.txt`:
```
fastapi==0.109.0
uvicorn[standard]==0.27.0
pypinyin==0.50.0
jieba==0.42.1
python-multipart==0.0.6
psycopg2-binary==2.9.9
```

#### 2. 修改 CORS

更新 `main.py` 中的 CORS 配置:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://your-frontend.vercel.app",  # Vercel 前端
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### 3. 环境变量配置

在 Render Dashboard 设置环境变量:
```
DATABASE_URL=postgresql://...
```

#### 4. 部署

1. 推送代码到 GitHub
2. 登录 https://dashboard.render.com
3. 点击 "New Web Service"
4. 选择 GitHub 仓库
5. Render 自动识别 `render.yaml` 配置
6. 点击 Deploy

**URL 示例**: `https://chineseflow-api.onrender.com`

---

## 方案 2: Railway

### 步骤

1. 登录 https://railway.app
2. 点击 "New Project" → "Deploy from GitHub repo"
3. 选择仓库
4. 添加 PostgreSQL 数据库 (New → Database → Add PostgreSQL)
5. 环境变量自动注入

### 配置

创建 `Procfile`:
```
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

创建 `runtime.txt`:
```
python-3.11.0
```

---

## 方案 3: PythonAnywhere (最简单)

### 步骤

1. 注册 https://www.pythonanywhere.com (免费账户)
2. 上传代码或使用 Git
3. 创建 Web App:
   - Framework: FastAPI
   - Python: 3.11
   - Working directory: `/home/username/chineseflow/backend`
   - WSGI: 修改 `app` 为 `from main import app`
4. 安装依赖:
   ```bash
   pip3.11 install -r requirements.txt
   ```
5. 重启应用

### 限制
- 免费版有 CPU/内存限制
- 每天需要手动点击保持活跃

---

## 方案 4: 国内云 (阿里云/腾讯云)

### 推荐配置

**轻量应用服务器** (¥60-100/年):
- 2核 2GB 内存
- Ubuntu 22.04

### 部署步骤

```bash
# 1. 登录服务器
ssh root@your-server-ip

# 2. 安装依赖
apt update
apt install python3-pip python3-venv postgresql nginx -y

# 3. 克隆代码
git clone https://github.com/YOUR_USERNAME/ChineseFlow.git
cd ChineseFlow/backend

# 4. 创建虚拟环境
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 5. 配置 PostgreSQL
sudo -u postgres psql -c "CREATE DATABASE chineseflow;"
sudo -u postgres psql -c "CREATE USER chineseflow WITH PASSWORD 'your-password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE chineseflow TO chineseflow;"

# 6. 创建 systemd 服务
sudo tee /etc/systemd/system/chineseflow.service << 'EOF'
[Unit]
Description=ChineseFlow API
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/ChineseFlow/backend
Environment="DATABASE_URL=postgresql://chineseflow:your-password@localhost/chineseflow"
Environment="PORT=8000"
ExecStart=/root/ChineseFlow/backend/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable chineseflow
sudo systemctl start chineseflow

# 7. 配置 Nginx 反向代理
sudo tee /etc/nginx/sites-available/chineseflow << 'EOF'
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/chineseflow /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🔧 环境变量配置

后端需要的环境变量:

```bash
# 数据库 (PostgreSQL 推荐)
DATABASE_URL=postgresql://user:password@host:port/dbname

# 或者保持默认 SQLite (仅开发使用)
# 不需要设置，自动使用 SQLite

# 端口号 (Render/Railway 会自动设置 PORT)
PORT=8000
```

---

## 📊 推荐方案总结

| 场景 | 推荐方案 | 预估费用 |
|------|----------|----------|
| 个人使用/测试 | Render 免费版 | ¥0 |
| 小团队/轻量使用 | Railway 免费版 | ¥0 |
| 国内用户访问 | 阿里云轻量 | ¥60-100/年 |
| 长期稳定运行 | Render 付费版 | $7/月 |

---

## ✅ 部署前检查清单

- [ ] 更新 `requirements.txt` 添加 `psycopg2-binary`
- [ ] 修改 CORS 允许生产域名
- [ ] 确认 `.gitignore` 排除了敏感文件
- [ ] 准备环境变量配置
- [ ] 测试本地构建: `pip install -r requirements.txt && uvicorn main:app`

---

## 🌐 前端连接后端

部署后，更新前端环境变量:

```bash
# 在 Vercel 设置环境变量
VITE_API_URL=https://your-backend.onrender.com/api
```

或者在 `.env.production` 文件:
```
VITE_API_URL=https://your-backend.onrender.com/api
```
