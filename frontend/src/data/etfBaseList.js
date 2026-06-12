const etfBaseList = [
  { code: '588200', name: '科创芯片ETF嘉实', indexCode: '1B0685', indexName: '芯片', key: 'chip' },
  { code: '515880', name: '通信ETF国泰', indexCode: '931160', indexName: '通信', key: 'communication' },
  { code: '159516', name: '半导体设备ETF国泰', indexCode: '931743', indexName: '半导体设备', key: 'semiconductorEquipment' },
  { code: '159819', name: '人工智能ETF易方达', indexCode: null, indexName: '人工智能', key: 'ai' },
  { code: '562500', name: '机器人ETF华夏', indexCode: null, indexName: '机器人', key: 'robot' },
  { code: '159206', name: '卫星ETF永赢', indexCode: null, indexName: '卫星', key: 'satellite' },
  { code: '516160', name: '新能源ETF南方', indexCode: null, indexName: '新能源', key: 'newEnergy' },
  { code: '159755', name: '电池ETF广发', indexCode: null, indexName: '电池', key: 'battery' },
  { code: '515790', name: '光伏ETF华泰柏瑞', indexCode: null, indexName: '光伏', key: 'solar' },
  { code: '512400', name: '有色金属ETF南方', indexCode: null, indexName: '有色', key: 'nonFerrous' },
  { code: '159326', name: '电网设备ETF华夏', indexCode: null, indexName: '电网设备', key: 'powerGrid' },
  { code: '159870', name: '化工ETF鹏华', indexCode: null, indexName: '化工', key: 'chemical' },
  { code: '159865', name: '养殖ETF国泰', indexCode: null, indexName: '养殖', key: 'breeding' },
  { code: '159825', name: '农业ETF富国', indexCode: null, indexName: '农业', key: 'agriculture' },
  { code: '515220', name: '煤炭ETF国泰', indexCode: null, indexName: '煤炭', key: 'coal' },
  { code: '516150', name: '稀土ETF嘉实', indexCode: null, indexName: '稀土', key: 'rareEarth' },
  { code: '159732', name: '消费电子ETF华夏', indexCode: null, indexName: '消费电子', key: 'consumerElectronics' },
  { code: '510880', name: '红利ETF华泰柏瑞', indexCode: null, indexName: '红利', key: 'dividend' },
  { code: '512880', name: '证券ETF国泰', indexCode: null, indexName: '证券', key: 'brokerage' },
  { code: '512800', name: '银行ETF华宝', indexCode: null, indexName: '银行', key: 'bank' },
  { code: '562510', name: '旅游ETF华夏', indexCode: null, indexName: '旅游', key: 'tourism' },
  { code: '159928', name: '消费ETF汇添富', indexCode: null, indexName: '消费', key: 'consumer' },
  { code: '512690', name: '酒ETF鹏华', indexCode: null, indexName: '白酒', key: 'liquor' },
  { code: '512200', name: '房地产ETF南方', indexCode: null, indexName: '房地产', key: 'realEstate' },
  { code: '159745', name: '建材ETF国泰', indexCode: null, indexName: '建筑材料', key: 'buildingMaterials' },
  { code: '512170', name: '医疗ETF华宝', indexCode: null, indexName: '医疗', key: 'healthcare' },
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
