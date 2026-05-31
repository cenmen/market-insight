import BaseKLineChart from '../../components/charts/BaseKLineChart'
import BasePieChart from '../../components/charts/BasePieChart'
import etf515880 from '../../data/etf515880'
import styles from './index.module.css'

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

export default function EtfReportPage() {
  const data = etf515880
  const pieData = data.businessRatio.map(function mapBucket(item) {
    return {
      name: item.type,
      value: Number(item.rate.toFixed(2)),
    }
  })

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
          <h2 className={styles.sectionTitle}>业务分布</h2>
          <div className={styles.distribution}>{data.businessRatio.map(renderBucket)}</div>
          <figure className={styles.chartFrame}>
            <BasePieChart data={pieData} title='主题业务占比' height={336} />
            <figcaption className={styles.figcaption}>持仓业务分布示意（按权重口径汇总）</figcaption>
          </figure>
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
            <BaseKLineChart data={data.kLineData} height={364} />
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
