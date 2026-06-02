import ReportFooter from '@/components/ReportFooter.jsx';
import preOpenData from '@/data/preOpenData.jsx';

function renderNumberedList(items) {
  return (
    <ol className='m-0 list-none space-y-2 p-0'>
      {items.map(function mapItem(item, index) {
        return (
          <li key={`${index}-${item}`} className='text-[15px] leading-7 text-[#2f2e2b]'>
            <span className='mr-1 font-medium text-[#1b365d]'>{`${index + 1}.`}</span>
            {item}
          </li>
        );
      })}
    </ol>
  );
}

export default function PreOpenPage() {
  const data = preOpenData;
  const fourIndexes = data?.fourIndexes ?? [];

  return (
    <main className="min-h-screen bg-[#f5f4ed] [font-family:'TsangerJinKai02','Source_Han_Serif_SC','Noto_Serif_CJK_SC','Songti_SC','STSong',Georgia,serif] text-[#141413]">
      <article className='mx-auto w-full max-w-[210mm] px-4 py-6 md:px-[18mm] md:py-[14mm]'>
        <header className='mb-3 border-l-[2.5pt] border-[#1b365d] pl-3'>
          <p className='mb-1 text-[11px] tracking-[0.14em] text-[#1b365d] uppercase'>VANTASTACK RESEARCH</p>
          <h1 className='text-[20px] leading-tight font-medium md:text-[26px]'>{data.title}</h1>
          <p className='mt-1 text-[13px] text-[#504e49]'>{data.subtitle}</p>
          <p className='mt-1 text-[13px] text-[#7a786f]'>{data.publishedAt}</p>
        </header>

        <section className='mt-4 rounded border border-[#e8e6dc] bg-[#faf9f5] px-4 py-3'>
          <h2 className='mb-2 text-[18px] font-medium text-[#1b365d]'>短期宏观影响因素</h2>
          {renderNumberedList(data.macroFactors ?? [])}
        </section>

        <section className='mt-4 rounded border border-[#e8e6dc] bg-[#faf9f5] px-4 py-3'>
          <h2 className='mb-2 text-[18px] font-medium text-[#1b365d]'>盘前消息</h2>
          {renderNumberedList(data.preOpenNews ?? [])}
        </section>

        <section className='mt-4 rounded border border-[#e8e6dc] bg-[#faf9f5] px-4 py-3'>
          <h2 className='mb-2 text-[18px] font-medium text-[#1b365d]'>总结</h2>
          <p className='text-[15px] leading-7 text-[#2f2e2b]'>{data.summary}</p>
        </section>

        <section className='mt-4'>
          <h2 className='mb-2 text-[18px] font-medium text-[#1b365d]'>四大指数走势</h2>
          <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
            {fourIndexes.map(function mapIndex(item) {
              return (
                <article key={item.name} className='rounded border border-[#e8e6dc] bg-[#faf9f5] px-4 py-3'>
                  <div className='flex items-center justify-between'>
                    <h3 className='text-[22px] font-medium text-[#141413]'>{item.name}</h3>
                    <span className='text-[12px] text-[#7a786f]'>{item.date}</span>
                  </div>
                  <p className='mt-2 text-[15px] leading-7 text-[#2f2e2b]'>{item.overview}</p>
                  <div className='mt-2 flex flex-wrap gap-2'>
                    {(item.scenarios ?? []).map(function mapScenario(scenario) {
                      return (
                        <span key={`${item.name}-${scenario}`} className='rounded border border-[#ddd8ca] bg-[#f5f2e8] px-2 py-1 text-[13px] text-[#4b483f]'>
                          {scenario}
                        </span>
                      );
                    })}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <ReportFooter />
      </article>
    </main>
  );
}
