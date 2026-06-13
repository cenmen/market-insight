import axios from 'axios';
import { toast } from 'sonner';

const DEFAULT_ERROR_MESSAGE = 'Request failed';

export class RequestError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = 'RequestError';
    this.status = options.status ?? 500;
    this.code = options.code ?? 1;
    this.data = options.data ?? null;
    this.requestId = options.requestId ?? null;
  }
}

class Http {
  constructor() {
    this.instance = axios.create();

    this.instance.interceptors.response.use(
      this.handleSuccessResponse,
      this.handleErrorResponse,
    );
  }

  /**
   * 处理成功响应并解包后端 ResponseModel。
   *
   * @param {import('axios').AxiosResponse<unknown>} response 响应对象。
   * @returns {unknown} 解包后的响应数据。
   */
  handleSuccessResponse(response) {
    const payload = response.data;

    if (Http.isResponseModel(payload)) {
      if (!payload.success) {
        const message = payload.message || DEFAULT_ERROR_MESSAGE;
        toast.error(message);
        throw new RequestError(message, {
          status: response.status,
          code: payload.code,
          data: payload.data,
          requestId: payload.request_id,
        });
      }

      return payload.data;
    }

    return payload;
  }

  /**
   * 处理失败响应并统一抛出业务错误。
   *
   * @param {import('axios').AxiosError<unknown>} error axios 错误对象。
   * @returns {Promise<never>} 抛出标准化后的错误。
   */
  handleErrorResponse(error) {
    const payload = error.response?.data;
    const message = payload?.message || error.message || DEFAULT_ERROR_MESSAGE;

    if (payload && typeof payload === 'object') {
      toast.error(message);
      throw new RequestError(message, {
        status: error.response?.status,
        code: payload.code,
        data: payload.data,
        requestId: payload.request_id,
      });
    }

    if (error.code !== 'ERR_CANCELED') {
      toast.error(message);
    }

    throw new RequestError(message, {
      status: error.response?.status,
    });
  }

  /**
   * 判断数据是否为后端统一响应结构。
   *
   * @param {unknown} value 待判断数据。
   * @returns {boolean} 是否为 ResponseModel。
   */
  static isResponseModel(value) {
    return typeof value === 'object'
      && value !== null
      && Object.prototype.hasOwnProperty.call(value, 'success');
  }

  /**
   * 发起通用请求。
   *
   * @param {import('axios').AxiosRequestConfig<unknown>} config axios 请求配置。
   * @returns {Promise<unknown>} 响应结果。
   */
  request(config) {
    return this.instance.request(config);
  }

  /**
   * 发起 GET 请求。
   *
   * @param {string} url 请求地址。
   * @param {Record<string, unknown>} [params] 查询参数。
   * @param {import('axios').AxiosRequestConfig<unknown>} [config] 额外配置。
   * @returns {Promise<unknown>} 响应结果。
   */
  get(url, params, config = {}) {
    return this.request({
      ...config,
      url,
      method: 'GET',
      params,
    });
  }

  /**
   * 发起 POST 请求。
   *
   * @param {string} url 请求地址。
   * @param {unknown} [data] 请求体。
   * @param {import('axios').AxiosRequestConfig<unknown>} [config] 额外配置。
   * @returns {Promise<unknown>} 响应结果。
   */
  post(url, data, config = {}) {
    return this.request({
      ...config,
      url,
      method: 'POST',
      data,
    });
  }

  /**
   * 发起 PUT 请求。
   *
   * @param {string} url 请求地址。
   * @param {unknown} [data] 请求体。
   * @param {import('axios').AxiosRequestConfig<unknown>} [config] 额外配置。
   * @returns {Promise<unknown>} 响应结果。
   */
  put(url, data, config = {}) {
    return this.request({
      ...config,
      url,
      method: 'PUT',
      data,
    });
  }

  /**
   * 发起 DELETE 请求。
   *
   * @param {string} url 请求地址。
   * @param {Record<string, unknown>} [params] 查询参数。
   * @param {import('axios').AxiosRequestConfig<unknown>} [config] 额外配置。
   * @returns {Promise<unknown>} 响应结果。
   */
  delete(url, params, config = {}) {
    return this.request({
      ...config,
      url,
      method: 'DELETE',
      params,
    });
  }
}

const http = new Http();

export default http;
