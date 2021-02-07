export default VideoItemWrapper;
declare class VideoItemWrapper extends ImageItem {
    constructor(props: any);
    mightPlayVideo(): boolean;
    createVideoItemPlaceholder(showVideoControls: any): any;
    VideoItem: typeof import("./videoItem").default | undefined;
}
import ImageItem from "../imageItem";
