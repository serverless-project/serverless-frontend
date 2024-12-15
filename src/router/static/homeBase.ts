import type { RouteRecordRaw } from 'vue-router'

export const homeBaseRoutePath = '/home'

/*
 * 主页基础静态路由
 */
const homeBaseRoute: RouteRecordRaw = {
    path: homeBaseRoutePath,
    name: 'home',
    component: () => import('/src/layouts/home/index.vue'),
    // 直接重定向到 loading 路由
    redirect: homeBaseRoutePath + '/loading',
    meta: {
        title: `pagesTitle.admin`,
    },
    children: [
        {
            path: 'loading/:to?',
            name: 'homeMainLoading',
            component: () => import('/@/layouts/common/components/loading.vue'),
            meta: {
                title: `pagesTitle.loading`,
            },
        },
    ],
}

export default homeBaseRoute
