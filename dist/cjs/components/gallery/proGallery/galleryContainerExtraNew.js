"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GalleryContainer = void 0;
var tslib_1 = require("tslib");
var react_1 = tslib_1.__importDefault(require("react"));
var pro_gallery_lib_1 = require("pro-gallery-lib");
var galleryView_1 = tslib_1.__importDefault(require("./galleryView"));
var slideshowView_1 = tslib_1.__importDefault(require("./slideshowView"));
var scrollHelper_1 = require("../../helpers/scrollHelper");
var galleryScrollIndicator_1 = tslib_1.__importDefault(require("./galleryScrollIndicator"));
var cssLayoutsHelper_js_1 = require("../../helpers/cssLayoutsHelper.js");
var cssScrollHelper_js_1 = require("../../helpers/cssScrollHelper.js");
var videoScrollHelperWrapper_1 = tslib_1.__importDefault(require("../../helpers/videoScrollHelperWrapper"));
var layoutUtils_1 = tslib_1.__importDefault(require("../../helpers/layoutUtils"));
var GalleryContainer = /** @class */ (function (_super) {
    tslib_1.__extends(GalleryContainer, _super);
    function GalleryContainer(props) {
        var _this = _super.call(this, props) || this;
        _this.findNeighborItem = function (itemIdx, dir) {
            return layoutUtils_1.default(itemIdx, dir, _this.state.structure.items);
        }; // REFACTOR BLUEPRINTS - this makes the function in the layouter irrelevant (unless the layouter is used as a stand alone with this function, maybe the layouter needs to be split for bundle size as well...)
        if (pro_gallery_lib_1.utils.isVerbose()) {
            console.count('[OOISSR] galleryContainerNew constructor', pro_gallery_lib_1.window.isMock);
        }
        _this.getMoreItemsIfNeeded = _this.getMoreItemsIfNeeded.bind(_this);
        _this.setGotFirstScrollIfNeeded = _this.setGotFirstScrollIfNeeded.bind(_this);
        _this.toggleLoadMoreItems = _this.toggleLoadMoreItems.bind(_this);
        _this.scrollToItem = _this.scrollToItem.bind(_this);
        _this.scrollToGroup = _this.scrollToGroup.bind(_this);
        _this._scrollingElement = _this.getScrollingElement();
        _this.eventsListener = _this.eventsListener.bind(_this);
        _this.onGalleryScroll = _this.onGalleryScroll.bind(_this);
        _this.setPlayingIdxState = _this.setPlayingIdxState.bind(_this);
        _this.getVisibleItems = _this.getVisibleItems.bind(_this);
        _this.findNeighborItem = _this.findNeighborItem.bind(_this);
        _this.videoScrollHelper = new videoScrollHelperWrapper_1.default(_this.setPlayingIdxState);
        var initialState = {
            pgScroll: 0,
            showMoreClickedAtLeastOnce: false,
            initialGalleryHeight: undefined,
            needToHandleShowMoreClick: false,
            gotFirstScrollEvent: false,
            playingVideoIdx: -1,
            viewComponent: null,
            firstUserInteractionExecuted: false,
        };
        _this.state = initialState;
        _this.layoutCss = [];
        _this.initialGalleryState = {};
        try {
            var galleryState = _this.propsToState(props);
            if (Object.keys(galleryState).length > 0) {
                _this.initialGalleryState = galleryState;
            }
        }
        catch (_e) {
            console.warn('Cannot create initial state from props (blueprints)', _e);
        }
        _this.state = tslib_1.__assign(tslib_1.__assign({}, initialState), _this.initialGalleryState);
        return _this;
        //not sure if there needs to be a handleNEwGalleryStructure here with the intial state. currently looks like not
    }
    GalleryContainer.prototype.componentDidMount = function () {
        this.scrollToItem(this.props.currentIdx, false, true, 0);
        this.handleNewGalleryStructure();
        this.eventsListener(pro_gallery_lib_1.GALLERY_CONSTS.events.APP_LOADED, {});
        this.videoScrollHelper.initializePlayState();
        try {
            if (typeof pro_gallery_lib_1.window.CustomEvent === 'function') {
                this.currentHoverChangeEvent = new CustomEvent('current_hover_change');
            }
            else {
                //IE (new CustomEvent is not supported in IE)
                this.currentHoverChangeEvent = pro_gallery_lib_1.window.document.createEvent('CustomEvent'); // MUST be 'CustomEvent'
                this.currentHoverChangeEvent.initCustomEvent('current_hover_change', false, false, null);
            }
        }
        catch (e) {
            console.error("could not create 'current_hover_change' customEvent. Error =", e);
        }
        if (this.props.domId) {
            this.currentHoverChangeEvent.domId = this.props.domId;
        }
    };
    GalleryContainer.prototype.UNSAFE_componentWillReceiveProps = function (nextProps) {
        var _this = this;
        if (!this.currentHoverChangeEvent.domId && nextProps.domId) {
            this.currentHoverChangeEvent.domId = nextProps.domId;
        }
        if (this.props.currentIdx !== nextProps.currentIdx) {
            this.scrollToItem(nextProps.currentIdx, false, true, 0);
        }
        var reCreateGallery = function () {
            var galleryState = _this.propsToState(nextProps);
            if (Object.keys(galleryState).length > 0) {
                _this.setState(galleryState, _this.handleNewGalleryStructure);
            }
        };
        var getSignificantProps = function (props) {
            var domId = props.domId, styles = props.styles, container = props.container, items = props.items, watermark = props.watermark;
            return { domId: domId, styles: styles, container: container, items: items, watermark: watermark };
        };
        if (this.reCreateGalleryTimer) {
            clearTimeout(this.reCreateGalleryTimer);
        }
        var hasPropsChanged = true;
        try {
            var currentSignificatProps = getSignificantProps(this.props);
            var nextSignificatProps = getSignificantProps(nextProps);
            hasPropsChanged =
                JSON.stringify(currentSignificatProps) !==
                    JSON.stringify(nextSignificatProps);
            if (pro_gallery_lib_1.utils.isVerbose() && hasPropsChanged) {
                console.log('New props arrived', pro_gallery_lib_1.utils.printableObjectsDiff(currentSignificatProps, nextSignificatProps));
            }
        }
        catch (e) {
            console.error('Cannot compare props', e);
        }
        if (hasPropsChanged) {
            reCreateGallery();
            if (!!nextProps.currentIdx && nextProps.currentIdx > 0) {
                this.scrollToItem(nextProps.currentIdx, false, true, 0);
            }
            if (this.props.isInDisplay !== nextProps.isInDisplay) {
                this.handleNavigation(nextProps.isInDisplay);
            }
        }
        else {
            //this is a hack, because in fullwidth, new props arrive without any changes
            // this.reCreateGalleryTimer = setTimeout(reCreateGallery, 1000);
        }
    };
    GalleryContainer.prototype.handleNavigation = function (isInDisplay) {
        if (isInDisplay) {
            this.videoScrollHelper.trigger.INIT_SCROLL();
        }
        else {
            this.videoScrollHelper.stop();
        }
    };
    GalleryContainer.prototype.handleNewGalleryStructure = function () {
        //should be called AFTER new state is set
        var _a = this.state, container = _a.container, needToHandleShowMoreClick = _a.needToHandleShowMoreClick, initialGalleryHeight = _a.initialGalleryHeight;
        var styleParams = this.props.styles;
        var numOfItems = this.state.items.length;
        var layoutHeight = this.props.structure.height;
        var layoutItems = this.props.structure.items;
        var isInfinite = this.containerInfiniteGrowthDirection() === 'vertical';
        var updatedHeight = false;
        var needToUpdateHeightNotInfinite = !isInfinite && needToHandleShowMoreClick;
        if (needToUpdateHeightNotInfinite) {
            var showMoreContainerHeight = 138; //according to the scss
            updatedHeight =
                container.height + (initialGalleryHeight - showMoreContainerHeight);
        }
        var onGalleryChangeData = {
            numOfItems: numOfItems,
            container: container,
            styleParams: styleParams,
            layoutHeight: layoutHeight,
            layoutItems: layoutItems,
            isInfinite: isInfinite,
            updatedHeight: updatedHeight,
        };
        if (pro_gallery_lib_1.utils.isVerbose()) {
            console.log('handleNewGalleryStructure', onGalleryChangeData);
        }
        this.eventsListener(pro_gallery_lib_1.GALLERY_CONSTS.events.GALLERY_CHANGE, onGalleryChangeData);
        if (needToHandleShowMoreClick) {
            this.setState({ needToHandleShowMoreClick: false });
        }
    };
    GalleryContainer.prototype.isVerticalGallery = function () {
        return !this.state.styles.oneRow;
    };
    GalleryContainer.prototype.getVisibleItems = function (items, container) {
        var gotFirstScrollEvent = this.state.gotFirstScrollEvent;
        var scrollY = pro_gallery_lib_1.window.scrollY;
        var galleryHeight = container.galleryHeight, scrollBase = container.scrollBase, galleryWidth = container.galleryWidth;
        if ((pro_gallery_lib_1.utils.isSSR() && !this.props.settings.renderVisibleItemsInSsr) ||
            pro_gallery_lib_1.isSEOMode() ||
            pro_gallery_lib_1.isEditMode() ||
            pro_gallery_lib_1.isPreviewMode() ||
            gotFirstScrollEvent ||
            scrollY > 0 ||
            this.props.currentIdx > 0) {
            return items;
        }
        var visibleItems = items;
        try {
            var windowHeight = pro_gallery_lib_1.window.innerHeight;
            var isInfinite = this.isVerticalGallery() &&
                this.containerInfiniteGrowthDirection() === 'vertical';
            var galleryBottom = isInfinite ? Infinity : scrollBase + galleryHeight;
            var windowBottom = scrollY + windowHeight;
            var maxItemTop_1 = Math.min(galleryBottom, windowBottom) - scrollBase;
            if (maxItemTop_1 < 0) {
                //gallery is below the fold
                visibleItems = [];
            }
            else if (this.isVerticalGallery()) {
                visibleItems = items.filter(function (item) { return item.offset.top < maxItemTop_1; });
            }
            else {
                visibleItems = items.filter(function (item) { return item.left <= galleryWidth + 20; });
            }
            if (visibleItems.length < 2 && visibleItems.length < items.length) {
                //dont render less then 2 items (otherwise slide show Arrow will be removed)
                visibleItems = items.slice(0, 2);
            }
        }
        catch (e) {
            console.error('Could not calculate visible items, returning original items', e);
            visibleItems = items;
        }
        return visibleItems;
    };
    GalleryContainer.prototype.propsToState = function (_a) {
        var items = _a.items, styles = _a.styles, structure = _a.structure, container = _a.container, domId = _a.domId, resizeMediaUrl = _a.resizeMediaUrl, isPrerenderMode = _a.isPrerenderMode;
        items = items || this.props.items;
        styles = styles || this.props.styles;
        container = container || this.props.container;
        structure = structure || this.props.structure;
        domId = domId || this.props.domId;
        resizeMediaUrl = resizeMediaUrl || this.props.resizeMediaUrl;
        this.galleryStructure = pro_gallery_lib_1.ItemsHelper.convertToGalleryItems(structure, {
            // TODO use same objects in the memory when the galleryItems are changed
            thumbnailSize: styles.thumbnailSize,
            sharpParams: styles.sharpParams,
            resizeMediaUrl: resizeMediaUrl,
        });
        // // ------------ TODO. This is using GalleryItem and I am leaving it here for now ---------- //
        var shouldUseScrollCss = !pro_gallery_lib_1.isSEOMode() &&
            (pro_gallery_lib_1.isEditMode() ||
                this.state.gotFirstScrollEvent ||
                this.state.showMoreClickedAtLeastOnce);
        if (shouldUseScrollCss) {
            this.getScrollCss({
                domId: domId,
                items: this.galleryStructure.galleryItems,
                styleParams: styles,
                container: container,
            });
        }
        var scrollHelperNewGalleryStructure = {
            galleryStructure: this.galleryStructure,
            scrollBase: container.scrollBase,
            videoPlay: styles.videoPlay,
            videoLoop: styles.videoLoop,
            itemClick: styles.itemClick,
            oneRow: styles.oneRow,
            cb: this.setPlayingIdxState,
        };
        this.videoScrollHelper.updateGalleryStructure(scrollHelperNewGalleryStructure, !pro_gallery_lib_1.utils.isSSR(), items);
        var layoutParams = {
            items: items,
            container: container,
            styleParams: styles,
            gotScrollEvent: true,
            options: {
                showAllItems: true,
                skipVisibilitiesCalc: true,
                useLayoutStore: false,
                createLayoutOnInit: false,
            },
        };
        this.createCssLayoutsIfNeeded(layoutParams);
        this.createDynamicStyles(styles, isPrerenderMode);
        var newState = {
            items: items,
            styles: styles,
            container: container,
            structure: structure,
        };
        return newState;
    };
    GalleryContainer.prototype.getScrollingElement = function () {
        var _this = this;
        var horizontal = function () {
            return pro_gallery_lib_1.window.document.querySelector("#pro-gallery-" + _this.props.domId + " #gallery-horizontal-scroll");
        };
        var vertical = this.props.scrollingElement
            ? typeof this.props.scrollingElement === 'function'
                ? this.props.scrollingElement
                : function () { return _this.props.scrollingElement; }
            : function () { return pro_gallery_lib_1.window; };
        return { vertical: vertical, horizontal: horizontal };
    };
    GalleryContainer.prototype.scrollToItem = function (itemIdx, fixedScroll, isManual, durationInMS, scrollMarginCorrection) {
        if (durationInMS === void 0) { durationInMS = 0; }
        if (itemIdx >= 0) {
            var scrollingElement = this._scrollingElement;
            var horizontalElement = scrollingElement.horizontal();
            try {
                var scrollParams = {
                    scrollMarginCorrection: scrollMarginCorrection,
                    isRTL: this.state.styles.isRTL,
                    oneRow: this.state.styles.oneRow,
                    galleryWidth: this.state.container.galleryWidth,
                    galleryHeight: this.state.container.galleryHeight,
                    top: 0,
                    items: this.galleryStructure.items,
                    totalWidth: this.galleryStructure.width,
                    itemIdx: itemIdx,
                    fixedScroll: fixedScroll,
                    isManual: isManual,
                    scrollingElement: scrollingElement,
                    horizontalElement: horizontalElement,
                    durationInMS: durationInMS,
                };
                return scrollHelper_1.scrollToItemImp(scrollParams);
            }
            catch (e) {
                //added console.error to debug sentry error 'Cannot read property 'isRTL' of undefined in pro-gallery-statics'
                console.error('error:', e, ' pro-gallery, scrollToItem, cannot get scrollParams, ', 'isEditMode =', pro_gallery_lib_1.isEditMode(), ' isPreviewMode =', pro_gallery_lib_1.isPreviewMode(), ' isSiteMode =', pro_gallery_lib_1.isSiteMode(), ' this.state.styles =', this.state.styles, ' this.state.container =', this.state.container, ' this.galleryStructure =', this.galleryStructure);
            }
        }
    };
    GalleryContainer.prototype.scrollToGroup = function (groupIdx, fixedScroll, isManual, durationInMS, scrollMarginCorrection) {
        if (durationInMS === void 0) { durationInMS = 0; }
        if (groupIdx >= 0) {
            var scrollingElement = this._scrollingElement;
            var horizontalElement = scrollingElement.horizontal();
            try {
                var scrollParams = {
                    scrollMarginCorrection: scrollMarginCorrection,
                    isRTL: this.state.styles.isRTL,
                    oneRow: this.state.styles.oneRow,
                    galleryWidth: this.state.container.galleryWidth,
                    galleryHeight: this.state.container.galleryHeight,
                    top: 0,
                    groups: this.galleryStructure.groups,
                    totalWidth: this.galleryStructure.width,
                    groupIdx: groupIdx,
                    fixedScroll: fixedScroll,
                    isManual: isManual,
                    scrollingElement: scrollingElement,
                    horizontalElement: horizontalElement,
                    durationInMS: durationInMS,
                };
                return scrollHelper_1.scrollToGroupImp(scrollParams);
            }
            catch (e) {
                //added console.error to debug sentry error 'Cannot read property 'isRTL' of undefined in pro-gallery-statics'
                console.error('error:', e, ' pro-gallery, scrollToGroup, cannot get scrollParams, ', 'isEditMode =', pro_gallery_lib_1.isEditMode(), ' isPreviewMode =', pro_gallery_lib_1.isPreviewMode(), ' isSiteMode =', pro_gallery_lib_1.isSiteMode(), ' this.state.styles =', this.state.styles, ' this.state.container =', this.state.container, ' this.galleryStructure =', this.galleryStructure);
            }
        }
    };
    GalleryContainer.prototype.containerInfiniteGrowthDirection = function (styles) {
        if (styles === void 0) { styles = false; }
        var _styles = styles || this.props.styles;
        // return the direction in which the gallery can grow on it's own (aka infinite scroll)
        var enableInfiniteScroll = this.props.styles.enableInfiniteScroll; //TODO - props or "raw" styles
        var showMoreClickedAtLeastOnce = this.state.showMoreClickedAtLeastOnce;
        var oneRow = _styles.oneRow, loadMoreAmount = _styles.loadMoreAmount;
        if (oneRow) {
            return 'horizontal';
        }
        else if (!enableInfiniteScroll) {
            //vertical gallery with showMore button enabled
            if (showMoreClickedAtLeastOnce && loadMoreAmount === 'all') {
                return 'vertical';
            }
            else {
                return 'none';
            }
        }
        else {
            return 'vertical';
        }
    };
    GalleryContainer.prototype.setPlayingIdxState = function (playingVideoIdx) {
        this.setState({
            playingVideoIdx: playingVideoIdx,
        });
    };
    GalleryContainer.prototype.onGalleryScroll = function (_a) {
        var top = _a.top, left = _a.left;
        this.videoScrollHelper.trigger.SCROLL({
            top: top,
            left: left,
        });
    };
    GalleryContainer.prototype.createDynamicStyles = function (_a, isPrerenderMode) {
        var overlayBackground = _a.overlayBackground;
        var useSSROpacity = isPrerenderMode && !this.props.settings.disableSSROpacity;
        this.dynamicStyles = ("\n      " + (!useSSROpacity
            ? ''
            : "#pro-gallery-" + this.props.domId + " .gallery-item-container { opacity: 0 }") + "\n      " + (!overlayBackground
            ? ''
            : "#pro-gallery-" + this.props.domId + " .gallery-item-hover::before { background: " + overlayBackground + " !important}") + "\n    ").trim();
    };
    GalleryContainer.prototype.createCssLayoutsIfNeeded = function (layoutParams) {
        var _a = this.props.settings, settings = _a === void 0 ? {} : _a;
        var avoidInlineStyles = settings.avoidInlineStyles;
        if (avoidInlineStyles) {
            this.layoutCss = cssLayoutsHelper_js_1.createCssLayouts({
                layoutParams: layoutParams,
                isMobile: pro_gallery_lib_1.utils.isMobile(),
                domId: this.props.domId,
                galleryItems: this.galleryStructure.galleryItems,
            });
        }
    };
    GalleryContainer.prototype.getScrollCss = function (_a) {
        var domId = _a.domId, items = _a.items, styleParams = _a.styleParams, container = _a.container;
        this.scrollCss = cssScrollHelper_js_1.cssScrollHelper.calcScrollCss({
            items: items,
            styleParams: styleParams,
            domId: domId,
            container: container,
        });
    };
    GalleryContainer.prototype.toggleLoadMoreItems = function () {
        var _this = this;
        this.eventsListener(pro_gallery_lib_1.GALLERY_CONSTS.events.LOAD_MORE_CLICKED, this.galleryStructure.galleryItems);
        var showMoreClickedAtLeastOnce = true;
        var needToHandleShowMoreClick = true;
        //before clicking "load more" at the first time
        if (!this.state.showMoreClickedAtLeastOnce) {
            this.getScrollCss({
                domId: this.props.domId,
                items: this.galleryStructure.galleryItems,
                styleParams: this.state.styles,
                container: this.state.container,
            });
            var initialGalleryHeight = this.state.container.height; //container.height before clicking "load more" at the first time
            this.setState({
                showMoreClickedAtLeastOnce: showMoreClickedAtLeastOnce,
                initialGalleryHeight: initialGalleryHeight,
                needToHandleShowMoreClick: needToHandleShowMoreClick,
            }, function () {
                _this.handleNewGalleryStructure();
            });
        }
        else {
            //from second click
            this.setState({
                needToHandleShowMoreClick: needToHandleShowMoreClick,
            }, function () {
                _this.handleNewGalleryStructure();
            });
        }
    };
    GalleryContainer.prototype.setGotFirstScrollIfNeeded = function () {
        if (!this.state.gotFirstScrollEvent) {
            this.getScrollCss({
                domId: this.props.domId,
                items: this.galleryStructure.galleryItems,
                styleParams: this.state.styles,
                container: this.state.container,
            });
            this.setState({
                gotFirstScrollEvent: true,
            });
        }
    };
    GalleryContainer.prototype.eventsListener = function (eventName, eventData, event) {
        this.videoScrollHelper.handleEvent({
            eventName: eventName,
            eventData: eventData,
        });
        if (eventName === pro_gallery_lib_1.GALLERY_CONSTS.events.HOVER_SET) {
            this.currentHoverChangeEvent.currentHoverIdx = eventData;
            pro_gallery_lib_1.window.dispatchEvent(this.currentHoverChangeEvent);
        }
        if (!this.state.firstUserInteractionExecuted) {
            switch (eventName) {
                case pro_gallery_lib_1.GALLERY_CONSTS.events.HOVER_SET:
                case pro_gallery_lib_1.GALLERY_CONSTS.events.LOAD_MORE_CLICKED:
                case pro_gallery_lib_1.GALLERY_CONSTS.events.ITEM_ACTION_TRIGGERED:
                    this.setState({ firstUserInteractionExecuted: true });
                    break;
            }
        }
        if (typeof this.props.eventsListener === 'function') {
            this.props.eventsListener(eventName, eventData, event);
        }
    };
    GalleryContainer.prototype.getMoreItemsIfNeeded = function (scrollPos) {
        var _this = this;
        if (this.galleryStructure &&
            this.galleryStructure.galleryItems &&
            this.galleryStructure.galleryItems.length > 0 &&
            !this.gettingMoreItems &&
            this.state.items &&
            this.state.styles &&
            this.state.container) {
            //more items can be fetched from the server
            //TODO - add support for horizontal galleries
            var _a = this.state.styles, oneRow = _a.oneRow, isRTL = _a.isRTL;
            var galleryEnd = this.galleryStructure[oneRow ? 'width' : 'height'] +
                (oneRow ? 0 : this.state.container.scrollBase);
            var screenSize = pro_gallery_lib_1.window.screen[oneRow ? 'width' : 'height'];
            var scrollEnd = oneRow && isRTL
                ? scrollPos - galleryEnd + screenSize
                : scrollPos + screenSize;
            var getItemsDistance = scrollPos ? 3 * screenSize : 0; //first scrollPos is 0 falsy. dont load before a scroll happened.
            if (galleryEnd < getItemsDistance + scrollEnd) {
                //only when the last item turns visible we should try getting more items
                this.gettingMoreItems = true;
                this.eventsListener(pro_gallery_lib_1.GALLERY_CONSTS.events.NEED_MORE_ITEMS, this.state.items.length);
                setTimeout(function () {
                    //wait a bit before allowing more items to be fetched - ugly hack before promises still not working
                    _this.gettingMoreItems = false;
                }, 2000);
            }
        }
    };
    GalleryContainer.prototype.canRender = function () {
        var can = this.props.container && this.props.styles && this.state.items;
        if (!can && pro_gallery_lib_1.utils.isVerbose()) {
            console.log('PROGALLERY [CAN_RENDER] GalleryContainer', can, this.props.container, this.props.styles, this.state.items);
        }
        return can;
    };
    GalleryContainer.prototype.render = function () {
        if (!this.canRender()) {
            return null;
        }
        var ViewComponent = this.props.styles.oneRow
            ? slideshowView_1.default
            : galleryView_1.default;
        if (pro_gallery_lib_1.utils.isVerbose()) {
            console.count('PROGALLERY [COUNTS] - GalleryContainer (render)');
            console.log('PROGALLERY [RENDER] - GalleryContainer', this.props.container.scrollBase, { props: this.props, items: this.state.items });
        }
        var displayShowMore = this.containerInfiniteGrowthDirection() === 'none';
        return (react_1.default.createElement("div", { "data-key": "pro-gallery-inner-container", key: "pro-gallery-inner-container", className: this.props.isPrerenderMode ? 'pro-gallery-prerender' : '' },
            react_1.default.createElement(galleryScrollIndicator_1.default, { domId: this.props.domId, oneRow: this.props.styles.oneRow, isRTL: this.props.styles.isRTL, totalWidth: this.galleryStructure.width, scrollBase: this.props.container.scrollBase, scrollingElement: this._scrollingElement, getMoreItemsIfNeeded: this.getMoreItemsIfNeeded, setGotFirstScrollIfNeeded: this.setGotFirstScrollIfNeeded, onScroll: this.onGalleryScroll }),
            react_1.default.createElement(ViewComponent, tslib_1.__assign({ isInDisplay: this.props.isInDisplay, isPrerenderMode: this.props.isPrerenderMode, scrollingElement: this._scrollingElement, totalItemsCount: this.props.totalItemsCount, renderedItemsCount: this.props.renderedItemsCount, getMoreItemsIfNeeded: this.getMoreItemsIfNeeded, gotFirstScrollEvent: this.state.gotFirstScrollEvent, setGotFirstScrollIfNeeded: this.setGotFirstScrollIfNeeded, items: this.state.items, getVisibleItems: this.getVisibleItems, itemsLoveData: this.props.itemsLoveData, galleryStructure: this.galleryStructure, styleParams: this.props.styles, container: this.props.container, watermark: this.props.watermark, settings: this.props.settings, displayShowMore: displayShowMore, domId: this.props.domId, currentIdx: this.props.currentIdx || 0, customHoverRenderer: this.props.customHoverRenderer, customInfoRenderer: this.props.customInfoRenderer, customSlideshowInfoRenderer: this.props.customSlideshowInfoRenderer, customLoadMoreRenderer: this.props.customLoadMoreRenderer, customNavArrowsRenderer: this.props.customNavArrowsRenderer, customImageRenderer: this.props.customImageRenderer, playingVideoIdx: this.state.playingVideoIdx, noFollowForSEO: this.props.noFollowForSEO, proGalleryRegionLabel: this.props.proGalleryRegionLabel, firstUserInteractionExecuted: this.state.firstUserInteractionExecuted, actions: tslib_1.__assign(tslib_1.__assign({}, this.props.actions), { findNeighborItem: this.findNeighborItem, toggleLoadMoreItems: this.toggleLoadMoreItems, eventsListener: this.eventsListener, setWixHeight: function () { }, scrollToItem: this.scrollToItem, scrollToGroup: this.scrollToGroup }) }, this.props.gallery)),
            react_1.default.createElement("div", { "data-key": "items-styles", key: "items-styles", style: { display: 'none' } },
                (this.layoutCss || []).filter(Boolean).map(function (css, idx) { return (react_1.default.createElement("style", { id: "layoutCss-" + idx, key: "layoutCss-" + idx, dangerouslySetInnerHTML: { __html: css } })); }),
                (this.scrollCss || []).filter(Boolean).map(function (css, idx) { return (react_1.default.createElement("style", { id: "scrollCss_" + idx, key: "scrollCss_" + idx, dangerouslySetInnerHTML: { __html: css } })); }),
                !!this.dynamicStyles && (react_1.default.createElement("style", { dangerouslySetInnerHTML: { __html: this.dynamicStyles } })))));
    };
    return GalleryContainer;
}(react_1.default.Component));
exports.GalleryContainer = GalleryContainer;
exports.default = GalleryContainer;
//# sourceMappingURL=galleryContainerExtraNew.js.map