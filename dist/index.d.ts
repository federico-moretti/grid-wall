interface ReflowGridParameters {
    container: HTMLElement;
    childrenWidthInPx: number;
    enableResize?: boolean;
    margin?: 'center' | 'left' | 'right';
    resizeDebounceInMs?: number;
    childrenStyleTransition?: string;
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
    constructor(params: ReflowGridParameters);
    missingParameter(params: {
        [name: string]: any;
    }): void;
    calculateMargin(): number;
    debounce(callback: () => void, wait: number): () => void;
    listenToResize(): void;
    setChildrenHeight(): void;
    resetColumnsHeight(): void;
    addStyleToDOM(): void;
    static setWidth(element: HTMLElement, width: number): void;
    getChildren(): HTMLElement[];
    setChildrenWidth(): void;
    addMutationObserverToContainer(): void;
    addMutationObserverToChildren(): void;
    getLowerColumn(): {
        index: number;
        height: number;
    };
    static getMaxHeight(columnsHeight: number[]): number;
    reflow(): void;
    resize(containerWidthInPx: number): void;
    handleChildrenMutation(mutations: MutationRecord[], callback?: () => void): void;
    handleContainerMutation(mutations: MutationRecord[], callback?: () => void): void;
}
export {};
