# wealth-channel · 个人回测系统（精简文档）

> 本文档仅保留三部分：架构目录、依赖库、数据库设计。系统定位为个人使用的回测与数据分析工具，不做实盘。

## 架构目录

```
.
├── README.md
├── pyproject.toml
├── app/
│   ├── config/
│   │   └── settings.py
│   ├── constants/
│   │   └── enums.py
│   ├── core/
│   │   ├── exception.py
│   │   └── response.py
│   ├── modules/
│   │   └── basic/
│   │       ├── router.py
│   │       ├── schema/
│   │       │   ├── request.py
│   │       │   └── response.py
│   │       └── service.py
│   │   
│   │   router.py              # 聚合路由
│   ├── utils/
│   │   └── __init__.py
│   └── __init__.py
├── main.py
├── artifacts/
└── uv.lock
```
## 快速开始

### 1. 环境要求

- Python 3.9+
- 腾讯云数据库或其他云数据库服务

### 2. 安装依赖（使用 uv 项目与锁定）

```bash
# 第一次初始化：生成锁文件并同步虚拟环境（.venv）
uv lock
uv sync

# 开发模式启动（在锁定环境中执行）
uv run -- uvicorn main:app --reload --host 0.0.0.0 --port 8000

# 如需手动进入/退出虚拟环境
# macOS/Linux
source .venv/bin/activate
deactivate
# Windows
.venv\Scripts\activate
deactivate

# 全局格式化
uv run -- ruff format .

# 导入排序与 lint 自动修复
uv run -- ruff check . --fix
```

### 3. 访问应用

- API 文档: http://localhost:8000/docs
- 健康检查: http://localhost:8000/api/health
  
## 依赖库

- `fastapi`：Web 框架，仅提供必要端点。
- `pydantic>=2`：配置与请求/响应模型校验。
- `uvicorn`：开发时运行 FastAPI（仅提示，不执行）。
- 数据帧：`polars` 或 `pandas`（二选一，推荐 `polars`）。
- 数值计算：`numpy`。
- 可视化：`matplotlib` 或 `plotly`（生成静态图）。
- 行情获取：`akshare`（A股/ETF K线，配合本地缓存）。
- 数据库：`SQLAlchemy>=2`、`psycopg`（PostgreSQL 访问）。
- 时间与工具（可选）：`python-dateutil`、`tenacity`（重试）。
- 测试：`pytest`。

> 说明：依赖尽量保持轻量，生产不需要 Redis/消息队列/监控组件。

## 数据库设计（PostgreSQL，分析师与观点分表）

- 表：`analysts`、`analyst_opinions`（分表存储，观点表关联分析师）

`analysts` 字段设计：

| 字段名 | 类型 | 必填 | 默认值 | 说明 |
|---|---|---|---|---|
| id | BIGSERIAL | 是 | — | 主键 |
| name_cn | VARCHAR(80) | 否 | — | 中文名 |
| name_en | VARCHAR(80) | 否 | — | 英文名 |
| avatar | TEXT | 否 | — | 头像链接 |
| sector | VARCHAR(64) | 否 | — | 板块/行业 |
| created_at | TIMESTAMPTZ | 是 | NOW() | 创建时间 |
| updated_at | TIMESTAMPTZ | 是 | NOW() | 更新时间 |
| is_active | BOOLEAN | 是 | TRUE | 是否有效 |

`analyst_opinions` 字段设计：

| 字段名 | 类型 | 必填 | 默认值 | 说明 |
|---|---|---|---|---|
| id | BIGSERIAL | 是 | — | 主键 |
| analyst_id | BIGINT | 是 | — | 分析师ID（外键） |
| category | VARCHAR(16) | 是 | — | 分类（A股/黄金/白银/纳指/债券） |
| estimate_price | NUMERIC(18,4) | 否 | — | 预估价，非负 |
| desc | TEXT | 否 | — | 观点描述 |
| created_at | TIMESTAMPTZ | 是 | NOW() | 创建时间 |
| updated_at | TIMESTAMPTZ | 是 | NOW() | 更新时间 |
| is_active | BOOLEAN | 是 | TRUE | 是否有效 |

索引建议：
- `analyst_id`（btree）：按分析师关联查询加速。
- `category`（btree）：分类筛选加速。
- `created_at DESC`（btree）：按时间倒序列表。

约束建议：
- `estimate_price >= 0`（CHECK 约束，允许 NULL）。
- `analyst_id` 外键约束，级联删除按业务决定（建议禁止级联删除）。

访问策略：
- 提供分页/筛选与详情的查询接口，支持新增/更新/删除（基础 CRUD）。
