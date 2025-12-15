<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUserStore } from '../../store/userStore.ts'

const userStore = useUserStore()

const email = ref('')
const password = ref('')
const isLoading = ref(false)
// локальная ошибка теперь может отображать store.error, но можно иметь локальную для валидации
const localError = ref('')

const emit = defineEmits<{
  (e: 'switch-to-register'): void,
  (e: 'login', credentials?: { email: string, password: string }): void
}>()

const handleLogin = async () => {
  localError.value = ''
  if (!email.value || !password.value) {
    localError.value = 'Заполните все поля'
    return
  }
  isLoading.value = true
  try {
    // вызываем родительский обработчик через emit — родитель вернёт результат в store
    emit('login', { email: email.value, password: password.value })
  } catch (err) {
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

const handleSwitchToRegister = () => {
  email.value = ''
  password.value = ''
  localError.value = ''
  emit('switch-to-register')
}

// computed для отображения ошибки из store, если есть
const serverError = computed(() => userStore.error)

</script>

<template>
  <form class="modal__content-wrapper" @submit.prevent="handleLogin">
    <div v-if="localError" class="modal__error">{{ localError }}</div>
    <div v-else-if="serverError" class="modal__error">{{ serverError }}</div>
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