import type { AxiosRequestConfig, Method } from 'axios';
import axios from 'axios';
import { ElNotification } from 'element-plus';
import { i18n } from '/@/lang';

window.requests = [];
window.tokenRefreshing = false;
const pendingMap = new Map();
const loadingInstance: LoadingInstance = {
    target: null,
    count: 0,
};

/**
 * 根据运行环境获取基础请求URL
 */
export const getUrl = (): string => {
    const value: string = import.meta.env.VITE_AXIOS_BASE_URL as string;
    return value == 'getCurrentDomain' ? window.location.protocol + '//' + window.location.host : value;
};

/**
 * 根据运行环境获取基础请求URL的端口
 */
export const getUrlPort = (): string => {
    const url = getUrl();
    return new URL(url).port;
};

/**
 * 处理异常
 * @param {*} error
 */
function httpErrorStatusHandle(error: any) {
    // 处理被取消的请求
    if (axios.isCancel(error)) return console.error(i18n.global.t('axios.Automatic cancellation due to duplicate request:') + error.message);
    let message = '';
    if (error && error.response) {
        switch (error.response.status) {
            case 302:
                message = i18n.global.t('axios.Interface redirected!');
                break;
            case 400:
                message = i18n.global.t('axios.Incorrect parameter!');
                break;
            case 401:
                message = i18n.global.t('axios.You do not have permission to operate!');
                break;
            case 403:
                message = i18n.global.t('axios.You do not have permission to operate!');
                break;
            case 404:
                message = i18n.global.t('axios.Error requesting address:') + error.response.config.url;
                break;
            case 408:
                message = i18n.global.t('axios.Request timed out!');
                break;
            case 409:
                message = i18n.global.t('axios.The same data already exists in the system!');
                break;
            case 500:
                message = i18n.global.t('axios.Server internal error!');
                break;
            case 501:
                message = i18n.global.t('axios.Service not implemented!');
                break;
            case 502:
                message = i18n.global.t('axios.Gateway error!');
                break;
            case 503:
                message = i18n.global.t('axios.Service unavailable!');
                break;
            case 504:
                message = i18n.global.t('axios.The service is temporarily unavailable Please try again later!');
                break;
            case 505:
                message = i18n.global.t('axios.HTTP version is not supported!');
                break;
            default:
                message = i18n.global.t('axios.Abnormal problem, please contact the website administrator!');
                break;
        }
    }
    if (error.message.includes('timeout')) message = i18n.global.t('axios.Network request timeout!');
    if (error.message.includes('Network'))
        message = window.navigator.onLine ? i18n.global.t('axios.Server exception!') : i18n.global.t('axios.You are disconnected!');

    ElNotification({
        type: 'error',
        message,
        zIndex: 9999,
    });
}

/**
 * 关闭Loading层实例
 */
function closeLoading(options: Options) {
    if (options.loading && loadingInstance.count > 0) loadingInstance.count--;
    if (loadingInstance.count === 0) {
        loadingInstance.target.close();
        loadingInstance.target = null;
    }
}

/**
 * 储存每个请求的唯一cancel回调, 以此为标识
 */
function addPending(config: AxiosRequestConfig) {
    const pendingKey = getPendingKey(config);
    config.cancelToken =
        config.cancelToken ||
        new axios.CancelToken((cancel) => {
            if (!pendingMap.has(pendingKey)) {
                pendingMap.set(pendingKey, cancel);
            }
        });
}

/**
 * 删除重复的请求
 */
function removePending(config: AxiosRequestConfig) {
    const pendingKey = getPendingKey(config);
    if (pendingMap.has(pendingKey)) {
        const cancelToken = pendingMap.get(pendingKey);
        cancelToken(pendingKey);
        pendingMap.delete(pendingKey);
    }
}

/**
 * 生成每个请求的唯一key
 */
function getPendingKey(config: AxiosRequestConfig) {
    let { data } = config;
    const { url, method, params, headers } = config;
    if (typeof data === 'string') data = JSON.parse(data); // response里面返回的config.data是个字符串对象
    return [
        url,
        method,
        headers && (headers as anyObj).batoken ? (headers as anyObj).batoken : '',
        headers && (headers as anyObj)['ba-user-token'] ? (headers as anyObj)['ba-user-token'] : '',
        JSON.stringify(params),
        JSON.stringify(data),
    ].join('&');
}

/**
 * 根据请求方法组装请求数据/参数
 */
export function requestPayload(method: Method, data: anyObj) {
    if (method == 'GET') {
        return {
            params: data,
        };
    } else if (method == 'POST') {
        return {
            data: data,
        };
    }
}

interface LoadingInstance {
    target: any;
    count: number;
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

/*
 * 感谢掘金@橙某人提供的思路和分享
 * 本axios封装详细解释请参考：https://juejin.cn/post/6968630178163458084?share_token=7831c9e0-bea0-469e-8028-b587e13681a8#heading-27
 */
