<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '../store/userStore.ts'
import { useFavoriteMoviesStore } from '../store/favoriteMoviesStore.ts'
import type { IUser } from "../types/auth.ts";
import { validateEmail } from '../utils/modalFormUtils.ts';
import ModalLogIn from './Modals/ModalLogIn.vue'
import ModalReg from './Modals/ModalReg.vue'
import ModalRegCreated from './Modals/ModalRegCreated.vue'

const userStore = useUserStore()
const favoriteStore = useFavoriteMoviesStore()
// const { user, isAuthorized, isRegCompleted } = storeToRefs(userStore)

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
    if (res) {
      // loginUser уже сохраняет token и user в хранилище через persistAuth
      // Загрузим избранное пользователя
      try { await favoriteStore.getFavoriteMovies() } catch (error) { /* ignore */ }
      // Закрываем модалку
      closeModal()
    }
  } catch (error) {
    console.error('Авторизация не прошла', error)
    throw error
  }
}

// Переключение между модалками
const switchToModal = (modalType: 'login' | 'register' | 'complete') => {
  currentModal.value = modalType
  // Опционально: эмитим событие родителю для синхронизации
  emit('update-modal-type', modalType)
}

// Обработка завершения регистрации (вызывается из ModalReg)
const handleFinishRegister = async (payload?: { name: string; surname: string; email: string; password: string }) => {
  try {
    if (!payload) {
      switchToModal('complete')
      return
    }
    // Вызываем регистрацию через store
    const res = await userStore.registerUser(payload as any)
    // После успешной регистрации показываем экран завершения
    switchToModal('complete')
    // можно пометить флаг завершения
    try {
      // устанавливаем маркер в сторе, если он нужен
      userStore.isRegCompleted = true
    } catch (error) {
      console.error('Registration failed ', error)
    }
    return res
  } catch (error) {
    console.error('Registration failed ', error)
    throw error
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
                     @swith-to-complete="switchToModal('complete')"
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