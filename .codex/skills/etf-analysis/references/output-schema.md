# ETF 静态 JSX 结构

目标文件目录：

```text
frontend/src/data/etfs/<ETF_CODE>.jsx
```

当前消费类型来源于页面实际读取结构，而不是 TypeScript 类型定义。

## 顶层结构

```jsx
const etf588200 = {
  etf: {
    code: '588200',
    name: '科创芯片 ETF',
    index: '上证科创板芯片指数 (000685.SH)',
    intro: '一句到两句概括 ETF 的核心暴露、权重结构和适用场景。',
    concepts: ['科创板芯片', 'AI 算力芯片'],
    scale: '386.07 亿元',
  },
  metrics: [
    { label: '基金规模', value: '386.07 亿元', note: '资金流动性' },
    { label: '盈利增速', value: '251.90%', note: '持仓公司权重盈利增速估算' },
    { label: 'ROE', value: '6.06%', note: '持仓公司权重加权 ROE 估算' },
    { label: '业务增速', value: '114.91%', note: '持仓公司权重业务增速估算' },
  ],
  recentFiveDayAmplitude: '5.76%（5.10% ~ 6.61%）',
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
  kLineMarkers: {
    candleMarkers: [],
    supportMarkers: [],
    resistanceMarkers: [],
    keyInfoMarkers: [],
    polyLines: [],
  },
  financialRows: [],
  viewpoints: [],
};

export default etf588200;
```

写法要求：

- 单个 ETF 文件必须写完整展示数据，包括 `metrics`、`recentFiveDayAmplitude`、`recentTenDayMaxDrawdown`、`recentTenDayMaxDrawdownDate`。
- 网站只负责展示，不负责计算这些字段；不要把计算逻辑放到页面里。
- `report.chartCaption` 必须是 JSX 片段，不是字符串，建议分成 3 个 `<p>`，分别写当前走势、关键支撑/压力和接下来 1 到 3 个交易日推演。
- `report.hiddenStoryLine` 如果有内容，应该是带想象力的市场叙事，而不是基本面总结。
- `kLineMarkers` 必须按对象写入，当前页面使用 `candleMarkers`、`supportMarkers`、`resistanceMarkers`、`keyInfoMarkers`、`polyLines`。
- `story`、`tPrinciples`、`tReferences`、`strategies` 没有可靠内容时写 `null`。
- `kLineData` 使用脚本抓取的基金最近 90 根日 K 线。
- 文件只要包含 JSX，就必须使用 `.jsx` 后缀，不要写成 `.js`。

## `report`

```jsx
report: {
  headlineSignal: '规模与流动性观察',
  coreJudgment: '新型电力系统建设的设备弹性组合',
  thesis: '研究摘要式投资逻辑。',
  callout: '高浓缩研究结论。',
}
```

写法要求：

- `coreJudgment` 用一句短判断概括 ETF 的核心暴露和定价方向，适合放在页面头部做副标题。
- `thesis` 不是口号，也不是泛行业介绍，要像研究摘要一样说明组合暴露、权重结构、弹性来源和成立前提。
- `callout` 不是“一句话看法”，不要使用“ 一句话看法： ”、“总结：”、“核心结论：”等固定开头。
- `callout` 应直接写成完整判断句，高密度概括整篇 ETF 研究，突出“组合本质是什么、驱动来自哪里、交易约束是什么”。
- `thesis` 与 `callout` 都应避免空泛表达，例如“景气度高”“值得关注”“适合布局”；要尽量落到产业链、订单、资本开支、盈利兑现、估值敏感度等可解释维度。

## `metrics[]`

```jsx
[
  { label: '基金规模', value: '386.07 亿元', note: '资金流动性' },
  { label: '盈利增速', value: '251.90%', note: '持仓公司权重盈利增速估算' },
  { label: 'ROE', value: '6.06%', note: '持仓公司权重加权 ROE 估算' },
  { label: '业务增速', value: '114.91%', note: '持仓公司权重业务增速估算' },
]
```

计算规则：

- 基金规模使用 `fetch_fund_snapshot` 返回的流通市值换算成 `etf.scale`。
- 盈利增速使用 `financialRows[].data` 最新一期的 `nonNetProfitGrowthRate`。
- ROE 使用 `financialRows[].data` 最新一期的 `roe`。
- 业务增速使用 `financialRows[].data` 最新一期的 `mainBusinessGrowthRate`。
- 上述三个财务指标按持仓 `weight` 加权，并先按 p10/p90 做去极值裁剪。
- 展示值保留两位小数并加 `%`。

## `recentFiveDayAmplitude` 和 `recentTenDayMaxDrawdown`

```jsx
recentFiveDayAmplitude: '5.76%（5.10% ~ 6.61%）',
recentTenDayMaxDrawdown: '-8.42%',
recentTenDayMaxDrawdownDate: '2026.05.21',
```

计算规则：

- 使用 `kLineData.slice(-5)`。
- 单日振幅为 `(high - low) / low * 100`。
- `recentFiveDayAmplitude` 写平均振幅，并附最小和最大振幅范围，均保留两位小数。
- `recentTenDayMaxDrawdown` 使用最近 10 日内昨日收盘价到今日最低价的最大回撤，即 `(todayLow - previousClose) / previousClose * 100`，从 `recentTenDays.slice(1)` 逐日计算后取最小值，保留两位小数并加 `%`。
- `recentTenDayMaxDrawdownDate` 写入最大跌幅发生日，格式为 `YYYY.MM.DD`。

## `businessRatio[]`

```jsx
{
  type: 'AI 算力与通用计算芯片',
  rate: 19.22,
  desc: '说明这个业务分组对 ETF 的意义。',
  subItems: [
    { type: '国产 x86 CPU', rate: 9.66 },
  ],
}
```

写法要求：

- `rate` 使用 number，顶层分组加总通常应接近 100。
- `subItems` 用来表达可解释的细分暴露，可以按持仓、产品线或产业链环节拆分。
- 分组要让用户容易理解，不要为了很小的权重过度拆分。

## `financialRows[]`

```jsx
{
  code: '688041',
  name: '海光信息',
  weight: 9.66,
  productTags: ['国产 x86 CPU', 'DCU AI 加速卡'],
  intro: '一句话说明公司业务和它对 ETF 的贡献。',
  data: [
    {
      year: 2026,
      quarter: 1,
      roe: 2.99,
      mainBusinessGrowthRate: 68.055920581475,
      netProfitMargin: 21.7513635878,
      grossProfitMargin: 55.6039833349,
      revenueGrowthRate: 68.055920581475,
      nonNetProfitGrowthRate: 34.992272779499,
    },
  ],
}
```

写法要求：

- `code`、`name`、`weight` 对应脚本输出的 `stock_code`、`stock_name`、`hold_rate`。
- 除非确认来源错误，否则保留脚本抓取的财务指标。
- `productTags` 描述真实产品或业务线，不要只写泛行业标签。
- `intro` 要短，适合在表格单元格里展示。
- `quarter` 使用数字枚举值：`1`、`2`、`3`、`4`。

## `kLineData[]`

```jsx
{
  date: '2026-05-28',
  open: 42.66,
  close: 41.2,
  low: 38.39,
  high: 43.35,
  volume: 6452849,
  amount: 678213657,
  amplitude: 1.69,
  changePercent: -1.97,
  changeAmount: -0.021,
  turnoverRate: 3.14,
}
```

写法要求：

- 使用脚本输出的最近 90 根日 K 线。
- 字段保留 `date`、`open`、`close`、`low`、`high`、`volume`、`amount`、`amplitude`、`changePercent`、`changeAmount`、`turnoverRate`。
- 所有数值字段保持 number，不要转成字符串。

## 因素数组

`shortTermFactors` 和 `styleCharacteristics` 使用相同结构：

```jsx
{
  title: 'AI 资本开支验证',
  description: '重点看订单、出货和需求变化对 ETF 权重股的影响。',
}
```

写法要求：

- 每个数组建议 4 到 7 条。
- 短期影响因素关注几周到几个月内可能影响价格的变量。
- 风格特性描述结构性行为，例如弹性、集中度、估值敏感度、分红属性或周期暴露。
- `shortTermFactors.title` 要落在具体变量、验证点或传导抓手上，不要只写大而泛的行业名词。
- `shortTermFactors.description` 必须说明变量如何传导到 ETF 权重股的订单、收入、利润率、估值或资金预期，不要停留在“会带动需求”这类空话。
- `styleCharacteristics` 要解释 ETF 的交易属性和波动来源，而不是只贴标签；每条最好体现“为什么具备这种风格”和“这种风格会如何反映到价格行为”。

## 可选叙事字段

```jsx
story: '题材主轴围绕……',
tPrinciples: '做 T 以……',
tReferences: '参考节奏：……',
strategies: '适合看好……',
viewpoints: null,
```

写法要求：

- 字段值使用纯字符串或 `null`，不要使用 JSX。
- `tReferences: null` 时页面不会显示“做 T 参考”区块。
- `viewpoints` 没有真实观点来源时写 `null`。
