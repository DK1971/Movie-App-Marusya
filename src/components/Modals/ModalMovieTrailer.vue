<script setup lang="ts">

interface ModalProps {
  visible: boolean
}

defineProps<ModalProps>()

const emit = defineEmits<{
  (e: 'close', visible: boolean): void
}>()

const closeModal = () => {
  // Эмитим событие закрытия модального окна
  emit('close', false);
}
const handleOverlayClick = () => {
  // Закрываем при клике на подложку
  closeModal();
}
</script>

<template>
  <transition name="modal" mode="out-in">
    <div v-if="visible" class="overlay" @click.self="handleOverlayClick">
      <slot></slot>
    </div>
  </transition>
</template>

<style scoped>
  .modal-enter-active, .modal-leave-active {
    transition: opacity .8s
  }

  .modal-enter, .modal-leave-to {
    opacity: 0
  }

</style>