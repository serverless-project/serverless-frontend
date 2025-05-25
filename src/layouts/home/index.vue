<template>
  <default />
</template>

<script setup lang="ts">
import { onBeforeMount, onMounted, reactive } from 'vue';
import { useConfig } from '/@/stores/config';
import { useNavTabs } from '/@/stores/navTabs';
import Default from '/src/layouts/home/container/default.vue';
import { Session } from '/@/utils/storage';
import { useEventListener } from '@vueuse/core';
import { BEFORE_RESIZE_LAYOUT } from '/@/stores/constant/cacheKey';
import { setNavTabsWidth } from '/@/utils/layout';
import { getFirstRoute, handleHomeRoute, routePush } from '/@/utils/router';
import { getRoutes, getSiteConfig, getUserInfo } from '/@/api/home';
import { useSiteConfig } from '/@/stores/siteConfig';
import type {SiteConfig, UserInfo} from '/@/stores/interface';
import { useUserInfo } from '/@/stores/userInfo';

// const terminal = useTerminal();
const navTabs = useNavTabs();
const config = useConfig();
const siteConfig = useSiteConfig();
const userInfo = useUserInfo();

const state = reactive({
  autoMenuCollapseLock: false,
});

onMounted(() => {
  init();
  setNavTabsWidth();
  useEventListener(window, 'resize', setNavTabsWidth);
});
onBeforeMount(() => {
  onAdaptiveLayout();
  useEventListener(window, 'resize', onAdaptiveLayout);
});

const init = async () => {
  // 获取主页路由
  const res = {
    routes: (await getRoutes()).data,
    siteConfig: (await getSiteConfig()).data as SiteConfig,
    // userInfo: (await getUserInfo()).data as UserInfo,
  };

  // 初始化网页配置
  siteConfig.dataFill(res.siteConfig);
  siteConfig.setInitialize(true);
  // userInfo.dataFill(res.userInfo);
  siteConfig.setUserInitialize(true);

  // 初始化主页路由
  handleHomeRoute(res.routes);
  // 跳转到第一个菜单
  let firstRoute = getFirstRoute(navTabs.state.tabsViewRoutes);
  if (firstRoute) await routePush(firstRoute.path);
};

const onAdaptiveLayout = () => {
  let defaultBeforeResizeLayout = {
    layoutMode: config.layout.layoutMode,
    menuCollapse: config.layout.menuCollapse,
  };
  let beforeResizeLayout = Session.get(BEFORE_RESIZE_LAYOUT);
  if (!beforeResizeLayout) Session.set(BEFORE_RESIZE_LAYOUT, defaultBeforeResizeLayout);

  const clientWidth = document.body.clientWidth;
  if (clientWidth < 1024) {
    /**
     * 锁定窗口改变自动调整 menuCollapse
     * 避免已是小窗且打开了菜单栏时，意外的自动关闭菜单栏
     */
    if (!state.autoMenuCollapseLock) {
      state.autoMenuCollapseLock = true;
      config.setLayout('menuCollapse', true);
    }
    config.setLayout('shrink', true);
    config.setLayoutMode('Classic');
  } else {
    state.autoMenuCollapseLock = false;
    let beforeResizeLayoutTemp = beforeResizeLayout || defaultBeforeResizeLayout;

    config.setLayout('menuCollapse', beforeResizeLayoutTemp.menuCollapse);
    config.setLayout('shrink', false);
    config.setLayoutMode(beforeResizeLayoutTemp.layoutMode);
  }
};
</script>
