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
    childrenHeights: {
        [name: string]: number;
    };
    itemWidth: number;
    centerItems: boolean;
    margin: number;
    containerWidth: number;
    columnsCount: number;
    columnsHeight: number[];
    constructor({ container, itemWidth, enableResize, resizeDebounceInMs, centerItems, }: ReflowGridParameters);
    missingParameter(params: {
        [name: string]: any;
    }): void;
    calculateMargin(): number;
    debounce(callback: () => void, wait: number): () => void;
    listenToResize(): void;
    setChildrenHeight(): void;
    resetColumnsHeight(): void;
    addClassesToDOM(): void;
    setWidth(element: HTMLElement, width: number): void;
    setChildrenWidth(width: number): void;
    addMutationObserverToChildren(): void;
    getLowerColumn(): {
        index: number;
        height: number;
    };
    getMaxHeight(): number;
    reflow(): void;
    resize(containerWidth: number): void;
    handleChildrenMutation(mutations: MutationRecord[], observer: MutationObserver): void;
    handleContainerMutation(mutations: MutationRecord[], observer: MutationObserver): void;
}
export {};
