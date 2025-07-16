<script setup lang="ts">
import { inject, ref, watch } from 'vue';
import type baTableClass from '/@/utils/baTable';
import hljs from 'highlight.js/lib/core';
import plaintext from 'highlight.js/lib/languages/plaintext';

hljs.registerLanguage('plaintext', plaintext);

const baTable = inject('baTable') as baTableClass;
const highlightedLog = ref('');

watch(
  () => baTable.form.items?.status,
  (newStatus) => {
    if (newStatus) {
      const filteredLines = newStatus.split('\n').filter((line: string) => {
        return (
          !line.startsWith('Error from server') &&
          !line.includes('ERROR Engine') &&
          !line.includes('(core dumped)') &&
          !line.includes('DeprecationWarning') && 
          !line.includes('node --trace-deprecation')
        );
      }).map((line: string) => {
        // 匹配并提取 INFO Latency 或 INFO Overall latency 行的 avg 值
        const latencyMatch = line.match(/^(.*INFO (Latency|Overall latency) \(s\):).*avg=([0-9.]+)/);
        if (latencyMatch) {
          // 保留前面的部分，并只替换 avg= 后面的部分
          return `${latencyMatch[1]} avg=${latencyMatch[3]}`;
        }
        return line;
      }).join('\n');
      highlightedLog.value = hljs.highlight(filteredLines, { language: 'plaintext' }).value;
    } else {
      highlightedLog.value = '';
    }
  }
);

const closeWs = () => {
  if ((baTable as any).ws) {
    (baTable as any).ws.close();
    (baTable as any).ws = null;
    console.log('WebSocket closed on dialog close');
  }
};
</script>

<template>
  <el-dialog class="ba-operate-dialog" :close-on-click-modal="false" :destroy-on-close="true"
    :model-value="['ViewContainerStatus'].includes(baTable.form.operate!)"
    @close="() => { closeWs(); baTable.toggleForm(); }">
    <template #header>
      <div class="title" v-drag="['.ba-operate-dialog', '.el-dialog__header']" v-zoom="'.ba-operate-dialog'">调用日志
      </div>
    </template>
    <pre v-html="highlightedLog"></pre>
  </el-dialog>
</template>

<style scoped lang="scss">
pre {
  background-color: #f5f5f5;
  color: #333;
  white-space: pre-wrap;
  word-wrap: break-word;
  height: 470px;
  overflow-y: auto;
}
</style>
