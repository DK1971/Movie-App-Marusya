<script setup lang="ts">
import { ref, computed, watch } from 'vue'

// Props для получения ошибок и состояния загрузки из родительского компонента
interface Props {
  error?: string | null
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  error: null,
  isLoading: false
})

const email = ref('')
const password = ref('')
const localError = ref('')

// Комбинированная ошибка (локальная валидация + ошибка от API)
const displayError = computed(() => {
  // Приоритет: сначала локальная ошибка валидации, затем ошибка от API
  return localError.value || props.error || ''
})

// Следим за изменением ошибки от API и сбрасываем локальную ошибку при переключении
watch(() => props.error, (newError) => {
  if (newError) {
    localError.value = ''
  }
})

const emit = defineEmits<{
  (e: 'switch-to-register'): void,
  (e: 'login', credentials: { email: string, password: string }): void
}>()

// Валидация email
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Валидация формы
const validateForm = (): boolean => {
  localError.value = ''
  if (!email.value || !password.value) {
    localError.value = 'Заполните все поля'
    return false
  }
  if (!validateEmail(email.value)) {
    localError.value = 'Некорректный email адрес'
    return false
  }
  return true
}

const handleLogin = async () => {
  // Валидация формы перед отправкой
  if (!validateForm()) {
    return
  }

  localError.value = ''

  try {
    console.log('Попытка входа:', { email: email.value })

    // Эмитим событие с учетными данными
    emit('login', {
      email: email.value,
      password: password.value
    })
  } catch (err) {
    localError.value = 'Ошибка при входе'
    console.error('Login error:', err)
  }
}

const clearForm = () => {
  email.value = ''
  password.value = ''
  localError.value = ''
}

const handleSwitchToRegister = () => {
  clearForm()
  emit('switch-to-register')
}

</script>

<template>
  <form class="modal__content-wrapper" @submit.prevent="handleLogin">
    <div v-if="displayError" class="modal__error">{{ displayError }}</div>
    <input
           v-model="email"
           id="email"
           type="email"
           class="modal__input mail-icon"
           placeholder="Электронная почта"
           required />
    <input
           v-model="password"
           id="password"
           type="password"
           class="modal__input password-icon"
           placeholder="Пароль"
           required />
    <button
            type="submit"
            class="modal__btn-enter"
            :disabled="props.isLoading">
      {{ props.isLoading ? 'Вход...' : 'Войти' }}
    </button>
    <!-- Переход на другое модальное окно -->
    <p @click="handleSwitchToRegister" class="link-register">Регистрация</p>
  </form>
</template>

<style scoped>
  .modal__error {
    color: #d32f2f;
    margin-bottom: 16px;
    font-size: 14px;
  }
</style>