# 中医药学习平台 (Medicine Learning Platform)

一个集标本管理、教学辅助、在线学习于一体的综合性中医药学习平台，包含后台管理系统、微信小程序端和后端服务。

## 项目简介

本项目是一个面向中医药教育领域的综合性学习平台，主要功能包括：

- **标本管理系统**：标本目录分类、标本信息管理、标本借阅
- **在线学习**：课程管理、题库练习、考试系统
- **用户管理**：学生/教师注册、权限管理、VIP 教师功能
- **后台管理**：系统统计、数据管理、权限配置

## 技术栈

### 整体架构
- **前端管理后台**：Vue 3 + Pinia + TypeScript + Vite + Element Plus
- **微信小程序**：uni-app (uvue) + TypeScript
- **后端服务**：NestJS + Prisma + MySQL + Redis + BullMQ
- **包管理器**：npm / pnpm

### 各端技术详情

| 模块 | 技术栈 | 说明 |
|------|--------|------|
| admin-web | Vue 3.4 + Pinia 2.0 + TypeScript + Vite 5.0 + Element Plus 2.6 + ECharts 5.4 | PC 端管理后台 |
| backend | NestJS 10 + Prisma 5.12 + MySQL + Redis + BullMQ + JWT | RESTful API 服务 |
| tcm-app-ui | uni-app + uvue + TypeScript | 微信小程序端 |

## 目录结构

```
medicine-learning-platform/
├── admin-web/              # 后台管理前端
│   ├── src/
│   │   ├── api/           # API 接口封装
│   │   ├── assets/        # 静态资源
│   │   ├── components/    # 公共组件
│   │   ├── hooks/         # 组合式函数
│   │   ├── layouts/       # 布局组件
│   │   ├── router/        # 路由配置
│   │   ├── stores/        # Pinia 状态管理
│   │   ├── styles/        # 全局样式
│   │   ├── types/         # TypeScript 类型
│   │   ├── utils/         # 工具函数
│   │   └── views/         # 页面组件
│   ├── .env.development   # 开发环境变量
│   ├── .env.production    # 生产环境变量
│   ├── vite.config.ts     # Vite 配置
│   └── package.json
│
├── backend/                # 后端服务
│   ├── src/
│   │   ├── main.ts        # 应用入口
│   │   ├── app.module.ts  # 根模块
│   │   ├── config/        # 环境配置
│   │   ├── common/        # 公共模块（装饰器、守卫、拦截器等）
│   │   ├── modules/       # 业务模块（auth, sys, monitor 等）
│   │   └── shared/        # 共享服务
│   ├── prisma/
│   │   └── schema.prisma  # 数据库模型
│   ├── .env               # 环境变量配置
│   ├── medical-prisma.sql # 数据库初始化脚本
│   └── package.json
│
├── tcm-app-ui/            # 微信小程序端
│   ├── api/               # API 接口
│   ├── components/        # 组件
│   ├── hooks/             # 组合式函数
│   ├── pages/             # 页面
│   ├── static/            # 静态资源
│   ├── utils/             # 工具函数
│   ├── App.uvue           # 应用入口
│   ├── pages.json         # 页面配置
│   └── manifest.json      # 应用配置
│
├── nginx/                 # Nginx 配置
└── README.md              # 项目说明文档
```

## 环境要求

- **Node.js**: >= 16.x (推荐 22.21.0)
- **MySQL**: >= 8.0
- **Redis**: >= 6.x
- **npm**: >= 8.x 或 pnpm >= 8.x

## 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd medicine-learning-platform
```

### 2. 后端服务启动

```bash
cd backend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，配置数据库、Redis 连接信息

# 数据库初始化
npm run db:m          # 执行数据库迁移
npm run db:g          # 生成 Prisma Client

# 导入初始数据（可选）
# 执行 medical-prisma.sql

# 启动开发服务
npm run dev
```

后端服务默认运行在: `http://localhost:5880`

API 文档地址: `http://localhost:5880/api-docs`

### 3. 管理后台启动

```bash
cd admin-web

# 安装依赖
npm install

# 配置环境变量
# 编辑 .env.development，配置 VITE_API_BASE_URL

# 启动开发服务
npm run dev
```

前端默认运行在: `http://localhost:5173`

### 4. 微信小程序启动

```bash
cd tcm-app-ui

# 使用 HBuilderX 打开项目
# 或使用 uni-app CLI
```

在 HBuilderX 中选择「运行」->「运行到小程序模拟器」->「微信开发者工具」

## 常用命令

### 后端 (backend/)

```bash
npm run dev          # 启动开发服务（SWC 编译）
npm run build        # 生产构建
npm run start:prod   # 启动生产服务
npm run lint         # ESLint 检查并修复
npm run format       # 代码格式化
npm run test         # 运行单元测试
npm run db:m         # 数据库迁移
npm run db:g         # 生成 Prisma Client
npm run docs         # 生成 API 文档
```

### 管理后台 (admin-web/)

```bash
npm run dev          # 启动开发服务
npm run build        # 生产构建
npm run build:prod   # 生产环境构建
npm run lint:eslint  # ESLint 自动修复
npm run format       # 代码格式化
npm run preview      # 预览构建产物
```

## 核心功能模块

### 后台管理系统

| 模块 | 功能说明 |
|------|---------|
| 标本管理 | 标本目录分类管理、标本信息维护、标本借阅管理 |
| 用户管理 | 学生/教师信息管理、用户审核、VIP 权限设置 |
| 课程管理 | 课程创建、章节管理、内容发布 |
| 题库系统 | 题目录入、分类管理、随机组卷 |
| 考试管理 | 考试发布、成绩统计、数据分析 |
| 系统统计 | 用户活跃度、数据报表、可视化图表 |
| 系统管理 | 菜单管理、角色权限、部门管理、参数配置 |

### 微信小程序

| 模块 | 功能说明 |
|------|---------|
| 微信登录 | 一键微信授权登录、用户注册 |
| 标本查看 | 标本目录浏览、标本详情查看 |
| 在线学习 | 课程学习、章节练习 |
| 在线考试 | 参加考试、查看成绩 |
| 个人中心 | 个人信息、学习记录、我的收藏 |

### VIP 教师专属功能

- 仅可访问标本管理页面和标本目录页面
- 标本目录下可添加分类、修改分类
- 不可删除分类、不可对标本目录进行操作

## 部署说明

### 后端部署

```bash
cd backend
npm run build
npm run start:prod
```

### 前端部署

```bash
cd admin-web
npm run build:prod
# 将 dist 目录部署到静态服务器
```

### Docker 部署

项目包含 nginx 配置目录，可使用 Docker 进行容器化部署。

## 开发规范

### Git 提交规范

```
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式（不影响代码运行）
refactor: 重构（既不是新增功能，也不是修改 bug）
perf: 性能优化
test: 增加测试
chore: 构建过程或辅助工具的变动
```

### 代码规范

- **缩进**：2 个空格
- **引号**：单引号（JS/TS），双引号（HTML 属性）
- **分号**：不使用尾部分号
- **命名**：
  - 组件/类：PascalCase（如 `UserList.vue`）
  - 函数/变量：camelCase（如 `getUserInfo`）
  - 常量：UPPER_SNAKE_CASE（如 `API_BASE_URL`）

## 环境变量配置

### 后端 (backend/.env)

| 变量名 | 说明 |
|--------|------|
| NODE_ENV | 运行环境（development/production） |
| DATABASE_URL | MySQL 数据库连接地址 |
| NODE_PORT | 服务端口 |
| NODE_REDIS_HOST | Redis 主机地址 |
| NODE_REDIS_PORT | Redis 端口 |
| NODE_REDIS_PASSWORD | Redis 密码 |

### 前端 (admin-web/.env.development)

| 变量名 | 说明 |
|--------|------|
| VITE_API_BASE_URL | 后端 API 基础地址 |
| VITE_APP_TITLE | 应用标题 |

## 相关文档

- [NestJS 官方文档](https://docs.nestjs.com/)
- [Vue 3 官方文档](https://cn.vuejs.org/)
- [Prisma 官方文档](https://www.prisma.io/docs/)
- [uni-app 官方文档](https://uniapp.dcloud.net.cn/)
- [Element Plus 组件库](https://element-plus.org/)

## 许可证

UNLICENSED - 私有项目

## 联系方式

如有问题，请联系项目维护者。
