# K 线技术分析

## 目标

为 ETF 分析数据生成轻量 K 线技术分析，并输出页面可直接消费的 `kLineMarkers` 和 `report.chartCaption`。

技术分析必须服务于 `frontend/src/pages/EtfReport.jsx` 的 K 线图展示：

- `chartCaption`：技术分析总结，并带接下来 1 到 3 个交易日的行情推演。
- `candleMarkers`：蜡烛图形态标记。
- `supportMarkers`：支撑位标记。
- `resistanceMarkers`：压力位标记。
- `keyInfoMarkers`：关键技术信息位。
- `polyLines`：多段折线。

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

## 分析方法

保持轻量，不要写成复杂量化报告。重点看：

- 日本蜡烛图：十字星、锤头线、倒锤头、吞没、孕线、长上影、长下影、乌云盖顶、刺透、早晨之星、黄昏之星等。
- 趋势：最近高低点是否抬高或降低，是否处于上升、下降、震荡、反弹或回踩。
- 均线辅助：可计算或估算 MA5、MA10、MA20；只作为趋势辅助，不要堆太多指标。
- 支撑压力：用近期明显低点、高点、跳空缺口、长影线位置、平台密集成交区和整数关口。
- 量价关系：上涨放量、下跌缩量、放量滞涨、缩量回踩、放量破位、长下影承接等。
- 风险信号：高位长上影、放量阴线、跌破平台、反抽不过前高、缩量反弹。

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

折线：

- 上升折线使用两个或三个逐步抬高的低点。
- 下降折线使用两个或三个逐步降低的高点。
- 箱体线使用横向平台的上沿和下沿，可拆成上下两条 `polyLines`。
- 点位必须使用 `date + price`，并且日期必须存在于 `kLineData`。

预测：

- 以最近收盘价、近 5 日波动、关键支撑压力和当日量价行为推演。
- 只写入 `chartCaption` 的行情推演，不额外新增页面不消费的预测字段。
- 预测是技术推演，不要表述成确定性结果。

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
