<template>
  <div class="container">
    {{ userInfo }}
    <var-space direction="column" size="large">
      <var-paper>
        <var-cell ripple :description="userInfo?.phone">
          {{ userInfo?.username }}
        </var-cell>
      </var-paper>
      <var-paper>
        <var-cell
          border
          v-ripple
          class="cursor-pointer"
          @click="handlePersonFile()"
        >
          个人文件
          <template #extra>
            <var-icon namespace="i" name="caret-right-light" />
          </template>
        </var-cell>
        <var-cell v-ripple class="cursor-pointer" @click="handleUploadFile()">
          上传安装包
          <template #extra>
            <var-icon namespace="i" name="caret-right-light" />
          </template>
        </var-cell>
      </var-paper>
    </var-space>
    <w-popup
      v-model:show="showUploadModal"
      title="上传安装包"
      cancelText="取消"
      actionText="上传"
      @action="handleUpload"
      @cancel="handleCancel"
    >
      <div class="container">
        <w-uploader
          @afterRead="onAfterRead"
          ref="uploader"
          :uploadAttr="uploadAttr"
        ></w-uploader>
      </div>
    </w-popup>
  </div>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/store';
import type { VarFile } from '@varlet/ui';
import { addPluginApi } from '@/api';
const { userInfo } = storeToRefs(useUserStore());
const showUploadModal = ref(false);
const files = ref<VarFile[]>([]);
const uploader = ref();
const uploadAttr = {
  maxlength: 1,
};
const handlePersonFile = () => {};
const handleUploadFile = () => {
  showUploadModal.value = true;
};
const onAfterRead = (filesData: VarFile | VarFile[]) => {
  const file = filesData as VarFile;
  files.value.push(file);
};
const handleUpload = async () => {
  try {
    await addPluginApi({ file: files.value });
    files.value = [];
    showUploadModal.value = false;
    uploader.value?.clear();
  } catch (error) {
    console.log(error);
  }
};
const handleCancel = () => {
  files.value = [];
  showUploadModal.value = false;
  uploader.value?.clear();
};
</script>

<style scoped lang="scss"></style>
