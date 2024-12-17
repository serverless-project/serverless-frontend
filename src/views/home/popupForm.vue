<template>
  <!-- 对话框表单 -->
  <el-dialog
    class="ba-operate-dialog"
    :close-on-click-modal="false"
    :destroy-on-close="true"
    :model-value="['Add', 'Edit'].includes(baTable.form.operate!)"
    @close="baTable.toggleForm"
  >
    <template #header>
      <div class="title" v-drag="['.ba-operate-dialog', '.el-dialog__header']" v-zoom="'.ba-operate-dialog'">
        {{ baTable.form.operate ? t(baTable.form.operate) : '' }}
      </div>
    </template>
    <el-scrollbar v-loading="baTable.form.loading" class="ba-table-form-scrollbar">
      <div
        class="ba-operate-form"
        :class="'ba-' + baTable.form.operate + '-form'"
        :style="config.layout.shrink ? '' : 'width: calc(100% - ' + baTable.form.labelWidth! / 2 + 'px)'"
      >
        <el-form
          ref="formRef"
          @keyup.enter="baTable.onSubmit(formRef)"
          :model="baTable.form.items"
          :label-position="config.layout.shrink ? 'top' : 'right'"
          :label-width="baTable.form.labelWidth + 'px'"
          :rules="rules"
          v-if="!baTable.form.loading"
        >
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
import { inject, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import type baTableClass from '/@/utils/baTable';
import { buildValidatorData, regularPassword } from '/@/utils/validate';
import type { FormInstance, FormItemRule } from 'element-plus';
import { useConfig } from '/@/stores/config';

const config = useConfig();
const formRef = ref<FormInstance>();
const baTable = inject('baTable') as baTableClass;

const { t } = useI18n();

const rules: Partial<Record<string, FormItemRule[]>> = reactive({
  username: [
    buildValidatorData({
      name: 'required',
      title: t('user.user.User name'),
    }),
    buildValidatorData({ name: 'account' }),
  ],
  nickname: [buildValidatorData({ name: 'required', title: t('user.user.nickname') })],
  group_id: [
    buildValidatorData({
      name: 'required',
      message: t('Please select field', { field: t('user.user.grouping') }),
    }),
  ],
  email: [buildValidatorData({ name: 'email', title: t('user.user.email') })],
  mobile: [buildValidatorData({ name: 'mobile' })],
  password: [
    {
      validator: (rule: any, val: string, callback: Function) => {
        if (baTable.form.operate == 'Add') {
          if (!val) {
            return callback(new Error(t('Please input field', { field: t('user.user.password') })));
          }
        } else {
          if (!val) {
            return callback();
          }
        }
        if (!regularPassword(val)) {
          return callback(new Error(t('validate.Please enter the correct password')));
        }
        return callback();
      },
      trigger: 'blur',
    },
  ],
});

watch(
  () => baTable.form.operate,
  (newVal) => {
    rules.password![0].required = newVal == 'Add';
  }
);
</script>

<style scoped lang="scss">
.avatar-uploader {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border-radius: var(--el-border-radius-small);
  box-shadow: var(--el-box-shadow-light);
  border: 1px dashed var(--el-border-color);
  cursor: pointer;
  overflow: hidden;
  width: 110px;
  height: 110px;
}

.avatar-uploader:hover {
  border-color: var(--el-color-primary);
}

.avatar {
  width: 110px;
  height: 110px;
  display: block;
}

.image-slot {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style>
