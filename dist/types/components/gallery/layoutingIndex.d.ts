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
    blueprintsManager: any;
    domId: any;
    state: {
        blueprint: any;
    };
    setBlueprint(blueprint: any): void;
    onNewProps(props: any): void;
    galleryProps: any;
    UNSAFE_componentWillReceiveProps(newProps: any): void;
    render(): any;
}
