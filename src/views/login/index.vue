<template>
  <div class="login">
    <div class="left-wrap">
      <div class="logo">
        <svg class="icon" aria-hidden="true">
          <use xlink:href="#icon-zhaopian-copy"></use>
        </svg>
        <h1 class="title">{{ systemName }}</h1>
      </div>
      <img class="left-bg" src="@imgs/login/lf_bg.png" alt="" />
      <img class="left-img" src="@imgs/login/lf_icon.svg" alt="" />
    </div>
    <div class="right-wrap">
      <div class="header">
        <svg class="icon" aria-hidden="true">
          <use xlink:href="#icon-zhaopian-copy"></use>
        </svg>
        <h1>{{ systemName }}</h1>
      </div>
      <div class="login-wrap">
        <div class="form">
          <h3 class="title">欢迎回来</h3>
          <p class="sub-title">输入您的账号和密码登录</p>
          <div class="input-wrap">
            <span class="input-label" v-if="showInputLabel">账号</span>
            <el-input placeholder="请输入账号" size="large" v-model.trim="username" />
          </div>
          <div class="input-wrap">
            <span class="input-label" v-if="showInputLabel">密码</span>
            <el-input
              placeholder="请输入密码"
              size="large"
              v-model.trim="password"
              type="password"
              radius="8px"
              autocomplete="off"
              @keyup.enter="login"
            />
          </div>

          <div class="drag-verify">
            <div class="drag-verify-content" :class="{ error: !isPassing && isClickPass }">
              <DragVerify
                ref="dragVerify"
                v-model:value="isPassing"
                :width="width < 500 ? 328 : 438"
                radius="8px"
                text="按住滑块拖动"
                successText="验证成功"
                :progressBarBg="getCssVariable('--el-color-primary')"
                @pass="onPass"
              />
            </div>
            <p class="error-text" :class="{ 'show-error-text': !isPassing && isClickPass }"
              >请拖动滑块完成验证</p
            >
          </div>

          <div class="forget-password">
            <el-checkbox v-model="rememberPassword">记住密码</el-checkbox>
            <router-link to="/forget-password">忘记密码？</router-link>
          </div>

          <div style="margin-top: 30px">
            <el-button
              class="login-btn"
              size="large"
              type="primary"
              @click="login"
              :loading="loading"
            >
              登录
            </el-button>
          </div>

          <div class="footer">
            <p>
              还没有账号？
              <router-link to="/register">注册</router-link>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { SystemInfo } from '@/config/setting'
  import { ElMessage, ElNotification } from 'element-plus'
  import { useUserStore } from '@/store/modules/user'
  import { HOME_PAGE } from '@/router'
  import { UserService } from '@/api/usersApi'
  import { getCssVariable, getGreeting } from '@/utils/utils'

  const userStore = useUserStore()
  const router = useRouter()
  const isPassing = ref(false)
  const isClickPass = ref(false)
  const showInputLabel = ref(false)

  const systemName = SystemInfo.name
  const username = ref('admin')
  const password = ref('123123')
  const loading = ref(false)
  const rememberPassword = ref(true)
  const { width } = useWindowSize()

  const onPass = () => {}

  const login = async () => {
    if (!username.value) {
      ElMessage.error('请输入账号')
      return
    }

    if (!password.value) {
      ElMessage.error('请输入密码')
      return
    }

    if (!isPassing.value) {
      isClickPass.value = true
      return
    }

    loading.value = true

    const params = {
      username: username.value,
      password: password.value
    }

    try {
      // 封装 axios 登录，替换掉 .env 中的 VITE_API_URL 为你的 api 地址
      const res = await UserService.login(params)
      if (res.status) {
        if (res.data.token) {
          userStore.setUserInfo(res.data)
          userStore.setLoginStatus(true)
          userStore.saveUserData()
          router.push(HOME_PAGE) // 登录成功后跳转到主页
        }
      }
    } finally {
      loading.value = false // 无论成功还是失败，都停止加载
    }
  }

  // 登录成功提示
  const showLoginSuccessNotice = () => {
    setTimeout(() => {
      ElNotification({
        title: getGreeting(),
        type: 'success',
        showClose: false,
        duration: 3000,
        message: `欢迎登录 ${systemName}`
      })
    }, 300)
  }
</script>

<style lang="scss" scoped>
  @import './index';
</style>
