<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/store/userStore.ts'

// === СОСТОЯНИЕ ИЗ ХРАНИЛИЩ ===
// UserStore
const userStore = useUserStore()
const { user, isAuthorized } = storeToRefs(userStore)

// === ВЫЧИСЛЯЕМЫЕ СВОЙСТВА ===
// Используем computed для реактивности
const userName = computed(() => user.value?.name || 'User')

// === EVENTS ===
const emit = defineEmits<{
  (e: 'open-modal'): void
  (e: 'open-account'): void
}>()

// === МЕТОДЫ ===
const openModal = () => {
  emit('open-modal')
}

const openAccount = () => {
  emit('open-account')
}

</script>

<template>
  <button
          v-if="!isAuthorized"
          @click="openModal"
          class="btn-auth">
    <span>Войти</span>
  </button>
  <button
          v-else
          @click="openAccount"
          class="btn-auth">
    <span>{{ userName }}</span>
  </button>

</template>

<style scoped>
  .btn-auth {
    position: relative;
    display: flex;
    align-items: center;
    color: var(--main-white);
    text-decoration: none;
  }

  .btn-auth::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 2px;
    background-color: rgba(220, 93, 252, 1);
    transform: scaleX(0);
    transition: transform 0.3s ease;
  }

  .btn-auth:active::after,
  .btn-auth:hover::after {
    transform: scaleX(1);
  }
</style>