<!--
 * @Author: rickyluo
 * @Date: 2024-04-28
 * @Description: 标本目录管理
-->
<template>
  <div class="app-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">标本目录管理</h1>
        <p class="page-desc">管理标本目录及其二级分类</p>
      </div>
      <el-button type="primary" @click="openAddMuseum">
        <el-icon><Plus /></el-icon>
        新增标本目录
      </el-button>
    </div>

    <!-- 馆列表 -->
    <div class="museum-list">
      <div
        v-for="museum in museumList"
        :key="museum.museumId"
        class="museum-card"
      >
        <!-- 馆头部 -->
        <div
          class="museum-header"
          :class="{ expanded: expandedMuseum === museum.museumId }"
          @click="toggleMuseum(museum.museumId)"
        >
          <div class="museum-icon">{{ museum.icon || "🌿" }}</div>
          <div class="museum-info">
            <div class="museum-name-row">
              <span class="museum-name">{{ museum.museumName }}</span>
              <el-tag size="small" type="success"
                >{{ museum.categories?.length || 0 }}个分类</el-tag
              >
              <el-tag size="small" type="info"
                >{{ getSpecimenCount(museum.museumId) }}个标本</el-tag
              >
            </div>
            <p class="museum-desc">{{ museum.description || "暂无描述" }}</p>
          </div>
          <div class="museum-actions" @click.stop>
            <el-button text @click="openEditMuseum(museum)">
              <el-icon><Edit /></el-icon>
            </el-button>
            <el-button text type="danger" @click="confirmDeleteMuseum(museum)">
              <el-icon><Delete /></el-icon>
            </el-button>
            <el-icon
              class="expand-icon"
              :class="{ rotated: expandedMuseum === museum.museumId }"
            >
              <ArrowRight />
            </el-icon>
          </div>
        </div>

        <!-- 分类列表 -->
        <div v-if="expandedMuseum === museum.museumId" class="category-section">
          <div class="category-header">
            <span class="category-label">二级分类</span>
            <el-button
              size="small"
              type="success"
              plain
              @click="openAddCategory(museum.museumId)"
            >
              <el-icon><Plus /></el-icon>
              添加分类
            </el-button>
          </div>

          <div
            v-if="!museum.categories || museum.categories.length === 0"
            class="category-empty"
          >
            <el-icon :size="32"><Folder /></el-icon>
            <p>暂无分类，请添加</p>
          </div>

          <div v-else class="category-grid">
            <div
              v-for="cat in museum.categories"
              :key="cat.categoryId"
              class="category-item"
            >
              <div class="category-icon">
                <el-icon><FolderOpened /></el-icon>
              </div>
              <div class="category-info">
                <div class="category-name">{{ cat.categoryName }}</div>
                <div class="category-meta">
                  {{ getCategorySpecimenCount(cat.categoryId) }}个标本 ·
                  {{ cat.description || "无描述" }}
                </div>
              </div>
              <div class="category-actions">
                <el-button
                  text
                  size="small"
                  @click="openEditCategory(museum.museumId, cat)"
                >
                  <el-icon><Edit /></el-icon>
                </el-button>
                <el-button
                  text
                  size="small"
                  type="danger"
                  @click="confirmDeleteCategory(museum.museumId, cat)"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 新增/编辑馆弹窗 -->
    <el-dialog
      v-model="museumDialogVisible"
      :title="editMuseum ? '编辑标本目录' : '新增标本目录'"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="museumFormRef"
        :model="museumForm"
        :rules="museumRules"
        label-width="80px"
      >
        <!-- <el-form-item label="图标">
          <div class="icon-picker">
            <div
              v-for="icon in iconList"
              :key="icon"
              class="icon-option"
              :class="{ selected: museumForm.icon === icon }"
              @click="museumForm.icon = icon"
            >
              {{ icon }}
            </div>
          </div>
        </el-form-item> -->
        <el-form-item label="目录名称" prop="name">
          <el-input
            v-model="museumForm.name"
            placeholder="如：中药材（饮片）"
          />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="museumForm.description"
            type="textarea"
            :rows="3"
            placeholder="标本目录简介..."
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="museumDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveMuseum">{{
          editMuseum ? "保存" : "创建"
        }}</el-button>
      </template>
    </el-dialog>

    <!-- 新增/编辑分类弹窗 -->
    <el-dialog
      v-model="categoryDialogVisible"
      :title="editCategory ? '编辑分类' : '添加分类'"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="categoryFormRef"
        :model="categoryForm"
        :rules="categoryRules"
        label-width="80px"
      >
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="categoryForm.name" placeholder="如：根及根茎类" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="categoryForm.description"
            placeholder="分类描述..."
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="categoryDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveCategory">{{
          editCategory ? "保存" : "添加"
        }}</el-button>
      </template>
    </el-dialog>

    <!-- 删除确认弹窗 -->
    <el-dialog v-model="deleteDialogVisible" title="确认删除" width="400px">
      <div class="delete-confirm">
        <div class="delete-icon">
          <el-icon :size="24"><Delete /></el-icon>
        </div>
        <p class="delete-title">
          确定要删除{{
            deleteTarget.type === "museum" ? "标本目录" : "分类"
          }}「{{ deleteTarget.name }}」吗？
        </p>
        <p class="delete-warning">
          此操作将同时删除所有关联标本，考试记录等数据，不可恢复，请谨慎操作！
        </p>
      </div>
      <template #footer>
        <el-button @click="deleteDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="doDelete">确认删除</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Plus,
  Edit,
  Delete,
  Folder,
  FolderOpened,
  ArrowRight,
} from "@element-plus/icons-vue";
import {
  getMuseumAll,
  addMuseum,
  updateMuseum,
  delMuseum,
  addCategory,
  updateCategory,
  delCategory,
} from "@/api/museum";

const iconList = [
  "🌿",
  "🌱",
  "🍀",
  "🪴",
  "🌾",
  "🌸",
  "🍃",
  "🌲",
  "🌳",
  "🔬",
  "💊",
  "🧪",
];

// 数据
const museumList = ref<any[]>([]);
const specimenCountMap = ref<Record<string, number>>({});
const categorySpecimenCountMap = ref<Record<string, number>>({});
const expandedMuseum = ref<string | null>(null);

// 馆弹窗
const museumDialogVisible = ref(false);
const museumFormRef = ref();
const editMuseum = ref<any>(null);
const museumForm = reactive({
  // icon: '🌿',
  name: "",
  description: "",
});
const museumRules = {
  name: [{ required: true, message: "请输入馆名称", trigger: "blur" }],
};

// 分类弹窗
const categoryDialogVisible = ref(false);
const categoryFormRef = ref();
const editCategory = ref<any>(null);
const currentMuseumId = ref<string | null>(null);
const categoryForm = reactive({
  name: "",
  description: "",
});
const categoryRules = {
  name: [{ required: true, message: "请输入分类名称", trigger: "blur" }],
};

// 删除弹窗
const deleteDialogVisible = ref(false);
const deleteTarget = reactive({
  type: "museum" as "museum" | "category",
  id: "",
  museumId: "",
  name: "",
});

// 加载馆列表
async function loadMuseums() {
  try {
    const res: any = await getMuseumAll();
    if (res.code === 200 && res.data) {
      museumList.value = res.data;
      // 默认展开第一个馆
      if (museumList.value.length > 0 && !expandedMuseum.value) {
        expandedMuseum.value = museumList.value[0].museumId;
      }
    }
  } catch (error) {
    console.error("加载馆列表失败", error);
  }
}

// 获取馆的标本数量（实际应从API获取，这里用0占位）
function getSpecimenCount(museumId: string) {
  return specimenCountMap.value[museumId] || 0;
}

// 获取分类的标本数量
function getCategorySpecimenCount(categoryId: string) {
  return categorySpecimenCountMap.value[categoryId] || 0;
}

// 展开/收起馆
function toggleMuseum(museumId: string) {
  expandedMuseum.value = expandedMuseum.value === museumId ? null : museumId;
}

// 打开新增馆弹窗
function openAddMuseum() {
  editMuseum.value = null;
  // museumForm.icon = '🌿'
  museumForm.name = "";
  museumForm.description = "";
  museumDialogVisible.value = true;
}

// 打开编辑馆弹窗
function openEditMuseum(museum: any) {
  editMuseum.value = museum;
  // museumForm.icon = museum.icon || '🌿'
  museumForm.name = museum.museumName;
  museumForm.description = museum.description || "";
  museumDialogVisible.value = true;
}

// 保存馆
async function saveMuseum() {
  const valid = await museumFormRef.value.validate().catch(() => false);
  if (!valid) return;

  try {
    if (editMuseum.value) {
      await updateMuseum({
        id: editMuseum.value.museumId,
        // icon: museumForm.icon,
        name: museumForm.name,
        description: museumForm.description,
      });
      ElMessage.success("修改成功");
    } else {
      await addMuseum({
        // icon: museumForm.icon,
        name: museumForm.name,
        description: museumForm.description,
      });
      ElMessage.success("创建成功");
    }
    museumDialogVisible.value = false;
    loadMuseums();
  } catch (error: any) {
    ElMessage.error(error?.message || "操作失败");
  }
}

// 确认删除馆
function confirmDeleteMuseum(museum: any) {
  deleteTarget.type = "museum";
  deleteTarget.id = museum.museumId;
  deleteTarget.name = museum.museumName;
  deleteDialogVisible.value = true;
}

// 打开新增分类弹窗
function openAddCategory(museumId: string) {
  currentMuseumId.value = museumId;
  editCategory.value = null;
  categoryForm.name = "";
  categoryForm.description = "";
  categoryDialogVisible.value = true;
}

// 打开编辑分类弹窗
function openEditCategory(museumId: string, cat: any) {
  currentMuseumId.value = museumId;
  editCategory.value = cat;
  categoryForm.name = cat.categoryName;
  categoryForm.description = cat.description || "";
  categoryDialogVisible.value = true;
}

// 保存分类
async function saveCategory() {
  const valid = await categoryFormRef.value.validate().catch(() => false);
  if (!valid) return;
  try {
    if (editCategory.value) {
      await updateCategory({
        id: editCategory.value.categoryId,
        name: categoryForm.name,
        description: categoryForm.description,
      });
      ElMessage.success("修改成功");
    } else {
      await addCategory({
        museumId: currentMuseumId.value,
        name: categoryForm.name,
        description: categoryForm.description,
      });
      ElMessage.success("添加成功");
    }
    categoryDialogVisible.value = false;
    loadMuseums();
  } catch (error: any) {
    ElMessage.error(error?.message || "操作失败");
  }
}

// 确认删除分类
function confirmDeleteCategory(museumId: string, cat: any) {
  deleteTarget.type = "category";
  deleteTarget.id = cat.categoryId;
  deleteTarget.museumId = museumId;
  deleteTarget.name = cat.categoryName;
  deleteDialogVisible.value = true;
}

// 执行删除
async function doDelete() {
  try {
    if (deleteTarget.type === "museum") {
      await delMuseum(deleteTarget.id);
      ElMessage.success("删除成功");
    } else {
      await delCategory(deleteTarget.id);
      ElMessage.success("删除成功");
    }
    deleteDialogVisible.value = false;
    loadMuseums();
  } catch (error: any) {
    ElMessage.error(error?.message || "删除失败");
  }
}

onMounted(() => {
  loadMuseums();
});
</script>

<style scoped>
.museum-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

/* 页面头部 */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
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

/* 馆列表 */
.museum-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.museum-card {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.08);
}

/* 馆头部 */
.museum-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  cursor: pointer;
  transition: background 0.2s;
}

.museum-header:hover {
  background: #fafafa;
}

.museum-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.museum-info {
  flex: 1;
  min-width: 0;
}

.museum-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.museum-name {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

.museum-desc {
  margin: 0;
  font-size: 13px;
  color: #888;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.museum-actions {
  display: flex;
  align-items: center;
  gap: 0;

  button {
    font-size: 18px;
    margin-left: 0;
  }
}

.expand-icon {
  color: #9ca3af;
  transition: transform 0.2s;
  margin-left: 8px;
}

.expand-icon.rotated {
  transform: rotate(90deg);
}

/* 分类区域 */
.category-section {
  padding: 0 20px 20px;
  border-top: 1px solid #f0f0f0;
}

.category-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
}

.category-label {
  font-size: 13px;
  font-weight: 500;
  color: #888;
}

.category-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
  background: #f8faf8;
  border-radius: 12px;
  color: #ccc;
}

.category-empty p {
  margin: 8px 0 0;
  font-size: 13px;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 12px;
}

@media (min-width: 768px) {
  .category-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.category-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: #f8faf8;
  border: 1px solid #eef0ee;
  border-radius: 12px;
  transition: background 0.2s;
}

.category-item:hover {
  background: #f0f4f0;
}

.category-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: #e8f5e9;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2d6a4f;
  flex-shrink: 0;
}

.category-info {
  flex: 1;
  min-width: 0;
}

.category-name {
  font-size: 14px;
  font-weight: 500;
  color: #222;
  margin-bottom: 2px;
}

.category-meta {
  font-size: 12px;
  color: #888;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.category-actions {
  display: flex;
  gap: 0;
  button {
    font-size: 18px;
    margin-left: 0;
  }
}

/* 图标选择器 */
.icon-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.icon-option {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  cursor: pointer;
  background: #f5f5f5;
  border: 2px solid transparent;
  transition: all 0.2s;
}

.icon-option:hover {
  background: #e8f5e9;
}

.icon-option.selected {
  background: #e8f5e9;
  border-color: #2d6a4f;
}

/* 删除确认 */
.delete-confirm {
  text-align: center;
  padding: 8px 0;
}

.delete-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #fee2e2;
  color: #ef4444;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
}

.delete-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 8px;
}

.delete-warning {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.delete-warning span {
  color: #ef4444;
  font-size: 12px;
}
</style>
