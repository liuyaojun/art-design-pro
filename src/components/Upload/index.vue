<template>
  <div class="upload">
    <el-upload
      v-model:file-list="fileList"
      ref="uploadRef"
      :action="action"
      :multiple="multiple"
      :limit="limit"
      :show-file-list="false"
      :headers="headers"
      :data="data"
      :on-progress="handleProgress"
      :on-success="handleSuccess"
      :on-exceed="handleExceed"
      :on-error="handleError"
      :accept="getAccept"
    >
      <slot />
    </el-upload>
    <el-dialog
      v-if="showProgress && fileList.length"
      v-model="visible"
      title="上传进度"
      :close-on-click-modal="false"
      width="500px"
      :modal="false"
      @close="handleClose"
    >
      <div class="file-list p-4">
        <template v-for="(item, index) in fileList">
          <div class="mb-5" :key="index">
            <div>{{ item.name }}</div>
            <div class="flex-1">
              <el-progress :percentage="parseInt(item.percentage)" />
            </div>
          </div>
        </template>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
  import { ref, computed, onMounted } from 'vue'
  import { ElUpload, ElDialog, ElProgress } from 'element-plus'
  import { useStore } from 'vuex'

  let uploadLen = 0

  const props = defineProps({
    // 上传文件类型
    type: {
      type: String,
      default: 'image'
    },
    // 是否支持多选
    multiple: {
      type: Boolean,
      default: true
    },
    // 多选时最多选择几条
    limit: {
      type: Number,
      default: 10
    },
    // 上传时的额外参数
    data: {
      type: Object,
      default: () => ({})
    },
    // 是否显示上传进度
    showProgress: {
      type: Boolean,
      default: false
    }
  })

  const emit = defineEmits(['allSuccess', 'success', 'error', 'change'])

  const store = useStore()
  const fileList = ref([])
  const visible = ref(false)
  const action = ref('你的上传API')
  const headers = ref({
    token: store.getters.token
  })

  const getAccept = computed(() => {
    switch (props.type) {
      case 'image':
        return '.jpg,.png,.gif,.jpeg,.ico'
      case 'video':
        return '.wmv,.avi,.mpg,.mpeg,.3gp,.mov,.mp4,.flv,.rmvb,.mkv'
      default:
        return '*'
    }
  })

  const handleProgress = () => {
    visible.value = true
  }

  const handleSuccess = (response, file) => {
    uploadLen++
    if (uploadLen === fileList.value.length) {
      uploadLen = 0
      fileList.value = []
      emit('allSuccess')
    }
    emit('change', file)
    if (response.code === RequestCodeEnum.SUCCESS) {
      emit('success', response)
    }
    if (response.code === RequestCodeEnum.FAIL && response.msg) {
      emit('error', new Error(response.msg))
    }
  }

  const handleError = (event, file) => {
    uploadLen++
    if (uploadLen === fileList.value.length) {
      uploadLen = 0
      fileList.value = []
      emit('allSuccess')
    }
    emit('error', new Error(`${file.name}文件上传失败`))
    const uploadRef = ref(null)
    uploadRef.value.abort(file)
    visible.value = false
    emit('change', file)
    emit('error', file)
  }

  const handleExceed = () => {
    emit('error', new Error(`超出上传上限${props.limit}，请重新上传`))
  }

  const handleClose = () => {
    fileList.value = []
    visible.value = false
  }
</script>
