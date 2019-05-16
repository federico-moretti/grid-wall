import { spring, tween, styler, Action, ColdSubscription } from 'popmotion';

interface GridWallParameters {
  container: HTMLElement;
  childrenWidthInPx: number;
  enableResize?: boolean;
  margin?: 'center' | 'left' | 'right';
  resizeDebounceInMs?: number;
  onEnter?: Animations;
  onChange?: Animations;
  onExit?: Animations;
  insertStyle?: CSSStyleDeclaration;
  beforeStyle?: CSSStyleDeclaration;
  afterStyle?: CSSStyleDeclaration;
}

type AnimationTypes = 'spring' | 'tween';

interface Animations {
  types: AnimationTypes[];
  properties: string[];
  from?: (number | string)[];
  to?: (number | string)[];
}

interface ChildElement extends HTMLElement {
  animation?: Action;
  animationStop?: ColdSubscription;
  firstRender?: boolean;
}

export default class GridWall {
  container: HTMLElement;
  enableResize: boolean;
  resizeDebounceInMs: number;
  children: ChildElement[];
  childrenHeights: { [name: string]: number };
  childrenWidth: number;
  margin: 'center' | 'left' | 'right';
  marginWidth: number;
  containerWidth: number;
  columnsCount: number;
  columnsHeight: number[];
  childLastId: number;
  containerClassName: string;
  springProperties: { stiffness: number; damping: number; mass: number };
  onEnter: Animations;
  onChange: Animations;
  onExit: Animations;
  positionAnimationEnabled: boolean;

  constructor(params: GridWallParameters) {
    if (!params) throw new Error('Missing mandatory parameters!');
    const {
      container,
      childrenWidthInPx,
      enableResize,
      resizeDebounceInMs,
      margin,
      onEnter = {
        types: ['tween'],
        properties: ['opacity', 'transform'],
        from: [0, 'scale(0.5)'],
        to: [1, 'scale(1)'],
      } as Animations,
      onChange = { types: ['spring'], properties: ['position'] } as Animations,
      onExit = { types: ['tween'], properties: ['opacity'], from: [1], to: [0] } as Animations,
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
    this.containerClassName = 'gw-container';
    this.onEnter = onEnter;
    this.onChange = onChange;
    this.positionAnimationEnabled = this.isPositionAnimationEnabled();
    this.onExit = onExit;
    this.springProperties = { stiffness: 100, damping: 14, mass: 1 };

    // we have to apply styles to DOM before doing any calculation
    this.addStyleToDOM();

    this.children = this.getInitialChildren();
    this.container.classList.add(this.containerClassName);
    this.containerWidth = this.container.clientWidth;
    this.columnsCount = Math.floor(this.containerWidth / this.childrenWidth);

    this.setChildrenWidth();
    this.setChildrenHeight();
    // this.setInitialChildrenTransition();
    this.listenToResize();
    this.marginWidth = this.calculateMargin();
    this.addMutationObserverToContainer();
    this.addMutationObserverToChildren();
    // spring({ from: 0, to: 110 }).start((v: number) => console.log(v));

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

  static debounce(callback: () => void, wait: number): () => void {
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
        GridWall.debounce(() => this.resize(this.container.clientWidth), wait)
      );
    }
  }

  setChildId(child: HTMLElement | ChildElement): string {
    this.childLastId = this.childLastId + 1;
    const id = this.childLastId.toString();
    child.setAttribute('data-gw-id', id);
    return id;
  }

  setChildrenHeight(): void {
    this.children.forEach(child => {
      let id = child.getAttribute('data-gw-id');
      if (!id) id = this.setChildId(child);
      this.childrenHeights[id] = child.offsetHeight;
    });
  }

  isPositionAnimationEnabled(): boolean {
    return Boolean(this.onChange.properties.find(property => property === 'position'));
  }

  resetColumnsHeight(): void {
    this.columnsHeight = [];
  }

  addStyleToDOM(): void {
    const head = document.querySelector('head');
    if (head) {
      const style = document.createElement('style');
      style.id = 'grid-wall-style';
      const css = document.createTextNode(
        `/* grid-wall */` +
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

  removeChild(index: number, callback: () => void): void {
    // remove children with animation
    // on animation end do callback
  }

  getInitialChildren(): ChildElement[] {
    let children: ChildElement[] = [];
    if (this.container.children.length > 0) {
      Array.from(this.container.children).forEach(child => {
        if (child instanceof HTMLElement) {
          const elem = child as ChildElement;
          elem.firstRender = true;
          elem.style.transform = 'translate(0px, 0px)';
          this.setChildId(elem);
          children.push(elem);
        }
      });
    }
    return children;
  }

  private _addChild(child: HTMLElement | ChildElement): void {
    const animation = spring({
      from: this.onEnter.from,
      to: this.onEnter.to,
      ...this.springProperties,
    });
    animation.start((v: string[]) => {
      this.onEnter.properties.forEach((property, i) => {
        if (property === 'transform') return;
        child.style[property as any] = v[i];
      });
    });

    const elem = child as ChildElement;
    elem.firstRender = true;
    this.children.push(child);
  }

  private _removeChild(child: HTMLElement | ChildElement): void {
    const id = child.getAttribute('data-gw-id');
    this.children = this.children.filter(c => c.getAttribute('data-gw-id') !== id);
  }

  setChildrenWidth(): void {
    if (this.children.length > 0) {
      this.children.forEach(child => {
        GridWall.setWidth(child, this.childrenWidth);
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
      event.target.setAttribute('data-gw-transition', 'true');
      event.target.removeEventListener('transitionend', this.addAfterStyle, true);
    }
  };

  reflow(): void {
    this.resetColumnsHeight();
    this.marginWidth = this.calculateMargin();
    this.children.forEach((child, index) => {
      let column = index;
      const childStyler = styler(child);
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

      if (this.positionAnimationEnabled && !child.firstRender) {
        const oldTransform = child.style.transform;
        const animation = spring({
          from: [oldTransform],
          to: [transform],
          ...this.springProperties,
        });
        if (child.animationStop) child.animationStop.stop();
        child.animationStop = animation.start((v: string[]) => (child.style.transform = v[0]));
      } else {
        child.style.transform = transform;
      }
      child.firstRender = false;
    });
    this.container.style.height = GridWall.getMaxHeight(this.columnsHeight) + 'px';
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
      const id = elem.getAttribute('data-gw-id');

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
            GridWall.setWidth(child, this.childrenWidth);
            child.style.transform = 'translate(0px, 0px)';
            this.setChildId(child);
            this._addChild(child);
          }
        });

        mutation.removedNodes.forEach(child => {
          if (child instanceof HTMLElement) {
            this._removeChild(child);
          }
        });
        // this.children = this.getChildren();
        this.reflow();
      }
    });

    if (callback && typeof callback === 'function') callback();
  }
}
