import Timeline from '@/components/Timeline.jsx';
import records from '@/data/records';
import { etfAliasMap } from '@/data/etfBaseList';

function getLatestRecordKey(recordMap) {
  const keys = Object.keys(recordMap ?? {});

  if (keys.length === 0) {
    return null;
  }

  keys.sort();
  return keys[keys.length - 1] ?? null;
}

function isValidConcept(concept) {
  return typeof concept === 'string' && Boolean(etfAliasMap[concept]);
}

function normalizeEvent(item) {
  const tags = Array.isArray(item.tags) ? item.tags.slice() : [];
  const concepts = Array.isArray(item.concepts) ? item.concepts.filter(isValidConcept) : [];

  return {
    ...item,
    tags: tags.concat(
      concepts.map(function mapConcept(concept) {
        return { label: concept, kind: 'default' };
      }),
    ),
  };
}

export default function EventTimelinePage() {
  const latestRecordKey = getLatestRecordKey(records);
  const recentEvents = latestRecordKey ? records[latestRecordKey].map(normalizeEvent) : [];

  return (
    <main className="flex min-h-screen items-center justify-center overflow-hidden bg-[#f5f4ed] px-4 py-6 [font-family:'TsangerJinKai02','Source_Han_Serif_SC','Noto_Serif_CJK_SC','Songti_SC','STSong',Georgia,serif] text-[#141413]">
      <article className='h-[90vh] w-full max-w-[210mm] overflow-y-auto px-4 py-6 md:px-[18mm] md:py-[14mm]'>
        <header className='mb-3 border-l-[2.5pt] border-[#1b365d] pl-3'>
          <p className='mb-1 text-[11px] tracking-[0.14em] text-[#1b365d] uppercase'>VANTASTACK RESEARCH</p>
          <h1 className='text-[20px] leading-tight font-medium md:text-[26px]'>最近两周事件时间线</h1>
          <p className='mt-1 text-[13px] text-[#504e49]'>{latestRecordKey ? `${latestRecordKey.slice(0, 4)}-${latestRecordKey.slice(4, 6)} · 盘面事件与资金切换的节奏记录` : '盘面事件与资金切换的节奏记录'}</p>
        </header>

        <section className='mt-4'>
          <Timeline items={recentEvents} />
        </section>
      </article>
    </main>
  );
}
