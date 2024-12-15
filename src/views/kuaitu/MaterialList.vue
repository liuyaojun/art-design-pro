<template>
  <div>
    <div class="page-content article-list">
      <el-row justify="space-between" :gutter="10">
        <el-col :lg="6" :md="6" :sm="14" :xs="16">
          <el-input
            v-model="searchVal"
            :prefix-icon="Search"
            clearable
            placeholder="输入名称 回车查询"
            @keyup.enter="searchSize"
          />
        </el-col>
        <el-col :lg="6" :md="6" :sm="10" :xs="6" style="display: flex; justify-content: end">
          <el-button type="primary" :icon="Plus" @click="addORedit('add', {})" v-auth="'add'"
            >创建新条目</el-button
          >
        </el-col>
      </el-row>

      <ul class="qh-grid qh-waterfall mt-20">
        <li
          class="post-list-item"
          v-for="(item, index) in dataContainer.list"
          :key="index"
        >
          <div class="item-in">
            <div class="post-module-thumb">
              <div class="post-thumbnail qh-radius" style="padding-top: 133%">
                <span rel="nofollow" class="thumb-link">
                  <img
                    :src="item.small"
                    :alt="item.name"
                    class="post-thumb w-h qh-radius entered loaded"
                /></span>
              </div>
            </div>
            <span class="post-info">
              <h2 class="text-ellipsis">{{ item.name }}</h2>
            </span>
            <div class="post-module-badges">
              <span class="badge-item no-hover">{{ item.materialType.name }}</span>
            </div>
          </div>
        </li>
      </ul>

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

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500" :close="handleClose">
      <el-form ref="ruleFormRef" :model="ruleForm" :rules="rules" label-width="auto" status-icon>
        <el-form-item label="名称" prop="name">
          <el-input v-model="ruleForm.name" />
        </el-form-item>
        <el-form-item label="宽度" prop="width">
          <el-input v-model.number="ruleForm.width">
            <template #append>px</template>
          </el-input>
        </el-form-item>
        <el-form-item label="高度" prop="height">
          <el-input v-model.number="ruleForm.height">
            <template #append>px</template>
          </el-input>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch
            v-model="ruleForm.status"
            inline-prompt
            :active-value="1"
            :inactive-value="0"
            active-text="启用"
            inactive-text="禁用"
          />
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
  import { Search, Plus, CopyDocument, EditPen, Delete } from '@element-plus/icons-vue'
  import type { FormInstance, FormRules } from 'element-plus'

  const dataContainer = reactive({
    loading: false,
    showSearch: true,
    params: {
      currentPage: 1,
      pageSize: 12
    },
    config: {
      total: 0
    },
    list: []
  })

  const searchVal = ref('')

  onMounted(() => {
    getMaterialList({ backTop: false })
  })

  // 搜索文章
  const searchSize = () => {
    getMaterialList({ backTop: true })
  }

  const getMaterialList = async ({ backTop = false }) => {
    dataContainer.loading = true
    const params = {
      name: searchVal.value,
      currentPage: dataContainer.params.currentPage,
      pageSize: dataContainer.params.pageSize
    }

    const res = await KuaituService.getMaterialList(params)
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


  const handleCurrentChange = (val: number) => {
    dataContainer.params.currentPage = val
    getMaterialList({ backTop: true })
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0 })
  }

  interface RuleForm {
    id: string
    name: string
    width: number
    height: number
    unit: string
    status: number
  }
  const ruleFormRef = ref<FormInstance>()
  const ruleForm = reactive<RuleForm>({
    id: '',
    name: '',
    width: 0,
    height: 0,
    unit: 'px',
    status: 1
  })
  const rules = reactive<FormRules<RuleForm>>({
    name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
    width: [
      { required: true, message: '请输入宽度', trigger: 'blur' },
      { type: 'number', message: '请输入数字' }
    ],
    height: [
      { required: true, message: '请输入高度', trigger: 'blur' },
      { type: 'number', message: '请输入数字' }
    ]
  })
  const dialogVisible = ref(false)
  const dialogTitle = ref('')

  const actions = {
    add: () => {
      dialogTitle.value = '新增尺寸'
      dialogVisible.value = true
    },
    edit: (row: any) => {
      ruleForm.id = row.id
      ruleForm.name = row.name
      ruleForm.width = Number(row.width)
      ruleForm.height = Number(row.height)
      ruleForm.unit = 'px'
      ruleForm.status = Number(row.status)
      dialogTitle.value = '编辑尺寸'
      dialogVisible.value = true
    },
    clone: (row: any) => {
      ruleForm.name = row.name + '_副本'
      ruleForm.width = Number(row.width)
      ruleForm.height = Number(row.height)
      ruleForm.unit = 'px'
      ruleForm.status = Number(row.status)
      dialogTitle.value = '克隆尺寸'
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
          KuaituService.editSize(Number(ruleForm.id), ruleForm).then((res: any) => {
            if (res.status) {
              ElMessage.success(res.msg)
              dialogVisible.value = false
              getMaterialList({ backTop: true })
            }
          })
        } else {
          KuaituService.addSize(ruleForm).then((res: any) => {
            if (res.status) {
              ElMessage.success(res.msg)
              dialogVisible.value = false
              getMaterialList({ backTop: true })
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

  // 删除画布尺寸
  const delSize = (row: any) => {
    ElMessageBox.confirm(`确定要删除名称为：${row.name} 的画布尺寸数据吗？`, '删除确认', {
      confirmButtonText: '删除',
      cancelButtonText: '放弃',
      type: 'warning'
    })
      .then(() => {
        KuaituService.delSize(row.id).then((res: any) => {
          if (res.status) {
            ElMessage.success(res.msg)
            getMaterialList({ backTop: true })
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

  const handleChangStatus = (id: number, status: number) => {
    KuaituService.setStatus(id, { status: status }).then((res: any) => {
      if (res.status) {
        ElMessage.success(res.msg)
        getMaterialList({ backTop: true })
      }
    })
  }
</script>

<style lang="scss" scoped>
  .qh-radius {
    border-radius: 8px;
    overflow: hidden;
  }
  .w-h {
    width: 100%;
    height: 100%;
  }
  .qh-waterfall {
    display: flex;
    position: relative;
    flex-flow: wrap;
    justify-content: space-between;
    width: auto;
    grid-gap: 0;
    margin: 0 calc(16px / -2);
    margin-bottom: calc(-1 * 16px);
  }
  .home-item .qh-grid {
    transition: height 0.3s;
  }
  .qh-waterfall > * {
    padding: 0 calc(16px / 2);
    width: 20%;
  }
  .qh-waterfall .item-in {
    margin-bottom: 16px;
    position: relative;
  }
  .qh-waterfall .item-in {
    -webkit-transition: transform 0.3s cubic-bezier(0, 0, 0.5, 1);
    transition: transform 0.3s cubic-bezier(0, 0, 0.5, 1);
    -webkit-transform: scale3d(1, 1, 1);
    transform: scale3d(1, 1, 1);
  }
  .qk-waterfall .item-in:hover {
    -webkit-transform: scale3d(1.01, 1.01, 1.01);
    transform: scale3d(1.01, 1.01, 1.01);
  }
  .post-thumbnail {
    position: relative;
    height: 0;
    overflow: hidden;
    padding-top: 56.25%;
  }
  .post-thumbnail .thumb-link {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
  img.lazyload:not(.loaded) {
    -webkit-transition: 0.8s ease-in-out opacity;
    transition: 0.8s ease-in-out opacity;
    filter: blur(35px);
    -webkit-filter: blur(35px);
  }

  img.lazyload.loaded {
    filter: blur(0px);
    -webkit-filter: blur(0px);
    opacity: 1;
    transition:
      1s filter linear,
      1s -webkit-filter linear;
  }
  .post-info {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    padding: 10px;
    display: flex;
    align-items: flex-end;
    flex-direction: row;
    background-color: rgba(0, 0, 0, 0.3);
    transition: opacity 0.3s ease;
    opacity: 0;
    border-radius: 8px;
    z-index: 2;
  }

  .item-in:hover .post-info {
    opacity: 1;
  }

  .post-info h2 {
    margin: 0;
    color: #fff;
    font-weight: 600;
    flex: 1;
    font-size: 14px;
  }
  .post-thumb-shadow {
    position: relative;
    margin-top: 16px;
  }

  .post-thumb-shadow::before,
  .post-thumb-shadow::after {
    content: '';
    position: absolute;
    top: -7px;
    left: 0;
    width: 100%;
    height: 8px;
    background-color: var(--bs-blue);
    opacity: 0.2;
    border-radius: 8px 8px 0 0;
    -webkit-transform: scale(0.85);
    transform: scale(0.9);
  }

  .post-thumb-shadow::after {
    top: -14px;
    -webkit-transform: scale(0.8);
    transform: scale(0.8);
    opacity: 0.1;
  }

  .post-module-badges {
    position: absolute;
    left: 12px;
    top: 12px;
    display: flex;
    flex-wrap: wrap;
    z-index: 3;
  }

  .post-module-badges .badge-item {
    display: inline-block;
    font-size: 12px;
    padding: 4px 12px;
    margin-right: 4px;
    border-radius: 100px;
    background-color: rgba(0, 0, 0, 0.5);
    color: #fff;
  }
</style>
