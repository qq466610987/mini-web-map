import Map from "./map";

abstract class BaseLayer {
  z: number; //层级
  visible: boolean;
  opacity: boolean;
  map: Map | null = null; // 指向地图容器对象
  abstract render(): void
  getMap() {
    return this.map;
  }
  setMap(map: Map) {
    this.map = map;
  }
}

export default BaseLayer