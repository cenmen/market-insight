import ReportFooter from '@/components/ReportFooter';
import IndexPulseTable from '@/components/IndexPulseTable';

const afterCloseData = {
  mainIndexes: [
    { name: '上证指数', indexValue: '4057.74', changeRate: -0.27 },
    { name: '创业板指', indexValue: '3950.94', changeRate: -2.15 },
    { name: '科创50', indexValue: '1663.69', changeRate: -5.0 },
  ],
  sectorTableRows: [
    { code: '588200', alias: '芯片', latestPrice: 1006.23, changeRate: 1.23, amplitude: 2.45, maxDrawdown: -4.51, turnoverRate: 3.18, mainNetInflow: 1.26, recentTrend: [1, -1, 1, 1, -1, 1, -1, 1] },
    { code: '515880', alias: '通信', latestPrice: 987.12, changeRate: -0.58, amplitude: 1.77, maxDrawdown: -3.06, turnoverRate: 2.44, mainNetInflow: -0.85, recentTrend: [-1, 1, -1, -1, 1, -1, 1, -1] },
    { code: '159516', alias: '半导体设备', latestPrice: 1124.35, changeRate: -1.16, amplitude: 2.91, maxDrawdown: -5.23, turnoverRate: 4.02, mainNetInflow: -1.12, recentTrend: [-1, -1, 1, -1, 1, -1, -1, 1] },
    { code: '159819', alias: '人工智能', latestPrice: 1208.67, changeRate: 2.11, amplitude: 3.84, maxDrawdown: -6.34, turnoverRate: 5.15, mainNetInflow: 2.68, recentTrend: [1, 1, -1, 1, 1, -1, 1, 1] },
    { code: '562500', alias: '机器人', latestPrice: 951.44, changeRate: 0.73, amplitude: 2.22, maxDrawdown: -4.62, turnoverRate: 3.29, mainNetInflow: 0.44, recentTrend: [1, -1, 1, -1, 1, 1, -1, 1] },
    { code: '159206', alias: '卫星', latestPrice: 876.31, changeRate: -0.94, amplitude: 2.41, maxDrawdown: -5.48, turnoverRate: 2.88, mainNetInflow: -0.36, recentTrend: [-1, 1, -1, 1, -1, -1, 1, -1] },
    { code: '516160', alias: '新能源', latestPrice: 1039.56, changeRate: 1.34, amplitude: 2.69, maxDrawdown: -4.95, turnoverRate: 3.72, mainNetInflow: 1.15, recentTrend: [1, -1, 1, 1, -1, 1, 1, -1] },
    { code: '159755', alias: '电池', latestPrice: 918.75, changeRate: -0.72, amplitude: 2.13, maxDrawdown: -5.11, turnoverRate: 2.97, mainNetInflow: -0.57, recentTrend: [-1, -1, 1, -1, 1, -1, 1, -1] },
    { code: '515790', alias: '光伏', latestPrice: 842.09, changeRate: 0.48, amplitude: 1.96, maxDrawdown: -4.21, turnoverRate: 2.63, mainNetInflow: 0.22, recentTrend: [1, -1, -1, 1, -1, 1, -1, 1] },
    { code: '512400', alias: '有色', latestPrice: 1096.18, changeRate: 1.67, amplitude: 2.58, maxDrawdown: -3.75, turnoverRate: 2.51, mainNetInflow: 1.91, recentTrend: [1, 1, -1, 1, -1, 1, 1, -1] },
    { code: '159326', alias: '电网设备', latestPrice: 1014.72, changeRate: 0.89, amplitude: 1.84, maxDrawdown: -3.42, turnoverRate: 2.19, mainNetInflow: 0.68, recentTrend: [1, -1, 1, -1, 1, -1, 1, 1] },
    { code: '159870', alias: '化工', latestPrice: 965.37, changeRate: -0.31, amplitude: 1.53, maxDrawdown: -2.87, turnoverRate: 1.98, mainNetInflow: -0.14, recentTrend: [-1, 1, -1, 1, -1, 1, -1, 1] },
    { code: '159865', alias: '养殖', latestPrice: 902.46, changeRate: 0.56, amplitude: 1.62, maxDrawdown: -3.03, turnoverRate: 1.86, mainNetInflow: 0.19, recentTrend: [1, -1, -1, 1, 1, -1, 1, -1] },
    { code: '159825', alias: '农业', latestPrice: 934.28, changeRate: 0.42, amplitude: 1.49, maxDrawdown: -2.65, turnoverRate: 1.74, mainNetInflow: 0.11, recentTrend: [1, 1, -1, -1, 1, -1, 1, -1] },
    { code: '515220', alias: '煤炭', latestPrice: 1188.52, changeRate: 2.08, amplitude: 2.11, maxDrawdown: -2.44, turnoverRate: 2.33, mainNetInflow: 2.16, recentTrend: [1, 1, 1, -1, 1, 1, -1, 1] },
    { code: '516150', alias: '稀土', latestPrice: 1048.13, changeRate: -0.67, amplitude: 2.35, maxDrawdown: -4.06, turnoverRate: 2.68, mainNetInflow: -0.49, recentTrend: [-1, 1, -1, -1, 1, -1, 1, 1] },
    { code: '159732', alias: '消费电子', latestPrice: 1133.64, changeRate: 1.72, amplitude: 2.74, maxDrawdown: -4.58, turnoverRate: 3.41, mainNetInflow: 1.47, recentTrend: [1, -1, 1, 1, -1, 1, -1, 1] },
    { code: '510880', alias: '红利', latestPrice: 1266.95, changeRate: 0.63, amplitude: 1.24, maxDrawdown: -1.96, turnoverRate: 1.29, mainNetInflow: 0.77, recentTrend: [1, 1, -1, 1, -1, 1, 1, -1] },
    { code: '512880', alias: '证券', latestPrice: 1077.85, changeRate: 1.95, amplitude: 2.48, maxDrawdown: -3.88, turnoverRate: 3.06, mainNetInflow: 1.84, recentTrend: [1, -1, 1, 1, -1, 1, 1, -1] },
    { code: '512800', alias: '银行', latestPrice: 1211.34, changeRate: 0.38, amplitude: 0.96, maxDrawdown: -1.74, turnoverRate: 1.12, mainNetInflow: 0.93, recentTrend: [1, 1, -1, 1, 1, -1, 1, 1] },
    { code: '562510', alias: '旅游', latestPrice: 885.49, changeRate: -0.27, amplitude: 1.68, maxDrawdown: -2.93, turnoverRate: 1.67, mainNetInflow: -0.08, recentTrend: [-1, 1, -1, 1, -1, 1, -1, -1] },
    { code: '159928', alias: '消费', latestPrice: 1011.56, changeRate: 0.84, amplitude: 1.42, maxDrawdown: -2.38, turnoverRate: 1.53, mainNetInflow: 0.35, recentTrend: [1, -1, 1, -1, 1, 1, -1, 1] },
    { code: '512690', alias: '白酒', latestPrice: 972.44, changeRate: -0.49, amplitude: 1.87, maxDrawdown: -3.32, turnoverRate: 1.95, mainNetInflow: -0.26, recentTrend: [-1, -1, 1, -1, 1, -1, 1, -1] },
    { code: '512200', alias: '房地产', latestPrice: 798.22, changeRate: 0.93, amplitude: 2.06, maxDrawdown: -4.17, turnoverRate: 2.22, mainNetInflow: 0.41, recentTrend: [1, -1, -1, 1, -1, 1, 1, -1] },
    { code: '159745', alias: '建筑材料', latestPrice: 856.9, changeRate: -0.14, amplitude: 1.33, maxDrawdown: -2.71, turnoverRate: 1.48, mainNetInflow: -0.03, recentTrend: [-1, 1, -1, 1, -1, -1, 1, -1] },
    { code: '512170', alias: '医疗', latestPrice: 944.68, changeRate: -1.03, amplitude: 2.57, maxDrawdown: -5.02, turnoverRate: 2.76, mainNetInflow: -0.95, recentTrend: [-1, 1, -1, -1, 1, -1, -1, 1] },
  ],
  conclusion: '维持主线，降低追高频率。主线逻辑未破坏，但高位波动显著抬升，优先聚焦有业绩与订单验证的核心环节。',
  content: (
    <>
      <p>
        今天这盘，表面看只是指数分化，里面其实是资金在高速换座位。上证指数收在4057.74点，跌0.27%；深证成指收15340.36点，跌1.51%；创业板指收3950.94点，跌2.15%；科创50收1663.69点，跌5.00%。四个数字摆在一起，画面就很清楚：大盘没塌，但高弹性的科技成长被砸得比较疼。
      </p>
      <p>
        <strong>第一，今天市场到底怎么走。</strong>
      </p>
      <p>
        早盘不是没有抵抗。指数开出来以后，资金还试着往前冲，像雨天路口那种大家都想抢一个绿灯。但越往后走，分歧越明显。上证相对稳，说明权重、红利、部分周期和防御方向还在托底；深成指和创业板指明显弱，说明成长股这边抛压更重；科创50跌到5%，基本就是把全天情绪的温度计直接摁到了冰水里。
      </p>
      <p>
        所以今天不能简单说是普跌，也不能说是全面退潮。更准确的说法是：指数被大块头撑住了，弹性资产被资金重新估价。场子还在，桌子也没掀，但最热闹的那几桌开始有人结账离席。
      </p>
      <p>
        <strong>第二，资金在买什么、卖什么。</strong>
      </p>
      <p>
        今天资金最明显的动作，是从高拥挤、高预期、高波动的方向往确定性更强的地方挪。前期涨得猛的科技线，尤其是科创、AI硬件、半导体链条里位置偏高、兑现压力大的票，容易被先卖。不是产业逻辑一夜之间坏了，而是交易层面太挤了。一个房间里人太多，门又不够宽，稍微有人往外走，后面就会互相踩脚。
      </p>
      <p>
        资金愿意留下来的，还是两类东西。一类是有业绩、有订单、有产业趋势支撑的硬逻辑，跌下来有人接。另一类是低波动、现金流、政策预期或者防御属性更强的方向，市场紧张时它们像路边亮着灯的小店，不一定最刺激，但让人想进去躲一躲。
      </p>
      <p>
        <strong>第三，主线逻辑怎么拆。</strong>
      </p>
      <p>
        科技仍然是中期主线，但今天提醒大家一点：主线不等于每天涨，主线更不等于任何位置都能追。AI、算力、半导体、端侧设备，这些产业趋势还在，政策和国产替代的底层逻辑也还在。问题在于，股价跑得太快时，资金会先问一句：兑现在哪里？业绩什么时候落地？估值还能不能继续讲故事？
      </p>
      <p>
        这就是今天的关键矛盾。产业趋势是长线的，交易情绪是短线的。长线像河道，方向大概清楚；短线像水面，风一吹就起浪。今天跌得多的，不全是逻辑坏了，很多是水面风浪太大。后面真正值得看的，是那些在调整里还能缩量、还能守住趋势、还能有资金回流的细分方向。
      </p>
      <p>
        反过来，轮动和避险也要分清楚。有些方向涨，是因为自己基本面变好了；有些方向涨，只是因为别人跌了，资金临时找个地方站一站。前者可能走成阶段主线，后者更多是过桥板块。过桥可以走，但别把桥当成家。
      </p>
      <p>
        <strong>第四，后面看什么信号。</strong>
      </p>
      <p>
        如果接下来上证继续稳住，深成指、创业板指不再加速杀，科创50能从急跌变成横住，那说明市场只是做一次风险偏好的降温，后面还有机会回到“主线震荡、分支轮动”的节奏。尤其要看科技核心票有没有缩量企稳，板块内部有没有从少数抱团扩散到更多细分。
      </p>
      <p>
        但如果科创继续放量下探，创业板也跟着破位，强势股补跌越来越多，那就要把防守放到前面。那种情况下，别急着证明自己看得远，市场短期看的不是远方，是脚下有没有坑。
      </p>
      <p>
        <strong>第五，对应到操作节奏。</strong>
      </p>
      <p>
        还能看的，依然是产业趋势清楚、业绩能跟上、调整时承接不差的科技核心，以及受益于政策预期和订单验证的细分环节。不能追的，是刚从高位掉下来、成交还没缩、筹码还在松的情绪票。那种票看起来跌了不少，其实可能只是第一口气喘完。
      </p>
      <p>
        节奏上，今天这种盘面不适合把仓位一把推满。更舒服的方式，是保留一点底仓看主线，留出现金等分歧后的确认。涨急了不追，跌急了也不急着捞。先看有没有止跌，再看有没有回流，最后再看能不能带队。
      </p>
      <p>
        总结一句，今天市场的核心矛盾就是：指数还在高位附近撑着，但高弹性资产已经开始接受资金的重新审问。后面行情能不能继续，不看故事讲得多热闹，要看跌下来以后，真正愿意买单的人还在不在。
      </p>
    </>
  ),
};

export default function AfterClosePage() {
  const data = afterCloseData;
  const mainIndexes = data?.mainIndexes ?? [];
  const conclusion = data?.conclusion ?? null;
  const content = data?.content ?? null;
  const sectorTableRows = data?.sectorTableRows ?? [];

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

        <section className='mt-4'>
          <IndexPulseTable rows={sectorTableRows} />
        </section>
        <section className='mt-4 text-[15px] leading-7 text-[#2f2e2b] [&>p+p]:mt-2'>{content}</section>
        {conclusion ? (
          <section>
            <div className='my-[10pt] break-inside-avoid rounded-[3pt] border-l-[2pt] border-[#1b365d] bg-[#faf9f5] px-[12pt] py-[8pt]'>
              <p className='text-[14px] font-medium text-[#1b365d]'>{conclusion}</p>
            </div>
          </section>
        ) : null}
        <ReportFooter />
      </article>
    </main>
  );
}
