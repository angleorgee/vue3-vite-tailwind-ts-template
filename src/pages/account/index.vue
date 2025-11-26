<template>
  <div>{{ userInfo }},321321</div>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/store';
const { userInfo } = storeToRefs(useUserStore());
</script>

<style scoped lang="scss"></style>
