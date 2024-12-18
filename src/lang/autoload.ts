import { homeBaseRoutePath } from '/@/router/static/homeBase';

/*
 * 语言包按需加载映射表
 * 使用固定字符串 ${lang} 指代当前语言
 * key 为页面 path，value 为语言包文件相对路径，访问时，按需自动加载映射表的语言包，同时加载 path 对应的语言包（若存在）
 */
export default {
    '/': ['./frontend/${lang}/index.json.ts'],
    [homeBaseRoutePath + '/moduleStore']: ['./backend/${lang}/module.ts'],
    [homeBaseRoutePath + '/user/rule']: ['./backend/${lang}/auth/rule.ts'],
    [homeBaseRoutePath + '/user/scoreLog']: ['./backend/${lang}/user/moneyLog.ts'],
    [homeBaseRoutePath + '/crud/crud']: ['./backend/${lang}/crud/log.ts', './backend/${lang}/crud/state.ts'],
};
