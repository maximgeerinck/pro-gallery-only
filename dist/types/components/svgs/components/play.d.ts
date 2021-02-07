export default play;
declare function play({ size, ...props }: {
    [x: string]: any;
    size: any;
}): any;
declare namespace play {
    const displayName: string;
    namespace propTypes {
        const size: any;
    }
}
