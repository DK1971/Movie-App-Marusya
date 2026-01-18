<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterView } from 'vue-router'

import AppFooter from './components/AppFooter.vue';
import AppHeader from './components/AppHeader.vue';
import BaseModal from './components/BaseModal.vue';
import { useMoviesStore } from '../src/store/moviesStore.ts'

// Инициализируем store для работы с фильмами
const moviesStore = useMoviesStore()
moviesStore.getTopMovies()

// Управление открытием/закрытием модального окна авторизации/регистрации
// Определяем видимость и тип модального окна
const isModalVisible = ref(false);
const modalType = ref<'login' | 'register' | 'complete'>('login');

/**
 * Переключение видимости модального окна
 * Вызывается при клике на кнопку "Войти" в HeaderAuth
 */
const toggleModal = () => {
  isModalVisible.value = !isModalVisible.value
  // При открытии модального окна всегда показываем экран авторизации
  if (isModalVisible.value) {
    modalType.value = 'login'
  }
}

/**
 * Обработка закрытия модального окна из BaseModal
 * Сбрасываем состояние при закрытии
 */
const handleCloseModal = () => {
  isModalVisible.value = false
  modalType.value = 'login'
}

/**
 * Обработка изменения типа модального окна из BaseModal
 * Синхронизируем тип модального окна между BaseModal и App.vue
 * @param type - новый тип модального окна ('login' | 'register' | 'complete')
 */
const handleModalTypeUpdate = (type: 'login' | 'register' | 'complete') => {
  modalType.value = type
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isModalVisible.value) {
    isModalVisible.value = false;
  }
};

// Управление скроллом
const isScrolled = ref(false);

const handleScroll = () => {
  isScrolled.value = window.scrollY > 400;
};

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

onMounted(() => {
  // Добавление слушателя события скролла
  window.addEventListener('scroll', handleScroll);
  // Добавляем глобальный обработчик клавиатуры при маунте компонента
  window.addEventListener('keydown', handleKeyDown);
})

onUnmounted(() => {
  // Очистка слушателя события скролла
  window.removeEventListener('scroll', handleScroll);
  // Удаляем глобальный обработчик клавиатуры при размонтировании компонента
  window.removeEventListener('keydown', handleKeyDown);
});

</script>

<template>
  <AppHeader @open="toggleModal" />

  <main class="main">
    <RouterView />
    <!-- Scroll to Top -->
    <button
            v-if="isScrolled"
            @click="scrollToTop"
            class="scroll-top">
    </button>
  </main>
  <AppFooter />
  <BaseModal
             :modal-type="modalType"
             :visible="isModalVisible"
             @close="handleCloseModal"
             @update-modal-type="handleModalTypeUpdate">
  </BaseModal>
</template>

<style scoped>
  .main {
    padding-block: 32px 40px;
    height: 100%;
    min-height: 100vh;
    background-image: var(--background-main-section);
  }

  .scroll-top {
    position: fixed;
    z-index: 99;
    right: 20px;
    bottom: 90px;
    display: inline-block;
    padding: 10px;
    width: 50px;
    height: 50px;
    border-radius: 30px;
    background-color: var(--main-white);
    background-image: url("/icons/arrow-circle-up.svg");
    background-size: 100%;
    background-repeat: no-repeat;
    box-shadow: 0px 0px 60px 20px rgba(255, 255, 255, 0.33);
    border: none;

    user-select: none;
    animation: 0.4s linear btn-showing forwards;
    cursor: pointer;
  }

</style>
