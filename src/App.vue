<template>
  <div ref="container" class="bg-gray-200">
    <RouterView />
  </div>
  <TabBar ref="tabbar" />
  <Toaster
    richColors
    position="top-right"
    :closeButton="true"
    closeButtonPosition="top-right"
  />
</template>
<script setup lang="ts">
import TabBar from './layouts/TabBar.vue';
import { toast, Toaster } from 'vue-sonner';
import { useUserStore } from './store';
import 'vue-sonner/style.css';
const route = useRoute();
const container = ref();
const tabbar = ref();
const computedHeight = () => {
  nextTick(() => {
    if (!tabbar.value?.root || !container.value) {
      return;
    }
    const tabbarHeight = tabbar.value.root.clientHeight;
    container.value.style.height = `${window.innerHeight - tabbarHeight}px`;
    container.value.style.overflowY = 'auto';
  });
};
const { getUserInfo } = useUserStore();
const handleMessage = (event: MessageEvent) => {
  const { data, type } = event.data;
  if (type === 'token') {
    getUserInfo(data.token);
  }
};
onMounted(() => {
  computedHeight();
  window.addEventListener('resize', () => {
    computedHeight();
  });
  window.addEventListener('message', handleMessage);
});
</script>
<style scoped></style>
