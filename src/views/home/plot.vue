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

// 速率比较图表
const chartRef3 = ref<HTMLDivElement | null>(null)
let chart3: echarts.ECharts | null = null

// 速率数据
interface RateSeries {
  [container: string]: number[][]
}
const rxRateHistoryData = ref<RateSeries>({})
const rxRateHistoryOptData = ref<RateSeries>({})

// 持续时间比较图表
const chartRef4 = ref<HTMLDivElement | null>(null)
let chart4: echarts.ECharts | null = null

// 持续时间数据
const durationData = ref<{
  rx_rate_history: { stage0_0: number; stage0_1: number }
  rx_rate_history_opt: { stage0_0: number; stage0_1: number }
}>({
  rx_rate_history: { stage0_0: 0, stage0_1: 0 },
  rx_rate_history_opt: { stage0_0: 0, stage0_1: 0 }
})

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

// 从数据中提取时间序列
function extractSeries(data: RateSeries, containerName: string): { times: number[]; rates: number[] } {
  const series = data[containerName] || []
  if (!series || series.length === 0) {
    return { times: [], rates: [] }
  }
  const baseTs = series[0][1]
  const times = series.map(item => (item[1] - baseTs) / 1000.0)
  const rates = series.map(item => item[0])
  return { times, rates }
}

// 计算持续时间
function calcDuration(data: RateSeries, containerName: string): number {
  const series = data[containerName] || []
  if (!series || series.length === 0) {
    return 0.0
  }
  return (series[series.length - 1][1] - series[0][1]) / 1000.0
}

function initChart3() {
  if (!chartRef3.value) return
  chart3 = echarts.init(chartRef3.value)
  updateChart3()
}

function updateChart3() {
  if (!chart3) return

  const containers = ['mlpipe-gpu-para-stage0-0', 'mlpipe-gpu-para-stage0-1']
  const series1 = extractSeries(rxRateHistoryData.value, containers[0])
  const series2 = extractSeries(rxRateHistoryData.value, containers[1])
  const series3 = extractSeries(rxRateHistoryOptData.value, containers[0])
  const series4 = extractSeries(rxRateHistoryOptData.value, containers[1])

  // 检查是否有数据
  if (series1.times.length === 0 && series3.times.length === 0) {
    return
  }

  chart3.setOption({
    title: {
      text: 'Rate comparison for two files',
      left: 'center',
      top: 8,
      textStyle: { fontSize: 16, fontWeight: 600 }
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const lines: string[] = []
        params.forEach((p: any) => {
          const yValue = Array.isArray(p.value) ? p.value[1] : p.value
          lines.push(`${p.seriesName}: ${yValue.toFixed(2)} Mbps`)
        })
        if (lines.length === 0) return ''
        const xValue = params[0].axisValue || params[0].name
        return `Time: ${xValue.toFixed(2)} s<br/>${lines.join('<br/>')}`
      }
    },
    grid: { left: 80, right: 40, top: 50, bottom: 70 },
    xAxis: {
      type: 'value',
      name: 'Time (s)',
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
      name: 'Rate (Mbps)',
      nameTextStyle: { fontSize: 14 },
      axisLine: { show: false },
      splitLine: { lineStyle: { color: '#eee' } },
      axisLabel: { color: '#666', fontSize: 13 },
    },
    series: [
      {
        type: 'line',
        name: 'rx_rate_history - stage0-0',
        data: series1.times.map((t, i) => [t, series1.rates[i]]),
        lineStyle: { color: '#409eff', width: 1.5 },
        itemStyle: { color: '#409eff' },
        symbolSize: 4,
      },
      {
        type: 'line',
        name: 'rx_rate_history - stage0-1',
        data: series2.times.map((t, i) => [t, series2.rates[i]]),
        lineStyle: { color: '#409eff', width: 1.5, type: 'dashed' },
        itemStyle: { color: '#409eff' },
        symbolSize: 4,
      },
      {
        type: 'line',
        name: 'rx_rate_history_opt - stage0-0',
        data: series3.times.map((t, i) => [t, series3.rates[i]]),
        lineStyle: { color: '#e6a23c', width: 1.5 },
        itemStyle: { color: '#e6a23c' },
        symbolSize: 4,
      },
      {
        type: 'line',
        name: 'rx_rate_history_opt - stage0-1',
        data: series4.times.map((t, i) => [t, series4.rates[i]]),
        lineStyle: { color: '#e6a23c', width: 1.5, type: 'dashed' },
        itemStyle: { color: '#e6a23c' },
        symbolSize: 4,
      },
    ],
    legend: {
      bottom: 10,
      left: 'center',
    },
  })
}

function initChart4() {
  if (!chartRef4.value) return
  chart4 = echarts.init(chartRef4.value)
  updateChart4()
}

function updateChart4() {
  if (!chart4) return

  const data = durationData.value
  if (data.rx_rate_history.stage0_0 === 0 && data.rx_rate_history_opt.stage0_0 === 0) {
    return
  }

  chart4.setOption({
    title: {
      text: 'Stacked duration comparison',
      left: 'center',
      top: 8,
      textStyle: { fontSize: 16, fontWeight: 600 }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        let result = `${params[0].name}<br/>`
        params.forEach((p: any) => {
          result += `${p.seriesName}: ${p.value.toFixed(2)} s<br/>`
        })
        return result
      }
    },
    grid: { left: 80, right: 40, top: 50, bottom: 70 },
    xAxis: {
      type: 'category',
      data: ['rx_rate_history', 'rx_rate_history_opt'],
      axisLine: { lineStyle: { color: '#999' } },
      axisTick: { show: true },
      axisLabel: { 
        color: '#666', 
        margin: 12, 
        fontSize: 13,
        rotate: 15
      },
    },
    yAxis: {
      type: 'value',
      name: 'Duration (s)',
      nameTextStyle: { fontSize: 14 },
      axisLine: { show: false },
      splitLine: { lineStyle: { color: '#eee' } },
      axisLabel: { color: '#666', fontSize: 13 },
    },
    series: [
      {
        type: 'bar',
        name: 'file1 stage0-0',
        stack: 'duration',
        data: [data.rx_rate_history.stage0_0, data.rx_rate_history_opt.stage0_0],
        itemStyle: {
          color: '#409eff',
        },
        barWidth: '60%',
      },
      {
        type: 'bar',
        name: 'file1 stage0-1',
        stack: 'duration',
        data: [data.rx_rate_history.stage0_1, data.rx_rate_history_opt.stage0_1],
        itemStyle: {
          color: '#67c23a',
        },
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
  if (chart3) chart3.resize()
  if (chart4) chart4.resize()
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

async function loadRxRateHistoryData() {
  try {
    const resp = await createAxios({ url: '/plot/network-optimization', method: 'get' })
    const data = resp?.data?.data || {}
    
    // 提取两个文件的数据：history 对应 rx_rate_history，opt 对应 rx_rate_history_opt
    rxRateHistoryData.value = data.history || {}
    rxRateHistoryOptData.value = data.opt || {}
    
    // 计算持续时间
    const containers = ['mlpipe-gpu-para-stage0-0', 'mlpipe-gpu-para-stage0-1']
    durationData.value = {
      rx_rate_history: {
        stage0_0: calcDuration(rxRateHistoryData.value, containers[0]),
        stage0_1: calcDuration(rxRateHistoryData.value, containers[1])
      },
      rx_rate_history_opt: {
        stage0_0: calcDuration(rxRateHistoryOptData.value, containers[0]),
        stage0_1: calcDuration(rxRateHistoryOptData.value, containers[1])
      }
    }
    
    // 更新图表
    updateChart3()
    updateChart4()
  } catch (e: any) {
    ElMessage.error(e?.message || '网络优化数据加载失败')
  }
}

onMounted(() => {
  initChart()
  loadData()
  initChart3()
  loadRxRateHistoryData()
  initChart4()
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
  if (chart3) {
    chart3.dispose()
    chart3 = null
  }
  if (chart4) {
    chart4.dispose()
    chart4 = null
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
        <div class="card-header">速率比较</div>
      </template>

      <div class="chart-wrapper">
        <div ref="chartRef3" class="echart"></div>
      </div>
    </el-card>

    <el-card shadow="never" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">持续时间比较</div>
      </template>

      <div class="chart-wrapper">
        <div ref="chartRef4" class="echart"></div>
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
