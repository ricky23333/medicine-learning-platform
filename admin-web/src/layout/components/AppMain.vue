<!--
 * @Author: sheng.jiang 87789771@qq.com
 * @Date: 2023-09-11 10:39:20
 * @LastEditors: JiangSheng 87789771@qq.com
 * @LastEditTime: 2024-04-08 14:25:37
 * @FilePath: \耗材前端\src\layout\components\AppMain.vue
 * @Description: 
 * 
-->
<template>
  <section class="app-main">
    <router-view v-slot="{ Component, route }">
      <transition name="fade-transform" mode="out-in">
        <keep-alive :include="tagsViewStore.cachedViews">
          <component v-if="!route.meta.link" :is="Component" :key="route.path"/>
        </keep-alive>
      </transition>
    </router-view>
    <iframe-toggle />
  </section>
</template>

<script setup>
import iframeToggle from "./IframeToggle/index"
import useTagsViewStore from '@/store/modules/tagsView'

const tagsViewStore = useTagsViewStore()
</script>

<style lang="scss" scoped>
.app-main {
  /* 56= navbar  56  */
  min-height: calc(100vh - 56px);
  width: 100%;
  position: relative;
  overflow: hidden;
  background: #f0f4f0;
}

.fixed-header + .app-main {
  padding-top: 56px;
}

.hasTagsView {
  .app-main {
    /* 94 = navbar + tags-view = 56 + 38 */
    min-height: calc(100vh - 94px);
  }

  .fixed-header + .app-main {
    padding-top: 94px;
  }
}
</style>

<style lang="scss">
// fix css style bug in open el-dialog
// .el-popup-parent--hidden {
//   .fixed-header {
//     padding-right: 6px;
//   }
// }

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background-color: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background-color: #c0c0c0;
  border-radius: 3px;
}
</style>

