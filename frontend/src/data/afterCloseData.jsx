const afterCloseData = {
  mainIndexes: [
    { name: '上证指数', indexValue: '4057.74', changeRate: -0.27 },
    { name: '创业板指', indexValue: '3950.94', changeRate: -2.15 },
    { name: '科创50', indexValue: '1663.69', changeRate: -5.0 },
  ],
  tableDataSource: [
    { key: '588200', name: '芯片', changeRate: 1.23, maxDrawdown: -4.51, maxTRise: 2.45, turnoverRate: 3.18, mainNetInflow: 1.26, isPinned: true },
    { key: '515880', name: '通信', changeRate: -0.58, maxDrawdown: -3.06, maxTRise: 1.77, turnoverRate: 2.44, mainNetInflow: -0.85, isPinned: true },
    { key: '159516', name: '半导体设备', changeRate: -1.16, maxDrawdown: -5.23, maxTRise: 2.91, turnoverRate: 4.02, mainNetInflow: -1.12, isPinned: true },
    { key: '159819', name: '人工智能', changeRate: 2.11, maxDrawdown: -6.34, maxTRise: 3.84, turnoverRate: 5.15, mainNetInflow: 2.68 },
    { key: '562500', name: '机器人', changeRate: 0.73, maxDrawdown: -4.62, maxTRise: 2.22, turnoverRate: 3.29, mainNetInflow: 0.44 },
    { key: '159206', name: '卫星', changeRate: -0.94, maxDrawdown: -5.48, maxTRise: 2.41, turnoverRate: 2.88, mainNetInflow: -0.36 },
    { key: '516160', name: '新能源', changeRate: 1.34, maxDrawdown: -4.95, maxTRise: 2.69, turnoverRate: 3.72, mainNetInflow: 1.15 },
    { key: '159755', name: '电池', changeRate: -0.72, maxDrawdown: -5.11, maxTRise: 2.13, turnoverRate: 2.97, mainNetInflow: -0.57 },
    { key: '515790', name: '光伏', changeRate: 0.48, maxDrawdown: -4.21, maxTRise: 1.96, turnoverRate: 2.63, mainNetInflow: 0.22 },
    { key: '512400', name: '有色', changeRate: 1.67, maxDrawdown: -3.75, maxTRise: 2.58, turnoverRate: 2.51, mainNetInflow: 1.91 },
    { key: '159326', name: '电网设备', changeRate: 0.89, maxDrawdown: -3.42, maxTRise: 1.84, turnoverRate: 2.19, mainNetInflow: 0.68, isPinned: true },
    { key: '159870', name: '化工', changeRate: -0.31, maxDrawdown: -2.87, maxTRise: 1.53, turnoverRate: 1.98, mainNetInflow: -0.14 },
    { key: '159865', name: '养殖', changeRate: 0.56, maxDrawdown: -3.03, maxTRise: 1.62, turnoverRate: 1.86, mainNetInflow: 0.19 },
    { key: '159825', name: '农业', changeRate: 0.42, maxDrawdown: -2.65, maxTRise: 1.49, turnoverRate: 1.74, mainNetInflow: 0.11 },
    { key: '515220', name: '煤炭', changeRate: 2.08, maxDrawdown: -2.44, maxTRise: 2.11, turnoverRate: 2.33, mainNetInflow: 2.16 },
    { key: '516150', name: '稀土', changeRate: -0.67, maxDrawdown: -4.06, maxTRise: 2.35, turnoverRate: 2.68, mainNetInflow: -0.49 },
    { key: '159732', name: '消费电子', changeRate: 1.72, maxDrawdown: -4.58, maxTRise: 2.74, turnoverRate: 3.41, mainNetInflow: 1.47 },
    { key: '510880', name: '红利', changeRate: 0.63, maxDrawdown: -1.96, maxTRise: 1.24, turnoverRate: 1.29, mainNetInflow: 0.77 },
    { key: '512880', name: '证券', changeRate: 1.95, maxDrawdown: -3.88, maxTRise: 2.48, turnoverRate: 3.06, mainNetInflow: 1.84 },
    { key: '512800', name: '银行', changeRate: 0.38, maxDrawdown: -1.74, maxTRise: 0.96, turnoverRate: 1.12, mainNetInflow: 0.93 },
    { key: '562510', name: '旅游', changeRate: -0.27, maxDrawdown: -2.93, maxTRise: 1.68, turnoverRate: 1.67, mainNetInflow: -0.08 },
    { key: '159928', name: '消费', changeRate: 0.84, maxDrawdown: -2.38, maxTRise: 1.42, turnoverRate: 1.53, mainNetInflow: 0.35 },
    { key: '512690', name: '白酒', changeRate: -0.49, maxDrawdown: -3.32, maxTRise: 1.87, turnoverRate: 1.95, mainNetInflow: -0.26 },
    { key: '512200', name: '房地产', changeRate: 0.93, maxDrawdown: -4.17, maxTRise: 2.06, turnoverRate: 2.22, mainNetInflow: 0.41 },
    { key: '159745', name: '建筑材料', changeRate: -0.14, maxDrawdown: -2.71, maxTRise: 1.33, turnoverRate: 1.48, mainNetInflow: -0.03 },
    { key: '512170', name: '医疗', changeRate: -1.03, maxDrawdown: -5.02, maxTRise: 2.57, turnoverRate: 2.76, mainNetInflow: -0.95 },
  ],
  conclusion: '维持主线，降低追高频率。主线逻辑未破坏，但高位波动显著抬升，优先聚焦有业绩与订单验证的核心环节。',
  content: (
    <>
      <p>今天这盘，表面看只是指数分化，里面其实是资金在高速换座位。上证指数收在4057.74点，跌0.27%；深证成指收15340.36点，跌1.51%；创业板指收3950.94点，跌2.15%；科创50收1663.69点，跌5.00%。四个数字摆在一起，画面就很清楚：大盘没塌，但高弹性的科技成长被砸得比较疼。</p>
      <p><strong>第一，今天市场到底怎么走。</strong></p>
      <p>早盘不是没有抵抗。指数开出来以后，资金还试着往前冲，像雨天路口那种大家都想抢一个绿灯。但越往后走，分歧越明显。上证相对稳，说明权重、红利、部分周期和防御方向还在托底；深成指和创业板指明显弱，说明成长股这边抛压更重；科创50跌到5%，基本就是把全天情绪的温度计直接摁到了冰水里。</p>
      <p>所以今天不能简单说是普跌，也不能说是全面退潮。更准确的说法是：指数被大块头撑住了，弹性资产被资金重新估价。场子还在，桌子也没掀，但最热闹的那几桌开始有人结账离席。</p>
      <p><strong>第二，资金在买什么、卖什么。</strong></p>
      <p>今天资金最明显的动作，是从高拥挤、高预期、高波动的方向往确定性更强的地方挪。前期涨得猛的科技线，尤其是科创、AI硬件、半导体链条里位置偏高、兑现压力大的票，容易被先卖。不是产业逻辑一夜之间坏了，而是交易层面太挤了。一个房间里人太多，门又不够宽，稍微有人往外走，后面就会互相踩脚。</p>
      <p>资金愿意留下来的，还是两类东西。一类是有业绩、有订单、有产业趋势支撑的硬逻辑，跌下来有人接。另一类是低波动、现金流、政策预期或者防御属性更强的方向，市场紧张时它们像路边亮着灯的小店，不一定最刺激，但让人想进去躲一躲。</p>
      <p><strong>第三，主线逻辑怎么拆。</strong></p>
      <p>科技仍然是中期主线，但今天提醒大家一点：主线不等于每天涨，主线更不等于任何位置都能追。AI、算力、半导体、端侧设备，这些产业趋势还在，政策和国产替代的底层逻辑也还在。问题在于，股价跑得太快时，资金会先问一句：兑现在哪里？业绩什么时候落地？估值还能不能继续讲故事？</p>
      <p>这就是今天的关键矛盾。产业趋势是长线的，交易情绪是短线的。长线像河道，方向大概清楚；短线像水面，风一吹就起浪。今天跌得多的，不全是逻辑坏了，很多是水面风浪太大。后面真正值得看的，是那些在调整里还能缩量、还能守住趋势、还能有资金回流的细分方向。</p>
      <p>反过来，轮动和避险也要分清楚。有些方向涨，是因为自己基本面变好了；有些方向涨，只是因为别人跌了，资金临时找个地方站一站。前者可能走成阶段主线，后者更多是过桥板块。过桥可以走，但别把桥当成家。</p>
      <p><strong>第四，后面看什么信号。</strong></p>
      <p>如果接下来上证继续稳住，深成指、创业板指不再加速杀，科创50能从急跌变成横住，那说明市场只是做一次风险偏好的降温，后面还有机会回到“主线震荡、分支轮动”的节奏。尤其要看科技核心票有没有缩量企稳，板块内部有没有从少数抱团扩散到更多细分。</p>
      <p>但如果科创继续放量下探，创业板也跟着破位，强势股补跌越来越多，那就要把防守放到前面。那种情况下，别急着证明自己看得远，市场短期看的不是远方，是脚下有没有坑。</p>
      <p><strong>第五，对应到操作节奏。</strong></p>
      <p>还能看的，依然是产业趋势清楚、业绩能跟上、调整时承接不差的科技核心，以及受益于政策预期和订单验证的细分环节。不能追的，是刚从高位掉下来、成交还没缩、筹码还在松的情绪票。那种票看起来跌了不少，其实可能只是第一口气喘完。</p>
      <p>节奏上，今天这种盘面不适合把仓位一把推满。更舒服的方式，是保留一点底仓看主线，留出现金等分歧后的确认。涨急了不追，跌急了也不急着捞。先看有没有止跌，再看有没有回流，最后再看能不能带队。</p>
      <p>总结一句，今天市场的核心矛盾就是：指数还在高位附近撑着，但高弹性资产已经开始接受资金的重新审问。后面行情能不能继续，不看故事讲得多热闹，要看跌下来以后，真正愿意买单的人还在不在。</p>
    </>
  ),
};

function sortByChangeRateDesc(a, b) {
  return Number(b.changeRate) - Number(a.changeRate);
}

function pushUniqueByKey(targetList, record, usedKeySet) {
  if (usedKeySet.has(record.key)) return;
  targetList.push(record);
  usedKeySet.add(record.key);
}

function buildProcessedTableDataSource(rows) {
  const sortedRows = [...rows].sort(sortByChangeRateDesc);
  const topGainers = sortedRows.slice(0, 4);
  const topLosers = sortedRows.slice(-4);
  const pinnedRows = sortedRows.filter(function filterPinned(row) {
    return row.isPinned === true;
  });
  const usedKeySet = new Set();
  const finalRows = [];

  pinnedRows.forEach(function addPinned(row) {
    pushUniqueByKey(finalRows, row, usedKeySet);
  });

  [...topGainers, ...topLosers].forEach(function addExtremes(row) {
    if (finalRows.length >= 8) return;
    pushUniqueByKey(finalRows, row, usedKeySet);
  });

  sortedRows.forEach(function fillRemaining(row) {
    if (finalRows.length >= 8) return;
    pushUniqueByKey(finalRows, row, usedKeySet);
  });

  return finalRows.sort(sortByChangeRateDesc);
}

const processedAfterCloseData = {
  ...afterCloseData,
  tableDataSource: buildProcessedTableDataSource(afterCloseData.tableDataSource),
};

export default processedAfterCloseData;
