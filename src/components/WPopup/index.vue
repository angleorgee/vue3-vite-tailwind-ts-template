<template>
  <Teleport :to="props.teleport">
    <var-style-provider :style-vars="styleVars">
      <var-popup
        position="bottom"
        :overlay="false"
        :show="props.show"
        :teleport="false"
      >
        <div :style="panelStyle">
          <div
            v-if="!$slots.title"
            class="flex-center justify-between bg-gray-50 py-1.5 rounded-t-xl"
          >
            <div
              class="cursor-pointer"
              :style="props.cancelStyle"
              @click="handleCancel"
            >
              {{ props.cancelText }}
            </div>
            <div :style="props.actionStyle" class="flex-1 text-center">
              {{ title }}
            </div>
            <div
              class="ml-auto mr-5 text-(--color-primary) cursor-pointer"
              @click="handleAction"
            >
              {{ props.actionText }}
            </div>
          </div>
          <slot name="title" />
          <slot />
        </div>
      </var-popup>
    </var-style-provider>
  </Teleport>
</template>

<script setup lang="ts">
import { Teleport, type CSSProperties } from 'vue';

const props = withDefaults(
  defineProps<{
    show: boolean;
    title?: string;
    teleport?: string;
    actionText?: string;
    cancelText?: string;
    actionStyle?: CSSProperties;
    cancelStyle?: CSSProperties;
  }>(),
  {
    show: false,
    teleport: 'body',
    actionText: '完成',
    cancelText: '',
  }
);
const styleVars = {
  '--popup-content-background-color': 'transparent',
};
const emit = defineEmits(['action', 'cancel']);

const id = `popup-${Math.random().toString(36).slice(2)}`;
const index = ref(0);
watchEffect(() => {
  if (props.show) {
    document.body.setAttribute(`data-${id}`, '1');
    const count = document.body.querySelectorAll('[data-popup-layer]').length;

    // 新增一个标记节点用于简化查询
    const marker = document.createElement('div');
    marker.setAttribute('data-popup-layer', id);
    document.body.appendChild(marker);
    index.value = count;
  } else {
    const marker = document.body.querySelector(`[data-popup-layer="${id}"]`);
    marker?.remove();
  }
});

const offset = 20;
const windowHeight = window.innerHeight;
const panelStyle = computed(() => ({
  height: windowHeight - offset * (index.value + 1) + 'px',
  width: '100%',
  borderRadius: '0.75rem 0.75rem 0 0',
  background: '#fff',
}));

const handleAction = () => {
  emit('action', false);
};
const handleCancel = () => {
  emit('cancel', false);
};
</script>
