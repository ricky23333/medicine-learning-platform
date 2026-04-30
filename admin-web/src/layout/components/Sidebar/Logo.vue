<template>
  <div
    class="sidebar-logo-container"
    :class="{ collapse: collapse }"
    :style="{
      backgroundColor:
        sideTheme === 'theme-dark'
          ? variables.menuBackground
          : variables.menuLightBackground,
    }"
  >
    <transition name="sidebarLogoFade">
      <router-link
        v-if="collapse"
        key="collapse"
        class="sidebar-logo-link"
        to="/"
      >
        <img v-if="logo" :src="logo" class="sidebar-logo" />
        <h1
          v-else
          class="sidebar-title"
          :style="{
            color:
              sideTheme === 'theme-dark'
                ? variables.logoTitleColor
                : variables.logoLightTitleColor,
          }"
        >
          {{ title }}
        </h1>
      </router-link>
      <router-link v-else key="expand" class="sidebar-logo-link" to="/">
        <img v-if="logo" :src="logo" class="sidebar-logo" />
        <h1
          class="sidebar-title"
          :style="{
            color:
              sideTheme === 'theme-dark'
                ? variables.logoTitleColor
                : variables.logoLightTitleColor,
          }"
        >
          {{ title }}
        </h1>
      </router-link>
    </transition>
  </div>
</template>

<script setup>
import variables from "@/assets/styles/variables.module.scss";
import logo from "@/assets/logo/logo.png";
import useSettingsStore from "@/store/modules/settings";

defineProps({
  collapse: {
    type: Boolean,
    required: true,
  },
});

const title = import.meta.env.VITE_APP_TITLE;
const settingsStore = useSettingsStore();
const sideTheme = computed(() => settingsStore.sideTheme);
</script>

<style lang="scss" scoped>
.sidebarLogoFade-enter-active {
  transition: opacity 1.5s;
}

.sidebarLogoFade-enter,
.sidebarLogoFade-leave-to {
  opacity: 0;
}

.sidebar-logo-container {
  position: relative;
  width: 100%;
  height: 100px;
  line-height: 64px;
  margin-top: 10px;
  background: linear-gradient(
    180deg,
    rgba(13, 40, 24, 0.8) 0%,
    rgba(27, 58, 45, 0.8) 100%
  );
  text-align: center;
  overflow: hidden;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);

  & .sidebar-logo-link {
    height: 100%;
    width: 100%;
    display: flex;
    align-items: flex-start;
    flex-direction: column;
    align-content: flex-start;
    justify-content: flex-start;
    flex-wrap: wrap;
    gap: 4px;

    & .sidebar-logo {
      width: 64px;
      height: 64px;
      vertical-align: middle;
    }

    & .sidebar-title {
      width: 100%;
      display: flex;
      justify-content: center;
      margin-top: 10px;
      color: #fff;
      font-weight: 600;
      line-height: 1.2;
      font-size: 13px;
      font-family:
        Avenir,
        Helvetica Neue,
        Arial,
        Helvetica,
        sans-serif;
      vertical-align: middle;
    }
  }

  &.collapse {
    .sidebar-logo {
      margin-right: 0px;
    }
  }
}
</style>
