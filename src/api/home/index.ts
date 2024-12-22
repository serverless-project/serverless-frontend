import { createAxios } from '/@/utils/axios';

export function getRoutes() {
    return createAxios({
        url: '/data/home/routes.json', //TODO: 修为后端实际 API 地址
        method: 'get',
    }, {}, {}, true);
}

export function getSiteConfig() {
    return createAxios({
        url: '/data/home/site-config.json',
        method: 'get',
    }, {}, {}, true);
}

/**
 * 在 /src/utils/axios.ts 中配置 axios 发送请求时在头部携带 token
 */
export function getUserInfo() {
    return createAxios({
        url: '/data/home/user-info.json',
        method: 'get',
    }, {}, {}, true);
}
