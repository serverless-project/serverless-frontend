<script setup lang="ts">
import { inject, ref, watch } from 'vue';
import type baTableClass from '/@/utils/baTable';
import hljs from 'highlight.js/lib/core';
import plaintext from 'highlight.js/lib/languages/plaintext';

hljs.registerLanguage('plaintext', plaintext);

const baTable = inject('baTable') as baTableClass;
const highlightedLog = ref('');

watch(
  () => baTable.form.items!.status,
  (newStatus) => {
    if (newStatus) {
      highlightedLog.value = hljs.highlight(newStatus, { language: 'plaintext' }).value;
    }
  }
);
</script>

<template>
  <el-dialog
    class="ba-operate-dialog"
    :close-on-click-modal="false"
    :destroy-on-close="true"
    :model-value="['ViewContainerStatus'].includes(baTable.form.operate!)"
    @close="baTable.toggleForm()"
  >
    <template #header>
      <div class="title" v-drag="['.ba-operate-dialog', '.el-dialog__header']" v-zoom="'.ba-operate-dialog'">状态-调用日志</div>
    </template>
    <pre v-html="highlightedLog"></pre>
  </el-dialog>
</template>

<style scoped lang="scss">
pre {
  background-color: #f5f5f5;
  color: #333;
  padding: 10px;
  white-space: pre-wrap;
  word-wrap: break-word;
  height: 550px;
  overflow-y: scroll; 
}
</style>
