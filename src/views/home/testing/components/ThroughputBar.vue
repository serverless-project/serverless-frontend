<template>
  <Bar :data="chartData" :options="chartOptions"></Bar>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js'
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export default defineComponent({
  name: "ThroughputBar",
  components: { Bar },

  data() {
    return {
      chartData: {
        labels: [],
        datasets: [
          {
            label: 'spilot',
            backgroundColor: 'red',
            data: []
          },
          {
            label: 'Baseline',
            backgroundColor: 'blue',
            data: []
          }
        ]
      },
      chartOptions: {
        plugins: {
          title: {
            display: true,
            text: 'End to End Throughput',
            font: {
              size: 20
            }
          }
        },
        scales: {
          y: {
            title: {
              display: true,
              text: 'Throughput(s)',
              // font: {
              //   size: 20
              // }
            }
          }
        },
      }
    };
  },

})
</script>
