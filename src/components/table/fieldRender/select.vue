<template>
  <el-select v-model="row[field.prop]" placeholder="请选择模式" size="small" @change="onChange">
    <el-option
      v-for="item in options"
      :key="item.value"
      :label="item.label"
      :value="item.value"
    />
  </el-select>
</template>

<script setup>
import { computed } from 'vue'

// 接收父组件传来的 props
const props = defineProps({
  row: Object,
  field: Object,
  column: Object,
  index: Number,
})

// 可选项，如果父组件中没有设置，就使用默认值
const options = computed(() => {
  return props.field?.form?.props?.options ?? [
    { label: 'vkernel', value: 'vkernel' },
    { label: 'normal', value: 'normal' },
    { label: 'comparison', value: 'comparison'},
  ]
})

// 当值变动时触发（可选）
const onChange = (val) => {
  // 你可以在这里做点什么，比如发请求保存数据
  console.log(`第 ${props.index + 1} 行切换为：`, val)
}
</script>
