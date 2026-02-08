# 数据库迁移指南

## 概述
本指南帮助你将本地 SQLite 数据迁移到 PostgreSQL 在线数据库。

## 步骤

### 1. 配置 PostgreSQL 连接

1. 打开网页，进入 **设置** 页面
2. 在 **AI 设置** 标签页中，找到 **数据库配置** 部分
3. 选择 **PostgreSQL** 作为数据库类型
4. 粘贴你的 Neon PostgreSQL 连接 URL:
   ```
   postgresql://neondb_owner:npg_itv5qcJlA4TH@ep-purple-fire-airnrw5w-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   ```
5. 点击 **保存设置**

### 2. 安装 PostgreSQL 依赖

在终端运行：
```bash
cd backend
source venv/bin/activate
pip install psycopg2-binary
```

### 3. 迁移数据

运行迁移脚本：
```bash
cd backend
python migrate_to_postgres.py
```

按提示操作，输入 `yes` 确认迁移。

### 4. 切换到 PostgreSQL

1. 回到网页的 **设置** 页面
2. 确认数据库类型为 **PostgreSQL**
3. 保存设置
4. 重启后端服务：
   ```bash
   pkill -f "python main.py"
   python main.py
   ```

### 5. 验证

刷新网页，检查：
- 所有汉字数据是否正常显示
- 所有词语数据是否正常显示
- 学习进度是否正确

## 故障排除

### 连接失败
- 检查 PostgreSQL URL 是否正确
- 确认网络可以访问 Neon 数据库
- 查看后端日志：`cat backend/data/backend.log`

### 数据迁移失败
- 确保 SQLite 数据库文件存在：`backend/data/chinese_learning.db`
- 检查 PostgreSQL 表是否已创建
- 查看错误信息，修复后重新运行迁移脚本

### 切换回 SQLite
如果需要切换回本地 SQLite：
1. 在设置页面将数据库类型改为 **SQLite**
2. 保存设置
3. 重启后端服务

## 注意事项

- 迁移过程会清空 PostgreSQL 中的现有数据
- 建议在迁移前备份 SQLite 数据库
- 迁移后，SQLite 数据库仍然保留，可以随时切换回去
