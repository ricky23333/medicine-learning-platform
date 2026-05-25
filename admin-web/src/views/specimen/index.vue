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

    <!-- 左右布局 -->
    <div class="content-layout">
      <!-- 左侧目录树 -->
      <div class="left-panel">
        <div class="panel-title">标本目录</div>
        <el-tree-v2
          ref="treeRef"
          :data="treeData"
          :props="{ label: 'name', children: 'children' }"
          :height="400"
          v-model:expanded-keys="defaultExpandedKeys"
          current-node-key=""
          highlight-current
          :expand-on-click-node="false"
          @node-click="onTreeNodeClick"
        />
      </div>

      <!-- 右侧标本列表 -->
      <div class="right-panel">
        <!-- 搜索栏 -->
        <div class="search-bar" v-if="activeCategory">
          <el-input
            v-model="queryParams.specimenName"
            placeholder="搜索标本名称"
            clearable
            style="width: 240px"
            @keyup.enter="handleQuery"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </div>
        <!-- 标本卡片网格 -->
        <div v-if="!activeCategory" class="empty-state">
          <div class="empty-icon">🔬</div>
          <p class="empty-text">请从左侧选择一个分类</p>
        </div>
        <template v-else>
          <div class="section-header">
            <span class="section-title">{{ selectedNodeName }}</span>
            <span class="section-count">({{ total }}个标本)</span>
          </div>
          <div v-if="specimenList.length === 0 && !loading" class="empty-state">
            <div class="empty-icon">🔬</div>
            <p class="empty-text">该分类下暂无标本</p>
          </div>
          <div v-else class="specimen-grid">
            <div
              v-for="item in specimenList"
              :key="item.specimenId"
              class="specimen-card"
              @click="openDetail(item)"
            >
              <div class="card-image">
                <img
                  v-if="getCoverImage(item)"
                  :src="getCoverImage(item)"
                  :alt="item.specimenName"
                />
                <div v-else class="image-placeholder">
                  <el-icon :size="32"><Picture /></el-icon>
                </div>
                <div class="image-count-badge">{{ getApprovedImages(item).length }}张图</div>
              </div>
              <div class="card-body">
                <div class="specimen-name">{{ item.specimenName }}</div>
                <div class="specimen-latin" v-if="item.latinName">{{ item.latinName }}</div>
              </div>
            </div>
          </div>
          <!-- 分页 -->
          <pagination
            v-if="total > 0"
            :total="total"
            v-model:page="queryParams.pageNum"
            v-model:limit="queryParams.pageSize"
            @pagination="loadSpecimensByCategory"
          />
        </template>
      </div>
    </div>

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
          <div v-if="!currentSpecimen?.images?.length" class="images-empty">
            <el-icon :size="32"><Picture /></el-icon>
            <p>暂无图片</p>
          </div>
          <div v-else class="image-list">
            <div
              v-for="img in currentSpecimen?.images"
              :key="img.imageId"
              class="image-item"
              :class="{ selected: selectedImageId === img.imageId }"
              @click="selectImage(img)"
            >
              <el-image
                :src="img.thumbnailUrl || img.imageUrl"
                :preview-src-list="currentSpecimen?.images?.map(i => i.imageUrl)"
                fit="cover"
                class="image-thumb"
              />
              <div class="image-info">
                <div class="image-uploader">上传者：{{ img.creatorNickName || '-' }}</div>
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
                <div class="image-remark">
                  <span class="remark-label">备注：</span>
                  <span v-if="editingImageId !== img.imageId">{{ img.auditRemark || '-' }}</span>
                  <el-input
                    v-else
                    v-model="editRemark"
                    size="small"
                    style="width: 120px"
                    @click.stop
                    @keyup.enter="saveImageRemark(img)"
                    @blur="saveImageRemark(img)"
                  />
                </div>
              </div>
              <div class="image-actions" v-if="canDeleteImage(img)">
                <template v-if="img.auditStatus === '0' && isAdmin">
                  <el-button size="small" type="success" @click.stop="auditImage(img, '1')"
                    >通过</el-button
                  >
                  <el-button size="small" type="danger" plain @click.stop="auditImage(img, '2')"
                    >拒绝</el-button
                  >
                </template>
                <el-button
                  v-if="canEditImageRemark() && editingImageId !== img.imageId"
                  size="small"
                  plain
                  @click.stop="startEditRemark(img)"
                >
                  <el-icon><Edit /></el-icon>
                </el-button>
                <el-button size="small" type="danger" plain @click.stop="confirmDeleteImage(img)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
          </div>
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
            <span class="info-label">所属目录</span>
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
            <div class="info-remark" v-if="!editingSpecimenRemark">
              <span>{{ currentSpecimen?.remark || '暂无备注' }}</span>
              <el-button
                v-if="canEditImageRemark()"
                link
                type="primary"
                size="small"
                style="margin-left: 8px"
                @click="startEditSpecimenRemark"
              >
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
            </div>
            <div v-else class="remark-edit">
              <el-input
                v-model="specimenRemarkText"
                type="textarea"
                :rows="3"
                placeholder="请输入备注信息"
                style="margin-bottom: 8px"
              />
              <div class="remark-edit-actions">
                <el-button size="small" type="primary" @click="saveSpecimenRemark">保存</el-button>
                <el-button size="small" @click="cancelEditSpecimenRemark">取消</el-button>
              </div>
            </div>
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
        <el-form-item label="所属目录" prop="museumId">
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
  import { ref, reactive, computed, onMounted, nextTick } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import {
    Plus,
    Delete,
    Picture,
    Clock,
    ArrowRight,
    FolderOpened,
    Check,
    Folder,
    Search,
    Edit
  } from '@element-plus/icons-vue'
  import {
    listSpecimen,
    getSpecimen,
    addSpecimen,
    updateSpecimen,
    delSpecimen,
    uploadSpecimenImage,
    delSpecimenImage,
    auditSpecimenImage,
    updateImageRemark
  } from '@/api/specimen'
  import { getMuseumAll } from '@/api/museum'
  import { listCategory } from '@/api/museum'
  import useUserStore from '@/store/modules/user'

  const userStore = useUserStore()
  const isAdmin = computed(() => userStore.roles?.includes('admin'))
  const isVipTeacher = computed(
    () => userStore.appUser?.userType === 'teacher' && userStore.appUser?.vipStatus === '2'
  )

  function canDeleteImage(img: any) {
    if (isAdmin.value) return true
    if (!img.createBy || !userStore.userId) return false
    return String(userStore.userId) === String(img.createBy)
  }

  function canEditImageRemark() {
    return isAdmin.value || isVipTeacher.value
  }

  // ========== 数据 ==========
  const loading = ref(false)
  const specimenList = ref<any[]>([])
  const total = ref(0)
  const museumOptions = ref<any[]>([])
  const formCategoryOptions = ref<any[]>([])

  // 查询参数
  const queryParams = reactive({
    pageNum: 1,
    pageSize: 15,
    specimenName: '',
    museumId: undefined as number | undefined,
    categoryId: undefined as number | undefined
  })

  // 树形选择器
  const treeRef = ref()
  const treeData = ref<any[]>([])
  const defaultExpandedKeys = ref<any[]>([])
  const activeCategory = ref<string | null>(null)
  const selectedNodeName = ref<string>('')
  const currentMuseumId = ref<string | null>(null)

  // 详情弹窗
  const detailVisible = ref(false)
  const currentSpecimen = ref<any>(null)
  const selectedImageId = ref<string | null>(null)
  const editingImageId = ref<string | null>(null)
  const editRemark = ref('')
  const editingSpecimenRemark = ref(false)
  const specimenRemarkText = ref('')

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

  // 获取标本目录树
  async function loadMuseumTree() {
    try {
      const res: any = await getMuseumAll()
      if (res.code === 200 && res.data) {
        museumOptions.value = res.data
        // 构建el-tree-v2需要的树形结构
        treeData.value = res.data.map((museum: any) => ({
          id: museum.museumId,
          name: museum.museumName,
          type: 'museum',
          children: (museum.categories || []).map((cat: any) => ({
            id: museum.museumId + '_' + cat.categoryId,
            categoryId: cat.categoryId,
            name: cat.categoryName,
            type: 'category',
            museumId: museum.museumId,
            museumName: museum.museumName
          }))
        }))

        // 默认展开第一个根节点并选中第一个分类
        if (treeData.value.length > 0) {
          const firstMuseum = treeData.value[0]
          defaultExpandedKeys.value = [firstMuseum.id]
          if (firstMuseum.children && firstMuseum.children.length > 0) {
            const firstCategory = firstMuseum.children[0]
            nextTick(() => {
              treeRef.value?.setExpandedKeys(defaultExpandedKeys.value)
              treeRef.value?.setCurrentKey(firstCategory.id)
              onTreeNodeClick(firstCategory)
            })
          }
        }
      }
    } catch (error) {
      console.error('加载标本目录失败', error)
    }
  }

  // 树节点点击
  function onTreeNodeClick(data: any) {
    if (data.type === 'category') {
      activeCategory.value = String(data.categoryId)
      selectedNodeName.value = data.museumName + ' / ' + data.name
      currentMuseumId.value = String(data.museumId)
      queryParams.categoryId = data.categoryId
      queryParams.museumId = data.museumId
      queryParams.pageNum = 1
      loadSpecimensByCategory()
    }
  }

  // 根据分类加载标本
  async function loadSpecimensByCategory() {
    if (!queryParams.categoryId) return
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

  // 获取博物馆下标本总数
  function getMuseumSpecimenCount(museum: any) {
    if (!museum.categories) return 0
    return museum.categories.reduce((sum: number, cat: any) => sum + (cat.specCount || 0), 0)
  }

  // 搜索
  function handleQuery() {
    queryParams.pageNum = 1
    loadSpecimensByCategory()
  }

  // 重置搜索
  function resetQuery() {
    queryParams.specimenName = ''
    queryParams.pageNum = 1
    loadSpecimensByCategory()
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
    form.museumId = currentMuseumId.value ? Number(currentMuseumId.value) : undefined
    form.categoryId = activeCategory.value ? Number(activeCategory.value) : undefined
    form.specimenName = ''
    form.latinName = ''
    form.remark = ''
    if (form.museumId) {
      onFormMuseumChange(form.museumId)
    }
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
      loadMuseumTree()
      loadSpecimensByCategory()
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
          loadMuseumTree()
          loadSpecimensByCategory()
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
    return approved?.thumbnailUrl || approved?.imageUrl || item.images[0]?.imageUrl || null
  }

  // 获取已审核图片
  function getApprovedImages(item: any) {
    if (!item.images) return []
    return item.images.filter((img: any) => img.auditStatus === '1')
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

    const maxSize = 25 * 1024 * 1024
    if (file.size > maxSize) {
      ElMessage.error('文件大小不能超过25MB')
      target.value = ''
      return
    }

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('specimenId', String(currentSpecimen.value.specimenId))
      formData.append('isCover', String(false))
      formData.append('createBy', userStore.userId || '')

      await uploadSpecimenImage(formData)
      ElMessage.success('上传成功')
      openDetail(currentSpecimen.value)
      loadSpecimensByCategory()
    } catch (error: any) {
      ElMessage.error(error?.message || '上传失败')
    }
    target.value = ''
  }

  // 审核图片
  async function auditImage(img: any, auditStatus: string) {
    try {
      await auditSpecimenImage({ imageId: img.imageId, auditStatus })
      ElMessage.success(auditStatus === '1' ? '已通过' : '已拒绝')
      if (currentSpecimen.value) {
        openDetail(currentSpecimen.value)
      }
      loadSpecimensByCategory()
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
          if (currentSpecimen.value) {
            openDetail(currentSpecimen.value)
          }
          loadSpecimensByCategory()
        } catch (error: any) {
          ElMessage.error(error?.message || '删除失败')
        }
      })
      .catch(() => {})
  }

  // 选择图片
  function selectImage(img: any) {
    selectedImageId.value = img.imageId
  }

  // 开始编辑备注
  function startEditRemark(img: any) {
    editingImageId.value = img.imageId
    editRemark.value = img.auditRemark || ''
  }

  // 保存图片备注
  async function saveImageRemark(img: any) {
    if (editingImageId.value !== img.imageId) return
    try {
      await updateImageRemark({ imageId: img.imageId, auditRemark: editRemark.value })
      ElMessage.success('修改成功')
      editingImageId.value = null
      if (currentSpecimen.value) {
        openDetail(currentSpecimen.value)
      }
    } catch (error: any) {
      ElMessage.error(error?.message || '修改失败')
    }
  }

  // 开始编辑标本备注
  function startEditSpecimenRemark() {
    specimenRemarkText.value = currentSpecimen.value?.remark || ''
    editingSpecimenRemark.value = true
  }

  // 取消编辑标本备注
  function cancelEditSpecimenRemark() {
    editingSpecimenRemark.value = false
    specimenRemarkText.value = ''
  }

  // 保存标本备注
  async function saveSpecimenRemark() {
    if (!currentSpecimen.value) return
    try {
      await updateSpecimen({
        specimenId: currentSpecimen.value.specimenId,
        remark: specimenRemarkText.value
      })
      ElMessage.success('修改成功')
      editingSpecimenRemark.value = false
      openDetail(currentSpecimen.value)
      loadSpecimensByCategory()
    } catch (error: any) {
      ElMessage.error(error?.message || '修改失败')
    }
  }

  // ========== 生命周期 ==========
  onMounted(() => {
    loadMuseumTree()
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

  /* 左右布局 */
  .content-layout {
    display: flex;
    gap: 20px;
    height: calc(100vh - 180px);
  }

  .left-panel {
    width: 280px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.08);
    padding: 16px;
    flex-shrink: 0;
  }

  .panel-title {
    font-size: 14px;
    font-weight: 600;
    color: #374151;
    margin-bottom: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid #f0f0f0;
  }

  .right-panel {
    flex: 1;
    min-width: 0;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.08);
    padding: 20px;
    overflow-y: auto;
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
  }

  .section-title {
    font-size: 15px;
    font-weight: 600;
    color: #1a1a1a;
  }

  .section-count {
    font-size: 13px;
    color: #888;
  }

  /* 空状态 */
  .empty-state {
    text-align: center;
    padding: 80px 0;
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

  /* 搜索栏 */
  .search-bar {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid #f0f0f0;
  }

  /* 标本卡片网格 */
  .specimen-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
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
  }

  .image-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #d0d0d0;
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
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .museum-row.expanded {
    background: #e8f5e9;
  }

  .row-icon {
    color: #2d6a4f;
    font-size: 18px;
  }

  .row-name {
    font-size: 14px;
    font-weight: 600;
    color: #1a1a1a;
  }

  .row-count {
    font-size: 12px;
    color: #888;
  }

  .expand-icon {
    margin-left: auto;
    transition: transform 0.2s;
    color: #888;
  }

  .expand-icon.expanded {
    transform: rotate(90deg);
  }

  /* 分类列表 */
  .category-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding-left: 36px;
    margin-top: 4px;
  }

  .category-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.2s;
  }

  .category-row:hover {
    background: #f0f4f0;
  }

  .category-row.active {
    background: #e8f5e9;
  }

  .category-row .row-icon {
    color: #40916c;
    font-size: 16px;
  }

  .category-row .row-name {
    font-size: 13px;
    font-weight: 500;
    color: #333;
  }

  .category-row .row-count {
    font-size: 11px;
  }

  .check-icon {
    margin-left: auto;
    color: #2d6a4f;
  }

  .empty-categories {
    padding: 12px;
    text-align: center;
    color: #aaa;
    font-size: 13px;
  }

  .category-info {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #555;
  }

  .category-name {
    font-size: 14px;
  }

  .category-count {
    font-size: 12px;
    color: #888;
  }

  .check-icon {
    color: #2d6a4f;
  }

  /* 标本区域 */
  .specimen-section {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.08);
    padding: 20px;
  }

  .section-header {
    margin-bottom: 16px;
  }

  .section-title {
    font-size: 15px;
    font-weight: 500;
    color: #374151;
  }

  /* 空状态 */
  .empty-state {
    text-align: center;
    padding: 60px 0;
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
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
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
  }

  .image-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #d0d0d0;
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
    cursor: pointer;
    border: 2px solid transparent;
    transition: all 0.2s;
  }

  .image-item:hover {
    background: #f0f4f0;
  }

  .image-item.selected {
    border-color: #2d6a4f;
    background: #e8f5e9;
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

  .image-remark {
    margin-top: 4px;
    font-size: 12px;
    color: #555;
  }

  .remark-label {
    color: #888;
  }

  .image-actions {
    display: flex;
    flex-direction: column;
    gap: 4px;
    justify-content: flex-end;
    align-items: flex-end;
  }

  .image-actions button {
    width: 60px;
  }

  .upload-btn {
    width: 100%;
    margin-top: 12px;
    border-style: dashed;
  }

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
    display: flex;
    align-items: flex-start;
  }

  .remark-edit {
    width: 100%;
  }

  .remark-edit-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }

  .dialog-footer {
    display: flex;
    justify-content: space-between;
  }
</style>
