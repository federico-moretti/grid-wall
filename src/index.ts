// TODO: test with React
// TODO: cleanup

interface ReflowGridParameters {
  container: HTMLElement;
  enableResize: boolean;
  centerChildren: boolean;
  resizeDebounceInMs: number;
  childrenWidth: number;
  childrenStyleTransition: string;
}

export default class ReflowGrid {
  container: HTMLElement;
  enableResize: boolean;
  resizeDebounceInMs: number;
  children: HTMLElement[];
  childrenHeights: { [name: string]: number };
  childrenWidth: number;
  childrenStyleTransition: string;
  centerChildren: boolean;
  margin: number;
  containerWidth: number;
  columnsCount: number;
  columnsHeight: number[];
  childLastId: number;
  containerClassName: string;

  constructor({
    container,
    childrenWidth,
    enableResize,
    resizeDebounceInMs,
    centerChildren,
    childrenStyleTransition,
  }: ReflowGridParameters) {
    this.missingParameter({ container, childrenWidth });

    this.container = container;
    this.containerWidth = this.container.clientWidth;
    this.childrenWidth = childrenWidth;
    this.centerChildren = Boolean(centerChildren);
    this.columnsHeight = [];
    this.childrenHeights = {};
    this.childLastId = 0;
    this.enableResize = enableResize || false;
    this.resizeDebounceInMs = resizeDebounceInMs || 100;
    this.containerClassName = 'rg-container';
    this.childrenStyleTransition = childrenStyleTransition || 'transform ease-in 0.2s';

    this.container.classList.add(this.containerClassName);
    this.children = Array.from(container.childNodes) as HTMLElement[];
    this.columnsCount = Math.floor(this.containerWidth / this.childrenWidth);

    this.addStyleToDOM();
    this.margin = this.calculateMargin();
    this.setChildrenWidth();
    this.setChildrenHeight();
    this.listenToResize();
    this.addMutationObserverToContainer();
    this.addMutationObserverToChildren();

    this.reflow();
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
    if (!this.centerChildren) return 0;
    if (this.columnsCount <= 1) return 0;
    return Math.floor((this.containerWidth - this.columnsCount * this.childrenWidth) / 2);
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

  setChildrenHeight(): void {
    this.children.forEach(child => {
      let id = child.getAttribute('data-rg-id');
      if (!id) {
        this.childLastId = this.childLastId + 1;
        id = this.childLastId.toString();
        child.setAttribute('data-rg-id', id);
      }
      this.childrenHeights[id] = child.offsetHeight;
    });
  }

  resetColumnsHeight(): void {
    this.columnsHeight = [];
  }

  addStyleToDOM(): void {
    const head = document.querySelector('head');
    if (head) {
      const style = document.createElement('style');
      const css = document.createTextNode(`
/* reflow grid */
.${this.containerClassName}{
  box-sizing:content-box;
}
.${this.containerClassName}>*{
  box-sizing:border-box;
  position:absolute;
  transition:${this.childrenStyleTransition};
}
`);
      style.appendChild(css);
      head.appendChild(style);
    }
  }

  setWidth(element: HTMLElement, width: number): void {
    element.style.width = `${width}px`;
  }

  setChildrenWidth(): void {
    if (this.children.length > 0) {
      this.children.forEach(child => {
        this.setWidth(<HTMLElement>child, this.childrenWidth);
      });
    }
  }

  addMutationObserverToContainer(): void {
    const containerObserver = new MutationObserver(m => this.handleContainerMutation(m));
    containerObserver.observe(this.container, { childList: true });
  }

  addMutationObserverToChildren(): void {
    if (this.children.length > 0) {
      this.children.forEach(child => {
        const containerObserver = new MutationObserver(m => this.handleChildrenMutation(m));
        containerObserver.observe(child, { attributes: true });
      });
    }
  }

  getLowerColumn(): { index: number; height: number } {
    const lower = { index: 0, height: 0 };
    if (this.columnsHeight.length > 0) {
      this.columnsHeight.forEach((height, index) => {
        if (lower.height === 0 || lower.height >= height) {
          lower.height = height;
          lower.index = index;
        }
      });
    }
    return lower;
  }

  getMaxHeight(): number {
    const heights = Object.values(this.columnsHeight);
    return Math.max(...heights);
  }

  reflow(): void {
    this.resetColumnsHeight();
    this.children.forEach((child, index) => {
      let column = index;
      let transform = `translate(${column * this.childrenWidth + this.margin}px, 0px)`;

      if ((column + 1) * this.childrenWidth >= this.containerWidth) {
        const lowerColumn = this.getLowerColumn();
        column = lowerColumn.index;
        const x = column * this.childrenWidth;
        transform = `translate(${this.margin + x}px, ${lowerColumn.height}px)`;
      }

      this.columnsHeight[column] = Number.isInteger(this.columnsHeight[column])
        ? this.columnsHeight[column] + child.offsetHeight
        : child.offsetHeight;
      if (child.style.transform !== transform) child.style.transform = transform;
    });
    this.container.style.height = this.getMaxHeight() + 'px';
    this.setChildrenHeight();
  }

  resize(containerWidth: number): void {
    this.containerWidth = containerWidth;
    this.columnsCount = Math.floor(this.containerWidth / this.childrenWidth);
    this.margin = this.calculateMargin();
    this.resetColumnsHeight();

    this.reflow();
  }

  handleChildrenMutation(mutations: MutationRecord[]): void {
    mutations.forEach(mutation => {
      const elem = mutation.target as HTMLElement;
      const id = elem.getAttribute('data-rg-id');

      if (id) {
        const storedHeight = this.childrenHeights[id];
        if (storedHeight !== elem.offsetHeight) this.reflow();
      }
    });
  }

  handleContainerMutation(mutations: MutationRecord[]): void {
    mutations.forEach(mutation => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach(child => {
          if (child instanceof HTMLElement) this.setWidth(child, this.childrenWidth);
        });
        this.children = Array.from(this.container.children) as HTMLElement[];

        this.reflow();
      }
    });
  }
}
