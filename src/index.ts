// TODO: test with React
// TODO: cleanup

interface ReflowGridParameters {
  container: HTMLElement;
  childrenWidthInPx: number;
  enableResize?: boolean;
  margin?: 'center' | 'left' | 'right';
  resizeDebounceInMs?: number;
  insertStyle?: CSSStyleDeclaration;
  beforeStyle?: CSSStyleDeclaration;
  afterStyle?: CSSStyleDeclaration;
}

export default class ReflowGrid {
  container: HTMLElement;
  enableResize: boolean;
  resizeDebounceInMs: number;
  children: HTMLElement[];
  childrenHeights: { [name: string]: number };
  childrenWidth: number;
  margin: 'center' | 'left' | 'right';
  marginWidth: number;
  containerWidth: number;
  columnsCount: number;
  columnsHeight: number[];
  childLastId: number;
  containerClassName: string;
  insertStyle: CSSStyleDeclaration;
  beforeStyle: CSSStyleDeclaration;
  afterStyle: CSSStyleDeclaration;

  constructor(params: ReflowGridParameters) {
    if (!params) throw new Error('Missing mandatory parameters!');
    const {
      container,
      childrenWidthInPx,
      enableResize,
      resizeDebounceInMs,
      margin,
      insertStyle = {} as CSSStyleDeclaration,
      beforeStyle = {} as CSSStyleDeclaration,
      afterStyle = {} as CSSStyleDeclaration,
    } = params;
    this.missingParameter({ container, childrenWidthInPx });

    this.container = container;
    this.childrenWidth = childrenWidthInPx;
    this.margin = margin || 'center';
    this.columnsHeight = [];
    this.childrenHeights = {};
    this.childLastId = 0;
    this.enableResize = enableResize || false;
    this.resizeDebounceInMs = resizeDebounceInMs || 100;
    this.containerClassName = 'rg-container';
    this.insertStyle = insertStyle;
    this.beforeStyle = beforeStyle;
    this.afterStyle = afterStyle;

    // we have to apply styles to DOM before doing any calculation
    this.addStyleToDOM();

    this.children = this.getChildren();
    this.container.classList.add(this.containerClassName);
    this.containerWidth = this.container.clientWidth;
    this.columnsCount = Math.floor(this.containerWidth / this.childrenWidth);

    this.setChildrenWidth();
    this.setChildrenHeight();
    this.setInitialChildrenTransition();
    this.listenToResize();
    this.marginWidth = this.calculateMargin();
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
      let message = `Missing ${missingParams.length} mandatory ${parameter}:`;
      missingParams.forEach(name => (message += `\n  ${name}`));

      throw new Error(message);
    }
  }

  calculateMargin(): number {
    if (this.margin === 'right') return 0;
    if (this.columnsCount <= 1) return 0;
    const count =
      this.children.length > this.columnsCount ? this.columnsCount : this.children.length;
    const remainingSpace = this.containerWidth - count * this.childrenWidth;
    if (this.margin === 'left') return remainingSpace;
    return Math.floor(remainingSpace / 2);
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

  setInitialChildrenTransition(): void {
    this.children.forEach(child => {
      ReflowGrid.addStyles(child, this.insertStyle);
    });
  }

  resetColumnsHeight(): void {
    this.columnsHeight = [];
  }

  addStyleToDOM(): void {
    const head = document.querySelector('head');
    if (head) {
      const style = document.createElement('style');
      style.id = 'reflow-grid-style';
      const css = document.createTextNode(
        `/* reflow grid */` +
          `.${this.containerClassName}{` +
          `  box-sizing:content-box;` +
          `}` +
          `.${this.containerClassName}>*{` +
          `  box-sizing:border-box;` +
          `  position:absolute;` +
          `}`
      );
      style.appendChild(css);
      head.appendChild(style);
    }
  }

  static setWidth(element: HTMLElement, width: number): void {
    element.style.width = `${width}px`;
  }

  static addStyles(element: HTMLElement, styles: CSSStyleDeclaration) {
    for (let property in styles) {
      if (element.style.hasOwnProperty(property)) {
        element.style[property as any] = styles[property];
      }
    }
  }

  getChildren(): HTMLElement[] {
    let children: HTMLElement[] = [];
    if (this.container.children.length > 0) {
      Array.from(this.container.children).forEach(child => {
        if (child instanceof HTMLElement) {
          children.push(child);
        }
      });
    }
    return children;
  }

  setChildrenWidth(): void {
    if (this.children.length > 0) {
      this.children.forEach(child => {
        ReflowGrid.setWidth(child, this.childrenWidth);
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
        if (lower.height === 0 || lower.height > height) {
          lower.height = height;
          lower.index = index;
        }
      });
    }
    return lower;
  }

  static getMaxHeight(columnsHeight: number[]): number {
    return Math.max(...columnsHeight);
  }

  addAfterStyle = (event: TransitionEvent) => {
    if (event.target instanceof HTMLElement) {
      ReflowGrid.addStyles(event.target, this.afterStyle);
      event.target.setAttribute('data-rg-transition', 'true');
      event.target.removeEventListener('transitionend', this.addAfterStyle, true);
    }
  };

  reflow(): void {
    this.resetColumnsHeight();
    this.marginWidth = this.calculateMargin();
    this.children.forEach((child, index) => {
      let column = index;
      let transform = `translate(${column * this.childrenWidth + this.marginWidth}px, 0px)`;

      if ((column + 1) * this.childrenWidth >= this.containerWidth) {
        const lowerColumn = this.getLowerColumn();
        column = lowerColumn.index;
        const x = column * this.childrenWidth;
        transform = `translate(${this.marginWidth + x}px, ${lowerColumn.height}px)`;
      }

      this.columnsHeight[column] = Number.isInteger(this.columnsHeight[column])
        ? this.columnsHeight[column] + child.offsetHeight
        : child.offsetHeight;

      if (!child.getAttribute('data-rg-transition')) {
        ReflowGrid.addStyles(child, this.beforeStyle);
        child.addEventListener('transitionend', this.addAfterStyle, true);
      }
      if (child.style.transform !== transform) child.style.transform = transform;
    });
    this.container.style.height = ReflowGrid.getMaxHeight(this.columnsHeight) + 'px';
    this.setChildrenHeight();
  }

  resize(containerWidthInPx: number): void {
    if (!containerWidthInPx && !Number.isNaN(containerWidthInPx)) {
      throw new Error('Width must be a number and more than 0');
    }

    this.containerWidth = containerWidthInPx;
    this.columnsCount = Math.floor(this.containerWidth / this.childrenWidth);
    this.reflow();
  }

  handleChildrenMutation(mutations: MutationRecord[], callback?: () => void): void {
    mutations.forEach(mutation => {
      const elem = mutation.target as HTMLElement;
      const id = elem.getAttribute('data-rg-id');

      if (id) {
        const storedHeight = this.childrenHeights[id];
        if (storedHeight !== elem.offsetHeight) {
          this.reflow();
        }
      }
    });

    if (callback && typeof callback === 'function') callback();
  }

  handleContainerMutation(mutations: MutationRecord[], callback?: () => void): void {
    mutations.forEach(mutation => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(child => {
          if (child instanceof HTMLElement) {
            ReflowGrid.addStyles(child, this.insertStyle);
            ReflowGrid.setWidth(child, this.childrenWidth);
          }
        });
        this.children = this.getChildren();
        this.reflow();
      }
    });

    if (callback && typeof callback === 'function') callback();
  }
}
