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
    labels: ['chammeleon', 'mlpipe', 'runvk'],
    datasets: [
      {
        label: 'spilot',
        backgroundColor: 'red',
        data: [0, 0, 0]
      },
      {
        label: 'Baseline',
        backgroundColor: 'blue',
        data: [0, 0, 0]
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
