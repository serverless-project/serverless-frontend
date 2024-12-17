import { createAxios, getUrl } from '/@/utils/axios';
import { homeBaseRoutePath } from '/@/router/static/homeBase';

export const terminalUrl = homeBaseRoutePath + '/ajax/terminal';

export function buildTerminalUrl(commandKey: string, uuid: string, extend: string) {
    return getUrl() + terminalUrl + '?command=' + commandKey + '&uuid=' + uuid + '&extend=' + extend + '&batoken=' + '' + '&server=1';
}

/**
 * 生成一个控制器的：增、删、改、查、排序的操作url
 */
export class baTableApi {
    private readonly controllerUrl;
    public actionUrl;

    constructor(controllerUrl: string) {
        this.controllerUrl = controllerUrl;
        this.actionUrl = new Map([
            ['index', controllerUrl + 'index.json'],
            ['add', controllerUrl + 'add'],
            ['edit', controllerUrl + 'edit'],
            ['del', controllerUrl + 'del'],
            ['sortable', controllerUrl + 'sortable'],
        ]);
    }

    index(filter: anyObj = {}) {
        return createAxios<TableDefaultData>({
            url: this.actionUrl.get('index'),
            method: 'get',
            params: filter,
        });
    }

    edit(params: anyObj) {
        return createAxios({
            url: this.actionUrl.get('edit'),
            method: 'get',
            params: params,
        });
    }

    del(ids: string[]) {
        return createAxios(
            {
                url: this.actionUrl.get('del'),
                method: 'DELETE',
                params: {
                    ids: ids,
                },
            },
            {
                showSuccessMessage: true,
            }
        );
    }

    postData(action: string, data: anyObj) {
        return createAxios(
            {
                url: this.actionUrl.has(action) ? this.actionUrl.get(action) : this.controllerUrl + action,
                method: 'post',
                data: data,
            },
            {
                showSuccessMessage: true,
            }
        );
    }

    sortable(data: anyObj) {
        return createAxios({
            url: this.actionUrl.get('sortable'),
            method: 'post',
            data: data,
        });
    }
}
