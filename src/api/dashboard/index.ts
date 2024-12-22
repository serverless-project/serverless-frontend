import { createAxios } from '/@/utils/axios';

export function ftBuild() {
    return createAxios({
        url: '/ft/build',
        method: 'post',
    });
}