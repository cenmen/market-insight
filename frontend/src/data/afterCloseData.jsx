const afterCloseData = {
  mainIndexes: [
    { name: '上证指数', indexValue: '4075.10', changeRate: 0.43 },
    { name: '创业板指', indexValue: '4055.87', changeRate: 2.66 },
    { name: '科创50', indexValue: '1690.56', changeRate: 1.62 },
  ],
  tableDataSource: [
    { key: '588200', name: '芯片', changeRate: 2.39, maxDrawdown: 4.95, maxTRise: 1558, turnoverRate: 3.56, mainNetInflow: -11.62, isPinned: true },
    { key: '515880', name: '通信', changeRate: 6.41, maxDrawdown: 6.06, maxTRise: 2460, turnoverRate: 4.02, mainNetInflow: 179.3, isPinned: true },
    { key: '159516', name: '半导体设备', changeRate: 1.81, maxDrawdown: 4.53, maxTRise: 748.6, turnoverRate: 4.98, mainNetInflow: -7.07, isPinned: true },
    { key: '159819', name: '人工智能', changeRate: 2.87, maxDrawdown: 4.13, maxTRise: 1810, turnoverRate: 2.37, mainNetInflow: 26.16 },
    { key: '562500', name: '机器人', changeRate: 1.57, maxDrawdown: 2.41, maxTRise: 485.4, turnoverRate: 3.19, mainNetInflow: 1.94 },
    { key: '159206', name: '卫星', changeRate: 0.4, maxDrawdown: 4.4, maxTRise: 473.2, turnoverRate: 3.11, mainNetInflow: -13.5 },
    { key: '516160', name: '新能源', changeRate: -0.43, maxDrawdown: 3.47, maxTRise: 1381, turnoverRate: 2.14, mainNetInflow: -32.73 },
    { key: '159755', name: '电池', changeRate: 0.83, maxDrawdown: 3.08, maxTRise: 777.2, turnoverRate: 2.9, mainNetInflow: 1.32 },
    { key: '515790', name: '光伏', changeRate: -1.05, maxDrawdown: 4.35, maxTRise: 695.2, turnoverRate: 3.33, mainNetInflow: -25.27 },
    { key: '512400', name: '有色', changeRate: 3.46, maxDrawdown: 4.78, maxTRise: 1049, turnoverRate: 2.69, mainNetInflow: 67.81 },
    { key: '159326', name: '电网设备', changeRate: 0.49, maxDrawdown: 3.27, maxTRise: 886.9, turnoverRate: 3.73, mainNetInflow: 13.75, isPinned: true },
    { key: '159870', name: '化工', changeRate: 0.3, maxDrawdown: 2.27, maxTRise: 479.3, turnoverRate: 1.47, mainNetInflow: -0.02 },
    { key: '159865', name: '养殖', changeRate: -2.16, maxDrawdown: 2.54, maxTRise: 72.82, turnoverRate: 1.45, mainNetInflow: -7.29 },
    { key: '159825', name: '农业', changeRate: -1.36, maxDrawdown: 2.2, maxTRise: 135.3, turnoverRate: 1.4, mainNetInflow: -6.69 },
    { key: '515220', name: '煤炭', changeRate: -1.0, maxDrawdown: 5.14, maxTRise: 309.2, turnoverRate: 2.83, mainNetInflow: -13.65 },
    { key: '516150', name: '稀土', changeRate: 1.36, maxDrawdown: 4.22, maxTRise: 413.2, turnoverRate: 2.46, mainNetInflow: 2.62 },
    { key: '159732', name: '消费电子', changeRate: 2.49, maxDrawdown: 4.95, maxTRise: 2234, turnoverRate: 5.12, mainNetInflow: 1.94 },
    { key: '510880', name: '红利', changeRate: -0.05, maxDrawdown: 2.12, maxTRise: 469.3, turnoverRate: 0.32, mainNetInflow: -2.83 },
    { key: '512880', name: '证券', changeRate: 0.14, maxDrawdown: 1.63, maxTRise: 323.9, turnoverRate: 0.99, mainNetInflow: -4.93 },
    { key: '512800', name: '银行', changeRate: 0.61, maxDrawdown: 1.47, maxTRise: 300.4, turnoverRate: 0.28, mainNetInflow: 4.56 },
    { key: '562510', name: '旅游', changeRate: -1.82, maxDrawdown: 1.89, maxTRise: 106.6, turnoverRate: 1.26, mainNetInflow: -3.44 },
    { key: '159928', name: '消费', changeRate: -1.58, maxDrawdown: 1.63, maxTRise: 256.1, turnoverRate: 1.08, mainNetInflow: -17.0 },
    { key: '512690', name: '白酒', changeRate: -1.59, maxDrawdown: 2.37, maxTRise: 169.9, turnoverRate: 1.6, mainNetInflow: -10.25 },
    { key: '512200', name: '房地产', changeRate: -1.73, maxDrawdown: 2.45, maxTRise: 188.6, turnoverRate: 2.04, mainNetInflow: -4.9 },
    { key: '159745', name: '建筑材料', changeRate: -2.03, maxDrawdown: 2.24, maxTRise: 79.65, turnoverRate: 1.59, mainNetInflow: -3.89 },
    { key: '512170', name: '医疗', changeRate: -0.92, maxDrawdown: 1.78, maxTRise: 210.9, turnoverRate: 1.55, mainNetInflow: -6.33 },
  ],
  conclusion: '操作节奏上，别把结构行情当普涨行情。主线回调可以观察，高潮追涨要谨慎。仓位上保持弹性，核心方向不补跌、成交不塌，可以继续看；如果高位科技开始放量滞涨，后排跟不上，就要适当防守。',
  content: (
    <>
      <p>今天盘面看起来挺热闹，但别只看指数。</p>
      <p>6月2日收盘，上证指数涨0.43%，深成指涨1.63%，创业板指涨2.66%。沪深两市成交接近2.8万亿元，量还在高位。但个股并不好看，全市场3800多只股票下跌。也就是说，指数红得挺体面，账户未必都舒服。</p>
      <p>今天真正强的，是AI硬件链。</p>
      <p>CPO、光模块、光纤、PCB、电子元件、MLCC、AI PC这些方向都在涨。逻辑也不难理解，昨晚美股先把火点起来了。英伟达大涨超6%，美光涨逾6%，甲骨文涨近10%。一个代表GPU和端侧AI，一个代表存储和HBM，一个代表云和算力需求。美股这么一拉，A股资金今天自然去找映射。</p>
      <p>英伟达强，资金就找光模块、CPO、AI PC、服务器链。美光强，就找存储、MLCC、电子元件。甲骨文强，就找云计算、数据中心、算力基础设施。</p>
      <p>所以今天不是随便炒科技，而是沿着“海外AI大票上涨，到A股硬件链映射”这条线在走。</p>
      <p>弱的方向也很明显。影视、游戏、体育、互联网电商、AI应用这些跌得比较多。资金今天不太爱听故事，更想看订单、看涨价、看产业趋势。那些只有概念、没有兑现的方向，就容易被先扔到一边。</p>
      <p>这也是今天盘面的核心矛盾：指数是被硬科技拉起来的，但市场不是普涨。少数主线在开席，大多数板块还在门口排队。</p>
      <p>后面要看三个信号。</p>
      <p>第一个，看成交额能不能维持。现在两市成交还在高位，这是行情继续折腾的基础。如果指数上涨但成交缩得很快，那就要小心变成权重硬撑。</p>
      <p>第二个，看CPO、PCB、光模块能不能扛住分歧。真正的主线，不是一天大涨，而是回调有人接，分歧后还能修复。</p>
      <p>第三个，看隔夜美股科技股脸色。英伟达、美光、甲骨文如果继续强，A股AI硬件链就还有锚。如果它们突然大跌，第二天A股高位方向就容易晃。</p>
      <p>能看的，还是AI硬件链里有产业支撑的环节，比如CPO、光模块、PCB、AI PC、存储、MLCC、服务器、铜缆高速连接。不能追的，是那种盘中突然拉起来、没有业绩也没有产业催化的纯题材。</p>
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
