# K 线技术分析

## 目标

为 ETF 分析数据生成轻量、可直接消费的 K 线技术分析结果。最终只输出两类产物：

- `report.chartCaption`
- `kLineMarkers`

其中，`chartCaption` 负责收束判断和接下来 1 到 3 个交易日的推演；`kLineMarkers` 负责把蜡烛图、支撑压力、趋势线和关键信息位落到图上。

## 参考文档与职责

本文件是总控入口，分析时要结合以下四份子文档，而不是只看单一信号：

- `japanese-candlestick-skill.md`：识别单根和组合 K 线形态，负责“盘面语言”。
- `support-resistance-skill.md`：识别支撑位、压力位和突破/跌破有效性，负责“关键价格位置”。
- `trendline-skill.md`：识别上升线、下降线、横盘通道和趋势转折，负责“趋势结构”。
- `volume-price-relationship-skill.md`：识别放量、缩量、滞涨、回头确认等量价关系，负责“资金确认”。

分析时要按“形态 -> 位置 -> 趋势 -> 量能 -> 结论”的顺序收束，不要反过来先写结论再找理由。

## 数据来源

优先级：

1. 优先使用用户提供的 K 线数据、截图、表格、CSV、Excel 或网页链接。
2. 用户没有提供数据时，优先使用 `/api/skill/etf/base-data?code=<ETF_CODE>&klineLimit=90` 返回的基金最近 90 根日 K 线。
3. 如果只需要补 K 线数据，可使用基金 K 线接口：

```bash
curl "http://localhost:8000/api/basic/fund/kline?code=<ETF_CODE>&limit=120"
```

返回核心字段：

```text
date, open, close, high, low, volume, amount, amplitude, changePercent, changeAmount, turnoverRate
```

要求：

- 默认分析最近 90 根日 K 线；需要更长趋势时可取最近 120 根，但写入 `kLineData` 仍保留最近 90 根。
- 不要凭模型记忆编造最新行情、价格、日期和成交量。
- 如果接口不可用或数据不完整，说明缺失字段，不要写假点位。

## 分析流程

### 1. 先看蜡烛图

先用 `japanese-candlestick-skill.md` 判断最近 1 到 5 根 K 线的主导形态：

- 是否出现锤子线、倒锤子、十字星、吞没、孕线、长上影、长下影等。
- 这些形态出现在上涨、下跌还是震荡位置。
- 形态是否已经被后续 K 线确认。

蜡烛图只负责“发生了什么”，不负责独立下结论。

### 2. 再看关键位置

再用 `support-resistance-skill.md` 判断价格是否接近或触及：

- 前高、前低
- 平台上沿、平台下沿
- 跳空缺口
- 明显低点、高点
- 成交密集区
- 整数关口

关键位置决定形态的含义。相同的长下影，出现在支撑位附近和出现在下跌中继，意义不同。

### 3. 再看趋势结构

再用 `trendline-skill.md` 判断：

- 低点是否抬高，高点是否抬高
- 低点是否降低，高点是否降低
- 是否仍在上升趋势线内
- 是否跌破上升趋势线或突破下降趋势线
- 是否处于横盘箱体中

趋势线负责回答“当前结构是不是还完整”。如果结构已经破坏，单日形态的权重要降低。

### 4. 最后看量价关系

再用 `volume-price-relationship-skill.md` 做确认：

- 上涨是否放量，下跌是否缩量
- 突破是否放量，回踩是否缩量
- 高位是否放量滞涨
- 低位是否缩量止跌
- 是否出现回头确认、新量新价、有价无量、顶部放量等典型组合

量价关系负责回答“这次上涨或下跌有没有资金确认”。没有量能配合的突破，不要写得过强。

## 判断优先级

当多个信号同时出现时，优先级按以下规则裁决：

1. 位置优先于形态。形态相同，出现在支撑位、压力位、趋势线上，意义更强。
2. 结构优先于单日。趋势线和箱体被破坏后，单根阳线或阴线权重下降。
3. 量能优先于主观乐观。放量突破、放量破位、缩量回踩、缩量反弹要优先处理。
4. 确认优先于猜测。没有后续确认时，结论只能写为倾向，不能写死。
5. 风险信号优先于乐观信号。若高位长上影、放量滞涨、跌破支撑同时出现，优先提示风险。

## 点位计算口径

支撑位：

- 最近 20 到 90 根 K 线里的明显低点。
- 长下影最低点和收回位置。
- 前平台整理区下沿。
- 向上突破后的回踩确认位。

压力位：

- 最近 20 到 90 根 K 线里的明显高点。
- 长上影最高点和实体上沿。
- 前平台整理区上沿。
- 跌破后的反抽确认位。

趋势线：

- 上升趋势线使用两个或三个逐步抬高的低点。
- 下降趋势线使用两个或三个逐步降低的高点。
- 横盘箱体可拆成上下两条 `polyLines`。
- 点位必须使用 `date + price`，并且日期必须存在于 `kLineData`。

量价判断：

- 放量、缩量、巨量、地量要结合最近 5 日和 10 日均量对比。
- 只在价格靠近关键位置时才强调量能，否则不要把普通放量写成强信号。

## `chartCaption` 写法

`chartCaption` 不只是普通图注，它必须是 K 线技术分析的收束句。

写法要求：

- 基于 `kLineData` 最近 20 到 90 根日 K 线。
- 覆盖蜡烛图形态、趋势、量价关系、支撑位、压力位和关键折线。
- 建议写成 1 到 2 句，像交易员复盘，不要写成新闻摘要。
- 必须带对接下来 1 到 3 个交易日的推演，使用“偏强、偏弱、震荡、回踩、冲高回落、探底回升”等表达。
- 预测要保留不确定性，不能写“必涨、必跌、确定突破”。
- 如果 `kLineData` 不足以支持趋势判断，就明确写“趋势证据不足”，但仍要给出支撑压力和短线倾向。

推荐句式：

```js
chartCaption: '近期走势显示主线偏强但高位分歧加大，量能放大时容易出现冲高回落；接下来更像是围绕支撑位震荡换手，若不回补量能，短线以反复拉扯为主。'
```

`chartCaption` 里至少出现两个要素：

- 过去走势的核心判断，例如“主线偏强”“高位分歧”“缩量回踩”“放量破位”。
- 下一段行情推演，例如“接下来更偏震荡”“有回踩确认需求”“若放量突破则继续上行”。

## `kLineMarkers` 生成规则

把技术分析结果转换成页面能直接消费的对象：

- 蜡烛图形态写入 `candleMarkers`，例如锤子线、长上影、十字星；点位可不传 `price`，默认会吸附到当日高低点。
- 支撑位写入 `supportMarkers`，必须传 `date`、`price`、`position: 'below'`。
- 压力位写入 `resistanceMarkers`，必须传 `date`、`price`、`position: 'above'`。
- 关键事件或关键技术位写入 `keyInfoMarkers`，用于提示突破、破位、放量滞涨、探底回升等。
- 多段趋势线写入 `polyLines`，每条至少两个点，支持 `lineWidth`、`lineType`、`color`。
- `lineLength` 默认 `1`；需要更长指示线时用 `1.3` 到 `1.8`，不要过长遮挡 K 线。

示例：

```js
kLineMarkers: {
  candleMarkers: [{ date: '2026-05-29', label: '锤子线', position: 'below' }],
  supportMarkers: [{ date: '2026-05-29', price: 3.53, label: '支撑位', position: 'below' }],
  resistanceMarkers: [{ date: '2026-05-19', price: 3.82, label: '压力位', position: 'above' }],
  keyInfoMarkers: [{ date: '2026-05-28', label: '关键信息位', position: 'above', lineLength: 1.5 }],
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

## 最终输出产物

最终产物应当是一个可直接消费的技术分析结果，核心只包含：

```ts
{
  report: {
    chartCaption: string,
  },
  kLineMarkers: {
    candleMarkers: CandleMarker[],
    supportMarkers: PriceMarker[],
    resistanceMarkers: PriceMarker[],
    keyInfoMarkers: CandleMarker[],
    polyLines: PolyLineMarker[],
  },
}
```

输出要求：

- 不额外新增页面不消费的预测字段。
- 不把分析写成复杂量化报告，保持轻量。
- 如果数据不足，就把“趋势证据不足”写进 `chartCaption`，同时尽量保留支撑、压力和关键位信息。
- 如果没有足够依据生成某类 marker，就留空数组，不要编造。

