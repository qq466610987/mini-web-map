// 角度转弧度
const angleToRad = (angle: number): number => {
  return angle * (Math.PI / 180)
}

// 弧度转角度
const radToAngle = (rad: number): number => {
  return rad * (180 / Math.PI)
}

// 地球半径
const EARTH_RAD: number = 6378137

// 4326转3857
export const lngLatToMercator = (lng: number, lat: number): [number, number] => {
  // 经度先转弧度，然后因为 弧度 = 弧长 / 半径 ，得到弧长为 弧长 = 弧度 * 半径
  let x = angleToRad(lng) * EARTH_RAD
  // 纬度先转弧度
  let rad = angleToRad(lat)
  // 下面我就看不懂了
  let sin = Math.sin(rad)
  let y = (EARTH_RAD / 2) * Math.log((1 + sin) / (1 - sin))
  return [x, y]
}

// 3857转4326
export const mercatorToLngLat = (x: number, y: number): [number, number] => {
  let lng = radToAngle(x) / EARTH_RAD
  let lat = radToAngle(2 * Math.atan(Math.exp(y / EARTH_RAD)) - Math.PI / 2)
  return [lng, lat]
}

// 地球周长
const EARTH_PERIMETER: number = 2 * Math.PI * EARTH_RAD
// 瓦片像素
export const TILE_SIZE: number = 256

// 获取某一层级下的分辨率
export const getResolution = (n: number): number => {
  const tileNums = Math.pow(2, n)
  const tileTotalPx = tileNums * TILE_SIZE
  return EARTH_PERIMETER / tileTotalPx
}

// 分辨率列表
export const resolutions: number[] = []
for (let i = 0; i <= 18; i++) {
  resolutions.push(getResolution(i))
}

// 转换3857坐标的原点
export type Origin = 'topLeft' | 'center'
export const transformXY = (x: number, y: number, origin: Origin = 'topLeft'): [number, number] => {
  if (origin === 'topLeft') {
    x += EARTH_PERIMETER / 2
    y = EARTH_PERIMETER / 2 - y
  }
  return [x, y]
}
// 根据4326坐标及缩放层级计算瓦片行列号
export interface TileOptions {
  lngLatToMercator?: typeof lngLatToMercator;
  resolutions?: number[];
  origin?: Origin;
}

export const getTileRowAndCol = (lng: number, lat: number, z: number, opt: TileOptions = {}): [number, number] => {
  let [x, y] = transformXY(...(opt.lngLatToMercator || lngLatToMercator)(lng, lat), opt.origin)
  let resolution = (opt.resolutions || resolutions)[z]
  let row = Math.floor(x / resolution / TILE_SIZE)
  let col = Math.floor(y / resolution / TILE_SIZE)
  return [row, col]
}

// 计算4326经纬度对应的像素坐标
export const getPxFromLngLat = (lng: number, lat: number, z: number, opt: TileOptions = {}): [number, number] => {
  let [_x, _y] = transformXY(...(opt.lngLatToMercator || lngLatToMercator)(lng, lat), opt.origin)
  let resolution = (opt.resolutions || resolutions)[z]
  let x = Math.floor(_x / resolution)
  let y = Math.floor(_y / resolution)
  return [x, y]
}

// 拼接瓦片地址
export const getTileUrl = (x: number, y: number, z: number): string => {
  let domainIndexList = [1, 2, 3, 4]
  let domainIndex =
    domainIndexList[Math.floor(Math.random() * domainIndexList.length)]
  return `https://webrd0${domainIndex}.is.autonavi.com/appmaptile?x=${x}&y=${y}&z=${z}&lang=zh_cn&size=1&scale=1&style=8`
}

// 随机获取url子域索引
export const getRandomDomainIndex = (url: string): number | null => {
  // 检查是否支持多个子域
  let res = url.match(/\{[\d-]+\}/)
  if (res) {
    let arr = res[0].slice(1, -1).split(/\s*-\s*/)
    let domainIndexList = []
    for (let i = Number(arr[0]); i <= Number(arr[1]); i++) {
      domainIndexList.push(i)
    }
    return domainIndexList[Math.floor(Math.random() * domainIndexList.length)]
  }
  return null
}

// 拼接瓦片地址
export const getTileUrlPro = (x: number, y: number, z: number, url: string, { transformXYZ, getTileUrl } = {}): string => {
  // 检查是否支持多个子域
  let domainIndex = getRandomDomainIndex(url)
  if (domainIndex !== null) {
    url = url.replace(/\{[\d-]+\}/, domainIndex.toString())
  }
  // 自定义url拼接方法
  if (getTileUrl) {
    return getTileUrl(x, y, z)
  }
  // 转换x、y、z
  if (transformXYZ) {
    let res = transformXYZ(x, y, z)
    x = res[0]
    y = res[1]
    z = res[2]
  }
  return url.replace('{x}', x.toString()).replace('{y}', y.toString()).replace('{z}', z.toString())
}

export const KEY: string = '0913a20b5d5a703b920e1ff0d9d26559'