import { getUrl } from '/@/utils/axios';
import { homeBaseRoutePath } from '/@/router/static/homeBase';

export const terminalUrl = homeBaseRoutePath + '/ajax/terminal';

export function buildTerminalUrl(commandKey: string, uuid: string, extend: string) {
    return getUrl() + terminalUrl + '?command=' + commandKey + '&uuid=' + uuid + '&extend=' + extend + '&batoken=' + '' + '&server=1';
}
