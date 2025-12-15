<script setup lang="ts">
import { ref } from 'vue'


const email = ref('')
const password = ref('')
const isLoading = ref(false)
const error = ref('')

const emit = defineEmits<{
  (e: 'switch-to-register'): void,
  (e: 'login', credentials: { email: string, password: string }): void
}>()

const handleLogin = async () => {
  if (!email.value || !password.value) {
    error.value = 'Заполните все поля'
    return
  }
  isLoading.value = true
  try {
    // TODO: Добавить реальный запрос к API
    // await loginAPI(email.value, password.value)
    console.log('Login attempt: ', { email: email.value, password: password.value })
    emit('login', { email: email.value, password: password.value })
  } catch (err) {
    error.value = 'Ошибка при входе'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

const handleSwitchToRegister = () => {
  email.value = ''
  password.value = ''
  error.value = ''
  emit('switch-to-register')
}

</script>

<template>
  <form class="modal__content-wrapper" @submit.prevent="handleLogin">
    <div v-if="error" class="modal__error">{{ error }}</div>
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
            :disabled="isLoading">
      Войти
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