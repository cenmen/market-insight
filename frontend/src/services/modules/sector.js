import http from '@/utils/http';

/**
 * 获取板块拥挤度数据。
 *
 * @param {Object} [params={}] 查询参数。
 * @param {string} [params.themeKeys] 主题 key 列表，逗号分隔。
 * @param {number} [params.days] 最近交易日数量。
 * @returns {Promise<unknown>} 板块拥挤度列表。
 */
export const fetchSectorCongestion = (params = {}) => {
  return http.get('/api/skill/sector/congestion', params);
};
