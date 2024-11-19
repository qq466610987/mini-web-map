import {
  lngLatToMercator,
  resolutions,
  mercatorToLngLat
} from "./utils";
import Layer from "./base-layer";
import { animate } from "popmotion";
import { omit } from "lodash-es";

interface MapOptions {
  container: HTMLElement;
  center: [number, number];
  zoom: number;
  layers: Layer[];
}

class Map {
  private ctx: CanvasRenderingContext2D;
  private container: HTMLElement;
  private width: number;
  private height: number;
  private zoom: number = 15;
  private minZoom: number = 1;
  private maxZoom: number = 18;
  protected _lastZoom: number = 0;
  private center: [number, number] = [120.19, 30.26];
  private layers: Layer[] = [];
  private _isMousedown: boolean = false;
  private scale: number = 1; // 当前缩放值
  private scaleTmp: number = 1; // 目标缩放值
  private playback: any; // 动画
  constructor(options: MapOptions) {
    Object.assign(this, omit(options, "layers"));
    // 用addLayer方法添加图层，这样图层就可以访问到地图对象
    options.layers.forEach(layer => {
      this.addLayer(layer);
    });
    // 初始化dom
    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;
    // 创建画布
    let canvas = document.createElement("canvas");
    canvas.width = this.width;
    canvas.height = this.height;
    canvas.addEventListener('mousedown', this.onMousedown.bind(this));
    this.ctx = canvas.getContext("2d")!;
    // 移动画布原点
    this.ctx.translate(this.width / 2, this.height / 2);
    this.container.appendChild(canvas);
    // 添加事件监听
    window.addEventListener("mousemove", this.onMousemove.bind(this));
    window.addEventListener("mouseup", this.onMouseup.bind(this));
    window.addEventListener("wheel", this.onMousewheel.bind(this));
    // 初始渲染
    this.render();
  }

  getWidth(): number {
    return this.width;
  }
  getHeight(): number {
    return this.height;
  }
  getZoom(): number {
    return this.zoom;
  }
  getCenter(): [number, number] {
    return this.center;
  }
  getCtx(): CanvasRenderingContext2D {
    return this.ctx;
  }
  render(): void {
    // 清空画布
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.layers.forEach(layer => {
      layer.render();
    });
  }
  private onMousemove(e: MouseEvent) {
    if (!this._isMousedown) {
      return;
    }
    // 计算本次拖动的距离对应的经纬度数据
    let mx = e.movementX * resolutions[this.zoom];
    let my = e.movementY * resolutions[this.zoom];
    let [x, y] = lngLatToMercator(...this.center);
    // 更新拖动后的中心点经纬度
    this.center = mercatorToLngLat(x - mx, my + y);
    // 重新渲染
    this.render();
  }
  // 鼠标松开
  private onMouseup() {
    this._isMousedown = false;
  }
  // 鼠标按下
  onMousedown(e: MouseEvent) {
    if (e.which === 1) {
      this._isMousedown = true;
    }
  }
  // 鼠标滚动
  private onMousewheel(e: WheelEvent) {
    if (e.deltaY > 0) {
      // 层级变小
      if (this.zoom > this.minZoom) this.zoom--;
    } else {
      // 层级变大
      if (this.zoom < this.maxZoom) this.zoom++;
    }
    // 层级未发生改变
    if (this._lastZoom === this.zoom) {
      return;
    }
    this._lastZoom = this.zoom;
    // 更新缩放比例，也就是目标缩放值
    this.scale *= e.deltaY > 0 ? 0.5 : 2;
    // 停止上一次动画
    if (this.playback) {
      this.playback.stop();
    }
    // 开启动画
    this.playback = animate({
      from: this.scaleTmp, // 当前缩放值
      to: this.scale, // 目标缩放值
      onUpdate: (latest) => {
        // 实时更新当前缩放值
        this.scaleTmp = latest;
        // 保存画布之前状态，原因有二：
        // 1.scale方法是会在之前的状态上叠加的，比如初始是1，第一次执行scale(2,2)，第二次执行scale(3,3)，最终缩放值不是3，而是6，所以每次缩放完就恢复状态，那么就相当于每次都是从初始值1开始缩放，效果就对了
        // 2.保证缩放效果只对重新渲染已有瓦片生效，不会对最后的renderTiles()造成影响
        this.ctx.save();
        this.clear();
        this.ctx.scale(latest, latest);
        // 刷新当前画布上的瓦片
        this.render();
        // Object.keys(this.currentTileCache).forEach((tile) => {
        //   this.tileCache[tile].render();
        // });
        // 恢复到画布之前状态
        this.ctx.restore();
      },
      onComplete: () => {
        // 动画完成后将缩放值重置为1
        this.scale = 1;
        this.scaleTmp = 1;
        // 根据最终缩放值重新计算需要的瓦片并渲染
        this.render();
      },
    });
  }

  public addLayer(layer: Layer) {
    layer.setMap(this);
    this.layers.push(layer);
  }

  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }
}

export default Map;
