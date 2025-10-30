<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import * as echarts from 'echarts'
import { createAxios } from '/@/utils/axios'
import { ElMessage } from 'element-plus'

// 原始数据
const xs = ref<number[]>([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 21, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 40, 41, 46, 47, 54, 57, 58, 59, 61, 62, 66, 67, 68, 70, 71, 77, 78])
const ys = ref<number[]>([5, 9, 13, 19, 22, 25, 28, 31, 33, 34, 35, 38, 40, 42, 45, 46, 47, 50, 53, 55, 61, 64, 66, 67, 70, 71, 72, 73, 75, 77, 78, 82, 84, 88, 91, 93, 96, 98, 99, 100])

const chartRef = ref<HTMLDivElement | null>(null)
let chart: echarts.ECharts | null = null

function initChart() {
  if (!chartRef.value) return
  chart = echarts.init(chartRef.value)
  chart.setOption({
    title: {
      text: '最近一次快速启动监测',
      left: 'center',
      top: 8,
      textStyle: { fontSize: 16, fontWeight: 600 }
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const p = Array.isArray(params) ? params[0] : params
        const v = Array.isArray(p.value) ? p.value : [p.axisValue, p.data]
        return `时间: ${v[0]} ms<br/>启动个数: ${v[1]}`
      },
    },
    grid: { left: 60, right: 20, top: 50, bottom: 70 },
    xAxis: {
      type: 'value',
      name: '时间 (ms)',
      nameLocation: 'middle',
      nameGap: 30,
      nameTextStyle: { fontSize: 14 },
      axisLine: { lineStyle: { color: '#999' } },
      axisTick: { show: true },
      axisLabel: { color: '#666', margin: 12, fontSize: 13 },
      splitLine: { lineStyle: { color: '#eee' } },
    },
    yAxis: {
      type: 'value',
      name: '启动个数',
      nameTextStyle: { fontSize: 14 },
      axisLine: { show: false },
      splitLine: { lineStyle: { color: '#eee' } },
      axisLabel: { color: '#666', fontSize: 13 },
    },
    series: [
      {
        type: 'line',
        name: '启动个数-时间',
        data: xs.value.map((t, i) => [t, ys.value[i]]),
        smooth: true,
        showSymbol: true,
        symbolSize: 6,
        lineStyle: { color: '#409eff', width: 2 },
        itemStyle: { color: '#409eff' },
        areaStyle: { color: 'rgba(64,158,255,0.15)' },
      },
    ],
  })
}

function resizeChart() {
  if (chart) chart.resize()
}

async function loadData() {
  try {
    const resp = await createAxios({ url: '/plot/quick-start', method: 'get' })
    const data = resp?.data?.data || {}
    const x = Array.isArray(data.x) ? data.x : []
    const y = Array.isArray(data.y) ? data.y : []
    // 直接按接口返回使用：[x(时间ms), y(启动个数)]
    const pairs = x.length === y.length ? x.map((t: number, i: number) => [t, y[i]]) : []
    if (chart && pairs.length) {
      chart.setOption({
        series: [{ data: pairs }],
      })
    }
  } catch (e: any) {
    ElMessage.error(e?.message || '数据加载失败')
  }
}

onMounted(() => {
  initChart()
  loadData()
  window.addEventListener('resize', resizeChart)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeChart)
  if (chart) {
    chart.dispose()
    chart = null
  }
})
</script>

<template>
  <div class="overall-main">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">快速启动</div>
      </template>

      <div class="chart-wrapper">
        <div ref="chartRef" class="echart"></div>
      </div>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.overall-main {
  padding: 32px 150px 0;
}
.card-header {
  font-weight: 600;
  font-size: 16px;
}
.chart-wrapper {
  padding: 10px 0;
  display: flex;
  justify-content: center;
}
.echart {
  width: 100%;
  max-width: 1000px;
  height: 420px;
}
</style>
