<template>
  <div class="app-container app-js df fdc">
    <el-form
      class="top-form"
      :model="queryParams"
      ref="queryRef"
      :inline="true"
      v-show="showSearch"
    >
      <el-form-item label="用户名称" prop="nickname">
        <el-input
          v-model="queryParams.nickname"
          placeholder="请输入用户名称"
          clearable
          style="width: 200px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <!-- <el-form-item label="反馈类型" prop="type">
        <el-select
          v-model="queryParams.type"
          placeholder="反馈类型"
          clearable
          style="width: 200px"
        >
          <el-option label="意见反馈" value="0" />
          <el-option label="问题反馈" value="1" />
          <el-option label="其他" value="2" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="处理状态"
          clearable
          style="width: 200px"
        >
          <el-option label="待处理" value="0" />
          <el-option label="已处理" value="1" />
        </el-select>
      </el-form-item> -->
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:feedback:remove']"
        >删除</el-button>
      </el-col>
      <right-toolbar
        v-model:showSearch="showSearch"
        @queryTable="getList"
      ></right-toolbar>
    </el-row>

    <div class="f1">
      <el-table
        height="100%"
        v-loading="loading"
        :data="feedbackList"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="序号" align="center" prop="id" width="100" />
        <el-table-column label="用户名称" align="center" prop="nickname" width="150" />
        <!-- <el-table-column label="反馈类型" align="center" prop="type" width="120">
          <template #default="scope">
            <el-tag v-if="scope.row.type === '0'" type="warning">意见反馈</el-tag>
            <el-tag v-else-if="scope.row.type === '1'" type="danger">问题反馈</el-tag>
            <el-tag v-else type="info">其他</el-tag>
          </template>
        </el-table-column> -->
        <el-table-column label="反馈内容" align="center" prop="content" :show-overflow-tooltip="true" />
        <el-table-column label="联系方式" align="center" prop="contact" width="150" />
        <!-- <el-table-column label="状态" align="center" prop="status" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.status === '0'" type="warning">待处理</el-tag>
            <el-tag v-else type="success">已处理</el-tag>
          </template>
        </el-table-column> -->
        <el-table-column label="反馈时间" align="center" prop="createTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-button
              link
              type="primary"
              icon="View"
              @click="handleView(scope.row)"
              v-hasPermi="['system:feedback:query']"
            >查看</el-button>
            <el-button
              link
              type="danger"
              icon="Delete"
              @click="handleDelete(scope.row)"
              v-hasPermi="['system:feedback:remove']"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
      :selection="ids.length"
    />

    <!-- 查看反馈详情对话框 -->
    <el-dialog
      title="反馈详情"
      v-model="open"
      width="600px"
      append-to-body
    >
      <el-descriptions :column="1" border>
        <el-descriptions-item label="用户名称">{{ form.nickname }}</el-descriptions-item>
        <el-descriptions-item label="反馈类型">
          <el-tag v-if="form.type === '0'" type="warning">意见反馈</el-tag>
          <el-tag v-else-if="form.type === '1'" type="danger">问题反馈</el-tag>
          <el-tag v-else type="info">其他</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="联系方式">{{ form.contact || '无' }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag v-if="form.status === '0'" type="warning">待处理</el-tag>
          <el-tag v-else type="success">已处理</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="反馈时间">{{ parseTime(form.createTime) }}</el-descriptions-item>
        <el-descriptions-item label="反馈内容">{{ form.content }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="open = false">关 闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Feedback">
import { listFeedback, delFeedback } from '@/api/system/feedback'

const { proxy } = getCurrentInstance()
const parseTime = proxy.parseTime

const feedbackList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const multiple = ref(true)
const total = ref(0)

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 15,
    nickname: undefined,
    type: undefined,
    status: undefined
  }
})

const { queryParams, form } = toRefs(data)

/** 查询意见反馈列表 */
function getList() {
  loading.value = true
  listFeedback(queryParams.value).then(response => {
    feedbackList.value = response.rows
    total.value = response.total
    loading.value = false
  })
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm('queryRef')
  handleQuery()
}

/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
  multiple.value = !selection.length
}

/** 查看按钮操作 */
function handleView(row) {
  form.value = {
    id: row.id,
    nickname: row.nickname,
    type: row.type,
    contact: row.contact,
    status: row.status,
    content: row.content,
    createTime: row.createTime
  }
  open.value = true
}

/** 删除按钮操作 */
function handleDelete(row) {
  const feedbackIds = row.id || ids.value
  proxy.$modal
    .confirm('是否确认删除反馈编号为"' + feedbackIds + '"的数据项？')
    .then(function () {
      return delFeedback(feedbackIds)
    })
    .then(() => {
      getList()
      proxy.$modal.msgSuccess('删除成功')
    })
    .catch(() => {})
}

getList()
</script>