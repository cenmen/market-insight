import etfs from '@/data/etfs';

export const pageLinks = [
  {
    path: '/article/event-timeline',
    title: '最近两周事件时间线',
    description: '盘面事件与资金切换节奏',
  },
  {
    path: '/after-close',
    title: '盘后分析',
    description: '三大指数、板块对照与资金行为复盘',
  },
  {
    path: '/pre-open',
    title: '盘前分析',
    description: '宏观要点、盘前消息与四大指数情景',
  },
];

export const etfPageLinks = Object.values(etfs)
  .map(function mapEtfPage(data) {
    return {
      path: `/etf/${data.etf.code}`,
      title: `${data.etf.name}（${data.etf.code}）分析`,
      description: data.report?.coreJudgment || data.etf.intro,
    };
  })
  .sort(function sortByCode(a, b) {
    return a.path.localeCompare(b.path);
  });
