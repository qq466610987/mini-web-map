abstract class BaseLayer {
  z: number; //层级
  visible: boolean;
  opacity: boolean;

  abstract render(): void
}

export default BaseLayer