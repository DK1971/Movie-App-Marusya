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

const name = ref('')
const surname = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const localError = ref<string>('')

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
       (e: 'switch-to-login'): void,
       (e: 'switch-to-complete'): void,
       (e: 'complete', data: {
              name: string,
              surname: string,
              email: string,
              password: string
       }): void
}>()

// Валидация email
const validateEmail = (email: string): boolean => {
       const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
       return emailRegex.test(email)
}

// Валидация формы
const validateForm = (): boolean => {
       localError.value = ''

       // Проверка заполненности полей
       if (!email.value || !name.value || !surname.value || !password.value || !confirmPassword.value) {
              localError.value = 'Заполните все поля'
              return false
       }

       // Валидация email
       if (!validateEmail(email.value)) {
              localError.value = 'Некорректный email адрес'
              return false
       }

       // Проверка длины пароля
       if (password.value.length < 6) {
              localError.value = 'Пароль должен содержать минимум 6 символов'
              return false
       }

       // Проверка совпадения паролей
       if (password.value !== confirmPassword.value) {
              localError.value = 'Пароли не совпадают'
              return false
       }

       return true
}

const handleRegister = async () => {
       // Валидация формы перед отправкой
       if (!validateForm()) {
              return
       }

       localError.value = ''

       try {
              console.log('Регистрация пользователя:', {
                     name: name.value,
                     surname: surname.value,
                     email: email.value,
                     password: password.value
              })

              // Эмитим событие с данными для регистрации
              emit('complete', {
                     name: name.value,
                     surname: surname.value,
                     email: email.value,
                     password: password.value
              })
       } catch (err) {
              localError.value = 'Ошибка при регистрации'
              console.error('Registration error:', err)
       }
}

const clearForm = () => {
       name.value = ''
       surname.value = ''
       email.value = ''
       password.value = ''
       confirmPassword.value = ''
       localError.value = ''
}

const handleSwitchToLogin = () => {
       clearForm()
       emit('switch-to-login')
}



</script>

<template>
       <form class="modal__content-wrapper" @submit.prevent="handleRegister">
              <div v-if="displayError" class="modal__error">{{ displayError }}</div>
              <input
                     v-model="email"
                     id="email"
                     type="email"
                     class="modal__input mail-icon"
                     placeholder="Электронная почта"
                     required />
              <input
                     v-model="name"
                     id="name"
                     type="text"
                     class="modal__input name-icon"
                     placeholder="Имя"
                     required />
              <input
                     v-model="surname"
                     id="surname"
                     type="text"
                     class="modal__input name-icon"
                     placeholder="Фамилия"
                     required />
              <input
                     v-model="password"
                     id="password"
                     type="password"
                     class="modal__input password-icon"
                     placeholder="Пароль"
                     required />
              <input
                     v-model="confirmPassword"
                     id="confirm-password"
                     type="password"
                     class="modal__input password-icon"
                     placeholder="Подтвердите пароль"
                     required />
              <button
                      type="submit"
                      class="modal__btn-enter"
                      :disabled="props.isLoading">
                     {{ props.isLoading ? 'Создание...' : 'Создать аккаунт' }}
              </button>
              <!-- Переход на другое модальное окно -->
              <p @click="handleSwitchToLogin" class="link-register">У меня есть пароль</p>
       </form>
</template>

<style scoped>
       .modal__error {
              color: #d32f2f;
              margin-bottom: 16px;
              font-size: 14px;
       }
</style>