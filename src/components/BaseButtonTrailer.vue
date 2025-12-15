<script setup lang="ts">

interface Props {
  url?: string | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'open'): void
}>();

const handleOpen = () => {
  if (props.url) {
    emit('open');
  }
};

</script>

<template>
  <button
          type="button"
          @click="handleOpen"
          class="btn-trailer">
    Трейлер
  </button>
</template>

<style scoped></style>