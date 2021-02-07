export default ItemView;
declare class ItemView extends GalleryComponent {
    constructor(props: any);
    state: {
        isCurrentHover: boolean;
        itemWasHovered: boolean;
    };
    activeElement: string;
    init(): void;
    onItemClick(e: any, clickTarget: any, shouldPreventDefault?: boolean): void;
    onItemWrapperClick(e: any): void;
    onItemInfoClick(e: any): void;
    onContainerKeyDown(e: any): boolean;
    onAnchorKeyDown(e: any): boolean;
    handleItemMouseDown(): boolean;
    handleItemMouseUp(): boolean;
    setItemLoaded(): void;
    isHighlight(): any;
    getItemHover(imageDimensions: any): any;
    getImageItem(imageDimensions: any): any;
    getVideoItem(imageDimensions: any, itemHover: any): any;
    getTextItem(imageDimensions: any): any;
    getItemInner(): any;
    getItemContainerStyles(): any;
    getItemWrapperStyles(): {
        borderRadius: string;
        backgroundColor: any;
        margin: string;
        height: string;
    } | {
        transition: string;
        opacity: number;
        display: string;
        borderRadius: string;
        backgroundColor: any;
        margin: string;
        height: string;
    } | {
        transition?: undefined;
        opacity?: undefined;
        display?: undefined;
        borderRadius: string;
        backgroundColor: any;
        margin: string;
        height: string;
    };
    getItemAriaLabel(): string;
    getItemContainerClass(): string;
    getItemWrapperClass(): string;
    getItemContainerTabIndex(): any;
    isIconTag(tagName: any): boolean;
    onMouseOver(): void;
    onMouseOut(): void;
    changeActiveElementIfNeeded(prevProps: any): void;
    checkIfCurrentHoverChanged(e: any): void;
    getCustomInfoRendererProps(): any;
    handleGalleryItemAction(e: any): void;
    shouldUseDirectLink: () => boolean;
    isClickOnCurrentHoveredItem: () => boolean;
    handleHoverClickOnMobile(e: any): void;
    shouldShowHoverOnMobile(): boolean;
    shouldHover(): boolean;
    getImageDimensions(): {
        borderRadius: string;
    };
    itemAnchor: any;
    getRightInfoElementIfNeeded(): any;
    getLeftInfoElementIfNeeded(): any;
    getBottomInfoElementIfNeeded(): any;
    getTopInfoElementIfNeeded(): any;
    getExternalInfoElement(placement: any, elementName: any): any;
    simulateHover(): any;
    simulateOverlayHover(): any;
    itemHasLink(): boolean;
    getFadeAnimationStyles(): {
        transition: string;
        opacity: number;
        display: string;
    } | {
        transition?: undefined;
        opacity?: undefined;
        display?: undefined;
    };
    componentDidMount(): void;
    componentWillUnmount(): void;
    componentDidUpdate(prevProps: any): void;
    onContextMenu(e: any): void;
    getItemAriaRole(): "" | "button" | "link";
    getLinkParams(): {} | undefined;
    composeItem(): any;
    hasRequiredMediaUrl: any;
    itemContainer: any;
    render(): any;
}
import { GalleryComponent } from "../galleryComponent.js";
