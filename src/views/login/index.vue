<template>
  <div class="login">
    <div class="left-wrap">
<<<<<<< HEAD
      <div class="logo">
        <svg class="icon" aria-hidden="true">
          <use xlink:href="#icon-zhaopian-copy"></use>
        </svg>
        <h1 class="title">{{ systemName }}</h1>
      </div>
      <img class="left-bg" src="@imgs/login/lf_bg.png" alt="" />
      <img class="left-img" src="@imgs/login/lf_icon.svg" alt="" />
=======
      <left-view></left-view>
>>>>>>> 7e44bc87fead3d7d9e9d4fea5d1ebb0cd7c6f772
    </div>
    <div class="right-wrap">
      <div class="top-right-wrap">
        <div class="btn theme-btn" @click="toggleTheme">
          <i class="iconfont-sys">
            {{ isDark ? '&#xe6b5;' : '&#xe6a0;' }}
          </i>
        </div>
        <el-dropdown @command="changeLanguage">
          <div class="btn language-btn">
            <i class="iconfont-sys">&#xe611;</i>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="zh">
                <span class="menu-txt">中文</span>
              </el-dropdown-item>
              <el-dropdown-item command="en">
                <span class="menu-txt">English</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
      <div class="header">
        <svg class="icon" aria-hidden="true">
          <use xlink:href="#iconsys-zhaopian-copy"></use>
        </svg>
        <h1>{{ systemName }}</h1>
      </div>
      <div class="login-wrap">
        <div class="form">
          <h3 class="title">{{ $t('login.title') }}</h3>
          <p class="sub-title">{{ $t('login.subTitle') }}</p>
          <div class="input-wrap">
            <el-input
              :placeholder="$t('login.placeholder[0]')"
              size="large"
              v-model.trim="username"
            />
          </div>
          <div class="input-wrap">
            <el-input
              :placeholder="$t('login.placeholder[1]')"
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
              <!-- :background="isDark ? '#181818' : '#eee'" -->
              <DragVerify
                ref="dragVerify"
                v-model:value="isPassing"
                :width="width < 500 ? 328 : 438"
                :text="$t('login.sliderText')"
                textColor="var(--art-gray-800)"
                :successText="$t('login.sliderSuccessText')"
                :progressBarBg="getCssVariable('--el-color-primary')"
                background="var(--art-gray-200)"
                handlerBg="var(--art-main-bg-color)"
                @pass="onPass"
              />
            </div>
            <p class="error-text" :class="{ 'show-error-text': !isPassing && isClickPass }">{{
              $t('login.placeholder[2]')
            }}</p>
          </div>

          <div class="forget-password">
            <el-checkbox v-model="rememberPassword">{{ $t('login.rememberPwd') }}</el-checkbox>
            <router-link class="custom-text" to="/forget-password">{{
              $t('login.forgetPwd')
            }}</router-link>
          </div>

          <div style="margin-top: 30px">
            <el-button
              class="login-btn"
              size="large"
              type="primary"
              @click="login"
              :loading="loading"
            >
              {{ $t('login.btnText') }}
            </el-button>
          </div>

          <div class="footer">
            <p>
              {{ $t('login.noAccount') }}
              <router-link class="custom-text" to="/register">{{
                $t('login.register')
              }}</router-link>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import LeftView from '@/components/Pages/Login/LeftView.vue'
  import { SystemInfo } from '@/config/setting'
  import { ElMessage, ElNotification } from 'element-plus'
  import { useUserStore } from '@/store/modules/user'
  import { HOME_PAGE } from '@/router'
  import { UserService } from '@/api/usersApi'
  import { getCssVariable, getGreeting } from '@/utils/utils'
  import { LanguageEnum, SystemThemeEnum } from '@/enums/appEnum'
  import { useI18n } from 'vue-i18n'
  import { useSettingStore } from '@/store/modules/setting'

  const userStore = useUserStore()
  const router = useRouter()
  const isPassing = ref(false)
  const isClickPass = ref(false)

  const systemName = SystemInfo.name
  const username = ref('admin')
  const password = ref('123123')
  const loading = ref(false)
  const rememberPassword = ref(true)
  const { width } = useWindowSize()

  const store = useSettingStore()
  const isDark = computed(() => store.isDark)

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
        duration: 2500,
        zIndex: 10000,
        message: `欢迎登录 ${systemName}`
      })
    }, 300)
  }

  // 切换语言
  const { locale } = useI18n()

  const changeLanguage = (lang: LanguageEnum) => {
    locale.value = lang
    userStore.setLanguage(lang)
  }

  // 切换主题
  import { useTheme } from '@/composables/useTheme'

  const toggleTheme = () => {
    let { LIGHT, DARK } = SystemThemeEnum
    useTheme().switchTheme(useSettingStore().systemThemeType === LIGHT ? DARK : LIGHT)
  }
</script>

<style lang="scss" scoped>
  @use './index';
</style>
