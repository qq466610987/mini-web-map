// 实现marker图层
import BaseLayer from "./base-layer";
import Map from "./map";
import { getPxFromLngLat } from "./utils";

class MarkerLayer extends BaseLayer {
  private ctx: CanvasRenderingContext2D;
  private longitude: number;
  private latitude: number;
  private imgSrc: string;
  private width: number;
  private height: number;
  private map: Map;
  private container: HTMLElement;
  private markerDiv: HTMLDivElement;

  constructor() {
    super();
    this.container = document.createElement("div");
    this.container.className = 'marker-container'
    this.container.style.position = "absolute";
    this.container.style.height = "100%"
    this.map.getContainer().appendChild(this.container);

    this.markerDiv = document.createElement("div");
    const img = document.createElement("img")
    img.src = this.imgSrc
    this.markerDiv.appendChild(
      img
    )

  }
  public render(): void {
    // 其实要实现的就是根据经纬度，通过一系列计算获得像素坐标
    // 然后当鼠标拖动的时候，对图标进行平移
    const zoom = this.map.getZoom();
    const [x, y] = getPxFromLngLat(this.longitude, this.latitude, zoom);
    this.markerDiv.style.translate = `${x}px ${y}px`;
  }
}

export default MarkerLayer;
