<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import type { IUser } from "../types/auth.ts";
import { useUserStore } from '../store/userStore.ts'


const userStore = useUserStore()
const { isAuthorized } = storeToRefs(userStore)

const userName = ref<string | undefined>('')
userName.value = userStore.user?.name

const emit = defineEmits<{
  (e: 'open-modal'): void
  (e: 'open-account'): void
}>()

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

<style scoped></style>