<template>
  <div ref="container" class="map">
    <!-- <div class="center">{{ this.center[0] + "," + this.center[1] }}</div> -->
    <div class="line lineX"></div>
    <div class="line lineY"></div>
  </div>
</template>

<script setup lang="ts">
import Map from "./map";
import TileLayer from "./tile-layer";
import MarkerLayer from "./marker";
import { onMounted, ref } from "vue";
const container = ref<HTMLDivElement | null>(null);

onMounted(() => {
  const map = new Map({
    container: container.value!,
    center: [120.148732, 30.231006],
    zoom: 17,
    layers: [
      new TileLayer({
        url: "https://webrd02.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
      }),
      new MarkerLayer({
        imgSrc: new URL("./assets/poi.png", import.meta.url).href,
        longitude: 120.148732,
        latitude: 30.231006,
      })
    ],
  });
});
</script>

<style scoped>
.map {
  width: 100%;
  height: 100%;
}

.line {
  position: absolute;
  background-color: #000;
}

.lineX {
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 50px;
  height: 2px;
}

.lineY {
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  height: 50px;
  width: 2px;
}

.center {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translateX(-50%);
}
</style>
