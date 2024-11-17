
class Map {
  private _Layers: any;
  private center;

  constructor() {

  }

      // 计算显示范围内的瓦片行列号
      renderTiles(isFadeIn = false) {
        let center = this.center
        // 需要转换经纬度
        if (this.selectMapData.transformLngLat) {
          center = this.selectMapData.transformLngLat(...this.center)
        }
        // 地图自定义数据
        let plusOpt = {
          origin: this.selectMapData.origin,
          resolutions: this.selectMapData.resolutions,
          lngLatToMercator: this.selectMapData.lngLatToMercator
        }
        // 中心点对应的瓦片
        let centerTile = getTileRowAndCol(...center, this.zoom, plusOpt);
        // 中心瓦片左上角对应的像素坐标
        let centerTilePos = [
          centerTile[0] * TILE_SIZE,
          centerTile[1] * TILE_SIZE,
        ];
        // 中心点对应的像素坐标
        let centerPos = getPxFromLngLat(...center, this.zoom, plusOpt);
        // 中心像素坐标距中心瓦片左上/下角的差值
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
        // y轴向上
        let axisYIsTop = this.selectMapData.axis ? this.selectMapData.axis[1] === 'top' : false
        this.currentTileCache = {}; // 清空缓存对象
        // 渲染画布内所有瓦片
        for (let i = -rowMinNum; i <= rowMaxNum; i++) {
          for (let j = -colMinNum; j <= colMaxNum; j++) {
            // 当前瓦片的行列号
            let row = centerTile[0] + i;
            let col = centerTile[1] + j;
            // 当前瓦片的显示位置
            let _j = j
            // 百度地图，坐标系和画布坐标系y轴相反
            if (axisYIsTop && j !== 0) {
              _j = -j
            }
            let x = i * TILE_SIZE - offset[0];
            // 百度地图的offset[1]是中心点距中心瓦片左下角的距离，需要换算成左上角的y值
            let y = _j * TILE_SIZE - (axisYIsTop ? TILE_SIZE - offset[1] : offset[1]);
            // 缓存key
            let cacheKey = row + "_" + col + "_" + this.zoom;
            // 记录当前需要的瓦片
            this.currentTileCache[cacheKey] = true;
            // 该瓦片已加载过
            let layer = this.getCurrentMainLayer();
            if (this.tileCache[cacheKey]) {
              this.tileCache[cacheKey]
                .updateLayer(layer)
                .updatePos(x, y)
                .render(isFadeIn);
            } else {
              // 未加载过
              this.tileCache[cacheKey] = new Tile({
                layer,
                row,
                col,
                zoom: this.zoom,
                x,
                y,
                // 判断瓦片是否在当前画布缓存对象上，是的话则代表需要渲染
                shouldRender: (key) => {
                  return this.currentTileCache[key];
                },
                // 获取当前地图类型
                getMapTypeData: () => {
                  return this.selectMapData
                }
              });
            }
          }
        }
        // 渲染叠加物
        this.renderOverlay();
      },
}