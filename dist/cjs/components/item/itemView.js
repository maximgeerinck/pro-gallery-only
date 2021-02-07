"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var react_1 = tslib_1.__importDefault(require("react"));
var pro_gallery_lib_1 = require("pro-gallery-lib");
var imageItem_js_1 = tslib_1.__importDefault(require("./imageItem.js"));
var textItem_js_1 = tslib_1.__importDefault(require("./textItem.js"));
var itemHover_js_1 = tslib_1.__importDefault(require("./itemHover.js"));
var cssScrollHelper_1 = require("../helpers/cssScrollHelper");
var galleryComponent_1 = require("../galleryComponent");
var itemViewStyleProvider_1 = require("./itemViewStyleProvider");
var videoItemWrapper_1 = tslib_1.__importDefault(require("./videos/videoItemWrapper"));
var ItemView = /** @class */ (function (_super) {
    tslib_1.__extends(ItemView, _super);
    function ItemView(props) {
        var _this = _super.call(this, props) || this;
        _this.shouldUseDirectLink = function () {
            var directLink = _this.props.directLink;
            var _a = directLink || {}, url = _a.url, target = _a.target;
            var useDirectLink = !!(url &&
                target &&
                _this.props.styleParams.itemClick === 'link');
            var shouldUseDirectLinkMobileSecondClick = _this.shouldShowHoverOnMobile() &&
                _this.isClickOnCurrentHoveredItem() &&
                useDirectLink;
            if (shouldUseDirectLinkMobileSecondClick) {
                _this.props.actions.eventsListener(pro_gallery_lib_1.GALLERY_CONSTS.events.HOVER_SET, -1);
                return true;
            }
            if (useDirectLink && !_this.shouldShowHoverOnMobile()) {
                return true;
            }
            return false;
        };
        _this.isClickOnCurrentHoveredItem = function () { return _this.state.isCurrentHover; };
        _this.props.actions.eventsListener(pro_gallery_lib_1.GALLERY_CONSTS.events.ITEM_CREATED, _this.props);
        _this.init();
        _this.state = {
            isCurrentHover: false,
            itemWasHovered: false,
        };
        _this.activeElement = '';
        return _this;
    }
    //-------------------------------------------| INIT |--------------------------------------------//
    ItemView.prototype.init = function () {
        this.onItemClick = this.onItemClick.bind(this);
        this.onItemWrapperClick = this.onItemWrapperClick.bind(this);
        this.onItemInfoClick = this.onItemInfoClick.bind(this);
        this.onContainerKeyDown = this.onContainerKeyDown.bind(this);
        this.onAnchorKeyDown = this.onAnchorKeyDown.bind(this);
        this.handleItemMouseDown = this.handleItemMouseDown.bind(this);
        this.handleItemMouseUp = this.handleItemMouseUp.bind(this);
        this.setItemLoaded = this.setItemLoaded.bind(this);
        this.isHighlight = this.isHighlight.bind(this);
        this.getItemHover = this.getItemHover.bind(this);
        this.getImageItem = this.getImageItem.bind(this);
        this.getVideoItem = this.getVideoItem.bind(this);
        this.getTextItem = this.getTextItem.bind(this);
        this.getItemInner = this.getItemInner.bind(this);
        this.getItemContainerStyles = this.getItemContainerStyles.bind(this);
        this.getItemWrapperStyles = this.getItemWrapperStyles.bind(this);
        this.getItemAriaLabel = this.getItemAriaLabel.bind(this);
        this.getItemContainerClass = this.getItemContainerClass.bind(this);
        this.getItemWrapperClass = this.getItemWrapperClass.bind(this);
        this.getItemContainerTabIndex = this.getItemContainerTabIndex.bind(this);
        this.isIconTag = this.isIconTag.bind(this);
        this.onMouseOver = this.onMouseOver.bind(this);
        this.onMouseOut = this.onMouseOut.bind(this);
        this.changeActiveElementIfNeeded = this.changeActiveElementIfNeeded.bind(this);
        this.checkIfCurrentHoverChanged = this.checkIfCurrentHoverChanged.bind(this);
        this.getCustomInfoRendererProps = this.getCustomInfoRendererProps.bind(this);
    };
    //----------------------------------------| ACTIONS |-------------------------------------------//
    ItemView.prototype.setItemLoaded = function () {
        this.props.actions.eventsListener(pro_gallery_lib_1.GALLERY_CONSTS.events.ITEM_LOADED, this.props);
        this.setState({
            loaded: true,
        });
    };
    ItemView.prototype.isIconTag = function (tagName) {
        return (['button', 'i', 'a', 'svg', 'path'].indexOf(tagName.toLowerCase()) >= 0);
    };
    ItemView.prototype.onMouseOver = function () {
        if (!pro_gallery_lib_1.utils.isMobile()) {
            this.props.actions.eventsListener(pro_gallery_lib_1.GALLERY_CONSTS.events.HOVER_SET, this.props.idx);
        }
    };
    ItemView.prototype.onMouseOut = function () {
        if (!pro_gallery_lib_1.utils.isMobile()) {
            this.props.actions.eventsListener(pro_gallery_lib_1.GALLERY_CONSTS.events.HOVER_SET, -1);
        }
    };
    ItemView.prototype.onContainerKeyDown = function (e) {
        var clickTarget = 'item-container';
        switch (e.keyCode || e.charCode) {
            case 32: //space
            case 13: //enter
                e.stopPropagation();
                this.onItemClick(e, clickTarget, false); //pressing enter or space always behaves as click on main image, even if the click is on a thumbnail
                if (this.shouldUseDirectLink()) {
                    this.itemAnchor.click(); // when directLink, we want to simulate the 'enter' or 'space' press on an <a> element
                }
                return false;
            default:
                return true;
        }
    };
    ItemView.prototype.onAnchorKeyDown = function (e) {
        // Similar to "onContainerKeyDown()" expect 'shouldUseDirectLink()' part, because we are already on the <a> tag (this.itemAnchor)
        var clickTarget = 'item-container';
        switch (e.keyCode || e.charCode) {
            case 32: //space
            case 13: //enter
                e.stopPropagation();
                this.onItemClick(e, clickTarget, false); //pressing enter or space always behaves as click on main image, even if the click is on a thumbnail
                return false;
            default:
                return true;
        }
    };
    ItemView.prototype.handleGalleryItemAction = function (e) {
        this.props.actions.eventsListener(pro_gallery_lib_1.GALLERY_CONSTS.events.ITEM_ACTION_TRIGGERED, this.props, e);
    };
    ItemView.prototype.onItemWrapperClick = function (e) {
        var clickTarget = 'item-media';
        this.onItemClick(e, clickTarget);
    };
    ItemView.prototype.onItemInfoClick = function (e) {
        var clickTarget = 'item-info';
        this.onItemClick(e, clickTarget);
    };
    ItemView.prototype.onItemClick = function (e, clickTarget, shouldPreventDefault) {
        if (shouldPreventDefault === void 0) { shouldPreventDefault = true; }
        if (pro_gallery_lib_1.utils.isFunction(pro_gallery_lib_1.utils.get(pro_gallery_lib_1.window, 'galleryWixCodeApi.onItemClicked'))) {
            pro_gallery_lib_1.window.galleryWixCodeApi.onItemClicked(this.props); //TODO remove after OOI is fully integrated
        }
        this.props.actions.eventsListener(pro_gallery_lib_1.GALLERY_CONSTS.events.ITEM_CLICKED, tslib_1.__assign(tslib_1.__assign({}, this.props), { clickTarget: clickTarget }), e);
        if (this.shouldUseDirectLink()) {
            return;
        }
        if (shouldPreventDefault) {
            e.preventDefault();
        }
        if (this.shouldShowHoverOnMobile()) {
            this.handleHoverClickOnMobile(e);
        }
        else {
            this.handleGalleryItemAction(e);
        }
    };
    ItemView.prototype.handleHoverClickOnMobile = function (e) {
        if (this.isClickOnCurrentHoveredItem()) {
            this.handleGalleryItemAction(e);
            this.props.actions.eventsListener(pro_gallery_lib_1.GALLERY_CONSTS.events.HOVER_SET, -1);
        }
        else {
            this.props.actions.eventsListener(pro_gallery_lib_1.GALLERY_CONSTS.events.HOVER_SET, this.props.idx);
        }
    };
    ItemView.prototype.handleItemMouseDown = function () {
        //check for long press
        // if (utils.isMobile()) {
        //   clearTimeout(this.longPressTimer);
        //   this.longPressTimer = setTimeout(() => {
        //     e.preventDefault(); //prevent default only after a long press (so that scroll will not break)
        //     //do something
        //   }, 500);
        // }
        return true; //make sure the default event behaviour continues
    };
    ItemView.prototype.handleItemMouseUp = function () {
        if (pro_gallery_lib_1.utils.isMobile() && this.longPressTimer) {
            clearTimeout(this.longPressTimer);
        }
        return true; //make sure the default event behaviour continues
    };
    //-----------------------------------------| UTILS |--------------------------------------------//
    ItemView.prototype.shouldShowHoverOnMobile = function () {
        if (pro_gallery_lib_1.utils.isMobile()) {
            var _a = this.props.styleParams, titlePlacement = _a.titlePlacement, hoveringBehaviour = _a.hoveringBehaviour, itemClick = _a.itemClick, alwaysShowHover = _a.alwaysShowHover, previewHover = _a.previewHover, allowDescription = _a.allowDescription, allowTitle = _a.allowTitle, isStoreGallery = _a.isStoreGallery;
            var isNewMobileSettings = pro_gallery_lib_1.featureManager.supports.mobileSettings;
            if (hoveringBehaviour === pro_gallery_lib_1.GALLERY_CONSTS.infoBehaviourOnHover.NEVER_SHOW) {
                return false;
            }
            if (itemClick === 'nothing' && this.props.type !== 'video') {
                return true;
            }
            else if (this.props.customHoverRenderer &&
                pro_gallery_lib_1.GALLERY_CONSTS.hasHoverPlacement(titlePlacement) &&
                hoveringBehaviour !== pro_gallery_lib_1.GALLERY_CONSTS.infoBehaviourOnHover.NEVER_SHOW &&
                isNewMobileSettings &&
                (allowDescription || allowTitle || isStoreGallery)) {
                return true;
            }
            if (alwaysShowHover) {
                return true;
            }
            if (pro_gallery_lib_1.isEditMode() && previewHover) {
                return true;
            }
        }
        return false;
    };
    ItemView.prototype.isHighlight = function () {
        return (this.props.thumbnailHighlightId &&
            this.props.thumbnailHighlightId === this.props.id);
    };
    ItemView.prototype.shouldHover = function () {
        //see if this could be decided in the preset
        var styleParams = this.props.styleParams;
        var alwaysShowHover = styleParams.alwaysShowHover, previewHover = styleParams.previewHover, hoveringBehaviour = styleParams.hoveringBehaviour, overlayAnimation = styleParams.overlayAnimation;
        var _a = pro_gallery_lib_1.GALLERY_CONSTS.infoBehaviourOnHover, NEVER_SHOW = _a.NEVER_SHOW, APPEARS = _a.APPEARS;
        var NO_EFFECT = pro_gallery_lib_1.GALLERY_CONSTS.overlayAnimations.NO_EFFECT;
        if (hoveringBehaviour === NEVER_SHOW) {
            return false;
        }
        else if (alwaysShowHover === true) {
            return true;
        }
        else if (pro_gallery_lib_1.isEditMode() && previewHover) {
            return true;
        }
        else if (hoveringBehaviour === APPEARS &&
            overlayAnimation === NO_EFFECT &&
            !this.state.itemWasHovered) {
            //when there is no overlayAnimation, we want to render the itemHover only on first hover and on (and not before)
            //when there is a specific overlayAnimation, to support the animation we should render the itemHover before any hover activity.
            return false;
        }
        else if (pro_gallery_lib_1.utils.isMobile()) {
            return this.shouldShowHoverOnMobile();
        }
        else {
            return true;
        }
    };
    //---------------------------------------| COMPONENTS |-----------------------------------------//
    ItemView.prototype.getImageDimensions = function () {
        //image dimensions are for images in grid fit - placing the image with positive margins to show it within the square
        var _a = this.props, styleParams = _a.styleParams, cubeRatio = _a.cubeRatio, style = _a.style;
        var isLandscape = style.ratio >= cubeRatio; //relative to container size
        var imageMarginLeft = Math.round((style.height * style.ratio - style.width) / -2);
        var imageMarginTop = Math.round((style.width / style.ratio - style.height) / -2);
        var isGridFit = styleParams.cubeImages && styleParams.cubeType === 'fit';
        var dimensions = {};
        if (!isGridFit) {
            dimensions = {
                width: style.width,
                height: style.height,
            };
        }
        else if (isGridFit && isLandscape) {
            dimensions = {
                //landscape
                height: style.height - 2 * imageMarginTop,
                width: style.width,
                margin: imageMarginTop + "px 0",
            };
        }
        else if (isGridFit && !isLandscape) {
            dimensions = {
                //portrait
                width: style.width - 2 * imageMarginLeft,
                height: style.height,
                margin: "0 " + imageMarginLeft + "px",
            };
        }
        if (styleParams.itemBorderRadius &&
            styleParams.imageInfoType !== pro_gallery_lib_1.GALLERY_CONSTS.infoType.ATTACHED_BACKGROUND) {
            dimensions.borderRadius = styleParams.itemBorderRadius + 'px';
        }
        return dimensions;
    };
    ItemView.prototype.getItemHover = function (imageDimensions) {
        var _this = this;
        var _a = this.props, customHoverRenderer = _a.customHoverRenderer, props = tslib_1.__rest(_a, ["customHoverRenderer"]);
        var shouldHover = this.shouldHover();
        return (shouldHover && (react_1.default.createElement(itemHover_js_1.default, tslib_1.__assign({}, props, { forceShowHover: this.simulateOverlayHover(), imageDimensions: imageDimensions, itemWasHovered: this.state.itemWasHovered, key: "hover", actions: {
                handleItemMouseDown: this.handleItemMouseDown,
                handleItemMouseUp: this.handleItemMouseUp,
            }, renderCustomInfo: customHoverRenderer
                ? function () { return customHoverRenderer(_this.getCustomInfoRendererProps()); }
                : null }))));
    };
    ItemView.prototype.getCustomInfoRendererProps = function () {
        return tslib_1.__assign(tslib_1.__assign({}, this.props), { isMobile: pro_gallery_lib_1.utils.isMobile() });
    };
    ItemView.prototype.getImageItem = function (imageDimensions) {
        var props = pro_gallery_lib_1.utils.pick(this.props, [
            'gotFirstScrollEvent',
            'alt',
            'title',
            'description',
            'id',
            'idx',
            'styleParams',
            'createUrl',
            'settings',
            'isPrerenderMode',
        ]);
        return (react_1.default.createElement(imageItem_js_1.default, tslib_1.__assign({}, props, { key: "imageItem", imageDimensions: imageDimensions, isThumbnail: !!this.props.thumbnailHighlightId, customImageRenderer: this.props.customImageRenderer, actions: {
                handleItemMouseDown: this.handleItemMouseDown,
                handleItemMouseUp: this.handleItemMouseUp,
                setItemLoaded: this.setItemLoaded,
            } })));
    };
    ItemView.prototype.getVideoItem = function (imageDimensions, itemHover) {
        return (react_1.default.createElement(videoItemWrapper_1.default, tslib_1.__assign({}, this.props, { playing: this.props.idx === this.props.playingVideoIdx, key: 'video' + this.props.idx, hover: itemHover, imageDimensions: imageDimensions, hasLink: this.itemHasLink(), actions: tslib_1.__assign(tslib_1.__assign({}, this.props.actions), { setItemLoaded: this.setItemLoaded, handleItemMouseDown: this.handleItemMouseDown, handleItemMouseUp: this.handleItemMouseUp }) })));
    };
    ItemView.prototype.getTextItem = function (imageDimensions) {
        var props = pro_gallery_lib_1.utils.pick(this.props, [
            'id',
            'styleParams',
            'style',
            'html',
            'cubeRatio',
            'isPrerenderMode',
        ]);
        return (react_1.default.createElement(textItem_js_1.default, tslib_1.__assign({}, props, { key: "textItem", imageDimensions: imageDimensions, actions: {
                handleItemMouseDown: this.handleItemMouseDown,
                handleItemMouseUp: this.handleItemMouseUp,
                setItemLoaded: this.setItemLoaded,
            } })));
    };
    ItemView.prototype.getItemInner = function () {
        var _this = this;
        var _a = this.props, styleParams = _a.styleParams, type = _a.type;
        var itemInner;
        var imageDimensions = this.getImageDimensions();
        var width = imageDimensions.width, height = imageDimensions.height;
        var itemStyles = { width: width, height: height };
        var itemHover = null;
        if (this.shouldHover() || styleParams.isSlideshow) {
            itemHover = this.getItemHover(itemStyles);
        }
        switch (type) {
            case 'dummy':
                itemInner = react_1.default.createElement("div", null);
                break;
            case 'video':
                itemInner = this.getVideoItem(itemStyles, itemHover);
                break;
            case 'text':
                itemInner = [this.getTextItem(itemStyles), itemHover];
                break;
            case 'image':
            case 'picture':
            default:
                if (this.props.isVideoPlaceholder) {
                    itemInner = this.getVideoItem(itemStyles, itemHover);
                }
                else {
                    itemInner = [this.getImageItem(itemStyles), itemHover];
                }
        }
        if (styleParams.isSlideshow) {
            var customSlideshowInfoRenderer = this.props.customSlideshowInfoRenderer;
            var fadeAnimationStyles = this.getFadeAnimationStyles();
            var infoStyle = tslib_1.__assign(tslib_1.__assign({ height: styleParams.slideshowInfoSize + "px", bottom: "-" + styleParams.slideshowInfoSize + "px" }, fadeAnimationStyles), { transition: 'none' });
            var slideshowInfo = customSlideshowInfoRenderer
                ? customSlideshowInfoRenderer(this.getCustomInfoRendererProps())
                : null;
            var _b = this.props, photoId = _b.photoId, id = _b.id, idx = _b.idx;
            itemInner = (react_1.default.createElement("div", null,
                react_1.default.createElement("a", tslib_1.__assign({ ref: function (e) { return (_this.itemAnchor = e); }, "data-id": photoId, "data-idx": idx, key: 'item-container-link-' + id }, this.getLinkParams(), { tabIndex: -1, style: tslib_1.__assign({}, fadeAnimationStyles) }), itemInner),
                react_1.default.createElement("div", { className: "gallery-slideshow-info", "data-hook": "gallery-slideshow-info-buttons", style: infoStyle }, slideshowInfo)));
        }
        return itemInner;
    };
    ItemView.prototype.getRightInfoElementIfNeeded = function () {
        if (pro_gallery_lib_1.GALLERY_CONSTS.hasRightPlacement(this.props.styleParams.titlePlacement, this.props.idx)) {
            return this.getExternalInfoElement(pro_gallery_lib_1.GALLERY_CONSTS.placements.SHOW_ON_THE_RIGHT, 'gallery-item-right-info');
        }
        else {
            return null;
        }
    };
    ItemView.prototype.getLeftInfoElementIfNeeded = function () {
        if (pro_gallery_lib_1.GALLERY_CONSTS.hasLeftPlacement(this.props.styleParams.titlePlacement, this.props.idx)) {
            return this.getExternalInfoElement(pro_gallery_lib_1.GALLERY_CONSTS.placements.SHOW_ON_THE_LEFT, 'gallery-item-left-info');
        }
        else {
            return null;
        }
    };
    ItemView.prototype.getBottomInfoElementIfNeeded = function () {
        if (pro_gallery_lib_1.GALLERY_CONSTS.hasBelowPlacement(this.props.styleParams.titlePlacement, this.props.idx)) {
            return this.getExternalInfoElement(pro_gallery_lib_1.GALLERY_CONSTS.placements.SHOW_BELOW, 'gallery-item-bottom-info');
        }
        else {
            return null;
        }
    };
    ItemView.prototype.getTopInfoElementIfNeeded = function () {
        if (pro_gallery_lib_1.GALLERY_CONSTS.hasAbovePlacement(this.props.styleParams.titlePlacement, this.props.idx)) {
            return this.getExternalInfoElement(pro_gallery_lib_1.GALLERY_CONSTS.placements.SHOW_ABOVE, 'gallery-item-top-info');
        }
        else {
            return null;
        }
    };
    ItemView.prototype.getExternalInfoElement = function (placement, elementName) {
        var _a = this.props, styleParams = _a.styleParams, customInfoRenderer = _a.customInfoRenderer, style = _a.style;
        if (!customInfoRenderer) {
            return null;
        }
        var info = null;
        //if there is no url for videos and images, we will not render the itemWrapper
        //but will render the info element if exists, with the whole size of the item
        var infoHeight = styleParams.textBoxHeight + (this.hasRequiredMediaUrl ? 0 : style.height);
        var infoWidth = style.infoWidth + (this.hasRequiredMediaUrl ? 0 : style.width);
        var itemExternalInfo = customInfoRenderer(this.getCustomInfoRendererProps(), placement);
        info = (react_1.default.createElement("div", { style: itemViewStyleProvider_1.getOuterInfoStyle(placement, styleParams, style.height, styleParams.textBoxHeight) },
            react_1.default.createElement("div", { style: itemViewStyleProvider_1.getInnerInfoStyle(placement, styleParams, infoHeight, infoWidth), className: 'gallery-item-common-info ' + elementName, "aria-hidden": true, onClick: this.onItemInfoClick }, itemExternalInfo)));
        return info;
    };
    ItemView.prototype.simulateHover = function () {
        return (this.state.isCurrentHover ||
            this.props.styleParams.alwaysShowHover === true ||
            (pro_gallery_lib_1.isEditMode() && this.props.styleParams.previewHover));
    };
    ItemView.prototype.simulateOverlayHover = function () {
        return (this.simulateHover() ||
            this.props.styleParams.hoveringBehaviour ===
                pro_gallery_lib_1.GALLERY_CONSTS.infoBehaviourOnHover.NO_CHANGE);
    };
    ItemView.prototype.itemHasLink = function () {
        var _a = this.props, linkData = _a.linkData, linkUrl = _a.linkUrl;
        var itemDoesntHaveLink = linkData.type === undefined && (linkUrl === undefined || linkUrl === ''); //when itemClick is 'link' but no link was added to this specific item
        return !itemDoesntHaveLink;
    };
    ItemView.prototype.getItemContainerStyles = function () {
        var _a = this.props, idx = _a.idx, currentIdx = _a.currentIdx, offset = _a.offset, style = _a.style, styleParams = _a.styleParams, _b = _a.settings, settings = _b === void 0 ? {} : _b;
        var oneRow = styleParams.oneRow, imageMargin = styleParams.imageMargin, itemClick = styleParams.itemClick, isRTL = styleParams.isRTL, slideAnimation = styleParams.slideAnimation;
        var containerStyleByStyleParams = itemViewStyleProvider_1.getContainerStyle(styleParams);
        var itemDoesntHaveLink = !this.itemHasLink(); //when itemClick is 'link' but no link was added to this specific item
        var itemStyles = {
            overflowY: styleParams.isSlideshow ? 'visible' : 'hidden',
            position: 'absolute',
            bottom: 'auto',
            margin: oneRow ? imageMargin / 2 + 'px' : 0,
            cursor: itemClick === pro_gallery_lib_1.GALLERY_CONSTS.itemClick.NOTHING ||
                (itemClick === pro_gallery_lib_1.GALLERY_CONSTS.itemClick.LINK && itemDoesntHaveLink)
                ? 'default'
                : 'pointer',
        };
        var avoidInlineStyles = settings.avoidInlineStyles;
        var hideOnSSR = this.props.isPrerenderMode && !this.props.settings.disableSSROpacity;
        var opacityStyles = avoidInlineStyles
            ? {}
            : {
                opacity: hideOnSSR ? 0 : 1,
                display: hideOnSSR ? 'none' : 'block',
                transition: 'opacity .2s ease',
            };
        var layoutStyles = avoidInlineStyles
            ? {}
            : {
                top: offset.top,
                left: isRTL ? 'auto' : offset.left,
                right: !isRTL ? 'auto' : offset.left,
                width: style.width + style.infoWidth,
                height: style.height + style.infoHeight,
            };
        var fadeAnimationStyles = slideAnimation === pro_gallery_lib_1.GALLERY_CONSTS.slideAnimations.FADE
            ? {
                left: isRTL ? 'auto' : 0,
                right: !isRTL ? 'auto' : 0,
                pointerEvents: currentIdx === idx ? 'auto' : 'none',
                zIndex: currentIdx === idx ? 0 : 1,
            }
            : {};
        var transitionStyles = this.state.loaded && (pro_gallery_lib_1.isEditMode() || pro_gallery_lib_1.isPreviewMode())
            ? {
                transition: 'all .4s ease',
                transitionProperty: 'top, left, width, height, opacity',
            }
            : {
                transition: 'none',
            };
        var itemContainerStyles = tslib_1.__assign(tslib_1.__assign(tslib_1.__assign(tslib_1.__assign(tslib_1.__assign(tslib_1.__assign({}, itemStyles), layoutStyles), containerStyleByStyleParams), transitionStyles), opacityStyles), fadeAnimationStyles);
        return itemContainerStyles;
    };
    ItemView.prototype.getItemWrapperStyles = function () {
        var _a = this.props, styleParams = _a.styleParams, style = _a.style, type = _a.type;
        var height = style.height;
        var styles = {};
        if (type === 'text') {
            styles.backgroundColor =
                styleParams.cubeType !== 'fit' ? 'transparent' : 'inherit';
        }
        else {
            styles.backgroundColor =
                (styleParams.cubeType !== 'fit' ? style.bgColor : 'inherit') ||
                    'transparent';
        }
        styles.margin = -styleParams.itemBorderWidth + 'px';
        styles.height = height + 'px';
        var imageDimensions = this.getImageDimensions();
        var itemWrapperStyles = tslib_1.__assign(tslib_1.__assign(tslib_1.__assign({}, styles), imageDimensions), (!styleParams.isSlideshow && this.getFadeAnimationStyles()));
        return itemWrapperStyles;
    };
    ItemView.prototype.getFadeAnimationStyles = function () {
        var _a = this.props, idx = _a.idx, currentIdx = _a.currentIdx, styleParams = _a.styleParams;
        return styleParams.slideAnimation === pro_gallery_lib_1.GALLERY_CONSTS.slideAnimations.FADE
            ? {
                transition: currentIdx === idx ? 'none' : 'opacity .8s ease',
                opacity: currentIdx === idx ? 1 : 0,
                display: 'block',
            }
            : {};
    };
    ItemView.prototype.getItemAriaLabel = function () {
        var _a = this.props, type = _a.type, alt = _a.alt, styleParams = _a.styleParams;
        var label;
        switch (type) {
            case 'dummy':
                label = '';
                break;
            case 'text':
                label = 'Text item';
                break;
            case 'video':
                label = alt || 'Untitled video';
                break;
            default:
                label = alt || 'Untitled image';
                break;
        }
        return label + (styleParams.isStoreGallery ? ', Buy Now' : '');
    };
    ItemView.prototype.getItemContainerClass = function () {
        var styleParams = this.props.styleParams;
        var isNOTslideshow = !styleParams.isSlideshow;
        var imagePlacementAnimation = styleParams.imagePlacementAnimation;
        var overlayAnimation = styleParams.overlayAnimation;
        var imageHoverAnimation = styleParams.imageHoverAnimation;
        var classNames = {
            'gallery-item-container': true,
            visible: true,
            highlight: this.isHighlight(),
            clickable: styleParams.itemClick !== 'nothing',
            'simulate-hover': this.simulateHover(),
            'hide-hover': !this.simulateHover() && pro_gallery_lib_1.utils.isMobile(),
            'invert-hover': styleParams.hoveringBehaviour ===
                pro_gallery_lib_1.GALLERY_CONSTS.infoBehaviourOnHover.DISAPPEARS,
            //animations
            'animation-slide': isNOTslideshow &&
                imagePlacementAnimation ===
                    pro_gallery_lib_1.GALLERY_CONSTS.imagePlacementAnimations.SLIDE,
            //overlay animations
            'hover-animation-fade-in': isNOTslideshow &&
                overlayAnimation === pro_gallery_lib_1.GALLERY_CONSTS.overlayAnimations.FADE_IN,
            'hover-animation-expand': isNOTslideshow &&
                overlayAnimation === pro_gallery_lib_1.GALLERY_CONSTS.overlayAnimations.EXPAND,
            'hover-animation-slide-up': isNOTslideshow &&
                overlayAnimation === pro_gallery_lib_1.GALLERY_CONSTS.overlayAnimations.SLIDE_UP,
            'hover-animation-slide-right': isNOTslideshow &&
                overlayAnimation === pro_gallery_lib_1.GALLERY_CONSTS.overlayAnimations.SLIDE_RIGHT,
            //image hover animations
            'zoom-in-on-hover': isNOTslideshow &&
                imageHoverAnimation === pro_gallery_lib_1.GALLERY_CONSTS.imageHoverAnimations.ZOOM_IN,
            'blur-on-hover': isNOTslideshow &&
                imageHoverAnimation === pro_gallery_lib_1.GALLERY_CONSTS.imageHoverAnimations.BLUR,
            'grayscale-on-hover': isNOTslideshow &&
                imageHoverAnimation === pro_gallery_lib_1.GALLERY_CONSTS.imageHoverAnimations.GRAYSCALE,
            'shrink-on-hover': isNOTslideshow &&
                imageHoverAnimation === pro_gallery_lib_1.GALLERY_CONSTS.imageHoverAnimations.SHRINK,
            'invert-on-hover': isNOTslideshow &&
                imageHoverAnimation === pro_gallery_lib_1.GALLERY_CONSTS.imageHoverAnimations.INVERT,
            'color-in-on-hover': isNOTslideshow &&
                imageHoverAnimation === pro_gallery_lib_1.GALLERY_CONSTS.imageHoverAnimations.COLOR_IN,
            'darkened-on-hover': isNOTslideshow &&
                imageHoverAnimation === pro_gallery_lib_1.GALLERY_CONSTS.imageHoverAnimations.DARKENED,
            'pro-gallery-mobile-indicator': pro_gallery_lib_1.utils.isMobile(),
        };
        var strClass = Object.entries(classNames)
            .map(function (_a) {
            var classname = _a[0], isNeeded = _a[1];
            return (isNeeded ? classname : false);
        })
            .filter(Boolean)
            .join(' ');
        return strClass;
    };
    ItemView.prototype.getItemWrapperClass = function () {
        var _a = this.props, styleParams = _a.styleParams, type = _a.type;
        var classes = ['gallery-item-wrapper', 'visible'];
        if (styleParams.cubeImages) {
            classes.push('cube-type-' + styleParams.cubeType);
        }
        if (type === 'text') {
            classes.push('gallery-item-wrapper-text');
        }
        return classes.join(' ');
    };
    ItemView.prototype.getItemContainerTabIndex = function () {
        var tabIndex = this.isHighlight()
            ? pro_gallery_lib_1.utils.getTabIndex('currentThumbnail')
            : this.props.currentIdx === this.props.idx
                ? pro_gallery_lib_1.utils.getTabIndex('currentGalleryItem')
                : -1;
        return tabIndex;
    };
    ItemView.prototype.changeActiveElementIfNeeded = function (prevProps) {
        var _this = this;
        try {
            if ((pro_gallery_lib_1.isSiteMode() || pro_gallery_lib_1.isSEOMode()) &&
                !pro_gallery_lib_1.utils.isMobile() &&
                pro_gallery_lib_1.window.document &&
                pro_gallery_lib_1.window.document.activeElement &&
                pro_gallery_lib_1.window.document.activeElement.className) {
                var activeElement_1 = pro_gallery_lib_1.window.document.activeElement;
                //check if focus is on 'gallery-item-container' in current gallery
                var isThisGalleryItemInFocus = function () {
                    return !!pro_gallery_lib_1.window.document.querySelector("#pro-gallery-" + _this.props.domId + " #" + String(activeElement_1.id));
                };
                var isGalleryItemInFocus = function () {
                    return String(activeElement_1.className).indexOf('gallery-item-container') >=
                        0;
                };
                //check if focus is on 'load-more' in current gallery
                var isThisGalleryShowMoreInFocus = function () {
                    return !!pro_gallery_lib_1.window.document.querySelector("#pro-gallery-" + _this.props.domId + " #" + String(activeElement_1.id));
                };
                var isShowMoreInFocus = function () {
                    return String(activeElement_1.className).indexOf('show-more') >= 0;
                };
                if ((isGalleryItemInFocus() && isThisGalleryItemInFocus()) ||
                    (isShowMoreInFocus() && isThisGalleryShowMoreInFocus())) {
                    if (this.props.thumbnailHighlightId !==
                        prevProps.thumbnailHighlightId &&
                        this.props.thumbnailHighlightId === this.props.id) {
                        // if the highlighted thumbnail changed and it is the same as this itemview's
                        this.itemContainer.focus();
                    }
                    else if (this.props.currentIdx !== prevProps.currentIdx &&
                        this.props.currentIdx === this.props.idx) {
                        //check if currentIdx has changed to the current item
                        this.itemContainer.focus();
                    }
                }
            }
        }
        catch (e) {
            console.error('Could not set focus to active element', e);
        }
    };
    //-----------------------------------------| REACT |--------------------------------------------//
    ItemView.prototype.componentDidMount = function () {
        if (pro_gallery_lib_1.utils.isMobile()) {
            try {
                react_1.default.initializeTouchEvents(true);
                // eslint-disable-next-line no-empty
            }
            catch (e) { }
        }
        pro_gallery_lib_1.window.addEventListener('current_hover_change', this.checkIfCurrentHoverChanged);
    };
    ItemView.prototype.componentWillUnmount = function () {
        clearTimeout(this.itemLoadedTimeout);
        pro_gallery_lib_1.window.removeEventListener('current_hover_change', this.checkIfCurrentHoverChanged);
    };
    ItemView.prototype.componentDidUpdate = function (prevProps) {
        this.changeActiveElementIfNeeded(prevProps);
    };
    ItemView.prototype.checkIfCurrentHoverChanged = function (e) {
        if (e.domId === this.props.domId) {
            if (!this.state.isCurrentHover && e.currentHoverIdx === this.props.idx) {
                this.setState({
                    isCurrentHover: true,
                    itemWasHovered: true,
                });
            }
            else if (this.state.isCurrentHover &&
                e.currentHoverIdx !== this.props.idx) {
                this.setState({
                    isCurrentHover: false,
                });
            }
        }
    };
    ItemView.prototype.onContextMenu = function (e) {
        if (!pro_gallery_lib_1.utils.isDev() && !this.props.styleParams.allowContextMenu) {
            e.preventDefault(e);
        }
    };
    ItemView.prototype.getItemAriaRole = function () {
        switch (this.props.styleParams.itemClick) {
            case 'expand':
            case 'fullscreen':
                return 'button';
            case 'link':
                return 'link';
            default:
                return '';
        }
    };
    ItemView.prototype.getLinkParams = function () {
        var _a = this.props, directLink = _a.directLink, styleParams = _a.styleParams, directShareLink = _a.directShareLink;
        var isSEO = pro_gallery_lib_1.isSEOMode();
        if (styleParams.itemClick === pro_gallery_lib_1.GALLERY_CONSTS.itemClick.LINK) {
            var _b = directLink || {}, url = _b.url, target = _b.target;
            var noFollowForSEO = this.props.noFollowForSEO;
            var shouldUseNofollow = isSEO && noFollowForSEO;
            var shouldUseDirectLink = !!(url && target);
            var seoLinkParams = shouldUseNofollow ? { rel: 'nofollow' } : {};
            var linkParams = shouldUseDirectLink
                ? tslib_1.__assign({ href: url, target: target }, seoLinkParams) : {};
            return linkParams;
        }
        else if (styleParams.itemClick === pro_gallery_lib_1.GALLERY_CONSTS.itemClick.FULLSCREEN ||
            styleParams.itemClick === pro_gallery_lib_1.GALLERY_CONSTS.itemClick.EXPAND) {
            // place share link as the navigation item
            var url = directShareLink;
            var shouldUseDirectShareLink = !!url;
            var linkParams = shouldUseDirectShareLink
                ? { href: url, 'data-cancel-link': true }
                : {};
            return linkParams;
        }
    };
    ItemView.prototype.composeItem = function () {
        var _this = this;
        var _a = this.props, photoId = _a.photoId, id = _a.id, hash = _a.hash, idx = _a.idx, styleParams = _a.styleParams, type = _a.type, url = _a.url;
        //if (there is an url for video items and image items) OR text item (text item do not use media url)
        this.hasRequiredMediaUrl = url || type === 'text';
        //if titlePlacement !== SHOW_ON_HOVER and !this.hasRequiredMediaUrl, we will NOT render the itemWrapper (but will render the info element with the whole size of the item)
        var isItemWrapperEmpty = styleParams.titlePlacement !== pro_gallery_lib_1.GALLERY_CONSTS.placements.SHOW_ON_HOVER &&
            !this.hasRequiredMediaUrl;
        var innerDiv = (react_1.default.createElement("div", { className: this.getItemContainerClass(), onContextMenu: function (e) { return _this.onContextMenu(e); }, id: cssScrollHelper_1.cssScrollHelper.getSellectorDomId(this.props), ref: function (e) { return (_this.itemContainer = e); }, onMouseOver: this.onMouseOver, onMouseOut: this.onMouseOut, onKeyDown: this.onContainerKeyDown, tabIndex: this.getItemContainerTabIndex(), "aria-label": this.getItemAriaLabel(), "data-hash": hash, "data-id": photoId, "data-idx": idx, role: this.getItemAriaRole(), "data-hook": "item-container", key: 'item-container-' + id, style: this.getItemContainerStyles() },
            this.getTopInfoElementIfNeeded(),
            this.getLeftInfoElementIfNeeded(),
            react_1.default.createElement("div", { style: tslib_1.__assign(tslib_1.__assign(tslib_1.__assign({}, (!this.props.styleParams.isSlideshow &&
                    itemViewStyleProvider_1.getImageStyle(this.props.styleParams))), (pro_gallery_lib_1.GALLERY_CONSTS.hasRightPlacement(this.props.styleParams.titlePlacement, this.props.idx) && { float: 'left' })), (pro_gallery_lib_1.GALLERY_CONSTS.hasLeftPlacement(this.props.styleParams.titlePlacement, this.props.idx) && { float: 'right' })) }, !isItemWrapperEmpty && (react_1.default.createElement("div", { "data-hook": "item-wrapper", className: this.getItemWrapperClass(), key: 'item-wrapper-' + id, id: 'item-wrapper-' + id, style: this.getItemWrapperStyles(), onClick: this.onItemWrapperClick }, this.getItemInner()))),
            this.getRightInfoElementIfNeeded(),
            this.getBottomInfoElementIfNeeded()));
        if (styleParams.isSlideshow) {
            return innerDiv;
        }
        else {
            return (react_1.default.createElement("a", tslib_1.__assign({ ref: function (e) { return (_this.itemAnchor = e); }, "data-id": photoId, "data-idx": idx, key: 'item-container-link-' + id }, this.getLinkParams(), { tabIndex: -1, onKeyDown: function (e) {
                    /* Relvenat only for Screen-Reader case:
                    Screen-Reader ignores the tabIdex={-1} and therefore stops and focuses on the <a> tag keyDown event,
                    so it will not go deeper to the item-container keyDown event.
                    */
                    _this.onAnchorKeyDown(e);
                } }), innerDiv));
        }
    };
    //-----------------------------------------| RENDER |--------------------------------------------//
    ItemView.prototype.render = function () {
        return this.composeItem();
    };
    return ItemView;
}(galleryComponent_1.GalleryComponent));
exports.default = ItemView;
//# sourceMappingURL=itemView.js.map