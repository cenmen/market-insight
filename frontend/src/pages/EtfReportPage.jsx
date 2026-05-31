import etf515880 from '../data/etf515880'
import styles from './EtfReportPage.module.css'

function formatRate(rate) {
  return `${Number(rate).toFixed(2)}%`
}

function getLatestFinancial(row) {
  return row.data?.[0] ?? {}
}

function renderConcept(concept) {
  return (
    <span className={styles.tag} key={concept}>
      {concept}
    </span>
  )
}

function renderMetric(metric) {
  return (
    <div className={styles.metric} key={metric.label}>
      <div className={styles.metricValue}>{metric.value}</div>
      <div className={styles.metricLabel}>{metric.label}</div>
    </div>
  )
}

function renderFactor(item) {
  return (
    <li key={item.title}>
      <strong>{item.title}：</strong>
      {item.description}
    </li>
  )
}

function renderBucket(item) {
  return (
    <div className={styles.bucket} key={item.type}>
      <div className={styles.bucketHead}>
        <span>{item.type}</span>
        <span className={styles.bucketPercent}>{formatRate(item.rate)}</span>
      </div>
      <div className={styles.bucketDesc}>{item.desc}</div>
    </div>
  )
}

function renderProductTag(tag) {
  return (
    <span className={styles.miniTag} key={tag}>
      {tag}
    </span>
  )
}

function renderHolding(row) {
  const financial = getLatestFinancial(row)

  return (
    <tr key={row.code}>
      <td>{row.code}</td>
      <td>
        <strong>{row.name}</strong>
      </td>
      <td className={styles.num}>{formatRate(row.weight)}</td>
      <td>{row.intro}</td>
      <td>
        <div className={styles.tagList}>{row.productTags.map(renderProductTag)}</div>
      </td>
      <td className={styles.num}>{formatRate(financial.roe ?? 0)}</td>
    </tr>
  )
}

function renderRisk(risk) {
  return (
    <div className={styles.riskItem} key={risk.title}>
      <div className={styles.riskLabel}>{risk.title}</div>
      <div className={styles.riskDesc}>{risk.description}</div>
    </div>
  )
}

function renderEvent(viewpoint) {
  return (
    <div className={styles.event} key={`${viewpoint.title}-${viewpoint.date}`}>
      <div className={styles.eventTitle}>{viewpoint.title}</div>
      <div className={styles.eventDate}>{viewpoint.date} 00:00:00</div>
    </div>
  )
}

function getChartDomain(data) {
  const lows = data.map(function mapLow(item) {
    return item.low
  })
  const highs = data.map(function mapHigh(item) {
    return item.high
  })
  const volumes = data.map(function mapVolume(item) {
    return item.volume
  })

  return {
    minPrice: Math.min(...lows),
    maxPrice: Math.max(...highs),
    maxVolume: Math.max(...volumes),
  }
}

function makePriceScale(minPrice, maxPrice, top, height) {
  return function scalePrice(value) {
    return top + ((maxPrice - value) / (maxPrice - minPrice)) * height
  }
}

function makeVolumeScale(maxVolume, top, height) {
  return function scaleVolume(value) {
    return top + height - (value / maxVolume) * height
  }
}

function KLineChart({ data }) {
  const width = 1080
  const priceTop = 30
  const priceHeight = 210
  const volumeTop = 258
  const volumeHeight = 44
  const left = 50
  const right = 18
  const chartWidth = width - left - right
  const candleWidth = 8
  const domain = getChartDomain(data)
  const priceScale = makePriceScale(domain.minPrice, domain.maxPrice, priceTop, priceHeight)
  const volumeScale = makeVolumeScale(domain.maxVolume, volumeTop, volumeHeight)
  const step = chartWidth / Math.max(data.length - 1, 1)
  const gridValues = [1.0, 1.2, 1.4, 1.6, 1.8]
  const dateMarkers = data.filter(function filterDateMarker(_, index) {
    return index % 8 === 0
  })

  function renderGrid(value) {
    const y = priceScale(value)

    return (
      <g key={value}>
        <line className={styles.axis} x1={left} x2={width - right} y1={y} y2={y} />
        <text className={styles.axisLabel} x={18} y={y + 4}>
          {value.toFixed(1)}
        </text>
      </g>
    )
  }

  function renderDateMarker(item) {
    const index = data.indexOf(item)
    const x = left + index * step

    return (
      <text className={styles.axisLabel} x={x - 28} y={324} key={item.date}>
        {item.date.slice(5)}
      </text>
    )
  }

  function renderCandle(item, index) {
    const x = left + index * step
    const openY = priceScale(item.open)
    const closeY = priceScale(item.close)
    const highY = priceScale(item.high)
    const lowY = priceScale(item.low)
    const bodyY = Math.min(openY, closeY)
    const bodyHeight = Math.max(Math.abs(openY - closeY), 3)
    const isUp = item.close >= item.open
    const volumeY = volumeScale(item.volume)
    const volumeHeightValue = volumeTop + volumeHeight - volumeY

    return (
      <g key={item.date}>
        <line className={isUp ? styles.wickUp : styles.wickDown} x1={x} x2={x} y1={highY} y2={lowY} />
        <rect
          className={isUp ? styles.candleUp : styles.candleDown}
          x={x - candleWidth / 2}
          y={bodyY}
          width={candleWidth}
          height={bodyHeight}
        />
        <rect
          className={isUp ? styles.volumeUp : styles.volumeDown}
          x={x - candleWidth / 2}
          y={volumeY}
          width={candleWidth}
          height={volumeHeightValue}
        />
      </g>
    )
  }

  return (
    <svg className={styles.chart} viewBox={`0 0 ${width} 340`} role="img" aria-label="通信ETF K线技术分析">
      {gridValues.map(renderGrid)}
      {data.map(renderCandle)}
      {dateMarkers.map(renderDateMarker)}
    </svg>
  )
}

export default function EtfReportPage() {
  const data = etf515880

  return (
    <main className={styles.page}>
      <article className={styles.report}>
        <header className={styles.reportHeader}>
          <div className={styles.tickerBlock}>
            <div className={styles.tickerEyebrow}>ETF ANALYSIS</div>
            <h1 className={styles.tickerName}>
              {data.etf.name} <span className={styles.tickerCode}>{data.etf.code}</span>
            </h1>
            <div className={styles.tickerSub}>
              {data.etf.index} · {data.report.coreJudgment}
            </div>
          </div>
          <div className={styles.priceBlock}>
            <div className={styles.priceCurrent}>{data.etf.scale}</div>
            <div className={styles.priceChange}>{data.report.headlineSignal}</div>
            <div className={styles.priceDate}>{data.report.date}</div>
          </div>
        </header>

        <div className={styles.tags}>{data.etf.concepts.map(renderConcept)}</div>
        <section className={styles.metrics}>{data.metrics.map(renderMetric)}</section>

        <section>
          <h2 className={styles.sectionTitle}>投资逻辑</h2>
          <p className={styles.paragraph}>{data.report.thesis}</p>
          <div className={styles.callout}>{data.report.callout}</div>
        </section>

        <section>
          <h2 className={styles.sectionTitle}>短期影响因素</h2>
          <ol className={styles.orderedList}>{data.shortTermFactors.map(renderFactor)}</ol>
        </section>

        <section>
          <h2 className={styles.sectionTitle}>风格特征</h2>
          <ol className={styles.orderedList}>{data.styleCharacteristics.map(renderFactor)}</ol>
        </section>

        <section>
          <h2 className={styles.sectionTitle}>主题业务分布</h2>
          <div className={styles.distribution}>{data.businessRatio.map(renderBucket)}</div>
        </section>

        <section>
          <h2 className={styles.sectionTitle}>持仓明细</h2>
          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>代码</th>
                  <th>名称</th>
                  <th className={styles.num}>持仓占比</th>
                  <th>简介</th>
                  <th>产品标签</th>
                  <th className={styles.num}>ROE</th>
                </tr>
              </thead>
              <tbody>{data.financialRows.map(renderHolding)}</tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className={styles.sectionTitle}>技术观察</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>信号</th>
                <th className={styles.num}>读数</th>
                <th>用途</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>最近 5 日振幅</td>
                <td className={styles.num}>{data.recentFiveDayAmplitude}</td>
                <td>用于观察短线波动空间</td>
              </tr>
              <tr>
                <td>最近 10 日最大跌幅</td>
                <td className={styles.num}>{data.recentTenDayMaxDrawdown}</td>
                <td>用于观察短线回撤压力，日期：{data.recentTenDayMaxDrawdownDate}</td>
              </tr>
            </tbody>
          </table>
          <figure className={styles.chartFrame}>
            <KLineChart data={data.kLineData} />
            <figcaption className={styles.figcaption}>{data.report.chartCaption}</figcaption>
          </figure>
        </section>

        <section>
          <h2 className={styles.sectionTitle}>跟踪事件</h2>
          <div className={styles.eventList}>{data.viewpoints.map(renderEvent)}</div>
        </section>

        <section>
          <h2 className={styles.sectionTitle}>风险提示</h2>
          <div className={styles.riskGrid}>{data.report.risks.map(renderRisk)}</div>
        </section>

        <footer className={styles.reportFooter}>
          <span>{data.report.disclaimer}</span>
          <span>
            {data.report.author} · {data.report.date}
          </span>
        </footer>
      </article>
    </main>
  )
}
