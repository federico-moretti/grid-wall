import { spring, tween, Action, ColdSubscription } from 'popmotion';
import styler, { Styler } from 'stylefire';

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
  //types: AnimationTypes[];
  // properties: string[];
  translate?: boolean;
  from?: { [key: string]: number | string };
  to?: { [key: string]: number | string };
}

// interface ChildElement extends HTMLElement {
//   animations?: Action[];
//   animationStop?: ColdSubscription;
//   firstRender?: boolean;
// }

class Tile {
  id: number;
  onEnterAnimations: Animations;
  onChangeAnimations: Animations;
  animations?: Animations;
  animationStop?: ColdSubscription;
  x: number;
  y: number;
  firstRender: boolean;
  element: HTMLElement;
  styler: Styler;

  constructor({ element, id }: { element: HTMLElement; id: number }) {
    this.id = id;
    this.element = element;
    this.styler = styler(element);
    this.firstRender = true;
    this.x = 0;
    this.y = 0;
    this.onEnterAnimations = { from: {}, to: {} };
    this.onChangeAnimations = { from: {}, to: {} };

    this.element.style.transform = 'translateX(0px) translateY(0px)';
    this.element.setAttribute('data-gw-id', id.toString());
  }
}

export default class Tiles {
  container: HTMLElement;
  enableResize: boolean;
  resizeDebounceInMs: number;
  children: Tile[];
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

  constructor(params: GridWallParameters) {
    if (!params) throw new Error('Missing mandatory parameters!');
    const {
      container,
      childrenWidthInPx,
      enableResize,
      resizeDebounceInMs,
      margin,
      onEnter = {
        // types: ['tween'],
        // properties: ['opacity', 'scale'],
        translate: false,
        from: { opacity: 0, scale: 0.5 },
        to: { opacity: 1, scale: 1 },
      } as Animations,
      onChange = { translate: true } as Animations,
      onExit = { types: ['tween'], from: { opacity: 1 }, to: { opacity: 0 } } as Animations,
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
    this.onExit = onExit;
    this.springProperties = { stiffness: 120, damping: 14, mass: 1 };

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
        Tiles.debounce(() => this.resize(this.container.clientWidth), wait)
      );
    }
  }

  setChildId(child: Tile): string {
    this.childLastId = this.childLastId + 1;
    const id = this.childLastId.toString();
    child.element.setAttribute('data-gw-id', id);
    return id;
  }

  setChildrenHeight(): void {
    this.children.forEach(child => {
      let id = child.element.getAttribute('data-gw-id');
      if (!id) id = this.setChildId(child);
      this.childrenHeights[id] = child.element.offsetHeight;
    });
  }

  isPositionAnimationEnabled(): boolean {
    return true;
    // return Boolean(this.onChange.properties.find(property => property === 'position'));
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

  static setWidth(element: Tile, width: number): void {
    element.element.style.width = `${width}px`;
  }

  static addStyles(element: Tile, styles: CSSStyleDeclaration) {
    for (let property in styles) {
      if (element.element.style.hasOwnProperty(property)) {
        element.element.style[property as any] = styles[property];
      }
    }
  }

  removeChild(index: number, callback: () => void): void {
    // remove children with animation
    // on animation end do callback
  }

  getInitialChildren(): Tile[] {
    let children: Tile[] = [];
    if (this.container.children.length > 0) {
      Array.from(this.container.children).forEach(child => {
        if (child instanceof HTMLElement) {
          const tile = new Tile({ element: child, id: this.childLastId + 1 });
          tile.firstRender = true;
          tile.element.style.transform = 'translateX(0px) translateY(0px)';
          this.setChildId(tile);
          children.push(tile);
        }
      });
    }
    return children;
  }

  private _addChild(child: Tile): void {
    this.childLastId = child.id;
    this.children.push(child);
  }

  private _removeChild(element: HTMLElement): void {
    const id = element.getAttribute('data-gw-id');
    this.children = this.children.filter(c => c.element.getAttribute('data-gw-id') !== id);
  }

  setChildrenWidth(): void {
    if (this.children.length > 0) {
      this.children.forEach(child => {
        Tiles.setWidth(child, this.childrenWidth);
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
        containerObserver.observe(child.element, { attributes: true });
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
      let x = column * this.childrenWidth + this.marginWidth;
      let y = 0;

      if ((column + 1) * this.childrenWidth >= this.containerWidth) {
        const lowerColumn = this.getLowerColumn();
        column = lowerColumn.index;
        x = this.marginWidth + column * this.childrenWidth;
        y = lowerColumn.height;
      }

      this.columnsHeight[column] = Number.isInteger(this.columnsHeight[column])
        ? this.columnsHeight[column] + child.element.offsetHeight
        : child.element.offsetHeight;

      this.moveChild({ child, x, y });

      child.x = x;
      child.y = y;
      child.firstRender = false;
    });
    this.container.style.height = Tiles.getMaxHeight(this.columnsHeight) + 'px';
    this.setChildrenHeight();
  }

  moveChild({ child, x, y }: { child: Tile; x: number; y: number }) {
    // add animations
    // check if can translate
    // if did not animate translate, translate
    // animate all
    let animation: Action | null = null;
    let from = {};
    let to = {};
    let fromTranslate = {};
    let toTranslate = {};

    if (child.firstRender) {
      from = { ...this.onEnter.from };
      to = { ...this.onEnter.to };
    } else {
      from = { ...this.onChange.from };
      to = { ...this.onChange.to };
    }

    if (
      (this.onChange.translate && !child.firstRender) ||
      (this.onEnter.translate && child.firstRender)
    ) {
      if (x !== child.x || y !== child.y) {
        let oldCoords = { x: 0, y: 0 };
        if (child.element.style.transform) {
          const regexTransform = /translateX\((-?\d+)?.\w+\).+translateY\((-?\d+)?.\w+\)/;
          const match = child.element.style.transform.match(regexTransform);
          if (match && match[1] && match[2]) {
            oldCoords.x = parseInt(match[1]);
            oldCoords.y = parseInt(match[2]);
          }
        }
        fromTranslate = { x: oldCoords.x, y: oldCoords.y };
        toTranslate = { x, y };
      }
    } else {
      child.styler.set({ x, y });
    }

    from = { ...from, ...fromTranslate };
    to = { ...to, ...toTranslate };

    if (Object.keys(from).length > 0 && Object.keys(to).length > 0) {
      animation = spring({
        from,
        to,
        ...this.springProperties,
      });

      if (child.animationStop) child.animationStop.stop();
      animation.start((v: any) => child.styler.set(v));
    }
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
        mutation.addedNodes.forEach(element => {
          if (element instanceof HTMLElement) {
            const tile = new Tile({ element, id: this.childLastId + 1 });
            Tiles.setWidth(tile, this.childrenWidth);
            this._addChild(tile);
          }
        });

        mutation.removedNodes.forEach(elem => {
          if (elem instanceof HTMLElement) {
            this._removeChild(elem);
          }
        });
        // this.children = this.getChildren();
        this.reflow();
      }
    });

    if (callback && typeof callback === 'function') callback();
  }
}
