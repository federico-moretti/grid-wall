import { Action, ColdSubscription } from 'popmotion';
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
declare type AnimationTypes = 'spring' | 'tween';
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
    childrenHeights: {
        [name: string]: number;
    };
    childrenWidth: number;
    margin: 'center' | 'left' | 'right';
    marginWidth: number;
    containerWidth: number;
    columnsCount: number;
    columnsHeight: number[];
    childLastId: number;
    containerClassName: string;
    springProperties: {
        stiffness: number;
        damping: number;
        mass: number;
    };
    onEnter: Animations;
    onChange: Animations;
    onExit: Animations;
    positionAnimationEnabled: boolean;
    constructor(params: GridWallParameters);
    missingParameter(params: {
        [name: string]: any;
    }): void;
    calculateMargin(): number;
    static debounce(callback: () => void, wait: number): () => void;
    listenToResize(): void;
    setChildId(child: HTMLElement | ChildElement): string;
    setChildrenHeight(): void;
    isPositionAnimationEnabled(): boolean;
    resetColumnsHeight(): void;
    addStyleToDOM(): void;
    static setWidth(element: HTMLElement, width: number): void;
    static addStyles(element: HTMLElement, styles: CSSStyleDeclaration): void;
    removeChild(index: number, callback: () => void): void;
    getInitialChildren(): ChildElement[];
    private _addChild;
    private _removeChild;
    setChildrenWidth(): void;
    addMutationObserverToContainer(): void;
    addMutationObserverToChildren(): void;
    getLowerColumn(): {
        index: number;
        height: number;
    };
    static getMaxHeight(columnsHeight: number[]): number;
    addAfterStyle: (event: TransitionEvent) => void;
    reflow(): void;
    resize(containerWidthInPx: number): void;
    handleChildrenMutation(mutations: MutationRecord[], callback?: () => void): void;
    handleContainerMutation(mutations: MutationRecord[], callback?: () => void): void;
}
export {};
