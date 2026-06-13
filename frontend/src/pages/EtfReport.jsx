import BaseKLineChart from '@/components/BaseKLineChart';
import BaseLineChart from '@/components/BaseLineChart';
import BasePieChart from '@/components/BasePieChart';
import CongestionLineChart from '@/components/CongestionLineChart';
import EtfSharePrompt from '@/components/EtfSharePrompt.jsx';
import EtfPublicAccountPrompt from '@/components/EtfPublicAccountPrompt.jsx';
import Rate from '@/components/Rate.jsx';
import ReportFooter from '@/components/ReportFooter.jsx';
import Timeline from '@/components/Timeline.jsx';
import etfs from '@/data/etfs';
import { identity, mean, minBy, takeRight } from 'es-toolkit';
import { Navigate, useParams, useSearchParams } from 'react-router-dom';

const formatRate = (rate) => {
  return `${Number(rate).toFixed(2)}%`;
};

const getLatestFinancial = (row) => {
  return row.data?.[0] ?? {};
};

function getRecentTenDayKLineData(kLineData) {
  return takeRight(Array.isArray(kLineData) ? kLineData : [], 10);
}

function getAveragePercent(data, key) {
  const values = (Array.isArray(data) ? data : [])
    .map(function mapValue(item) {
      return Number(item?.[key]);
    })
    .filter(Number.isFinite);

  if (values.length === 0) {
    return '--';
  }

  return `${mean(values).toFixed(2)}%`;
}

function getMinPercent(data, key) {
  const values = (Array.isArray(data) ? data : [])
    .map(function mapValue(item) {
      return Number(item?.[key]);
    })
    .filter(Number.isFinite);

  if (values.length === 0) {
    return '--';
  }

  const minValue = minBy(values, identity);

  if (minValue === undefined) {
    return '--';
  }

  return `${minValue.toFixed(2)}%`;
}

const formatQuarter = (financial) => {
  if (!financial.year || !financial.quarter) {
    return '--';
  }
  return `${financial.year}Q${financial.quarter}`;
};

export default function EtfReportPage() {
  const { code } = useParams();
  const [searchParams] = useSearchParams();
  const data = etfs[`etf${code}`];
  const useMask = searchParams.get('mask') === '1';
  const hideSharePrompt = searchParams.has('hideSharePrompt');

  if (!data) {
    return <Navigate to='/' replace />;
  }

  const recentTenDayKLine = getRecentTenDayKLineData(data.kLineData);
  const recentTenDayAmplitude = getAveragePercent(recentTenDayKLine, 'amplitude');
  const recentTenDayMaxDrawdown = getMinPercent(recentTenDayKLine, 'maxDrawdown');
  const heatScore = Number(data.report.heatScore ?? 3);

  const pieData = data.businessRatio.map((item) => {
    return {
      name: item.type,
      value: Number(item.rate.toFixed(2)),
    };
  });

  return (
    <main className='min-h-screen bg-[#f5f4ed] font-["TsangerJinKai02","Source_Han_Serif_SC","Noto_Serif_CJK_SC","Songti_SC","STSong",Georgia,serif] text-[10pt] leading-[1.5] tracking-[0.3pt] text-[#141413]'>
      <article className='mx-auto w-full max-w-[210mm] px-[18mm] pt-[16mm] pb-[18mm] max-[820px]:px-[18px] max-[820px]:py-[24px]'>
        <header className='mb-[14pt] rounded-[1.5pt] border-l-[2.5pt] border-[#1b365d] pl-[8pt]'>
          <div className={`${useMask ? 'isolate' : ''} relative min-w-0`}>
            <div className='mb-[4pt] text-[9pt] tracking-[1pt] text-[#1b365d] uppercase'>ETF ANALYSIS</div>
            <div className='flex items-end justify-between gap-[10pt]'>
              <h1 className='text-[24pt] leading-[1.15] font-medium text-[#141413]'>
                {data.etf.name} <span className='text-[14pt] text-[#6b6a64]'>{data.etf.code}</span>
              </h1>
              <div className='text-[26pt] leading-none font-medium text-[#141413] tabular-nums'>{data.etf.scale}</div>
            </div>
            <div className='mt-[4pt] flex items-center justify-between gap-[10pt]'>
              <div className='text-[10pt] leading-[1.4] text-[#504e49]'>
                {data.etf.index} · {data.report.coreJudgment}
              </div>
              <div className='text-right text-[10pt] leading-[1.4] text-[#504e49]'>{data.report.headlineSignal}</div>
            </div>
            <div className='mt-[4pt] flex items-center justify-between gap-[10pt]'>
              <div className='flex items-center gap-[6pt]'>
                <span className='text-[8.5pt] tracking-[1pt] text-[#7d6d3f] uppercase'>评分</span>
                <Rate value={heatScore} showValue />
              </div>
              <div className='text-[9pt] text-[#6b6a64]'>{data.report.date}</div>
            </div>
            {useMask ? (
              <div
                className='pointer-events-none absolute inset-[-2pt_-6pt_-2pt_0] z-[2] rounded-[6pt] border border-[rgba(255,255,255,0.45)] bg-[rgba(240,244,250,0.24)] shadow-[inset_0_0_0_0.5pt_rgba(255,255,255,0.24)] saturate-[1.12] backdrop-blur-[5px]'
                aria-hidden='true'
              />
            ) : null}
          </div>
        </header>

        <div className='mb-[13pt] flex flex-wrap gap-[5pt]'>
          {data.etf.concepts.map((concept) => {
            return (
              <span className='inline-block rounded-[3pt] bg-[#e4ecf5] px-[6pt] py-[1pt] text-[9pt] font-medium text-[#1b365d]' key={concept}>
                {concept}
              </span>
            );
          })}
        </div>
        <section className='mb-[16pt] grid grid-cols-4 gap-[10pt] max-[820px]:grid-cols-2 max-[820px]:gap-[6pt] print:!grid-cols-4 print:!gap-[10pt]'>
          {data.metrics.map((metric) => {
            return (
              <div className='rounded-[4pt] bg-[#faf9f5] p-[10pt]' key={metric.label}>
                <div className='text-[10pt] font-medium text-[#3d3d3a]'>{metric.label}</div>
                <div className='mt-[5pt] text-[14pt] leading-[1.1] font-medium text-[#1b365d] tabular-nums'>{metric.value}</div>
                <div className='mt-[5pt] text-[9pt] leading-[1.3] text-[#504e49]'>{metric.note}</div>
              </div>
            );
          })}
        </section>

        <section>
          <h2 className='mt-[18pt] mb-[6pt] text-[16pt] leading-[1.25] font-medium text-[#141413]'>投资逻辑</h2>
          <p className='mb-[8pt]'>{data.report.thesis}</p>
          <div className='my-[10pt] break-inside-avoid rounded-[3pt] border-l-[2pt] border-[#1b365d] bg-[#faf9f5] px-[12pt] py-[8pt]'>
            {data.report.callout}
          </div>
        </section>

        <section>
          <h2 className='mt-[18pt] mb-[6pt] text-[16pt] leading-[1.25] font-medium text-[#141413]'>短期影响因素</h2>
          <ol className='my-[8pt] ml-0 list-decimal pl-[18pt] leading-[1.5] marker:font-medium marker:text-[#1b365d] [&>li]:my-[2pt]'>
            {data.shortTermFactors.map((item) => {
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
          <h2 className='mt-[18pt] mb-[6pt] text-[16pt] leading-[1.25] font-medium text-[#141413]'>风格特征</h2>
          <ol className='my-[8pt] ml-0 list-decimal pl-[18pt] leading-[1.5] marker:font-medium marker:text-[#1b365d] [&>li]:my-[2pt]'>
            {data.styleCharacteristics.map((item) => {
              return (
                <li key={item.title}>
                  <strong>{item.title}：</strong>
                  {item.description}
                </li>
              );
            })}
          </ol>
        </section>

        {data.report.hiddenStoryLine !== '' ? (
          <section className='my-[10pt] break-inside-avoid border-l-[2pt] border-[#1b365d] bg-[#faf9f5] px-[12pt] py-[9pt]'>
            <div className='mb-[4pt] text-[8.5pt] tracking-[1pt] text-[#7d6d3f] uppercase'>隐藏故事线</div>
            <p className='text-[9pt] leading-[1.55] text-[#3d3d3a]'>{data.report.hiddenStoryLine}</p>
          </section>
        ) : null}

        <section>
          <h2 className='mt-[18pt] mb-[6pt] text-[16pt] leading-[1.25] font-medium text-[#141413]'>业务分布</h2>
          <div className='my-[8pt] grid grid-cols-2 gap-[10pt] max-[820px]:block print:!grid print:!grid-cols-2 print:!gap-[10pt]'>
            {data.businessRatio.map((item) => {
              return (
                <div className='break-inside-avoid rounded-[4pt] bg-[#faf9f5] px-[10pt] py-[8pt]' key={item.type}>
                  <div className='mb-[3pt] flex justify-between gap-[8pt] font-medium text-[#3d3d3a]'>
                    <span>{item.type}</span>
                    <span className='whitespace-nowrap text-[#1b365d] tabular-nums'>{formatRate(item.rate)}</span>
                  </div>
                  <div className='text-[9pt] leading-[1.4] text-[#504e49]'>{item.desc}</div>
                </div>
              );
            })}
          </div>
          <figure className='my-[12pt] break-inside-avoid'>
            <BasePieChart data={pieData} height={336} />
          </figure>
        </section>

        <section>
          <h2 className='mt-[18pt] mb-[6pt] text-[16pt] leading-[1.25] font-medium text-[#141413]'>持仓明细</h2>
          <div className='mt-[8pt] grid grid-cols-2 gap-[10pt] max-[820px]:grid-cols-1 max-[820px]:gap-[8pt] print:!grid print:!grid-cols-2 print:!gap-[10pt]'>
            {data.financialRows.map((row) => {
              const financial = getLatestFinancial(row);
              return (
                <article className='break-inside-avoid rounded-[4pt] bg-[#faf9f5] p-[10pt]' key={row.code}>
                  <header className='flex items-start justify-between gap-[8pt] max-[820px]:block print:!flex print:!items-start print:!justify-between'>
                    <div className='flex items-baseline gap-[6pt] text-[#141413]'>
                      <strong>{row.name}</strong>
                      <span className='font-["JetBrains_Mono",monospace] text-[8.5pt] text-[#6b6a64]'>{row.code}</span>
                      <span className='text-[8.5pt] whitespace-nowrap text-[#6b6a64]'>{formatQuarter(financial)}</span>
                    </div>
                    <div className='text-right max-[820px]:mt-[2pt] max-[820px]:text-left print:!mt-0 print:!text-right'>
                      <div className='text-[9pt] font-medium whitespace-nowrap text-[#1b365d] max-[820px]:mt-[2pt] print:!mt-0'>
                        持仓占比 {formatRate(row.weight)}
                      </div>
                    </div>
                  </header>
                  <div className='mt-[4pt] flex flex-wrap gap-[3pt]'>
                    {row.productTags.map((tag) => {
                      return (
                        <span className='inline-block rounded-[3pt] bg-[#eef2f7] px-[4pt] py-[1pt] text-[8pt] whitespace-nowrap text-[#1b365d]' key={tag}>
                          {tag}
                        </span>
                      );
                    })}
                  </div>
                  <dl className='mt-[4pt] grid grid-cols-2 gap-x-[8pt] gap-y-[4pt] max-[820px]:grid-cols-2'>
                    <div className='m-0'>
                      <dt className='text-[8.5pt] text-[#6b6a64]'>ROE</dt>
                      <dd className='mt-[1pt] text-[9pt] text-[#141413] tabular-nums'>{formatRate(financial.roe ?? 0)}</dd>
                    </div>
                    <div className='m-0'>
                      <dt className='text-[8.5pt] text-[#6b6a64]'>营业收入增长率</dt>
                      <dd className='mt-[1pt] text-[9pt] text-[#141413] tabular-nums'>{formatRate(financial.revenueGrowthRate ?? 0)}</dd>
                    </div>
                    <div className='m-0'>
                      <dt className='text-[8.5pt] text-[#6b6a64]'>净利率</dt>
                      <dd className='mt-[1pt] text-[9pt] text-[#141413] tabular-nums'>{formatRate(financial.netProfitMargin ?? 0)}</dd>
                    </div>
                    <div className='m-0'>
                      <dt className='text-[8.5pt] text-[#6b6a64]'>扣非净利润增长率</dt>
                      <dd className='mt-[1pt] text-[9pt] text-[#141413] tabular-nums'>{formatRate(financial.nonNetProfitGrowthRate ?? 0)}</dd>
                    </div>
                  </dl>
                  <p className='mt-[8pt] text-[9pt] leading-[1.4] text-[#504e49]'>{row.intro}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className='mt-[18pt] mb-[6pt] text-[16pt] leading-[1.25] font-medium text-[#141413]'>技术观察</h2>
          <div className='my-[8pt] grid grid-cols-2 gap-[10pt] max-[820px]:grid-cols-1 print:!grid print:!grid-cols-2 print:!gap-[10pt]'>
            <div className='mb-[8pt] rounded-[4pt] bg-[#faf9f5] pt-[10pt]'>
              <div className='px-[10pt] text-[10pt] font-medium text-[#3d3d3a]'>最近 10 日振幅</div>
              <div className='mt-[4pt] px-[10pt] text-[14pt] font-medium text-[#1b365d] tabular-nums'>{recentTenDayAmplitude}</div>
              <div className='mt-[4pt] px-[10pt] text-[9pt] text-[#504e49]'>{data.recentTenDayAmplitudeComment}</div>
              <div className='mt-[4pt]'>
                <BaseLineChart
                  data={recentTenDayKLine}
                  height={110}
                  series={[
                    {
                      key: 'amplitude',
                      name: '振幅',
                      color: '#1b365d',
                      areaColor: 'rgba(27, 54, 93, 0.14)',
                      formatValue: function formatAmplitudeValue(value) {
                        return `${Number(value).toFixed(2)}%`;
                      },
                    },
                  ]}
                />
              </div>
            </div>
            <div className='mb-[8pt] rounded-[4pt] bg-[#faf9f5] pt-[10pt]'>
              <div className='px-[10pt] text-[10pt] font-medium text-[#3d3d3a]'>最近 10 日最大回撤</div>
              <div className='mt-[4pt] px-[10pt] text-[14pt] font-medium text-[#1b365d] tabular-nums'>{recentTenDayMaxDrawdown}</div>
              <div className='mt-[4pt] px-[10pt] text-[9pt] text-[#504e49]'>{data.recentTenDayMaxDrawdownComment}</div>
              <div className='mt-[4pt]'>
                <BaseLineChart
                  data={recentTenDayKLine}
                  height={110}
                  series={[
                    {
                      key: 'maxDrawdown',
                      name: '最大跌幅',
                      color: '#8a5d25',
                      areaColor: 'rgba(138, 93, 37, 0.14)',
                      formatValue: function formatDrawdownValue(value) {
                        return `${Number(value).toFixed(2)}%`;
                      },
                    },
                  ]}
                />
              </div>
            </div>
          </div>
          <figure className='my-[12pt] break-inside-avoid'>
            <BaseKLineChart data={data.kLineData} markers={data.kLineMarkers} height={364} />
            <figcaption className='mt-[4pt] text-[9pt] leading-[1.5] text-[#6b6a64]'>{data.report.chartCaption}</figcaption>
          </figure>
        </section>

        <section>
          <h2 className='mt-[18pt] mb-[6pt] text-[16pt] leading-[1.25] font-medium text-[#141413]'>拥挤度</h2>
          <CongestionLineChart />
        </section>

        {data.report.timelineEvents?.length > 0 ? (
          <section>
            <Timeline items={data.report.timelineEvents} />
          </section>
        ) : null}

        {data.viewpoints?.length > 0 && (
          <section>
            <h2 className='mt-[18pt] mb-[6pt] text-[16pt] leading-[1.25] font-medium text-[#141413]'>跟踪事件</h2>
            <Timeline items={data.viewpoints} />
          </section>
        )}

        <section>
          <h2 className='mt-[18pt] mb-[6pt] text-[16pt] leading-[1.25] font-medium text-[#141413]'>风险提示</h2>
          <div className='my-[8pt] grid grid-cols-2 gap-[10pt] max-[820px]:block print:!grid print:!grid-cols-2 print:!gap-[10pt]'>
            {data.report.risks.map((risk) => {
              return (
                <div className='break-inside-avoid rounded-[3pt] bg-[#faf9f5] px-[10pt] py-[6pt]' key={risk.title}>
                  <div className='mb-[2pt] text-[9pt] font-medium text-[#1b365d]'>{risk.title}</div>
                  <div className='text-[9pt] leading-[1.4] text-[#504e49]'>{risk.description}</div>
                </div>
              );
            })}
          </div>
        </section>

        {hideSharePrompt ? <EtfSharePrompt /> : <EtfPublicAccountPrompt />}

        <ReportFooter date={data.report.date} />
      </article>
    </main>
  );
}
