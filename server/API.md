# market-insight 接口文档

> 版本：`1.0.0` · 基于 FastAPI · 文档 UI：Scalar

## 基础信息
- Base URL：`http://localhost:8000`
- 文档入口：`http://localhost:8000/docs`
- 统一前缀：`/api`
- 分组：
  - `基础数据`（前缀 `/basic`）
  - `市场数据`（前缀 `/basic/market`）
  - `Skill 数据`（前缀 `/skill`）
  - `系统设置`（前缀 `/setting`）

## 统一响应结构
所有接口返回统一结构 `ResponseModel`：

```jsonc
{
  "code": 0,         // 业务码：0=成功；-1=内部错误；其他=业务失败
  "success": true,   // 是否成功
  "data": {},        // 数据载荷：各接口的具体结构见下文
  "message": null,   // 错误或提示信息
  "request_id": "<请求ID>" // 请求追踪ID，同时在响应头 X-Request-Id 返回
}
```
- `code`：业务码，`0` 表示成功；`-1` 为服务内部错误；其他值为业务失败
- `success`：布尔标记，成功为 `true`
- `data`：具体数据载荷（各接口定义见下）
- `message`：错误或提示信息
- `request_id`：请求追踪 ID（同时在响应头 `X-Request-Id` 中返回）

## 全局约定
- 认证/用户：可选请求头 `X-User-Id: <用户ID>`，用于日志与审计
- 请求追踪：若未提供 `X-Request-Id`，系统会自动生成并透传到响应
- 时间与格式：内部统一使用 `Asia/Shanghai` 时区；如遇时间展示请使用 `app/utils/time.format_dt`

---

## A股 · 基础数据
前缀：`/api/basic`

### 1) 获取K线数据（腾讯证券）
- 方法与路径：`GET /api/basic/kline`
- 概述：获取指定股票在给定周期与日期范围内的 K 线数据
- 请求参数（Query）：
  - `code` `string`，默认 `600519`，股票代码（6位）
  - `period` `enum`，默认 `daily`，可选：`daily`/`weekly`/`monthly`
  - `startDate` `string?`，默认 `20250101`，格式 `YYYYMMDD`（合法日期，2000-2050）
  - `endDate` `string?`，默认 `20500101`，格式 `YYYYMMDD`（合法日期，2000-2050）
  - `adjust` `string?`，复权参数：`qfq`（前复权）/`hfq`（后复权），默认不复权
  - `timeout` `number?`，请求超时（秒）
- 成功响应（`data` 字段）：

```jsonc
{
  "code": "600519",      // 股票代码
  "count": 2,             // 数据条数
  "lines": [              // K线数据列表
    {
      "date": "2025-01-02",     // 交易日（本地时区）
      "open": 11.23,             // 开盘价
      "close": 11.35,            // 收盘价
      "high": 11.40,             // 最高价
      "low": 11.10,              // 最低价
      "amount": 9876543.21,      // 成交额（元）
      "amplitude": 1.23,         // 振幅（%）
      "change_pct": 0.85,        // 涨跌幅（%）
      "change": 0.09             // 涨跌额（元）
    },
    {
      "date": "2025-01-03",
      "open": 11.30,
      "close": 11.20,
      "high": 11.45,
      "low": 11.15,
      "amount": 12345678.90,
      "amplitude": 2.01,
      "change_pct": -1.32,
      "change": -0.15
    }
  ]
}
```
- 示例（仅示意）：
  - `GET /api/basic/kline?code=600519&period=daily&startDate=20250101&endDate=20250131`

### 2) 搜索股票（东方财富）
- 方法与路径：`GET /api/basic/search`
- 概述：根据关键词匹配股票代码或名称
- 请求参数（Query）：
  - `keyword` `string`，默认 `伊利股份`
- 成功响应（`data` 字段）：

```jsonc
{
  "count": 2,           // 结果条数
  "items": [            // 返回的匹配项列表
    { 
      "code": "600887",      // 股票代码
      "name": "伊利股份",      // 股票名称
      "marketText": "上证主板" // 市场/板块文本
    },
    { 
      "code": "000858", 
      "name": "五粮液", 
      "marketText": "深证主板" 
    }
  ]
}
```
- 示例（仅示意）：
  - `GET /api/basic/search?keyword=伊利`

### 3) 获取指数历史K线数据（腾讯证券）
- 方法与路径：`GET /api/basic/index/kline`
- 概述：按腾讯指数代码返回原始 `klines` 对象数组，仅保留上游响应中的 `day` 数据
- 请求参数（Query）：
  - `code` `string`，指数代码，不带市场前缀，例如 `000685`
  - `limit` `number?`，返回条数，默认 `320`，范围 `1-1000`
- 成功响应（`data` 字段）：

```jsonc
{
  "code": "000685",
  "count": 2,
  "klines": [
    {
      "date": "2026-06-08",
      "open": 3649.06,
      "close": 3694.19,
      "high": 3788.74,
      "low": 3647.59,
      "volume": 9886604,
      "meta": {},
      "changePercent": 3.44,
      "amount": 14119178.43,
      "changeAmount": 0,
      "turnoverRate": 0
    },
    {
      "date": "2026-06-09",
      "open": 3787.24,
      "close": 3893.72,
      "high": 3899.74,
      "low": 3740.33,
      "volume": 10258486,
      "meta": {},
      "changePercent": 3.57,
      "amount": 13877714.22,
      "changeAmount": 0,
      "turnoverRate": 0
    }
  ]
}
```
- 示例（仅示意）：
  - `GET /api/basic/index/kline?code=000685&limit=320`

### 4) 获取ETF前十大持仓（东方财富）
- 方法与路径：`GET /api/basic/fund/top-holdings`
- 概述：按 ETF 基金代码返回前十大持仓及持仓报告期
- 请求参数（Query）：
  - `code` `string`，ETF 基金代码（例如：`588200`）

### 5) 获取股票核心财务指标（东方财富）
- 方法与路径：`GET /api/basic/stock/main-finance`
- 概述：按股票代码与报告类型返回单期核心财务指标

---

## A股 · 市场数据
前缀：`/api/basic/market`

### 1) 获取最近 90 个交易日沪深两市成交额（AKShare）
- 方法与路径：`GET /api/basic/market/turnover`
- 概述：使用 AKShare + 本地 CSV 缓存同步最近交易日成交额数据，缺失日期才补抓
- 请求参数（Query）：
  - `days` `number?`，默认 `90`，最近交易日数量，范围 `1-240`
- 成功响应（`data` 字段）：

```jsonc
{
  "count": 2,
  "items": [
    {
      "date": "20260603",
      "sse_amount": 5234.12,
      "szse_amount": 6812.34,
      "total_amount": 12046.46,
      "unit": "亿元",
      "source": "AKShare"
    }
  ]
}
```
- 请求参数（Query）：
  - `stockCode` `string`，股票代码（例如：`600519`）
  - `reportType` `string`，报告类型（`一季报`/`中报`/`三季报`/`年报`）

---

## Skill 数据
前缀：`/api/skill`

### 1) 一次性获取ETF基础数据
- 方法与路径：`GET /api/skill/etf`
- 概述：供 skill 直接调用，一次返回 ETF K线、前十大持仓、持仓股单期财务指标
- 请求参数（Query）：
  - `code` `string`，ETF 基金代码（例如：`588200`）
  - `klineLimit` `number?`，K线条数，默认 `60`

### 2) 获取板块拥挤度
- 方法与路径：`GET /api/skill/sector/congestion`
- 概述：按主题 key 返回沪深两市成交额、板块/指数成交额与成交额占比
- 请求参数（Query）：
  - `themeKeys` `array[string]?`，主题 key 列表，参考 `frontend/src/data/etfBaseList.js` 的 `key`
  - `days` `number?`，默认 `90`，最近交易日数量
- 返回说明：
  - `data` 为数组，每个元素包含 `date`、`sse_amount`、`szse_amount`、`total_amount`、`unit` 以及各主题 key 的 `{ amount, ratio }`

## 系统设置
前缀：`/api/setting`

### 1) 系统健康检查
- 方法与路径：`GET /api/setting/health`
- 概述：返回服务健康状态与版本信息
- 成功响应（`data` 字段）：

```jsonc
{
  "timestamp": "2025-12-03 10:20:30", // 当前时间（本地时区）
  "service": "market-insight",        // 服务名称
  "version": "1.0.0"                  // 版本号
}
```

## 错误示例
- 业务失败：

```jsonc
{
  "code": 1,                // 业务失败码（非0，非-1）
  "success": false,         // 是否成功（失败为 false）
  "data": null,             // 失败时通常为空
  "message": "参数不合法",  // 失败原因提示
  "request_id": "b0f1d8..." // 请求追踪ID
}
```
- 服务内部错误：

```jsonc
{
  "code": -1,               // 内部错误统一码
  "success": false,
  "data": null,
  "message": "服务内部错误", // 不暴露详细堆栈信息
  "request_id": "b0f1d8..."
}
```

## 说明
- 文档 UI 为 Scalar，访问 `/docs` 可交互调试。
- 模块分组包含 `basic`、`skill` 与 `setting`，对外路由前缀分别为 `/basic`、`/skill` 与 `/setting`。
