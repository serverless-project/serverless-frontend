<template>
    <div class="overall-main">

      <el-card>
        <el-space size="large" style="float:left">
          <el-button size="small" type="primary" @click="runExperiment('latency', 'delpoyment')">Spilot</el-button>
          <el-button size="small" type="primary" @click="runExperiment('latency', 'fast_start')">Fast Start</el-button>
          <el-button size="small" type="primary" @click="runExperiment('latency', 'runvk')">Runvk</el-button>
          <!--<el-button size="small" type="primary" @click="runExperiment('latency', 'AI')">Run AI</el-button>--->
          <!--<el-button size="small" type="warning" @click="runExperiment('latency', 'Web')">Run Web</el-button>--->
          <!--<el-button size="small" type="danger" @click="runExperiment('latency', 'BigData')">Run BigData</el-button>--->
          <!--<el-button size="small" type="success" @click="runExperiment('latency', 'Pkubot')">Run Pkubot</el-button>--->
          <!--<el-button size="small" type="success" @click="runAllExperiment('latency')">Run All</el-button>--->
        </el-space>
        <el-space size="large" style="float:right">
          <el-button size="small" type="primary" @click="plotTestData('latency')">Plot</el-button>
          <el-button size="small" type="info" @click="clearAllData('latency')">Clear</el-button>
        </el-space>
        <!-- <LatencyBar :data="chartData" :options="chartOptions"></LatencyBar> -->
        <LatencyBar ref="LatencyBar" />
      </el-card>
      <br /><br />
      <el-card>
        <el-space size="large" style="float:left">
          <el-button size="small" type="primary" @click="runExperiment('throughput', 'AI')">Run AI</el-button>
          <el-button size="small" type="warning" @click="runExperiment('throughput', 'Web')">Run Web</el-button>
          <el-button size="small" type="danger" @click="runExperiment('throughput', 'BigData')">Run BigData</el-button>
          <el-button size="small" type="success" @click="runExperiment('throughput', 'Pkubot')">Run Pkubot</el-button>
          <!---<el-button size="small" type="success" @click="runAllExperiment('throughput')">Run All</el-button>--->
        </el-space>
        <el-space size="large" style="float:right">
          <el-button size="small" type="primary" @click="plotTestData('throughput')">Plot</el-button>
          <el-button size="small" type="info" @click="clearAllData('throughput')">Clear</el-button>
        </el-space>
        <!-- <LatencyBar :data="chartData" :options="chartOptions"></LatencyBar> -->
        <ThroughputBar ref="ThroughputBar" />
      </el-card>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
// import MainLayout from "@/layouts/MainLayout.vue";
import { ElMessage, ElMessageBox } from 'element-plus';
import LatencyBar from "./components/LatencyBar.vue";
import ThroughputBar from "./components/ThroughputBar.vue";
import { createAxios } from "/@/utils/axios";
const template_data={
          labels: [],
          datasets: [
            {
              label: 'Spilot',
              backgroundColor: 'red',
              data: []
            },
            {
              label: 'Baseline',
              backgroundColor: 'blue',
              data: []
            }
          ]
        }
export default defineComponent({
  name: "Testing",
  components: { LatencyBar, ThroughputBar },
  mounted() {
    // setInterval(() => {
    //   this.getTestData()
    // }, 10000
    // )
  },
  methods: {
    async plotTestData(metric: string) {
      let url = "/ft/get_demo_data"
      const names = ['chammeleon','mlpipe']
      const modes = ['spilot','baseline']
      const matrics = ['latency','throughput']
      console.log(this.$refs.LatencyBar)
      let latencyChartData = {
        labels: ['chammeleon', 'mlpipe', 'runvk'],
        datasets: [
          {
            label: 'Spilot',
            backgroundColor: 'red',
            data: [0, 0, 0]
          },
          {
            label: 'Baseline',
            backgroundColor: 'blue',
            data: [0, 0, 0]
          }
        ]
      }
      let throughputChartData = {
        labels: ['chammeleon', 'mlpipe', 'runvk'],
        datasets: [
          {
            label: 'Spilot',
            backgroundColor: 'red',
            data: [0, 0, 0]
          },
          {
            label: 'Baseline',
            backgroundColor: 'blue',
            data: [0, 0, 0]
          }
        ]
      }
      for (const name of names) {
        for (const mode of modes) {
          for (const metric of matrics) {
            console.log(name)
            console.log(mode)
            console.log(metric)
            const data = {
              name: name,
              mode: mode,
              metric: metric
            }
            const resp = await createAxios({
                url: url,
                method: 'post',
                data: data,
            })
            const result = resp.data.data
            console.log(result)
            const labels = latencyChartData.labels
            const appIndex = labels.indexOf(name)
            const modeIndex = modes.indexOf(mode)
            if (appIndex != -1 && modeIndex != -1) {
              if (metric == "latency") {
                latencyChartData.datasets[modeIndex].data[appIndex] = result
              }
              if (metric == "throughput") {
                throughputChartData.datasets[modeIndex].data[appIndex] = result
              }
            }
          }
        }
      }
      this.$refs.LatencyBar.chartData = latencyChartData
      this.$refs.ThroughputBar.chartData = throughputChartData
      // reqInstance().post(url, data, { 
      //   headers: {
      //     'Access-Control-Allow-Origin': '*'
      //   },
      // }).then(
      //   res => {
      //     ElMessage.success('Successfully get test data!')
      //     console.log(res)
      //     if (metric == "throughput") {
      //       res.data.throughput.datasets[0].backgroundColor = 'red'
      //       res.data.throughput.datasets[1].backgroundColor = 'blue'
      //       this.$refs.ThroughputBar.chartData = res.data.throughput
      //     }
      //     else {
      //       res.data.latency.datasets[0].backgroundColor = 'red'
      //       res.data.latency.datasets[1].backgroundColor = 'blue'
      //       this.$refs.LatencyBar.chartData = res.data.latency
      //     }
      //   }
      // ).catch(
      //   err => {
      //     console.log(err)

      //   }
      // )
      
    },
    clearAllData(metric: string) {
      // if (metric == "latency") {
      //   this.$refs.LatencyBar.chartData = template_data
      // }
      // if (metric == "throughput") {
      //   this.$refs.ThroughputBar.chartData = template_data
      // }

      //let data = {
      //  metric: metric
      //}
      //let url = "/api/v1/clear_all_data"
      //reqInstance().post(url, data, {
      //  headers: {
      //    'Access-Control-Allow-Origin': '*'
      //  }
      //}).catch(
      //  err => {
      //    console.log(err)
      //  }
      //)
    },
    runAllExperiment(metric: any) {
      console.log("runAllExperiment")
      let tasks = ['AI', 'Web', 'BigData']
      for (let i in tasks) {
        this.runExperiment(metric, tasks[i])
      }
    },
    runExperiment(metric: string, task: string) {
      console.log("runExperiment")
      let url = "/api/v1/run_demo"
      let data = {
        task: task,
        metric: metric
      }

      // reqInstance().post(url, data, {
      //   headers: {
      //     'Access-Control-Allow-Origin': '*'
      //   }
      // }).then(
      //   res => {
      //     ElMessage.success(res.data.msg)
      //   }
      // ).catch(
      //   err => {
      //     console.log(err)

      //   }
      // )
    }

  },
})
</script>

<style scoped>
.overall-main {
  padding: 0 150px;
}
</style>