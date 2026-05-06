<template>
  <div class="login-container">
    <!-- Left decorative panel -->
    <div class="left-panel">
      <div class="deco-circle deco-circle-1" />
      <div class="deco-circle deco-circle-2" />

      <div class="left-content">
        <div class="logo-wrapper">
          <div class="logo">
            <img class="logo-icon" src="@/assets/logo/logo.png" />
            <!-- <span class="logo-icon">🌿</span> -->
          </div>
        </div>
        <h1 class="title">TCM数字标本学习助手</h1>
        <p class="subtitle">
          数字化中药标本资源管理平台<br />
          服务高校中医药学科教学与科研
        </p>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-num">2个</div>
            <div class="stat-label">标本目录</div>
          </div>
          <div class="stat-item">
            <div class="stat-num">18+</div>
            <div class="stat-label">标本种类</div>
          </div>
          <div class="stat-item">
            <div class="stat-num">342</div>
            <div class="stat-label">注册用户</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right panel -->
    <div class="right-panel">
      <div class="login-box">
        <!-- Mobile header -->
        <div class="mobile-header">
          <div class="mobile-logo">
            <span class="logo-icon">🌿</span>
          </div>
          <div>
            <h1 class="mobile-title">TCM数字标本学习助手</h1>
            <p class="mobile-subtitle">管理端登录</p>
          </div>
        </div>

        <!-- Desktop header -->
        <div class="desktop-header">
          <h2 class="form-title">欢迎登录</h2>
          <p class="form-subtitle">管理端 · 超级管理员 & VIP教师</p>
        </div>

        <!-- Tab -->
        <div class="tab-wrapper">
          <div class="tab">
            <div
              class="tab-item"
              :class="{ active: mode === 'login' }"
              @click="mode = 'login'"
            >
              账号登录
            </div>
            <div
              class="tab-item"
              :class="{ active: mode === 'register' }"
              @click="
                mode = 'register';
                getCode();
              "
            >
              注册账号
            </div>
          </div>
        </div>

        <!-- Login form -->
        <el-form
          v-if="mode === 'login'"
          ref="loginRef"
          :model="loginForm"
          :rules="loginRules"
          class="login-form"
          @keyup.enter="handleLogin"
        >
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              size="large"
              placeholder="请输入账号"
              prefix-icon="User"
            />
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              size="large"
              placeholder="请输入密码"
              prefix-icon="Lock"
              show-password
            />
          </el-form-item>
          <el-form-item prop="code" v-if="captchaEnabled">
            <el-input
              v-model="loginForm.code"
              size="large"
              placeholder="请输入验证码"
              style="width: 63%"
              @keyup.enter="handleLogin"
            >
              <template #prefix>
                <el-icon><Lock /></el-icon>
              </template>
            </el-input>
            <div class="captcha-code" v-html="codeUrl" @click="getCode" />
          </el-form-item>

          <div class="remember-row">
            <el-checkbox v-model="loginForm.rememberMe">记住密码</el-checkbox>
          </div>

          <el-form-item>
            <el-button
              :loading="loading"
              type="primary"
              size="large"
              class="login-btn"
              @click.prevent="handleLogin"
            >
              <span v-if="!loading">登 录</span>
              <span v-else>登 录 中...</span>
            </el-button>
          </el-form-item>
        </el-form>

        <!-- Register form -->
        <el-form
          v-else
          ref="registerRef"
          :model="registerForm"
          :rules="registerRules"
          class="login-form"
          @keyup.enter="handleRegister"
        >
          <el-form-item prop="username">
            <el-input
              v-model="registerForm.username"
              type="text"
              size="large"
              placeholder="请输入账号"
              prefix-icon="User"
            />
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="registerForm.password"
              type="password"
              size="large"
              placeholder="请输入密码"
              prefix-icon="Lock"
              show-password
            />
          </el-form-item>
          <el-form-item prop="confirmPassword">
            <el-input
              v-model="registerForm.confirmPassword"
              type="password"
              size="large"
              placeholder="请再次输入密码"
              prefix-icon="Lock"
              show-password
            />
          </el-form-item>
          <el-form-item prop="code" v-if="captchaEnabled">
            <el-input
              v-model="registerForm.code"
              size="large"
              placeholder="请输入验证码"
              style="width: 63%"
              @keyup.enter="handleRegister"
            >
              <template #prefix>
                <el-icon><Lock /></el-icon>
              </template>
            </el-input>
            <div class="captcha-code" v-html="codeUrl" @click="getCode" />
          </el-form-item>

          <el-form-item>
            <el-button
              :loading="loading"
              type="primary"
              size="large"
              class="login-btn"
              @click.prevent="handleRegister"
            >
              <span v-if="!loading">注 册</span>
              <span v-else>注 册 中...</span>
            </el-button>
          </el-form-item>

          <div class="to-login-row">
            <span>已有账户？</span>
            <span class="link-type" @click="mode = 'login'">立即登录</span>
          </div>
        </el-form>

        <!-- Error message -->
        <div v-if="errorMsg" class="error-tip">
          <el-icon><CircleCloseFilled /></el-icon>
          <span>{{ errorMsg }}</span>
        </div>

        <!-- Footer -->
        <div class="login-footer">
          <p>
            移动端（微信小程序）供学生和教师使用<br />
            如需注册账号，请联系所在院校管理员
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getCodeImg, login, register } from "@/api/login";
import Cookies from "js-cookie";
import { decrypt } from "@/utils/jsencrypt";
import { ElMessage, ElMessageBox } from "element-plus";
import { Lock, User, CircleCloseFilled } from "@element-plus/icons-vue";
import useUserStore from "@/store/modules/user";

const userStore = useUserStore();
const route = useRoute();
const router = useRouter();
const { proxy } = getCurrentInstance();

const mode = ref<"login" | "register">("login");
const loginRef = ref();
const registerRef = ref();

// Login form
const loginForm = ref({
  username: "",
  password: "",
  rememberMe: false,
  code: "",
  uuid: "",
});
const loginRules = {
  username: [{ required: true, trigger: "blur", message: "请输入您的账号" }],
  password: [{ required: true, trigger: "blur", message: "请输入您的密码" }],
  code: [{ required: true, trigger: "change", message: "请输入验证码" }],
};

// Register form
const registerForm = ref({
  username: "",
  password: "",
  confirmPassword: "",
  code: "",
  uuid: "",
});
const equalToPassword = (_rule: any, value: string, callback: any) => {
  if (registerForm.value.password !== value) {
    callback(new Error("两次输入的密码不一致"));
  } else {
    callback();
  }
};
const registerRules = {
  username: [
    { required: true, trigger: "blur", message: "请输入您的账号" },
    {
      min: 2,
      max: 20,
      message: "用户账号长度必须介于 2 和 20 之间",
      trigger: "blur",
    },
  ],
  password: [
    { required: true, trigger: "blur", message: "请输入您的密码" },
    {
      min: 5,
      max: 20,
      message: "用户密码长度必须介于 5 和 20 之间",
      trigger: "blur",
    },
  ],
  confirmPassword: [
    { required: true, trigger: "blur", message: "请再次输入您的密码" },
    { required: true, validator: equalToPassword, trigger: "blur" },
  ],
  code: [{ required: true, trigger: "change", message: "请输入验证码" }],
};

// Shared state
const codeUrl = ref("");
const loading = ref(false);
const captchaEnabled = ref(true);
const errorMsg = ref("");

function getCode() {
  getCodeImg().then((res) => {
    captchaEnabled.value =
      res.captchaEnabled === undefined ? true : res.captchaEnabled;
    if (captchaEnabled.value) {
      codeUrl.value = res.img;
      loginForm.value.uuid = res.uuid;
      registerForm.value.uuid = res.uuid;
    }
  });
}

function getCookie() {
  const username = Cookies.get("username");
  const password = Cookies.get("password");
  const rememberMe = Cookies.get("rememberMe");
  loginForm.value = {
    username: username === undefined ? loginForm.value.username : username,
    password:
      password === undefined ? loginForm.value.password : decrypt(password),
    rememberMe: rememberMe === undefined ? false : Boolean(rememberMe),
    code: "",
    uuid: "",
  };
}

async function handleLogin() {
  errorMsg.value = "";
  // @ts-ignore
  loginRef.value.validate(async (valid: boolean) => {
    if (valid) {
      loading.value = true;
      if (loginForm.value.rememberMe) {
        Cookies.set("username", loginForm.value.username, { expires: 30 });
        Cookies.set("password", loginForm.value.password, { expires: 30 });
        Cookies.set("rememberMe", loginForm.value.rememberMe, { expires: 30 });
      } else {
        Cookies.remove("username");
        Cookies.remove("password");
        Cookies.remove("rememberMe");
      }
      // 调用action的登录方法
      userStore
        .login(loginForm.value)
        .then(() => {
          const query = route.query;
          const otherQueryParams = Object.keys(query).reduce((acc, cur) => {
            if (cur !== "redirect") {
              acc[cur] = query[cur];
            }
            return acc;
          }, {});
          router.push({ path: redirect.value || "/", query: otherQueryParams });
        })
        .catch(() => {
          loading.value = false;
          // 重新获取验证码
          if (captchaEnabled.value) {
            getCode();
          }
        });
    }
  });
}

async function handleRegister() {
  errorMsg.value = "";
  // @ts-ignore
  registerRef.value.validate(async (valid: boolean) => {
    if (valid) {
      loading.value = true;
      try {
        await register(registerForm.value);
        ElMessageBox.alert(
          `<font color='red'>恭喜你，您的账号 ${registerForm.value.username} 注册成功！</font>`,
          "系统提示",
          { dangerouslyUseHTMLString: true, type: "success" },
        )
          .then(() => {
            mode.value = "login";
            getCode();
          })
          .catch(() => {});
      } catch (error: any) {
        errorMsg.value = error?.message || "注册失败";
        if (captchaEnabled.value) {
          getCode();
        }
      } finally {
        loading.value = false;
      }
    }
  });
}

const redirect = ref(undefined);

onMounted(() => {
  getCode();
  getCookie();
});
</script>

<style lang="scss" scoped>
.login-container {
  display: flex;
  min-height: 100vh;
}

.left-panel {
  display: none;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #0d2818 0%, #1b3a2d 40%, #2d6a4f 100%);

  @media (min-width: 1024px) {
    display: flex;
  }

  .deco-circle {
    position: absolute;
    border-radius: 50%;
    opacity: 0.1;
    background: radial-gradient(circle, #95d5b2, transparent);
  }

  .deco-circle-1 {
    width: 256px;
    height: 256px;
    top: 80px;
    left: 80px;
  }

  .deco-circle-2 {
    width: 192px;
    height: 192px;
    bottom: 80px;
    right: 80px;
  }

  .left-content {
    position: relative;
    z-index: 10;
    text-align: center;
    max-width: 432px;
  }

  .logo-wrapper {
    display: flex;
    justify-content: center;
    margin-bottom: 32px;
  }

  .logo {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(206, 255, 231, 0.799);
    // border: 2px solid rgba(82, 183, 136, 0.4);

    .logo-icon {
      width: 118%;
      height: 118%;
    }
  }

  .title {
    font-size: 28px;
    font-weight: 600;
    letter-spacing: 4px;
    color: #fff;
    margin-bottom: 16px;
  }

  .subtitle {
    font-size: 15px;
    line-height: 1.8;
    color: #86efac;
    margin-bottom: 32px;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }

  .stat-item {
    padding: 16px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);

    .stat-num {
      font-size: 20px;
      font-weight: 600;
      color: #86efac;
      margin-bottom: 4px;
    }

    .stat-label {
      font-size: 12px;
      color: #52b788;
    }
  }
}

.right-panel {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
  background: rgba(255, 255, 255, 0.97);

  @media (min-width: 1024px) {
    width: 480px;
  }
}

.login-box {
  width: 100%;
  max-width: 400px;
}

.mobile-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 32px;

  @media (min-width: 1024px) {
    display: none;
  }

  .mobile-logo {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #e8f5e9;

    .logo-icon {
      font-size: 24px;
    }
  }

  .mobile-title {
    font-size: 18px;
    font-weight: 600;
    color: #1b3a2d;
    margin: 0;
  }

  .mobile-subtitle {
    font-size: 12px;
    color: #52b788;
    margin: 0;
  }
}

.desktop-header {
  display: none;
  margin-bottom: 32px;

  @media (min-width: 1024px) {
    display: block;
  }

  .form-title {
    font-size: 22px;
    font-weight: 600;
    color: #1b3a2d;
    margin: 0 0 6px 0;
  }

  .form-subtitle {
    font-size: 14px;
    color: #717182;
    margin: 0;
  }
}

.tab-wrapper {
  margin-bottom: 24px;
}

.tab {
  display: flex;
  gap: 4px;
  padding: 4px;
  border-radius: 12px;
  background: #f4f4f5;
}

.tab-item {
  flex: 1;
  padding: 8px 0;
  text-align: center;
  font-size: 14px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  color: #717182;

  &.active {
    font-weight: 600;
    background: #fff;
    color: #1b3a2d;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);
  }
}

.login-form {
  :deep(.el-form-item) {
    margin-bottom: 16px;
  }

  :deep(.el-input) {
    .el-input__wrapper {
      padding: 4px 11px;
      border-radius: 12px;
      background: #f8f9fa;
      box-shadow: none;
      border: 1.5px solid #e0e0e0;

      &:focus-within {
        border-color: #2d6a4f;
      }
    }
  }

  .captcha-code {
    width: 33%;
    height: 40px;
    margin-left: 12px;
    cursor: pointer;
    vertical-align: middle;

    :deep(svg),
    :deep(img) {
      width: 100%;
      height: 100%;
    }
  }
}

.remember-row {
  margin-bottom: 20px;
}

.login-btn {
  width: 100%;
  height: 44px;
  font-size: 15px;
  background: linear-gradient(135deg, #1b3a2d, #2d6a4f) !important;
  border: none !important;

  &:hover {
    opacity: 0.9;
  }
}

.to-login-row {
  text-align: center;
  font-size: 13px;
  color: #888;

  .link-type {
    color: #2d6a4f;
    cursor: pointer;
    margin-left: 4px;

    &:hover {
      text-decoration: underline;
    }
  }
}

.error-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  padding: 12px;
  border-radius: 12px;
  background: #fff0f0;
  border: 1px solid #ffc0c0;
  font-size: 13px;
  color: #d4183d;

  .el-icon {
    flex-shrink: 0;
  }
}

.login-footer {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #eee;

  p {
    font-size: 12px;
    color: #aaa;
    text-align: center;
    line-height: 1.6;
    margin: 0;
  }
}
</style>
