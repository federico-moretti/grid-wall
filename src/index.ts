interface ReflowGridParameters {
  container: HTMLElement;
  containerWidth: number;
  itemWidth: number;
}

export default class ReflowGrid {
  container: HTMLElement;
  constructor({ container, containerWidth, itemWidth }: ReflowGridParameters) {
    this.container = container;
    console.log('init');

    this.execute(containerWidth, itemWidth);
  }

  setWidth(element: HTMLElement, width: number) {
    console.log(width);
    element.style.width = `${width}px`;
  }

  setChildrenWidth(element: HTMLElement, width: number) {
    console.log(element.children.length);
    if (element.children.length > 0) {
      Array.from(element.children).forEach(child => {
        this.setWidth(<HTMLElement>child, width);
      });
    }
  }

  execute(containerWidth: number, itemWidth: number) {
    console.log('execute!');
    this.setWidth(this.container, containerWidth);
    this.setChildrenWidth(this.container, itemWidth);
  }

  position() {}
}
