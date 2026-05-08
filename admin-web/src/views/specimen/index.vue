<!--
 * @Author: rickyluo
 * @Date: 2024-04-28
 * @Description: 标本信息管理
-->
<template>
  <div class="app-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">标本信息管理</h1>
        <p class="page-desc">共 {{ total }} 个标本</p>
      </div>
      <el-button type="primary" @click="openAddSpecimen" v-hasPermi="['admin:specimen:add']">
        <el-icon><Plus /></el-icon>
        新增标本
      </el-button>
    </div>

    <!-- 搜索筛选栏 -->
    <div class="filter-bar">
      <el-input
        v-model="queryParams.specimenName"
        placeholder="搜索标本名称..."
        clearable
        style="width: 240px"
        @keyup.enter="handleQuery"
      >
        <template #prefix
          ><el-icon><Search /></el-icon
        ></template>
      </el-input>
      <el-select
        v-model="queryParams.museumId"
        placeholder="选择标本目录"
        clearable
        style="width: 200px"
        @change="onMuseumChange"
      >
        <el-option
          v-for="m in museumOptions"
          :key="m.museumId"
          :label="m.museumName"
          :value="m.museumId"
        />
      </el-select>
      <el-select
        v-model="queryParams.categoryId"
        placeholder="选择分类"
        clearable
        style="width: 200px"
        :disabled="!queryParams.museumId"
      >
        <el-option
          v-for="c in categoryOptions"
          :key="c.categoryId"
          :label="c.categoryName"
          :value="c.categoryId"
        />
      </el-select>
      <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
      <el-button icon="Refresh" @click="resetQuery">重置</el-button>
    </div>

    <!-- 标本卡片网格 -->
    <div v-if="specimenList.length === 0 && !loading" class="empty-state">
      <div class="empty-icon">🔬</div>
      <p class="empty-text">暂无匹配标本</p>
    </div>
    <div v-else class="specimen-grid">
      <div
        v-for="item in specimenList"
        :key="item.specimenId"
        class="specimen-card"
        @click="openDetail(item)"
      >
        <div class="card-image">
          <img v-if="getCoverImage(item)" :src="getCoverImage(item)" :alt="item.specimenName" />
          <div v-else class="image-placeholder">
            <el-icon :size="32"><Picture /></el-icon>
          </div>
          <!-- 待审核图片数量徽章 -->
          <div v-if="getPendingImages(item).length > 0" class="pending-badge">
            <el-icon><Clock /></el-icon>
            {{ getPendingImages(item).length }}待审
          </div>
          <!-- 已审核图片数量 -->
          <div class="image-count-badge">{{ getApprovedImages(item).length }}张图</div>
        </div>
        <div class="card-body">
          <div class="specimen-name">{{ item.specimenName }}</div>
          <div class="specimen-latin" v-if="item.latinName">{{ item.latinName }}</div>
          <div class="specimen-tags">
            <span class="tag-category">{{ item.category?.categoryName || '-' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <pagination
      v-if="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- ========== 标本详情弹窗 ========== -->
    <el-dialog
      v-model="detailVisible"
      :title="currentSpecimen?.specimenName"
      width="800px"
      :close-on-click-modal="false"
    >
      <div class="detail-grid">
        <!-- 左侧：图片管理 -->
        <div class="detail-images">
          <div class="section-label">图片管理</div>
          <div v-if="currentSpecimen?.images?.length === 0" class="images-empty">
            <el-icon :size="32"><Picture /></el-icon>
            <p>暂无图片</p>
          </div>
          <div v-else class="image-list">
            <div v-for="img in currentSpecimen?.images" :key="img.imageId" class="image-item">
              <el-image
                :src="img.imageUrl"
                :preview-src-list="currentSpecimen?.images?.map(i => i.imageUrl)"
                fit="cover"
                class="image-thumb"
              />
              <div class="image-info">
                <div class="image-uploader">上传者：{{ img.createBy || '-' }}</div>
                <div class="image-date">{{ img.createTime }}</div>
                <div class="image-status">
                  <el-tag v-if="img.auditStatus === '1'" type="success" size="small">已审核</el-tag>
                  <el-tag v-else-if="img.auditStatus === '0'" type="warning" size="small"
                    >待审核</el-tag
                  >
                  <el-tag v-else-if="img.auditStatus === '2'" type="danger" size="small"
                    >已拒绝</el-tag
                  >
                </div>
              </div>
              <div class="image-actions" v-if="isAdmin">
                <template v-if="img.auditStatus === '0'">
                  <el-button size="small" type="success" @click="auditImage(img, '1')"
                    >通过</el-button
                  >
                  <el-button size="small" type="danger" plain @click="auditImage(img, '2')"
                    >拒绝</el-button
                  >
                </template>
                <el-button size="small" type="danger" plain @click="confirmDeleteImage(img)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
          </div>
          <!-- 上传按钮 -->
          <el-button class="upload-btn" type="success" plain @click="triggerUpload">
            <el-icon><Plus /></el-icon>
            上传图片
          </el-button>
          <input
            ref="fileInputRef"
            type="file"
            accept="image/*"
            style="display: none"
            @change="handleFileChange"
          />
        </div>

        <!-- 右侧：标本信息 -->
        <div class="detail-info">
          <div class="section-label">基本信息</div>
          <div class="info-row">
            <span class="info-label">所属标本目录</span>
            <span class="info-value">{{ currentSpecimen?.museum?.museumName || '-' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">分类</span>
            <span class="info-value">{{ currentSpecimen?.category?.categoryName || '-' }}</span>
          </div>
          <div class="info-row" v-if="currentSpecimen?.latinName">
            <span class="info-label">拉丁学名</span>
            <span class="info-value latin">{{ currentSpecimen?.latinName }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">备注信息</span>
            <div class="info-remark">{{ currentSpecimen?.remark || '暂无备注' }}</div>
          </div>
          <div class="info-row" v-if="currentSpecimen?.createTime">
            <span class="info-label">创建时间</span>
            <span class="info-value">{{ currentSpecimen?.createTime }}</span>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button
            type="danger"
            plain
            @click="confirmDeleteSpecimen"
            v-hasPermi="['admin:specimen:remove']"
          >
            <el-icon><Delete /></el-icon>
            删除此标本
          </el-button>
          <el-button @click="detailVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- ========== 新增/编辑标本弹窗 ========== -->
    <el-dialog
      v-model="formVisible"
      :title="editSpecimen ? '编辑标本' : '新增标本'"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="所属标本目录" prop="museumId">
          <el-select
            v-model="form.museumId"
            placeholder="选择目录"
            style="width: 100%"
            @change="onFormMuseumChange"
          >
            <el-option
              v-for="m in museumOptions"
              :key="m.museumId"
              :label="m.museumName"
              :value="m.museumId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="分类" prop="categoryId">
          <el-select
            v-model="form.categoryId"
            placeholder="选择分类"
            style="width: 100%"
            :disabled="!form.museumId"
          >
            <el-option
              v-for="c in formCategoryOptions"
              :key="c.categoryId"
              :label="c.categoryName"
              :value="c.categoryId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="标本名称" prop="specimenName">
          <el-input v-model="form.specimenName" placeholder="如：人参" />
        </el-form-item>
        <!-- <el-form-item label="拉丁学名" prop="latinName">
          <el-input
            v-model="form.latinName"
            placeholder="如：Panax ginseng C. A. Mey."
            style="font-style: italic"
          />
        </el-form-item> -->
        <el-form-item label="备注信息" prop="remark">
          <el-input
            v-model="form.remark"
            type="textarea"
            :rows="3"
            placeholder="标本详细描述、功效等信息..."
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" @click="saveSpecimen">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, onMounted } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { Plus, Search, Delete, Picture, Clock } from '@element-plus/icons-vue'
  import {
    listSpecimen,
    getSpecimen,
    addSpecimen,
    updateSpecimen,
    delSpecimen,
    addSpecimenImage,
    delSpecimenImage,
    auditSpecimenImage
  } from '@/api/specimen'
  import { getMuseumAll } from '@/api/museum'
  import { listCategory } from '@/api/museum'
  import useUserStore from '@/store/modules/user'

  const userStore = useUserStore()
  const isAdmin = computed(
    () =>
      userStore.roles?.includes('ROLE_ADMIN') ||
      userStore.permissions?.includes('admin:specimen:edit')
  )

  // ========== 数据 ==========
  const loading = ref(false)
  const specimenList = ref<any[]>([])
  const total = ref(0)
  const museumOptions = ref<any[]>([])
  const categoryOptions = ref<any[]>([])
  const formCategoryOptions = ref<any[]>([])

  // 查询参数
  const queryParams = reactive({
    pageNum: 1,
    pageSize: 12,
    specimenName: '',
    museumId: undefined as number | undefined,
    categoryId: undefined as number | undefined
  })

  // 详情弹窗
  const detailVisible = ref(false)
  const currentSpecimen = ref<any>(null)

  // 表单弹窗
  const formVisible = ref(false)
  const formRef = ref()
  const editSpecimen = ref<any>(null)
  const form = reactive({
    museumId: undefined as number | undefined,
    categoryId: undefined as number | undefined,
    specimenName: '',
    latinName: '',
    remark: ''
  })
  const rules = {
    museumId: [{ required: true, message: '请选择所属标本目录', trigger: 'change' }],
    categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }],
    specimenName: [{ required: true, message: '请输入标本名称', trigger: 'blur' }]
  }

  // 文件上传
  const fileInputRef = ref<HTMLInputElement>()

  // ========== 方法 ==========

  // 获取标本列表
  async function getList() {
    loading.value = true
    try {
      const res: any = await listSpecimen(queryParams)
      if (res.code === 200) {
        specimenList.value = res.rows || []
        total.value = res.total || 0
      }
    } catch (error) {
      console.error('加载标本列表失败', error)
    } finally {
      loading.value = false
    }
  }

  // 获取标本目录列表
  async function loadMuseums() {
    try {
      const res: any = await getMuseumAll()
      if (res.code === 200 && res.data) {
        museumOptions.value = res.data
      }
    } catch (error) {
      console.error('加载标本目录失败', error)
    }
  }

  // 获取分类列表
  async function loadCategories(museumId?: number) {
    try {
      const res: any = await listCategory({ museumId })
      if (res.code === 200) {
        categoryOptions.value = res.rows || []
      }
    } catch (error) {
      console.error('加载分类失败', error)
    }
  }

  // 搜索
  function handleQuery() {
    queryParams.pageNum = 1
    getList()
  }

  // 重置搜索
  function resetQuery() {
    queryParams.specimenName = ''
    queryParams.museumId = undefined
    queryParams.categoryId = undefined
    queryParams.pageNum = 1
    categoryOptions.value = []
    getList()
  }

  // 标本目录选择变化
  function onMuseumChange(museumId: number | undefined) {
    queryParams.categoryId = undefined
    if (museumId) {
      loadCategories(museumId)
    } else {
      categoryOptions.value = []
    }
  }

  // 表单中标本目录变化
  function onFormMuseumChange(museumId: number | undefined) {
    form.categoryId = undefined
    if (museumId) {
      const museum = museumOptions.value.find((m: any) => m.museumId === museumId)
      formCategoryOptions.value = museum?.categories || []
    } else {
      formCategoryOptions.value = []
    }
  }

  // 打开新增标本弹窗
  function openAddSpecimen() {
    editSpecimen.value = null
    form.museumId = undefined
    form.categoryId = undefined
    form.specimenName = ''
    form.latinName = ''
    form.remark = ''
    formCategoryOptions.value = []
    formVisible.value = true
  }

  // 打开详情
  async function openDetail(item: any) {
    try {
      const res: any = await getSpecimen(item.specimenId)
      if (res.code === 200) {
        currentSpecimen.value = res.data
        detailVisible.value = true
      }
    } catch (error) {
      ElMessage.error('加载标本详情失败')
    }
  }

  // 保存标本
  async function saveSpecimen() {
    const valid = await formRef.value.validate().catch(() => false)
    if (!valid) return
    try {
      if (editSpecimen.value) {
        await updateSpecimen({ specimenId: editSpecimen.value.specimenId, ...form })
        ElMessage.success('修改成功')
      } else {
        await addSpecimen(form)
        ElMessage.success('创建成功')
      }
      formVisible.value = false
      getList()
    } catch (error: any) {
      ElMessage.error(error?.message || '操作失败')
    }
  }

  // 确认删除标本
  function confirmDeleteSpecimen() {
    if (!currentSpecimen.value) return
    ElMessageBox.confirm(
      `确定要删除标本「${currentSpecimen.value.specimenName}」吗？此操作将同时删除所有关联图片，不可恢复！`,
      '确认删除',
      { type: 'warning' }
    )
      .then(async () => {
        try {
          await delSpecimen(currentSpecimen.value.specimenId)
          ElMessage.success('删除成功')
          detailVisible.value = false
          getList()
        } catch (error: any) {
          ElMessage.error(error?.message || '删除失败')
        }
      })
      .catch(() => {})
  }

  // 获取封面图
  function getCoverImage(item: any) {
    if (!item.images || item.images.length === 0) return null
    const approved = item.images.find((img: any) => img.auditStatus === '1')
    return approved?.imageUrl || item.images[0]?.imageUrl || null
  }

  // 获取已审核图片
  function getApprovedImages(item: any) {
    if (!item.images) return []
    return item.images.filter((img: any) => img.auditStatus === '1')
  }

  // 获取待审核图片
  function getPendingImages(item: any) {
    if (!item.images) return []
    return item.images.filter((img: any) => img.auditStatus === '0')
  }

  // 触发上传
  function triggerUpload() {
    fileInputRef.value?.click()
  }

  // 处理文件选择
  async function handleFileChange(event: Event) {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (!file || !currentSpecimen.value) return
    try {
      // 简单实现：直接提交图片URL（实际项目中应先上传到服务器获取URL）
      const imageUrl = URL.createObjectURL(file) // 演示用，实际应调用上传接口
      await addSpecimenImage({
        specimenId: currentSpecimen.value.specimenId,
        imageUrl,
        auditStatus: isAdmin.value ? '1' : '0'
      })
      ElMessage.success('上传成功')
      // 刷新详情
      openDetail(currentSpecimen.value)
      getList()
    } catch (error: any) {
      ElMessage.error(error?.message || '上传失败')
    }
    target.value = '' // 清空input
  }

  // 审核图片
  async function auditImage(img: any, auditStatus: string) {
    try {
      await auditSpecimenImage({ imageId: img.imageId, auditStatus })
      ElMessage.success(auditStatus === '1' ? '已通过' : '已拒绝')
      // 刷新详情
      if (currentSpecimen.value) {
        openDetail(currentSpecimen.value)
      }
      getList()
    } catch (error: any) {
      ElMessage.error(error?.message || '操作失败')
    }
  }

  // 确认删除图片
  function confirmDeleteImage(img: any) {
    ElMessageBox.confirm('确定要删除此图片吗？', '确认删除', { type: 'warning' })
      .then(async () => {
        try {
          await delSpecimenImage(img.imageId)
          ElMessage.success('删除成功')
          // 刷新详情
          if (currentSpecimen.value) {
            openDetail(currentSpecimen.value)
          }
          getList()
        } catch (error: any) {
          ElMessage.error(error?.message || '删除失败')
        }
      })
      .catch(() => {})
  }

  // ========== 生命周期 ==========
  onMounted(() => {
    getList()
    loadMuseums()
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

  /* 搜索筛选栏 */
  .filter-bar {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
    padding: 16px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.08);
  }

  /* 空状态 */
  .empty-state {
    text-align: center;
    padding: 60px 0;
    background: #fff;
    border-radius: 16px;
  }

  .empty-icon {
    font-size: 48px;
    margin-bottom: 12px;
  }

  .empty-text {
    font-size: 14px;
    color: #aaa;
    margin: 0;
  }

  /* 标本卡片网格 */
  .specimen-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
    margin-bottom: 20px;
  }

  .specimen-card {
    background: #fff;
    border-radius: 12px;
    overflow: hidden;
    cursor: pointer;
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.08);
    transition: all 0.2s;
  }

  .specimen-card:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
  }

  .card-image {
    position: relative;
    aspect-ratio: 4 / 3;
    background: #f8f9fa;
    overflow: hidden;
  }

  .card-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s;
  }

  .specimen-card:hover .card-image img {
    transform: scale(1.05);
  }

  .image-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #d0d0d0;
  }

  .pending-badge {
    position: absolute;
    top: 8px;
    right: 8px;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    border-radius: 20px;
    background: rgba(245, 158, 11, 0.9);
    color: #fff;
    font-size: 11px;
    font-weight: 500;
  }

  .image-count-badge {
    position: absolute;
    top: 8px;
    left: 8px;
    padding: 2px 8px;
    border-radius: 20px;
    background: rgba(0, 0, 0, 0.4);
    color: #fff;
    font-size: 11px;
  }

  .card-body {
    padding: 12px;
  }

  .specimen-name {
    font-size: 14px;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 2px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .specimen-latin {
    font-size: 11px;
    color: #888;
    font-style: italic;
    margin-bottom: 6px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .specimen-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .tag-category {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 20px;
    background: #e8f5e9;
    color: #2d6a4f;
    font-size: 11px;
  }

  /* ========== 详情弹窗 ========== */
  .detail-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }

  .section-label {
    font-size: 13px;
    font-weight: 500;
    color: #888;
    margin-bottom: 12px;
  }

  /* 左侧图片区域 */
  .detail-images {
    border-right: 1px solid #f0f0f0;
    padding-right: 24px;
  }

  .images-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 32px;
    background: #f8f9fa;
    border-radius: 12px;
    color: #ccc;
    margin-bottom: 12px;
  }

  .images-empty p {
    margin: 8px 0 0;
    font-size: 13px;
  }

  .image-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-height: 400px;
    overflow-y: auto;
  }

  .image-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    background: #f8f9fa;
    border-radius: 10px;
  }

  .image-thumb {
    width: 64px;
    height: 64px;
    border-radius: 8px;
    flex-shrink: 0;
  }

  .image-info {
    flex: 1;
    min-width: 0;
  }

  .image-uploader {
    font-size: 12px;
    color: #555;
  }

  .image-date {
    font-size: 11px;
    color: #888;
  }

  .image-status {
    margin-top: 4px;
  }

  .image-actions {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .upload-btn {
    width: 100%;
    margin-top: 12px;
    border-style: dashed;
  }

  /* 右侧信息区域 */
  .detail-info {
    padding-left: 0;
  }

  .info-row {
    margin-bottom: 14px;
  }

  .info-label {
    display: block;
    font-size: 13px;
    color: #888;
    margin-bottom: 4px;
  }

  .info-value {
    font-size: 14px;
    color: #333;
  }

  .info-value.latin {
    font-style: italic;
  }

  .info-remark {
    font-size: 13px;
    color: #444;
    line-height: 1.6;
    padding: 10px;
    background: #f8faf8;
    border-radius: 8px;
  }

  .dialog-footer {
    display: flex;
    justify-content: space-between;
  }
</style>
