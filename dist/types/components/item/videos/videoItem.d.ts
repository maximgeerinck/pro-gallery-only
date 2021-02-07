export default VideoItem;
declare class VideoItem extends GalleryComponent {
    constructor(props: any);
    pause(): void;
    play(): void;
    playVideoIfNeeded(props?: any): void;
    state: {
        playedOnce: boolean;
        loadVideo: any;
        playing: boolean;
        reactPlayerLoaded: boolean;
        vimeoPlayerLoaded: boolean;
        hlsPlayerLoaded: boolean;
    };
    componentDidMount(): void;
    dynamiclyImportVideoPlayers(): void;
    isHLSVideo(): any;
    shouldUseHlsPlayer(): any;
    shouldForceVideoForHLS(): any;
    UNSAFE_componentWillReceiveProps(nextProps: any): void;
    componentDidUpdate(prevProps: any): void;
    videoElement: any;
    isPlaying: boolean | undefined;
    createPlayerElement(): any;
    video: any;
    fixIFrameTabIndexIfNeeded(): void;
    render(): any;
}
import { GalleryComponent } from "../../galleryComponent";
