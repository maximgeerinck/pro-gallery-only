export default class BaseGallery {
    static propTypes: {
        items: any;
        container: any;
        domId: any;
        scrollingElement: any;
        options: any;
        eventsListener: any;
        totalItemsCount: any;
        resizeMediaUrl: any;
    };
    constructor(props: any);
    domId: any;
    render(): any;
}
