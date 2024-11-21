// 实现marker图层
import BaseLayer from "./base-layer";
import Map from "./map";
import { getPxFromLngLat } from "./utils";

class MarkerLayer extends BaseLayer {
  private ctx: CanvasRenderingContext2D;
  private longitude: number;
  private latitude: number;
  private image: HTMLImageElement;
  private width: number;
  private height: number;
  private map: Map;

  public render(): void {
    // 其实要实现的就是根据经纬度，通过一系列计算获得像素坐标
    // 然后当鼠标拖动的时候，对图标进行平移
    const zoom = this.map.getZoom();
    const [x, y] = getPxFromLngLat(this.longitude, this.latitude, zoom);
    this.ctx.drawImage(this.image, x - 16, y - 32);
  }
}

export default MarkerLayer;
