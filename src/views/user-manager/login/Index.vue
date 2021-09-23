<!--
 * @Description: 登录页面
 * @Author: ZY
 * @Date: 2020-12-28 16:27:50
 * @LastEditors: ZY
 * @LastEditTime: 2021-03-10 13:41:17
-->

<template>
  <div class="login-container">
    <!-- <video
      poster="../../../assets/images/login/video-cover.jpeg"
      loop
      autoplay
      muted
    >
      <source src="../../../assets/images/login/night.mp4">
    </video> -->
    <transition-group
      class="login-bg"
      name="flip-list"
      tag="ul"
    >
      <li
        class="list-item"
        v-for="bg in loginBgs"
        :key="bg"
      >
        <img :src="bg">
      </li>
    </transition-group>
    <el-form
      ref="loginFormRef"
      :model="loginForm"
      :rules="loginRules"
      class="login-form"
      autocomplete="on"
      label-position="left"
    >
      <div class="title-container">
        <h3 class="title">
          {{ t("login.title") }}
        </h3>
        <LangSelect
          :isWhite="true"
          class="set-language"
        />
      </div>

      <el-form-item prop="username">
        <span class="svg-container">
          <i class="el-icon-user" />
        </span>
        <el-input
          ref="userNameRef"
          v-model="loginForm.username"
          :placeholder="t('login.username')"
          name="username"
          type="text"
          tabindex="1"
          autocomplete="on"
        />
      </el-form-item>

      <el-tooltip
        v-model="capsTooltip"
        content="Caps lock is On"
        placement="right"
        manual
      >
        <el-form-item prop="password">
          <span class="svg-container">
            <i class="el-icon-lock" />
          </span>
          <el-input
            :key="passwordType"
            ref="passwordRef"
            v-model="loginForm.password"
            :type="passwordType"
            :placeholder="t('login.password')"
            name="password"
            tabindex="2"
            autocomplete="on"
            @keyup="checkCapslock"
            @blur="capsTooltip = false"
            @keyup.enter="handleLogin"
          />
          <span
            class="show-pwd"
            @click="showPwd"
          >
            <svg-icon
              :name="passwordType === 'password' ? 'eye-off' : 'eye-on'"
            />
          </span>
        </el-form-item>
      </el-tooltip>

      <el-button
        :loading="loading"
        type="primary"
        style="width:100%; margin-bottom:30px;"
        @click.prevent="handleLogin"
      >
        {{ t("login.logIn") }}
      </el-button>

      <div style="position:relative">
        <div class="tips">
          <span>{{ t("login.username") }} : admin </span>
          <span>{{ t("login.password") }} : {{ t("login.any") }} </span>
        </div>
        <div class="tips">
          <span>{{ t("login.username") }} : editor </span>
          <span>{{ t("login.password") }} : {{ t("login.any") }} </span>
        </div>

        <el-button
          class="thirdparty-button"
          type="primary"
          @click="showDialog = true"
        >
          {{ t("login.thirdparty") }}
        </el-button>
      </div>
    </el-form>

    <el-dialog
      :title="t('login.thirdparty')"
      v-model="showDialog"
    >
      {{ t("login.thirdpartyTips") }}
      <br>
      <br>
      <br>
      <SocialSign />
    </el-dialog>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  onMounted,
  reactive,
  watch,
  ref,
  nextTick,
  toRefs,
  Ref
} from 'vue'
import LangSelect from '@/components/lang_select/Index.vue'
import SocialSign from './components/SocialSignin.vue'
import { isValidUsername } from '@/utils/validate'
import { useRoute, LocationQuery, useRouter } from 'vue-router'
import { useStore } from '@/store'
import { UserActionTypes } from '@/store/modules/user/action-types'
import { useI18n } from 'vue-i18n'
export default defineComponent({
  components: {
    LangSelect,
    SocialSign
  },
  setup() {
    const userNameRef = ref(null)
    const passwordRef = ref(null)
    const loginFormRef = ref(null)
    const router = useRouter()
    const route = useRoute()
    const store = useStore()
    const { t } = useI18n()
    const state = reactive({
      loginForm: {
        username: 'admin',
        password: '111111'
      },
      loginRules: {
        username: [{ validator: userNameRef, trigger: 'blur' }],
        password: [{ validator: passwordRef, trigger: 'blur' }]
      },
      passwordType: 'password',
      loading: false,
      showDialog: false,
      capsTooltip: false,
      redirect: '',
      otherQuery: {}
    })
    const swiger = reactive({
      // 轮播数组;
      index: 0
    })
    const loginBgs: Ref<string[]> = ref([])
    const loginBg = ref([
      require('@/assets/theme/bg_01.png'),
      require('@/assets/theme/bg_03.png'),
      require('@/assets/theme/bg_04.png'),
      require('@/assets/theme/bg_05.png'),
      require('@/assets/theme/bg_06.png')
    ])

    const methods = reactive({
      validateUsername: (rule: any, value: string, callback: Function) => {
        if (!isValidUsername(value)) {
          callback(new Error('Please enter the correct user name'))
        } else {
          callback()
        }
      },
      validatePassword: (rule: any, value: string, callback: Function) => {
        if (value.length < 6) {
          callback(new Error('The password can not be less than 6 digits'))
        } else {
          callback()
        }
      },
      checkCapslock: (e: KeyboardEvent) => {
        const { key } = e
        state.capsTooltip =
          key !== null && key.length === 1 && key >= 'A' && key <= 'Z'
      },
      showPwd: () => {
        if (state.passwordType === 'password') {
          state.passwordType = ''
        } else {
          state.passwordType = 'password'
        }
        nextTick(() => {
          (passwordRef.value as any).focus()
        })
      },
      handleLogin: () => {
        (loginFormRef.value as any).validate(async(valid: boolean) => {
          if (valid) {
            state.loading = true
            await store.dispatch(UserActionTypes.ACTION_LOGIN, state.loginForm)
            router
              .push({
                path: state.redirect || '/',
                query: state.otherQuery
              })
              .catch(err => {
                console.warn(err)
              })
            // Just to simulate the time of the request
            setTimeout(() => {
              state.loading = false
            }, 0.5 * 1000)
          } else {
            return false
          }
        })
      }
    })

    function getOtherQuery(query: LocationQuery) {
      return Object.keys(query).reduce((acc, cur) => {
        if (cur !== 'redirect') {
          acc[cur] = query[cur]
        }
        return acc
      }, {} as LocationQuery)
    }

    function startChange() {
      setInterval(() => {
        if (swiger.index < loginBg.value.length - 1) {
          swiger.index++
        } else {
          swiger.index = 0
        }
        loginBgs.value.splice(0, 1, loginBg.value[swiger.index])
        console.log(loginBgs, '273')
      }, 3000)
    }

    watch(() => route.query, query => {
      if (query) {
        state.redirect = query.redirect?.toString() ?? ''
        state.otherQuery = getOtherQuery(query)
      }
    })

    onMounted(() => {
      // 初始化轮播
      console.log(loginBg.value, '2222222')
      loginBgs.value = [loginBg.value[0]]
      console.log(loginBgs, 's')
      startChange()
      if (state.loginForm.username === '') {
        (userNameRef.value as any).focus()
      } else if (state.loginForm.password === '') {
        (passwordRef.value as any).focus()
      }
    })

    return {
      userNameRef,
      passwordRef,
      loginFormRef,
      ...toRefs(state),
      ...toRefs(methods),
      loginBgs,
      t
    }
  }
})
</script>

<style lang="scss">
// References: https://www.zhangxinxu.com/wordpress/2018/01/css-caret-color-first-line/
@supports (-webkit-mask: none) and (not (cater-color: $loginCursorColor)) {
  .login-container .el-input {
    input {
      color: $loginCursorColor;
    }
    input::first-line {
      color: #000;
    }
  }
}

.login-container {
  .el-input {
    display: inline-block;
    height: 47px;
    width: 85%;

    input {
      height: 47px;
      background: transparent;
      border: 0px;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      color: #000;
      caret-color: $loginCursorColor;
      -webkit-appearance: none;

      &:-webkit-autofill {
        box-shadow: 0 0 0px 1000px $loginBg inset !important;
        -webkit-text-fill-color: #fff !important;
      }
    }
  }

  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    color: #454545;
  }
}
</style>

<style lang="scss" scoped>
.login-container {
  height: 100%;
  width: 100%;
  overflow: hidden;
  // background-color: $loginBg;
  video {
    position: absolute;
    /* Vertical and Horizontal center*/
    top: 0; left: 0; right: 0; bottom: 0;
    width:100%;
    height:100%;
    object-fit: cover;
    z-index: -1;
  }
  .login-form {
    position: relative;
    width: 366px;
    right: -25%;
    background-color: hsla(0,0%,100%,.6);
    max-width: 100%;
    padding: 14px 35px 0;
    border-radius: 8px;
    margin: 0 auto;
    margin-top: 160px;
    overflow: hidden;
  }

  .tips {
    font-size: 14px;
    color: #000;
    margin-bottom: 10px;

    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
  }

  .svg-container {
    padding: 6px 5px 6px 15px;
    color: $darkGray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }

  .title-container {
    position: relative;

    .title {
      font-size: 26px;
      color: #000;
      margin: 0px auto 40px auto;
      text-align: center;
      font-weight: bold;
    }

    .set-language {
      color: #000;
      position: absolute;
      top: 3px;
      font-size: 18px;
      right: 0px;
      cursor: pointer;
    }
  }

  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $darkGray;
    cursor: pointer;
    user-select: none;
  }

  .thirdparty-button {
    position: absolute;
    right: 0;
    bottom: 6px;
  }

  @media only screen and (max-width: 470px) {
    .thirdparty-button {
      display: none;
    }
  }

  .flip-list-enter-active, .flip-list-leave-active {
    transition: all 4s;
  }
  .flip-list-enter-to {
      opacity: 0;
  }
  .flip-list-enter-from-active {
    opacity: 1;
  }
}

  // .list-item-leave-active, .list-item-leave-to {
  //   transition: all 3s;
  // }
  // .list-item-enter-form, .list-item-leave-to {
  //     opacity: 0;
  // }
  .login-bg li {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
  .login-bg img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
</style>
