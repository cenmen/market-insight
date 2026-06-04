---
name: etf-analysis
description: Market Insight 项目专用的 ETF 分析工作流。通过本地 server 接口获取 ETF 持仓、持仓公司业绩和基金 K 线数据，结合数据补全分析内容，并输出 frontend/src/data/etfs 使用的 ETF 静态 JavaScript 数据。需要同步生成 K 线技术分析、画线参数和带行情推演的图注。仅当用户显式调用 $etf-analysis 或明确要求使用 ETF 分析 skill 时使用；不要因为上下文自动调用。
---

# ETF 分析

## 目标

为本仓库生成 ETF 分析静态数据。流程先抓取 ETF 前十大持仓、持仓公司核心财务指标和基金最近 90 根日 K 线，再整理成 `frontend/src/pages/EtfReport.jsx` 当前消费的数据结构，并补齐 K 线技术分析画线参数。

固定输出目录：

```text
frontend/src/data/etfs
```

单个 ETF 文件命名：

```text
frontend/src/data/etfs/etf<ETF_CODE>.js
```

例如：

```text
frontend/src/data/etfs/etf515880.js
```

页面会直接读取 `kLineMarkers`，所以数据文件里需要同步写入：

```js
kLineMarkers: {
  candleMarkers: [
    { date: '2026-05-29', label: '锤子线', position: 'below', lineLength: 1 },
  ],
  supportMarkers: [
    { date: '2026-05-22', price: 3.53, label: '支撑位', position: 'below', lineLength: 1 },
  ],
  resistanceMarkers: [
    { date: '2026-05-19', price: 3.82, label: '压力位', position: 'above', lineLength: 1 },
  ],
  keyInfoMarkers: [
    { date: '2026-05-28', label: '关键信息位', position: 'above', lineLength: 1.5, lineWidth: 0.6, fontSize: 7 },
  ],
  polyLines: [
    {
      points: [
        { date: '2026-05-25', price: 3.91 },
        { date: '2026-05-28', price: 3.82 },
        { date: '2026-06-02', price: 3.49 },
      ],
      lineWidth: 1.1,
      lineType: 'dashed',
      color: '#1b365d',
    },
  ],
}
```

## 开始前检查

每次生成或更新 ETF 数据前，必须先检查当前代码结构，不要依赖旧 schema：

1. 读取 `frontend/src/data/etfs/etf515880.js`，以它作为字段顺序、命名、文案风格和导出格式的主要参考。
2. 读取 `frontend/src/pages/EtfReport.jsx`，确认页面实际消费字段。
3. 检查工作区已有改动，避免覆盖用户或旧任务留下的相关修改。

## 当前目标类型

生成的单个 ETF 文件应为 JavaScript 文件，不要写 TypeScript 类型导入或 `satisfies`：

```js
const etf588200 = {
  etf: {
    code: '588200',
    name: '科创芯片ETF',
    index: '上证科创板芯片指数',
    intro: '一句到两句概括 ETF 的核心暴露、权重结构和适用场景。',
    concepts: ['主题1', '主题2'],
    scale: '386.07 亿元',
  },
  report: {
    date: '2026-06-02',
    author: '抖音 · ETF主线侦探',
    headlineSignal: '规模与流动性观察',
    coreJudgment: '一句短判断',
    thesis: '投资逻辑正文。',
    callout: '总结性提示或对用户的直接建议，要求简洁有力，字数控制在 20 字以内。',
    chartCaption: '近期走势总结 + 对接下来 1 到 3 个交易日的推演。',
    disclaimer: '仅供参考，不构成任何投资建议；市场有风险，决策需谨慎，风险自负。',
    risks: [],
  },
  metrics: [],
  recentFiveDayAmplitude: '5.67%（5.04% ~ 6.48%）',
  recentTenDayMaxDrawdown: '-8.42%',
  recentTenDayMaxDrawdownDate: '2026.05.21',
  businessRatio: [],
  shortTermFactors: [],
  styleCharacteristics: [],
  story: null,
  tPrinciples: null,
  tReferences: null,
  strategies: null,
  kLineData: [],
  financialRows: [],
  viewpoints: [],
};

export default etf588200;
```

字段要求：

- `report` 必须存在，页面 header、投资逻辑、风险提示和图注都会读取它。
- `metrics` 必须是 4 项：基金规模、盈利增速、ROE、业务增速。
- `businessRatio`、`shortTermFactors`、`styleCharacteristics`、`kLineData`、`financialRows` 必须是数组。
- `kLineMarkers` 必须是对象，当前页面读取 `candleMarkers`、`supportMarkers`、`resistanceMarkers`、`keyInfoMarkers`、`polyLines` 五个字段。
- `viewpoints` 使用数组；没有可靠事件时写 `[]`，不要写 `null`，因为页面直接传给 `EventTimeline`。
- `story`、`tPrinciples`、`tReferences`、`strategies` 当前页面不消费，没有可靠内容时写 `null`。

## financialRows 结构

`financialRows` 每项参考：

```js
{
  code: '300308',
  name: '中际旭创',
  weight: 13.66,
  productTags: ['光模块', '800G', '数据中心互联'],
  intro: '一句话说明公司在 ETF 组合里的业务暴露和影响。',
  data: [
    {
      year: 2026,
      quarter: 1,
      roe: 8.69,
      mainBusinessGrowthRate: 66.23,
      netProfitMargin: 18.32,
      grossProfitMargin: 34.21,
      revenueGrowthRate: 66.23,
      nonNetProfitGrowthRate: 76.65,
    },
  ],
}
```

接口字段映射：

- `stock_code` -> `code`
- `stock_name` -> `name`
- `hold_rate` -> `weight`
- `quarter_data[].main_grow` -> `mainBusinessGrowthRate` 和 `revenueGrowthRate`
- `quarter_data[].net_rate` -> `netProfitMargin`
- `quarter_data[].gross_rate` -> `grossProfitMargin`
- `quarter_data[].profit_grow` -> `nonNetProfitGrowthRate`
- `quarter_data[].roe` -> `roe`

## 必须预先计算的展示字段

页面只负责展示，不负责计算。生成 ETF JS 文件时必须在 skill 流程内算好并写入以下字段：

- `metrics`
- `recentFiveDayAmplitude`
- `recentTenDayMaxDrawdown`
- `recentTenDayMaxDrawdownDate`

计算来源：

- `metrics[0]` 基金规模：使用 `fetch_fund_snapshot` 返回的流通市值换算成亿元后写入 `etf.scale`，`value` 可写成 `291.05 亿`。
- `metrics[1]` 盈利增速：从 `financialRows[].data[0].nonNetProfitGrowthRate` 按持仓权重计算。
- `metrics[2]` ROE：从 `financialRows[].data[0].roe` 按持仓权重计算。
- `metrics[3]` 业务增速：从 `financialRows[].data[0].mainBusinessGrowthRate` 按持仓权重计算。
- `recentFiveDayAmplitude`：从 `kLineData` 最近 5 条计算平均振幅，并带上最小和最大振幅范围，格式如 `5.67%（5.04% ~ 6.48%）`。
- `recentTenDayMaxDrawdown`：从 `kLineData` 最近 10 条计算最大区间跌幅，格式如 `-8.42%`。
- `recentTenDayMaxDrawdownDate`：写入最大跌幅发生日，格式如 `2026.05.21`。

## K 线技术分析与 `chartCaption`

生成或更新 ETF 数据时，必须按 `references/kline-technical-analysis.md` 执行 K 线技术分析，并把结果写入：

- `report.chartCaption`
- `kLineMarkers.candleMarkers`
- `kLineMarkers.supportMarkers`
- `kLineMarkers.resistanceMarkers`
- `kLineMarkers.keyInfoMarkers`
- `kLineMarkers.polyLines`

`chartCaption` 必须是完整的 K 线技术分析总结，并带接下来 1 到 3 个交易日的行情推演。

写作要求：

- 必须分成 3 段。
- 每段控制在 100 到 180 个汉字之间。
- 第 1 段写当前走势、量能和结构。
- 第 2 段写关键支撑、压力、均线或形态变化。
- 第 3 段写接下来 1 到 3 个交易日的推演和操作节奏。
- 不要写成短句拼接，也不要只下结论不展开。

权重指标计算规则：

1. 只使用最新一期财务数据存在的持仓。
2. 先取待计算指标的原始值数组，计算 p10 和 p90。
3. 每个值裁剪到 `[p10, p90]` 后按 `weight` 加权。
4. 用 `sum(clippedValue * weight) / sum(weight)` 得到结果。
5. 展示值保留两位小数并加 `%`。

K 线指标计算规则：

1. `recentFiveDays = kLineData.slice(-5)`。
2. 单日振幅优先使用接口返回的 `amplitude`；缺失时用 `(high - low) / low * 100`。
3. 平均、最小、最大振幅保留两位小数。
4. `recentTenDays = kLineData.slice(-10)`。
5. 最近 10 日最大跌幅按昨日收盘价到今日最低价的最大回撤计算，即 `(todayLow - previousClose) / previousClose * 100`，从 `recentTenDays.slice(1)` 逐日计算后取最小值，保留两位小数并加 `%`，并将对应 `today.date` 写入 `recentTenDayMaxDrawdownDate`，日期格式为 `YYYY.MM.DD`。

## 工作流程

1. 通过本地 server 接口抓取 ETF 基础数据。接口返回 JSON，不直接写文件：

```bash
curl "http://localhost:8000/api/skill/etf/base-data?code=<ETF_CODE>&klineLimit=90"
```

在发起本地 server 调用之前，必须先在会话里输出本次调用的参数和接口地址，再执行抓取。格式要求：

- `调用参数：...`
- `调用接口：...`

如果是多个参数，按 JSON 或 key-value 形式原样输出，保证可读且可复现。

接口会返回：

- ETF 前十大持仓
- 持仓公司的目标季度核心财务数据
- 基金最近 90 根日 K 线

当一次任务涉及多个 ETF 代码时，必须按代码逐个串行抓取和整理。禁止并行请求多个 `/api/skill/etf/base-data`、禁止用 shell 循环或一条命令连续请求多个 ETF，也不要用 `multi_tool_use.parallel` 同时发起多个抓取请求；东方财富接口容易触发风控或封禁。每完成一个 ETF 的抓取、整理和文件写入后，再处理下一个。

如果因为沙箱、server 未启动或超时导致失败，按当前环境规则处理；无法取数时说明原因，不要编造数据。

2. 每次本地 server 接口返回成功后，必须在会话里输出：

- `xx 接口调用已完成`
- `xx 数据成功获取`

其中 `xx` 替换为实际接口名或数据主题，例如 `ETF 基础数据`、`K 线数据`。

3. 如果接口调用失败，必须立即停止后续分析、计算和写文件操作，并在会话里输出：

- `调用接口失败，参数是 xx`

其中 `xx` 写入本次请求的完整参数或关键参数摘要，不要继续执行任何后续步骤。

4. 基于接口返回 JSON 进行分析和补全，生成最终 JS：
   - 输出文件为 `frontend/src/data/etfs/etf<ETF_CODE>.js`。
   - 顶层变量名为 `etf<ETF_CODE>`，例如 `etf515880`。
   - 补全 `etf.name`、`etf.index`、`etf.intro`、`etf.concepts`、`etf.scale`。
   - 补全 `report`，文案风格参考 `frontend/src/data/etfs/etf515880.js`。
   - 根据持仓真实业务暴露生成 `businessRatio`，并补全 `desc` 和必要的 `subItems`。
   - 将接口返回的持仓整理成 `financialRows`，为每个持仓补全 `productTags` 和 `intro`。
   - 将接口返回的基金 K 线直接写入 `kLineData`，保留最近 90 根数据。
   - 根据 `financialRows` 和 `kLineData` 计算并写入 `metrics`、`recentFiveDayAmplitude`、`recentTenDayMaxDrawdown`、`recentTenDayMaxDrawdownDate`。
   - 补全 `shortTermFactors` 和 `styleCharacteristics`。
   - `viewpoints` 没有可靠事件时写 `[]`。
   - 不要保留接口返回里的辅助字段，例如 `source`、`fetched_at`、`target_quarter_end`、`report_type`、`position_report`、`holdings`。

5. `frontend/src/data/etfs/index.js` 会用 `import.meta.glob` 自动导出目录下的 ETF 数据，`EtfReportPage` 通过 `/etf/:code` 动态读取 `etf<code>`。新增 ETF 数据文件后通常不需要改页面；如果用户要求新增特殊路由或展示逻辑，再按页面现有结构调整。

6. 生成后只做只读检查，例如确认字段名、导出名和文件路径。不要自动运行 preview、build、test、lint 或自校验命令；把可手动执行的命令交给用户。

## 分析规则

- 定量字段优先基于抓取数据：持仓、权重、`financialRows` 和 `kLineData`。
- 多 ETF 任务必须一个代码一个代码处理，任何联网抓取步骤都不并发。
- 定性分析要基于持仓公司的真实业务暴露，不要只根据 ETF 名称推断。
- `businessRatio` 的权重需要和持仓权重保持可解释的一致性。如果分组没有覆盖全部持仓，增加“其他”分组承接剩余暴露。
- `report.thesis`、`report.callout`、`shortTermFactors`、`styleCharacteristics` 用简洁中文，风格参考现有 `etf515880.js`。
- `report.chartCaption` 必须是完整 K 线技术分析总结，分 3 段，每段 100 到 180 个汉字，并带接下来 1 到 3 个交易日的推演。
- 除 `report.chartCaption` 外，不要把 JSX 放进 ETF 静态数据；所有其他叙事字段使用纯字符串或数组对象。
- `report.chartCaption` 是唯一允许使用 JSX 的叙事字段。若需要分段排版，请使用 JSX 片段并把每段包在单独的 `<p>` 中，段落建议使用 `style={{ textIndent: '2em' }}` 做首行缩进；如果某个 ETF 文件包含 JSX，文件后缀必须使用 `.jsx`，同时确保 `frontend/src/data/etfs/index.js` 的聚合规则能加载 `.jsx`。
- 缺少来源时，不要编造精确规模、指数代码或财务数值；使用保守表达并明确不确定性。

## 参考

需要确认旧字段语义时，可读取 `references/output-schema.md`；需要生成 K 线技术分析、支撑压力、折线和 `chartCaption` 时，读取 `references/kline-technical-analysis.md`。字段最终以 `frontend/src/data/etfs/etf515880.js` 和 `frontend/src/pages/EtfReport.jsx` 为准。
