import ReportFooter from '@/components/ReportFooter.jsx';

export default function StaticPage() {
  return (
    <main className="flex h-screen items-center justify-center overflow-hidden bg-[#f5f4ed] px-4 py-6 [font-family:'TsangerJinKai02','Source_Han_Serif_SC','Noto_Serif_CJK_SC','Songti_SC','STSong',Georgia,serif] text-[#141413]">
      <article className='h-[90vh] w-full max-w-[210mm] overflow-y-auto px-4 py-6 md:px-[18mm] md:py-[14mm]'>
        <header className='mb-5 border-l-[2.5pt] border-[#1b365d] pl-3'>
          <p className='mb-1 text-[11px] tracking-[0.14em] text-[#1b365d] uppercase'>VANTASTACK RESEARCH</p>
          <h1 className='text-[22px] leading-tight font-medium md:text-[30px]'>AI行情是不是泡沫？看这3个信号就够了</h1>
        </header>

        <section className='text-[15px] leading-7 text-[#2f2e2b] [&>p+p]:mt-3'>
          <p>判断AI趋势有没有真正逆转，不能只看一天两天的股价波动。尤其是美股一旦大幅回调，市场情绪很容易从“狂热”切换到“恐慌”。</p>
          <p>我会重点盯这3个关键信号：</p>
          <p>
            <strong>1. 上游订单开始消失</strong>
          </p>
          <p>如果英伟达、台积电等核心上游厂商订单明显减少，并且压力传导到存储、服务器、封装等供应链，那才是需要警惕的信号。</p>
          <p>目前来看，AI算力需求仍然偏紧，部分市场预期认为2026-2027年的产能已经非常紧张，缺货状态可能还会持续更久。只要订单还在，需求端就还没有真正塌。</p>
          <p>
            <strong>2. 科技巨头开始砍AI资本开支</strong>
          </p>
          <p>第二个信号，是谷歌、微软、亚马逊等云巨头开始削减AI投入。</p>
          <p>因为AI行情的核心燃料之一，就是这些大厂持续买芯片、建数据中心、扩算力。</p>
          <p>但目前看到的情况恰恰相反：</p>
          <p>各大科技公司仍在加大AI资本开支，数据中心、云计算、模型训练和推理需求都还在扩张。</p>
          <p>如果未来这些公司开始集体下调AI预算，那才说明行业预期可能发生变化。</p>
          <p>
            <strong>3. AI大厂业绩指引下修</strong>
          </p>
          <p>第三个信号，是AI相关公司对未来盈利能力给出保守甚至负面的指引。</p>
          <p>比如收入增速放缓、利润率承压、订单不及预期，或者管理层明确释放需求降温的信号。</p>
          <p>目前来看，市场还没有看到非常明确的负面指引。</p>
          <p>所以短期波动不等于趋势反转，真正要看企业基本面有没有变差。</p>
          <p>
            <strong>总结一下：</strong>
          </p>
          <p>判断AI泡沫是否破裂，不要只盯股价跌了多少，而要看：</p>
          <p className='post-underline'>①上游订单有没有消失；②资本开支有没有砍单；③业绩指引有没有下修。</p>
        </section>

        <ReportFooter />
      </article>
    </main>
  );
}
