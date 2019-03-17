// track changes on dom
// new MutationObserver()

interface ReflowGridParameters {
  container: HTMLElement;
  containerWidth: number;
  itemWidth: number;
}

export default class ReflowGrid {
  container: HTMLElement;
  children: HTMLElement[];
  itemWidth: number;
  containerWidth: number;
  columnsCount: number;
  columnsHeight: { [key: string]: number };

  constructor({ container, containerWidth, itemWidth }: ReflowGridParameters) {
    this.container = container;
    this.children = Array.from(container.children) as HTMLElement[];
    this.itemWidth = itemWidth;
    this.containerWidth = containerWidth;
    this.columnsCount = Math.floor(this.containerWidth / this.itemWidth);
    this.columnsHeight = {};
    console.log('init');

    this.initColumnsHeight();
    console.log(this.columnsHeight);
    this.addClassesToDOM();
    this.execute(containerWidth, itemWidth);
  }

  initColumnsHeight() {
    Array.from(Array(this.columnsCount)).forEach((_, index) => {
      this.columnsHeight[index + 1] = 0;
    });
  }

  addClassesToDOM() {
    const head = document.querySelector('head');
    if (head) {
      const style = document.createElement('style');
      const css = document.createTextNode(`
      /* reflow grid classes */
      .rg-abs { position: absolute; }
      `);
      style.appendChild(css);
      head.appendChild(style);
    }
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
    this.position();
  }

  getLowerColumn() {
    const columns = Object.entries(this.columnsHeight);
    return columns.reduce((prev, curr) => {
      console.log(prev, curr);
      if (curr[1] >= prev[1]) return prev;
      return curr;
    });
  }

  position() {
    this.container.style.position = 'relative';
    this.children.forEach((child, index) => {
      child.classList.add('rg-abs');
      let transform = `translateX(${index * this.itemWidth}px)`;
      let column = index + 1;
      console.log(index);

      // check lower column
      // then insert the child in the column
      // the update column height
      if (index * this.itemWidth >= this.containerWidth) {
        console.log('+ 2nd row');
        const lowerColumn = this.getLowerColumn();
        column = Number.parseInt(lowerColumn[0]);
        index = index - this.columnsCount;
        const x = (column - 1) * this.itemWidth;
        console.log('lowerColumn', lowerColumn);
        transform = `translateX(${x}px) translateY(${lowerColumn[1]}px)`;
      }

      console.log(transform);
      this.columnsHeight[column] += child.clientHeight;
      console.log(this.columnsHeight);
      child.style.transform = transform;
    });
  }
}
