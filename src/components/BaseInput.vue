<script setup lang="ts">
defineProps<{
  modelValue: string;
  type?: string;
  placeholder: string;
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

</script>

<template>
  <input
        :value="modelValue"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        :type="type ?? 'text'"
        :placeholder="placeholder" />

</template>

<style scoped>
  input {
    width: 100%;
    padding-inline: 52px;
    padding-block: 16px;
    color: var(--main-white);
    font-size: 18px;
    border: none;
    border-radius: 8px;
    background-color: var(--background-gray-primary);
  }

  input::placeholder {
    font-size: 18px;
  }

</style>