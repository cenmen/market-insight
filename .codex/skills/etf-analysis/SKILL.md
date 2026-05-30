---
name: etf-analysis
description: Channel 仓库专用的 ETF 分析工作流。通过本地 server 接口获取 ETF 持仓、持仓公司业绩和基金 K 线数据，结合数据补全分析内容，并输出 apps/website 使用的 ETF 静态 TypeScript 数据。仅当用户显式调用 $etf-analysis 或明确要求使用 ETF 分析 skill 时使用；不要因为上下文自动调用。
---

# ETF 分析

## 目标

为本仓库生成 ETF 分析静态数据。流程先抓取 ETF 持仓、持仓公司财务指标和基金最近 60 根日 K 线，再整理成 `apps/website` 当前消费的 `EtfAnalysisData` 初始数据。

固定输出目录：

```text
apps/website/src/static-json/etf
```

## 开始前检查

每次生成或更新 ETF 数据前，必须先检查当前代码结构，不要依赖旧 schema：

1. 读取 `apps/website/src/types/modules/etf-analysis.ts`，确认 `EtfAnalysisData`、`EtfKLineDataItem`、`EtfFinancialRow` 最新字段。
2. 读取 `apps/website/src/static-json/etf/index.ts`，确认 `ETF_STATIC_MAP` 写法。当前网站只负责读取和展示静态数据，不在 `index.ts` 计算派生字段。
3. 读取一个既有 ETF 文件，例如 `apps/website/src/static-json/etf/159326.ts`，保持字段顺序、命名和文案风格一致。
4. 检查工作区已有改动，避免覆盖用户或旧任务留下的相关修改。

## 当前目标类型

生成的单个 ETF 文件应为 TypeScript 文件：

```text
apps/website/src/static-json/etf/<ETF_CODE>.ts
```

文件导出结构必须符合 `EtfAnalysisData`：

```ts
import type { EtfAnalysisData } from '@/types';

const etf588200 = {
  etf: {
    code: '588200',
    name: '科创芯片 ETF',
    index: '上证科创板芯片指数 (000685.SH)',
    intro: '一句到两句概括 ETF 的核心暴露、权重结构和适用场景。',
    concepts: ['主题1', '主题2'],
    scale: '386.07 亿元',
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
  viewpoints: null,
} satisfies EtfAnalysisData;

export default etf588200;
```

字段要求：

- `story?: string | null`
- `tPrinciples?: string | null`
- `tReferences?: string | null`
- `strategies?: string | null`
- `kLineData?: EtfKLineDataItem[] | null`
- `viewpoints?: EtfViewpointItem[] | null`

没有可靠内容的可选字段写 `null`，页面会按空值隐藏对应区块。不要写占位文案。

## 必须预先计算的展示字段

网站只负责展示，不负责计算。生成 ETF TS 文件时必须在 skill 流程内算好并写入以下字段：

- `metrics`
- `recentFiveDayAmplitude`
- `recentTenDayMaxDrawdown`
- `recentTenDayMaxDrawdownDate`

计算来源：

- `metrics[0]` 基金规模：直接使用 `etf.scale`。
- `metrics[1]` 盈利增速：从 `financialRows[].data` 最新一期的 `nonNetProfitGrowthRate` 按持仓权重计算。
- `metrics[2]` ROE：从 `financialRows[].data` 最新一期的 `roe` 按持仓权重计算。
- `metrics[3]` 业务增速：从 `financialRows[].data` 最新一期的 `mainBusinessGrowthRate` 按持仓权重计算。
- `recentFiveDayAmplitude`：从 `kLineData` 最近 5 条计算平均振幅，并带上最小和最大振幅范围，格式如 `5.67%（5.04% ~ 6.48%）`。
- `recentTenDayMaxDrawdown`：从 `kLineData` 最近 10 条计算最大区间跌幅，格式如 `-8.42%`。
- `recentTenDayMaxDrawdownDate`：写入最大跌幅发生日，格式如 `2026.05.21`。

权重指标计算规则：

1. 只使用最新一期财务数据存在的持仓。
2. 先取待计算指标的原始值数组，计算 p10 和 p90。
3. 每个值裁剪到 `[p10, p90]` 后按 `weight` 加权。
4. 用 `sum(clippedValue * weight) / sum(weight)` 得到结果。
5. 展示值保留两位小数并加 `%`。

K 线指标计算规则：

1. `recentFiveDays = kLineData.slice(-5)`。
2. 单日振幅为 `(high - low) / low * 100`。
3. 平均、最小、最大振幅保留两位小数。
4. `recentTenDays = kLineData.slice(-10)`。
5. 最近 10 日最大跌幅按昨日收盘价到今日最低价的最大回撤计算，即 `(todayLow - previousClose) / previousClose * 100`，从 `recentTenDays.slice(1)` 逐日计算后取最小值，保留两位小数并加 `%`，并将对应 `today` 日期写入 `recentTenDayMaxDrawdownDate`，日期格式为 `YYYY.MM.DD`。

## 工作流程

1. 通过本地 server 接口抓取 ETF 基础数据。接口返回 JSON，不直接写文件：

```bash
curl "http://localhost:8000/api/skill/etf?code=<ETF_CODE>&klineLimit=60"
```

接口会返回：

- ETF 前十大持仓
- 持仓公司的目标季度核心财务数据
- 基金最近 60 根日 K 线，输出到 `kLineData`

当一次任务涉及多个 ETF 代码时，必须按代码逐个串行抓取和整理。禁止并行请求多个 `/api/skill/etf`、禁止用 shell 循环或一条命令连续请求多个 ETF，也不要用 `multi_tool_use.parallel` 同时发起多个抓取请求；东方财富接口容易触发风控或封禁。每完成一个 ETF 的抓取、整理和文件写入后，再处理下一个。

如果因为沙箱或超时导致网络失败，按当前环境规则请求提升权限。

2. 基于接口返回 JSON 进行分析和补全，生成最终 TS：
   - 输出文件为 `apps/website/src/static-json/etf/<ETF_CODE>.ts`。
   - 补全 `etf.name`、`etf.index`、`etf.intro`、`etf.concepts`、`etf.scale`。
   - 根据持仓真实业务暴露生成 `businessRatio`，并补全 `desc` 和必要的 `subItems`。
   - 将接口返回的持仓整理成 `financialRows`，为每个持仓补全 `productTags` 和 `intro`。
   - 将接口返回的 `kLineData` 直接写入 `kLineData`，保留最近 60 根数据。
   - 根据 `financialRows` 和 `kLineData` 计算并写入 `metrics`、`recentFiveDayAmplitude`、`recentTenDayMaxDrawdown`、`recentTenDayMaxDrawdownDate`。
   - 补全 `shortTermFactors` 和 `styleCharacteristics`。
   - 仅在有可靠内容时补全 `story`、`tPrinciples`、`tReferences`、`strategies`；否则写 `null`。
   - 不要保留接口返回里的辅助字段，例如 `source`、`fetched_at`、`target_quarter_end`、`report_type`、`position_report`、`holdings`。

3. 如果新增 ETF 文件，同步更新 `apps/website/src/static-json/etf/index.ts` 的 import 和 `ETF_STATIC_MAP`。`ETF_STATIC_MAP` 只做直接映射：

```ts
const ETF_STATIC_MAP: Record<string, EtfStaticData> = {
  '159326': etf159326,
};
```

不要在网站侧新增任何 ETF 数据计算函数；所有展示字段都应由 skill 生成并写入单个 ETF TS 文件。

4. 生成后只做只读检查，例如确认字段名和 import。不要自动运行 preview、build、test、lint 或自校验命令；把可手动执行的命令交给用户。

## 分析规则

- 定量字段优先基于抓取数据：持仓、权重、`financialRows` 和 `kLineData`。
- 多 ETF 任务必须一个代码一个代码处理，任何联网抓取步骤都不并发。
- 定性分析要基于持仓公司的真实业务暴露，不要只根据 ETF 名称推断。
- `businessRatio` 的权重需要和持仓权重保持可解释的一致性。如果分组没有覆盖全部持仓，增加“其他”分组承接剩余暴露。
- 文案使用简洁中文，风格参考现有 ETF TS 文件。
- 不要把 JSX 放进 TS 静态数据；叙事字段使用纯字符串或 `null`。
- 缺少来源时，不要编造精确规模、指数代码或财务数值；使用保守表达并明确不确定性。

## 参考

需要确认字段语义或写法要求时，读取 `references/output-schema.md`。
