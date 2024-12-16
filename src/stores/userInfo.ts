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
        };
    },
    actions: {
        dataFill(state: UserInfo) {
            this.$state = { ...this.$state, ...state };
        },
    },
    persist: {
        key: USER_INFO,
    },
});
