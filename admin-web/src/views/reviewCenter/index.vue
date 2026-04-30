<!--
 * @Author: rickyluo
 * @Date: 2024-04-28
 * @Description: 审核中心
-->
<template>
  <div class="app-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">审核中心</h1>
        <p class="page-desc">共 {{ pendingCount }} 项待处理</p>
      </div>
    </div>

    <!-- 标签页切换 -->
    <div class="tab-bar">
      <div
        v-for="tab in tabs"
        :key="tab.key"
        :class="['tab-item', { active: activeTab === tab.key }]"
        @click="handleTabChange(tab.key)"
      >
        <el-icon><component :is="tab.icon" /></el-icon>
        <span>{{ tab.label }}</span>
        <span v-if="tab.count > 0" class="tab-badge">{{ tab.count }}</span>
      </div>
    </div>

    <!-- 注册申请列表 -->
    <div v-if="activeTab === 'registration'" class="card-list">
      <div v-if="registerLoading" class="loading-state">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>加载中...</span>
      </div>
      <div v-else-if="registerList.length === 0" class="empty-state">
        <el-icon :size="48"><SuccessFilled /></el-icon>
        <p>暂无注册申请</p>
      </div>
      <div v-else>
        <div
          v-for="item in registerList"
          :key="item.userId"
          class="review-card"
        >
          <div class="card-main">
            <div class="avatar" :style="{ background: item.userType === 'teacher' ? '#2d6a4f' : '#52b788' }">
              {{ item.realName?.charAt(0) || 'U' }}
            </div>
            <div class="card-info">
              <div class="info-header">
                <span class="name">{{ item.realName }}</span>
                <el-tag :type="item.userType === 'teacher' ? '' : 'success'" size="small">
                  {{ item.userType === 'teacher' ? '教师' : '学生' }}
                </el-tag>
                <el-tag :type="getStatusType(item.regStatus)" size="small">
                  {{ getStatusText(item.regStatus) }}
                </el-tag>
              </div>
              <div class="info-grid">
                <div class="info-item">📱 {{ item.phone }}</div>
                <div class="info-item">🏫 {{ item.institution || '-' }}</div>
                <div v-if="item.majorGrade" class="info-item">📚 {{ item.majorGrade }}</div>
                <div v-if="item.studentNo" class="info-item">🎓 {{ item.studentNo }}</div>
                <div v-if="item.contact" class="info-item">📬 {{ item.contact }}</div>
                <div class="info-item time">申请时间：{{ formatDate(item.regApplyTime) }}</div>
              </div>
            </div>
          </div>
          <div v-if="item.regStatus === '0'" class="card-actions">
            <el-button type="success" @click="handleApproveRegister(item.userId)">
              <el-icon><Check /></el-icon>
              通过
            </el-button>
            <el-button type="danger" plain @click="handleRejectRegister(item.userId)">
              <el-icon><Close /></el-icon>
              拒绝
            </el-button>
          </div>
        </div>
        <el-pagination
          v-if="registerTotal > 0"
          class="pagination"
          background
          layout="prev, pager, next"
          :total="registerTotal"
          :page-size="queryParams.pageSize"
          :current-page="queryParams.pageNum"
          @current-change="handleRegisterPageChange"
        />
      </div>
    </div>

    <!-- VIP申请列表 -->
    <div v-if="activeTab === 'vip'" class="card-list">
      <div v-if="vipLoading" class="loading-state">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>加载中...</span>
      </div>
      <div v-else-if="vipList.length === 0" class="empty-state">
        <el-icon :size="48"><SuccessFilled /></el-icon>
        <p>暂无VIP申请</p>
      </div>
      <div v-else>
        <div
          v-for="item in vipList"
          :key="item.userId"
          class="review-card"
        >
          <div class="card-main">
            <div class="avatar vip-avatar">
              <el-icon :size="24"><GoldMedal /></el-icon>
            </div>
            <div class="card-info">
              <div class="info-header">
                <span class="name">{{ item.realName }}</span>
                <span class="phone">{{ item.phone }}</span>
                <el-tag :type="getStatusType(item.vipStatus)" size="small">
                  {{ getVipStatusText(item.vipStatus) }}
                </el-tag>
              </div>
              <div class="info-row">🏫 {{ item.institution }}</div>
              <div class="info-row time">申请时间：{{ formatDate(item.vipApplyTime) }}</div>
            </div>
          </div>
          <div v-if="item.vipStatus === '1'" class="card-actions">
            <el-button type="success" @click="handleApproveVip(item.userId)">
              <el-icon><Check /></el-icon>
              通过
            </el-button>
            <el-button type="danger" plain @click="handleRejectVip(item.userId)">
              <el-icon><Close /></el-icon>
              拒绝
            </el-button>
          </div>
        </div>
        <el-pagination
          v-if="vipTotal > 0"
          class="pagination"
          background
          layout="prev, pager, next"
          :total="vipTotal"
          :page-size="queryParams.pageSize"
          :current-page="queryParams.pageNum"
          @current-change="handleVipPageChange"
        />
      </div>
    </div>

    <!-- 图片审核列表 -->
    <div v-if="activeTab === 'images'" class="card-list">
      <div v-if="imageLoading" class="loading-state">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>加载中...</span>
      </div>
      <div v-else-if="pendingImages.length === 0" class="empty-state">
        <el-icon :size="48"><SuccessFilled /></el-icon>
        <p>暂无待审核图片</p>
      </div>
      <div v-else>
        <div
          v-for="img in pendingImages"
          :key="img.imageId"
          class="review-card image-card"
        >
          <div class="image-thumb">
            <el-image
              :src="img.imageUrl"
              fit="cover"
              :preview-src-list="[img.imageUrl]"
            />
          </div>
          <div class="card-info">
            <div class="info-header">
              <span class="name">{{ img.specimen?.specimenName || '未知标本' }}</span>
              <el-tag type="warning" size="small">待审核</el-tag>
            </div>
            <div class="info-grid">
              <div class="info-item">👤 上传者：{{ img.createByName || img.createBy || '-' }}</div>
              <div class="info-item">📅 上传时间：{{ formatDate(img.createTime) }}</div>
            </div>
          </div>
          <div class="card-actions">
            <el-button type="success" @click="handleApproveImage(img.imageId)">
              <el-icon><Check /></el-icon>
              通过
            </el-button>
            <el-button type="danger" plain @click="handleRejectImage(img.imageId)">
              <el-icon><Close /></el-icon>
              拒绝
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, markRaw } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Check, Close, Loading, SuccessFilled, GoldMedal, User, Picture } from '@element-plus/icons-vue'
import {
  listRegisterAudit,
  approveRegister,
  rejectRegister,
  listVipAudit,
  approveVip,
  rejectVip
} from '@/api/reviewCenter'
import { listSpecimen, auditSpecimenImage } from '@/api/specimen'

// 类型定义
interface RegisterItem {
  userId: number
  realName: string
  phone: string
  userType: string
  institution?: string
  majorGrade?: string
  studentNo?: string
  contact?: string
  regStatus: string
  regApplyTime: string
}

interface VipItem {
  userId: number
  realName: string
  phone: string
  userType: string
  institution?: string
  vipStatus: string
  vipApplyTime: string
}

interface ImageItem {
  imageId: number
  imageUrl: string
  createBy: string
  createByName?: string
  createTime: string
  auditStatus: string
  specimen?: {
    specimenId: number
    specimenName: string
  }
}

type TabKey = 'registration' | 'vip' | 'images'

// 响应式数据
const activeTab = ref<TabKey>('registration')
const registerList = ref<RegisterItem[]>([])
const vipList = ref<VipItem[]>([])
const pendingImages = ref<ImageItem[]>([])
const registerTotal = ref(0)
const vipTotal = ref(0)
const registerLoading = ref(false)
const vipLoading = ref(false)
const imageLoading = ref(false)

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10
})

// 标签页配置
const tabs = computed(() => [
  { key: 'registration' as TabKey, label: '注册申请', icon: markRaw(User), count: registerList.value.filter(r => r.regStatus === '0').length },
  { key: 'vip' as TabKey, label: 'VIP申请', icon: markRaw(GoldMedal), count: vipList.value.filter(v => v.vipStatus === '1').length },
  { key: 'images' as TabKey, label: '图片审核', icon: markRaw(Picture), count: pendingImages.value.length }
])

// 待审核总数
const pendingCount = computed(() => {
  return (
    registerList.value.filter(r => r.regStatus === '0').length +
    vipList.value.filter(v => v.vipStatus === '1').length +
    pendingImages.value.length
  )
})

// 获取状态类型
function getStatusType(status: string): '' | 'success' | 'warning' | 'danger' | 'info' {
  const map: Record<string, '' | 'success' | 'warning' | 'danger' | 'info'> = {
    '0': 'warning',
    '1': 'success',
    '2': 'danger'
  }
  return map[status] || 'info'
}

// 获取状态文本
function getStatusText(status: string): string {
  const map: Record<string, string> = {
    '0': '待审核',
    '1': '已通过',
    '2': '已拒绝'
  }
  return map[status] || status
}

// 获取VIP状态文本
function getVipStatusText(status: string): string {
  const map: Record<string, string> = {
    '0': '非VIP',
    '1': '待审核',
    '2': 'VIP',
    '3': '已拒绝'
  }
  return map[status] || status
}

// 格式化日期
function formatDate(dateStr: string): string {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN')
}

// 加载注册申请列表
async function loadRegisterList() {
  registerLoading.value = true
  try {
    const res: any = await listRegisterAudit({ ...queryParams, regStatus: undefined })
    if (res.code === 200) {
      registerList.value = res.rows || []
      registerTotal.value = res.total || 0
    }
  } catch (error) {
    console.error('加载注册申请列表失败', error)
  } finally {
    registerLoading.value = false
  }
}

// 加载VIP申请列表
async function loadVipList() {
  vipLoading.value = true
  try {
    const res: any = await listVipAudit({ ...queryParams, vipStatus: undefined })
    if (res.code === 200) {
      vipList.value = res.rows || []
      vipTotal.value = res.total || 0
    }
  } catch (error) {
    console.error('加载VIP申请列表失败', error)
  } finally {
    vipLoading.value = false
  }
}

// 加载待审核图片
async function loadPendingImages() {
  imageLoading.value = true
  try {
    const res: any = await listSpecimen({ pageNum: 1, pageSize: 100, status: '1' })
    if (res.code === 200) {
      // 从标本列表中提取待审核的图片
      const images: ImageItem[] = []
      for (const specimen of res.rows || []) {
        if (specimen.images) {
          for (const img of specimen.images) {
            images.push({
              ...img,
              specimen: {
                specimenId: specimen.specimenId,
                specimenName: specimen.specimenName
              }
            })
          }
        }
      }
      pendingImages.value = images
    }
  } catch (error) {
    console.error('加载待审核图片失败', error)
  } finally {
    imageLoading.value = false
  }
}

// 标签页切换
function handleTabChange(key: TabKey) {
  activeTab.value = key
  queryParams.pageNum = 1
  if (key === 'registration') {
    loadRegisterList()
  } else if (key === 'vip') {
    loadVipList()
  } else if (key === 'images') {
    loadPendingImages()
  }
}

// 注册分页
function handleRegisterPageChange(page: number) {
  queryParams.pageNum = page
  loadRegisterList()
}

// VIP分页
function handleVipPageChange(page: number) {
  queryParams.pageNum = page
  loadVipList()
}

// 通过注册
async function handleApproveRegister(userId: number) {
  try {
    await ElMessageBox.confirm('确认通过该注册申请？', '确认操作', { type: 'success' })
    const res: any = await approveRegister(userId)
    if (res.code === 200) {
      ElMessage.success('审核通过')
      loadRegisterList()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error?.message || '操作失败')
    }
  }
}

// 拒绝注册
async function handleRejectRegister(userId: number) {
  try {
    await ElMessageBox.confirm('确认拒绝该注册申请？', '确认操作', { type: 'warning' })
    const res: any = await rejectRegister(userId)
    if (res.code === 200) {
      ElMessage.success('已拒绝')
      loadRegisterList()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error?.message || '操作失败')
    }
  }
}

// 通过VIP申请
async function handleApproveVip(userId: number) {
  try {
    await ElMessageBox.confirm('确认通过该VIP申请？', '确认操作', { type: 'success' })
    const res: any = await approveVip(userId)
    if (res.code === 200) {
      ElMessage.success('VIP审核通过')
      loadVipList()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error?.message || '操作失败')
    }
  }
}

// 拒绝VIP申请
async function handleRejectVip(userId: number) {
  try {
    await ElMessageBox.confirm('确认拒绝该VIP申请？', '确认操作', { type: 'warning' })
    const res: any = await rejectVip(userId)
    if (res.code === 200) {
      ElMessage.success('已拒绝VIP申请')
      loadVipList()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error?.message || '操作失败')
    }
  }
}

// 通过图片
async function handleApproveImage(imageId: number) {
  try {
    await ElMessageBox.confirm('确认通过该图片？', '确认操作', { type: 'success' })
    const res: any = await auditSpecimenImage({ imageId, auditStatus: '0' })
    if (res.code === 200) {
      ElMessage.success('图片已通过')
      loadPendingImages()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error?.message || '操作失败')
    }
  }
}

// 拒绝图片
async function handleRejectImage(imageId: number) {
  try {
    await ElMessageBox.confirm('确认拒绝该图片？', '确认操作', { type: 'warning' })
    const res: any = await auditSpecimenImage({ imageId, auditStatus: '2' })
    if (res.code === 200) {
      ElMessage.success('图片已拒绝')
      loadPendingImages()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error?.message || '操作失败')
    }
  }
}

// 生命周期
onMounted(() => {
  loadRegisterList()
})
</script>

<style scoped>
/* 页面头部 */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.page-title {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  color: #1f2937;
}

.page-desc {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
}

/* 标签栏 */
.tab-bar {
  display: flex;
  gap: 8px;
  padding: 8px;
  background: #fff;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.08);
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #888;
  transition: all 0.2s;
}

.tab-item:hover {
  background: #f5f5f5;
}

.tab-item.active {
  background: #2d6a4f;
  color: #fff;
}

.tab-badge {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  min-width: 20px;
  text-align: center;
  background: #ef4444;
  color: #fff;
}

.tab-item.active .tab-badge {
  background: rgba(255, 255, 255, 0.3);
}

/* 卡片列表 */
.card-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 加载/空状态 */
.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  background: #fff;
  border-radius: 16px;
  color: #aaa;
  gap: 12px;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}

/* 审核卡片 */
.review-card {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 16px 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.08);
}

.card-main {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  flex: 1;
}

.avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  flex-shrink: 0;
}

.vip-avatar {
  background: #fef3c7;
  color: #d4a843;
}

.card-info {
  flex: 1;
  min-width: 0;
}

.info-header {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.name {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
}

.phone {
  font-size: 13px;
  color: #666;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, auto);
  gap: 4px 24px;
}

.info-row {
  font-size: 13px;
  color: #666;
  margin-bottom: 4px;
}

.info-item {
  font-size: 13px;
  color: #666;
}

.info-item.time {
  color: #aaa;
  font-size: 12px;
  grid-column: span 2;
}

.card-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
  margin-left: 16px;
}

/* 图片审核卡片 */
.image-card {
  align-items: center;
}

.image-thumb {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  background: #f8f9fa;
}

.image-thumb :deep(.el-image) {
  width: 100%;
  height: 100%;
}

/* 分页 */
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>