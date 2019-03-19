// TODO: test with React
// TODO: cleanup

interface ReflowGridParameters {
  container: HTMLElement;
  enableResize: boolean;
  centerItems: boolean;
  resizeDebounceInMs: number;
  itemWidth: number;
}

export default class ReflowGrid {
  container: HTMLElement;
  enableResize: boolean;
  resizeDebounceInMs: number;
  children: HTMLElement[];
  itemWidth: number;
  centerItems: boolean;
  margin: number;
  containerWidth: number;
  columnsCount: number;
  columnsHeight: { [key: string]: number };

  constructor({
    container,
    itemWidth,
    enableResize,
    resizeDebounceInMs,
    centerItems,
  }: ReflowGridParameters) {
    this.missingParameter({ container, itemWidth });

    this.container = container;
    this.container.classList.add('_rg_container');

    this.children = Array.from(container.children) as HTMLElement[];
    this.centerItems = Boolean(centerItems);
    this.addClassesToDOM();

    this.containerWidth = this.container.clientWidth;
    this.itemWidth = itemWidth;
    this.columnsCount = Math.floor(this.containerWidth / this.itemWidth);
    this.columnsHeight = {};
    this.initColumnsHeight();

    this.margin = this.calculateMargin();
    this.setChildrenWidth(this.container, this.itemWidth);

    this.enableResize = enableResize || false;
    this.resizeDebounceInMs = resizeDebounceInMs || 100;
    this.listenToResize();

    this.position();

    const containerObserver = new MutationObserver((m, o) => this.handleContainerMutation(m, o));
    containerObserver.observe(this.container, { childList: true });
  }

  missingParameter(params: { [name: string]: any }) {
    const missingParams: string[] = [];
    Object.entries(params).forEach(([name, param]) => {
      if (!param) missingParams.push(name);
    });

    if (missingParams.length > 0) {
      let parameter = `parameter${missingParams.length > 1 ? 's' : ''}`;
      let message = `Missing ${missingParams.length} ${parameter}:`;
      missingParams.forEach(name => (message += `\n  ${name}`));

      throw new Error(message);
    }
  }

  calculateMargin(): number {
    if (!this.centerItems) return 0;
    if (this.columnsCount <= 1) return 0;
    return Math.floor((this.containerWidth - this.columnsCount * this.itemWidth) / 2);
  }

  debounce(callback: () => void, wait: number): () => void {
    let interval: NodeJS.Timeout;
    return () => {
      clearTimeout(interval);
      interval = setTimeout(callback, wait);
    };
  }

  listenToResize(): void {
    if (this.enableResize) {
      const wait = this.resizeDebounceInMs;
      window.addEventListener(
        'resize',
        this.debounce(() => this.resize(this.container.clientWidth), wait)
      );
    }
  }

  initColumnsHeight(): void {
    Array.from(Array(this.columnsCount)).forEach((_, index) => {
      this.columnsHeight[index + 1] = 0;
    });
  }

  addClassesToDOM(): void {
    const head = document.querySelector('head');
    if (head) {
      const style = document.createElement('style');
      const css = document.createTextNode(`
      /* reflow grid classes */
      ._rg_container {box-sizing:content-box;}
      ._rg_container > * {box-sizing:border-box;position:absolute;transition:transform ease-in 0.2s;}
      `);
      style.appendChild(css);
      head.appendChild(style);
    }
  }

  setWidth(element: HTMLElement, width: number): void {
    element.style.width = `${width}px`;
  }

  setChildrenWidth(element: HTMLElement, width: number): void {
    if (element.children.length > 0) {
      Array.from(element.children).forEach(child => {
        this.setWidth(<HTMLElement>child, width);
      });
    }
  }

  getLowerColumn(): [string, number] {
    const columns = Object.entries(this.columnsHeight);
    if (columns.length > 0) {
      return columns.reduce((prev, curr) => {
        if (curr[1] >= prev[1]) return prev;
        return curr;
      });
    } else {
      return ['1', 0];
    }
  }

  getMaxHeight(): number {
    const heights = Object.values(this.columnsHeight);
    return Math.max(...heights);
  }

  position(): void {
    this.initColumnsHeight();
    this.children.forEach((child, index) => {
      let transform = `translate(${index * this.itemWidth + this.margin}px, 0px)`;
      let column = index + 1;

      if (column * this.itemWidth >= this.containerWidth) {
        const lowerColumn = this.getLowerColumn();
        column = Number.parseInt(lowerColumn[0]);
        const x = (column - 1) * this.itemWidth;
        transform = `translate(${this.margin + x}px, ${lowerColumn[1]}px)`;
      }

      this.columnsHeight[column] += child.offsetHeight;
      if (child.style.transform !== transform) child.style.transform = transform;
    });
    this.container.style.height = this.getMaxHeight() + 'px';
  }

  resize(containerWidth: number): void {
    this.containerWidth = containerWidth;
    this.columnsCount = Math.floor(this.containerWidth / this.itemWidth);
    this.margin = this.calculateMargin();
    this.columnsHeight = {};

    this.position();
  }

  handleContainerMutation(mutations: MutationRecord[], observer: MutationObserver): void {
    console.log('mutation');
    mutations.forEach(mutation => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach(child => {
          if (child instanceof HTMLElement) this.setWidth(child, this.itemWidth);
        });
        this.children = Array.from(this.container.children) as HTMLElement[];

        this.position();
      }
    });
  }
}
