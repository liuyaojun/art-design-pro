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

      <el-table
        :data="dataContainer.list"
        style="width: 100%; margin-top: 20px"
        row-key="id"
        v-loading="dataContainer.loading"
        border
      >
        <el-table-column prop="id" label="ID" width="100" show-overflow-tooltip />
        <el-table-column prop="img" label="预览" width="140" show-overflow-tooltip>
          <template #default="scope">
            <el-image
              style="width: 100px"
              :src="scope.row.img"
              fit="cover"
              :zoom-rate="1.2"
              :max-scale="7"
              :min-scale="0.2"
              :preview-src-list="[scope.row.img]"
              preview-teleported
            />
          </template>
        </el-table-column>
        <el-table-column prop="name" label="字体名称" show-overflow-tooltip />
        <el-table-column
          label="类型"
          prop="type"
          :filters="[
            { text: '中文', value: 'cn' },
            { text: '英文', value: 'en' }
          ]"
          :filter-method="filterTag"
          filter-placement="bottom-end"
          width="100"
          align="center"
        >
          <template #default="scope">
            <el-tag :type="scope.row.type === 'cn' ? 'success' : 'danger'">
              {{ scope.row.type === 'cn' ? '中文' : '英文' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="url" label="字体路径" show-overflow-tooltip />
        <el-table-column
          prop="createdAt"
          label="添加时间"
          show-overflow-tooltip
          :formatter="formatDate"
          width="180"
          align="center"
        />
        <el-table-column fixed="right" label="操作" width="120" align="center">
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
              <el-button link :icon="Delete" type="primary" @click="delSize(scope.row)"></el-button>
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

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500" @close="handleClose" @opened="handleOpened">
      <el-form ref="ruleFormRef" :model="ruleForm" :rules="rules" label-width="auto" status-icon>
        <el-form-item label="预览" prop="name">
          <el-image
            style="width: 100px"
            :src="ruleForm.img"
            fit="cover"
            :zoom-rate="1.2"
            :max-scale="7"
            :min-scale="0.2"
            :preview-src-list="[ruleForm.img]"
            preview-teleported
          />
          <canvas width="400" height="130" id="c" style="border: 1px solid #ccc;"></canvas>
          <el-button>重新生成预览图</el-button>
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="ruleForm.name" />
        </el-form-item>

        <el-form-item label="类型" prop="type">
          <el-select v-model="ruleForm.type" placeholder="Select">
            <el-option
              v-for="item in fontType"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="文件路径" prop="width">
          <el-input v-model="ruleForm.url" />
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

  import { fabric } from 'fabric'
  import FontFaceObserver from 'fontfaceobserver'

  let canvas = null
  const initCanvas = () => {
    const canvasEl = document.getElementById('c')
    //canvas = new fabric.Canvas(canvasEl) // 有鼠标交互的fabric对象
    canvas = new fabric.StaticCanvas(canvasEl, {
      width: 1000,
      height: 130
    })//没有鼠标交互的fabric对象


    loadFont(ruleForm.name, ruleForm.url)
    // 创建一个文本对象
    const itext = new fabric.IText(ruleForm.name, {
      fontFamily: `${ruleForm.name}`
    })
    canvas.add(itext)
  }

  // 加载字体的方法
  const loadFont = (name, url) => {
    // 动态创建一个style标签并添加到head中
    const style = document.createElement('style')
    style.type = 'text/css'
    style.innerHTML = `@font-face {
      font-family: '${name}';
      src: url('${url}');
    }`
    document.head.appendChild(style)

    // 应用字体
    //document.body.style.fontFamily = `${name}, sans-serif`

    const font = new FontFaceObserver(ruleForm.name)
    font.load(null, 20000).then(() => {
      console.log('字体已成功加载！', ruleForm.name, ruleForm.url)
      let target = canvas.getActiveObject()
      if (target) {
        target.set("fontFamily", font)
        canvas.requestRenderAll()
      }
    })
      .catch(() => {
        console.log('字体加载失败。')
      })
  }

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

  const fontType = [
    {
      value: 'cn',
      label: '中文'
    },
    {
      value: 'en',
      label: '英文'
    }
  ]

  const filterTag = (value: string, row: any) => {
    return row.type === value
  }

  const searchVal = ref('')

  onMounted(() => {
    getFontList({ backTop: false })
  })

  // 搜索文章
  const searchSize = () => {
    getFontList({ backTop: true })
  }

  const getFontList = async ({ backTop = false }) => {
    dataContainer.loading = true
    const params = {
      name: searchVal.value,
      currentPage: dataContainer.params.currentPage,
      pageSize: dataContainer.params.pageSize
    }

    const res = await KuaituService.getFontList(params)
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
    getFontList({ backTop: true })
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0 })
  }

  interface RuleForm {
    id: string
    img: string
    name: string
    type: string
    url: string
  }
  const ruleFormRef = ref<FormInstance>()
  const ruleForm = reactive<RuleForm>({
    id: '',
    img: '',
    name: '',
    type: '',
    url: ''
  })
  const rules = reactive<FormRules<RuleForm>>({
    name: [{ required: true, message: '请输入名称', trigger: 'blur' }]
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
      ruleForm.img = row.img
      ruleForm.name = row.name
      ruleForm.type = row.type
      ruleForm.url = row.url
      dialogTitle.value = '编辑尺寸'
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
          KuaituService.editFont(Number(ruleForm.id), ruleForm).then((res: any) => {
            if (res.status) {
              ElMessage.success(res.msg)
              dialogVisible.value = false
              getFontList({ backTop: true })
            }
          })
        } else {
          KuaituService.addFont(ruleForm).then((res: any) => {
            if (res.status) {
              ElMessage.success(res.msg)
              dialogVisible.value = false
              getFontList({ backTop: true })
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

  const handleOpened = () => {
    initCanvas()
  }
  const handleClose = () => {
    resetForm(ruleFormRef.value)
  }

  // 删除字体
  const delSize = (row: any) => {
    ElMessageBox.confirm(`确定要删除名称为：${row.name} 的字体数据吗？`, '删除确认', {
      confirmButtonText: '删除',
      cancelButtonText: '放弃',
      type: 'warning'
    })
      .then(() => {
        KuaituService.delFont(row.id).then((res: any) => {
          if (res.status) {
            ElMessage.success(res.msg)
            getFontList({ backTop: true })
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

<style lang="scss" scoped></style>
