import etfs from '@/data/etfs';

/**
 * @param {any} data
 * @returns {{ path: string; title: string; description: string }}
 */
function mapEtfPage(data) {
  return {
    path: `/etf/${data.etf.code}`,
    title: `${data.etf.name}（${data.etf.code}）分析`,
    description: data.report?.coreJudgment || data.etf.intro,
  };
}

/**
 * @param {{ path: string }} a
 * @param {{ path: string }} b
 */
function sortByCode(a, b) {
  return a.path.localeCompare(b.path);
}

export const etfPageLinks = Object.values(etfs).map(mapEtfPage).sort(sortByCode);
