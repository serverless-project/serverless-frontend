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

const chartRef2 = ref<HTMLDivElement | null>(null)
let chart2: echarts.ECharts | null = null

// GPU内存使用数据
const timelineData = ref<number[]>([])
const baselineData = ref<number[]>([])

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

function initChart2() {
  if (!chartRef2.value) return
  chart2 = echarts.init(chartRef2.value)
  
  updateChart2()
}

function updateChart2() {
  if (!chart2) return
  
  const data1 = timelineData.value
  const data2 = baselineData.value
  
  // 如果没有数据，使用默认空数组
  if (data1.length === 0 || data2.length === 0) {
    return
  }
  
  const avg1 = data1.reduce((a, b) => a + b, 0) / data1.length
  const avg2 = data2.reduce((a, b) => a + b, 0) / data2.length
  
  // 时间轴：根据数据长度生成，假设每个数据点间隔10ms
  const dataLength = Math.max(data1.length, data2.length)
  const time1 = Array.from({ length: data1.length }, (_, i) => i * 10)
  const time2 = Array.from({ length: data2.length }, (_, i) => i * 10)
  const timeMax = Array.from({ length: dataLength }, (_, i) => i * 10)
  
  chart2.setOption({
    title: {
      text: 'GPU Memory Usage Over Time',
      left: 'center',
      top: 8,
      textStyle: { fontSize: 16, fontWeight: 600 }
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const lines: string[] = []
        params.forEach((p: any) => {
          // 跳过平均线，只显示数据点
          if (!p.seriesName.includes('Avg')) {
            const yValue = Array.isArray(p.value) ? p.value[1] : p.value
            lines.push(`${p.seriesName}: ${yValue.toFixed(2)} GB`)
          }
        })
        if (lines.length === 0) return ''
        return `Time-lines: ${params[0].axisValue || params[0].name} ms<br/>${lines.join('<br/>')}`
      }
    },
    grid: { left: 90, right: 40, top: 50, bottom: 70 },
    xAxis: {
      type: 'value',
      name: 'Time-lines (ms)',
      nameLocation: 'middle',
      nameGap: 30,
      nameTextStyle: { fontSize: 14 },
      min: 0,
      axisLine: { lineStyle: { color: '#999' } },
      axisTick: { show: true },
      axisLabel: { 
        color: '#666', 
        margin: 12, 
        fontSize: 13,
        formatter: (value: number) => {
          // 确保数值正确显示，不使用科学计数法
          return value.toString()
        }
      },
      splitLine: { 
        show: true,
        lineStyle: { type: 'dashed', color: '#ddd', opacity: 0.6 }
      },
    },
    yAxis: {
      type: 'value',
      name: 'Memory Footprint (GB)',
      nameLocation: 'middle',
      nameGap: 50,
      nameTextStyle: { fontSize: 14 },
      min: 0.5,
      max: 18,
      splitNumber: 20,
      axisLine: { show: false },
      axisLabel: { 
        color: '#666', 
        fontSize: 13,
        show: true,
        formatter: (value: number) => {
          // 只显示指定的刻度值
          const ticks = [1, 2, 4, 8, 16]
          // 使用更宽松的匹配条件
          for (const tick of ticks) {
            if (Math.abs(value - tick) < 1) {
              return tick.toString()
            }
          }
          return ''
        }
      },
      splitLine: { 
        show: true,
        lineStyle: { type: 'dashed', color: '#ddd', opacity: 0.6 }
      },
    },
    series: [
      {
        type: 'line',
        name: 'Streambox Timeline',
        data: data1.map((val, i) => [time1[i], val]),
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { color: '#409eff', width: 2 },
        itemStyle: { color: '#409eff' },
      },
      {
        type: 'line',
        name: 'Baseline Timeline',
        data: data2.map((val, i) => [time2[i], val]),
        symbol: 'rect',
        symbolSize: 6,
        lineStyle: { color: '#f56c6c', width: 2, type: 'dashed' },
        itemStyle: { color: '#f56c6c' },
      },
      {
        type: 'line',
        name: `Streambox Avg (${avg1.toFixed(2)} GB)`,
        data: timeMax.map(t => [t, avg1]),
        lineStyle: { color: '#5a72c1', width: 1.8, type: 'dashed' },
        symbol: 'none',
        z: 10,
      },
      {
        type: 'line',
        name: `Baseline Avg (${avg2.toFixed(2)} GB)`,
        data: timeMax.map(t => [t, avg2]),
        lineStyle: { color: '#9fc97e', width: 3 },
        symbol: 'none',
        z: 10,
      },
    ],
    legend: {
      bottom: 10,
      left: 'center',
    },
  })
}

function resizeChart() {
  if (chart) chart.resize()
  if (chart2) chart2.resize()
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

async function loadPerformanceIsolationData() {
  try {
    const resp = await createAxios({ url: '/plot/performance-isolation', method: 'get' })
    const data = resp?.data?.data || {}
    timelineData.value = Array.isArray(data.timeline) ? data.timeline : []
    baselineData.value = Array.isArray(data.baseline) ? data.baseline : []
    
    // 更新图表
    updateChart2()
  } catch (e: any) {
    ElMessage.error(e?.message || '性能隔离数据加载失败')
  }
}

onMounted(() => {
  initChart()
  loadData()
  initChart2()
  loadPerformanceIsolationData()
  window.addEventListener('resize', resizeChart)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeChart)
  if (chart) {
    chart.dispose()
    chart = null
  }
  if (chart2) {
    chart2.dispose()
    chart2 = null
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

    <el-card shadow="never" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">GPU内存使用</div>
      </template>

      <div class="chart-wrapper">
        <div ref="chartRef2" class="echart"></div>
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
