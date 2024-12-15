<template>
  <div>
    <div class="page-content article-list">
      <h1 class="title">模板类型</h1>
      <p class="desc" style="margin-bottom: 15px">找到 {{ dataContainer.config.total }} 条</p>
      <el-row justify="space-between" :gutter="10">
        <el-col :lg="6" :md="6" :sm="14" :xs="16">
          <el-input
            v-model="searchVal"
            :prefix-icon="Search"
            clearable
            placeholder="输入名称 回车查询"
            @keyup.enter="searchTemplateType"
          />
        </el-col>
        <el-col :lg="6" :md="6" :sm="10" :xs="6" style="display: flex; justify-content: end">
          <el-button type="primary" :icon="Plus" @click="addORedit('add', {})" v-auth="'add'"
            >创建新条目</el-button
          >
        </el-col>
      </el-row>

      <el-table
        :data="dataContainer.list"
        style="width: 100%; margin-top: 20px"
        row-key="id"
        v-loading="dataContainer.loading"
        border
      >
        <el-table-column prop="id" label="ID" width="100" show-overflow-tooltip />
        <el-table-column prop="name" label="名称" show-overflow-tooltip />
        <el-table-column prop="rank" label="排序" width="100" align="center" show-overflow-tooltip />

        <el-table-column
          prop="createdAt"
          label="添加时间"
          show-overflow-tooltip
          :formatter="formatDate"
          width="180"
          align="center"
        />
        <el-table-column fixed="right" label="操作" width="100" align="center">
          <template #default="scope">
            <el-tooltip content="编辑" placement="top">
              <el-button
                link
                :icon="EditPen"
                type="primary"
                @click="addORedit('edit', scope.row)"
              ></el-button>
            </el-tooltip>

            <el-tooltip content="删除" placement="top">
              <el-button link :icon="Delete" type="primary" @click="handleDel(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <div style="display: flex; justify-content: center; margin-top: 20px">
        <el-pagination
          size="default"
          background
          v-model:current-page="dataContainer.params.currentPage"
          :page-size="dataContainer.params.pageSize"
          :pager-count="9"
          layout="prev, pager, next, total,jumper"
          :total="dataContainer.config.total"
          :hide-on-single-page="true"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500" @close="handleClose">
      <el-form ref="ruleFormRef" :model="ruleForm" :rules="rules" label-width="auto" status-icon>
        <el-form-item label="名称" prop="name">
          <el-input v-model="ruleForm.name" />
        </el-form-item>
        <el-form-item label="排序" prop="rank">
          <el-input v-model.number="ruleForm.rank" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="resetForm(ruleFormRef)">取消</el-button>
          <el-button type="primary" @click="submitForm(ruleFormRef)"> 提交 </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { KuaituService } from '@/api/kuaituApi'
  import { format } from 'date-fns'
  import { Search, Plus, EditPen, Delete } from '@element-plus/icons-vue'
  import type { FormInstance, FormRules } from 'element-plus'

  const dataContainer = reactive({
    loading: false,
    showSearch: true,
    params: {
      currentPage: 1,
      pageSize: 10
    },
    config: {
      total: 0
    },
    list: []
  })

  const searchVal = ref('')

  onMounted(() => {
    getTemplateTypeList({ backTop: false })
  })

  // 搜索文章
  const searchTemplateType = () => {
    getTemplateTypeList({ backTop: true })
  }

  const getTemplateTypeList = async ({ backTop = false }) => {
    dataContainer.loading = true
    const params = {
      name: searchVal.value,
      currentPage: dataContainer.params.currentPage,
      pageSize: dataContainer.params.pageSize
    }

    const res = await KuaituService.getTemplateTypeList(params)
    if (res.status) {
      dataContainer.list = res.data.list
      dataContainer.params.currentPage = res.data.pagination.currentPage
      dataContainer.params.pageSize = res.data.pagination.pageSize
      dataContainer.config.total = res.data.pagination.total

      dataContainer.loading = false
      if (backTop) {
        scrollToTop()
      }
    }
  }

  const formatDate = (row: any, column: any) => {
    const date = new Date(row[column.property])
    return format(date, 'yyyy-MM-dd HH:mm:ss') // 格式化日期
  }

  const handleCurrentChange = (val: number) => {
    dataContainer.params.currentPage = val
    getTemplateTypeList({ backTop: true })
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0 })
  }

  interface RuleForm {
    id: string
    name: string
    rank: number
  }
  const ruleFormRef = ref<FormInstance>()
  const ruleForm = reactive<RuleForm>({
    id: '',
    name: '',
    rank: 1
  })
  const rules = reactive<FormRules<RuleForm>>({
    name: [{ required: true, message: '请输入名称', trigger: 'blur' }]
  })
  const dialogVisible = ref(false)
  const dialogTitle = ref('')

  const actions = {
    add: () => {
      // 删除id属性
      Reflect.deleteProperty(ruleForm, 'id')
      dialogTitle.value = '新增类型'
      dialogVisible.value = true
    },
    edit: (row: any) => {
      ruleForm.id = row.id
      ruleForm.name = row.name
      ruleForm.rank = Number(row.rank)
      dialogTitle.value = '编辑类型'
      dialogVisible.value = true
    }
  }

  const addORedit = (type: string, row: any) => {
    if (!actions[type as keyof typeof actions]) {
      console.error('未知操作类型')
      return
    }
    // 如果是编辑操作，传递row参数
    actions[type as keyof typeof actions](row)
  }

  // 提交新增与编辑
  const submitForm = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate((valid, fields) => {
      if (valid) {
        if (ruleForm.id) {
          KuaituService.editTemplateType(Number(ruleForm.id), ruleForm).then((res: any) => {
            if (res.status) {
              ElMessage.success(res.msg)
              dialogVisible.value = false
              resetForm(ruleFormRef.value)
              getTemplateTypeList({ backTop: true })
            }
          })
        } else {
          KuaituService.addTemplateType(ruleForm).then((res: any) => {
            if (res.status) {
              ElMessage.success(res.msg)
              dialogVisible.value = false
              resetForm(ruleFormRef.value)
              getTemplateTypeList({ backTop: true })
            }
          })
        }
      } else {
        console.log('error submit!', fields)
      }
    })
  }

  const resetForm = (formEl: FormInstance | undefined) => {
    if (!formEl) return
    formEl.resetFields()
    dialogVisible.value = false
  }

  const handleClose = () => {
    resetForm(ruleFormRef.value)
  }

  // 删除类型
  const handleDel = (row: any) => {
    ElMessageBox.confirm(`确定要删除名称为：${row.name} 的类型数据吗？`, '删除确认', {
      confirmButtonText: '删除',
      cancelButtonText: '放弃',
      type: 'warning'
    })
      .then(() => {
        KuaituService.delTemplateType(row.id).then((res: any) => {
          if (res.status) {
            ElMessage.success(res.msg)
            getTemplateTypeList({ backTop: true })
          }
        })
      })
      .catch(() => {
        ElMessage({
          type: 'info',
          message: '取消删除'
        })
      })
  }
</script>

<style lang="scss" scoped>
</style>
