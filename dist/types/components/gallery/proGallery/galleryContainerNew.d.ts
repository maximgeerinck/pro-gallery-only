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
    duplicateGalleryItems(): void;
    eventsListener(eventName: any, eventData: any, event: any): void;
    onGalleryScroll({ top, left }: {
        top: any;
        left: any;
    }): void;
    setPlayingIdxState(playingVideoIdx: any): void;
    getVisibleItems(items: any, container: any): any;
    state: any;
    videoScrollHelper: VideoScrollHelperWrapper;
    items: any[];
    itemsDimensions: {};
    preloadedItems: {};
    layoutCss: any[];
    initialGalleryState: any;
    galleryInitialStateJson: string | null | undefined;
    componentDidMount(): void;
    currentHoverChangeEvent: any;
    UNSAFE_componentWillReceiveProps(nextProps: any): void;
    loadItemsDimensionsIfNeeded(): void;
    handleNavigation(isInDisplay: any): void;
    handleNewGalleryStructure(): void;
    reCreateGalleryFromState({ items, styles, container }: {
        items: any;
        styles: any;
        container: any;
    }): void;
    layouter: any;
    layout: any;
    galleryStructure: any;
    createCssLayoutsIfNeeded(layoutParams: any): void;
    reCreateGalleryExpensively({ items, styles, container, watermark, itemsDimensions, customInfoRenderer, resizeMediaUrl, }: {
        items: any;
        styles: any;
        container: any;
        watermark: any;
        itemsDimensions: any;
        customInfoRenderer: any;
        resizeMediaUrl: any;
    }, curState: any): {};
    gettingMoreItems: boolean | undefined;
    getScrollingElement(): {
        vertical: any;
        horizontal: () => any;
    };
    containerInfiniteGrowthDirection(styles?: boolean): "none" | "horizontal" | "vertical";
    getScrollCss({ domId, items, styleParams, container }: {
        domId: any;
        items: any;
        styleParams: any;
        container: any;
    }): void;
    scrollCss: any;
    createDynamicStyles({ overlayBackground }: {
        overlayBackground: any;
    }): void;
    dynamicStyles: string | undefined;
    itemsToDuplicate: any[] | undefined;
    canRender(): any;
    isVerticalGallery(): boolean;
    render(): any;
}
export default GalleryContainer;
import VideoScrollHelperWrapper from "../../helpers/videoScrollHelperWrapper";
