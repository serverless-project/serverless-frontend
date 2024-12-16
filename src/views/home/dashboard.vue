<script setup lang="ts">
import { useTransition } from '@vueuse/core';
import { ComputedRef, CSSProperties, onActivated, onBeforeMount, onMounted, onUnmounted, Ref, ref, watch } from 'vue';
import { useNavTabs } from '/@/stores/navTabs';
import Icon from '/@/components/icon/index.vue';

defineOptions({
  name: 'dashboard',
});

const navTabs = useNavTabs();

const statisticValueStyle: CSSProperties = {
  fontSize: '28px',
};

onActivated(() => {});

onMounted(() => {
  initCountUp();
});

onBeforeMount(() => {});

onUnmounted(() => {});

watch(
  () => navTabs.state.tabFullScreen,
  () => {}
);

class Panel {
  name: string;
  icon: {
    name: string;
    color: string;
  };
  number: Ref<number>;
  /**
   * 带有数字向上变化特效的数据
   */
  numberOutput: ComputedRef<number>;
  metric: string;

  constructor(name: string, icon: { name: string; color: string }, number: number, metric: string) {
    this.name = name;
    this.icon = icon;
    this.number = ref(number);
    this.numberOutput = useTransition(this.number, { duration: 1500 });
    this.metric = metric;
  }
}

const panelsRef = ref<Panel[]>([
  new Panel(
    '已部署应用',
    {
      name: 'fa fa-object-group',
      color: '#F48595',
    },
    0,
    '6/8'
  ),
  new Panel(
    '项目2',
    {
      name: 'fa fa-line-chart',
      color: '#8595F4',
    },
    0,
    '某指标'
  ),
  new Panel(
    '项目3',
    {
      name: 'fa fa-users',
      color: '#74A8B5',
    },
    0,
    '某指标'
  ),
  new Panel(
    '项目4',
    {
      name: 'fa fa-file-text',
      color: '#AD85F4',
    },
    0,
    '某指标'
  ),
]);

const mockNumbers = [8, 5456, 9486, 875];

const initCountUp = () => {
  // TODO: 从后端获取数据
  for (let i = 0; i < panelsRef.value.length; i++) {
    panelsRef.value[i].number = mockNumbers[i];
  }
};
</script>

<template>
  <div class="default-main">
    <!-- 应用看板 -->
    <div class="small-panel-box">
      <el-row :gutter="20">
        <el-col :sm="12" :lg="6" v-for="(panel, $index) in panelsRef" :key="$index">
          <div class="small-panel user-reg suspension">
            <div class="small-panel-title">{{ panel.name }}</div>
            <div class="small-panel-content">
              <div class="content-left">
                <Icon :color="panel.icon.color" size="20" :name="panel.icon.name" />
                <el-statistic :value="panel.numberOutput" :value-style="statisticValueStyle" />
              </div>
              <div class="content-right">{{ panel.metric }}</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
    <!-- 应用列表 -->

  </div>
</template>

<style scoped lang="scss">
.welcome {
  background: #e1eaf9;
  border-radius: 6px;
  display: flex;
  align-items: center;
  padding: 15px 20px !important;
  box-shadow: 0 0 30px 0 rgba(82, 63, 105, 0.05);

  .welcome-img {
    height: 100px;
    margin-right: 10px;
    user-select: none;
  }

  .welcome-title {
    font-size: 1.5rem;
    line-height: 30px;
    color: var(--ba-color-primary-light);
  }

  .welcome-note {
    padding-top: 6px;
    font-size: 15px;
    color: var(--el-text-color-primary);
  }
}

.working {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  height: 100%;
  position: relative;

  &:hover {
    .working-coffee {
      -webkit-transform: translateY(-4px) scale(1.02);
      -moz-transform: translateY(-4px) scale(1.02);
      -ms-transform: translateY(-4px) scale(1.02);
      -o-transform: translateY(-4px) scale(1.02);
      transform: translateY(-4px) scale(1.02);
      z-index: 999;
    }
  }

  .working-coffee {
    transition: all 0.3s ease;
    width: 80px;
  }

  .working-text {
    display: block;
    width: 100%;
    font-size: 15px;
    text-align: center;
    color: var(--el-text-color-primary);
  }

  .working-opt {
    position: absolute;
    top: -40px;
    right: 10px;
    background-color: rgba($color: #000000, $alpha: 0.3);
    padding: 10px 20px;
    border-radius: 20px;
    color: var(--ba-bg-color-overlay);
    transition: all 0.3s ease;
    cursor: pointer;
    opacity: 0;
    z-index: 999;

    &:active {
      background-color: rgba($color: #000000, $alpha: 0.6);
    }
  }

  &:hover {
    .working-opt {
      opacity: 1;
      top: 0;
    }

    .working-done {
      opacity: 1;
      top: 50px;
    }
  }
}

.small-panel-box {
  margin-top: 20px;
}

.small-panel {
  user-select: none;
  background-color: #e9edf2;
  border-radius: var(--el-border-radius-base);
  padding: 25px;
  margin-bottom: 20px;

  .small-panel-title {
    color: #92969a;
    font-size: 15px;
  }

  .small-panel-content {
    display: flex;
    align-items: flex-end;
    margin-top: 20px;
    color: #2c3f5d;

    .content-left {
      display: flex;
      align-items: center;
      font-size: 24px;

      .icon {
        margin-right: 10px;
      }
    }

    .content-right {
      font-size: 18px;
      margin-left: auto;
    }

    .color-success {
      color: var(--el-color-success);
    }

    .color-warning {
      color: var(--el-color-warning);
    }

    .color-danger {
      color: var(--el-color-danger);
    }

    .color-info {
      color: var(--el-text-color-secondary);
    }
  }
}

.growth-chart {
  margin-bottom: 20px;
}

.user-growth-chart,
.file-growth-chart {
  height: 260px;
}

.new-user-growth {
  height: 300px;
}

.user-source-chart,
.user-surname-chart {
  height: 400px;
}

.new-user-item {
  display: flex;
  align-items: center;
  padding: 20px;
  margin: 10px 15px;
  box-shadow: 0 0 30px 0 rgba(82, 63, 105, 0.05);
  background-color: var(--ba-bg-color-overlay);

  .new-user-avatar {
    height: 48px;
    width: 48px;
    border-radius: 50%;
  }

  .new-user-base {
    margin-left: 10px;
    color: #2c3f5d;

    .new-user-name {
      font-size: 15px;
    }

    .new-user-time {
      font-size: 13px;
    }
  }

  .new-user-arrow {
    margin-left: auto;
  }
}

.new-user-card :deep(.el-card__body) {
  padding: 0;
}

@media screen and (max-width: 425px) {
  .welcome-img {
    display: none;
  }
}

@media screen and (max-width: 1200px) {
  .lg-mb-20 {
    margin-bottom: 20px;
  }
}

html.dark {
  .welcome {
    background-color: var(--ba-bg-color-overlay);
  }

  .small-panel {
    background-color: var(--ba-bg-color-overlay);

    .small-panel-content {
      color: var(--el-text-color-regular);
    }
  }

  .new-user-item {
    .new-user-base {
      color: var(--el-text-color-regular);
    }
  }
}
</style>
