<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '../store/userStore.ts'
import { useFavoriteMoviesStore } from '../store/favoriteMoviesStore.ts'
import ModalLogIn from './Modals/ModalLogIn.vue'
import ModalReg from './Modals/ModalReg.vue'
import ModalRegCreated from './Modals/ModalRegCreated.vue'

const userStore = useUserStore()
const favoriteStore = useFavoriteMoviesStore()

interface ModalProps {
  modalType: 'login' | 'register' | 'complete',
  visible: boolean
}

const props = defineProps<ModalProps>()

// Отслеживаем текущий тип модального окна 
const currentModal = ref<'login' | 'register' | 'complete'>(props.modalType)

const emit = defineEmits<{
  (e: 'close', visible: boolean): void,
  (e: 'update-modal-type', type: 'login' | 'register' | 'complete'): void
}>()

const closeModal = () => {
  emit('close', false);
}

// Закрываем модальное окно по клику за пределами окна
const handleOverlayClick = () => {
  closeModal();
}

// Обработка клика на "Войти" (от ModalLogIn или ModalRegCreated)
const handleLogin = async (payload?: { email: string; password: string }) => {
  // Если payload отсутствует — просто переключаемся на экран входа
  if (!payload) {
    switchToModal('login')
    return
  }
  try {
    const res = await userStore.loginUser(payload as any)
    if (res && res.success) {
      // loginUser уже сохранил token и user в сторе через persistAuth
      try { await favoriteStore.getFavoriteMovies() } catch (error) { /* ignore */ }
      // Закрываем модалку
      closeModal()
    } else {
      // В случае ошибки — не пробрасываем исключение, оставляем модалку открытой
      console.warn('Login failed:', res?.message)
      // userStore.error содержит текст ошибки и ModalLogIn отображает store.error
    }
  } catch (error) {
    // На всякий случай — логируем, но не пробрасываем дальше
    console.error('Авторизация не прошла (uncaught):', error)
  }
}

// Переключение между модалками
const switchToModal = (modalType: 'login' | 'register' | 'complete') => {
  currentModal.value = modalType
  emit('update-modal-type', modalType)
}

// Обработка завершения регистрации (вызывается из ModalReg)
const handleFinishRegister = async (payload?: { name: string; surname: string; email: string; password: string }) => {
  try {
    if (!payload) {
      switchToModal('complete')
      return
    }
    const res = await userStore.registerUser(payload as any)
    if (res && res.success) {
      // После успешной регистрации показываем экран завершения
      switchToModal('complete')
      userStore.isRegCompleted = true
    } else {
      console.warn('Registration failed:', res?.message)
      // userStore.error содержит текст ошибки для UI
    }
    return res
  } catch (error) {
    console.error('Registration failed (uncaught):', error)
    // не пробрасываем дальше
  }
}

// Получение компонента для отображения
const getModalComponent = () => {
  switch (currentModal.value) {
    case 'login':
      return ModalLogIn
    case 'register':
      return ModalReg
    case 'complete':
      return ModalRegCreated
    default:
      return ModalLogIn
  }
}

</script>

<template>
  <transition name="modal" mode="out-in">
    <div v-if="visible" class="overlay" @click.self="handleOverlayClick">
      <!-- Модальное окно -->
      <div class="modal">
        <div class="modal__box">
          <!-- Лого в модальном окне -->
          <img
               src="/marusya_logo_black.png"
               alt="Логотип приложения Маруся"
               class="modal__logo" />
          <!-- Динамически изменяемый контент модального окна -->
          <component
                     :is="getModalComponent()"
                     @switch-to-register="switchToModal('register')"
                     @switch-to-login="switchToModal('login')"
                     @complete="handleFinishRegister"
                     @login="handleLogin" />
        </div>
        <!-- Кнопка закрытия модального окна -->
        <button @click="closeModal" class="btn-close modal__btn-close">
          <img
               src="/icons/x-icon.svg"
               alt="кнопка закрыть окно" />
        </button>
      </div>
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