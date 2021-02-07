export default GalleryView;
declare class GalleryView extends GalleryComponent {
    constructor(props: any);
    handleArrowKeys(e: any): boolean;
    showMoreItems(): void;
    createGalleryConfig(): {
        scrollingElement: any;
        scroll: any;
        container: any;
        styleParams: any;
        watermark: any;
        settings: any;
        currentIdx: number;
        customHoverRenderer: any;
        customInfoRenderer: any;
        customImageRenderer: any;
        domId: any;
        gotFirstScrollEvent: any;
        playingVideoIdx: any;
        noFollowForSEO: any;
        isPrerenderMode: any;
        firstUserInteractionExecuted: any;
        actions: {
            eventsListener: any;
        };
    };
    screenLogs(): any;
    createGallery(showMore: any): any;
    id: string;
    state: {
        currentIdx: number;
    };
    lastVisibleItemIdxInHeight(height: any): number;
    lastVisibleItemIdx(): number;
    createShowMoreButton(): any;
    render(): any;
    lastProps: any;
    lastState: {
        currentIdx: number;
    } | undefined;
    renderCount: any;
}
import { GalleryComponent } from "../../galleryComponent";
