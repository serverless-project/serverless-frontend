<script setup lang="ts">
import { useTransition } from '@vueuse/core';
import { ComputedRef, CSSProperties, onActivated, onBeforeMount, onMounted, onUnmounted, provide, Ref, ref, watch } from 'vue';
import { useNavTabs } from '/@/stores/navTabs';
import Icon from '/@/components/icon/index.vue';
import { appOptButtons } from '/@/components/table/index';
import { useI18n } from 'vue-i18n';
import { baTableApi } from '/@/api/common';
import baTableClass from '/@/utils/baTable';
import PopupForm from '/@/views/home/popupForm.vue';
import TableHeader from '/@/components/table/header/index.vue';
import Table from '/@/components/table/index.vue';
import ContainerStatusDialog from '/@/views/home/containerStatusDialog.vue';

defineOptions({
  name: 'dashboard',
});

const { t } = useI18n();
const navTabs = useNavTabs();

const statisticValueStyle: CSSProperties = {
  fontSize: '28px',
};

onActivated(() => {});

// const mockNumbers = [8, 5456, 9486, 875];

// const initCountUp = () => {
//   // TODO: 从后端获取数据
//   for (let i = 0; i < panelsRef.value.length; i++) {
//     panelsRef.value[i].number = mockNumbers[i];
//   }
// };

// onMounted(() => {
//   initCountUp();
// });

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
    8,
    '6/8'
  ),
  new Panel(
    '集群节点数',
    {
      name: 'fa fa-sitemap',
      color: '#6A5ACD',
    },
    8,
    '个'
  ),
  new Panel(
    '内存',
    {
      name: 'fa fa-microchip',
      color: '#4682B4',
    },
    64,
    'GB'
  ),
  new Panel(
    'CPU',
    {
      name: 'fa fa-server',
      color: '#20B2AA',
    },
    16,
    '核'
  ),
]);

const baTable = new baTableClass(new baTableApi('/data/home/app/'), {
  column: [
    { type: 'selection', align: 'center', operator: false },
    { label: 'ID', prop: 'id', align: 'left', operator: '=', operatorPlaceholder: 'ID', width: 70 },
    {
      label: '应用名称',
      prop: 'name',
      align: 'left',
      operator: 'LIKE',
      operatorPlaceholder: t('Fuzzy query'),
      width: 150,
    },
    {
      label: '描述',
      prop: 'desc',
      align: 'left',
      operator: 'LIKE',
      operatorPlaceholder: t('Fuzzy query'),
    },
    {
      label: t('State'),
      prop: 'status',
      align: 'left',
      render: 'tag',
      custom: {
        stopped: 'danger',
        running: 'success',
        starting: 'warning',
        unbuild: 'info',
        building: 'info',
        builded: 'success',
        deploying: 'info',
        deployed: 'success',
      },
      replaceValue: {
        unbuild: '未构建',
        building: '构建中',
        builded: '已构建',
        deploying: '部署中',
        deployed: '已部署',
        running: '运行中',
        stopped: '已停止',
      },
      width: 80,
    },
    {
      label: '操作',
      align: 'left',
      width: 300,
      render: 'buttons',
      buttons: appOptButtons(),
      operator: false,
    },
    {
      label: t('Create time'),
      prop: 'create_time',
      align: 'left',
      render: 'datetime',
      sortable: 'custom',
      operator: 'RANGE',
      width: 160,
    },
  ],
  dblClickNotEditColumn: ['id', 'name', 'status', undefined, 'create_time'],
});

baTable.mount();
baTable.getIndex();

provide('baTable', baTable);

// 监视baTable.table.data的变化，更新
watch(() => baTable.table.data, (newData, oldData) => {
  console.log('Data has been updated:', newData);
  const totalApps = newData?.length || 0;
  const deployedApps = newData?.filter(app => app.status === 'deployed' || app.status === 'running').length || 0;
  panelsRef.value[0].number = totalApps;
  panelsRef.value[0].metric = `${deployedApps}/${totalApps}`;
}, {
  deep: true
});

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
    <div class="default-main ba-table-box" style="margin: 0">
      <el-alert class="ba-table-alert" v-if="baTable.table.remark" :title="baTable.table.remark" type="info" show-icon />
      <!-- 表格顶部菜单 -->
      <TableHeader
        style="outline: none"
        :buttons="['refresh', 'add', 'delete', 'comSearch', 'quickSearch', 'columnDisplay']"
        quick-search-placeholder="根据应用名称进行搜索"
      />

      <!-- 表格 -->
      <!-- 要使用`el-table`组件原有的属性，直接加在Table标签上即可 -->
      <Table ref="tableRef" />

      <!-- 对话框 -->
      <ContainerStatusDialog />
      <PopupForm />
    </div>
  </div>
</template>

<style scoped lang="scss">
.table-opt-button .icon {
  color: #8595f4 !important;
}

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
