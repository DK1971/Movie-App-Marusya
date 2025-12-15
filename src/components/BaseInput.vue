<script setup lang="ts">
defineProps<{
  type: string;
  id: string;
  placeholder: string;
}>()
</script>

<template>
  <input
         :type="type"
         :id="id"
         :placeholder="placeholder" />
</template>

<style scoped>

</style>