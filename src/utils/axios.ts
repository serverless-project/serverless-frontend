import type { AxiosRequestConfig } from 'axios';
import axios from 'axios';
import { type LoadingOptions } from 'element-plus';
import { useUserInfo } from '/@/stores/userInfo';

/**
 * 根据运行环境获取基础请求URL
 */
export const getUrl = (): string => {
    const value: string = import.meta.env.VITE_AXIOS_BASE_URL as string
    // 如果未配置或为空，默认使用当前地址，端口号为8328
    if (!value || value.trim() === '') {
        return window.location.protocol + '//' + window.location.hostname + ':8328'
    }
    // 如果值为 'getCurrentDomain'，使用当前完整地址（包括端口）
    if (value == 'getCurrentDomain') {
        return window.location.protocol + '//' + window.location.host
    }
    // 否则返回配置的值
    return value
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
    loading: LoadingOptions = {},
    mock: boolean = false,
): T {
    const userInfo = useUserInfo()
    const axiosInstance = axios.create({
        baseURL: mock ? window.location.protocol + '//' + window.location.host : getUrl(),
        headers: {
            'Authorization': 'Bearer ' + userInfo.token
        },
        responseType: 'json',
    });
    // TODO: 为 axios 添加自定义配置
    return axiosInstance(axiosConfig) as T;
}

export function createPostAxios<Data = any, T = ApiPromise<Data>>(
    axiosConfig: AxiosRequestConfig,
    options: Options = {},
    loading: LoadingOptions = {},
    mock: boolean = false,
): T {
    const axiosInstance = axios.create({
        // baseURL: mock ? window.location.protocol + '//' + window.location.host : getUrl(),
        baseURL: 'http://39.99.46.119',
        timeout: 1000 * 10,
        headers: {},
        responseType: 'json',
    });
    // TODO: 为 axios 添加自定义配置
    return axiosInstance(axiosConfig) as T;
}