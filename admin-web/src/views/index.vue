<!--
 * @Author: rickyluo
 * @Date: 2024-04-28
 * @Description: 首页/系统概况
-->
<template>
  <div class="index-container">
    <!-- 页面标题 -->
    <div class="index-header">
      <h1 class="text-gray-800">系统概况</h1>
      <p class="text-gray-500 mt-1">欢迎回来，查看系统实时数据</p>
    </div>

    <!-- 指标卡片 -->
    <div class="stat-grid">
      <div v-for="card in statCards" :key="card.label" class="stat-card">
        <div class="stat-card-header">
          <div class="stat-icon" :style="{ background: card.bg }">
            <el-icon :size="20" :style="{ color: card.color }">
              <component :is="card.icon" />
            </el-icon>
          </div>
          <span class="stat-trend">
            <el-icon :size="12"><Top /></el-icon>
            {{ card.trend }}
          </span>
        </div>
        <div class="stat-value">{{ card.value }}</div>
        <div class="stat-label">{{ card.label }}</div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="charts-grid">
      <!-- 访问趋势图 -->
      <div class="chart-card chart-card-wide">
        <h3 class="chart-title">近{{ visitDays }}天访问趋势</h3>
        <div class="chart-period-btns">
          <span
            v-for="p in [7, 14, 30]"
            :key="p"
            :class="['period-btn', { active: visitDays === p }]"
            @click="changeVisitDays(p)"
          >
            近{{ p }}天
          </span>
        </div>
        <div ref="visitChartRef" style="height: 220px"></div>
      </div>

      <!-- 分类分布图 -->
      <div class="chart-card">
        <h3 class="chart-title">标本分类分布</h3>
        <div ref="categoryChartRef" style="height: 180px"></div>
        <div class="category-legend">
          <div v-for="(item, idx) in categoryLegend" :key="item.name" class="legend-item">
            <div class="legend-dot" :style="{ background: item.color }"></div>
            <span class="legend-name">{{ item.name }}</span>
            <span class="legend-count">{{ item.count }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部卡片 -->
    <div class="bottom-grid">
      <!-- 待处理事项 -->
      <div class="info-card">
        <h3 class="info-card-title">
          <el-icon :size="16" style="color: #f59e0b"><Clock /></el-icon>
          待处理事项
        </h3>
        <div class="pending-list">
          <div v-for="item in pendingItems" :key="item.label" class="pending-item">
            <span class="pending-label">{{ item.label }}</span>
            <span class="pending-badge" :style="{ background: item.count > 0 ? item.color : '#ccc' }">
              {{ item.count }}
            </span>
          </div>
        </div>
      </div>

      <!-- 标本目录概览 -->
      <div class="info-card">
        <h3 class="info-card-title">
          <el-icon :size="16" style="color: #2d6a4f"><Collection /></el-icon>
          标本目录概览
        </h3>
        <div class="museum-list">
          <div v-for="museum in museumStats" :key="museum.id" class="museum-item">
            <div class="museum-header">
              <span class="museum-name">{{ museum.icon }} {{ museum.name }}</span>
              <span class="museum-count">{{ museum.specimenCount }}种</span>
            </div>
            <div class="museum-progress">
              <div class="museum-progress-bar" :style="{ width: museum.percentage + '%' }"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 用户构成 -->
      <div class="info-card">
        <h3 class="info-card-title">
          <el-icon :size="16" style="color: #2d6a4f"><User /></el-icon>
          用户构成
        </h3>
        <div class="user-list">
          <div v-for="item in userStats" :key="item.label" class="user-item">
            <div class="user-dot" :style="{ background: item.color }"></div>
            <span class="user-label">
              <el-icon v-if="item.label === 'VIP教师'" :size="12"><Star /></el-icon>
              {{ item.label }}
            </span>
            <span class="user-count">{{ item.count }}</span>
          </div>
        </div>
        <div class="pending-user">
          <span>待审核用户</span>
          <span :style="{ color: pendingUserCount > 0 ? '#f59e0b' : '#888', fontWeight: 600 }">{{ pendingUserCount }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, markRaw, nextTick, computed } from 'vue'
import { getCurrentInstance } from 'vue'
import * as echarts from 'echarts'
import { Top, Clock, User, Star, Collection } from '@element-plus/icons-vue'
import {
  getStatsOverview,
  getVisitChart,
  getMuseumAll,
  getRegisterAuditList,
  getVipAuditList,
  getAppUserList
} from '@/api/index'

const { proxy } = getCurrentInstance()

// 统计数据
const overview = reactive({
  totalVisits: 0,
  totalUsers: 0,
  totalSpecimenVisits: 0,
  totalExamCount: 0,
  totalMuseums: 0,
  totalSpecimens: 0
})

const visitDays = ref(14)
const visitChartData = ref<any[]>([])
const categoryChartData = ref<any[]>([])
const categoryLegend = ref<any[]>([])

// 待处理数量
const pendingCounts = reactive({
  registerAudit: 0,
  vipAudit: 0,
  imageAudit: 0
})

// 标本目录统计
const museumStats = ref<any[]>([])

// 用户统计
const userStats = ref<any[]>([])
const pendingUserCount = ref(0)

// ECharts 实例
let visitChartInstance: echarts.ECharts | null = null
let categoryChartInstance: echarts.ECharts | null = null
const visitChartRef = ref<HTMLDivElement | null>(null)
const categoryChartRef = ref<HTMLDivElement | null>(null)

// 静态图标组件
const EyeIcon = { template: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>' }
const UsersIcon = { template: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>' }
const FlaskIcon = { template: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 22h12"/><path d="M6 2h12"/><path d="M9 2v7.39a2 2 0 0 1-.76 1.53L4 15.35A2 2 0 0 0 4 17h16a2 2 0 0 0 2-2l.04-1.17a2 2 0 0 1-.76-1.53V2"/><path d="M9 2h6"/></svg>' }
const ClipboardIcon = { template: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>' }

// 指标卡片数据
const statCards = computed(() => [
  { label: '系统总访问量', value: (overview.totalVisits || 0).toLocaleString(), icon: EyeIcon, color: '#1b3a2d', bg: '#e8f5e9', trend: '+12.4%' },
  { label: '注册用户数', value: overview.totalUsers || 0, icon: UsersIcon, color: '#2d6a4f', bg: '#d4edda', trend: '+5.2%' },
  { label: '馆藏标本数', value: overview.totalSpecimens || 0, icon: FlaskIcon, color: '#40916c', bg: '#c3e6cb', trend: '+3.1%' },
  { label: '考试总次数', value: (overview.totalExamCount || 0).toLocaleString(), icon: ClipboardIcon, color: '#52b788', bg: '#b7e4c7', trend: '+18.7%' }
])

// 待处理事项
const pendingItems = computed(() => [
  { label: '注册申请审核', count: pendingCounts.registerAudit, color: '#3b82f6' },
  { label: 'VIP申请审核', count: pendingCounts.vipAudit, color: '#8b5cf6' },
  { label: '图片上传审核', count: pendingCounts.imageAudit, color: '#f59e0b' }
])

// 加载系统概况
async function loadOverview() {
  try {
    const res: any = await getStatsOverview()
    if (res.code === 200 && res.data) {
      Object.assign(overview, res.data)
    }
  } catch (error) {
    console.error('加载系统概况失败', error)
  }
}

// 加载访问趋势图
async function loadVisitChart() {
  try {
    const res: any = await getVisitChart(visitDays.value)
    if (res.code === 200 && res.data) {
      visitChartData.value = res.data
      updateVisitChart()
    }
  } catch (error) {
    console.error('加载访问趋势图失败', error)
  }
}

// 加载标本目录和分类数据
async function loadMuseumAndCategory() {
  try {
    const museumRes: any = await getMuseumAll()

    if (museumRes.code === 200 && museumRes.data) {
      const museums = museumRes.data
      const totalCount = museums.reduce((sum: number, m: any) => sum + (m.specimenCount || 0), 0)

      const colors = ['#2d6a4f', '#40916c', '#52b788', '#74c69d', '#95d5b2', '#b7e4c7']
      museumStats.value = museums.map((m: any, index: number) => ({
        id: m.id,
        name: m.name,
        icon: m.icon || '🏛️',
        specimenCount: m.specimenCount || 0,
        percentage: totalCount > 0 ? Math.round((m.specimenCount || 0) / totalCount * 100) : 0,
        color: colors[index % colors.length]
      }))

      // 计算分类分布
      const categoryMap = new Map<string, number>()
      museums.forEach((m: any) => {
        if (m.categories) {
          m.categories.forEach((c: any) => {
            categoryMap.set(c.name, (categoryMap.get(c.name) || 0) + c.specimenCount)
          })
        }
      })

      const categoryColors = ['#2d6a4f', '#40916c', '#52b788', '#74c69d', '#95d5b2', '#b7e4c7']
      categoryChartData.value = Array.from(categoryMap.entries()).map(([name, count], index) => ({
        name,
        value: count,
        itemStyle: { color: categoryColors[index % categoryColors.length] }
      }))

      categoryLegend.value = categoryChartData.value.slice(0, 4).map((item: any, index: number) => ({
        name: item.name,
        count: item.value,
        color: categoryColors[index]
      }))

      updateCategoryChart()
    }
  } catch (error) {
    console.error('加载标本目录数据失败', error)
  }
}

// 加载待处理数量
async function loadPendingCounts() {
  try {
    const [regRes, vipRes, userRes]: any = await Promise.all([
      getRegisterAuditList({ pageNum: 1, pageSize: 1 }),
      getVipAuditList({ pageNum: 1, pageSize: 1 }),
      getAppUserList({ pageNum: 1, pageSize: 1 })
    ])

    if (regRes.code === 200) {
      pendingCounts.registerAudit = regRes.data.total || 0
    }
    if (vipRes.code === 200) {
      pendingCounts.vipAudit = vipRes.data.total || 0
    }
    if (userRes.code === 200) {
      const users = userRes.data.rows || []
      userStats.value = [
        { label: '学生', count: users.filter((u: any) => u.role === 'student').length, color: '#52b788' },
        { label: '教师', count: users.filter((u: any) => u.role === 'teacher').length, color: '#40916c' },
        { label: 'VIP教师', count: users.filter((u: any) => u.role === 'vip_teacher').length, color: '#2d6a4f' },
        { label: '管理员', count: users.filter((u: any) => u.role === 'admin').length, color: '#1b3a2d' }
      ]
      pendingUserCount.value = users.filter((u: any) => u.status === 'pending').length
    }
  } catch (error) {
    console.error('加载待处理数量失败', error)
  }
}

// 切换访问天数
function changeVisitDays(days: number) {
  visitDays.value = days
  loadVisitChart()
}

// 更新访问趋势图
function updateVisitChart() {
  if (!visitChartInstance) return

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'line' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: visitChartData.value.map(item => item.date),
      axisLine: { lineStyle: { color: '#eee' } },
      axisLabel: { color: '#888', fontSize: 11 }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisLabel: { color: '#888', fontSize: 11 },
      splitLine: { lineStyle: { color: '#f0f0f0' } }
    },
    series: [
      {
        name: '访问次数',
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: { color: '#2d6a4f', width: 2.5 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(45, 106, 79, 0.3)' },
            { offset: 1, color: 'rgba(45, 106, 79, 0)' }
          ])
        },
        data: visitChartData.value.map(item => item.count)
      }
    ]
  }

  visitChartInstance.setOption(option)
}

// 更新分类饼图
function updateCategoryChart() {
  if (!categoryChartInstance) return

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    series: [
      {
        name: '标本分类',
        type: 'pie',
        radius: ['35%', '65%'],
        center: ['50%', '50%'],
        data: categoryChartData.value,
        label: { show: false },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }

  categoryChartInstance.setOption(option)
}

// 初始化图表
function initCharts() {
  if (visitChartRef.value) {
    visitChartInstance = markRaw(echarts.init(visitChartRef.value, 'macarons'))
    window.addEventListener('resize', handleResize)
  }
  if (categoryChartRef.value) {
    categoryChartInstance = markRaw(echarts.init(categoryChartRef.value, 'macarons'))
  }
}

// 响应式调整
function handleResize() {
  visitChartInstance?.resize()
  categoryChartInstance?.resize()
}

// 加载所有数据
async function loadAllData() {
  proxy.$modal.loading('正在加载数据...')
  try {
    await Promise.all([
      loadOverview(),
      loadVisitChart(),
      loadMuseumAndCategory(),
      loadPendingCounts()
    ])
  } finally {
    proxy.$modal.closeLoading()
  }
}

onMounted(() => {
  nextTick(() => {
    initCharts()
    loadAllData()
  })
})

onUnmounted(() => {
  visitChartInstance?.dispose()
  categoryChartInstance?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.index-container {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.index-header {
  margin-bottom: 24px;
}

.index-header h1 {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
}

/* 指标卡片 */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

@media (min-width: 1280px) {
  .stat-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.08);
}

.stat-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 12px;
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 12px;
  color: #22c55e;
}

.stat-value {
  font-size: 26px;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 13px;
  color: #888;
}

/* 图表区域 */
.charts-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

@media (min-width: 1280px) {
  .charts-grid {
    grid-template-columns: 2fr 1fr;
  }
}

.chart-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.08);
}

.chart-title {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin: 0 0 12px 0;
}

.chart-card-wide {
  position: relative;
}

.chart-period-btns {
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  gap: 4px;
}

.period-btn {
  padding: 4px 10px;
  font-size: 12px;
  border-radius: 6px;
  cursor: pointer;
  background: #f3f4f6;
  color: #6b7280;
  transition: all 0.2s;
}

.period-btn:hover {
  background: #e5e7eb;
}

.period-btn.active {
  background: #2d6a4f;
  color: #fff;
}

/* 分类图例 */
.category-legend {
  margin-top: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 2px 0;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-name {
  flex: 1;
  font-size: 12px;
  color: #555;
}

.legend-count {
  font-size: 12px;
  font-weight: 500;
  color: #333;
}

/* 底部卡片 */
.bottom-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 1280px) {
  .bottom-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.info-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.08);
}

.info-card-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin: 0 0 16px 0;
}

/* 待处理事项 */
.pending-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pending-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.pending-label {
  font-size: 13px;
  color: #555;
}

.pending-badge {
  padding: 2px 10px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 500;
  color: #fff;
}

/* 标本目录 */
.museum-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.museum-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.museum-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.museum-name {
  font-size: 13px;
  color: #555;
}

.museum-count {
  font-size: 12px;
  color: #888;
}

.museum-progress {
  height: 6px;
  background: #e8f5e9;
  border-radius: 9999px;
  overflow: hidden;
}

.museum-progress-bar {
  height: 100%;
  background: #2d6a4f;
  border-radius: 9999px;
  transition: width 0.3s ease;
}

/* 用户构成 */
.user-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.user-label {
  flex: 1;
  font-size: 13px;
  color: #555;
  display: flex;
  align-items: center;
  gap: 4px;
}

.user-count {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.pending-user {
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
  font-size: 13px;
  color: #888;
}

/* 文字颜色 */
.text-gray-800 {
  color: #1f2937;
}

.text-gray-500 {
  color: #6b7280;
}
</style>
