import BaseKLineChart from '@/components/charts/BaseKLineChart';
import BasePieChart from '@/components/charts/BasePieChart';
import EventTimeline from '@/components/EventTimeline';
import etf515880 from '@/data/etf515880';
import styles from './index.module.css';

function formatRate(rate) {
  return `${Number(rate).toFixed(2)}%`;
}

function getLatestFinancial(row) {
  return row.data?.[0] ?? {};
}

function formatQuarter(financial) {
  if (!financial.year || !financial.quarter) {
    return '--';
  }
  return `${financial.year}Q${financial.quarter}`;
}

export default function EtfReportPage() {
  const data = etf515880;
  const pieData = data.businessRatio.map(function mapBucket(item) {
    return {
      name: item.type,
      value: Number(item.rate.toFixed(2)),
    };
  });

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

        <div className={styles.tags}>
          {data.etf.concepts.map(function mapConcept(concept) {
            return (
              <span className={styles.tag} key={concept}>
                {concept}
              </span>
            );
          })}
        </div>
        <section className={styles.metrics}>
          {data.metrics.map(function mapMetric(metric) {
            return (
              <div className={styles.metric} key={metric.label}>
                <div className={styles.metricLabel}>{metric.label}</div>
                <div className={styles.metricValue}>{metric.value}</div>
                <div className={styles.metricNote}>{metric.note}</div>
              </div>
            );
          })}
        </section>

        <section>
          <h2 className={styles.sectionTitle}>投资逻辑</h2>
          <p className={styles.paragraph}>{data.report.thesis}</p>
          <div className={styles.callout}>{data.report.callout}</div>
        </section>

        <section>
          <h2 className={styles.sectionTitle}>短期影响因素</h2>
          <ol className={styles.orderedList}>
            {data.shortTermFactors.map(function mapFactor(item) {
              return (
                <li key={item.title}>
                  <strong>{item.title}：</strong>
                  {item.description}
                </li>
              );
            })}
          </ol>
        </section>

        <section>
          <h2 className={styles.sectionTitle}>风格特征</h2>
          <ol className={styles.orderedList}>
            {data.styleCharacteristics.map(function mapCharacteristic(item) {
              return (
                <li key={item.title}>
                  <strong>{item.title}：</strong>
                  {item.description}
                </li>
              );
            })}
          </ol>
        </section>

        <section>
          <h2 className={styles.sectionTitle}>业务分布</h2>
          <div className={styles.distribution}>
            {data.businessRatio.map(function mapBucket(item) {
              return (
                <div className={styles.bucket} key={item.type}>
                  <div className={styles.bucketHead}>
                    <span>{item.type}</span>
                    <span className={styles.bucketPercent}>{formatRate(item.rate)}</span>
                  </div>
                  <div className={styles.bucketDesc}>{item.desc}</div>
                </div>
              );
            })}
          </div>
          <figure className={styles.chartFrame}>
            <BasePieChart data={pieData} height={336} />
          </figure>
        </section>

        <section>
          <h2 className={styles.sectionTitle}>持仓明细</h2>
          <div className={styles.holdingList}>
            {data.financialRows.map(function mapHolding(row) {
              const financial = getLatestFinancial(row);
              return (
                <article className={styles.holdingCard} key={row.code}>
                  <header className={styles.holdingHeader}>
                    <div className={styles.holdingTitle}>
                      <strong>{row.name}</strong>
                      <span className={styles.holdingCode}>{row.code}</span>
                      <span className={styles.holdingQuarter}>{formatQuarter(financial)}</span>
                    </div>
                    <div className={styles.holdingMeta}>
                      <div className={styles.holdingWeight}>持仓占比 {formatRate(row.weight)}</div>
                    </div>
                  </header>
                  <div className={styles.tagList}>
                    {row.productTags.map(function mapProductTag(tag) {
                      return (
                        <span className={styles.miniTag} key={tag}>
                          {tag}
                        </span>
                      );
                    })}
                  </div>
                  <dl className={styles.holdingMetrics}>
                    <div className={styles.holdingMetric}>
                      <dt>ROE</dt>
                      <dd>{formatRate(financial.roe ?? 0)}</dd>
                    </div>
                    <div className={styles.holdingMetric}>
                      <dt>营业收入增长率</dt>
                      <dd>{formatRate(financial.revenueGrowthRate ?? 0)}</dd>
                    </div>
                    <div className={styles.holdingMetric}>
                      <dt>净利率</dt>
                      <dd>{formatRate(financial.netProfitMargin ?? 0)}</dd>
                    </div>
                    <div className={styles.holdingMetric}>
                      <dt>扣非净利润增长率</dt>
                      <dd>{formatRate(financial.nonNetProfitGrowthRate ?? 0)}</dd>
                    </div>
                  </dl>
                  <p className={styles.holdingIntro}>{row.intro}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className={styles.sectionTitle}>技术观察</h2>
          <div className={styles.techGrid}>
            <div className={styles.techCard}>
              <div className={styles.techLabel}>最近 5 日振幅</div>
              <div className={styles.techValue}>{data.recentFiveDayAmplitude}</div>
              <div className={styles.techDesc}>用于观察短线波动空间</div>
            </div>
            <div className={styles.techCard}>
              <div className={styles.techLabel}>最近 10 日最大跌幅（{data.recentTenDayMaxDrawdownDate}）</div>
              <div className={styles.techValue}>{data.recentTenDayMaxDrawdown}</div>
              <div className={styles.techDesc}>用于观察短线回撤压力</div>
            </div>
          </div>
          <figure className={styles.chartFrame}>
            <BaseKLineChart data={data.kLineData} height={364} />
            <figcaption className={styles.figcaption}>{data.report.chartCaption}</figcaption>
          </figure>
        </section>

        <section>
          <h2 className={styles.sectionTitle}>跟踪事件</h2>
          <EventTimeline items={data.viewpoints} />
        </section>

        <section>
          <h2 className={styles.sectionTitle}>风险提示</h2>
          <div className={styles.riskGrid}>
            {data.report.risks.map(function mapRisk(risk) {
              return (
                <div className={styles.riskItem} key={risk.title}>
                  <div className={styles.riskLabel}>{risk.title}</div>
                  <div className={styles.riskDesc}>{risk.description}</div>
                </div>
              );
            })}
          </div>
        </section>

        <footer className={styles.reportFooter}>
          <span>{data.report.disclaimer}</span>
          <span>
            {data.report.author} · {data.report.date}
          </span>
        </footer>
      </article>
    </main>
  );
}
