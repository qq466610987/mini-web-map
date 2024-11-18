import Konva from "konva";
import Img from "./img";
import { getTileUrlPro } from "./utils";

// 瓦片类
type TileConstructorParams = {
  layer: Konva.Layer; // 瓦片显示图层
  row: number;
  col: number;
  zoom: number;
  x: number;
  y: number;
  shouldRender: (tile: Tile) => boolean; // 判断是否应该渲染
  getMapTypeData: () => any;
}

class Tile {
  private layer: Konva.Layer; // 瓦片显示图层
  private row: number;
  private col: number;
  private zoom: number;
  private x: number;
  private y: number;
  private shouldRender: (tile: Tile) => boolean; // 判断是否应该渲染
  private getMapTypeData: () => any;
  private urls: string[]; // 瓦片url
  private cacheKey: string; // 缓存key
  private imgs: Konva.Image[]; // 瓦片图片
  private opacity: number; // 瓦片透明度
  private loaded: boolean; // 图片是否加载完成
  private timer: any; // 图片加载超时定时器
  private fadeInDuration: number; // 瓦片渐现过渡时间

  constructor(options: TileConstructorParams) {
    this.layer = options.layer;
    // 瓦片行列号
    this.row = options.row;
    this.col = options.col;
    // 瓦片层级
    this.zoom = options.zoom;
    // 显示位置
    this.x = options.x;
    this.y = options.y;
    // 判断瓦片是否应该渲染
    this.shouldRender = options.shouldRender;
    // 获取当前地图类型数据
    this.getMapTypeData = options.getMapTypeData;
    // 瓦片url
    this.urls = [];
    // 缓存key
    this.cacheKey = this.row + "_" + this.col + "_" + this.zoom;
    // 瓦片图片
    this.imgs = [];
    // 瓦片透明度
    this.opacity = 0;
    // 图片是否加载完成
    this.loaded = false;
    // 图片加载超时定时器
    this.timer = null;
    // 瓦片渐现过渡时间
    this.fadeInDuration = 400;

    this.createUrl();
    this.load();
  }

  // 生成url
  createUrl() {
    let mapData = this.getMapTypeData()
    this.urls = mapData.urls.map((url) => {
      return getTileUrlPro(this.row, this.col, this.zoom, url, { getTileUrl: mapData.getTileUrl, transformXYZ: mapData.transformXYZ })
    });
  }

  // 加载图片
  load() {
    let tasks = this.urls.map((url, index) => {
      return new Promise((resolve) => {
        new Img(url, (img) => {
          if (img) {
            this.imgs[index] = new Konva.Image({
              image: img,
              width: TILE_SIZE,
              height: TILE_SIZE,
              opacity: this.opacity,
            })
          }
          resolve()
        })
      })
    })
    Promise.all(tasks)
      .then(() => {
        this.loaded = true
        this.render()
      })
  }

  // 渲染
  render(isFadeIn = false) {
    if (!this.loaded || this.imgs.length <= 0 || !this.shouldRender(this.cacheKey)) {
      return;
    }
    // 添加到图层
    this.imgs.forEach((img) => {
      if (img) {
        this.layer.add(img);
        // 设置显示位置
        img.x(this.x).y(this.y);
      }
    });
    // 需要渐现
    if (isFadeIn && this.opacity !== 0) {
      this.hide();
    }
    this.fadeIn();
  }

  // 渐现
  fadeIn() {
    if (this.opacity >= 1 || this.imgs.length <= 0) {
      return;
    }
    let base = this.opacity;
    let anim = new Konva.Animation((frame) => {
      let opacity = (frame.time / this.fadeInDuration) * 1 + base;
      this.opacity = opacity;
      this.imgs.forEach((img) => {
        if (img) {
          img.opacity(opacity);
        }
      });
      if (opacity >= 1) {
        anim.stop();
      }
    }, this.layer);
    anim.start();
  }

  // 隐藏
  hide() {
    if (this.imgs.length <= 0) {
      return
    }
    this.opacity = 0;
    this.imgs.forEach((img) => {
      if (img) {
        img.opacity(0);
      }
    });
  }

  // 更新要添加到的图层
  updateLayer(layer) {
    this.layer = layer;
    return this;
  }

  // 更新位置
  updatePos(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }
}
export default Tile