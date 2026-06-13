import http from '@/utils/http';

/**
 * 获取 ETF 跟踪配置。
 *
 * @returns {Promise<unknown>} ETF 配置、启用配置与启用主题 key。
 */
export const fetchEtfTrackingSetting = () => {
  return http.get('/api/setting/etf-tracking');
};
