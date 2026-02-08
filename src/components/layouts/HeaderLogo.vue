<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();

const goHomePage = () => {
  router.push("/")
}

</script>

<template>
  <img
       @click="goHomePage"
       src="/marusya-logo-white.svg"
       class="marusia-white"
       alt="Логотип онлайн кинотеатра ВК Маруся">
</template>

<style scoped>
  .marusia-white {
    width: 143px;
    height: 32px;
    cursor: pointer;
  }

  @media (max-width: 960px) {
    .marusia-white {
      width: 115px;
      height: 24px;
    }
  }

  @media (max-width: 480px) {
    .marusia-white {
      width: 80px;
      height: 18px;
    }
  }


</style>