// 实现marker图层
import BaseLayer from "./base-layer";
import Map from "./map";
import { getPxFromLngLat } from "./utils";

class MarkerLayer extends BaseLayer {
  private ctx: CanvasRenderingContext2D;
  private longitude: number;
  private latitude: number;
  private imgSrc: string;
  private width: number = 40;
  private height: number = 40;
  private container: HTMLElement;

  constructor(options: {
    imgSrc: string,
    longitude: number,
    latitude: number,
  }) {
    super();
    Object.assign(this, options);
    this.ctx = this.getMap()?.getCtx()
  }
  public render(): void {
    debugger;
    // 将经纬度转换为像素坐标，再将像素坐标转换为屏幕坐标
    const zoom = this.map!.getZoom();
    const [x, y] = getPxFromLngLat(this.longitude, this.latitude, zoom);
    // 获取屏幕中心点的像素坐标
    const center = this.map!.getCenter()
    const [centerX, centerY] = getPxFromLngLat(...[...center, zoom]);
    const [offsetX, offsetY] = [centerX - x, centerY - y];
    let img = new Image();
    img.src = this.imgSrc;
    img.onload = () => {
      this.getMap()?.getCtx().drawImage(img, -offsetX, -offsetY,this.width,this.height)
    }
  }
}

export default MarkerLayer;
