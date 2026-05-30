# wealth-channel 接口文档

> 版本：`1.0.0` · 基于 FastAPI · 文档 UI：Scalar

## 基础信息
- Base URL：`http://localhost:8000`
- 文档入口：`http://localhost:8000/docs`
- 统一前缀：`/api`
- 分组：
  - `基础数据`（前缀 `/basic`）
  - `策略`（前缀 `/strategy`）
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

### 1) 获取K线数据
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

### 2) 搜索股票
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

---

## 策略 · 信号
前缀：`/api/strategy`

### 1) 计算策略信号
- 方法与路径：`GET /api/strategy/signals`
- 概述：按 K 线参数与策略 ID 计算买卖事件与预计收益
- 请求参数（Query）：
  - `code` `string`，默认 `600519`，股票代码（6位）
  - `period` `enum`，默认 `daily`，可选：`daily`/`weekly`/`monthly`
  - `startDate` `string?`，默认 `20250101`，格式 `YYYYMMDD`
  - `endDate` `string?`，默认 `20500101`，格式 `YYYYMMDD`
  - `adjust` `string?`，`qfq`/`hfq`，默认不复权
  - `timeout` `number?`，请求超时（秒）
  - `strategyId` `number`，策略 ID（例如：`1`=倒锤子线抄底·次日卖出 V1）
- 成功响应（`data` 字段）：

```jsonc
{
  "items": [                // 交易事件列表
    { "date": "2025-01-02", "value": 11.35, "type": "buy" },
    {
      "date": "2025-01-03", "value": 11.40, "type": "sell",
      "profit_pct": 0.44,            // 相对买入价的收益（%）
      "profit_pct_vs_high": -0.44    // 相对卖出日最高价的收益（%）
    }
  ],
  "expected_profit_pct": 0.21 // 预计平均收益（%）
}
```
- 示例（仅示意）：
  - `GET /api/strategy/signals?strategyId=1&code=600519&period=daily&startDate=20250101&endDate=20250131`

---

## 系统设置
前缀：`/api/setting`

### 1) 系统健康检查
- 方法与路径：`GET /api/setting/health`
- 概述：返回服务健康状态与版本信息
- 成功响应（`data` 字段）：

```jsonc
{
  "timestamp": "2025-12-03 10:20:30", // 当前时间（本地时区）
  "service": "wealth-channel",        // 服务名称
  "version": "1.0.0"                  // 版本号
}
```

### 2) 获取策略集合
- 方法与路径：`GET /api/setting/strategies`
- 概述：返回可用策略列表
- 请求参数（Query）：
  - `keyword` `string?`，关键词（按标题或描述过滤）
- 成功响应（`data` 字段）：

```jsonc
{
  "count": 1,                  // 策略数量
  "items": [
    {
      "strategy_id": 1,       // 策略ID
      "title": "倒锤子线抄底·次日卖出（V1）", // 策略名称
      "desc": "出现倒锤子线当日建仓，次日卖出"   // 策略描述
    }
  ]
}
```

---

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
- 模块分组包含 `basic` 与 `strategy`，对外路由前缀分别为 `/basic` 与 `/strategy`。
