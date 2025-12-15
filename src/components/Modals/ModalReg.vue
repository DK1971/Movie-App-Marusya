<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUserStore } from '../../store/userStore.ts'

const userStore = useUserStore()

const name = ref('')
const surname = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const isLoading = ref<boolean>(false)
const localError = ref<string>('')

const emit = defineEmits<{
       (e: 'switch-to-login'): void,
       (e: 'complete', data: { name: string, surname: string, email: string, password: string }): void
}>()

// Показываем ошибку из стора (server) или локальную валидацию
const serverError = computed(() => userStore.error)
const visibleError = computed(() => localError.value || serverError.value || '')

const handleRegister = async () => {
       localError.value = ''
       userStore.error = null // сбрасываем старые серверные ошибки
       isLoading.value = true;

       try {
              // basic validation
              if (!email.value || !password.value || !name.value || !surname.value) {
                     localError.value = 'Заполните все поля';
                     return;
              }
              if (password.value !== confirmPassword.value) {
                     localError.value = 'Пароли не совпадают';
                     return;
              }

              const payload = {
                     name: name.value,
                     surname: surname.value,
                     email: email.value,
                     password: password.value
              };

              console.log('При регистрации добавлено:', payload)
              // Отправляем данные родителю; родитель (BaseModal) выполнит запрос регистрации
              emit('complete', payload)

              // НЕ очищаем и НЕ переключаем модалку здесь.
              // Родитель контролирует переход на экран "complete" только после успешной регистрации.
       } catch (err) {
              localError.value = 'Ошибка при регистрации'
              console.error(localError.value + ' : ' + err)
       } finally {
              isLoading.value = false
       }
}

const handleSwitchToLogin = () => {
       // не очищаем поля принудительно — пользователь может вернуться
       localError.value = ''
       userStore.error = null
       emit('switch-to-login')
}

</script>

<template>
       <form class="modal__content-wrapper" @submit.prevent="handleRegister">
              <div v-if="visibleError" class="modal__error">{{ visibleError }}</div>
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
                      :disabled="isLoading">
                     Создать аккаунт
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