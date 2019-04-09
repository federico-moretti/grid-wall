interface GridWallParameters {
    container: HTMLElement;
    childrenWidthInPx: number;
    enableResize?: boolean;
    margin?: 'center' | 'left' | 'right';
    resizeDebounceInMs?: number;
    insertStyle?: CSSStyleDeclaration;
    beforeStyle?: CSSStyleDeclaration;
    afterStyle?: CSSStyleDeclaration;
}
export default class GridWall {
    container: HTMLElement;
    enableResize: boolean;
    resizeDebounceInMs: number;
    children: HTMLElement[];
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
    insertStyle: CSSStyleDeclaration;
    beforeStyle: CSSStyleDeclaration;
    afterStyle: CSSStyleDeclaration;
    constructor(params: GridWallParameters);
    missingParameter(params: {
        [name: string]: any;
    }): void;
    calculateMargin(): number;
    static debounce(callback: () => void, wait: number): () => void;
    listenToResize(): void;
    setChildrenHeight(): void;
    setInitialChildrenTransition(): void;
    resetColumnsHeight(): void;
    addStyleToDOM(): void;
    static setWidth(element: HTMLElement, width: number): void;
    static addStyles(element: HTMLElement, styles: CSSStyleDeclaration): void;
    getChildren(): HTMLElement[];
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
