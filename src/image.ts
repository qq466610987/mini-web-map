import Observable from "./observable";

class Img extends Observable {
  private timer: number | null = null
  private url: string
  private onload: Function
  private called: boolean = false
  private reloadTimes: number = 0

  constructor(url: string, onload: Function) {
    super()
    this.timer = null;
    this.url = url;
    this.onload = onload;
    this.called = false
    this.reloadTimes = 0;
    this.load();
  }

  load() {
    if (this.reloadTimes >= 5) {
      if (!this.called) {
        this.onload(null);
        this.called = true
      }
      return
    }
    this.reloadTimes++
    let img = new Image();
    img.src = this.url;
    // 加载超时，重新加载
    this.timer = setTimeout(() => {
      this.load();
    }, 1000);
    // 加载完成
    img.onload = () => {
      clearTimeout(this.timer);
      if (!this.called) {
        this.onload(img);
        this.called = true
      }
    };
    img.onerror = () => {
      this.load();
    }
  }
}

export default Img
