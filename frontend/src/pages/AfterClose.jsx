import ReportFooter from '@/components/ReportFooter.jsx';
import afterCloseData from '@/data/afterCloseData.jsx';

function formatUpdateDate(dateString) {
  if (!dateString) return '';

  const parts = dateString.split('-');
  if (parts.length !== 3) return dateString;

  const year = parts[0];
  const month = Number(parts[1]);
  const day = Number(parts[2]);

  if (Number.isNaN(month) || Number.isNaN(day)) return dateString;

  return `${year} 年 ${month} 月 ${day} 日`;
}

export default function AfterClosePage() {
  const data = afterCloseData;
  const mainIndexes = data?.mainIndexes ?? [];
  const conclusion = data?.conclusion ?? null;
  const content = data?.content ?? null;
  const updateDate = data?.updateDate ?? null;
  const titleDateText = formatUpdateDate(updateDate);
  const footerDateText = updateDate ?? null;

  return (
    <main className="flex h-screen items-center justify-center overflow-hidden bg-[#f5f4ed] px-4 py-6 [font-family:'TsangerJinKai02','Source_Han_Serif_SC','Noto_Serif_CJK_SC','Songti_SC','STSong',Georgia,serif] text-[#141413]">
      <article className='h-[90vh] w-full max-w-[210mm] overflow-y-auto px-4 py-6 md:px-[18mm] md:py-[14mm] md:pb-180'>
        <header className='mb-3 border-l-[2.5pt] border-[#1b365d] pl-3'>
          <p className='mb-1 text-[11px] tracking-[0.14em] text-[#1b365d] uppercase'>VANTASTACK RESEARCH</p>
          <h1 className='text-[20px] leading-tight font-medium md:text-[26px]'>每日盘后分析{titleDateText ? `（${titleDateText}）` : ''}</h1>
          <p className='mt-1 text-[13px] text-[#504e49]'>
            {updateDate ? `${updateDate} · ` : ''}
            复盘视角：指数结构、板块强弱与资金行为
          </p>
        </header>
        <section className='mt-2'>
          <div className='grid grid-cols-2 gap-2 md:grid-cols-3'>
            {mainIndexes.map((item) => (
              <article key={item.name} className='rounded border border-[#e8e6dc] bg-[#faf9f5] px-4 py-3'>
                <p className='text-[12px] tracking-[0.08em] text-[#6b6a64]'>{item.name}</p>
                <p className='mt-1 text-[20px] leading-none font-medium text-[#141413]'>{item.indexValue}</p>
                <p className={`mt-2 text-[14px] leading-none font-medium ${Number(item.changeRate) >= 0 ? 'text-rise' : 'text-fall'}`}>
                  {`${Number(item.changeRate) > 0 ? '+' : ''}${Number(item.changeRate).toFixed(2)}%`}
                </p>
              </article>
            ))}
          </div>
        </section>
        <section className='mt-4 text-[15px] leading-7 text-[#2f2e2b] [&>p+p]:mt-2'>{content}</section>
        {conclusion ? (
          <section>
            <div className='my-[10pt] break-inside-avoid rounded-[3pt] border-l-[2pt] border-[#1b365d] bg-[#faf9f5] px-[12pt] py-[8pt]'>
              <p className='text-[14px] font-medium text-[#1b365d]'>{conclusion}</p>
            </div>
          </section>
        ) : null}
        <ReportFooter date={footerDateText} />
      </article>
    </main>
  );
}
