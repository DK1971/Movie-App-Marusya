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
       src="/marusya_logo_white_d.png"
       class="marusia-white"
       alt="Логотип онлайн кинотеатра ВК Маруся">
</template>

<style scoped>
  .marusia-white {
    width: 143px;
    height: 32px;
  }
</style>