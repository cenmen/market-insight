import http from '@/utils/http';

/**
 * 获取 ETF 跟踪配置。
 *
 * @returns {Promise<unknown>} ETF 跟踪配置数组。
 */
export const fetchEtfTrackingSetting = () => {
  return http.get('/api/setting/etf-tracking');
};
