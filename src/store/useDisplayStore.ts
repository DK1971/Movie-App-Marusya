import { defineStore } from "pinia";
import { ref, onMounted, onUnmounted } from "vue";

export const useDisplayStore = defineStore("display", () => {
  const width = ref(window.innerWidth);
  const isDesktop = ref(window.innerWidth < 1440);
  const isLaptop = ref(window.innerWidth < 1280);
  const isTablet = ref(window.innerWidth < 1024);
  const isMobile = ref(window.innerWidth < 768);

  const updateWidth = () => {
    width.value = window.innerWidth;
    isDesktop.value = window.innerWidth < 1440;
    isLaptop.value = window.innerWidth < 1280;
    isTablet.value = window.innerWidth < 1024;
    isMobile.value = window.innerWidth < 768;
  };

  onMounted(() => {
    window.addEventListener("resize", updateWidth);
  });

  onUnmounted(() => {
    window.removeEventListener("resize", updateWidth);
  });

  return {
    width,
    isDesktop,
    isLaptop,
    isTablet,
    isMobile,
    updateWidth,
  };
});
