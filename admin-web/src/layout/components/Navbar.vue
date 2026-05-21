<template>
  <div class="navbar">
    <hamburger
      id="hamburger-container"
      :is-active="appStore.sidebar.opened"
      class="hamburger-container"
      @toggleClick="toggleSideBar"
    />
    <breadcrumb
      id="breadcrumb-container"
      class="breadcrumb-container"
      v-if="!settingsStore.topNav"
    />
    <top-nav
      id="topmenu-container"
      class="topmenu-container"
      v-if="settingsStore.topNav"
    />

    <div class="right-menu">
      <template v-if="appStore.device !== 'mobile'">
        <header-search id="header-search" class="right-menu-item" />

        <screenfull id="screenfull" class="right-menu-item hover-effect" />

        <el-tooltip content="布局大小" effect="dark" placement="bottom">
          <size-select id="size-select" class="right-menu-item hover-effect" />
        </el-tooltip>

        <notice id="notice" class="right-menu-item hover-effect" />
      </template>
      <div class="avatar-container">
        <el-dropdown @command="handleCommand" trigger="click">
          <div class="avatar-wrapper">
            <div class="user-avatar-wrapper">
              <div class="user-avatar-inner">
                {{ userStore.nickName?.charAt(0) || "无名氏" }}
              </div>
            </div>
            <span class="user-name">{{ userStore.nickName }}</span>
            <span v-if="isAdmin" class="user-role">超级管理员</span>
            <span v-if="isVIP" class="user-role">VIP教师</span>
            <el-icon class="user-arrow"><caret-bottom /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <router-link to="/user/profile">
                <el-dropdown-item>个人中心</el-dropdown-item>
              </router-link>
              <el-dropdown-item
                command="setLayout"
                v-if="settingsStore.showSettings"
              >
                <span>布局设置</span>
              </el-dropdown-item>
              <!-- <el-dropdown-item v-if="showRequestVIP" @click="handleRequestVIP">
                <span>申请VIP教师</span>
              </el-dropdown-item> -->
              <el-dropdown-item divided command="logout">
                <span>退出登录</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ElMessageBox } from "element-plus";
import Breadcrumb from "@/components/Breadcrumb";
import TopNav from "@/components/TopNav";
import Hamburger from "@/components/Hamburger";
import Screenfull from "@/components/Screenfull";
import SizeSelect from "@/components/SizeSelect";
import HeaderSearch from "@/components/HeaderSearch";
import Notice from "@/components/Notice";
import useAppStore from "@/store/modules/app";
import useUserStore from "@/store/modules/user";
import useSettingsStore from "@/store/modules/settings";
import { ElMessage } from "element-plus";

const appStore = useAppStore();
const userStore = useUserStore();
const isAdmin = computed(() => {
  return userStore.roles?.includes("admin");
});
const isVIP = computed(() => {
  return (
    userStore?.appUser &&
    userStore.appUser.userType === "teacher" &&
    userStore.appUser.vipStatus === "2"
  );
});
const showRequestVIP = computed(() => {
  return (
    userStore?.appUser &&
    userStore.appUser.userType === "teacher" &&
    userStore.appUser.vipStatus === "0"
  );
});
const settingsStore = useSettingsStore();

function toggleSideBar() {
  appStore.toggleSideBar();
}

function handleCommand(command) {
  switch (command) {
    case "setLayout":
      setLayout();
      break;
    case "logout":
      logout();
      break;
    default:
      break;
  }
}

function handleRequestVIP() {
  ElMessageBox.confirm("确定申请VIP教师吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      userStore.requestVIP().then((res) => {
        if (res.code === 200) {
          ElMessage.success(res.message);
        }
      });
    })
    .catch(() => {});
}

function logout() {
  ElMessageBox.confirm("确定注销并退出系统吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      userStore.logOut().then(() => {
        location.reload();
      });
    })
    .catch(() => {});
}

const emits = defineEmits(["setLayout"]);
function setLayout() {
  emits("setLayout");
}
</script>

<style lang="scss" scoped>
.navbar {
  height: 56px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);

  .hamburger-container {
    line-height: 56px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background 0.3s;
    -webkit-tap-highlight-color: transparent;
    padding: 0 16px;

    &:hover {
      background: rgba(0, 0, 0, 0.025);
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .topmenu-container {
    position: absolute;
    left: 50px;
  }

  .errLog-container {
    display: inline-block;
    vertical-align: top;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 56px;
    display: flex;
    align-items: center;
    padding-right: 20px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: flex;
      align-items: center;
      padding: 0 12px;
      height: 40px;
      font-size: 14px;
      color: #5a5e66;
      vertical-align: text-bottom;
      border-radius: 8px;
      margin: 0 4px;

      &.hover-effect {
        cursor: pointer;
        transition: background 0.3s;

        &:hover {
          background: #f5f5f5;
        }
      }
    }

    .avatar-container {
      margin-right: 0;
      display: flex;

      .avatar-wrapper {
        position: relative;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 6px 14px;
        background: #f4f4f5;
        border-radius: 10px;
        cursor: pointer;
        transition: background 0.2s;

        &:hover {
          background: #e8e8e8;
        }

        .user-avatar-wrapper {
          display: flex;
          align-items: center;
        }

        .user-avatar-inner {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          background: #2d6a4f;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 500;
        }

        .user-name {
          font-size: 13px;
          color: #333;
          max-width: 80px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .user-role {
          font-size: 11px;
          padding: 2px 6px;
          border-radius: 4px;
          background: #fef3c7;
          color: #92400e;
        }

        .user-arrow {
          font-size: 12px;
          color: #888;
        }
      }
    }
  }
}
</style>
