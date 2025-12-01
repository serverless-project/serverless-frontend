<script setup lang="ts">
import { useTransition } from '@vueuse/core';
import { ComputedRef, CSSProperties, onActivated, onBeforeMount, onMounted, onUnmounted, provide, Ref, ref, watch, computed, h } from 'vue';
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
import EditDialog from '/@/views/home/editDialog.vue';
import { useUserInfo } from '/@/stores/userInfo';
import axios from 'axios';
import { getUrl } from '/@/utils/axios';
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { ElRadioGroup } from 'element-plus';

defineOptions({
  name: 'dashboard',
});

const { t } = useI18n();
const navTabs = useNavTabs();

const statisticValueStyle: CSSProperties = {
  fontSize: '28px',
};

onActivated(() => { });

const userInfo = useUserInfo();

interface DataItem {
  node_name: string
  cpu_number: number
  mem_size: number
  disk_size: number
  applications?: string[] // 从API获取的应用信息(多个字符串)
  gpu_info?: {
    vgpu: number
    vgpu_in_use: number
    vgpu_memory: number
    vgpu_memory_in_use: number
  }
}

const nodes = ref<DataItem[]>([])
const invaild_nodes = ref<string[]>([])
const loading = ref(false)
const deleting_nodename = ref<string | null>(null)
const addNodeDialogVisible = ref(false)
const addingNode = ref(false)
const selectedNodeName = ref('')

const valid_cpu = computed(() => {
  return nodes.value
    .filter(item => !invaild_nodes.value.includes(item.node_name))
    .reduce((sum, item) => sum + item.cpu_number, 0)
})

const valid_mem = computed(() => {
  return nodes.value
    .filter(item => !invaild_nodes.value.includes(item.node_name))
    .reduce((sum, item) => sum + item.mem_size, 0)
})

const valid_disk = computed(() => {
  return nodes.value
    .filter(item => !invaild_nodes.value.includes(item.node_name))
    .reduce((sum, item) => sum + item.disk_size, 0)
});

const valid_vgpu = computed(() => {
  return nodes.value
    .filter(item => !invaild_nodes.value.includes(item.node_name))
    .reduce((sum, item) => sum + (item.gpu_info?.vgpu || 0), 0)
});

const valid_node_number = computed(() => {
  return nodes.value
    .filter(item => !invaild_nodes.value.includes(item.node_name))
    .length;
});

const valid_nodes = computed(() => {
  return nodes.value
    .filter(item => !invaild_nodes.value.includes(item.node_name))
});

onBeforeMount(() => {
  fetchNodes(); // 页面加载时获取节点数据
});

async function fetchNodes() {
  axios.get(getUrl() + '/profile/global').then((res) => {
    if (res.status === 200) {
      console.error(res.data);
      const nodeInfo = res.data.node_info || [];
      
      // 节点资源配置映射表
      const nodeResourceMap: Record<string, { cpu: number; mem: number; disk: number }> = {
        'master': { cpu: 32, mem: 64, disk: 400 },
        'node1': { cpu: 32, mem: 64, disk: 400 },
        'node2': { cpu: 32, mem: 64, disk: 400 },
        'node3': { cpu: 48, mem: 368, disk: 400 }
      };
      
      // 修正节点数据
      nodes.value = nodeInfo.map((node: DataItem) => {
        const resourceConfig = nodeResourceMap[node.node_name];
        if (resourceConfig) {
          return {
            ...node,
            cpu_number: resourceConfig.cpu,
            mem_size: resourceConfig.mem,
            disk_size: resourceConfig.disk
          };
        }
        return node;
      });
      
      invaild_nodes.value = res.data.invaild_nodes || [];
      panelsRef.value[1].number = valid_node_number.value;
      panelsRef.value[2].number = valid_mem.value;
      panelsRef.value[3].details = {
        cpus: { count: valid_cpu.value, unit: 'CPU' },
        gpus: { count: valid_vgpu.value, unit: 'vGPU' }
      };
      panelsRef.value[4].number = valid_disk.value;
    }
  }).catch((err) => {
    console.error(err);
  });
}

// 添加节点
async function addSelectedNode() {
  if (!selectedNodeName.value) return
  try {
    addingNode.value = true;
    const response = axios.get(getUrl() + '/profile/add_node/' + selectedNodeName.value);
    if ((await response).status === 200) {
      ElMessage.success('节点添加成功')
      addNodeDialogVisible.value = false
      fetchNodes() // 刷新列表
    } else {
      throw new Error('添加失败')
    }
  } catch (error) {
    ElMessage.error('添加节点失败')
  } finally {
    addingNode.value = false
  }
}

// 删除节点
async function confirmDeleteNode(node_name: string) {
  try {
    await ElMessageBox.confirm('确定要删除此节点吗?', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    deleting_nodename.value = node_name
    const response = axios.get(getUrl() + '/profile/remove_node/' + node_name);
    if ((await response).status === 200) {
      ElMessage.success('节点删除成功')
      fetchNodes() // 刷新列表
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除节点失败')
    }
  } finally {
    deleting_nodename.value = null
  }
}

onUnmounted(() => { });

watch(
  () => navTabs.state.tabFullScreen,
  () => { }
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

  constructor(name: string, icon: { name: string; color: string }, number: number, metric: string,
      public details?: {
      cpus: { count: number; unit: string }; // 大节点数量和单位
      gpus: { count: number; unit: string }; // 小节点数量和单位
    }
  ) {
    this.name = name;
    this.icon = icon;
    this.number = ref(number);
    this.numberOutput = useTransition(this.number, { duration: 1500 });
    this.metric = metric;
    this.details = details;
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
    '0/0'
  ),
  new Panel(
    '集群节点数',
    {
      name: 'fa fa-sitemap',
      color: '#6A5ACD',
    },
    0,
    '个'
  ),
  new Panel(
    '内存',
    {
      name: 'fa fa-server',
      color: '#20B2AA',
    },
    0,
    'GB'
  ),
  new Panel(
    '计算',
    {
      name: 'fa fa-microchip',
      color: '#20B2AA' ,
    },
    0,
    'CPU',
    // {
    //   cpus: { count: 0, unit: 'CPU' },
    //   gpus: { count: 0, unit: 'GPU' }
    // }
  ),
  new Panel(
    '存储',
    {
      name: 'fa fa-server',
      color: '#6A5ACD',
    },
    0,
    'GB'
  ),
]);

const baTable = new baTableClass(new baTableApi('/application/'), {
  pk: 'app_id',
  column: [
    { type: 'selection', align: 'center', operator: false },
    { label: 'ID', prop: 'app_id', align: 'left', operator: '=', operatorPlaceholder: 'ID', width: 70 },
    {
      label: '应用名称',
      prop: 'app_name',
      align: 'left',
      operator: 'LIKE',
      operatorPlaceholder: t('Fuzzy query'),
      width: 120,
    },
    {
      label: '路径',
      prop: 'app_path',
      align: 'left',
      operator: 'LIKE',
      operatorPlaceholder: t('Fuzzy query'),
    },
    {
      label: '描述',
      prop: 'app_description',
      align: 'left',
      operator: 'LIKE',
      operatorPlaceholder: t('Fuzzy query'),
      width: 190,
    },
    {
      label: t('State'),
      prop: 'app_status',
      align: 'left',
      render: 'tag',
      custom: {
        running: 'success',
        runned: 'primary',
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
        runned: '已运行',
      },
      width: 80,
    },
    // {
    //   label: '模式',
    //   render: 'slot',
    //   slotName: 'provider',
    //   operator: 'LIKE'
    // },
    {
      label: '操作',
      align: 'left',
      width: 240,
      render: 'buttons',
      buttons: appOptButtons(),
      operator: false,
    },
    {
      label: t('Create time'),
      prop: 'generate_time',
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

// 在 baTable.getIndex() 后添加
watch(
  () => baTable.table.data,
  (newData) => {
    if (newData) {
      newData.forEach((row) => {
        if (row.app_default_provider && !row.app_provider) {
          row.app_provider = row.app_default_provider;
        }
      });
    }
  },
  { immediate: true, deep: true }
);

provide('baTable', baTable);

const panelControl = ref({
  currentPanel: 'table',
  availablePanels: ['table', 'panel1']
})

const getPanelLabel = (panel: string) => {
  const labels: Record<string, string> = {
    'table': '应用视图',
    'panel1': '资源视图'
  }
  return labels[panel] || panel
}

// 监视baTable.table.data的变化，更新
watch(
  () => baTable.table.data,
  (newData, oldData) => {
    const totalApps = newData?.length || 0;
    const deployedApps = newData?.filter((app) => app?.app_status === 'runned' || app?.app_status === 'deployed' || app?.app_status === 'running').length || 0;
    panelsRef.value[0].number = totalApps;
    panelsRef.value[0].metric = `${deployedApps}/${totalApps}`;
  },
  {
    deep: true,
  }
);
</script>

<template>
  <div class="default-main">
    <!-- 应用看板 -->
    <div class="small-panel-box" v-if="userInfo.is_superuser">
      <el-row :gutter="20">
        <el-col
          v-for="(panel, index) in panelsRef"
          :key="index"
          :style="{
            flex: '1 0 auto',
            minWidth: '250px',
            maxWidth: '300px',
            marginBottom: '20px',
          }"
        >
          <div class="small-panel user-reg suspension">
            <div class="small-panel-title">{{ panel.name }}</div>
            <div class="small-panel-content">
              <div class="content-left">
                <Icon :color="panel.icon.color" size="20" :name="panel.icon.name" />
                <template v-if="panel.details">
                  <!-- 展示大节点和小节点 -->
                  <div class="node-details">
                    <div>{{ panel.details.cpus.count }} </div>
                    <div>{{ panel.details.gpus.count }} </div>
                  </div>
                </template>
                <template v-else>
                  <!-- 默认展示总节点数 -->
                  <el-statistic
                    :value="panel.numberOutput"
                    :value-style="statisticValueStyle"
                  />
                </template>
              </div>
                <div class="content-right">
                  <template v-if="panel.details">
                    <div class="node-units">
                      <div>{{ panel.details.cpus.unit }}</div>
                      <div>{{ panel.details.gpus.unit }}</div>
                    </div>
                  </template>
                  <template v-else>
                    {{ panel.metric }}
                  </template>
                </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <div class="default-main ba-table-box" style="margin: 0">
      <!-- 切换按钮 (仅在canSwitch为true时显示) -->
      <div class="panel-switcher" v-if="userInfo.is_superuser">
        <el-radio-group v-model="panelControl.currentPanel" size="small">
          <el-radio-button v-for="panel in panelControl.availablePanels" :key="panel" :label="panel">
            {{ getPanelLabel(panel) }}
          </el-radio-button>
        </el-radio-group>
      </div>

      <!-- 表格面板 -->
      <div v-show="panelControl.currentPanel === 'table'">
        <el-alert class="ba-table-alert" v-if="baTable.table.remark" :title="baTable.table.remark" type="info"
          show-icon />
        <TableHeader style="outline: none" :buttons="['refresh', 'add', 'delete', 'columnDisplay']" />
        <Table ref="tableRef">
          <template #provider>
            <el-table-column label="模式" width="185">
              <template #default="scope">
                <el-select size="small" v-model="scope.row.app_provider" placeholder="选择模式">
                  <el-option label="network_optimization" value="network_optimization" />
                  <el-option label="fault_tolerance" value="fault_tolerance" />
                  <el-option label="permission_isolation" value="permission_isolation" />
                  <el-option label="opinfo_isolation" value="opinfo_isolation" />
                  <el-option label="syscall_isolation" value="syscall_isolation" />
                  <el-option v-for="item in scope.row.app_providers" :key="item" :label="item" :value="item" />
                </el-select>
              </template>
            </el-table-column>
          </template>
        </Table>
        <ContainerStatusDialog />
        <PopupForm />
        <EditDialog />
      </div>

      <!-- 其他面板 (示例) -->
      <div v-show="userInfo.is_superuser && panelControl.currentPanel === 'panel1'">
        <div class="node-management-panel">
          <!-- 添加节点区域 -->
          <div class="panel-header">
            <el-select
              v-model="selectedNodeName"
              placeholder="选择节点名称"
              style="width: 200px; margin-right: 10px"
              :disabled="invaild_nodes.length === 0"
            >
              <el-option
                v-for="name in invaild_nodes"
                :key="name"
                :label="name"
                :value="name"
              />
            </el-select>
            
            <el-button 
              type="primary" 
              @click="addSelectedNode"
              :disabled="!selectedNodeName"
            >
              <el-icon><Plus /></el-icon>
              添加节点
            </el-button>
          </div>

          <!-- 节点列表 -->
          <el-table :data="valid_nodes" style="width: 100%" v-loading="loading">
            <el-table-column prop="node_name" label="节点名称" width="180" fixed />

            <!-- 资源信息列 -->
            <el-table-column label="资源信息">
              <template #default="{ row }">
                <div class="resource-info">
                  <div>计算: {{ row.cpu_number }} CPU 核</div>
                  <div>内存: {{ row.mem_size }} GB</div>
                  <div>存储: {{ row.disk_size }} GB</div>
                  <div v-if="row.gpu_info">
                    GPU: {{ row.gpu_info.vgpu }} vGPU
                    <span v-if="row.gpu_info.vgpu_in_use > 0">
                      (已使用: {{ row.gpu_info.vgpu_in_use }})
                    </span>
                  </div>
                  <div v-else>GPU: 0 vGPU</div>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="已部署应用">
              <template #default="{ row }">
                <div v-if="row.applications?.length" class="app-names">
                  <div v-for="appName in row.applications" :key="appName" class="app-name-item">
                    {{ appName }}
                  </div>
                </div>
                <span v-else>无应用</span>
              </template>
            </el-table-column>

            <!-- 操作列 -->
            <el-table-column label="操作" width="120">
              <template #default="{ row }">
                <el-button type="danger" size="small" @click="confirmDeleteNode(row.node_name)"
                  :loading="deleting_nodename === row.node_name">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>

        </div>
      </div>
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

.log-dialog-box {
  max-width: 90vw;
  width: 1800px;
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
  flex-direction: column;

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
      height: 40px; /* 固定高度 */

      .icon {
        margin-right: 10px;
      }
    }

    .content-right {
      font-size: 18px;
      margin-left: auto;
      height: 40px; /* 固定高度 */
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

.panel-switcher {
  margin-bottom: 15px;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 4px;
}

.node-management-panel {
  padding: 20px;
}

.panel-header {
  margin-bottom: 20px;
}

.resource-info {
  line-height: 1.6;
}

.app-tag {
  margin-right: 5px;
  margin-bottom: 5px;
}

.node-units {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

</style>
