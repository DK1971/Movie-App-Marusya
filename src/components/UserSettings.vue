<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useRouter } from "vue-router";
import { useUserStore } from '../store/userStore.ts'

const router = useRouter();
const userStore = useUserStore()
const { isAuthorized } = storeToRefs(userStore)

const handleLogout = () => {
  userStore.logOut()
  router.push('/');
}

const user = userStore.user
const name = user?.name
const surname = user?.surname
const email = user?.email;

const getInitials = (name: string, surname: string): string => {
  const first = name?.trim()?.charAt(0).toUpperCase() ?? "";
  const second = surname?.trim()?.charAt(0).toUpperCase() ?? "";
  return `${first}${second}`;
};

</script>

<template>
  <section class="setting">
    <div class="setting__item">
      <div class="setting__avatar avatar">

        {{ getInitials(name, surname) }}
      </div>
      <div class="setting__row-title row-title">Имя Фамилия:</div>
      <div class="setting__row-desc row-desc">
        {{ name }} {{ surname }}
      </div>
    </div>
    <div class="setting__item">
      <div class="setting__avatar avatar">
        <svg
             width="24"
             height="25"
             viewBox="0 0 24 25"
             fill="none"
             xmlns="http://www.w3.org/2000/svg">
          <path
                d="M21 3.75C21.5523 3.75 22 4.19772 22 4.75V20.7566C22 21.3052 21.5447 21.75 21.0082 21.75H2.9918C2.44405 21.75 2 21.3051 2 20.7566V19.75H20V8.05L12 15.25L2 6.25V4.75C2 4.19772 2.44772 3.75 3 3.75H21ZM8 15.75V17.75H0V15.75H8ZM5 10.75V12.75H0V10.75H5ZM19.5659 5.75H4.43414L12 12.5593L19.5659 5.75Z"
                fill="rgba(0, 0, 0, 0.4)" />
        </svg>
      </div>
      <div class="setting__row-title row-title">Электронная почта:</div>
      <div class="setting__row-desc row-desc">
        <!-- email@emai.com -->
        {{ email }}
      </div>
    </div>
    <button
            v-if="isAuthorized"
            @click="handleLogout"
            class="logout-button">
      Выйти из аккаунта
    </button>
  </section>
</template>

<style scoped>
  .setting {
    /* background-color: var(--background-main-section); */
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 40px;
  }

  .setting__item {
    display: grid;
    grid-template-columns: 60px 16px 1fr;
    grid-template-rows: repeat(2 30px);
    grid-template-areas:
      "avatar empty title"
      "avatar empty desc";
  }

  .avatar {
    grid-area: avatar;
  }

  .row-title {
    grid-area: title;
  }

  .row-desc {
    grid-area: desc;
  }


  .setting__avatar {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: var(--main-white);
    color: var(--background-card);
    font-size: 24px;
    font-weight: 700;
  }

  /* .setting__row {} */

  .setting__row-title {
    font-size: 18px;
    font-weight: 400;
    line-height: 24px;
    text-align: left;
  }

  .setting__row-desc {
    font-size: 24px;
    font-weight: 700;
    line-height: 32px;
    text-align: left;
  }

  .logout-button {
    background-color: var(--background-lightblue);
  }

</style>