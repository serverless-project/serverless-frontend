<template>
  <el-dialog style="height: 350px;" class="ba-operate-dialog" :close-on-click-modal="false" :destroy-on-close="true"
    :model-value="['Add', 'Edit'].includes(baTable.form.operate!)" @close="baTable.toggleForm">
    <template #header>
      <div class="title" v-drag="['.ba-operate-dialog', '.el-dialog__header']" v-zoom="'.ba-operate-dialog'">
        {{ baTable.form.operate ? t(baTable.form.operate) : '' }}
      </div>
    </template>
    <el-scrollbar v-loading="baTable.form.loading" class="ba-table-form-scrollbar">
      <div class="ba-operate-form" :class="'ba-' + baTable.form.operate + '-form'"
        :style="config.layout.shrink ? '' : 'width: calc(100% - ' + baTable.form.labelWidth! / 2 + 'px)'">
        <el-form ref="formRef" @keyup.enter="baTable.onSubmit(formRef)" :model="baTable.form.items"
          :label-position="config.layout.shrink ? 'top' : 'right'" :label-width="baTable.form.labelWidth + 'px'"
          :rules="rules" v-if="!baTable.form.loading">

          <el-form-item label="应用名称" prop="app_name">
            <el-input v-model="baTable.form.items.app_name" />
          </el-form-item>

          <el-form-item label="应用路径" prop="app_path">
            <el-input v-model="baTable.form.items.app_path" />
          </el-form-item>

          <el-form-item label="应用描述" prop="app_description">
            <el-input v-model="baTable.form.items.app_description" type="textarea" :rows="3" />
          </el-form-item>

        </el-form>
      </div>
    </el-scrollbar>
    <template #footer>
      <div :style="'width: calc(100% - ' + baTable.form.labelWidth! / 1.8 + 'px)'">
        <el-button @click="baTable.toggleForm('')">{{ t('Cancel') }}</el-button>
        <el-button v-blur :loading="baTable.form.submitLoading" @click="baTable.onSubmit(formRef)" type="primary">
          {{ baTable.form.operateIds && baTable.form.operateIds.length > 1 ? t('Save and edit next item') : t('Save') }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { inject, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { buildValidatorData } from '/@/utils/validate';
import type { FormInstance, FormItemRule } from 'element-plus';
import { useConfig } from '/@/stores/config';

const config = useConfig();
const formRef = ref<FormInstance>();
const baTable = inject('baTable') as any;

const { t } = useI18n();

const rules: Partial<Record<string, FormItemRule[]>> = reactive({
  app_name: [
    buildValidatorData({
      name: 'required',
      title: '应用名称',
    }),
  ],
  app_path: [
    buildValidatorData({
      name: 'required',
      title: '应用路径',
    }),
  ],
  // app_description 不必填无需校验
});

</script>
