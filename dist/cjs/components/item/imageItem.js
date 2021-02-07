"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var react_1 = tslib_1.__importDefault(require("react"));
var pro_gallery_lib_1 = require("pro-gallery-lib");
var galleryComponent_1 = require("../galleryComponent");
var BLURRY_IMAGE_REMOVAL_ANIMATION_DURATION = 1000;
var Picture = function (imageProps) {
    if (typeof Picture.customImageRenderer === 'function') {
        return Picture.customImageRenderer(imageProps);
    }
    else {
        return react_1.default.createElement("img", tslib_1.__assign({}, imageProps));
    }
};
var ImageItem = /** @class */ (function (_super) {
    tslib_1.__extends(ImageItem, _super);
    function ImageItem(props) {
        var _this = _super.call(this, props) || this;
        _this.getImageContainer = _this.getImageContainer.bind(_this);
        _this.getImageContainerClassNames = _this.getImageContainerClassNames.bind(_this);
        _this.getImageElement = _this.getImageElement.bind(_this);
        _this.state = {
            isHighResImageLoaded: false,
        };
        _this.removeLowResImageTimeoutId = undefined;
        _this.handleHighResImageLoad = _this.handleHighResImageLoad.bind(_this);
        Picture.customImageRenderer = _this.props.customImageRenderer;
        return _this;
    }
    ImageItem.prototype.componentDidMount = function () {
        try {
            if (typeof this.props.actions.setItemLoaded === 'function') {
                this.props.actions.setItemLoaded();
            }
        }
        catch (e) {
            console.error(e);
        }
    };
    ImageItem.prototype.handleHighResImageLoad = function () {
        var _this = this;
        this.removeLowResImageTimeoutId = setTimeout(function () {
            _this.setState({ isHighResImageLoaded: true });
            _this.removeLowResImageTimeoutId = undefined;
        }, BLURRY_IMAGE_REMOVAL_ANIMATION_DURATION);
        try {
            this.props.actions.setItemLoaded();
        }
        catch (e) {
            console.error('Failed to load high res image', e);
        }
    };
    ImageItem.prototype.componentWillUnmount = function () {
        if (this.removeLowResImageTimeoutId !== undefined) {
            clearTimeout(this.removeLowResImageTimeoutId);
        }
    };
    ImageItem.prototype.getImageContainerClassNames = function () {
        var styleParams = this.props.styleParams;
        var imageContainerClassNames = [
            'gallery-item-content',
            'image-item',
            'gallery-item-visible',
            'gallery-item',
            'gallery-item-preloaded',
            styleParams.cubeImages && styleParams.cubeType === 'fit'
                ? 'grid-fit'
                : '',
            styleParams.imageLoadingMode === pro_gallery_lib_1.GALLERY_CONSTS.loadingMode.COLOR
                ? 'load-with-color'
                : '',
        ].join(' ');
        return imageContainerClassNames;
    };
    ImageItem.prototype.getImageContainer = function (imageRenderer, classNames, extraNodes) {
        var _a = this.props, imageDimensions = _a.imageDimensions, id = _a.id, actions = _a.actions;
        return (react_1.default.createElement("div", { className: classNames, onTouchStart: actions.handleItemMouseDown, onTouchEnd: actions.handleItemMouseUp, key: 'image_container-' + id, "data-hook": 'image-item', style: imageDimensions.borderRadius
                ? { borderRadius: imageDimensions.borderRadius }
                : {} },
            imageRenderer(),
            extraNodes));
    };
    ImageItem.prototype.getImageAnimationOverlay = function () {
        var _a = this.props, imageDimensions = _a.imageDimensions, styleParams = _a.styleParams, createUrl = _a.createUrl, id = _a.id;
        var imageAnimationUrl = null;
        switch (styleParams.scrollAnimation) {
            case pro_gallery_lib_1.GALLERY_CONSTS.scrollAnimations.BLUR:
                imageAnimationUrl = createUrl(pro_gallery_lib_1.GALLERY_CONSTS.urlSizes.RESIZED, pro_gallery_lib_1.GALLERY_CONSTS.urlTypes.LOW_RES);
                break;
            case pro_gallery_lib_1.GALLERY_CONSTS.scrollAnimations.MAIN_COLOR:
                imageAnimationUrl = createUrl(pro_gallery_lib_1.GALLERY_CONSTS.urlSizes.PIXEL, pro_gallery_lib_1.GALLERY_CONSTS.urlTypes.HIGH_RES);
                break;
        }
        return (imageAnimationUrl && (react_1.default.createElement("div", { key: 'image_container-overlay-' + id, "data-hook": 'image-item-overlay', style: tslib_1.__assign(tslib_1.__assign({}, imageDimensions), { backgroundImage: "url(" + imageAnimationUrl + ")", backgroundSize: 'cover', pointerEvents: 'none', position: 'absolute', top: 0, left: 0 }) })));
    };
    ImageItem.prototype.getImageElement = function () {
        var _this = this;
        var _a = this.props, alt = _a.alt, imageDimensions = _a.imageDimensions, createUrl = _a.createUrl, id = _a.id, idx = _a.idx, _b = _a.settings, settings = _b === void 0 ? {} : _b, styleParams = _a.styleParams, gotFirstScrollEvent = _a.gotFirstScrollEvent;
        var isHighResImageLoaded = this.state.isHighResImageLoaded;
        var imageProps = settings &&
            settings.imageProps &&
            typeof settings.imageProps === 'function'
            ? settings.imageProps(id)
            : {};
        // eslint-disable-next-line no-unused-vars
        var _c = imageDimensions || {}, margin = _c.margin, restOfDimensions = tslib_1.__rest(_c, ["margin"]);
        var image = function () {
            var imagesComponents = [];
            var blockDownloadStyles = pro_gallery_lib_1.utils.isMobile() && !_this.props.styleParams.allowContextMenu
                ? {
                    '-webkit-user-select': 'none',
                    '-webkit-touch-callout': 'none',
                }
                : {};
            var preloadStyles = _this.props.isPrerenderMode
                ? {
                    width: '100%',
                    height: '100%',
                }
                : {};
            if (!isHighResImageLoaded &&
                (gotFirstScrollEvent || settings.forceImagePreload)) {
                var preload = null;
                var preloadProps = tslib_1.__assign({ className: 'gallery-item-visible gallery-item gallery-item-preloaded', key: 'gallery-item-image-img-preload', 'data-hook': 'gallery-item-image-img-preload', loading: 'eager' }, imageProps);
                switch (styleParams.imageLoadingMode) {
                    case pro_gallery_lib_1.GALLERY_CONSTS.loadingMode.BLUR:
                        preload = (react_1.default.createElement(Picture, tslib_1.__assign({ alt: "", key: 'image_preload_blur-' + id, src: createUrl(pro_gallery_lib_1.GALLERY_CONSTS.urlSizes.RESIZED, pro_gallery_lib_1.GALLERY_CONSTS.urlTypes.LOW_RES), style: tslib_1.__assign(tslib_1.__assign(tslib_1.__assign({}, restOfDimensions), preloadStyles), blockDownloadStyles) }, preloadProps)));
                        break;
                    case pro_gallery_lib_1.GALLERY_CONSTS.loadingMode.MAIN_COLOR:
                        preload = (react_1.default.createElement(Picture, tslib_1.__assign({ alt: "", key: 'image_preload_main_color-' + id, src: createUrl(pro_gallery_lib_1.GALLERY_CONSTS.urlSizes.PIXEL, pro_gallery_lib_1.GALLERY_CONSTS.urlTypes.HIGH_RES), style: tslib_1.__assign(tslib_1.__assign(tslib_1.__assign({}, restOfDimensions), preloadStyles), blockDownloadStyles) }, preloadProps)));
                        break;
                }
                imagesComponents.push(preload);
            }
            var shouldRenderHighResImages = !_this.props.isPrerenderMode;
            var src = createUrl(pro_gallery_lib_1.GALLERY_CONSTS.urlSizes.RESIZED, pro_gallery_lib_1.isSEOMode()
                ? pro_gallery_lib_1.GALLERY_CONSTS.urlTypes.SEO
                : pro_gallery_lib_1.GALLERY_CONSTS.urlTypes.HIGH_RES);
            var highres = (react_1.default.createElement(Picture, tslib_1.__assign({ key: 'image_highres-' + id, className: "gallery-item-visible gallery-item gallery-item-preloaded", "data-hook": "gallery-item-image-img", "data-idx": idx, src: src, alt: alt ? alt : 'untitled image', loading: "lazy", onLoad: _this.handleHighResImageLoad, style: tslib_1.__assign(tslib_1.__assign(tslib_1.__assign({}, restOfDimensions), blockDownloadStyles), (!shouldRenderHighResImages && preloadStyles)) }, imageProps)));
            imagesComponents.push(highres);
            return imagesComponents;
        };
        return image;
    };
    ImageItem.prototype.render = function () {
        var imageRenderer = this.getImageElement();
        var imageContainerClassNames = this.getImageContainerClassNames();
        var animationOverlay = this.getImageAnimationOverlay();
        var renderedItem = this.getImageContainer(imageRenderer, imageContainerClassNames, animationOverlay);
        return renderedItem;
    };
    return ImageItem;
}(galleryComponent_1.GalleryComponent));
exports.default = ImageItem;
//# sourceMappingURL=imageItem.js.map