<template>
  <div
    class="fixed bottom-0 left-0 right-0 h-18 bg-gray-500/30 backdrop-blur-md z-10"
    ref="root"
  >
    <div
      class="h-full flex-center justify-around bg-gray-100/90 backdrop-blur-sm"
    >
      <div
        v-for="item in list"
        :key="item.label"
        class="flex-col-center cursor-pointer px-5"
        :class="isCurrentRouter(item.path) ? 'text-blue-500' : 'text-gray-700'"
        @click="goto(item.path)"
      >
        <Icon :icon="item.icon" class="text-3xl" />
        <span class="text-sm">{{ item.label }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Icon } from '@iconify/vue';
const root = ref();
const list = [
  {
    label: '推荐',
    icon: 'ph:newspaper-clipping-duotone',
    path: '/recommend',
  },
  {
    label: '游戏',
    icon: 'ph:game-controller-duotone',
    path: '/games',
  },
  {
    label: '插件',
    icon: 'ph:film-script-duotone',
    path: '/plugins',
  },
  {
    label: '搜索',
    icon: 'ph:magnifying-glass-duotone',
    path: '/search',
  },
  {
    label: '账户',
    icon: 'ph:user-circle-duotone',
    path: '/account',
  },
];
const router = useRouter();
const goto = (path: string) => {
  router.push(path);
};
const isCurrentRouter = (path: string) => {
  return router.currentRoute.value.path === path;
};
defineExpose({
  root,
});
</script>

<style scoped lang="scss"></style>
