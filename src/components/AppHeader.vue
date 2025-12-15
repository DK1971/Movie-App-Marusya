<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from "vue-router";
import HeaderLogo from './HeaderLogo.vue';
import HeaderMenu from './HeaderMenu.vue';
import HeaderAuth from './HeaderAuth.vue';
import { useUserStore } from '../store/userStore.ts'

const userStore = useUserStore()
const { isAuthorized } = storeToRefs(userStore)

const router = useRouter();

const emit = defineEmits<{
  (e: 'open'): void
  (e: 'open-account'): void
}>()

const openModal = () => {
  emit('open')
}

const goToAccount = () => {
  emit('open-account')
  router.push("/account/favorites");
};

const handleAuthClick = () => {
  if (isAuthorized.value) {
    goToAccount()
  } else {
    openModal()
  }
}

</script>

<template>
  <header id="top" class="header">
    <div class="container header__container">
      <HeaderLogo />
      <HeaderMenu />
      <HeaderAuth @click="handleAuthClick" />
    </div>
  </header>
</template>

<style scoped>
  .header {
    background-color: var(--background-header);
  }

  .header__container {
    padding-block: 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 80px;
  }

  .marusia-white {
    width: 143px;
    height: 32px;
  }

  @media (max-width: 1280px) {
    .header__container {
      gap: 40px;
    }
  }
</style>