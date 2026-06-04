const record202606 = [
  {
    date: '2026-06-04',
    title: '博通财报强但高位杀估值',
    source: 'Broadcom 财报、Investing.com',
    statusTag: { label: '利空', kind: 'bearish' },
    summary:
      '美东 6 月 3 日盘后，博通公布 FY2026 Q2 财报：收入 221.87 亿美元、AI 半导体收入 108 亿美元，同比增长 143%，Q3 收入指引约 294 亿美元。但股价在 6 月 4 日盘前一度下跌约 14%，市场交易的是“高预期没有继续上修”的落差，AI 硬件链短线容错率下降。',
    tags: [
      { label: 'AVGO 盘前 -14%', kind: 'stock', change: -14 },
      { label: 'AI ASIC', kind: 'default' },
      { label: '高位分歧', kind: 'bearish' },
    ],
    concepts: ['芯片', '通信', '人工智能', '消费电子'],
  },
  {
    date: '2026-06-03',
    title: 'SpaceX IPO 发行规模更新',
    source: 'Axios、SEC 文件',
    statusTag: { label: '利好', kind: 'bullish' },
    summary:
      'SpaceX 已在 5 月 20 日公开 IPO 申请文件，6 月 3 日进一步披露拟发行约 5.556 亿股、每股 135 美元，预计募资约 750 亿美元，对应估值约 1.77 万亿美元。事件会强化“商业航天 + 星链 + AI 数据中心”的长期叙事，但上市规模过大也可能带来资金抽水效应。',
    tags: [
      { label: '募资约 750 亿美元', kind: 'bullish' },
      { label: 'SPCX', kind: 'default' },
      { label: '资金抽水', kind: 'neutral' },
    ],
    concepts: ['卫星', '人工智能'],
  },
  {
    date: '2026-06-02',
    title: '宇树科技 IPO 进入注册阶段',
    source: '新华社、上交所披露',
    statusTag: { label: '利好', kind: 'bullish' },
    summary:
      '宇树科技 6 月 1 日通过科创板上市委审议，6 月 2 日审核状态更新为“提交注册”，拟募资约 42.02 亿元。公司 2025 年收入接近 17 亿元，2026 年上半年收入预计 10.52 亿至 11.28 亿元，具身智能从主题炒作进入资本化验证阶段。',
    tags: [
      { label: '提交注册', kind: 'bullish' },
      { label: '拟募资 42.02 亿', kind: 'default' },
      { label: '具身智能', kind: 'default' },
    ],
    concepts: ['机器人'],
  },
  {
    date: '2026-06-02',
    title: '台北 PC 大会聚焦 AI 供应链',
    source: 'COMPUTEX、TAITRA',
    statusTag: { label: '利好', kind: 'bullish' },
    summary:
      'COMPUTEX 2026 主展期为台北时间 6 月 2 日至 6 月 5 日，主题为“AI Together”，规模约 1500 家参展商、6000 个展位。展会主线从 AI PC 扩展到 AI 服务器、机器人、散热、电源与制造代工，台系供应链继续成为全球 AI 硬件扩产的观察窗口。',
    tags: [
      { label: 'COMPUTEX 6/2-6/5', kind: 'default' },
      { label: 'AI PC', kind: 'bullish' },
      { label: '台系供应链', kind: 'default' },
    ],
    concepts: ['人工智能', '通信', '消费电子'],
  },
  {
    date: '2026-06-01',
    title: '英伟达 GTC Taipei 后股价大涨',
    source: 'NVIDIA、StockStory、Motley Fool',
    statusTag: { label: '利好', kind: 'bullish' },
    summary:
      '台北时间 6 月 1 日，黄仁勋在 GTC Taipei / COMPUTEX 主题演讲中发布 RTX Spark PC 平台，并确认 Vera Rubin 平台进入量产。英伟达股价当日盘中涨幅约 5% 至 6%，市场重新定价其从数据中心延伸到 PC、机器人和物理 AI 的平台能力。',
    tags: [
      { label: 'NVDA +5%~6%', kind: 'stock', change: 5.5 },
      { label: 'Vera Rubin', kind: 'bullish' },
      { label: 'RTX Spark', kind: 'default' },
    ],
    concepts: ['芯片', '人工智能', '机器人'],
  },
];

export default record202606;
