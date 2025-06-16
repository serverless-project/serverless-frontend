import { ElMessage, TableColumnCtx, ElMessageBox} from 'element-plus';
import { i18n } from '/@/lang';
import type baTableClass from '/@/utils/baTable';
import { ftBuild, ftDeploy, ftInvoke, ftGetLog, ftGetPassword, ftGetProcess} from '/@/api/dashboard';
import { errorMessages } from 'vue/compiler-sfc';
import { log } from 'console';

/**
 * 获取单元格值
 */
export const getCellValue = (row: TableRow, field: TableColumn, column: TableColumnCtx<TableRow>, index: number) => {
    if (!field.prop) return '';

    const prop = field.prop;
    let cellValue: any = row[prop];

    // 字段 prop 带 . 比如 user.nickname
    if (prop.indexOf('.') > -1) {
        const fieldNameArr = prop.split('.');
        cellValue = row[fieldNameArr[0]];
        for (let index = 1; index < fieldNameArr.length; index++) {
            cellValue = cellValue ? cellValue[fieldNameArr[index]] ?? '' : '';
        }
        return cellValue;
    }

    // 若无值，尝试取默认值
    if (cellValue === undefined || cellValue === null) {
        cellValue = field.default;
    }

    // 渲染前格式化
    if (field.renderFormatter && typeof field.renderFormatter == 'function') {
        cellValue = field.renderFormatter(row, field, cellValue, column, index);
        console.warn('baTable.table.column.renderFormatter 即将废弃，请直接使用兼容 el-table 的 baTable.table.column.formatter 代替');
    }
    if (field.formatter && typeof field.formatter == 'function') {
        cellValue = field.formatter(row, column, cellValue, index);
    }

    return cellValue;
};

export const appOptButtons = (): OptButton[] => {
    return [
        {
            render: 'tipButton',
            name: 'edit',
            title: 'Edit',
            text: '',
            type: 'text',
            icon: 'fa fa-code',
            class: 'table-opt-button',
            disabledTip: false,
            click: async (row, field, baTable: baTableClass) => {
                // TODO: 打开编辑器
                window.open('https://www.baidu.com', '_blank');
            },
        },
        {
            render: 'tipButton',
            name: 'log',
            title: '应用操作信息',
            text: '',
            type: 'text',
            icon: 'fa fa-file-text',
            class: 'table-opt-button',
            disabledTip: false,
            click: async (row, field, baTable: baTableClass) => {
                try {
                    const response = await ftGetLog(row.id); 
                    const logText = response?.data?.output || '应用操作信息内容为空'; // 根据后端返回结构调整这一行
                
                    // ✅ 展示弹窗
                    ElMessageBox({
                      title: `应用【${row.name}】操作信息`,
                      message: `<pre style="white-space: pre-wrap; word-break: break-word; max-height: 400px; overflow-y: auto;">${logText}</pre>`,
                      dangerouslyUseHTMLString: true,
                      showCancelButton: false,
                      confirmButtonText: '关闭',
                      customClass: 'log-dialog-box',
                    });
                  } catch (err: any) {
                    ElMessage.error('应用操作信息加载失败: ' + (err?.message || err));
                  }
                }
              
        },
        {
            render: 'tipButton',
            name: 'access priority',
            title: '访问权限',
            text: '',
            type: 'text',
            icon: 'fa fa-lock',
            class: 'table-opt-button',
            disabledTip: false,
            click: async (row, field, baTable: baTableClass) => {
                try {
                  const response = await ftGetPassword(row.id); 
                  const logText = response?.data?.output || '访问权限内容为空'; // 根据后端返回结构调整这一行
              
                  console.log(response);
                  // ✅ 展示弹窗
                  ElMessageBox({
                    title: `应用:【${row.name}】密码`,
                    message: `<pre style="white-space: pre-wrap; word-break: break-word; max-height: 600px; overflow-y: auto;">${logText}</pre>`,
                    dangerouslyUseHTMLString: true,
                    showCancelButton: false,
                    confirmButtonText: '关闭',
                    customClass: 'log-dialog-box',
                  });
                } catch (err: any) {
                  ElMessage.error('密码加载失败: ' + (err?.message || err));
                }
              }
        },   
        {
            render: 'tipButton',
            name: 'syscall',
            title: '系统调用',
            text: '',
            type: 'text',
            icon: 'fa fa-wrench',
            class: 'table-opt-button',
            disabledTip: false,
            click: async (row, field, baTable: baTableClass) => {
                try {
                  const response = await ftGetProcess(row.id); 
                  const logText = response?.data?.output || '进程号内容为空'; // 根据后端返回结构调整这一行
              
                  console.log(response);
                  // ✅ 展示弹窗
                  ElMessageBox({
                    title: `应用:【${row.name}】进程号`,
                    message: `<pre style="white-space: pre-wrap; word-break: break-word; max-height: 600px; overflow-y: auto;">${logText}</pre>`,
                    dangerouslyUseHTMLString: true,
                    showCancelButton: false,
                    confirmButtonText: '关闭',
                    customClass: 'log-dialog-box',
                  });
                } catch (err: any) {
                  ElMessage.error('进程号加载失败: ' + (err?.message || err));
                }
              }
        },
        {
            render: 'tipButton',
            name: 'performance',
            title: '性能演示',
            text: '',
            type: 'text',
            icon: 'fa fa-paper-plane',
            class: 'table-opt-button',
            disabledTip: false,
            click: async (row, field, baTable: baTableClass) => {
              }
        },
        // {
        //     render: 'tipButton',
        //     name: 'build',
        //     title: '构建',
        //     text: '',
        //     type: 'text',
        //     icon: 'fa fa-wrench',
        //     class: 'table-opt-button',
        //     disabledTip: false,
        //     click: async (row, field, baTable: baTableClass) => {
        //         console.log(row);
        //         // TODO: 封装以下try-catch过程
        //         // TODO: 修改参数
        //         try {
        //             const res = await ftBuild({
        //                 path: '123',
        //                 name: '123'
        //             });
        //             ElMessage.success(res.data?.message)
        //         } catch (err: any) {
        //             ElMessage.error(err?.message)
        //         }
        //     },
        // },
        {
            render: 'tipButton',
            name: 'deploy',
            title: '部署',
            text: '',
            type: 'text',
            icon: 'fa fa-cloud-upload',
            class: 'table-opt-button',
            disabledTip: false,
            click: async (row, field, baTable: baTableClass) => {
                console.log(row);
                // TODO: 修改参数
                try {
                    const res = await ftDeploy({
                        path: '123',
                        name: '123'
                    });
                    ElMessage.success(res.data?.message)
                } catch (err: any) {
                    ElMessage.error(err?.message)
                }
            },
        },
        // {
        //     render: 'dropdownButton',
        //     name: 'invoke',
        //     title: '调用',
        //     text: '',
        //     type: 'text',
        //     icon: 'fa fa-paper-plane',
        //     class: 'table-opt-button',
        //     disabledTip: false,
        //     dropdownMenu: {
        //         async handleCommand(command, row, field, baTable) {
        //             // 根据 command 进行不同方式的调用
        //             console.log(command); // basic / fast-start
        //             if (command === 'basic') {
        //                 console.log(row);
        //                 // TODO: 修改参数
        //                 try {
        //                     const res = await ftInvoke({
        //                         path: '123',
        //                         name: '123'
        //                     });
        //                     ElMessage.success(res.data?.message)
        //                 } catch (err: any) {
        //                     ElMessage.error(err?.message)
        //                 }
        //             }
        //         },
        //         items: [
        //             {
        //                 command: 'basic',
        //                 name: '普通调用',
        //             },
        //             {
        //                 command: 'fast-start',
        //                 name: '快速启动',
        //             },
        //         ],
        //     },
        // },
        // {
        //     render: 'tipButton',
        //     name: 'dag',
        //     title: 'DAG',
        //     text: '',
        //     type: 'text',
        //     icon: 'fa fa-share-alt',
        //     class: 'table-opt-button',
        //     disabledTip: false,
        //     click(row, field) {
        //         console.log(row.id);
        //         console.log(field);
        //     },
        // },
        {
            render: 'tipButton',
            name: 'status',
            title: '容器状态',
            text: '',
            type: 'text',
            icon: 'fa fa-cube',
            class: 'table-opt-button',
            disabledTip: false,
            click(row, field, baTable: baTableClass) {
                // TODO: 根据 row.id 调用后端 API 获取对应应用的容器状态
                console.log(row.id);
                baTable.form.items = {
                    status: '从后端获取的状态信息',
                };
                baTable.toggleForm('ViewContainerStatus');
            },
        },
        {
            render: 'confirmButton',
            name: 'delete',
            title: 'Delete',
            text: '',
            type: 'text',
            icon: 'fa fa-trash',
            class: 'table-opt-button',
            popconfirm: {
                confirmButtonText: i18n.global.t('Delete'),
                cancelButtonText: i18n.global.t('Cancel'),
                confirmButtonType: 'danger',
                title: '确认要删除当前应用吗？',
            },
            disabledTip: false,
        },
    ];
};

/*
 * 默认按钮组
 */
export const defaultOptButtons = (optButType: DefaultOptButType[] = ['weigh-sort', 'edit', 'delete']): OptButton[] => {
    const optButtonsPre: Map<string, OptButton> = new Map([
        [
            'weigh-sort',
            {
                render: 'moveButton',
                name: 'weigh-sort',
                title: 'Drag sort',
                text: '',
                type: 'info',
                icon: 'fa fa-arrows',
                class: 'table-row-weigh-sort',
                disabledTip: false,
            },
        ],
        [
            'edit',
            {
                render: 'tipButton',
                name: 'edit',
                title: 'Edit',
                text: '',
                type: 'primary',
                icon: 'fa fa-pencil',
                class: 'table-row-edit',
                disabledTip: false,
            },
        ],
        [
            'delete',
            {
                render: 'confirmButton',
                name: 'delete',
                title: 'Delete',
                text: '',
                type: 'danger',
                icon: 'fa fa-trash',
                class: 'table-row-delete',
                popconfirm: {
                    confirmButtonText: i18n.global.t('Delete'),
                    cancelButtonText: i18n.global.t('Cancel'),
                    confirmButtonType: 'danger',
                    title: i18n.global.t('Are you sure to delete the selected record?'),
                },
                disabledTip: false,
            },
        ],
    ]);

    const optButtons: OptButton[] = [];
    for (const key in optButType) {
        if (optButtonsPre.has(optButType[key])) {
            optButtons.push(optButtonsPre.get(optButType[key])!);
        }
    }
    return optButtons;
};

/**
 * 将带children的数组降维，然后寻找index所在的行
 */
export const findIndexRow = (data: TableRow[], findIdx: number, keyIndex: number | TableRow = -1): number | TableRow => {
    for (const key in data) {
        if (typeof keyIndex == 'number') {
            keyIndex++;
        }

        if (keyIndex == findIdx) {
            return data[key];
        }

        if (data[key].children) {
            keyIndex = findIndexRow(data[key].children!, findIdx, keyIndex);
            if (typeof keyIndex != 'number') {
                return keyIndex;
            }
        }
    }

    return keyIndex;
};

type DefaultOptButType = 'weigh-sort' | 'edit' | 'delete';


