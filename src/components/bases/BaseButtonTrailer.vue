<script setup lang="ts">

// === PROPS ===
interface Props {
  url?: string | null;
}

const props = defineProps<Props>();

// === EVENTS ===
const emit = defineEmits<{
  (e: 'open'): void
}>();

// === METHODS ===
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