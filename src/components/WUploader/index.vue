<template>
  <div>
    <var-uploader
      v-model="files"
      @oversize="onOverSize"
      @afterRead="onAfterRead"
      v-bind="computedAttr"
    >
      <div
        class="w-full aspect-square border border-dashed border-gray-200 rounded-md bg-gray-50 flex flex-col justify-center items-center gap-1 transition-all active:scale-95 p-5"
      >
        <div class="flex items-center gap-2 text-sm">
          请上传
          <span class="text-orange-600">{{ computedAttr.accept }}</span>
          格式文件
        </div>

        <div class="flex items-center gap-2 text-sm">
          文件大小不能超过
          <span class="text-orange-600">{{ computedAttr.maxsize }}</span>
          kb
        </div>
      </div>
    </var-uploader>
  </div>
</template>

<script lang="ts" setup>
import { toast } from 'vue-sonner';
import type { UploaderProps, VarFile } from '@varlet/ui';
type UploadAttr = Partial<UploaderProps>;
const props = defineProps<{
  uploadAttr?: UploadAttr;
}>();
const files = ref([]);
const onOverSize = () => {
  toast.error('文件大小超出限制');
};
const onAfterRead = (file: VarFile) => {
  emit('afterRead', file);
};
const defaultAttr = ref<Partial<UploaderProps>>({
  maxsize: 1024,
  accept: 'image/*',
});
const computedAttr = computed(() => ({
  ...defaultAttr.value,
  ...props.uploadAttr,
}));
const emit = defineEmits(['afterRead']);
</script>

<style scoped lang="scss"></style>
