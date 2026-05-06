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
        <el-radio-group v-model="period" @change="handlePeriodChange">
          <el-radio-button :value="7">近7天</el-radio-button>
          <el-radio-button :value="14">近14天</el-radio-button>
          <el-radio-button :value="30">近30天</el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="metrics-grid">
      <div v-for="m in metrics" :key="m.label" class="metric-card">
        <div class="metric-icon" :style="{ background: `${m.color}18` }">
          <el-icon :color="m.color" :size="20"
            ><component :is="m.icon"
          /></el-icon>
        </div>
        <div class="metric-value">{{ m.value }}</div>
        <div class="metric-label">{{ m.label }}</div>
        <div v-if="m.sub" class="metric-sub">{{ m.sub }}</div>
      </div>
    </div>

    <!-- 访问量趋势 -->
    <div class="chart-card">
      <div class="chart-title">访问量趋势（近{{ period }}天）</div>
      <div ref="visitChartRef" class="chart-container"></div>
    </div>

    <!-- 下方两个图表 -->
    <div class="charts-row">
      <!-- 考试成绩分布 -->
      <div class="chart-card">
        <div class="chart-title">考试成绩分布</div>
        <div ref="examChartRef" class="chart-container"></div>
      </div>

      <!-- 标本分类统计 -->
      <div class="chart-card">
        <div class="chart-title">标本分类统计</div>
        <div ref="categoryChartRef" class="chart-container"></div>
      </div>
    </div>

    <!-- 各标本目录访问统计 -->
    <div class="chart-card">
      <div class="chart-title">各标本目录访问统计</div>
      <div class="museum-stats">
        <div v-for="m in museumStats" :key="m.name" class="museum-item">
          <div class="museum-header">
            <span class="museum-name">{{ m.name }}</span>
            <div class="museum-meta">
              <span>👁 {{ m.views.toLocaleString() }} 次访问</span>
              <span>📝 {{ m.exams.toLocaleString() }} 次考试</span>
            </div>
          </div>
          <div class="museum-progress">
            <div class="progress-item">
              <div class="progress-label">
                <span>浏览量</span>
                <span>{{ m.views.toLocaleString() }}</span>
              </div>
              <el-progress
                :percentage="Math.min((m.views / maxViews) * 100, 100)"
                :stroke-width="8"
                :show-text="false"
                color="#2d6a4f"
              />
            </div>
            <div class="progress-item">
              <div class="progress-label">
                <span>考试次数</span>
                <span>{{ m.exams.toLocaleString() }}</span>
              </div>
              <el-progress
                :percentage="Math.min((m.exams / maxExams) * 100, 100)"
                :stroke-width="8"
                :show-text="false"
                color="#52b788"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, markRaw } from "vue";
import { ElMessage } from "element-plus";
import { User } from "@element-plus/icons-vue";
import * as echarts from "echarts";
import { getStatsOverview, getStatsVisitChart } from "@/api/statistics.js";

// 类型定义
interface Metric {
  label: string;
  value: string | number;
  sub?: string;
  icon: any;
  color: string;
}

interface MuseumStat {
  name: string;
  views: number;
  exams: number;
}

// 响应式数据
const period = ref(30);
const visitChartRef = ref<HTMLDivElement>();
const examChartRef = ref<HTMLDivElement>();
const categoryChartRef = ref<HTMLDivElement>();
const visitChart = ref<echarts.ECharts>();
const examChart = ref<echarts.ECharts>();
const categoryChart = ref<echarts.ECharts>();

const metrics = ref<Metric[]>([
  {
    label: "今日访问量",
    value: 0,
    sub: "较昨日 +0%",
    icon: markRaw(User),
    color: "#1b3a2d",
  },
  {
    label: "总访问量",
    value: 0,
    sub: "累计",
    icon: markRaw(User),
    color: "#2d6a4f",
  },
  {
    label: "活跃用户",
    value: 0,
    sub: "注册用户",
    icon: markRaw(User),
    color: "#40916c",
  },
  {
    label: "考试总次数",
    value: 0,
    sub: "累计",
    icon: markRaw(User),
    color: "#52b788",
  },
]);

const museumStats = ref<MuseumStat[]>([
  { name: "中药材（饮片）馆", views: 8234, exams: 1456 },
  { name: "药用植物馆", views: 3122, exams: 436 },
]);

const maxViews = ref(8234);
const maxExams = ref(1456);

// 模拟考试分数分布数据
const examScoreData = [
  { score: "0-5", count: 8 },
  { score: "6-10", count: 24 },
  { score: "11-15", count: 67 },
  { score: "16-18", count: 89 },
  { score: "19-20", count: 43 },
];

// 模拟标本分类统计数据
const categoryData = [
  { name: "根茎类", count: 156 },
  { name: "花叶类", count: 89 },
  { name: "果实种子类", count: 134 },
  { name: "皮类", count: 45 },
  { name: "全草类", count: 78 },
];

// 初始化访问量图表
function initVisitChart(data: any[]) {
  if (!visitChartRef.value) return;
  visitChart.value = markRaw(echarts.init(visitChartRef.value));

  const option = {
    tooltip: {
      trigger: "axis",
      backgroundColor: "#fff",
      borderRadius: 8,
      border: "1px solid #eee",
      textStyle: { fontSize: 12 },
    },
    legend: {
      data: ["访问次数", "访问用户数"],
      icon: "circle",
      itemWidth: 8,
      itemHeight: 8,
      textStyle: { fontSize: 12 },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      top: "15%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: data.map((d) => d.date),
      axisTick: { show: false },
      axisLine: { lineStyle: { color: "#f0f0f0" } },
      axisLabel: { fontSize: 11, color: "#888" },
    },
    yAxis: {
      type: "value",
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: { fontSize: 11, color: "#888" },
      splitLine: { lineStyle: { color: "#f0f0f0" } },
    },
    series: [
      {
        name: "访问次数",
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 6,
        data: data.map((d) => d.count),
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0.05, color: "rgba(45, 106, 79, 0.3)" },
            { offset: 0.95, color: "rgba(45, 106, 79, 0)" },
          ]),
        },
        lineStyle: { color: "#2d6a4f", width: 2 },
        itemStyle: { color: "#2d6a4f" },
      },
      {
        name: "访问用户数",
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 6,
        data: data.map((d, i) => Math.floor(Math.random() * 50) + i * 2),
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0.05, color: "rgba(82, 183, 136, 0.3)" },
            { offset: 0.95, color: "rgba(82, 183, 136, 0)" },
          ]),
        },
        lineStyle: { color: "#52b788", width: 2 },
        itemStyle: { color: "#52b788" },
      },
    ],
  };

  visitChart.value.setOption(option);
}

// 初始化考试分布图表
function initExamChart() {
  if (!examChartRef.value) return;
  examChart.value = markRaw(echarts.init(examChartRef.value));

  const option = {
    tooltip: {
      trigger: "axis",
      backgroundColor: "#fff",
      borderRadius: 8,
      fontSize: 12,
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      top: "10%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: examScoreData.map((d) => d.score),
      axisTick: { show: false },
      axisLine: { lineStyle: { color: "#f0f0f0" } },
      axisLabel: { fontSize: 12, color: "#888" },
    },
    yAxis: {
      type: "value",
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: { fontSize: 12, color: "#888" },
      splitLine: { lineStyle: { color: "#f0f0f0" } },
    },
    series: [
      {
        name: "考试人次",
        type: "bar",
        data: examScoreData.map((d) => d.count),
        barWidth: 20,
        itemStyle: {
          color: "#52b788",
          borderRadius: [4, 4, 0, 0],
        },
      },
    ],
  };

  examChart.value.setOption(option);
}

// 初始化分类统计图表
function initCategoryChart() {
  if (!categoryChartRef.value) return;
  categoryChart.value = markRaw(echarts.init(categoryChartRef.value));

  const option = {
    tooltip: {
      trigger: "axis",
      backgroundColor: "#fff",
      borderRadius: 8,
      fontSize: 12,
    },
    grid: {
      left: "3%",
      right: "8%",
      bottom: "3%",
      top: "10%",
      containLabel: true,
    },
    xAxis: {
      type: "value",
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: { fontSize: 11, color: "#888" },
      splitLine: { lineStyle: { color: "#f0f0f0" } },
    },
    yAxis: {
      type: "category",
      data: categoryData.map((d) => d.name),
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: { fontSize: 11, color: "#555", width: 80 },
    },
    series: [
      {
        name: "标本数量",
        type: "bar",
        data: categoryData.map((d) => d.count),
        barWidth: 16,
        itemStyle: {
          color: "#2d6a4f",
          borderRadius: [0, 4, 4, 0],
        },
      },
    ],
  };

  categoryChart.value.setOption(option);
}

// 加载数据
async function loadData() {
  try {
    // 加载系统概况
    const overviewRes: any = await getStatsOverview();
    if (overviewRes.code === 200) {
      const data = overviewRes.data;
      metrics.value[0].value = data.totalVisits || 0;
      metrics.value[1].value = (data.totalVisits || 0).toLocaleString();
      metrics.value[2].value = data.totalUsers || 0;
      metrics.value[3].value = (data.totalExamCount || 0).toLocaleString();
    }

    // 加载访问趋势
    const chartRes: any = await getStatsVisitChart(period.value);
    if (chartRes.code === 200) {
      const chartData = chartRes.data || [];
      // 如果没有数据，生成模拟数据
      if (chartData.length === 0) {
        const now = new Date();
        const mockData = [];
        for (let i = period.value - 1; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          mockData.push({
            date: date.toISOString().split("T")[0],
            count: Math.floor(Math.random() * 100) + 50,
          });
        }
        initVisitChart(mockData);
      } else {
        initVisitChart(chartData);
      }
    }
  } catch (error) {
    console.error("加载统计数据失败", error);
    // 失败时生成模拟访问数据
    const now = new Date();
    const mockData = [];
    for (let i = period.value - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      mockData.push({
        date: date.toISOString().split("T")[0],
        count: Math.floor(Math.random() * 100) + 50,
      });
    }
    initVisitChart(mockData);
  }
}

// 切换时间周期
function handlePeriodChange() {
  loadData();
}

// 窗口 resize 处理
function handleResize() {
  visitChart.value?.resize();
  examChart.value?.resize();
  categoryChart.value?.resize();
}

// 生命周期
onMounted(() => {
  initVisitChart([]);
  initExamChart();
  initCategoryChart();
  loadData();
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
  visitChart.value?.dispose();
  examChart.value?.dispose();
  categoryChart.value?.dispose();
});
</script>

<style scoped>
.statistics-page {
  padding: 20px;
}

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

/* 统计卡片网格 */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

@media (max-width: 1200px) {
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
  height: 250px;
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
  .charts-row {
    grid-template-columns: 1fr;
  }
}

/* 标本目录统计 */
.museum-stats {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.museum-item {
  padding: 16px;
  background: #f8faf8;
  border-radius: 12px;
}

.museum-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.museum-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.museum-meta {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #888;
}

.museum-progress {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.progress-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #888;
}

:deep(.el-progress-bar__outer) {
  border-radius: 4px;
  background: #e8f5e9;
}
</style>
