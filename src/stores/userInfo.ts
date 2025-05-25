import { defineStore } from 'pinia';
import { USER_INFO } from '/@/stores/constant/cacheKey';
import type { UserInfo } from '/@/stores/interface';

export const useUserInfo = defineStore('userInfo', {
    state: (): UserInfo => {
        return {
            id: 0,
            username: '',
            nickname: '',
            avatar: '',
            last_login_time: '',
            token: '',
            is_superuser: false,
            email: '',
        };
    },
    actions: {
        dataFill(state: UserInfo) {
            this.$state = { ...this.$state, ...state };
        },
        setToken(token:string) {
            this.$state.token = token;
        }
    },
    persist: {
        key: USER_INFO,
    },
});
