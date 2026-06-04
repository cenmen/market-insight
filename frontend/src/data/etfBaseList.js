const etfBaseList = [
  { code: '588200', name: '科创芯片ETF嘉实', indexCode: '000685', indexName: '上证科创板芯片指数', alias: '芯片' },
  { code: '515880', name: '通信ETF国泰', indexCode: '931160', indexName: '中证全指通信设备指数', alias: '通信' },
  { code: '159516', name: '半导体设备ETF国泰', indexCode: '931743', indexName: '中证半导体材料设备主题指数', alias: '半导体设备' },
  { code: '159819', name: '人工智能ETF易方达', indexCode: '930713', indexName: '中证人工智能主题指数', alias: '人工智能' },
  { code: '562500', name: '机器人ETF华夏', indexCode: 'H30590', indexName: '中证机器人指数', alias: '机器人' },
  { code: '159206', name: '卫星ETF永赢', indexCode: '980018', indexName: '卫星通信指数', alias: '卫星' },
  { code: '516160', name: '新能源ETF南方', indexCode: '399808', indexName: '中证新能源指数', alias: '新能源' },
  { code: '159755', name: '电池ETF广发', indexCode: '980032', indexName: '新能电池指数', alias: '电池' },
  { code: '515790', name: '光伏ETF华泰柏瑞', indexCode: '931151', indexName: '中证光伏产业指数', alias: '光伏' },
  { code: '512400', name: '有色金属ETF南方', indexCode: '000819', indexName: '有色金属指数', alias: '有色' },
  { code: '159326', name: '电网设备ETF华夏', indexCode: '931994', indexName: '电网设备主题指数', alias: '电网设备' },
  { code: '159870', name: '化工ETF鹏华', indexCode: '000813', indexName: '细分化工指数', alias: '化工' },
  { code: '159865', name: '养殖ETF国泰', indexCode: '930707', indexName: '中证畜牧养殖指数', alias: '养殖' },
  { code: '159825', name: '农业ETF富国', indexCode: '000949', indexName: '中证农业指数', alias: '农业' },
  { code: '515220', name: '煤炭ETF国泰', indexCode: '399998', indexName: '中证煤炭指数', alias: '煤炭' },
  { code: '516150', name: '稀土ETF嘉实', indexCode: '930598', indexName: '中证稀土产业指数', alias: '稀土' },
  { code: '159732', name: '消费电子ETF华夏', indexCode: '980030', indexName: '消费电子指数', alias: '消费电子' },
  { code: '510880', name: '红利ETF华泰柏瑞', indexCode: '000015', indexName: '上证红利指数', alias: '红利' },
  { code: '512880', name: '证券ETF国泰', indexCode: '399975', indexName: '证券公司指数', alias: '证券' },
  { code: '512800', name: '银行ETF华宝', indexCode: '399986', indexName: '中证银行指数', alias: '银行' },
  { code: '562510', name: '旅游ETF华夏', indexCode: '930633', indexName: '中证旅游指数', alias: '旅游' },
  { code: '159928', name: '消费ETF汇添富', indexCode: '000932', indexName: '中证主要消费指数', alias: '消费' },
  { code: '512690', name: '酒ETF鹏华', indexCode: '399987', indexName: '中证酒指数', alias: '白酒' },
  { code: '512200', name: '房地产ETF南方', indexCode: '931775', indexName: '房地产指数', alias: '房地产' },
  { code: '159745', name: '建材ETF国泰', indexCode: '931009', indexName: '建筑材料指数', alias: '建筑材料' },
  { code: '512170', name: '医疗ETF华宝', indexCode: '399989', indexName: '中证医疗指数', alias: '医疗' },
];

function buildEtfAliasMap(list) {
  const aliasMap = {};

  for (const item of list) {
    aliasMap[item.alias] = item;
  }

  return aliasMap;
}

const etfAliasMap = buildEtfAliasMap(etfBaseList);

export default etfBaseList;
export { etfAliasMap };
