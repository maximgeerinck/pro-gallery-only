export default class ImageItem extends GalleryComponent {
    constructor(props: any);
    getImageContainer(imageRenderer: any, classNames: any, extraNodes: any): any;
    getImageContainerClassNames(): string;
    getImageElement(): () => any[];
    state: {
        isHighResImageLoaded: boolean;
    };
    removeLowResImageTimeoutId: any;
    handleHighResImageLoad(): void;
    componentDidMount(): void;
    componentWillUnmount(): void;
    getImageAnimationOverlay(): any;
    render(): any;
}
import { GalleryComponent } from "../galleryComponent";
