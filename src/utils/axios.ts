import type { AxiosRequestConfig } from 'axios';
import axios from 'axios';
import { type LoadingOptions } from 'element-plus';

/**
 * 根据运行环境获取基础请求URL
 */
export const getUrl = (): string => {
    const value: string = import.meta.env.VITE_AXIOS_BASE_URL as string
    return value == 'getCurrentDomain' ? window.location.protocol + '//' + window.location.host : value
}

interface Options {
    // 是否开启取消重复请求, 默认为 true
    CancelDuplicateRequest?: boolean;
    // 是否开启loading层效果, 默认为false
    loading?: boolean;
    // 是否开启简洁的数据结构响应, 默认为true
    reductDataFormat?: boolean;
    // 是否开启接口错误信息展示,默认为true
    showErrorMessage?: boolean;
    // 是否开启code不为1时的信息提示, 默认为true
    showCodeMessage?: boolean;
    // 是否开启code为1时的信息提示, 默认为false
    showSuccessMessage?: boolean;
    // 当前请求使用另外的用户token
    anotherToken?: string;
}

export function createAxios<Data = any, T = ApiPromise<Data>>(
    axiosConfig: AxiosRequestConfig,
    options: Options = {},
    loading: LoadingOptions = {}
): T {
    const axiosInstance = axios.create({
        baseURL: '',
        timeout: 1000 * 10,
        headers: {},
        responseType: 'json',
    });
    // TODO: 为 axios 添加自定义配置
    return axiosInstance(axiosConfig) as T;
}
