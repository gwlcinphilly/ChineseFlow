# 部署指南

## 🚀 完整部署流程

### 1. GitHub + Vercel (前端) + Render (后端)

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Vercel    │────▶│   Render    │────▶│  PostgreSQL │
│  (前端)     │     │  (后端API)   │     │  (数据库)   │
└─────────────┘     └─────────────┘     └─────────────┘
     │                                            
     ▼                                            
GitHub Repo (代码仓库)                            
```

---

## 📦 第一步：GitHub 仓库

✅ **已完成** - 代码已推送到:
https://github.com/gwlcinphilly/ChineseFlow

---

## 🎨 第二步：Vercel 部署前端

### 方式 A: Web 界面 (推荐)

1. 访问 https://vercel.com/new
2. 使用 GitHub 登录
3. 导入 `gwlcinphilly/ChineseFlow` 仓库
4. 配置:
   - **Framework**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output**: `dist`
5. 环境变量:
   ```
   VITE_API_URL=https://chineseflow-api.onrender.com/api
   ```
   (先用这个，等后端部署好再更新)
6. 点击 Deploy

### 方式 B: Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
cd /Users/qianglu/Code/git/Chinese/frontend
vercel --prod
```

---

## 🛠️ 第三步：Render 部署后端

### 方式 A: Blueprint (推荐)

1. 访问 https://dashboard.render.com/blueprints
2. 点击 "New Blueprint Instance"
3. 选择 `gwlcinphilly/ChineseFlow` 仓库
4. Render 自动读取 `render.yaml` 配置
5. 点击 "Apply"
6. 等待部署完成 (约 2-3 分钟)

### 方式 B: 手动创建

1. 访问 https://dashboard.render.com
2. 点击 "New +" → "Web Service"
3. 选择 GitHub 仓库
4. 配置:
   - **Name**: `chineseflow-api`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Root Directory**: `backend`
5. 点击 "Create Web Service"
6. 创建 PostgreSQL 数据库:
   - "New +" → "PostgreSQL"
   - 名称: `chineseflow-db`
   - 免费计划
7. 链接数据库到 Web Service

### 部署后配置

1. 获取后端 URL (例如: `https://chineseflow-api.onrender.com`)
2. 更新 Vercel 环境变量:
   ```
   VITE_API_URL=https://chineseflow-api.onrender.com/api
   ```
3. 在 Render Dashboard 添加 CORS 环境变量:
   ```
   CORS_ORIGINS=https://your-frontend.vercel.app
   ```

---

## 🔗 各平台链接

| 平台 | 用途 | 链接 |
|------|------|------|
| GitHub | 代码仓库 | https://github.com/gwlcinphilly/ChineseFlow |
| Vercel | 前端托管 | (部署后生成) |
| Render | 后端 API | (部署后生成) |
| Render DB | PostgreSQL | (随后端创建) |

---

## ⚙️ 环境变量参考

### 前端 (Vercel)
```
VITE_API_URL=https://chineseflow-api.onrender.com/api
```

### 后端 (Render)
```
DATABASE_URL=(自动生成)
CORS_ORIGINS=https://your-frontend.vercel.app,http://localhost:5173
PORT=8000
```

---

## ✅ 部署检查清单

### 部署前
- [ ] GitHub 仓库已更新
- [ ] `.gitignore` 已排除敏感文件
- [ ] `render.yaml` 配置正确
- [ ] `requirements.txt` 包含所有依赖

### 部署后
- [ ] 后端健康检查: `GET https://api-url/`
- [ ] 前端能正常访问
- [ ] API 调用正常
- [ ] 图片生成正常
- [ ] 数据库连接正常

---

## 🐛 常见问题

### 1. CORS 错误
```
Access-Control-Allow-Origin header missing
```
**解决**: 在 Render 环境变量添加 `CORS_ORIGINS` 包含你的 Vercel 域名

### 2. 数据库连接失败
```
connection refused
```
**解决**: 确认 `DATABASE_URL` 环境变量正确设置

### 3. 前端 404
```
Cannot GET /api/characters
```
**解决**: 检查 `VITE_API_URL` 是否正确指向 `/api` 后缀

---

## 📚 相关文档

- [前端部署详情](DEPLOY.md)
- [后端部署详情](BACKEND_DEPLOY.md)
- [数据库迁移指南](DATABASE_MIGRATION.md)
