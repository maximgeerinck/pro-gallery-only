export default x;
declare function x({ size, ...props }: {
    [x: string]: any;
    size: any;
}): any;
declare namespace x {
    const displayName: string;
    namespace propTypes {
        const size: any;
    }
}
