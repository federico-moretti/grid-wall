// TODO: choose to handle the container node without the width (internal resize)
// TODO: test with React
// TODO: check if can we handle the padding without a wrapper
// TODO: cleanup

interface ReflowGridParameters {
  container: HTMLElement;
  containerWidth: number;
  itemWidth: number;
}

export default class ReflowGrid {
  container: HTMLElement;
  children: HTMLElement[];
  itemWidth: number;
  margin: number;
  containerWidth: number;
  columnsCount: number;
  columnsHeight: { [key: string]: number };

  constructor({ container, containerWidth, itemWidth }: ReflowGridParameters) {
    this.container = container;
    this.container.style.position = 'relative';
    this.children = Array.from(container.children) as HTMLElement[];
    this.itemWidth = itemWidth;
    this.addClassesToDOM();

    const containerObserver = new MutationObserver((m, o) => this.handleContainerMutation(m, o));
    containerObserver.observe(this.container, { childList: true });

    this.containerWidth = containerWidth;
    this.columnsCount = Math.floor(this.containerWidth / this.itemWidth);
    this.margin = Math.floor((this.containerWidth - this.columnsCount * this.itemWidth) / 2);
    this.columnsHeight = {};

    this.initColumnsHeight();
    this.setChildrenWidth(this.container, this.itemWidth);
    this.setWidth(this.container, this.containerWidth);
    this.position();
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
      .rg-abs { position: absolute; transition: transform ease-in 0.2s; }
      `);
      style.appendChild(css);
      head.appendChild(style);
    }
  }

  setWidth(element: HTMLElement, width: number) {
    element.style.width = `${width}px`;
  }

  setChildrenWidth(element: HTMLElement, width: number) {
    if (element.children.length > 0) {
      Array.from(element.children).forEach(child => {
        this.setWidth(<HTMLElement>child, width);
      });
    }
  }

  getLowerColumn() {
    const columns = Object.entries(this.columnsHeight);
    return columns.reduce((prev, curr) => {
      if (curr[1] >= prev[1]) return prev;
      return curr;
    });
  }

  getMaxHeight() {
    const heights = Object.values(this.columnsHeight);
    return Math.max(...heights);
  }

  position() {
    this.initColumnsHeight();
    this.children.forEach((child, index) => {
      child.classList.add('rg-abs');
      let transform = `translate(${index * this.itemWidth + this.margin}px, 0px)`;
      let column = index + 1;

      if (column * this.itemWidth >= this.containerWidth) {
        const lowerColumn = this.getLowerColumn();
        column = Number.parseInt(lowerColumn[0]);
        const x = (column - 1) * this.itemWidth;
        transform = `translate(${this.margin + x}px, ${lowerColumn[1]}px)`;
      }

      this.columnsHeight[column] += child.clientHeight;
      if (child.style.transform !== transform) {
        child.style.transform = transform;
      }
    });
    this.container.style.height = this.getMaxHeight() + 'px';
  }

  resize(containerWidth: number) {
    this.containerWidth = containerWidth;
    this.columnsCount = Math.floor(this.containerWidth / this.itemWidth);
    this.margin = Math.floor((this.containerWidth - this.columnsCount * this.itemWidth) / 2);
    this.columnsHeight = {};

    this.setWidth(this.container, this.containerWidth);
    this.position();
  }

  handleContainerMutation(mutations: MutationRecord[], observer: MutationObserver) {
    console.log('mutation');
    mutations.forEach(mutation => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach(child => {
          if (child instanceof HTMLElement) {
            this.setWidth(child, this.itemWidth);
          }
        });
        this.children = Array.from(this.container.children) as HTMLElement[];
        this.resize(this.containerWidth);
        this.position();
      }
    });
  }
}
