---
name: etf-analysis
description: Market Insight 项目专用的 ETF 分析工作流。通过本地 server 接口抓取 ETF 前十大持仓、持仓公司核心财务数据、基金最近 90 根日 K 线和板块拥挤度数据，整理为 frontend/src/data/etfs 使用的静态数据，并同步生成 K 线技术分析、板块拥挤度分析、画线参数和行情推演图注。仅当用户显式调用 $etf-analysis 或明确要求使用 ETF 分析 skill 时使用；不要因为上下文自动调用。
---

# ETF 分析

## 目标

生成或更新单个 ETF 的静态分析数据文件：

```text
frontend/src/data/etfs/etf<ETF_CODE>.jsx
```

输出结果必须匹配本 skill 定义的结构。页面只负责展示，不负责计算。

## 开始前检查

每次生成或更新前，必须先做：

1. 检查当前工作区改动，避免覆盖用户已有修改
2. 检查本地 server 是否在运行，接口是否可用，如果不可用则停止并提示用户启动 server
3. 读取本 skill 自带的完整参考结构和字段生成要求
4. 如需快速确认字段形状，再读取 TS 参考文件

如需用类型视角快速确认字段形状，可读取：

```text
.codex/skills/etf-analysis/references/etf-schema-reference.ts
```

注意：这份 TS 文件只做参考，不是运行时代码。

## 参考结构

输出文件统一使用 `.jsx`。

下面这份结构是本 skill 的唯一结构参考。缺什么字段、每个字段应该长什么样，都以这份示例为准。

```jsx
const etf588200 = {
  etf: {
    code: '588200',
    name: '科创芯片ETF',
    index: '上证科创板芯片指数',
    intro: '组合主要暴露在 GPU、AI ASIC、存储、先进封装和半导体材料环节，前十大权重决定了它更像高景气算力链的弹性组合，而不是分散化半导体宽基。',
    concepts: ['科创芯片', 'AI算力芯片', '先进封装', 'HBM'],
    scale: '386.07 亿元',
  },
  report: {
    date: '2026-06-02',
    author: '抖音 · ETF主线侦探',
    headlineSignal: '规模与流动性观察',
    heatScore: 4,
    coreJudgment: 'AI算力链中偏高弹性的芯片制造与配套组合',
    thesis: '这只 ETF 的收益弹性主要来自算力资本开支向芯片设计、晶圆制造、先进封装和高端存储链条的传导，而不是单纯依赖情绪交易。权重结构决定了它对上游订单、产能利用率、产品涨价和国产替代进展更敏感。若景气验证继续强化，龙头权重股的盈利兑现会直接抬升组合定价；若资本开支和订单预期回落，估值压缩通常也会更快反映到净值波动上。',
    callout: '组合本质是算力资本开支映射到芯片制造链的高弹性定价工具。',
    chartCaption: (
      <>
        <p>近 90 根日 K 线整体保持震荡抬升后的高位整固，前期快速拉升把价格推升到阶段高位，随后量能回落、振幅收敛，说明短线从情绪驱动转向分歧消化。当前价格仍运行在中期均线之上，但进攻斜率已经放缓，资金更关注高位筹码交换后的承接质量。</p>
        <p>短线关键支撑先看最近两次回踩确认的密集成交区，若失守则容易回到前一轮放量启动平台；上方压力则集中在前高附近和放量长上影区间，只有重新放量站稳，才说明趋势资金愿意继续抬升估值。均线结构尚未走坏，但需要警惕缩量反抽后的再度回踩。</p>
        <p>接下来 1 到 3 个交易日更可能围绕支撑与前高之间做震荡换手：如果放量突破压力位，短线有继续向上试探的空间；如果缩量上冲无果或跌破支撑，行情大概率回到平台整理，操作节奏更适合等回踩确认，而不是在情绪拉升阶段盲目追价。</p>
      </>
    ),
    congestionCaption: (
      <>
        <p>最近这条拥挤度线更像是资金在板块之间重新排座位，成交额占比抬得快不快、回落得快不快，直接决定这条主线是继续被追，还是只是短线轮动一下就散。</p>
        <p>如果最近几天的占比持续抬升，说明主题资金还在往这个方向集中；如果占比冲高后很快回落，就说明追进去的资金开始分歧，板块更像在高位换手而不是继续扩散。</p>
        <p>接下来 1 到 3 个交易日，拥挤度更常见的节奏通常是先继续抬一段、先横一横，或者冲高后回吐一点再观察承接。分析时要先自己调用接口，再结合最新几天的占比变化写判断，不要直接套模板。</p>
      </>
    ),
    hiddenStoryLine: '如果国产算力生态从单点突破走向整机、存储、封装和材料协同放量，市场很容易把这类 ETF 从“景气主题”进一步交易成“国产替代基础设施”的长期叙事。',
    disclaimer: '仅供参考，不构成任何投资建议；市场有风险，决策需谨慎，风险自负。',
    risks: [
      {
        title: '资本开支回落风险',
        description: '若云厂商和大模型厂商下修算力投入，芯片、封装和材料链的订单预期会先于业绩下修。',
      },
      {
        title: '估值压缩风险',
        description: '高景气赛道一旦进入验证空窗期，市场会先交易估值回落，净值波动通常快于基本面变化。',
      },
      {
        title: '权重集中风险',
        description: '龙头权重占比较高，单一公司订单、良率或产品价格波动会被直接放大到组合表现。',
      },
    ],
  },
  metrics: [
    { label: '基金规模', value: '386.07 亿元', note: '资金流动性' },
    { label: '盈利增速', value: '251.90%', note: '持仓盈利增速估算' },
    { label: 'ROE', value: '6.06%', note: '持仓加权 ROE 估算' },
    { label: '业务增速', value: '114.91%', note: '持仓业务增速估算' },
  ],
  recentFiveDayAmplitude: '5.76%',
  businessRatio: [
    {
      type: 'AI算力与通用计算芯片',
      rate: 29.18,
      desc: '这部分决定组合对算力资本开支和高端芯片景气度的直接敏感性，是最核心的业绩弹性来源。',
      subItems: [
        { type: 'GPU / AI ASIC', rate: 15.32 },
        { type: '国产通用CPU', rate: 8.67 },
        { type: '边缘与专用处理器', rate: 5.19 },
      ],
    },
    {
      type: '先进封装与制造配套',
      rate: 24.46,
      desc: '封装、测试和制造配套承担产能扩张与良率提升的兑现路径，是算力需求外溢到产业链中游的重要抓手。',
      subItems: [
        { type: 'CoWoS / 2.5D封装', rate: 11.24 },
        { type: '测试与制造服务', rate: 8.02 },
        { type: '设备与材料配套', rate: 5.2 },
      ],
    },
    {
      type: '高端存储与互连材料',
      rate: 18.33,
      desc: 'HBM、存储和高速互连材料决定算力系统瓶颈环节的扩产节奏，既影响景气验证，也影响估值溢价。',
    },
    {
      type: '其他芯片相关成分',
      rate: 28.03,
      desc: '剩余成分分布在设计服务、模拟器件、特色工艺和半导体材料等环节，提供补充暴露。',
    },
  ],
  shortTermFactors: [
    {
      title: '算力资本开支验证',
      description: '重点跟踪云厂商和大模型厂商的 GPU、服务器和数据中心投入是否继续上修，因为预算兑现会先传导到芯片、封装和存储链订单预期，再反映到权重股估值抬升。',
    },
    {
      title: '上游供给与交付节奏',
      description: '若晶圆、封装和高端存储的供给仍偏紧，交付周期延长通常意味着需求没有降温，市场会据此上修未来几个季度的收入兑现节奏。',
    },
    {
      title: '产品价格与良率变化',
      description: '高端芯片、先进封装和存储产品价格若维持强势，同时良率持续提升，利润率弹性会快于收入释放，市场往往会提前交易盈利上修。',
    },
    {
      title: '国产替代订单落地',
      description: '若核心客户导入国产芯片、封装或材料方案，订单质量会从主题叙事转为真实收入来源，这类验证通常会显著改变市场对组合中长期溢价的定价方式。',
    },
  ],
  styleCharacteristics: [
    {
      title: '龙头权重驱动明显',
      description: '组合表现高度依赖少数龙头公司订单和盈利兑现，权重集中意味着上涨时弹性更强，但一旦龙头预期松动，净值回撤也会快于宽基。',
    },
    {
      title: '成长估值敏感度高',
      description: '这类 ETF 的定价不仅看当期利润，更看未来几个季度的景气延续和资本开支斜率，因此估值切换和预期修正对价格的影响通常早于财报落地。',
    },
    {
      title: '主题资金参与度高',
      description: '当市场主线集中在 AI 算力时，增量资金更容易把这类组合作为高弹性映射工具，成交放大时上行斜率会更陡，但缩量后也更容易进入平台震荡。',
    },
    {
      title: '基本面与情绪共振',
      description: '组合既受订单、产能和利润率驱动，也受主线情绪强化影响；一旦两者共振，上涨效率很高，但若情绪先降温，回撤速度也会快于基本面恶化本身。',
    },
  ],
  kLineData: [
    {
      date: '2026-05-28',
      open: 42.66,
      close: 41.2,
      low: 38.39,
      high: 43.35,
      volume: 6452849,
      amount: 678213657,
      amplitude: 1.69,
      maxDrawdown: -2.84,
      changePercent: -1.97,
      changeAmount: -0.021,
      turnoverRate: 3.14,
    },
  ],
  kLineMarkers: {
    candleMarkers: [
      { date: '2026-05-29', label: '锤子线', position: 'below', lineLength: 1 },
    ],
    supportMarkers: [
      { date: '2026-05-22', price: 39.53, label: '支撑位', position: 'below', lineLength: 1 },
    ],
    resistanceMarkers: [
      { date: '2026-05-19', price: 43.82, label: '压力位', position: 'above', lineLength: 1 },
    ],
    keyInfoMarkers: [
      { date: '2026-05-28', label: '关键信息位', position: 'above', lineLength: 1.5, lineWidth: 0.6, fontSize: 7 },
    ],
    polyLines: [
      {
        points: [
          { date: '2026-05-25', price: 43.91 },
          { date: '2026-05-28', price: 42.82 },
          { date: '2026-06-02', price: 39.49 },
        ],
        lineWidth: 1.1,
        lineType: 'dashed',
        color: '#1b365d',
      },
    ],
  },
  financialRows: [
    {
      code: '300308',
      name: '中际旭创',
      weight: 13.66,
      productTags: ['800G光模块', '数据中心互联', '硅光配套'],
      intro: '组合中最直接映射高速光互联景气度的核心权重之一，订单与产品升级节奏影响净值弹性。',
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
    },
  ],
  viewpoints: [],
};

export default etf588200;
```

## 字段生成要求

### 顶层要求

- `report` 必须存在。
- `metrics` 固定为 4 项：基金规模、盈利增速、ROE、业务增速。
- `businessRatio`、`shortTermFactors`、`styleCharacteristics`、`kLineData`、`financialRows` 必须是数组。
- `kLineMarkers` 必须是对象，包含 `candleMarkers`、`supportMarkers`、`resistanceMarkers`、`keyInfoMarkers`、`polyLines`。
- `viewpoints` 没有可靠事件时写 `[]`，不要写 `null`。
- `report.chartCaption` 和 `report.congestionCaption` 是允许使用 JSX 的叙事字段；其他叙事字段使用纯字符串或数组对象。

### `etf`

- `intro` 用 1 到 2 句概括 ETF 的核心暴露、权重结构和适用场景。
- `concepts` 只写真实相关概念，不堆砌标签。
- `scale` 使用亿元，保留两位小数，例如 `386.07 亿元`。

### `report`

- `headlineSignal` 适合头部展示，简短中性，不写口号。
- `coreJudgment` 用一句短判断概括 ETF 的核心暴露和定价方向。
- `heatScore` 为头部评分，使用 number 类型，取值范围 0.5 到 5，按 0.5 递进，页面直接读取展示，不在前端重新计算。
- `thesis` 要像研究摘要，不是宣传语，也不是复述指数名称。
- `callout` 不是“一句话看法”，不要使用“总结：”“一句话看法：”“核心结论：”“这只ETF适合……”等固定开头。
- `hiddenStoryLine` 写市场可能炒作的未来叙事，不写成财务总结或行业百科，长度控制在 100 到 160 个汉字。
- `risks` 写真实风险来源，不写空泛的“市场波动风险”。

### `businessRatio`

- `rate` 使用 number。
- 分组要让用户能快速理解组合暴露。
- 如果分组没有覆盖全部权重，增加“其他”分组承接剩余暴露。
- `desc` 要解释这个分组对 ETF 定价的意义，不只是描述行业。

### `financialRows`

接口字段映射：

- `stock_code` -> `code`
- `stock_name` -> `name`
- `hold_rate` -> `weight`
- `quarter_data[].main_grow` -> `mainBusinessGrowthRate` 和 `revenueGrowthRate`
- `quarter_data[].net_rate` -> `netProfitMargin`
- `quarter_data[].gross_rate` -> `grossProfitMargin`
- `quarter_data[].profit_grow` -> `nonNetProfitGrowthRate`
- `quarter_data[].roe` -> `roe`

写法要求：

- `productTags` 写真实产品、业务线或产业链环节，不写空泛行业词。
- `intro` 要短，适合页面表格展示。
- `quarter` 使用 `1`、`2`、`3`、`4`。

### `kLineData`

- 保留最近 90 根日 K 线。
- 字段保留 `date`、`open`、`close`、`low`、`high`、`volume`、`amount`、`amplitude`、`maxDrawdown`、`changePercent`、`changeAmount`、`turnoverRate`。
- 所有数值字段保持 number，不转字符串。

### 核心文案

以下 4 组字段直接决定页面专业度，不能写成模板化、口号化或过度泛化的文案。

#### `report.thesis`

- 用 2 到 4 句完成整个 ETF 研究的核心论证。
- 必须说明：
  - ETF 主要暴露在哪些产业链环节或资产类型。
  - 权重结构决定了它的收益弹性来自哪里。
  - 它更适合跟踪什么样的产业趋势、资本开支周期、政策周期或盈利兑现节奏。
- 语气要像研究摘要，强调“暴露结构、驱动因子、交易前提”。
- 不要写“这个 ETF 很不错”“适合长期看好”“景气度高”这类空话。

#### `report.callout`

- 这是整篇 ETF 研究的高密度概括，不是用户提醒语。
- 直接进入判断，概括组合性质、驱动条件和交易约束。
- 长度控制在 100 到 160 个汉字。
- 不要使用固定开头模板，不要写成口语化提醒。

#### `shortTermFactors`

- 建议 4 到 7 条。
- 只写未来 1 到 4 周最可能影响基金 / 股票走势的重要事件和催化因素。
- 优先分析宏观、政策、行业级事件，优先选择市场正在交易的叙事。
- 不要输出单个公司经营层面的假设性预测，不要讨论具体企业订单、产能利用率、毛利率变化等微观因素。
- `title` 要落在具体事件、变量、验证点或传导抓手上，不要只写泛行业名词。
- `description` 必须说明：
  - 事件影响产业链的哪个环节。
  - 如何传导到 ETF 权重股的订单、收入、利润率或估值。
  - 市场为什么会提前交易这个变量。
  - 利多或利空方向。
- 重点关注以下几类因素：
  - 宏观因素：美联储议息会议、美国 CPI / PPI、非农就业数据、美债收益率变化、美元指数走势、原油价格波动、黄金价格波动、地缘政治事件、全球风险偏好变化。
  - 政策因素：国内稳增长政策、财政刺激政策、科技产业扶持政策、半导体自主可控政策、AI 产业政策、新能源产业政策。
  - 行业催化：行业龙头财报、龙头公司业绩指引、行业大会、新产品发布、产业链景气度变化、行业价格周期变化。
  - 资金面因素：北向资金流向、ETF 资金申赎、两融余额变化、市场风险偏好切换。
- 不要写“会带动需求”“会影响业绩”这类空泛句式，要把事件如何被市场交易说清楚。

#### `styleCharacteristics`

- 建议 4 到 7 条。
- 这里写的是 ETF 或股票的历史走势特征、交易属性和定价结构，不是简单贴风格标签。
- 先判断波动特征，再判断敏感因子、资金风格、市场表现特征和相关资产。
- 重点描述以下五类信息：
  - 波动特征：高波动成长风格、中等波动趋势风格、防御型低波动风格、周期型高弹性风格等。
  - 敏感因子：AI 主题情绪、半导体景气周期、美债收益率、纳斯达克指数、原油价格、黄金价格、人民币汇率、政策预期、地缘政治风险等。
  - 资金风格：机构主导、游资主导、主题资金驱动、趋势资金驱动、价值资金驱动等。
  - 市场表现特征：上涨时弹性是否大于宽基、回撤是否放大、是否容易连续趋势、是否容易受事件驱动快速拉升、是否横盘较久后突破加速、高换手高波动特征是否明显。
  - 与什么资产相关性最高：纳斯达克指数、费城半导体指数、黄金价格、原油价格、十年期美债收益率、创业板指数、科创50 指数等。
- 每条都要解释“为什么具备这种风格”，以及“这种风格如何反映到价格行为”。
- 避免只写“成长风格”“机构偏好”等空泛标签，必须补充驱动逻辑和价格后果。

### 展示字段计算

下列字段必须在 skill 内算好：

- `recentFiveDayAmplitude`

计算要求：

- `metrics[0]` 基金规模：使用 `fetch_fund_snapshot` 返回的流通市值换算成亿元。
- `metrics[1]` 盈利增速：来自 `financialRows[].data[0].nonNetProfitGrowthRate` 的加权结果。
- `metrics[2]` ROE：来自 `financialRows[].data[0].roe` 的加权结果。
- `metrics[3]` 业务增速：来自 `financialRows[].data[0].mainBusinessGrowthRate` 的加权结果。
- 最近 5 日振幅只写平均值，格式如 `5.67%`。

### `metrics` 字段生成要求

`metrics` 必须严格按以下数据格式生成：

```js
metrics: [
  { label: '基金规模', value: '386.07 亿元', note: '资金流动性' },
  { label: '盈利增速', value: '251.90%', note: '持仓盈利增速估算' },
  { label: 'ROE', value: '6.06%', note: '持仓加权 ROE 估算' },
  { label: '业务增速', value: '114.91%', note: '持仓业务增速估算' },
]
```

- `label` 为固定字段，不得改名，不得改值，顺序也不得调整。
- `note` 为固定字段，不得改名，不得改值，顺序也不得调整。
- `value` 按真实数据计算并保留两位小数。
- `metrics` 必须始终包含 4 项，且仅包含以上 4 项。
- 不能新增其他 label，也不能删减任意一项。

权重指标计算规则：

1. 只使用最新一期财务数据存在的持仓。
2. 先取原始值数组，计算 p10 和 p90。
3. 每个值裁剪到 `[p10, p90]` 后按 `weight` 加权。
4. 用 `sum(clippedValue * weight) / sum(weight)` 得到结果。
5. 展示值保留两位小数并加 `%`。

其中，`metrics[0]` 的 `value` 单位为亿元，格式必须是 `xx.xx 亿元`；其余三项格式必须是 `xx.xx%`。

K 线指标计算规则：

1. `recentFiveDays = kLineData.slice(-5)`。
2. 单日振幅优先使用接口返回的 `amplitude`；缺失时用 `(high - low) / low * 100`。
3. 平均振幅保留两位小数。
4. `maxDrawdown` 直接保留接口返回值并写入每条 `kLineData`，不要在 skill 中额外生成顶层 `recentTenDayMaxDrawdown` 或 `recentTenDayMaxDrawdownDate`。

## K 线技术分析

生成或更新 ETF 数据时，必须按 `references/kline-technical-analysis.md` 执行技术分析，并写入：

- `report.chartCaption`
- `report.congestionCaption`
- `kLineMarkers.candleMarkers`
- `kLineMarkers.supportMarkers`
- `kLineMarkers.resistanceMarkers`
- `kLineMarkers.keyInfoMarkers`
- `kLineMarkers.polyLines`

`report.chartCaption` 要求：

- 必须是 JSX 片段，每个 p 元素都必须显式加上 style={{ textIndent: '2em' }}。
- 必须分成 3 段。
- 每段控制在 80 到 160 个汉字之间。
- 语言要偏口语化，面向小白读者，不要堆太多券商研报式术语。
- 第 1 段写“最近涨跌、量能和整体感觉”，用容易理解的话解释当前走势。
- 第 2 段写关键支撑、压力、均线或形态变化，但必须顺手解释这些位置意味着什么。
- 第 3 段写接下来 1 到 3 个交易日的推演和操作节奏，用“可能先震荡、可能回踩、如果放量再看上行”这类简单表达。
- 可以保留少量技术词，但必须给出白话解释；不要只下结论不展开。

## 板块拥挤度分析

`report.congestionCaption` 用来描述当前 ETF 对应板块的拥挤度变化，写法要和 K 线图注区分开。

生成时必须先自己调用板块拥挤度接口：

```bash
curl "http://localhost:8000/api/skill/sector/congestion?themeKeys=<THEME_KEYS>&days=90"
```

要求：

- `themeKeys` 必须使用当前 ETF 对应主题的 key，多个 key 用英文逗号分隔。
- 必须根据接口返回的最新日期、最近几天占比变化和绝对占比位置来写判断。
- 先写“为什么这条线现在拥挤”，再写“是继续拥挤还是开始降温”，最后写“接下来 1 到 3 个交易日更像哪种节奏”。
- 文案要解释成交额占比变化对板块热度和资金持续性的含义，不要直接复述接口字段。
- 仍然使用 3 段左右的 JSX 图注，每段尽量口语化、适合直接放在图表下方。

推荐写法：

```jsx
congestionCaption: (
  <>
    <p style={{ textIndent: '2em' }}>...</p>
    <p style={{ textIndent: '2em' }}>...</p>
    <p style={{ textIndent: '2em' }}>...</p>
  </>
)
```

## 工作流程

1. 抓取前输出：
   - `调用参数：...`
   - `调用接口：...`
2. 通过本地 server 接口抓取 ETF 基础数据：

```bash
curl "http://localhost:8000/api/skill/etf/base-data?code=<ETF_CODE>&klineLimit=90"
```

3. 接口成功后输出：
   - `xx 接口调用已完成`
   - `xx 数据成功获取`
4. 接口失败后立即停止，并输出：
   - `调用接口失败，参数是 xx`
5. 基于返回 JSON 生成最终数据文件。
6. 生成后只做只读检查，不运行 preview、build、test、lint 或自校验命令。

## 覆盖规则

- 写文件前先检查目标文件是否已存在。
- 如果目标文件已存在，必须先询问用户是否覆盖，未得到确认前不要改写原文件。
- 只有新文件不存在时，才可以直接创建。

## 抓取约束

- 多个 ETF 必须按代码逐个串行处理。
- 禁止并行请求多个 `/api/skill/etf/base-data`。
- 禁止用 shell 循环或一条命令连续请求多个 ETF。
- 无法取数时说明原因，不要编造数据。

## 生成要求

基于接口返回 JSON 生成最终 JSX 数据文件时：

- 输出文件为 `frontend/src/data/etfs/etf<ETF_CODE>.jsx`。
- 顶层变量名为 `etf<ETF_CODE>`，例如 `etf515880`。
- 补全 `etf.name`、`etf.index`、`etf.intro`、`etf.concepts`、`etf.scale`。
- 补全 `report`。
- 根据真实业务暴露生成 `businessRatio`，并补全 `desc` 和必要的 `subItems`。
- 将持仓整理成 `financialRows`，为每个持仓补全 `productTags` 和 `intro`。
- 将基金 K 线直接写入 `kLineData`，保留最近 90 根数据。
- `kLineData` 中保留接口返回的 `maxDrawdown`。
- 计算并写入 `metrics`、`recentFiveDayAmplitude`。
- 补全 `shortTermFactors` 和 `styleCharacteristics`，不得套固定模板。
- `viewpoints` 没有可靠事件时写 `[]`。
- 不保留接口返回中的辅助字段，例如 `source`、`fetched_at`、`target_quarter_end`、`report_type`、`position_report`、`holdings`。
- `recentTenDayAmplitudeComment` 和 `recentTenDayMaxDrawdownComment` 必须存在且必须有内容，不能留空、null 或省略。

## 总体分析原则

- 定量字段优先基于抓取数据：持仓、权重、`financialRows`、`kLineData`。
- 定性分析必须基于持仓公司的真实业务暴露，不要只根据 ETF 名称推断。
- `businessRatio` 的权重要和持仓权重保持可解释一致性。
- 文案使用研究摘要式中文，重点写产业链暴露、驱动变量、传导逻辑和交易约束。
- 缺少来源时，不要编造精确规模、指数代码或财务数值。

## 参考

- K 线技术分析、支撑压力、折线和 `chartCaption` 生成规则见 `references/kline-technical-analysis.md`。
- 字段形状的 TS 参考见 `references/etf-schema-reference.ts`。
持仓盈利增速估算
