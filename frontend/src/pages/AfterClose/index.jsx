import ReportFooter from '@/components/ReportFooter';

export default function AfterClosePage(props) {
  const { data } = props;
  const mainIndexes = data?.mainIndexes ?? [];

  return (
    <main className="min-h-screen bg-[#f5f4ed] [font-family:'TsangerJinKai02','Source_Han_Serif_SC','Noto_Serif_CJK_SC','Songti_SC','STSong',Georgia,serif] text-[#141413]">
      <article className='mx-auto w-full max-w-[210mm] px-4 py-6 md:px-[18mm] md:py-[14mm]'>
        <header className='mb-3 border-l-[2.5pt] border-[#1b365d] pl-3'>
          <p className='mb-1 text-[11px] tracking-[0.14em] text-[#1b365d] uppercase'>VANTASTACK RESEARCH</p>
          <h1 className='text-[20px] leading-tight font-medium md:text-[26px]'>盘后分析：主线分化，资金高低切加速</h1>
          <p className='mt-1 text-[13px] text-[#504e49]'>2026-06-01 · 复盘视角：指数结构、板块强弱与资金行为</p>
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

        {/* 板块内容暂未确定，先注释保留结构与数据映射逻辑
        <section className='mt-4'>
          <div className='grid gap-2 md:grid-cols-2'>
            <div className='rounded border border-[#e8e6dc] bg-[#faf9f5] p-3'>
              <div className='mb-2 flex items-center justify-between border-b border-[#e8e6dc] pb-2'>
                <p className='text-[14px] font-medium text-[#3d3d3a]'>科技承压</p>
                <p className='text-[12px] text-[#6b6a64]'>估值消化 / 拥挤出清</p>
              </div>
              <div className='space-y-3'>
                {techSectors.map((item) => (
                  <article key={item.name} className='rounded border border-[#e8e6dc] bg-[#faf9f5] px-4 py-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.35)]'>
                    <div className='flex items-center justify-between gap-3'>
                      <p className='text-[15px] leading-none font-medium text-[#141413]'>{item.name}</p>
                      <p className={`text-[13px] leading-none font-medium ${Number(item.changeRate) >= 0 ? 'text-rise' : 'text-fall'}`}>
                        {`${Number(item.changeRate) > 0 ? '+' : ''}${Number(item.changeRate).toFixed(2)}%`}
                      </p>
                    </div>
                    <div className='mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-[12px] text-[#504e49]'>
                      <p>指数：{item.indexValue}</p>
                      <p>成交额：{`${Number(item.turnover).toFixed(2)} 亿`}</p>
                      <p className='text-rise'>流入：{`${Number(item.netInflowIn).toFixed(2)} 亿`}</p>
                      <p className='text-fall'>流出：{`${Number(item.netInflowOut).toFixed(2)} 亿`}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
            <div className='rounded border border-[#e8e6dc] bg-[#faf9f5] p-3'>
              <div className='mb-2 flex items-center justify-between border-b border-[#e8e6dc] pb-2'>
                <p className='text-[14px] font-medium text-[#3d3d3a]'>热门承接</p>
                <p className='text-[12px] text-[#6b6a64]'>防御抬升 / 风格切换</p>
              </div>
              <div className='space-y-3'>
                {hotSectors.map((item) => (
                  <article key={item.name} className='rounded border border-[#e8e6dc] bg-[#faf9f5] px-4 py-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.35)]'>
                    <div className='flex items-center justify-between gap-3'>
                      <p className='text-[15px] leading-none font-medium text-[#141413]'>{item.name}</p>
                      <p className={`text-[13px] leading-none font-medium ${Number(item.changeRate) >= 0 ? 'text-rise' : 'text-fall'}`}>
                        {`${Number(item.changeRate) > 0 ? '+' : ''}${Number(item.changeRate).toFixed(2)}%`}
                      </p>
                    </div>
                    <div className='mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-[12px] text-[#504e49]'>
                      <p>指数：{item.indexValue}</p>
                      <p>成交额：{`${Number(item.turnover).toFixed(2)} 亿`}</p>
                      <p className='text-rise'>流入：{`${Number(item.netInflowIn).toFixed(2)} 亿`}</p>
                      <p className='text-fall'>流出：{`${Number(item.netInflowOut).toFixed(2)} 亿`}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
        */}

        <section className='mt-4 text-[15px] leading-7 text-[#2f2e2b]'>
          <p>今天盘面的核心，不是单边风险释放，而是仓位在不同风险偏好之间重新分配。</p>
          <p className='mt-2'>
            上午资金仍尝试在高弹性方向做修复，但随着量能抬升，兑现盘同步增多，科技主线内部开始分层。具备业绩锚和订单验证的标的回撤相对可控，纯题材高位票则出现更明显的估值回吐。
          </p>
          <p className='mt-2'>
            午后电力、白酒等方向持续获得承接，说明短线账户在做风险平衡。这个阶段更重要的不是追逐单日最强，而是观察
            <span className='post-underline'>资金是否形成连续净流入</span>与<span className='post-underline'>板块内部扩散强度</span>。
          </p>
          <p className='mt-2'>
            若后续科技方向缩量企稳，市场大概率进入“主线震荡 +
            轮动补涨”的结构；若量能继续放大但赚钱效应下降，则要提高仓位灵活性，优先保留景气度最清晰的核心资产。
          </p>
        </section>

        <ReportFooter />
      </article>
    </main>
  );
}
