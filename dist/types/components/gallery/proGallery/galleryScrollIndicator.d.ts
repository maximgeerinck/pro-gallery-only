export default class ScrollIndicator extends GalleryComponent {
    constructor(props: any);
    state: {
        scrollTop: number;
        scrollLeft: number;
    };
    debouncedOnScroll: any;
    removeScrollListener(): void;
    scrollEventListenerSet: boolean | undefined;
    initScrollListener(): void;
    onHorizontalScrollTransition: (({ detail }: {
        detail: any;
    }) => void) | undefined;
    onHorizontalScroll: ((e: any) => void) | undefined;
    onVerticalScroll: ((e: any) => void) | undefined;
    componentWillUnmount(): void;
    componentDidMount(): void;
    UNSAFE_componentWillReceiveProps(nextProps: any): void;
    render(): any;
}
import { GalleryComponent } from "../../galleryComponent";
