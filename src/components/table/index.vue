<template>
    <div>
        <slot name="neck"></slot>
        <el-table ref="tableRef" class="ba-data-table w100" header-cell-class-name="table-header-cell"
            :default-expand-all="baTable.table.expandAll" :data="baTable.table.data" :row-key="baTable.table.pk"
            :border="true" v-loading="baTable.table.loading" stripe @select-all="onSelectAll" @select="onSelect"
            @selection-change="onSelectionChange" @sort-change="onSortChange" @row-dblclick="baTable.onTableDblclick"
            v-bind="$attrs">
            <slot name="columnPrepend"></slot>
            <template v-for="(item, key) in baTable.table.column">
                <template v-if="item.show !== false">
                    <!-- 渲染为 slot -->
                    <slot v-if="item.render == 'slot'" :name="item.slotName"></slot>

                    <el-table-column v-else :key="key + '-column'" v-bind="item"
                        :column-key="(item['columnKey'] ? item['columnKey'] : `table-column-${item.prop}`) || shortUuid()">
                        <!-- ./fieldRender/ 文件夹内的每个组件为一种字段渲染器，组件名称为渲染器名称 -->
                        <template v-if="item.render" #default="scope">
                            <component :row="scope.row" :field="item" :column="scope.column" :index="scope.$index"
                                v-model:showDialog="showDialog" v-model:chartData="chartData"
                                :is="fieldRenderer[item.render] ?? fieldRenderer['default']"
                                :key="getRenderKey(key, item, scope)" />
                        </template>
                    </el-table-column>
                </template>
            </template>
            <slot name="columnAppend"></slot>
        </el-table>
        <el-dialog v-model="showDialog" title="性能演示" width="400px" height="1400px">
            <!-- 图表容器 -->
            <div ref="chartRef" style="height: 350px; width: 80%;margin: auto; margin-left: 40px;"></div>
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/layui@2.8.16/dist/css/layui.css" />

            <!-- 表格 -->
            <div style="overflow: auto; max-height: 400px; margin-top: -30px;">
                <table id="pwgenTable" class="layui-table" style="width: 100%;">
                    <thead>
                        <tr>
                            <th>Pwgen</th>
                            <th>gvisor</th>
                            <th>vkernel</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>ms</td>
                            <td>0</td>
                            <td style="color: green;">{{(result ?? 0).toFixed(2)}}%</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- 按钮 -->
            <div style="padding: 30px; margin: auto; margin-left: 100px;">
                <el-button type="success" @click="pwgen">Pwgen演示</el-button>
            </div>
        </el-dialog>
        <div v-if="props.pagination" class="table-pagination">
            <el-pagination :currentPage="baTable.table.filter!.page" :page-size="baTable.table.filter!.limit"
                :page-sizes="pageSizes" background
                :layout="config.layout.shrink ? 'prev, next, jumper' : 'sizes,total, ->, prev, pager, next, jumper'"
                :total="baTable.table.total" @size-change="onTableSizeChange"
                @current-change="onTableCurrentChange"></el-pagination>
        </div>
        <slot name="footer"></slot>
    </div>
</template>

<script setup lang="ts">
import type { ElTable, TableInstance, ElMessage } from 'element-plus'
import type { Component } from 'vue'
import { computed, inject, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useConfig } from '/@/stores/config'
import type baTableClass from '/@/utils/baTable'
import { shortUuid } from '/@/utils/random'
import { ftGetProcess, ftPerformance, ftPwgen } from '/@/api/dashboard';
import * as echarts from 'echarts';


const config = useConfig()
const tableRef = ref<TableInstance>()
const baTable = inject('baTable') as baTableClass
type ElTableProps = Partial<InstanceType<typeof ElTable>['$props']>

interface Props extends /* @vue-ignore */ ElTableProps {
    pagination?: boolean
}
const props = withDefaults(defineProps<Props>(), {
    pagination: true,
})

const fieldRenderer: Record<string, Component> = {}
const fieldRendererComponents: Record<string, any> = import.meta.glob('./fieldRender/**.vue', { eager: true })
for (const key in fieldRendererComponents) {
    const fileName = key.replace('./fieldRender/', '').replace('.vue', '')
    fieldRenderer[fileName] = fieldRendererComponents[key].default
}


// setup() 中
const showDialog = ref(false);

const chartRef = ref(null);
const result = ref(0.0)
let myChart: echarts.ECharts | null = null;

// 模拟数据
const chartData = ref([
    { label: 'gvisor', value: 0 },
    { label: 'vkernel', value: -80.07 }
]);

// 渲染图表
const renderChart = async () => {
    if (!chartRef.value) return;

    const response = await ftPerformance(); 
    chartData.value[0].value = response?.data?.data[0] || 0;
    chartData.value[1].value = response?.data?.data[1] || 0;

    result.value = ((chartData.value[1].value - chartData.value[0].value) / chartData.value[0].value ) * 100;
    

    if (!myChart) {
        myChart = echarts.init(chartRef.value);
    }

    const option = {
        title: {
            text: 'pwgen密码生成时间开销', // 图表标题
            left: 'center'
        },
        tooltip: {},
        xAxis: {
            type: 'category',
            data: chartData.value.map(d => d.label)
        },
        yAxis: {
            type: 'value',
            name: '单位：ms', // y轴单位
            nameTextStyle: {
                fontSize: 14,
                padding: [0, 0, 0, 10]
            }
        },
        grid: {
            top: 80  // 图表距离顶部的距离，避免紧贴标题
        },
        series: [{
            type: 'bar',
            data: chartData.value.map(d => d.value),
            barWidth: '60%', // 或者用具体数值，比如 '10px'
            label: {
                show: true,           // 显示数据标签
                position: 'top',      // 显示在柱子顶部
                formatter: '{c}'      // 显示具体数值
            },
            itemStyle: {
                color: '#FFA500'      // 柱状图颜色，可选
            }
        }]
    };

    myChart.setOption(option);
    myChart.resize();
};

const pwgen = async () => {
    await ftPwgen();
    
    await renderChart();
}

onMounted(() => {
    // 只有在对话框打开后，DOM 才渲染完成，延时挂载图表
    watch(showDialog, (val) => {
        if (val) {
            setTimeout(() => {
                renderChart();
            }, 300); // 等 dialog 动画完成后再初始化
        }
    });
});

onBeforeUnmount(() => {
    myChart && myChart.dispose();
});


const getRenderKey = (key: number, item: TableColumn, scope: any) => {
    if (item.getRenderKey && typeof item.getRenderKey == 'function') {
        return item.getRenderKey(scope.row, item, scope.column, scope.$index)
    }
    if (item.render == 'switch') {
        return item.render + item.prop
    }
    return key + scope.$index + '-' + item.render + '-' + (item.prop ? '-' + item.prop + '-' + scope.row[item.prop] : '')
}

const onTableSizeChange = (val: number) => {
    baTable.onTableAction('page-size-change', { size: val })
}

const onTableCurrentChange = (val: number) => {
    baTable.onTableAction('current-page-change', { page: val })
}

const onSortChange = ({ order, prop }: { order: string; prop: string }) => {
    baTable.onTableAction('sort-change', { prop: prop, order: order ? (order == 'ascending' ? 'asc' : 'desc') : '' })
}

const pageSizes = computed(() => {
    let defaultSizes = [10, 20, 50, 100]
    if (baTable.table.filter!.limit) {
        if (!defaultSizes.includes(baTable.table.filter!.limit)) {
            defaultSizes.push(baTable.table.filter!.limit)
        }
    }
    return defaultSizes
})

/*
 * 全选和取消全选
 * 实现子级同时选择和取消选中
 */
const onSelectAll = (selection: TableRow[]) => {
    if (isSelectAll(selection.map((row: TableRow) => row[baTable.table.pk!].toString()))) {
        selection.map((row: TableRow) => {
            if (row.children) {
                selectChildren(row.children, true)
            }
        })
    } else {
        tableRef.value?.clearSelection()
    }
}

/*
 * 是否是全选操作
 * 只检查第一个元素是否被选择
 * 全选时：selectIds为所有元素的id
 * 取消全选时：selectIds为所有子元素的id
 */
const isSelectAll = (selectIds: string[]) => {
    let data = baTable.table.data as TableRow[]
    for (const key in data) {
        return selectIds.includes(data[key][baTable.table.pk!].toString())
    }
    return false
}

/*
 * 选择子项-递归
 */
const selectChildren = (children: TableRow[], type: boolean) => {
    children.map((j: TableRow) => {
        toggleSelection(j, type)
        if (j.children) {
            selectChildren(j.children, type)
        }
    })
}

/*
 * 执行选择操作
 */
const toggleSelection = (row: TableRow, type: boolean) => {
    if (row) {
        nextTick(() => {
            tableRef.value?.toggleRowSelection(row, type)
        })
    }
}

/*
 * 手动选择时，同时选择子级
 */
const onSelect = (selection: TableRow[], row: TableRow) => {
    if (
        selection.some((item: TableRow) => {
            return row[baTable.table.pk!] === item[baTable.table.pk!]
        })
    ) {
        if (row.children) {
            selectChildren(row.children, true)
        }
    } else {
        if (row.children) {
            selectChildren(row.children, false)
        }
    }
}

/*
 * 记录选择的项
 */
const onSelectionChange = (selection: TableRow[]) => {
    baTable.onTableAction('selection-change', selection)
}

/*
 * 设置折叠所有-递归
 */
const setUnFoldAll = (children: TableRow[], unfold: boolean) => {
    for (const key in children) {
        tableRef.value?.toggleRowExpansion(children[key], unfold)
        if (children[key].children) {
            setUnFoldAll(children[key].children!, unfold)
        }
    }
}

/*
 * 折叠所有
 */
const unFoldAll = (unfold: boolean) => {
    setUnFoldAll(baTable.table.data!, unfold)
}

const getRef = () => {
    return tableRef.value
}

defineExpose({
    unFoldAll,
    getRef,
})
</script>

<style scoped lang="scss">
.ba-data-table :deep(.el-button + .el-button) {
    margin-left: 6px;
}

.ba-data-table :deep(.table-header-cell) .cell {
    color: var(--el-text-color-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.table-pagination {
    box-sizing: border-box;
    width: 100%;
    max-width: 100%;
    background-color: var(--ba-bg-color-overlay);
    padding: 13px 15px;
}
</style>
