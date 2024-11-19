<template>
  <div class="app">
      <Map />
  </div>
</template>

<script setup lang="ts">
import Map from "./map2.vue";
</script>

<style scoped>
.app {
  height: 100%;
}
.btnGroup {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  bottom: 50px;
  display: flex;
  height: 30px;
  background-color: #fff;
  border: 1px solid #b3b3b3;
  border-radius: 5px;
  overflow: hidden;
  line-height: 30px;
  cursor: pointer;
}

.btn {
  padding: 0 16px;
}

.btn.active {
  background-color: #e0e0e0;
}
</style>