import Timeline from '@/components/Timeline.jsx';

const recentEvents = [
  {
    datetime: '2026-06-02 19:29:43',
    title: 'AI硬件继续扩散',
    source: '盘后整理',
    statusTag: { label: '利好', kind: 'bullish' },
    summary: 'CPO、光模块、PCB、AI PC 等方向延续强势，资金继续围绕海外科技映射做文章。',
    tags: [
      { label: '贵州茅台 +2.09%', kind: 'stock', change: 2.09 },
      { label: 'CPO', kind: 'default' },
      { label: '光模块', kind: 'default' },
      { label: 'AI PC', kind: 'default' },
    ],
  },
  {
    datetime: '2026-06-01 18:40:11',
    title: '高位科技开始分歧',
    source: '盘后整理',
    statusTag: { label: '中性', kind: 'neutral' },
    summary: '半导体和算力链出现高位震荡，资金开始尝试往电力、消费等低位方向切换。',
    tags: [
      { label: '算力', kind: 'default' },
      { label: '电力', kind: 'default' },
      { label: '切换', kind: 'default' },
    ],
  },
  {
    datetime: '2026-05-30 21:08:05',
    title: '电力链获得关注',
    source: '盘后整理',
    statusTag: { label: '利好', kind: 'bullish' },
    summary: '火电、绿电和电网设备被重新定价，市场开始讨论 AI 时代的能源底座。',
    tags: [
      { label: '火电', kind: 'default' },
      { label: '绿电', kind: 'default' },
      { label: '电网设备', kind: 'default' },
    ],
  },
  {
    datetime: '2026-05-29 20:14:22',
    title: '海外科技情绪外溢',
    source: '盘后整理',
    statusTag: { label: '利好', kind: 'bullish' },
    summary: '美股科技股走强后，A 股资金快速寻找算力硬件、存储和服务器材料的映射标的。',
    tags: [
      { label: '美股科技', kind: 'default' },
      { label: '存储', kind: 'default' },
      { label: '服务器', kind: 'default' },
    ],
  },
  {
    datetime: '2026-05-28 17:56:39',
    title: '成交放大，风格偏成长',
    source: '盘后整理',
    statusTag: { label: '中性', kind: 'neutral' },
    summary: '市场成交明显抬升，成长风格占优，科技主线的弹性开始变得更突出。',
    tags: [
      { label: '成交放大', kind: 'default' },
      { label: '成长风格', kind: 'default' },
      { label: '弹性', kind: 'default' },
    ],
  },
  {
    datetime: '2026-05-27 19:03:18',
    title: '主线由芯片向链条扩散',
    source: '盘后整理',
    statusTag: { label: '利空', kind: 'bearish' },
    summary: '市场从单点芯片扩散到 PCB、光模块、封装、存储等更完整的产业链条。',
    tags: [
      { label: '芯片', kind: 'default' },
      { label: 'PCB', kind: 'default' },
      { label: '封装', kind: 'default' },
    ],
  },
];

export default function EventTimelinePage() {
  return (
    <main className="flex min-h-screen items-center justify-center overflow-hidden bg-[#f5f4ed] px-4 py-6 [font-family:'TsangerJinKai02','Source_Han_Serif_SC','Noto_Serif_CJK_SC','Songti_SC','STSong',Georgia,serif] text-[#141413]">
      <article className='h-[90vh] w-full max-w-[210mm] overflow-y-auto px-4 py-6 md:px-[18mm] md:py-[14mm]'>
        <header className='mb-3 border-l-[2.5pt] border-[#1b365d] pl-3'>
          <p className='mb-1 text-[11px] tracking-[0.14em] text-[#1b365d] uppercase'>VANTASTACK RESEARCH</p>
          <h1 className='text-[20px] leading-tight font-medium md:text-[26px]'>最近两周事件时间线</h1>
          <p className='mt-1 text-[13px] text-[#504e49]'>2026-05-27 至 2026-06-02 · 盘面事件与资金切换的节奏记录</p>
        </header>

        <section className='mt-4'>
          <Timeline items={recentEvents} />
        </section>
      </article>
    </main>
  );
}
