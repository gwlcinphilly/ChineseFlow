# 部署指南

## 🚀 前端部署到 Vercel

### 1. 准备工作

- GitHub 账号
- Vercel 账号（可以用 GitHub 登录）

### 2. GitHub 仓库设置

```bash
# 初始化 git 仓库
git init

# 添加所有文件（data/ 和 settings.json 已被 .gitignore 排除）
git add .
git commit -m "Initial commit"

# 推送到 GitHub
git remote add origin https://github.com/YOUR_USERNAME/chineseflow.git
git push -u origin main
```

### 3. Vercel 部署

1. 登录 [Vercel](https://vercel.com)
2. 点击 "Add New Project"
3. 选择 GitHub 上的 ChineseFlow 仓库
4. 配置：
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. 环境变量：
   ```
   VITE_API_URL=https://your-backend-url.com/api
   ```
   （如果后端还没部署，可以先不设置，使用默认的 localhost）
6. 点击 Deploy

### 4. 后端部署选项

由于前端需要调用后端 API，你需要将后端部署到公网。推荐方案：

#### 方案 A: Render (免费)
1. 创建 [Render](https://render.com) 账号
2. 创建 Web Service
3. 选择 GitHub 仓库
4. 配置：
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python main.py`
5. 环境变量：
   ```
   # 如果使用 PostgreSQL
   DATABASE_URL=postgresql://...
   ```

#### 方案 B: Railway (免费额度)
类似 Render 的设置方式。

#### 方案 C: 本地开发
如果只在本地使用，保持默认 `http://localhost:8000/api` 即可。

---

## 🔒 安全注意事项

### 已配置的安全措施

1. **API Key 和数据库密码** 存储在 `backend/data/settings.json`，已加入 `.gitignore`
2. **环境变量** 使用 `.env` 文件管理（未提交到 git）
3. **CORS** 配置只允许特定域名访问

### 部署前检查清单

- [ ] `.env` 文件已创建且未提交到 git
- [ ] `backend/data/settings.json` 未提交到 git
- [ ] PostgreSQL 数据库使用强密码
- [ ] 生产环境使用 HTTPS

---

## 📁 项目结构

```
Chinese/
├── frontend/           # React + Vite 前端
│   ├── src/
│   ├── dist/          # 构建输出
│   ├── .env.example   # 环境变量示例
│   └── vercel.json    # Vercel 配置
├── backend/           # FastAPI 后端
│   ├── data/          # 数据文件（未提交）
│   ├── main.py
│   └── ...
├── .gitignore         # Git 忽略配置
└── DEPLOY.md          # 本文件
```

---

## 🛠️ 本地开发

```bash
# 启动后端
cd backend
source venv/bin/activate
python main.py

# 启动前端（新终端）
cd frontend
npm run dev
```

访问 http://localhost:5173
