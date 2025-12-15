<script setup lang="ts">
import { ref } from 'vue'

const name = ref('')
const surname = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const isLoading = ref<boolean>(false)
const error = ref<string>('')

const emit = defineEmits<{
       (e: 'switch-to-login'): void,
       (e: 'switch-to-complete'): void,
       (e: 'complete', data: { name: string, surname: string, email: string, password: string }): void
}>()

const handleRegister = async () => {
       isLoading.value = true;
       try {
              console.log('При регистрации добавлено:', {
                     name: name.value,
                     surname: surname.value,
                     email: email.value,
                     password: password.value
              })
              emit('complete', { name: name.value, surname: surname.value, email: email.value, password: password.value })
              handleSwitchToComplete()

       } catch (err) {
              error.value = 'Ошибка при регистрации'
              console.error(error.value + ' : ' + err)
       } finally {
              isLoading.value = false
       }
}

const handleSwitchToComplete = () => {
       name.value = ''
       surname.value = ''
       email.value = ''
       password.value = ''
       confirmPassword.value = ''
       error.value = ''
       emit('switch-to-complete')
       console.log("Switch to complete");
}

const handleSwitchToLogin = () => {
       name.value = ''
       surname.value = ''
       email.value = ''
       password.value = ''
       confirmPassword.value = ''
       error.value = ''
       emit('switch-to-login')
}

</script>

<template>
       <form class="modal__content-wrapper" @submit.prevent="handleRegister">
              <div v-if="error" class="modal__error">{{ error }}</div>
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