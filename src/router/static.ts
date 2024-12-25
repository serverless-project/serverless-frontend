import type { RouteRecordRaw } from 'vue-router';
import { homeBaseRoutePath } from "/@/router/static/homeBase";

/*
 * 静态路由
 * 自动加载 ./static 目录的所有文件，并 push 到以下数组
 */
const staticRoutes: Array<RouteRecordRaw> = [
    {
        // 首页 TODO
        path: '/',
        name: '/',
        redirect: '/login',
    },
    {
        // 登录页
        path: '/login',
        name: 'login',
        component: () => import('/@/views/login.vue'),
        meta: {
            title: '登录',
        },
    },
    {
        path: '/:path(.*)*',
        redirect: '/404',
    },
    {
        // 404
        path: '/404',
        name: 'notFound',
        component: () => import('/@/views/common/error/404.vue'),
        meta: {
            title: '页面不存在',
        },
    },
    {
        // 无权限访问
        path: '/401',
        name: 'noPower',
        component: () => import('/@/views/common/error/401.vue'),
        meta: {
            title: '无权限访问',
        },
    },
    {
        path: homeBaseRoutePath + ':path(.*)*',
        redirect: (to) => {
            return {
                name: 'homeMainLoading',
                params: {
                    to: JSON.stringify({
                        path: to.path,
                        query: to.query,
                    }),
                },
            }
        },
    },
];

const staticFiles: Record<string, Record<string, RouteRecordRaw>> = import.meta.glob('./static/*.ts', { eager: true });
for (const key in staticFiles) {
    if (staticFiles[key].default) staticRoutes.push(staticFiles[key].default);
}

export default staticRoutes;
