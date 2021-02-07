export class GalleryContainer {
    constructor(props: any);
    getMoreItemsIfNeeded(scrollPos: any): void;
    setGotFirstScrollIfNeeded(): void;
    toggleLoadMoreItems(): void;
    scrollToItem(itemIdx: any, fixedScroll: any, isManual: any, durationInMS: number | undefined, scrollMarginCorrection: any): Promise<any> | undefined;
    scrollToGroup(groupIdx: any, fixedScroll: any, isManual: any, durationInMS: number | undefined, scrollMarginCorrection: any): Promise<any> | undefined;
    _scrollingElement: {
        vertical: any;
        horizontal: () => any;
    };
    eventsListener(eventName: any, eventData: any, event: any): void;
    onGalleryScroll({ top, left }: {
        top: any;
        left: any;
    }): void;
    setPlayingIdxState(playingVideoIdx: any): void;
    getVisibleItems(items: any, container: any): any;
    findNeighborItem: (itemIdx: any, dir: any) => any;
    videoScrollHelper: VideoScrollHelperWrapper;
    state: {
        items?: any;
        styles?: any;
        container?: any;
        structure?: any;
        pgScroll: number;
        showMoreClickedAtLeastOnce: boolean;
        initialGalleryHeight: undefined;
        needToHandleShowMoreClick: boolean;
        gotFirstScrollEvent: boolean;
        playingVideoIdx: number;
        viewComponent: null;
        firstUserInteractionExecuted: boolean;
    };
    layoutCss: any[];
    initialGalleryState: {};
    componentDidMount(): void;
    currentHoverChangeEvent: any;
    UNSAFE_componentWillReceiveProps(nextProps: any): void;
    handleNavigation(isInDisplay: any): void;
    handleNewGalleryStructure(): void;
    isVerticalGallery(): boolean;
    propsToState({ items, styles, structure, container, domId, resizeMediaUrl, isPrerenderMode, }: {
        items: any;
        styles: any;
        structure: any;
        container: any;
        domId: any;
        resizeMediaUrl: any;
        isPrerenderMode: any;
    }): {
        items: any;
        styles: any;
        container: any;
        structure: any;
    };
    galleryStructure: any;
    getScrollingElement(): {
        vertical: any;
        horizontal: () => any;
    };
    containerInfiniteGrowthDirection(styles?: boolean): "none" | "horizontal" | "vertical";
    createDynamicStyles({ overlayBackground }: {
        overlayBackground: any;
    }, isPrerenderMode: any): void;
    dynamicStyles: string | undefined;
    createCssLayoutsIfNeeded(layoutParams: any): void;
    getScrollCss({ domId, items, styleParams, container }: {
        domId: any;
        items: any;
        styleParams: any;
        container: any;
    }): void;
    scrollCss: any;
    gettingMoreItems: boolean | undefined;
    canRender(): any;
    render(): any;
}
export default GalleryContainer;
import VideoScrollHelperWrapper from "../../helpers/videoScrollHelperWrapper";
