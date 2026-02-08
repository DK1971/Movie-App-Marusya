<script setup lang="ts">
const emit = defineEmits<{
  (e: 'login'): void
}>()

const handleLogin = () => {
  emit('login')
}

</script>

<template>
  <div class="modal__content-wrapper">
    <h3 class="modal__title">Регистрация завершена</h3>
    <p class="modal__desc">Используйте вашу электронную почту для входа</p>
    <button
            type="button"
            class="modal__btn-enter"
            @click="handleLogin">
      Войти
    </button>
  </div>
</template>

<style scoped></style>
