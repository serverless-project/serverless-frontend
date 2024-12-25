<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { getUrl } from '/@/utils/axios';
import { useUserInfo } from '/@/stores/userInfo';

const username = ref('');
const password = ref('');

onMounted(() => {
  const container = document.querySelector('.container') as Element;
  const registerBtn = document.querySelector('.register-btn') as Element;
  const loginBtn = document.querySelector('.login-btn') as Element;

  registerBtn.addEventListener('click', () => {
    container.classList.add('active');
  });

  loginBtn.addEventListener('click', () => {
    container.classList.remove('active');
  });
});

const router = useRouter();

const login = () => {
  const env: string = import.meta.env.MODE as string;
  if (env == 'development') {
    router.push({ path: '/home' }).catch((err) => {
      console.log(err);
    });
    return;
  }
  const formData = new FormData();
  formData.append('username', username.value);
  formData.append('password', password.value);
  axios.post(getUrl() + '/account/login', formData).then((response) => {
    if (response.status === 200) {
      // 登录成功
      console.log('登录成功');
      const userInfo = useUserInfo();
      userInfo.setToken(response.data.access_token);
      // this.$store.commit('auth', response.data.access_token);
      router.push({ path: '/home' }).catch((err) => {
        console.log(err);
      });
    }
  });
};
</script>

<template>
  <link href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css" rel="stylesheet" />
  <div class="body">
    <div class="container">
      <div class="form-box login">
        <form @submit.prevent>
          <h1>欢迎</h1>
          <div class="input-box">
            <input type="text" placeholder="username" v-model="username" />
            <i class="bx bxs-user"></i>
          </div>
          <div class="input-box">
            <!-- placeholder是未输入时的背景提示 -->
            <input type="password" placeholder="password" v-model="password" />
            <i class="bx bxs-lock-alt"></i>
          </div>
          <!--        <div class="forgot-link">-->
          <!--          <a href="">找回密码</a>-->
          <!--        </div>-->
          <button @click="login" class="btn">登录</button>
          <!--        <p>使用其他社交平台登录</p>-->
          <!--        &lt;!&ndash; 社交平台登录图标和名称 &ndash;&gt;-->
          <!--        <div class="social-icons">-->
          <!--          &lt;!&ndash; mingcute_qq-line &ndash;&gt;-->
          <!--          <a href=""><img src="../assets/icons/mingcute_qq-line.svg" alt="1"></a>-->
          <!--          <a href=""><img src="../assets/icons/hugeicons_wechat.svg" alt="2"></a>-->

          <!--          <a href="#"><i class='bx bxl-facebook'></i></a>-->
          <!--          <a href="#"><i class='bx bxl-github' ></i></a>-->
          <!--          <a href="#"><i class='bx bxl-linkedin' ></i></a>-->
          <!--        </div>-->
        </form>
      </div>

      <div class="form-box register">
        <form action="">
          <h1>注册</h1>
          <div class="input-box">
            <input type="text" placeholder="Username" required />
            <i class="bx bxs-user"></i>
          </div>
          <div class="input-box">
            <input type="email" placeholder="Email" required />
            <i class="bx bx-envelope bx-flip-horizontal"></i>
          </div>
          <div class="input-box">
            <!-- placeholder是未输入时的背景提示 -->
            <input type="password" placeholder="password" required />
            <i class="bx bxs-lock-alt"></i>
          </div>

          <!--        <button type="submit" class="btn">确定</button>-->
          <!--        <p>使用其他社交平台登录</p>-->
          <!--        &lt;!&ndash; 社交平台登录图标和名称 &ndash;&gt;-->
          <!--        <div class="social-icons">-->
          <!--          <a href=""><img :src="require('/@/assets/icons/mingcute_qq-line.svg')" alt="1"></a>-->
          <!--          <a href=""><img :src="require('/@/assets/icons/hugeicons_wechat.svg')" alt="2"></a>-->

          <!--          &lt;!&ndash; <a href="#"><i class='bx bxl-facebook'></i></a>-->
          <!--          <a href="#"><i class='bx bxl-github' ></i></a>-->
          <!--          <a href="#"><i class='bx bxl-linkedin' ></i></a> &ndash;&gt;-->
          <!--        </div>-->
        </form>
      </div>

      <div class="toggle-box">
        <div class="toggle-panel toggel-left">
          <img class="logo-img" src="/images/logo.png" alt="logo" />

          <button class="btn register-btn">注册</button>
        </div>
        <div class="toggle-panel toggel-right">
          <h1>欢迎回来</h1>
          <p>已经拥有账号</p>
          <button class="btn login-btn">登录</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.logo-img {
  width: 100px;
  margin-bottom: 10px;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Poppins', sans-serif;
}

.body {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(90deg, #e2e2e2, #c9d6ff);
}

.container {
  position: relative;
  width: 850px;
  height: 550px;
  background: #fff;
  border-radius: 30px;
  /* 盒子圆角 */
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.2);
  /* 隐藏多余出界的部分 */
  overflow: hidden;
}

.form-box {
  position: absolute;
  margin: auto;
  right: 0;
  width: 50%;
  height: 100%;
  background: white;
  display: flex;
  align-items: center;
  color: #333;
  text-align: center;
  padding: 40px;
  /* 设置优先看到的顺序 */
  z-index: 1;
  transition:
    0.6s ease-in-out 1.2s,
    visibility 0s 1s;
}

.container.active .form-box {
  right: 50%;
}

.form-box.register {
  visibility: hidden;
}

.container.active .form-box.register {
  visibility: visible;
}

form {
  /* background: purple; */
  width: 100%;
}

.container h1 {
  font-size: 36px;
  margin: -10px 0;
}

/* 设置边距 */
.input-box {
  position: relative;
  margin: 30px 0;
}

/* 设置输入边框样式 */
.input-box input {
  width: 100%;
  padding: 13px;
  background: #eee;
  border-radius: 8px;
  border: none;
  outline: none;
  font-size: 16px;
  color: #333;
  font-weight: 500;
}

.input-box input::placeholder {
  color: #888;
  font-weight: 400;
}

.social-icons a {
  margin-right: 10px;
}

/* 设置输入框里面的图标样式 */
.input-box i {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 20px;
  color: #888;
}

.forgot-link {
  margin: -15px 0 15px;
}

.forgot-link a {
  font-size: 14.5px;
  color: #333;
  text-decoration: none;
}

/* 登入按钮设置 */
.btn {
  width: 100%;
  height: 48px;
  background: #7494ec;
  border-radius: 8px;
  /* 圆角设置 */
  box-shadow: 0 0 10px rgba(0, 0, 0, -1);
  border: none;
  cursor: pointer;
  font-size: 16px;
  color: #fff;
  font-weight: 600;
}

.container p {
  font-size: 14.5px;
  margin: 15px 0;
}

.social-icons {
  display: flex;
  justify-content: center;
}

.social-icons a {
  display: inline-flex;
  padding: 8px;
  border: 2px solid #ccc;
  border-radius: 8px;
  font-size: 28px;
  color: #333;
  text-decoration: none;
  margin: 0 10px;
}

.toggle-box {
  position: absolute;
  width: 100%;
  height: 100%;
  /* background: purple; */
}

.toggle-box::before {
  content: '';
  position: absolute;
  left: -250%;
  width: 300%;
  height: 100%;
  background: #7494ec;
  /* border:2px solid red; */
  /* 设置圆角 */
  border-radius: 150px;
  z-index: 2;
  /* 设置平滑效果 */
  transition: 1s ease-in-out;
}

.container.active .toggle-box::before {
  left: 50%;
}

/* 设置左边界面的CSS样式 */
.toggle-panel {
  position: absolute;
  width: 50%;
  height: 100%;
  /* background: #fff; */
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 2;
  transition: 0.6s ease-in-out;
}

.toggle-panel.toggel-left {
  left: 0;
  transition-delay: 1.2s;
}

.container.active .toggle-panel.toggel-left {
  left: -50%;
  transition-delay: 0.6s;
}

.toggle-panel.toggel-right {
  right: -50%;
  transition-delay: 0.6s;
}

.container.active .toggle-panel.toggel-right {
  right: 0;
  transition-delay: 1.2s;
}

.toggle-panel p {
  margin-bottom: 20px;
}

.toggle-panel .btn {
  width: 160px;
  height: 46px;
  background: transparent;
  border: 2px solid #fff;
  box-shadow: none;
}

@media screen and (max-width: 650px) {
  .container {
    height: calc(100vh - 40px);
  }
}
</style>
