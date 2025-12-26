<script setup lang="ts">
const props = defineProps<{
  modelValue: string;
  type?: string;
  placeholder?: string;
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'input', ev: Event): void
  (e: 'focus', ev: FocusEvent): void
  (e: 'blur', ev: FocusEvent): void
}>()


</script>

<template>
  <input
         :value="modelValue"
         @input="(e) => { const v = (e.target as HTMLInputElement).value; emit('update:modelValue', v); emit('input', e); }"
         @focus="(e) => emit('focus', e)"
         @blur="(e) => emit('blur', e)"
         :type="type ?? 'text'"
         :placeholder="placeholder ?? ''" />

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