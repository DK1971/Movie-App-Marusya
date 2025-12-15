<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from "vue"

interface Props {
  visible: boolean
  trailerUrl?: string
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  trailerUrl: ''
})

const emit = defineEmits<{
  close: []
}>()

const isLoading = ref(true)

// Логирование
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

const closeModal = () => {
  console.log('🔴 [TrailerModal] Закрытие модала')
  emit('close')
}

const onIframeLoad = () => {
  console.log('✅ [TrailerModal] Iframe загружен')
  isLoading.value = false
}

onBeforeUnmount(() => {
  document.body.style.overflow = 'auto'
})
</script>

<template>
  <!-- ГЛАВНЫЙ КОНТЕЙНЕР МОДАЛА -->
  <div v-if="visible" class="modal-wrapper">
    <!-- ОВЕРЛЕЙ (тёмный фон) -->
    <div class="modal-overlay" @click="closeModal"></div>

    <!-- МОДАЛЬНОЕ ОКНО -->
    <div class="modal-content">
      <!-- КНОПКА ЗАКРЫТИЯ -->
      <button
              type="button"
              class="modal-close-btn"
              @click="closeModal"
              aria-label="Закрыть">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path
                d="M21 7L7 21M7 7l14 14"
                stroke="white"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round" />
        </svg>
      </button>

      <!-- ВИДЕО КОНТЕЙНЕР -->
      <div class="modal-video-wrapper">
        <!-- СПИННЕР ЗАГРУЗКИ -->
        <div v-if="isLoading" class="modal-loader">
          <div class="spinner"></div>
          <p>Загрузка...</p>
        </div>

        <!-- IFRAME -->
        <iframe
                v-show="!isLoading && trailerUrl"
                :src="trailerUrl"
                class="modal-iframe"
                title="Трейлер фильма"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowfullscreen
                @load="onIframeLoad"></iframe>

        <!-- ЕСЛИ НЕТ ТРЕЙЛЕРА -->
        <div v-if="!trailerUrl" class="modal-no-video">
          <p>😞 Трейлер не доступен</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

  /* ОБЁРТКА (контейнер всего модала) */
  .modal-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.3s ease-in-out;
  }

  /* ОВЕРЛЕЙ (тёмный фон) */
  .modal-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.9);
    cursor: pointer;
    z-index: 1;
  }

  /* МОДАЛЬНОЕ ОКНО */
  .modal-content {
    position: relative;
    background: #1a1a1a;
    border-radius: 12px;
    width: 90%;
    max-width: 1000px;
    max-height: 85vh;
    overflow: hidden;
    z-index: 2;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.95);
    animation: slideUp 0.3s ease-out;
  }

  /* КНОПКА ЗАКРЫТИЯ */
  .modal-close-btn {
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 10;
    background: rgba(255, 255, 255, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    padding: 0;
  }

  .modal-close-btn:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: scale(1.1);
  }

  .modal-close-btn:active {
    transform: scale(0.95);
  }

  .modal-close-btn svg {
    display: block;
  }

  /* ВИДЕО КОНТЕЙНЕР */
  .modal-video-wrapper {
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 9;
    background: #000;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* IFRAME */
  .modal-iframe {
    width: 100%;
    height: 100%;
    border: none;
    display: block;
  }

  /* ЗАГРУЗКА */
  .modal-loader {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 5;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    color: white;
  }

  .spinner {
    width: 50px;
    height: 50px;
    border: 4px solid rgba(255, 255, 255, 0.2);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  /* НЕТ ВИДЕО */
  .modal-no-video {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #666;
    font-size: 18px;
    text-align: center;
  }

  /* АНИМАЦИИ */
  @keyframes fadeIn {
    from {
      opacity: 0;
    }

    to {
      opacity: 1;
    }
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px) scale(0.95);
    }

    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  /* МОБИЛЬНЫЕ УСТРОЙСТВА */
  @media (max-width: 768px) {
    .modal-content {
      width: 95%;
      max-height: 70vh;
    }

    .modal-close-btn {
      width: 44px;
      height: 44px;
      top: 15px;
      right: 15px;
    }

    .modal-close-btn svg {
      width: 24px;
      height: 24px;
    }
  }

  @media (max-width: 480px) {
    .modal-content {
      width: 100%;
      height: 100vh;
      max-height: 100vh;
      border-radius: 0;
    }

    .modal-video-wrapper {
      min-height: 250px;
    }
  }
</style>