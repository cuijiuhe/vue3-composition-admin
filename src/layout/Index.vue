<!--
 * @Description: app 布局入口
 * @Author: ZY
 * @Date: 2020-12-17 15:32:33
 * @LastEditors: ZY
 * @LastEditTime: 2021-01-27 17:02:39
-->
<template>
  <div
    :class="classObj"
    class="app-wrapper"
  >
    <header>
      <img
        class="logo"
        src="@/assets/theme/logo.png"
      >
    </header>
    <div
      v-if="classObj.mobile && sidebar.opened"
      class="drawer-bg"
      @click="handleClickOutside"
    />
    <Sidebar class="sidebar-container" />
    <div
      :class="{hasTagsView: showTagsView}"
      class="main-container"
    >
      <div :class="{'fixed-header': fixedHeader}">
        <Navbar />
        <TagsView v-if="showTagsView" />
      </div>
      <AppMain />
      <RightPanel v-if="showSettings">
        <Settings />
      </RightPanel>
    </div>
  </div>
</template>

<script lang="ts">
import { DeviceType } from '@/store/modules/app/state'
import { computed, defineComponent, onBeforeMount, onBeforeUnmount, onMounted, reactive, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from '@/store'
import { AppActionTypes } from '@/store/modules/app/action-types'
import { AppMain, Navbar, Settings, TagsView, Sidebar } from './components'
import RightPanel from '@/components/right_panel/Index.vue'
import resize from './resize'
export default defineComponent({
  name: 'Layout',
  components: {
    AppMain,
    Navbar,
    RightPanel,
    Settings,
    Sidebar,
    TagsView
  },
  setup() {
    const { t } = useI18n()
    const store = useStore()
    const { sidebar, device, addEventListenerOnResize, resizeMounted, removeEventListenerResize, watchRouter } = resize()
    const state = reactive({
      handleClickOutside: () => {
        store.dispatch(AppActionTypes.ACTION_CLOSE_SIDEBAR, false)
      }
    })

    const classObj = computed(() => {
      return {
        hideSidebar: !sidebar.value.opened,
        openSidebar: sidebar.value.opened,
        withoutAnimation: sidebar.value.withoutAnimation,
        mobile: device.value === DeviceType.Mobile
      }
    })

    const showSettings = computed(() => {
      return store.state.settings.showSettings
    })
    const showTagsView = computed(() => {
      return store.state.settings.showTagsView
    })
    const fixedHeader = computed(() => {
      return store.state.settings.fixedHeader
    })

    watchRouter()
    onBeforeMount(() => {
      addEventListenerOnResize()
    })

    onMounted(() => {
      resizeMounted()
    })

    onBeforeUnmount(() => {
      removeEventListenerResize()
    })
    return {
      t,
      classObj,
      sidebar,
      showSettings,
      showTagsView,
      fixedHeader,
      ...toRefs(state)
    }
  }
})
</script>

<style lang="scss" scoped>
.app-wrapper {
  @include clearfix;
  position: relative;
  height: 100%;
  width: 100%;
}
header {
  background: $themeBlue;
  height: 60px;
  padding: 0 20px;
  img {
    margin-top: 10px;
    width: 120px;
    height: 40px;
  }
}

.drawer-bg {
  background: #000;
  opacity: 0.3;
  width: 100%;
  top: 0;
  height: 100%;
  position: absolute;
  z-index: 999;
}

.main-container {
  transition: margin-left .28s;
  margin-left: $sideBarWidth;
  position: relative;
  height: calc(100vh - 60px);
  overflow: hidden;
}

.sidebar-container {
  transition: width 0.28s;
  width: $sideBarWidth !important;
  height: 100%;
  position: fixed;
  font-size: 0px;
  top: 60px;
  bottom: 0;
  left: 0;
  z-index: 1001;
  overflow: hidden;
}

.fixed-header {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 9;
  width: calc(100% - #{$sideBarWidth});
  transition: width 0.28s;
}

.hideSidebar {
  .main-container {
    margin-left: 52px;
  }

  .sidebar-container {
    width: 52px !important;
  }

  .fixed-header {
    width: calc(100% - 52px)
  }
}

/* for mobile response 适配移动端 */
.mobile {
  .main-container {
    margin-left: 0px;
  }

  .sidebar-container {
    transition: transform .28s;
    width: $sideBarWidth !important;
  }

  &.openSidebar {
    position: fixed;
    top: 0;
  }

  &.hideSidebar {
    .sidebar-container {
      pointer-events: none;
      transition-duration: 0.3s;
      transform: translate3d(-$sideBarWidth, 0, 0);
    }
  }

  .fixed-header {
    width: 100%;
  }
}

.withoutAnimation {
  .main-container,
  .sidebar-container {
    transition: none;
  }
}
</style>
