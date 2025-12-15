<script setup lang="ts">
import { ref, watch, computed, onBeforeUnmount } from "vue"

const isLoading = ref(true)

// Пропсы для видимости модалки и URL трейлера
const props = defineProps<{
  visible: boolean;
  trailerUrl?: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void
}>()


// Метод для закрытия модального окна
const closeModal = () => {
  console.log('🔴 [TrailerModal] Закрытие модала')
  emit('close')
}
// Обработка загрузки iframe
const onIframeLoad = () => {
  console.log('✅ [TrailerModal] Iframe загружен')
  isLoading.value = false
}

// Управление состоянием при открытии
watch(
  () => props.visible,
  (newVal) => {
    console.log('🎬 [TrailerModal] visible:', newVal)
    console.log('🎬 [TrailerModal] trailerUrl:', props.trailerUrl)

    if (newVal) {
      isLoading.value = true
      document.body.style.overflow = 'hidden'
      console.log('🎬 [TrailerModal] Скролл заблокирован')
    } else {
      document.body.style.overflow = 'auto'
      console.log('🎬 [TrailerModal] Скролл разблокирован')
    }
  }
)


// На случай удаления компонента — возвращаем скролл
onBeforeUnmount(() => {
  document.body.style.overflow = '';
});

</script>

<template>
  <transition name="modal">
    <div v-if="props.visible" class="overlay" @click.self="closeModal">
      <!-- Модальное окно -->
      <div class="trailer">
        <!-- Кнопка закрытия модального окна -->
        <button @click="closeModal" class="btn-close modal__btn-close">
          <img
               src="/icons/x-icon.svg"
               alt="кнопка закрыть окно" />
        </button>
        <div class="trailer__screen">
          <div v-if="isLoading" class="loader">
            <img src="/icons/loading.svg" alt="Загрузка" class="loader-svg" />
          </div>
          <!-- Экран просмотра трейлера в модальном окне -->
          <iframe
                  v-if="trailerUrl"
                  :key="trailerUrl"
                  :src="trailerUrl"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen
                  @load="onIframeLoad">
          </iframe>
          <div v-else class="no-trailer">
            <p>😞 Трейлер отсутствует.</p>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>

  .modal-enter-active,
  .modal-leave-active {
    transition: opacity 0.5s ease;
  }

  .modal-enter-from,
  .modal-leave-to {
    opacity: 0;
  }

  .loader {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1000;
  }

  .loader-svg {
    width: 50px;
    height: 50px;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  }

</style>