import { format, isSameDay, parseISO } from 'date-fns';
import { Link } from 'react-router-dom';

import etfs from '@/data/etfs';

function formatReportDate(value) {
  if (typeof value !== 'string' || value.length === 0) {
    return '--';
  }

  try {
    return format(parseISO(value), 'yyyy-MM-dd');
  } catch {
    return value;
  }
}

function isTodayReportDate(value) {
  if (typeof value !== 'string' || value.length === 0) {
    return false;
  }

  try {
    return isSameDay(parseISO(value), new Date());
  } catch {
    return false;
  }
}

function mapEtfPage(data) {
  return {
    path: `/etf/${data.etf.code}`,
    title: `${data.etf.name}（${data.etf.code}）分析`,
    description: data.report?.coreJudgment || data.etf.intro,
    updateDate: formatReportDate(data.report?.date),
    isNew: isTodayReportDate(data.report?.date),
  };
}

function sortByCode(a, b) {
  return a.path.localeCompare(b.path);
}

const etfPageLinks = Object.values(etfs).map(mapEtfPage).sort(sortByCode);

export default function HomePage() {
  return (
    <main className='grid min-h-screen place-items-center bg-[linear-gradient(135deg,#f5f3e8,#ece8d9)] px-6 py-8 font-["TsangerJinKai02","Source_Han_Serif_SC","Noto_Serif_CJK_SC",serif] text-[#29261f]'>
      <section className='grid w-full max-w-[980px] gap-4 md:grid-cols-[0.95fr_1.05fr]'>
        <nav className='border border-[#ded9cc] bg-[#fbfaf3] p-5 shadow-[0_12px_30px_rgba(49,44,35,0.08)] md:p-8' aria-label='页面导航'>
          <p className='mb-3 text-[14px] tracking-[0.2em] text-[#7d7768] uppercase'>Pages</p>
          <h1 className='text-[40px] leading-[1.08] font-medium text-[#201f1b] md:text-[52px]'>页面导航</h1>
          <p className='mt-4 mb-6 text-[16px] leading-[1.6] text-[#4a463f] md:text-[20px]'>点击进入事件时间线或 ETF 专题页。</p>
          <Link
            to='/article/event-timeline'
            className='block border border-[#d9d3c3] bg-[#f6f2e6] p-4 text-inherit no-underline transition-transform duration-150 ease-in hover:-translate-y-[2px] hover:shadow-[0_8px_18px_rgba(45,39,29,0.1)]'
          >
            <span className='block text-[24px] leading-[1.2] font-medium'>最近两周事件时间线</span>
            <small className='mt-2 block text-[14px] text-[#5a554a] md:text-[16px]'>盘面事件与资金切换节奏</small>
          </Link>
        </nav>

        <nav className='border border-[#ded9cc] bg-[#fbfaf3] p-5 shadow-[0_12px_30px_rgba(49,44,35,0.08)] md:p-8' aria-label='ETF 页面导航'>
          <p className='mb-3 text-[14px] tracking-[0.2em] text-[#7d7768] uppercase'>ETF Reports</p>
          <h2 className='text-[34px] leading-[1.1] font-medium text-[#201f1b] md:text-[44px]'>ETF 分析</h2>
          <p className='mt-4 mb-6 text-[16px] leading-[1.6] text-[#4a463f] md:text-[20px]'>进入各个 ETF 专题页。</p>
          <ul className='m-0 grid list-none gap-3 p-0'>
            {etfPageLinks.map((page) => (
              <li key={page.path}>
                <Link
                  to={page.path}
                  className='block border border-[#d9d3c3] bg-[#f6f2e6] p-4 text-inherit no-underline transition-transform duration-150 ease-in hover:-translate-y-[2px] hover:shadow-[0_8px_18px_rgba(45,39,29,0.1)]'
                >
                  <div className='flex items-start justify-between gap-3'>
                    <span className='block text-[24px] leading-[1.2] font-medium'>{page.title}</span>
                    {page.isNew ? (
                      <span className='inline-flex shrink-0 items-center bg-[#dff3e7] px-2 py-0.5 text-[16px] leading-none font-medium text-[#1f7a4d]'>新</span>
                    ) : null}
                  </div>
                  <div className='mt-2 text-[13px] leading-[1.4] text-[#7d7768]'>更新日期：{page.updateDate}</div>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </section>
    </main>
  );
}
