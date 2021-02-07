"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GalleryContainer = void 0;
var tslib_1 = require("tslib");
var pro_layouts_1 = require("pro-layouts");
var pro_gallery_lib_1 = require("pro-gallery-lib");
var react_1 = tslib_1.__importDefault(require("react"));
var galleryView_1 = tslib_1.__importDefault(require("./galleryView"));
var slideshowView_1 = tslib_1.__importDefault(require("./slideshowView"));
var layoutHelper_1 = tslib_1.__importDefault(require("../../helpers/layoutHelper"));
var scrollHelper_1 = require("../../helpers/scrollHelper");
var galleryScrollIndicator_1 = tslib_1.__importDefault(require("./galleryScrollIndicator"));
var cssScrollHelper_js_1 = require("../../helpers/cssScrollHelper.js");
var cssLayoutsHelper_js_1 = require("../../helpers/cssLayoutsHelper.js");
var isNew_1 = tslib_1.__importDefault(require("../../helpers/isNew"));
var videoScrollHelperWrapper_js_1 = tslib_1.__importDefault(require("../../helpers/videoScrollHelperWrapper.js"));
var GalleryContainer = /** @class */ (function (_super) {
    tslib_1.__extends(GalleryContainer, _super);
    function GalleryContainer(props) {
        var _this = _super.call(this, props) || this;
        if (pro_gallery_lib_1.utils.isVerbose()) {
            console.count('[OOISSR] galleryContainerNew constructor', pro_gallery_lib_1.window.isMock);
        }
        _this.getMoreItemsIfNeeded = _this.getMoreItemsIfNeeded.bind(_this);
        _this.setGotFirstScrollIfNeeded = _this.setGotFirstScrollIfNeeded.bind(_this);
        _this.toggleLoadMoreItems = _this.toggleLoadMoreItems.bind(_this);
        _this.scrollToItem = _this.scrollToItem.bind(_this);
        _this.scrollToGroup = _this.scrollToGroup.bind(_this);
        _this._scrollingElement = _this.getScrollingElement();
        _this.duplicateGalleryItems = _this.duplicateGalleryItems.bind(_this);
        _this.eventsListener = _this.eventsListener.bind(_this);
        _this.onGalleryScroll = _this.onGalleryScroll.bind(_this);
        _this.setPlayingIdxState = _this.setPlayingIdxState.bind(_this);
        _this.getVisibleItems = _this.getVisibleItems.bind(_this);
        var initialState = {
            pgScroll: 0,
            showMoreClickedAtLeastOnce: false,
            initialGalleryHeight: undefined,
            needToHandleShowMoreClick: false,
            gotFirstScrollEvent: false,
            playingVideoIdx: -1,
            viewComponent: null,
        };
        _this.state = initialState;
        _this.videoScrollHelper = new videoScrollHelperWrapper_js_1.default(_this.setPlayingIdxState);
        _this.items = [];
        _this.itemsDimensions = {};
        _this.preloadedItems = {};
        _this.layoutCss = [];
        if (pro_gallery_lib_1.utils.isSSR()) {
            _this.initialGalleryState = _this.reCreateGalleryExpensively(props, initialState);
            try {
                _this.galleryInitialStateJson = JSON.stringify(_this.initialGalleryState);
            }
            catch (e) {
                //todo - report to sentry
                _this.galleryInitialStateJson = null;
            }
        }
        else {
            try {
                if (!pro_gallery_lib_1.utils.shouldDebug('no_hydrate')) {
                    var state = JSON.parse(pro_gallery_lib_1.window.document.querySelector("#pro-gallery-" + props.domId + " #ssr-state-to-hydrate").innerHTML);
                    _this.reCreateGalleryFromState({
                        items: props.items,
                        styles: state.styles,
                        container: state.container,
                        gotFirstScrollEvent: initialState.gotFirstScrollEvent,
                    });
                    _this.initialGalleryState = state;
                }
                else {
                    _this.initialGalleryState = {}; //this will cause a flicker between ssr and csr
                }
            }
            catch (e) {
                //hydrate phase did not happen - do it all over again
                _this.initialGalleryState = {};
                var galleryState = _this.reCreateGalleryExpensively(props);
                if (Object.keys(galleryState).length > 0) {
                    _this.initialGalleryState = galleryState;
                }
            }
        }
        _this.state = tslib_1.__assign(tslib_1.__assign({}, initialState), _this.initialGalleryState);
        return _this;
    }
    GalleryContainer.prototype.getVisibleItems = function (items, container) {
        var gotFirstScrollEvent = this.state.gotFirstScrollEvent;
        var scrollY = pro_gallery_lib_1.window.scrollY;
        var galleryHeight = container.galleryHeight, scrollBase = container.scrollBase, galleryWidth = container.galleryWidth;
        if (pro_gallery_lib_1.isSEOMode() ||
            pro_gallery_lib_1.isEditMode() ||
            pro_gallery_lib_1.isPreviewMode() ||
            pro_gallery_lib_1.utils.isSSR() ||
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
                visibleItems = items.filter(function (item) { return item.offset.top <= maxItemTop_1; });
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
    GalleryContainer.prototype.componentDidMount = function () {
        this.loadItemsDimensionsIfNeeded();
        this.scrollToItem(this.props.currentIdx, false, true, 0);
        this.handleNewGalleryStructure();
        this.eventsListener(pro_gallery_lib_1.GALLERY_CONSTS.events.APP_LOADED, {});
        this.getMoreItemsIfNeeded(0);
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
            var galleryState = _this.reCreateGalleryExpensively(nextProps);
            if (Object.keys(galleryState).length > 0) {
                _this.setState(galleryState, function () {
                    _this.handleNewGalleryStructure();
                });
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
    GalleryContainer.prototype.loadItemsDimensionsIfNeeded = function () {
        var _this = this;
        if (pro_gallery_lib_1.utils.isSSR()) {
            return;
        }
        if (!(this.galleryStructure &&
            this.galleryStructure.galleryItems &&
            this.galleryStructure.galleryItems.length > 0)) {
            return;
        }
        var galleryItems = this.galleryStructure.galleryItems;
        var itemsWithoutDimensions = galleryItems.filter(function (item) {
            try {
                return item.isVisible && item.isDimensionless && !item.isPreloaded;
            }
            catch (e) {
                return false;
            }
        });
        if (!itemsWithoutDimensions.length) {
            return;
        }
        var preloadItem = function (item, onload) {
            if (!item || !item.itemId || !item.isGalleryItem) {
                return;
            }
            try {
                var id = item.itemId;
                if (_this.itemsDimensions[id]) {
                    return; //already measured
                }
                if (typeof _this.preloadedItems[id] !== 'undefined') {
                    return;
                }
                _this.preloadedItems[id] = new Image();
                if (pro_gallery_lib_1.utils.isVerbose()) {
                    console.log('Preloading item #' + item);
                }
                if (typeof item.preload_url === 'string') {
                    _this.preloadedItems[id].src = item.preload_url;
                }
                else {
                    _this.preloadedItems[id].src = item.createUrl(pro_gallery_lib_1.GALLERY_CONSTS.urlSizes.PRELOAD, pro_gallery_lib_1.GALLERY_CONSTS.urlTypes.LOW_RES);
                }
                if (typeof onload === 'function') {
                    _this.preloadedItems[id].onload = function (e) {
                        onload(e);
                    };
                }
                return _this.preloadedItems[id];
            }
            catch (e) {
                console.error('Could not preload item', item, e);
                return;
            }
        };
        var debouncedReCreateGallery = pro_gallery_lib_1.utils.debounce(function () {
            var newState = _this.reCreateGalleryExpensively(tslib_1.__assign(tslib_1.__assign({}, _this.props), { itemsDimensions: _this.itemsDimensions }), _this.state);
            if (Object.keys(newState).length > 0) {
                _this.setState(newState, function () {
                    _this.handleNewGalleryStructure();
                });
            }
        }, 500);
        itemsWithoutDimensions.forEach(function (item, idx) {
            item.isPreloaded = true;
            preloadItem(item, function (e) {
                try {
                    if (pro_gallery_lib_1.utils.isVerbose()) {
                        console.log('item loaded event', idx, e);
                    }
                    var ele = e.srcElement;
                    var _item = _this.items.find(function (itm) { return itm.itemId === item.itemId; });
                    if (_item) {
                        var itemDim = {
                            width: ele.width,
                            height: ele.height,
                            measured: true,
                        };
                        Object.assign(_item, itemDim);
                        if (typeof _item.metaData === 'object') {
                            Object.assign(_item.metaData, itemDim);
                        }
                        _this.itemsDimensions[_item.itemId] = itemDim;
                        //rebuild the gallery after every dimension update
                        // if (Object.keys(this.itemsDimensions).length > 0) {
                        debouncedReCreateGallery();
                        // }
                    }
                }
                catch (_e) {
                    console.error('Could not calc element dimensions', _e);
                }
            });
        });
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
        var styleParams = this.state.styles;
        var numOfItems = this.items.length;
        var layoutHeight = this.layout.height;
        var layoutItems = this.layout.items;
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
        this.eventsListener(pro_gallery_lib_1.GALLERY_CONSTS.events.GALLERY_CHANGE, onGalleryChangeData);
        if (needToHandleShowMoreClick) {
            this.setState({ needToHandleShowMoreClick: false });
        }
    };
    GalleryContainer.prototype.reCreateGalleryFromState = function (_a) {
        var items = _a.items, styles = _a.styles, container = _a.container;
        //update this.items
        this.items = items.map(function (item) { return pro_gallery_lib_1.ItemsHelper.convertDtoToLayoutItem(item); });
        var layoutParams = {
            items: this.items,
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
        this.layouter = new pro_layouts_1.Layouter(layoutParams);
        this.layout = this.layouter.createLayout(layoutParams);
        this.galleryStructure = pro_gallery_lib_1.ItemsHelper.convertToGalleryItems(this.layout, {
            thumbnailSize: styles.thumbnailSize,
            sharpParams: styles.sharpParams,
            resizeMediaUrl: this.props.resizeMediaUrl,
        });
        this.videoScrollHelper.updateGalleryStructure({
            galleryStructure: this.galleryStructure,
            scrollBase: container.scrollBase,
            videoPlay: styles.videoPlay,
            videoLoop: styles.videoLoop,
            itemClick: styles.itemClick,
            oneRow: styles.oneRow,
        }, true, this.items);
        var shouldUseScrollCss = !pro_gallery_lib_1.isSEOMode() &&
            (pro_gallery_lib_1.isEditMode() ||
                this.state.gotFirstScrollEvent ||
                this.state.showMoreClickedAtLeastOnce);
        if (shouldUseScrollCss) {
            this.getScrollCss({
                domId: this.props.domId,
                items: this.galleryStructure.galleryItems,
                styleParams: styles,
                container: container,
            });
        }
        this.createCssLayoutsIfNeeded(layoutParams);
        this.createDynamicStyles(styles);
    };
    GalleryContainer.prototype.createCssLayoutsIfNeeded = function (layoutParams) {
        var _a = this.props.settings, settings = _a === void 0 ? {} : _a;
        var avoidInlineStyles = settings.avoidInlineStyles;
        if (avoidInlineStyles) {
            // inline styles are replacing the layoutCss
            // avoid inline styles === use layout css
            this.layoutCss = cssLayoutsHelper_js_1.createCssLayouts({
                layoutParams: layoutParams,
                isMobile: pro_gallery_lib_1.utils.isMobile(),
                domId: this.props.domId,
                galleryItems: this.galleryStructure.galleryItems,
            });
        }
    };
    GalleryContainer.prototype.reCreateGalleryExpensively = function (_a, curState) {
        var _this = this;
        var items = _a.items, styles = _a.styles, container = _a.container, watermark = _a.watermark, itemsDimensions = _a.itemsDimensions, customInfoRenderer = _a.customInfoRenderer, resizeMediaUrl = _a.resizeMediaUrl;
        if (pro_gallery_lib_1.utils.isVerbose()) {
            console.count('PROGALLERY [COUNT] reCreateGalleryExpensively');
            console.time('PROGALLERY [TIME] reCreateGalleryExpensively');
        }
        var state = curState || this.state || {};
        var _styles, _container;
        var customExternalInfoRendererExists = !!customInfoRenderer;
        var stylesWithLayoutStyles = styles && layoutHelper_1.default(styles, customExternalInfoRendererExists);
        var isNew = isNew_1.default({
            items: items,
            styles: stylesWithLayoutStyles,
            container: container,
            watermark: watermark,
            itemsDimensions: itemsDimensions,
        }, tslib_1.__assign(tslib_1.__assign({}, state), { items: this.items }));
        var newState = {};
        if (pro_gallery_lib_1.utils.isVerbose()) {
            console.log('PROGALLERY reCreateGalleryExpensively', isNew, {
                items: items,
                styles: styles,
                container: container,
                watermark: watermark,
            });
        }
        if ((isNew.itemsDimensions || isNew.itemsMetadata) &&
            !isNew.items &&
            !isNew.addedItems) {
            //if only the items metadata has changed - use the modified items (probably with the measured width and height)
            this.items = this.items.map(function (item, index) {
                var metaData = Object.assign({}, items[index].metaData);
                return Object.assign(item, { metaData: metaData }, tslib_1.__assign({}, _this.itemsDimensions[item.itemId]));
            });
            newState.items = this.items.map(function (item) { return item.itemId; });
        }
        else if (isNew.items && !isNew.addedItems) {
            this.items = items.map(function (item) {
                return Object.assign(pro_gallery_lib_1.ItemsHelper.convertDtoToLayoutItem(item), tslib_1.__assign({}, _this.itemsDimensions[item.itemId]));
            });
            newState.items = this.items.map(function (item) { return item.itemId; });
            this.gettingMoreItems = false; //probably finished getting more items
        }
        else if (isNew.addedItems) {
            this.items = this.items.concat(items.slice(this.items.length).map(function (item) {
                return pro_gallery_lib_1.ItemsHelper.convertDtoToLayoutItem(item);
            }));
            newState.items = this.items.map(function (item) { return item.itemId; });
            this.gettingMoreItems = false; //probably finished getting more items
        }
        if (isNew.styles || isNew.container) {
            styles = styles || state.styles;
            container = container || state.container;
            pro_gallery_lib_1.dimensionsHelper.updateParams({
                styles: styles,
                container: container,
                domId: this.props.domId,
            });
            _styles = layoutHelper_1.default(styles, customExternalInfoRendererExists);
            pro_gallery_lib_1.dimensionsHelper.updateParams({ styles: _styles });
            _container = Object.assign({}, container, pro_gallery_lib_1.dimensionsHelper.getGalleryDimensions());
            pro_gallery_lib_1.dimensionsHelper.updateParams({ container: _container });
            newState.styles = _styles;
            newState.container = _container;
        }
        else {
            _styles = state.styles;
            _container = state.container;
        }
        if (!this.galleryStructure || isNew.any) {
            if (pro_gallery_lib_1.utils.isVerbose()) {
                console.count('PROGALLERY [COUNT] - reCreateGalleryExpensively (isNew)');
            }
            var layoutParams = {
                items: this.items,
                container: _container,
                styleParams: _styles,
                gotScrollEvent: true,
                options: {
                    showAllItems: true,
                    skipVisibilitiesCalc: true,
                    useLayoutStore: false,
                },
            };
            if (this.layouter && isNew.addedItems) {
                layoutParams.options.useExistingLayout = true;
            }
            else {
                layoutParams.options.createLayoutOnInit = false;
                this.layouter = new pro_layouts_1.Layouter(layoutParams);
            }
            this.layout = this.layouter.createLayout(layoutParams);
            var itemConfig = {
                watermark: watermark,
                sharpParams: _styles.sharpParams,
                thumbnailSize: styles.thumbnailSize,
                resizeMediaUrl: resizeMediaUrl,
                lastVisibleItemIdx: this.lastVisibleItemIdx,
            };
            var existingLayout = this.galleryStructure || this.layout;
            if (isNew.addedItems) {
                this.galleryStructure = pro_gallery_lib_1.ItemsHelper.convertExistingStructureToGalleryItems(existingLayout, this.layout, itemConfig);
            }
            else {
                this.galleryStructure = pro_gallery_lib_1.ItemsHelper.convertToGalleryItems(this.layout, itemConfig, existingLayout.galleryItems);
            }
            var scrollHelperNewGalleryStructure = {
                galleryStructure: this.galleryStructure,
                scrollBase: _container.scrollBase,
                videoPlay: _styles.videoPlay,
                itemClick: _styles.itemClick,
                oneRow: _styles.oneRow,
                cb: this.setPlayingIdxState,
            };
            this.videoScrollHelper.updateGalleryStructure(scrollHelperNewGalleryStructure, !pro_gallery_lib_1.utils.isSSR() && (isNew.addedItems || isNew.items), this.items);
            if (isNew.items) {
                this.loadItemsDimensionsIfNeeded();
            }
            this.createCssLayoutsIfNeeded(layoutParams);
            this.createDynamicStyles(_styles);
            var shouldUseScrollCss = !pro_gallery_lib_1.isSEOMode() &&
                (pro_gallery_lib_1.isEditMode() ||
                    this.state.gotFirstScrollEvent ||
                    this.state.showMoreClickedAtLeastOnce);
            if (shouldUseScrollCss) {
                this.getScrollCss({
                    domId: this.props.domId,
                    items: this.galleryStructure.galleryItems,
                    styleParams: _styles,
                    container: container,
                });
            }
        }
        if (pro_gallery_lib_1.utils.isVerbose()) {
            console.log('PROGALLERY [RENDERS] - reCreateGalleryExpensively', { isNew: isNew }, { items: items, styles: styles, container: container, watermark: watermark });
            console.timeEnd('PROGALLERY [TIME] reCreateGalleryExpensively');
        }
        if (isNew.any) {
            return newState;
        }
        else {
            return {};
        }
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
        var _styles = styles || this.state.styles;
        // return the direction in which the gallery can grow on it's own (aka infinite scroll)
        var enableInfiniteScroll = this.props.styles.enableInfiniteScroll;
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
    GalleryContainer.prototype.getScrollCss = function (_a) {
        var domId = _a.domId, items = _a.items, styleParams = _a.styleParams, container = _a.container;
        this.scrollCss = cssScrollHelper_js_1.cssScrollHelper.calcScrollCss({
            items: items,
            styleParams: styleParams,
            domId: domId,
            container: container,
        });
    };
    GalleryContainer.prototype.createDynamicStyles = function (_a) {
        var overlayBackground = _a.overlayBackground;
        var useSSROpacity = this.props.isPrerenderMode && !this.props.settings.disableSSROpacity;
        this.dynamicStyles = ("\n      " + (!useSSROpacity
            ? ''
            : "#pro-gallery-" + this.props.domId + " .gallery-item-container { opacity: 0 }") + "\n      " + (!overlayBackground
            ? ''
            : "#pro-gallery-" + this.props.domId + " .gallery-item-hover::before { background: " + overlayBackground + " !important}") + "\n    ").trim();
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
                contsiner: this.state.container,
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
    GalleryContainer.prototype.duplicateGalleryItems = function () {
        var _a;
        var _this = this;
        if (!this.itemsToDuplicate) {
            this.itemsToDuplicate = this.items;
        }
        var items = (_a = this.items).concat.apply(_a, this.itemsToDuplicate.slice(0, this.props.totalItemsCount));
        var galleryState = this.reCreateGalleryExpensively(tslib_1.__assign(tslib_1.__assign({}, this.props), { items: items }));
        if (Object.keys(galleryState).length > 0) {
            this.setState(galleryState, function () {
                _this.handleNewGalleryStructure();
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
            // console.log('[RTL SCROLL] getMoreItemsIfNeeded: ', scrollPos);
            //const curDistance = galleryEnd - scrollEnd;
            //if (curDistance > 0 && curDistance < getItemsDistance) {
            if (galleryEnd < getItemsDistance + scrollEnd) {
                //only when the last item turns visible we should try getting more items
                if (this.state.items.length < this.props.totalItemsCount) {
                    this.gettingMoreItems = true;
                    this.eventsListener(pro_gallery_lib_1.GALLERY_CONSTS.events.NEED_MORE_ITEMS, this.state.items.length);
                    setTimeout(function () {
                        //wait a bit before allowing more items to be fetched - ugly hack before promises still not working
                        _this.gettingMoreItems = false;
                    }, 2000);
                }
                else if (this.state.styles.slideshowLoop) {
                    this.duplicateGalleryItems();
                }
            }
        }
    };
    GalleryContainer.prototype.canRender = function () {
        var can = this.state.container && this.state.styles && this.state.items;
        if (!can && pro_gallery_lib_1.utils.isVerbose()) {
            console.log('PROGALLERY [CAN_RENDER] GalleryContainer', this.state, can, this.state.container, this.state.styles, this.state.items);
        }
        return can;
    };
    GalleryContainer.prototype.isVerticalGallery = function () {
        return !this.state.styles.oneRow;
    };
    GalleryContainer.prototype.render = function () {
        if (!this.canRender()) {
            return null;
        }
        var ViewComponent = this.isVerticalGallery()
            ? galleryView_1.default
            : slideshowView_1.default;
        if (pro_gallery_lib_1.utils.isVerbose()) {
            console.count('PROGALLERY [COUNTS] - GalleryContainer (render)');
            console.log('PROGALLERY [RENDER] - GalleryContainer', this.state.container.scrollBase, { state: this.state, items: this.items });
        }
        var displayShowMore = this.containerInfiniteGrowthDirection() === 'none';
        var findNeighborItem = this.layouter
            ? this.layouter.findNeighborItem
            : function () { };
        return (react_1.default.createElement("div", { "data-key": "pro-gallery-inner-container", key: "pro-gallery-inner-container", id: "pro-gallery-inner-container-" + this.props.domId, className: this.props.isPrerenderMode ? 'pro-gallery-prerender' : '' },
            react_1.default.createElement(galleryScrollIndicator_1.default, { domId: this.props.domId, oneRow: this.state.styles.oneRow, isRTL: this.state.styles.isRTL, totalWidth: this.galleryStructure.width, scrollBase: this.state.container.scrollBase, scrollingElement: this._scrollingElement, getMoreItemsIfNeeded: this.getMoreItemsIfNeeded, setGotFirstScrollIfNeeded: this.setGotFirstScrollIfNeeded, onScroll: this.onGalleryScroll }),
            react_1.default.createElement(ViewComponent, tslib_1.__assign({ isInDisplay: this.props.isInDisplay, scrollingElement: this._scrollingElement, totalItemsCount: this.props.totalItemsCount, renderedItemsCount: this.props.renderedItemsCount, getMoreItemsIfNeeded: this.getMoreItemsIfNeeded, setGotFirstScrollIfNeeded: this.setGotFirstScrollIfNeeded, gotFirstScrollEvent: this.state.gotFirstScrollEvent, items: this.items, getVisibleItems: this.getVisibleItems, itemsLoveData: this.props.itemsLoveData, galleryStructure: this.galleryStructure, styleParams: this.state.styles, container: this.state.container, watermark: this.props.watermark, settings: this.props.settings, displayShowMore: displayShowMore, domId: this.props.domId, currentIdx: this.props.currentIdx || 0, customHoverRenderer: this.props.customHoverRenderer, customImageRenderer: this.props.customImageRenderer, customInfoRenderer: this.props.customInfoRenderer, customSlideshowInfoRenderer: this.props.customSlideshowInfoRenderer, customNavArrowsRenderer: this.props.customNavArrowsRenderer, customLoadMoreRenderer: this.props.customLoadMoreRenderer, playingVideoIdx: this.state.playingVideoIdx, noFollowForSEO: this.props.noFollowForSEO, proGalleryRegionLabel: this.props.proGalleryRegionLabel, actions: tslib_1.__assign(tslib_1.__assign({}, this.props.actions), { findNeighborItem: findNeighborItem, toggleLoadMoreItems: this.toggleLoadMoreItems, eventsListener: this.eventsListener, setWixHeight: function () { }, scrollToItem: this.scrollToItem, scrollToGroup: this.scrollToGroup, duplicateGalleryItems: this.duplicateGalleryItems }) }, this.props.gallery)),
            this.galleryInitialStateJson && (react_1.default.createElement("div", { id: "ssr-state-to-hydrate", style: { display: 'none' } }, this.galleryInitialStateJson)),
            react_1.default.createElement("div", { "data-key": "dynamic-styles", key: "items-styles", style: { display: 'none' } },
                (this.layoutCss || []).filter(Boolean).map(function (css, idx) { return (react_1.default.createElement("style", { id: "layoutCss-" + idx, key: "layoutCss-" + idx, dangerouslySetInnerHTML: { __html: css } })); }),
                (this.scrollCss || []).filter(Boolean).map(function (css, idx) { return (react_1.default.createElement("style", { id: "scrollCss_" + idx, key: "scrollCss_" + idx, dangerouslySetInnerHTML: { __html: css } })); }),
                !!this.dynamicStyles && (react_1.default.createElement("style", { dangerouslySetInnerHTML: { __html: this.dynamicStyles } })))));
    };
    return GalleryContainer;
}(react_1.default.Component));
exports.GalleryContainer = GalleryContainer;
exports.default = GalleryContainer;
//# sourceMappingURL=galleryContainerNew.js.map