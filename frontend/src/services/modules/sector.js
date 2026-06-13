import http from '@/utils/http';

export const sectorQueryKeys = {
  all: ['sector'],
  congestion: (params = {}) => ['sector', 'congestion', params],
};

/**
 * 获取板块拥挤度数据。
 *
 * @param {Object} [params={}] 查询参数。
 * @param {string[]} [params.themeKeys] 主题 key 列表。
 * @param {number} [params.days] 最近交易日数量。
 * @param {import('axios').AxiosRequestConfig<unknown>} [config={}] 额外请求配置。
 * @returns {Promise<unknown>} 板块拥挤度列表。
 */
export const fetchSectorCongestion = (params = {}, config = {}) => {
  return http.get('/api/skill/sector/congestion', params, config);
};

/**
 * 生成板块拥挤度查询配置。
 *
 * @param {Object} [params={}] 查询参数。
 * @param {string[]} [params.themeKeys] 主题 key 列表。
 * @param {number} [params.days] 最近交易日数量。
 * @returns {Object} react-query 查询配置。
 */
export const fetchSectorCongestionQuery = (params = {}) => {
  return {
    queryKey: sectorQueryKeys.congestion(params),
    queryFn: ({ signal }) => {
      return fetchSectorCongestion(params, { signal });
    },
  };
};
