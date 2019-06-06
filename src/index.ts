// TODO: we may use parallel() to use multiple animation type, like tween and spring

import { spring, Action, ColdSubscription, tween } from 'popmotion';
import styler, { Styler } from 'stylefire';

interface GridWallParameters {
  container: HTMLElement;
  childrenWidthInPx: number;
  enableResize?: boolean;
  margin?: 'center' | 'left' | 'right';
  resizeDebounceInMs?: number;
  onEnter?: Animations | null;
  onChange?: Animations | null;
  onExit?: Animations | null;
  springProperties?: SpringProperties;
}

interface Animations {
  translate?: boolean;
  from?: { [key: string]: number | string };
  to?: { [key: string]: number | string };
  duration?: number;
}

interface SpringProperties {
  stiffness: number;
  damping: number;
  mass: number;
}

const defaultAnimations = {
  onEnter: {
    translate: false,
    from: { opacity: 0, scale: 0.5 },
    to: { opacity: 1, scale: 1 },
  } as Animations,
  onChange: { translate: true } as Animations,
  onExit: {
    from: { opacity: 1, scale: 1 },
    to: { opacity: 0, scale: 0.75 },
    duration: 200,
  } as Animations,
};

class Tile {
  id: number;
  onEnterAnimations: Animations;
  onChangeAnimations: Animations;
  onExitAnimations: Animations;
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
    this.onExitAnimations = { from: {}, to: {} };

    this.element.style.transform = 'translateX(0px) translateY(0px)';
    this.element.setAttribute('data-gw-id', id.toString());
  }

  setCoords(x: number, y: number) {
    this.x = x;
    this.y = y;
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
  springProperties: SpringProperties;
  onEnter: Animations | null;
  onChange: Animations | null;
  onExit: Animations | null;

  constructor(params: GridWallParameters) {
    // debugger;
    if (!params) throw new Error('Missing mandatory parameters!');
    const {
      container,
      childrenWidthInPx,
      enableResize,
      resizeDebounceInMs,
      margin,
      onEnter,
      onChange,
      onExit,
      springProperties = { stiffness: 120, damping: 14, mass: 1 },
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
    this.onEnter = typeof onEnter === 'undefined' ? defaultAnimations.onEnter : null;
    this.onChange = typeof onChange === 'undefined' ? defaultAnimations.onChange : null;
    this.onExit = typeof onExit === 'undefined' ? defaultAnimations.onExit : null;
    this.springProperties = springProperties;

    // we have to apply styles to DOM before doing any calculation
    this.addStyleToDOM();

    this.children = this.getInitialChildren();
    this.container.classList.add(this.containerClassName);
    this.containerWidth = this.container.clientWidth;
    this.columnsCount = Math.floor(this.containerWidth / this.childrenWidth);

    this.setChildrenWidth();
    this.setChildrenHeight();
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

  // after a child is removed, we append it back
  // just to animate it out, then remove it for real and reflow
  // this feels kinda hacky but it works
  private _handleRemoveChild(element: HTMLElement) {
    if (this.onExit) {
      element.setAttribute('data-gw-removing', 'true');
      this.container.appendChild(element);

      let from = { ...this.onExit.from };
      let to = { ...this.onExit.to };
      const duration = this.onExit.duration || 150;

      if (Object.keys(from).length > 0 && Object.keys(to).length > 0) {
        const animation = tween({
          from,
          to,
          duration,
        });

        animation.start({
          update: (v: any) => styler(element).set(v),
          complete: () => {
            element.setAttribute('data-gw-removing', 'false');
            element.remove();
            this._removeChild(element);
            this.reflow();
          },
        });
      }
    } else {
      this._removeChild(element);
    }
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

      // TODO: move logic to Tile
      // child.move(x, y)
      this.moveChild({ child, x, y });

      child.setCoords(x, y);
      // child.firstRender = false;
    });
    this.container.style.height = Tiles.getMaxHeight(this.columnsHeight) + 'px';
    this.setChildrenHeight();
  }

  moveChild({ child, x, y }: { child: Tile; x: number; y: number }) {
    let animation: Action | null = null;
    let from = {};
    let to = {};
    let fromTranslate = {};
    let toTranslate = {};

    if (child.firstRender && this.onEnter) {
      from = { ...this.onEnter.from };
      to = { ...this.onEnter.to };
    } else if (this.onChange) {
      from = { ...this.onChange.from };
      to = { ...this.onChange.to };
    }

    if (
      (this.onChange && this.onChange.translate && !child.firstRender) ||
      (this.onEnter && this.onEnter.translate && child.firstRender)
    ) {
      // if we are moving the child to a new position
      // get the new position and restart the animation
      // else we leave x and y null so it ends the running animation
      // without starting a new one
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
      // console.log('set', { x, y });
      child.styler.set({ x, y });
      // console.log(child.element.style.transform);
    }

    from = { ...from, ...fromTranslate };
    to = { ...to, ...toTranslate };

    if (Object.keys(from).length > 0 && Object.keys(to).length > 0) {
      animation = spring({
        from,
        to,
        ...this.springProperties,
      });

      if (child.animationStop && !child.firstRender) child.animationStop.stop();
      if (x !== child.x || y !== child.y) {
        child.animationStop = animation.start({
          update: (v: any) => child.styler.set(v),
          complete: () => (child.firstRender = false),
        });
      }
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
            if (element.getAttribute('data-gw-removing') === 'true') {
              if (callback && typeof callback === 'function') callback();
              return;
            }
            const tile = new Tile({ element, id: this.childLastId + 1 });
            Tiles.setWidth(tile, this.childrenWidth);
            this._addChild(tile);
          }
        });

        mutation.removedNodes.forEach(element => {
          if (element instanceof HTMLElement) {
            if (element.getAttribute('data-gw-removing') === 'false') {
              if (callback && typeof callback === 'function') callback();
              return;
            }
            this._handleRemoveChild(element);
          }
        });

        this.reflow();
      }
    });

    if (callback && typeof callback === 'function') callback();
  }
}
