/*
 * @Description: app actions
 * @Author: ZY
 * @Date: 2020-12-23 10:25:37
 * @LastEditors: ZY
 * @LastEditTime: 2021-01-11 19:11:09
 */
import { ActionTree, ActionContext } from 'vuex'
import { RootState, useStore } from '@/store'
import { state, UserState } from './state'
import { Mutations } from './mutations'
import { UserMutationTypes } from './mutation-types'
import { UserActionTypes } from './action-types'
import { loginRequest, userInfoRequest } from '@/apis/user'
import { removeToken, setToken } from '@/utils/cookies'
import { PermissionActionType } from '../permission/action-types'
import router, { resetRouter } from '@/router'
import { RouteRecordRaw } from 'vue-router'

type AugmentedActionContext = {
  commit<K extends keyof Mutations>(
    key: K,
    payload: Parameters<Mutations[K]>[1],
  ): ReturnType<Mutations[K]>
} & Omit<ActionContext<UserState, RootState>, 'commit'>

export interface Actions {
  [UserActionTypes.ACTION_LOGIN](
    { commit }: AugmentedActionContext,
    userInfo: { username: string, password: string }
  ): void
  [UserActionTypes.ACTION_RESET_TOKEN](
    { commit }: AugmentedActionContext
  ): void
  [UserActionTypes.ACTION_GET_USER_INFO](
    { commit }: AugmentedActionContext
  ): void
  [UserActionTypes.ACTION_CHANGE_ROLES](
    { commit }: AugmentedActionContext, role: string
  ): void
  [UserActionTypes.ACTION_LOGIN_OUT](
    { commit }: AugmentedActionContext,
  ): void
}

export const actions: ActionTree<UserState, RootState> & Actions = {
  async [UserActionTypes.ACTION_LOGIN](
    { commit }: AugmentedActionContext,
    userInfo: { username: string, password: string }
  ) {
    const { username, password } = userInfo
    const loginname = username.trim()
    await loginRequest({ loginname, password }).then(async(res) => {
      if (res?.code === 200 && res.token) {
        console.log(res.token)
        setToken(res.token)
        commit(UserMutationTypes.SET_TOKEN, res.token)
      }
    }).catch((err) => {
      console.log(err)
    })
  },

  [UserActionTypes.ACTION_RESET_TOKEN](
    { commit }: AugmentedActionContext) {
    removeToken()
    commit(UserMutationTypes.SET_TOKEN, '')
    commit(UserMutationTypes.SET_ROLES, [])
  },

  async [UserActionTypes.ACTION_GET_USER_INFO](
    { commit }: AugmentedActionContext
  ) {
    if (state.token === '') {
      throw Error('token is undefined!')
    }
    await userInfoRequest().then((res) => {
      if (res?.code === 200) {
        console.log(res, '322')
        const nowRoles = ['admin']
        commit(UserMutationTypes.SET_ROLES, nowRoles)
        commit(UserMutationTypes.SET_NAME, res.data.name)
        commit(UserMutationTypes.SET_AVATAR, res.data.avatar)
        commit(UserMutationTypes.SET_INTRODUCTION, res.data.introduction)
        commit(UserMutationTypes.SET_BUTTONS, res.data.buttons)
        return res
      } else {
        throw Error('Verification failed, please Login again.')
      }
    })
  },

  async [UserActionTypes.ACTION_CHANGE_ROLES](
    { commit }: AugmentedActionContext,
    role: string
  ) {
    const token = role + '-token'
    const store = useStore()
    commit(UserMutationTypes.SET_TOKEN, token)
    setToken(token)
    await store.dispatch(UserActionTypes.ACTION_GET_USER_INFO, undefined)
    store.dispatch(PermissionActionType.ACTION_SET_ROUTES, state.roles)
    store.state.permission.dynamicRoutes.forEach((item: RouteRecordRaw) => {
      router.addRoute(item)
    })
  },

  [UserActionTypes.ACTION_LOGIN_OUT](
    { commit }: AugmentedActionContext
  ) {
    console.log(commit)
    removeToken()
    commit(UserMutationTypes.SET_TOKEN, '')
    commit(UserMutationTypes.SET_ROLES, [])
    resetRouter()
  }
}
