interface ReflowGridParameters {
    container: HTMLElement;
    enableResize: boolean;
    centerChildren: boolean;
    resizeDebounceInMs: number;
    childrenWidth: number;
}
export default class ReflowGrid {
    container: HTMLElement;
    enableResize: boolean;
    resizeDebounceInMs: number;
    children: HTMLElement[];
    childrenHeights: {
        [name: string]: number;
    };
    childrenWidth: number;
    centerChildren: boolean;
    margin: number;
    containerWidth: number;
    columnsCount: number;
    columnsHeight: number[];
    childLastId: number;
    containerClassName: string;
    constructor({ container, childrenWidth, enableResize, resizeDebounceInMs, centerChildren, }: ReflowGridParameters);
    missingParameter(params: {
        [name: string]: any;
    }): void;
    calculateMargin(): number;
    debounce(callback: () => void, wait: number): () => void;
    listenToResize(): void;
    setChildrenHeight(): void;
    resetColumnsHeight(): void;
    addStyleToDOM(): void;
    setWidth(element: HTMLElement, width: number): void;
    setChildrenWidth(): void;
    addMutationObserverToContainer(): void;
    addMutationObserverToChildren(): void;
    getLowerColumn(): {
        index: number;
        height: number;
    };
    getMaxHeight(): number;
    reflow(): void;
    resize(containerWidth: number): void;
    handleChildrenMutation(mutations: MutationRecord[]): void;
    handleContainerMutation(mutations: MutationRecord[]): void;
}
export {};
