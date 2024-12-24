<template>
  <div v-memo="[field]">
    <template v-for="(btn, idx) in field.buttons" :key="idx">
      <template v-if="btn.display ? btn.display(row, field) : true">
        <!-- 常规按钮 -->
        <el-button
          v-if="btn.render == 'basicButton'"
          v-blur
          @click="onButtonClick(btn)"
          :class="btn.class"
          class="ba-table-render-buttons-item"
          :type="btn.type"
          :disabled="btn.disabled && btn.disabled(row, field)"
          v-bind="btn.attr"
        >
          <Icon v-if="btn.icon" :name="btn.icon" />
          <div v-if="btn.text" class="text">{{ getTranslation(btn.text) }}</div>
        </el-button>

        <!-- 带提示信息的按钮 -->
        <el-tooltip
          v-if="btn.render == 'tipButton' && ((btn.name == 'edit' && baTable.auth('edit')) || btn.name != 'edit')"
          :disabled="!(btn.title && !btn.disabledTip)"
          :content="getTranslation(btn.title)"
          placement="top"
          :show-after="500"
        >
          <el-button
            v-blur
            @click="onButtonClick(btn)"
            :class="btn.class"
            class="ba-table-render-buttons-item"
            :type="btn.type"
            :disabled="btn.disabled && btn.disabled(row, field)"
            v-bind="btn.attr"
          >
            <Icon v-if="btn.icon" :name="btn.icon" />
            <div v-if="btn.text" class="text">{{ getTranslation(btn.text) }}</div>
          </el-button>
        </el-tooltip>

        <!-- 带确认框的按钮 -->
        <el-popconfirm
          v-if="btn.render == 'confirmButton' && ((btn.name == 'delete' && baTable.auth('del')) || btn.name != 'delete')"
          :disabled="btn.disabled && btn.disabled(row, field)"
          v-bind="btn.popconfirm"
          @confirm="onButtonClick(btn)"
        >
          <template #reference>
            <div class="ml-6">
              <el-tooltip :disabled="btn.title ? false : true" :show-after="500" :content="getTranslation(btn.title)" placement="top">
                <el-button
                  v-blur
                  :class="btn.class"
                  class="ba-table-render-buttons-item"
                  :type="btn.type"
                  :disabled="btn.disabled && btn.disabled(row, field)"
                  v-bind="btn.attr"
                >
                  <Icon v-if="btn.icon" :name="btn.icon" />
                  <div v-if="btn.text" class="text">{{ getTranslation(btn.text) }}</div>
                </el-button>
              </el-tooltip>
            </div>
          </template>
        </el-popconfirm>

        <!-- 带提示的可拖拽按钮 -->
        <el-tooltip
          v-if="btn.render == 'moveButton' && ((btn.name == 'weigh-sort' && baTable.auth('sortable')) || btn.name != 'weigh-sort')"
          :disabled="btn.title && !btn.disabledTip ? false : true"
          :content="getTranslation(btn.title)"
          placement="top"
          :show-after="500"
        >
          <el-button
            :class="btn.class"
            class="ba-table-render-buttons-item move-button"
            :type="btn.type"
            :disabled="btn.disabled && btn.disabled(row, field)"
            v-bind="btn.attr"
          >
            <Icon v-if="btn.icon" :name="btn.icon" />
            <div v-if="btn.text" class="text">{{ getTranslation(btn.text) }}</div>
          </el-button>
        </el-tooltip>

        <!-- 带下拉菜单的按钮 -->
        <el-tooltip
          v-if="btn.render == 'dropdownButton'"
          :disabled="!(btn.title && !btn.disabledTip)"
          :content="getTranslation(btn.title)"
          placement="top"
          :show-after="500"
        >
          <el-dropdown
            @command="
              (command) => {
                onDropdownItemClick(btn, command);
              }
            "
          >
            <el-button
              v-blur
              :class="btn.class"
              class="ba-table-render-buttons-item"
              :type="btn.type"
              :disabled="btn.disabled && btn.disabled(row, field)"
              v-bind="btn.attr"
            >
              <Icon v-if="btn.icon" :name="btn.icon" />
              <div v-if="btn.text" class="text">{{ getTranslation(btn.text) }}</div>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item v-for="(item, $index) in btn.dropdownMenu?.items" :key="$index" :command="item.command">
                  {{ item.name }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </el-tooltip>

        <!-- 带复选和确认的下拉菜单按钮 -->
        <el-tooltip
          v-if="btn.render == 'multiSelectDropdownButton'"
          :disabled="!(btn.title && !btn.disabledTip)"
          :content="getTranslation(btn.title)"
          placement="top"
          :show-after="500"
        >
          <el-dropdown :hide-on-click="false">
            <el-button
              v-blur
              :class="btn.class"
              class="ba-table-render-buttons-item"
              :type="btn.type"
              :disabled="btn.disabled && btn.disabled(row, field)"
              v-bind="btn.attr"
            >
              <Icon v-if="btn.icon" :name="btn.icon" />
              <div v-if="btn.text" class="text">{{ getTranslation(btn.text) }}</div>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-checkbox-group v-model="selectedItems">
                  <el-dropdown-item v-for="(item, index) in btn.multiSelectDropdownMenu?.items" :key="index" style="padding: 0 8px">
                    <el-checkbox :label="item.command">{{ item.name }}</el-checkbox>
                  </el-dropdown-item>
                </el-checkbox-group>
                <el-button size="small" type="primary" class="ba-table-multi-select-confirm" @click="onMultiSelectConfirmClick(btn)">
                  {{ getTranslation(btn.title) }}
                </el-button>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </el-tooltip>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { TableColumnCtx } from 'element-plus';
import { inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type baTableClass from '/@/utils/baTable';
import Icon from '/@/components/icon/index.vue';

interface Props {
  row: TableRow;
  field: TableColumn;
  column: TableColumnCtx<TableRow>;
  index: number;
}

const { t, te } = useI18n();
const props = defineProps<Props>();
const baTable = inject('baTable') as baTableClass;

const selectedItems = ref<string[]>([]);

const onMultiSelectConfirmClick = (btn: OptButton) => {
  btn.multiSelectDropdownMenu?.confirm(selectedItems.value, props.row, props.field, baTable);
};

const onDropdownItemClick = (btn: OptButton, command: string | number | object) => {
  btn.dropdownMenu?.handleCommand(command, props.row, props.field, baTable);
};

const onButtonClick = (btn: OptButton) => {
  if (typeof btn.click === 'function') {
    btn.click(props.row, props.field, baTable);
    return;
  }
  baTable.onTableAction(btn.name, props);
};

const getTranslation = (key?: string) => {
  if (!key) return '';
  return te(key) ? t(key) : key;
};
</script>

<style scoped lang="scss">
.ba-table-multi-select-confirm {
  display: block;
  margin: 5px auto;
}

.ba-table-render-buttons-item {
  padding: 4px 5px;
  height: auto;

  .icon {
    font-size: 14px !important;
  }

  .text {
    padding-left: 5px;
  }
}

.ba-table-render-buttons-move {
  cursor: move;
}

.ml-6 {
  display: inline-flex;
  vertical-align: middle;
  margin-left: 6px;
}

.ml-6 + .el-button {
  margin-left: 6px;
}
</style>
