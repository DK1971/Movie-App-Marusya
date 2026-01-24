<script setup lang="ts">
import { ref, watch } from 'vue'
import { useUserStore } from '@/store/userStore.ts'
import { useFavoriteMoviesStore } from '@/store/favoriteMoviesStore.ts'
import ModalLogIn from '@modals/ModalLogIn.vue'
import ModalReg from '@modals/ModalReg.vue'
import ModalRegCreated from '@modals/ModalRegCreated.vue'

// Используем stores для управления состоянием пользователя и избранных фильмов
const userStore = useUserStore()
const favoriteStore = useFavoriteMoviesStore()

// Определяем интерфейс для props компонента
interface ModalProps {
  modalType: 'login' | 'register' | 'complete', // Тип модального окна
  visible: boolean // Видимость модального окна
}

const props = defineProps<ModalProps>()

// Локальное состояние для текущего типа модального окна
// Это позволяет динамически переключаться между разными модальными окнами
const currentModal = ref<'login' | 'register' | 'complete'>(props.modalType)

// Следим за изменением props.modalType из родительского компонента
// и синхронизируем локальное состояние
watch(() => props.modalType, (newType) => {
  currentModal.value = newType
})

const emit = defineEmits<{
  (e: 'close', visible: boolean): void,
  (e: 'update-modal-type', type: 'login' | 'register' | 'complete'): void
}>()

const closeModal = () => {
  // Сбрасываем ошибки и состояние при закрытии модального окна
  userStore.clearError()
  userStore.isRegCompleted = false
  // Сбрасываем тип модального окна на 'login' для следующего открытия
  currentModal.value = 'login'
  emit('close', false);
}

// Закрываем модальное окно по клику за пределами окна
const handleOverlayClick = () => {
  closeModal();
}

/**
 * Обработка авторизации пользователя
 * Вызывается из ModalLogIn (при отправке формы) или ModalRegCreated (при клике на "Войти")
 * @param payload - данные для авторизации (email и password)
 */
const handleLogin = async (payload?: { email: string; password: string }) => {
  // Если payload отсутствует — просто переключаемся на экран входа
  // Это происходит когда пользователь кликает "Войти" на экране завершения регистрации
  if (!payload) {
    switchToModal('login')
    return
  }

  try {
    // Сбрасываем предыдущую ошибку перед новой попыткой входа
    userStore.clearError()

    // Вызываем метод авторизации из userStore, который использует CINEMA_API
    const res = await userStore.loginUser(payload)

    // Проверяем успешность авторизации
    if (res && userStore.isAuthorized) {
      // После успешной авторизации загружаем избранные фильмы пользователя
      try {
        await favoriteStore.getFavoriteMovies()
      } catch (error) {
        console.warn('Не удалось загрузить избранное:', error)
      }
      // Закрываем модальное окно только при успешном входе
      closeModal()
    }
  } catch (error) {
    console.error('Ошибка авторизации:', error)
    // Ошибка уже установлена в userStore через setError в методе loginUser
    // Она будет автоматически отображена в компоненте ModalLogIn через props
  }
}

// Переключение между модалками
const switchToModal = (modalType: 'login' | 'register' | 'complete') => {
  // Сбрасываем ошибки при переключении между модальными окнами
  userStore.clearError()
  currentModal.value = modalType
  // Эмитим событие родителю для синхронизации типа модального окна
  emit('update-modal-type', modalType)
}

/**
 * Обработка регистрации нового пользователя
 * Вызывается из ModalReg при отправке формы регистрации
 * @param payload - данные для регистрации (name, surname, email, password)
 */
const handleFinishRegister = async (payload?: { name: string; surname: string; email: string; password: string }) => {
  // Если payload отсутствует — просто переключаемся на экран завершения
  if (!payload) {
    switchToModal('complete')
    return
  }

  try {
    // Сбрасываем предыдущую ошибку перед новой попыткой регистрации
    userStore.clearError()

    // Вызываем метод регистрации из userStore, который использует CINEMA_API
    const res = await userStore.registerUser(payload)

    // Проверяем успешность регистрации
    if (res) {
      // Устанавливаем флаг завершения регистрации в store
      userStore.isRegCompleted = true
      // Переходим на экран завершения регистрации (ModalRegCreated)
      switchToModal('complete')
    }
  } catch (error) {
    console.error('Ошибка регистрации:', error)
    // Не переключаемся на complete при ошибке - остаемся на экране регистрации
    // Ошибка уже установлена в userStore через setError в методе registerUser
    // Она будет автоматически отображена в компоненте ModalReg через props
  }
}

/**
 * Динамически возвращает компонент модального окна в зависимости от текущего типа
 * Это позволяет переключаться между разными модальными окнами без перезагрузки
 * @returns компонент модального окна (ModalLogIn, ModalReg или ModalRegCreated)
 */
const getModalComponent = () => {
  switch (currentModal.value) {
    case 'login':
      return ModalLogIn // Компонент авторизации
    case 'register':
      return ModalReg // Компонент регистрации
    case 'complete':
      return ModalRegCreated // Компонент успешного завершения регистрации
    default:
      return ModalLogIn // По умолчанию показываем экран авторизации
  }
}

</script>

<template>
  <transition name="modal" mode="out-in">
    <div v-if="visible" class="overlay" @click.self="handleOverlayClick">
      <!-- Модальное окно -->
      <div class="modal">
        <div class="modal__box" @click.stop>
          <!-- Лого в модальном окне -->
          <img
               src="/marusya_logo_black.png"
               alt="Логотип приложения Маруся"
               class="modal__logo" />
          <!-- Динамически изменяемый контент модального окна -->
          <component
                     :is="getModalComponent()"
                     :error="userStore.error"
                     :is-loading="userStore.isLoading"
                     @switch-to-register="switchToModal('register')"
                     @switch-to-login="switchToModal('login')"
                     @switch-to-complete="switchToModal('complete')"
                     @complete="handleFinishRegister"
                     @login="handleLogin" />
        </div>
        <!-- Кнопка закрытия модального окна -->
        <button @click="closeModal" class="btn-close modal__btn-close">
          <img
               src="/icons/X.svg"
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