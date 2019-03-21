interface ReflowGridParameters {
    container: HTMLElement;
    enableResize: boolean;
    margin: 'auto' | 'left' | 'right';
    resizeDebounceInMs: number;
    childrenWidth: number;
    childrenStyleTransition: string;
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
    childrenStyleTransition: string;
    margin: 'center' | 'left' | 'right';
    marginWidth: number;
    containerWidth: number;
    columnsCount: number;
    columnsHeight: number[];
    childLastId: number;
    containerClassName: string;
    constructor({ container, childrenWidth, enableResize, resizeDebounceInMs, margin, childrenStyleTransition, }: ReflowGridParameters);
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
