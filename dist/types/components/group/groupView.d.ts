export default GroupView;
declare class GroupView extends GalleryComponent {
    constructor(props: any);
    displayName: string;
    dom: any[];
    state: {};
    createDom(visible: any): any;
    shouldRender(): boolean;
    isVisible(): boolean;
    render(): any;
}
import { GalleryComponent } from "../galleryComponent.js";
