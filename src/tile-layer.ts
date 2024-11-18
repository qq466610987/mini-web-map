import BaseLayer from "./base-layer";
import {
  getTileUrl,
  TILE_SIZE,
  getTileRowAndCol,
  lngLatToMercator,
  getPxFromLngLat,
  resolutions,
  mercatorToLngLat,
} from "./utils";
import Map from "./map";

interface TileLayerOptions {
  map: Map;
  url: string;
}
class TileLayer extends BaseLayer {
  // 持有map对象
  private ctx: CanvasRenderingContext2D;
  private map: Map;
  private width: number;
  private height: number;
  private zoom: number;
  private url: string;
  private currentTileCache: Record<string, boolean> = {};
  private tileCache: Record<string, Tile> = {};

  constructor(options: TileLayerOptions) {
    super()
    this.map = options.map;
    this.url = options.url;
    this.width = this.map.getWidth();
    this.height = this.map.getHeight();
    this.ctx = this.map.getCanvas().getContext("2d");
  }
  render(): void {
    const zoom = this.map.getZoom();
    const center = this.map.getCenter();

    // 中心点对应的瓦片
    let centerTile = getTileRowAndCol(
      ...lngLatToMercator(...center),
      zoom
    );
    // 中心瓦片左上角对应的像素坐标
    let centerTilePos = [
      centerTile[0] * TILE_SIZE,
      centerTile[1] * TILE_SIZE,
    ];
    // 中心点对应的像素坐标
    let centerPos = getPxFromLngLat(...center, zoom);
    // 中心像素坐标距中心瓦片左上角的差值
    let offset = [
      centerPos[0] - centerTilePos[0],
      centerPos[1] - centerTilePos[1],
    ];
    // 计算瓦片数量
    let rowMinNum = Math.ceil((this.width / 2 - offset[0]) / TILE_SIZE);
    let colMinNum = Math.ceil((this.height / 2 - offset[1]) / TILE_SIZE);
    let rowMaxNum = Math.ceil(
      (this.width / 2 - (TILE_SIZE - offset[0])) / TILE_SIZE
    );
    let colMaxNum = Math.ceil(
      (this.height / 2 - (TILE_SIZE - offset[1])) / TILE_SIZE
    );
    // 渲染画布内所有瓦片
    this.currentTileCache = {}; // 清空缓存对象
    for (let i = -rowMinNum; i <= rowMaxNum; i++) {
      for (let j = -colMinNum; j <= colMaxNum; j++) {
        // 当前瓦片的行列号
        let row = centerTile[0] + i;
        let col = centerTile[1] + j;
        // 当前瓦片的显示位置
        let x = i * TILE_SIZE - offset[0];
        let y = j * TILE_SIZE - offset[1];
        // 缓存key
        let cacheKey = row + "_" + col + "_" + zoom;
        // 记录当前需要的瓦片
        this.currentTileCache[cacheKey] = true;
        // 该瓦片已加载过
        if (this.tileCache[cacheKey]) {
          this.tileCache[cacheKey].updatePos(x, y).render();
        } else {
          // 未加载过
          this.tileCache[cacheKey] = new Tile({
            ctx: this.ctx,
            row,
            col,
            zoom: this.zoom,
            x,
            y,
            // 判断瓦片是否在当前画布缓存对象上，是的话则代表需要渲染
            shouldRender: (key) => {
              return this.currentTileCache[key];
            },
          });
        }
      }
    }

  }
}

/**
 * 一个切片
 */
interface TileOptions {
  ctx: CanvasRenderingContext2D;
  row: number;
  col: number;
  zoom: number;
  x: number;
  y: number;
  shouldRender: (key: string) => boolean;
}
/**
 * 一个切片
 */
class Tile {
  private ctx: CanvasRenderingContext2D;
  private url: string;
  private cacheKey: string;
  private img: HTMLImageElement | null = null;
  private loaded: boolean = false;
  private timer: NodeJS.Timeout | null = null;
  private row: number;
  private col: number;
  private zoom: number;
  private x: number;
  private y: number;
  private shouldRender: (key: string) => boolean;

  constructor({ ctx, row, col, zoom, x, y, shouldRender }: TileOptions) {
    // 用传入的参数初始化实例
    Object.assign(this, {
      ctx,
      row,
      col,
      zoom,
      x,
      y,
      shouldRender,
      url: ""
    });
    // 缓存key
    this.cacheKey = this.row + "_" + this.col + "_" + this.zoom;
    this.createUrl();
    this.load();
  }

  // 生成url
  createUrl() {
    this.url = getTileUrl(this.row, this.col, this.zoom);
  }

  // 加载图片
  load() {
    this.img = new Image();
    this.img.src = this.url;
    // 加载超时，重新加载
    this.timer = setTimeout(() => {
      this.createUrl();
      this.load();
    }, 1000);
    this.img.onload = () => {
      clearTimeout(this.timer);
      this.loaded = true;
      this.render();
    };
  }

  // 将图片渲染到canvas上
  render() {
    if (!this.loaded || !this.shouldRender(this.cacheKey)) {
      return;
    }
    this.ctx.drawImage(this.img!, this.x, this.y);
  }

  // 更新位置
  updatePos(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }
}

export default TileLayer