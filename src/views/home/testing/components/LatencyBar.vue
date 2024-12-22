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
const test_data = 
{
    labels: ['AI1', 'AI2', 'AI3'],
    datasets: [
      {
        label: 'spilot',
        backgroundColor: 'red',
        data: [65, 59, 80]
      },
      {
        label: 'Baseline',
        backgroundColor: 'blue',
        data: [40, 20, 12]
      }
    ]
};

export default defineComponent({
  name: "LatencyBar",
  components: { Bar },
 
  data() {
    return {
      // chartData: {
      //   labels: [],
      //   datasets: [
      //     {
      //       label: 'spilot',
      //       backgroundColor: 'red',
      //       data: []
      //     },
      //     {
      //       label: 'Baseline',
      //       backgroundColor: 'blue',
      //       data: []
      //     }
      //   ]
      // },
      chartData: test_data,
      chartOptions: {
        plugins: {  
          title: {  
            display: true,  
            text: 'End to End Latency'  ,
            font: {
                size: 20
              }
          }  
        }  ,
        scales: {
          y: {
            title: {
              display: true,
              text: 'Latency(s)',
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
