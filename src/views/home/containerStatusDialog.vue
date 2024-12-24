<script setup lang="ts">
import { inject } from 'vue';
import type baTableClass from '/@/utils/baTable';

const baTable = inject('baTable') as baTableClass;
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
      <div class="title" v-drag="['.ba-operate-dialog', '.el-dialog__header']" v-zoom="'.ba-operate-dialog'">
        {{ '状态' }}
      </div>
    </template>
    <span>
      {{ baTable.form.items!.status }}
    </span>
  </el-dialog>
</template>

<style scoped lang="scss"></style>
