<!--
 * @Author: rickyluo
 * @Date: 2024-04-28
 * @Description: 系统统计
-->
<template>
  <div class="app-container statistics-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">系统统计</h1>
        <p class="page-desc">系统运行数据分析</p>
      </div>
      <div class="header-right">
        <el-select v-model="queryParams.deptId" placeholder="选择学校" clearable style="width: 180px; margin-right: 12px" @change="handleQuery">
          <el-option label="全部学校" :value="undefined" />
          <el-option v-for="dept in schoolOptions" :key="dept.deptId" :label="dept.deptName" :value="dept.deptId" />
        </el-select>
        <el-date-picker
          v-model="dateRange"
          value-format="YYYY-MM-DD"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]"
          style="margin-right: 12px"
          @change="handleDateChange"
        />
        <el-button type="primary" icon="Download" @click="handleExport">导出成绩</el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="metrics-grid">
      <div v-for="m in metrics" :key="m.label" class="metric-card">
        <div class="metric-icon" :style="{ background: `${m.color}18` }">
          <el-icon :color="m.color" :size="20"><component :is="m.icon" /></el-icon>
        </div>
        <div class="metric-value">{{ m.value }}</div>
        <div class="metric-label">{{ m.label }}</div>
        <div v-if="m.sub" class="metric-sub">{{ m.sub }}</div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="charts-grid">
      <!-- 访问量趋势 -->
      <div class="chart-card">
        <div class="chart-title">访问量趋势</div>
        <div ref="visitChartRef" class="chart-container"></div>
      </div>

      <!-- 考试次数趋势 -->
      <div class="chart-card">
        <div class="chart-title">考试次数趋势</div>
        <div ref="examChartRef" class="chart-container"></div>
      </div>
    </div>

    <!-- 下方图表 -->
    <div class="charts-row">
      <!-- 考试成绩分布 -->
      <div class="chart-card">
        <div class="chart-title">考试成绩分布</div>
        <div ref="scoreChartRef" class="chart-container"></div>
      </div>

      <!-- 用户构成饼图 -->
      <div class="chart-card">
        <div class="chart-title">用户构成</div>
        <div ref="userPieChartRef" class="chart-container"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, markRaw, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { User, View, Document, TrendCharts, Download } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { getSchoolStats, exportStudentScores } from '@/api/statistics'
import { listDept } from '@/api/system/dept'
import dayjs from 'dayjs'

// 类型定义
interface Metric {
  label: string
  value: string | number
  sub?: string
  icon: any
  color: string
}

// 响应式数据
const dateRange = ref<[string, string]>([])
const queryParams = reactive({
  deptId: undefined as number | undefined,
  startDate: '',
  endDate: ''
})
const schoolOptions = ref<any[]>([])

const visitChartRef = ref<HTMLDivElement>()
const examChartRef = ref<HTMLDivElement>()
const scoreChartRef = ref<HTMLDivElement>()
const userPieChartRef = ref<HTMLDivElement>()

let visitChartInstance: echarts.ECharts | null = null
let examChartInstance: echarts.ECharts | null = null
let scoreChartInstance: echarts.ECharts | null = null
let userPieChartInstance: echarts.ECharts | null = null

const metrics = ref<Metric[]>([
  { label: '总考试次数', value: 0, sub: '累计', icon: markRaw(Document), color: '#1b3a2d' },
  { label: '日均考试次数', value: 0, sub: '', icon: markRaw(TrendCharts), color: '#2d6a4f' },
  { label: '总访问量', value: 0, sub: '累计', icon: markRaw(View), color: '#40916c' },
  { label: '日均访问量', value: 0, sub: '', icon: markRaw(User), color: '#52b788' },
  { label: '用户总数', value: 0, sub: '', icon: markRaw(User), color: '#74c69d' }
])

const chartData = reactive({
  visitTrend: [] as any[],
  examTrend: [] as any[],
  scoreDistribution: [] as any[],
  userComposition: { teachers: 0, students: 0 },
  rawScoreDist: {
    hundred: 0,
    ninetyToHundred: 0,
    eightyToNinety: 0,
    seventyToEighty: 0,
    sixtyToSeventy: 0,
    fiftyToSixty: 0,
    fortyToFifty: 0,
    thirtyToForty: 0,
    twentyToThirty: 0,
    tenToTwenty: 0,
    zeroToTen: 0
  }
})

// 设置默认时间范围为最近一个月
function setDefaultDateRange() {
  const end = dayjs().format('YYYY-MM-DD')
  const start = dayjs().subtract(30, 'day').format('YYYY-MM-DD')
  dateRange.value = [start, end]
  queryParams.startDate = start
  queryParams.endDate = end
}

// 日期范围变化
function handleDateChange(val: [string, string] | null) {
  if (val) {
    queryParams.startDate = val[0]
    queryParams.endDate = val[1]
  } else {
    queryParams.startDate = ''
    queryParams.endDate = ''
  }
  loadData()
}

// 查询
function handleQuery() {
  loadData()
}

// 加载学校列表
async function loadSchools() {
  try {
    const res: any = await listDept({ type: 'school' })
    if (res.code === 200 && res.data) {
      schoolOptions.value = res.data
    }
  } catch (error) {
    console.error('加载学校列表失败', error)
  }
}

// 加载统计数据
async function loadData() {
  try {
    const res: any = await getSchoolStats(queryParams)
    if (res.code === 200 && res.data) {
      const dataList = res.data as any[]

      // 汇总所有学校数据
      let totalExams = 0
      let totalVisits = 0
      const allVisitDaily: any[] = []
      const allExamDaily: any[] = []
      let teachers = 0
      let students = 0

      dataList.forEach((data: any) => {
        totalExams += data.totalExams || 0
        totalVisits += data.totalVisits || 0
        if (data.visitDailyData) allVisitDaily.push(...data.visitDailyData)
        if (data.examDailyData) allExamDaily.push(...data.examDailyData)
        if (data.userStats) {
          teachers += data.userStats.teachers || 0
          students += data.userStats.students || 0
        }
        if (data.scoreDistribution) {
          const dist = data.scoreDistribution
          chartData.rawScoreDist.hundred += dist.hundred || 0
          chartData.rawScoreDist.ninetyToHundred += dist.ninetyToHundred || 0
          chartData.rawScoreDist.eightyToNinety += dist.eightyToNinety || 0
          chartData.rawScoreDist.seventyToEighty += dist.seventyToEighty || 0
          chartData.rawScoreDist.sixtyToSeventy += dist.sixtyToSeventy || 0
          chartData.rawScoreDist.fiftyToSixty += dist.fiftyToSixty || 0
          chartData.rawScoreDist.fortyToFifty += dist.fortyToFifty || 0
          chartData.rawScoreDist.thirtyToForty += dist.thirtyToForty || 0
          chartData.rawScoreDist.twentyToThirty += dist.twentyToThirty || 0
          chartData.rawScoreDist.tenToTwenty += dist.tenToTwenty || 0
          chartData.rawScoreDist.zeroToTen += dist.zeroToTen || 0
        }
      })

      // 计算日均（基于日期范围天数）
      const start = dayjs(queryParams.startDate)
      const end = dayjs(queryParams.endDate)
      const days = end.diff(start, 'day') + 1 || 1
      const avgDailyVisit = Math.round(totalVisits / days)
      const avgDailyExam = Math.round(totalExams / days)

      // 更新指标卡片
      metrics.value[0].value = totalExams
      metrics.value[1].value = avgDailyExam
      metrics.value[2].value = totalVisits.toLocaleString()
      metrics.value[3].value = avgDailyVisit
      metrics.value[4].value = teachers + students

      // 访问趋势数据（按日期排序）
      chartData.visitTrend = allVisitDaily.sort((a, b) => a.date.localeCompare(b.date))
      // 考试趋势数据
      chartData.examTrend = allExamDaily.sort((a, b) => a.date.localeCompare(b.date))
      // 用户构成
      chartData.userComposition = { teachers, students }

      updateCharts()
    }
  } catch (error) {
    console.error('加载统计数据失败', error)
  }
}

// 更新所有图表
function updateCharts() {
  updateVisitChart()
  updateExamChart()
  updateScoreChart()
  updateUserPieChart()
}

// 更新访问趋势图
function updateVisitChart() {
  if (!visitChartInstance || !visitChartRef.value) return

  const option = {
    tooltip: { trigger: 'axis', backgroundColor: '#fff', borderRadius: 8, border: '1px solid #eee', textStyle: { fontSize: 12 } },
    legend: { data: ['访问量'], icon: 'circle', itemWidth: 8, itemHeight: 8, textStyle: { fontSize: 12 } },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '15%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, data: chartData.visitTrend.map((d: any) => d.date), axisTick: { show: false }, axisLine: { lineStyle: { color: '#f0f0f0' } }, axisLabel: { fontSize: 11, color: '#888' } },
    yAxis: { type: 'value', axisTick: { show: false }, axisLine: { show: false }, axisLabel: { fontSize: 11, color: '#888' }, splitLine: { lineStyle: { color: '#f0f0f0' } } },
    series: [{
      name: '访问量',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      data: chartData.visitTrend.map((d: any) => d.count),
      areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0.05, color: 'rgba(45, 106, 79, 0.3)' }, { offset: 0.95, color: 'rgba(45, 106, 79, 0)' }]) },
      lineStyle: { color: '#2d6a4f', width: 2 },
      itemStyle: { color: '#2d6a4f' }
    }]
  }

  visitChartInstance.setOption(option)
}

// 更新考试趋势图
function updateExamChart() {
  if (!examChartInstance || !examChartRef.value) return

  const option = {
    tooltip: { trigger: 'axis', backgroundColor: '#fff', borderRadius: 8, border: '1px solid #eee', textStyle: { fontSize: 12 } },
    legend: { data: ['考试次数'], icon: 'circle', itemWidth: 8, itemHeight: 8, textStyle: { fontSize: 12 } },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '15%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, data: chartData.examTrend.map((d: any) => d.date), axisTick: { show: false }, axisLine: { lineStyle: { color: '#f0f0f0' } }, axisLabel: { fontSize: 11, color: '#888' } },
    yAxis: { type: 'value', axisTick: { show: false }, axisLine: { show: false }, axisLabel: { fontSize: 11, color: '#888' }, splitLine: { lineStyle: { color: '#f0f0f0' } } },
    series: [{
      name: '考试次数',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      data: chartData.examTrend.map((d: any) => d.count),
      areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0.05, color: 'rgba(82, 183, 136, 0.3)' }, { offset: 0.95, color: 'rgba(82, 183, 136, 0)' }]) },
      lineStyle: { color: '#52b788', width: 2 },
      itemStyle: { color: '#52b788' }
    }]
  }

  examChartInstance.setOption(option)
}

// 更新成绩分布柱状图
function updateScoreChart() {
  if (!scoreChartInstance || !scoreChartRef.value) return

  const dist = chartData.rawScoreDist
  const option = {
    tooltip: { trigger: 'axis', backgroundColor: '#fff', borderRadius: 8, fontSize: 12 },
    legend: { data: ['人数'], icon: 'circle', itemWidth: 8, itemHeight: 8, textStyle: { fontSize: 12 } },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: { type: 'category', data: ['100', '90-99', '80-89', '70-79', '60-69', '50-59', '40-49', '30-39', '20-29', '10-19', '0-9'], axisTick: { show: false }, axisLine: { lineStyle: { color: '#f0f0f0' } }, axisLabel: { fontSize: 10, color: '#888' } },
    yAxis: { type: 'value', axisTick: { show: false }, axisLine: { show: false }, axisLabel: { fontSize: 12, color: '#888' }, splitLine: { lineStyle: { color: '#f0f0f0' } } },
    series: [{
      name: '人数',
      type: 'bar',
      data: [dist.hundred, dist.ninetyToHundred, dist.eightyToNinety, dist.seventyToEighty, dist.sixtyToSeventy, dist.fiftyToSixty, dist.fortyToFifty, dist.thirtyToForty, dist.twentyToThirty, dist.tenToTwenty, dist.zeroToTen],
      barWidth: 20,
      itemStyle: { color: '#52b788', borderRadius: [4, 4, 0, 0] }
    }]
  }

  scoreChartInstance.setOption(option)
}

// 更新用户构成饼图
function updateUserPieChart() {
  if (!userPieChartInstance || !userPieChartRef.value) return

  const option = {
    tooltip: { trigger: 'item', formatter: '{a} <br/>{b}: {c} ({d}%)' },
    legend: { bottom: 0, textStyle: { fontSize: 12 } },
    series: [{
      name: '用户构成',
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['50%', '50%'],
      data: [
        { value: chartData.userComposition.students, name: '学生', itemStyle: { color: '#52b788' } },
        { value: chartData.userComposition.teachers, name: '教师', itemStyle: { color: '#2d6a4f' } }
      ],
      label: { show: true, formatter: '{b}: {c}' },
      emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' } }
    }]
  }

  userPieChartInstance.setOption(option)
}

// 导出成绩
async function handleExport() {
  try {
    const res: any = await exportStudentScores({
      deptId: queryParams.deptId,
      startDate: queryParams.startDate,
      endDate: queryParams.endDate
    })
    const blob = new Blob([res], { type: 'application/vnd.ms-excel' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = '学生成绩统计_' + dayjs().format('YYYY-MM-DD') + '.xlsx'
    link.click()
    window.URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch (error) {
    ElMessage.error('导出失败')
  }
}

// 初始化图表
function initCharts() {
  if (visitChartRef.value) {
    visitChartInstance = markRaw(echarts.init(visitChartRef.value, 'macarons'))
  }
  if (examChartRef.value) {
    examChartInstance = markRaw(echarts.init(examChartRef.value, 'macarons'))
  }
  if (scoreChartRef.value) {
    scoreChartInstance = markRaw(echarts.init(scoreChartRef.value, 'macarons'))
  }
  if (userPieChartRef.value) {
    userPieChartInstance = markRaw(echarts.init(userPieChartRef.value, 'macarons'))
  }
}

// 响应式
function handleResize() {
  visitChartInstance?.resize()
  examChartInstance?.resize()
  scoreChartInstance?.resize()
  userPieChartInstance?.resize()
}

// 生命周期
onMounted(() => {
  setDefaultDateRange()
  initCharts()
  loadSchools()
  loadData()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  visitChartInstance?.dispose()
  examChartInstance?.dispose()
  scoreChartInstance?.dispose()
  userPieChartInstance?.dispose()
})
</script>

<style scoped>
.statistics-page {
  padding: 20px;
}

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

.header-right {
  display: flex;
  align-items: center;
}

/* 统计卡片网格 */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

@media (max-width: 1400px) {
  .metrics-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 1000px) {
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.metric-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.08);
}

.metric-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.metric-value {
  font-size: 26px;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1;
  margin-bottom: 4px;
}

.metric-label {
  font-size: 13px;
  color: #888;
}

.metric-sub {
  font-size: 12px;
  color: #22c55e;
  margin-top: 2px;
}

/* 图表卡片 */
.chart-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
}

.chart-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 16px;
}

.chart-container {
  width: 100%;
  height: 280px;
}

/* 图表网格 */
.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.charts-grid .chart-card {
  margin-bottom: 0;
}

/* 图表行 */
.charts-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.charts-row .chart-card {
  margin-bottom: 0;
}

@media (max-width: 1200px) {
  .charts-grid,
  .charts-row {
    grid-template-columns: 1fr;
  }
}
</style>