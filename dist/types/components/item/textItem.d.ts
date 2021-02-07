export default class TextItem extends GalleryComponent {
    constructor(props: any);
    getTextDimensions(): {
        width: string;
        height: string;
        transformOrigin: string;
        WebkitTransform: string;
        MsTransform: string;
        OTransform: string;
        transform: string;
    };
    processInnerhtml(html: any): any;
    render(): any;
}
import { GalleryComponent } from "../galleryComponent";
