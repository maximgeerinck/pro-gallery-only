"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var react_1 = tslib_1.__importDefault(require("react"));
var pro_gallery_lib_1 = require("pro-gallery-lib");
var groupView_js_1 = tslib_1.__importDefault(require("../../group/groupView.js"));
var galleryDebugMessage_js_1 = tslib_1.__importDefault(require("./galleryDebugMessage.js"));
var galleryHelpers_js_1 = require("./galleryHelpers.js");
var play_1 = tslib_1.__importDefault(require("../../svgs/components/play"));
var pause_1 = tslib_1.__importDefault(require("../../svgs/components/pause"));
var galleryComponent_1 = require("../../galleryComponent");
var textItem_js_1 = tslib_1.__importDefault(require("../../item/textItem.js"));
var SKIP_SLIDES_MULTIPLIER = 1.5;
var SlideshowView = /** @class */ (function (_super) {
    tslib_1.__extends(SlideshowView, _super);
    function SlideshowView(props) {
        var _this = _super.call(this, props) || this;
        _this.autoScrollToNextItem = function () {
            if (!pro_gallery_lib_1.isEditMode() &&
                (galleryHelpers_js_1.isGalleryInViewport(_this.props.container) || pro_gallery_lib_1.isPreviewMode())) {
                var direction = _this.props.styleParams.isRTL ? -1 : 1;
                _this._next({ direction: direction, isAutoTrigger: true, scrollDuration: 800 });
            }
        };
        _this.navigationOutHandler = _this.navigationOutHandler.bind(_this);
        _this.navigationInHandler = _this.navigationInHandler.bind(_this);
        _this.scrollToThumbnail = _this.scrollToThumbnail.bind(_this);
        _this.stopAutoSlideshow = _this.stopAutoSlideshow.bind(_this);
        _this.onAutoSlideShowButtonClick = _this.onAutoSlideShowButtonClick.bind(_this);
        _this.startAutoSlideshowIfNeeded = _this.startAutoSlideshowIfNeeded.bind(_this);
        _this.handleSlideshowKeyPress = _this.handleSlideshowKeyPress.bind(_this);
        _this.onAutoSlideshowAutoPlayKeyPress = _this.onAutoSlideshowAutoPlayKeyPress.bind(_this);
        _this.setCurrentItemByScroll = _this.setCurrentItemByScroll.bind(_this);
        _this._setCurrentItemByScroll = pro_gallery_lib_1.utils
            .throttle(_this.setCurrentItemByScroll, 600)
            .bind(_this);
        _this._next = pro_gallery_lib_1.utils.throttle(_this.next.bind(_this), 400).bind(_this);
        _this.state = {
            currentIdx: props.currentIdx || 0,
            isInView: true,
            shouldStopAutoSlideShow: false,
            hideLeftArrow: !props.isRTL,
            hideRightArrow: props.isRTL,
        };
        _this.lastCurrentItem = undefined;
        _this.shouldCreateSlideShowPlayButton = false;
        _this.shouldCreateSlideShowNumbers = false;
        _this.skipFromSlide = Math.round(_this.props.totalItemsCount * SKIP_SLIDES_MULTIPLIER); // Used in infinite loop
        return _this;
    }
    SlideshowView.prototype.isFirstItem = function () {
        return this.state.currentIdx === 0;
    };
    SlideshowView.prototype.isScrollStart = function () {
        var slideAnimation = this.props.styleParams.slideAnimation;
        if (slideAnimation === pro_gallery_lib_1.GALLERY_CONSTS.slideAnimations.FADE) {
            return false;
        }
        if (this.container) {
            return this.getScrollLeft() <= 1;
        }
        else {
            return false;
        }
    };
    SlideshowView.prototype.isScrollEnd = function () {
        var _a = this.props, totalItemsCount = _a.totalItemsCount, getVisibleItems = _a.getVisibleItems, galleryStructure = _a.galleryStructure, container = _a.container;
        var _b = this.props.styleParams, slideshowLoop = _b.slideshowLoop, slideAnimation = _b.slideAnimation;
        if (slideshowLoop ||
            slideAnimation === pro_gallery_lib_1.GALLERY_CONSTS.slideAnimations.FADE) {
            return false;
        }
        if (this.container) {
            var _c = this.container, scrollWidth = _c.scrollWidth, clientWidth = _c.clientWidth;
            var scrollLeft = this.getScrollLeft();
            var visibleItemsCount = getVisibleItems(galleryStructure.galleryItems, container).length;
            var allItemsLoaded = visibleItemsCount >= totalItemsCount;
            var visibleLeft = scrollLeft + clientWidth;
            var visibleScroll = scrollWidth - 1;
            return allItemsLoaded && visibleLeft >= visibleScroll;
        }
        else {
            return false;
        }
    };
    SlideshowView.prototype.isFirstItemFullyVisible = function () {
        return !this.props.styleParams.slideshowLoop && this.isScrollStart();
    };
    SlideshowView.prototype.isLastItemFullyVisible = function () {
        return !this.props.styleParams.slideshowLoop && this.isScrollEnd();
    };
    SlideshowView.prototype.isLastItem = function () {
        return (!this.props.styleParams.slideshowLoop &&
            this.state.currentIdx >= this.props.totalItemsCount - 1);
    };
    //__________________________________Slide show loop functions_____________________________________________
    SlideshowView.prototype.createNewItemsForSlideshowLoopThumbnails = function () {
        var items = this.props.items;
        var biasedItems = [];
        var numOfThumbnails = Math.ceil(this.props.container.galleryWidth / this.props.styleParams.thumbnailSize);
        // need to create new item ! not just to copy the last once - the react view refferce one of them
        Object.keys(items).forEach(function (idx) {
            var _idx = Number(idx);
            var biasIdx;
            //bias all items idx by the number of added items
            biasIdx = _idx + numOfThumbnails;
            biasedItems[biasIdx] = tslib_1.__assign({}, items[idx]);
            //create the first copy of items
            if (_idx > items.length - numOfThumbnails - 1) {
                biasIdx = _idx - items.length + numOfThumbnails;
                biasedItems[biasIdx] = tslib_1.__assign({}, items[idx]);
            }
            //create the end items
            if (_idx < numOfThumbnails) {
                biasIdx = _idx + numOfThumbnails + items.length;
                biasedItems[biasIdx] = tslib_1.__assign({}, items[idx]);
            }
        });
        biasedItems.forEach(function (item, index) {
            item.loopIndex = index;
        });
        this.ItemsForSlideshowLoopThumbnails = biasedItems;
        this.numOfThumbnails = numOfThumbnails;
    };
    //__________________________________end of slide show loop functions__________________________
    SlideshowView.prototype.next = function (_a) {
        var direction = _a.direction, isAutoTrigger = _a.isAutoTrigger, scrollDuration = _a.scrollDuration, _b = _a.isKeyboardNavigation, isKeyboardNavigation = _b === void 0 ? false : _b;
        var activeElement = document.activeElement;
        var galleryItemIsFocused = activeElement.className &&
            activeElement.className.includes('gallery-item-container');
        var avoidIndividualNavigation = !isKeyboardNavigation ||
            !(this.props.styleParams.isAccessible && galleryItemIsFocused);
        var ignoreScrollPosition = false;
        if (this.props.styleParams.slideAnimation ===
            pro_gallery_lib_1.GALLERY_CONSTS.slideAnimations.FADE) {
            scrollDuration = 0;
            ignoreScrollPosition = true;
        }
        direction *= this.props.styleParams.isRTL ? -1 : 1;
        if (avoidIndividualNavigation && this.props.styleParams.groupSize > 1) {
            this.nextGroup({ direction: direction, isAutoTrigger: isAutoTrigger, scrollDuration: scrollDuration }); //if its not in accessibility that requieres individual nav and we are in a horizontal(this file) collage(layout 0) - use group navigation
        }
        else {
            if (avoidIndividualNavigation &&
                this.props.styleParams.isGrid &&
                this.props.styleParams.numberOfImagesPerCol) {
                direction *= this.props.styleParams.numberOfImagesPerCol;
            }
            this.nextItem({
                direction: direction,
                isAutoTrigger: isAutoTrigger,
                scrollDuration: scrollDuration,
                avoidIndividualNavigation: avoidIndividualNavigation,
                ignoreScrollPosition: ignoreScrollPosition,
            });
        }
        this.removeArrowsIfNeeded();
    };
    SlideshowView.prototype.nextItem = function (_a) {
        var _this = this;
        var direction = _a.direction, isAutoTrigger = _a.isAutoTrigger, scrollDuration = _a.scrollDuration, avoidIndividualNavigation = _a.avoidIndividualNavigation, ignoreScrollPosition = _a.ignoreScrollPosition;
        if (this.isSliding) {
            return;
        }
        this.isSliding = true;
        var currentIdx;
        if (ignoreScrollPosition) {
            currentIdx = this.state.currentIdx;
        }
        else {
            if (avoidIndividualNavigation &&
                !(this.props.styleParams.groupSize > 1)) {
                currentIdx = this.getCenteredItemIdxByScroll();
            }
            else {
                currentIdx = isAutoTrigger
                    ? this.setCurrentItemByScroll()
                    : this.state.currentIdx;
            }
        }
        var nextItem = currentIdx + direction;
        if (!this.props.styleParams.slideshowLoop) {
            nextItem = Math.min(this.props.galleryStructure.items.length - 1, nextItem);
            nextItem = Math.max(0, nextItem);
        }
        var scrollToItem = this.props.actions.scrollToItem;
        this.isAutoScrolling = true;
        if (isAutoTrigger) {
            // ---- Called by the Auto Slideshow ---- //
        }
        else {
            // ---- Called by the user (arrows, keys etc.) ---- //
            this.startAutoSlideshowIfNeeded(this.props.styleParams);
            var scrollingPastLastItem = (direction >= 1 && this.isLastItem()) ||
                (direction <= -1 && this.isFirstItem());
            if (scrollingPastLastItem) {
                this.isSliding = false;
                return;
            }
        }
        // ---- navigate ---- //
        try {
            var isScrollingPastEdge = !isAutoTrigger &&
                ((direction >= 1 && this.isLastItemFullyVisible()) ||
                    (direction <= -1 && this.isFirstItemFullyVisible()));
            var scrollMarginCorrection = this.getStyles().margin || 0;
            var _scrollDuration = scrollDuration || this.props.styleParams.scrollDuration || 400;
            var itemToScroll = ignoreScrollPosition ? 0 : nextItem;
            var scrollToItemPromise = !isScrollingPastEdge &&
                scrollToItem(itemToScroll, false, true, _scrollDuration, scrollMarginCorrection);
            scrollToItemPromise.then(function () {
                if (_this.props.styleParams.groupSize === 1) {
                    var skipToSlide = _this.skipFromSlide - _this.props.totalItemsCount;
                    if (nextItem >= _this.skipFromSlide) {
                        nextItem = skipToSlide;
                        scrollToItem(nextItem);
                    }
                }
                pro_gallery_lib_1.utils.setStateAndLog(_this, 'Next Item', {
                    currentIdx: nextItem,
                }, function () {
                    _this.onCurrentItemChanged();
                    _this.isSliding = false;
                });
                if (ignoreScrollPosition) {
                    _this.props.getMoreItemsIfNeeded(_this.props.galleryStructure.galleryItems[nextItem].offset.left);
                    _this.props.setGotFirstScrollIfNeeded();
                }
            });
        }
        catch (e) {
            console.error('Cannot proceed to the next Item', e);
            this.stopAutoSlideshow();
            return;
        }
    };
    SlideshowView.prototype.nextGroup = function (_a) {
        var _this = this;
        var direction = _a.direction, isAutoTrigger = _a.isAutoTrigger, scrollDuration = _a.scrollDuration;
        if (this.isSliding) {
            return;
        }
        this.isSliding = true;
        var currentGroupIdx = this.getCenteredGroupIdxByScroll();
        var currentGroup = currentGroupIdx + direction;
        var scrollToGroup = this.props.actions.scrollToGroup;
        this.isAutoScrolling = true;
        if (isAutoTrigger) {
            // ---- Called by the Auto Slideshow ---- //
            if (this.isLastItem()) {
                // maybe this should be isLastItemFullyVisible now that we have both. product- do we allow autoSlideshow in other layouts ( those that could have more than one item displayed in the galleryWidth)
                currentGroup = 0;
                scrollDuration = 0;
            }
        }
        else {
            // ---- Called by the user (arrows, keys etc.) ---- //
            // this.startAutoSlideshowIfNeeded(this.props.styleParams);
            var scrollingPastLastItem = (direction >= 1 && this.isLastItem()) ||
                (direction <= -1 && this.isFirstItem());
            if (scrollingPastLastItem) {
                this.isSliding = false;
                return;
            }
        }
        // ---- navigate ---- //
        try {
            var isScrollingPastEdge = !isAutoTrigger &&
                ((direction >= 1 && this.isLastItemFullyVisible()) ||
                    (direction <= -1 && this.isFirstItemFullyVisible()));
            var scrollMarginCorrection = this.getStyles().margin || 0;
            var _scrollDuration = scrollDuration || this.props.styleParams.scrollDuration || 400;
            !isScrollingPastEdge &&
                scrollToGroup(currentGroup, false, true, _scrollDuration, scrollMarginCorrection);
            pro_gallery_lib_1.utils.setStateAndLog(this, 'Next Item', {
                currentIdx: this.getCenteredItemIdxByScroll() + direction,
            }, function () {
                _this.onCurrentItemChanged();
                _this.isSliding = false;
            });
        }
        catch (e) {
            console.error('Cannot proceed to the next Group', e);
            this.stopAutoSlideshow();
            return;
        }
    };
    SlideshowView.prototype.onCurrentItemChanged = function () {
        if (this.lastCurrentItem !== this.state.currentIdx) {
            this.lastCurrentItem = this.state.currentIdx;
            //this.props.actions.onCurrentItemChanged(this.state.currentIdx);
            this.props.actions.eventsListener(pro_gallery_lib_1.GALLERY_CONSTS.events.CURRENT_ITEM_CHANGED, this.props.items[this.state.currentIdx], this.props.galleryStructure.galleryItems[this.state.currentIdx]);
        }
        this.removeArrowsIfNeeded();
    };
    SlideshowView.prototype.stopAutoSlideshow = function () {
        clearInterval(this.autoSlideshowInterval);
    };
    SlideshowView.prototype.startAutoSlideshowIfNeeded = function (styleParams) {
        var isAutoSlideshow = styleParams.isAutoSlideshow, autoSlideshowInterval = styleParams.autoSlideshowInterval, oneRow = styleParams.oneRow;
        this.stopAutoSlideshow();
        if (!oneRow)
            return;
        if (!(isAutoSlideshow &&
            autoSlideshowInterval > 0 &&
            this.state.isInView &&
            !this.state.shouldStopAutoSlideShow))
            return;
        this.autoSlideshowInterval = setInterval(this.autoScrollToNextItem.bind(this), autoSlideshowInterval * 1000);
    };
    SlideshowView.prototype.scrollToThumbnail = function (itemIdx, scrollDuration) {
        //not to confuse with this.props.actions.scrollToItem. this is used to replace it only for thumbnail items
        this.props.actions.eventsListener(pro_gallery_lib_1.GALLERY_CONSTS.events.THUMBNAIL_CLICKED, this.props);
        this.props.setGotFirstScrollIfNeeded(); //load all the images in the thumbnails bar
        this.next({
            direction: itemIdx - this.state.currentIdx,
            isAutoTrigger: false,
            scrollDuration: scrollDuration,
            isKeyboardNavigation: false,
        });
    };
    SlideshowView.prototype.handleSlideshowKeyPress = function (e) {
        switch (e.charCode || e.keyCode) {
            case 38: //up
            case 37: //left
            case 33: //page up
                e.preventDefault();
                this._next({ direction: -1, isKeyboardNavigation: true });
                return false;
            case 39: //right
            case 40: //down
            case 32: //space
            case 34: //page down
                e.preventDefault();
                this._next({ direction: 1, isKeyboardNavigation: true });
                return false;
        }
        return true; //continue handling the original keyboard event
    };
    SlideshowView.prototype.createThumbnails = function (thumbnailPosition) {
        var _this = this;
        var items = this.props.items;
        var currentIdx = this.state.currentIdx;
        if (this.props.styleParams.slideshowLoop) {
            if (!this.ItemsForSlideshowLoopThumbnails) {
                this.createNewItemsForSlideshowLoopThumbnails();
            }
            currentIdx += this.numOfThumbnails;
            items = this.ItemsForSlideshowLoopThumbnails;
        }
        if (pro_gallery_lib_1.utils.isVerbose()) {
            console.log('creating thumbnails for idx', currentIdx);
        }
        var width = this.props.styleParams.thumbnailSize;
        var height = this.props.styleParams.thumbnailSize;
        var oneRow;
        var numOfThumbnails;
        var numOfWholeThumbnails;
        switch (thumbnailPosition) {
            case 'top':
            case 'bottom':
                width =
                    this.props.container.galleryWidth +
                        this.props.styleParams.thumbnailSpacings;
                height =
                    this.props.styleParams.thumbnailSize +
                        this.props.styleParams.thumbnailSpacings;
                oneRow = true;
                numOfThumbnails = Math.ceil(width / this.props.styleParams.thumbnailSize);
                numOfWholeThumbnails = Math.floor((width + this.props.styleParams.thumbnailSpacings) /
                    (this.props.styleParams.thumbnailSize +
                        this.props.styleParams.thumbnailSpacings * 2));
                break;
            case 'left':
            case 'right':
                height =
                    this.props.container.galleryHeight +
                        2 * this.props.styleParams.thumbnailSpacings;
                width =
                    this.props.styleParams.thumbnailSize +
                        2 * this.props.styleParams.thumbnailSpacings;
                oneRow = false;
                numOfThumbnails = Math.ceil(height / this.props.styleParams.thumbnailSize);
                numOfWholeThumbnails = Math.floor(height /
                    (this.props.styleParams.thumbnailSize +
                        this.props.styleParams.thumbnailSpacings * 2));
                break;
        }
        this.firstItemIdx = currentIdx - Math.floor(numOfThumbnails / 2) - 1;
        this.lastItemIdx = this.firstItemIdx + numOfThumbnails;
        if (this.firstItemIdx < 0) {
            this.lastItemIdx -= this.firstItemIdx;
            this.firstItemIdx = 0;
        }
        if (this.lastItemIdx > items.length - 1) {
            this.firstItemIdx -= this.lastItemIdx - (items.length - 1);
            if (this.firstItemIdx < 0) {
                this.firstItemIdx = 0;
            }
            this.lastItemIdx = items.length - 1;
        }
        numOfThumbnails = this.lastItemIdx - this.firstItemIdx + 1;
        if (numOfThumbnails % 2 === 0 &&
            items.length > numOfThumbnails &&
            this.lastItemIdx < items.length - 1) {
            // keep an odd number of thumbnails if there are more thumbnails than items and if the thumbnails haven't reach the last item yet
            numOfThumbnails += 1;
            this.lastItemIdx += 1;
        }
        var thumbnailsContainerSize = numOfThumbnails * this.props.styleParams.thumbnailSize +
            ((numOfThumbnails - 1) * 2 + 1) *
                this.props.styleParams.thumbnailSpacings;
        var thumbnailsStyle = { width: width, height: height };
        if (items.length <= numOfWholeThumbnails ||
            currentIdx < numOfThumbnails / 2 - 1) {
            //there are less thumbnails than available thumbnails spots || one of the first thumbnails
            switch (thumbnailPosition) {
                case 'top':
                case 'bottom':
                    thumbnailsStyle.width = thumbnailsContainerSize + 'px';
                    thumbnailsStyle.left = 0;
                    break;
                case 'left':
                case 'right':
                    thumbnailsStyle.height = thumbnailsContainerSize + 'px';
                    thumbnailsStyle.marginTop = 0;
                    break;
            }
        }
        else if (currentIdx > numOfThumbnails / 2 - 1 &&
            currentIdx < items.length - numOfThumbnails / 2) {
            //set selected to center only if neeeded
            switch (thumbnailPosition) {
                case 'top':
                case 'bottom':
                    thumbnailsStyle.width = thumbnailsContainerSize + 'px';
                    thumbnailsStyle.left = (width - thumbnailsContainerSize) / 2 + 'px';
                    break;
                case 'left':
                case 'right':
                    thumbnailsStyle.height = thumbnailsContainerSize + 'px';
                    thumbnailsStyle.marginTop =
                        (height - thumbnailsContainerSize) / 2 + 'px';
                    break;
            }
        }
        else if (currentIdx >= items.length - numOfThumbnails / 2) {
            //one of the last thumbnails
            switch (thumbnailPosition) {
                case 'top':
                case 'bottom':
                    thumbnailsStyle.left = width - thumbnailsContainerSize + 'px';
                    thumbnailsStyle.overflow = 'visible';
                    break;
                case 'left':
                case 'right':
                    thumbnailsStyle.top = height - thumbnailsContainerSize + 'px';
                    thumbnailsStyle.overflow = 'visible';
                    break;
            }
        }
        if (this.props.styleParams.isRTL) {
            thumbnailsStyle.right = thumbnailsStyle.left;
            delete thumbnailsStyle.left;
        }
        var thumbnailsMargin;
        var thumbnailSpacings = this.props.styleParams.thumbnailSpacings;
        switch (this.props.styleParams.galleryThumbnailsAlignment) {
            case 'bottom':
                thumbnailsMargin = thumbnailSpacings + "px -" + thumbnailSpacings + "px 0 -" + thumbnailSpacings + "px";
                break;
            case 'left':
                thumbnailsMargin = "-" + thumbnailSpacings + "px " + thumbnailSpacings + "px -" + thumbnailSpacings + "px 0";
                break;
            case 'top':
                thumbnailsMargin = "0 -" + thumbnailSpacings + "px " + thumbnailSpacings + "px -" + thumbnailSpacings + "px";
                break;
            case 'right':
                thumbnailsMargin = "-" + thumbnailSpacings + "px 0 -" + thumbnailSpacings + "px " + thumbnailSpacings + "px";
                break;
        }
        var getThumbnailItemForSlideshowLoop = function (itemId) {
            return _this.props.galleryStructure.galleryItems.find(function (item) { return item.id === itemId; });
        };
        var highlighledIdxForSlideshowLoop = Math.floor(numOfThumbnails / 2);
        var thumbnailItems;
        if (this.props.styleParams.slideshowLoop) {
            thumbnailItems = items.slice(this.firstItemIdx, this.lastItemIdx + 1);
        }
        else {
            thumbnailItems = this.props.galleryStructure.galleryItems.slice(this.firstItemIdx, this.lastItemIdx + 1);
        }
        var thumbnailSize = this.props.styleParams.thumbnailSize;
        return (react_1.default.createElement("div", { className: 'pro-gallery inline-styles thumbnails-gallery ' +
                (oneRow ? ' one-row hide-scrollbars ' : '') +
                (this.props.styleParams.isRTL ? ' rtl ' : ' ltr ') +
                (this.props.styleParams.isAccessible ? ' accessible ' : ''), style: {
                width: width,
                height: height,
                margin: thumbnailsMargin,
            }, "data-hook": "gallery-thumbnails" },
            react_1.default.createElement("div", { "data-hook": "gallery-thumbnails-column", className: 'galleryColumn', key: 'thumbnails-column', style: Object.assign(thumbnailsStyle, { width: width, height: height }) }, thumbnailItems.map(function (item, idx) {
                var _a;
                var thumbnailItem = _this.props.styleParams.slideshowLoop
                    ? getThumbnailItemForSlideshowLoop(item.itemId || item.photoId)
                    : item;
                var highlighted = _this.props.styleParams.slideshowLoop
                    ? idx === highlighledIdxForSlideshowLoop
                    : thumbnailItem.idx === currentIdx;
                var itemStyle = {
                    width: thumbnailSize,
                    height: thumbnailSize,
                    margin: thumbnailSpacings,
                    backgroundImage: "url(" + thumbnailItem.createUrl(pro_gallery_lib_1.GALLERY_CONSTS.urlSizes.THUMBNAIL, pro_gallery_lib_1.GALLERY_CONSTS.urlTypes.HIGH_RES) + ")",
                };
                var thumbnailOffset = oneRow
                    ? (_a = {},
                        _a[_this.props.styleParams.isRTL ? 'right' : 'left'] = thumbnailSize * idx + 2 * idx * thumbnailSpacings,
                        _a) : { top: thumbnailSize * idx + 2 * idx * thumbnailSpacings };
                Object.assign(itemStyle, thumbnailOffset);
                return (react_1.default.createElement("div", { key: 'thumbnail-' +
                        thumbnailItem.id +
                        (Number.isInteger(item.loopIndex) ? '-' + item.loopIndex : ''), className: 'thumbnailItem' +
                        (highlighted
                            ? ' pro-gallery-thumbnails-highlighted gallery-item-container highlight' +
                                (pro_gallery_lib_1.utils.isMobile() ? ' pro-gallery-mobile-indicator' : '')
                            : ''), "data-key": thumbnailItem.id, style: itemStyle, onClick: function () { return _this.scrollToThumbnail(thumbnailItem.idx); } }, item.type === 'text' ? (react_1.default.createElement(textItem_js_1.default, tslib_1.__assign({}, _this.props, thumbnailItem.renderProps(), { actions: {}, imageDimensions: itemStyle, style: tslib_1.__assign(tslib_1.__assign({}, thumbnailItem.renderProps().style), itemStyle) }))) : null));
            }))));
    };
    SlideshowView.prototype.getCenteredItemIdxByScroll = function () {
        var scrollLeft = this.getScrollLeft();
        // console.log('[RTL SCROLL] setCurrentItemByScroll: ', scrollLeft);
        var items = this.props.galleryStructure.galleryItems;
        var centeredIdx;
        // const scrollPos = this.props.styleParams.isRTL ?
        // this.props.galleryStructure.width - scrollLeft - this.props.container.galleryWidth / 2 :
        var scrollPos = scrollLeft + this.props.container.galleryWidth / 2;
        if (scrollPos === 0) {
            centeredIdx = 0;
        }
        else {
            for (var item = void 0, i = 0; (item = items[i]); i++) {
                if (item.offset.left > scrollPos) {
                    centeredIdx = i - 1;
                    break;
                }
            }
        }
        if (!(centeredIdx >= 0)) {
            centeredIdx = items.length - 1;
        }
        return centeredIdx;
    };
    SlideshowView.prototype.getCenteredGroupIdxByScroll = function () {
        var scrollLeft = this.getScrollLeft();
        // console.log('[RTL SCROLL] setCurrentItemByScroll: ', scrollLeft);
        var groups = this.props.galleryStructure.groups;
        var centeredGroupIdx;
        var scrollPos = scrollLeft + this.props.container.galleryWidth / 2;
        if (scrollPos === 0) {
            centeredGroupIdx = 0;
        }
        else {
            for (var group = void 0, i = 0; (group = groups[i]); i++) {
                if (group.left > scrollPos) {
                    centeredGroupIdx = i - 1;
                    break;
                }
            }
        }
        if (!(centeredGroupIdx >= 0)) {
            centeredGroupIdx = groups.length - 1;
        }
        return centeredGroupIdx;
    };
    SlideshowView.prototype.setCurrentItemByScroll = function () {
        var _this = this;
        if (pro_gallery_lib_1.utils.isVerbose()) {
            console.log('Setting current Idx by scroll', this.isAutoScrolling);
        }
        if (this.isAutoScrolling) {
            //avoid this function if the scroll was originated by us (arrows or thumbnails)
            this.isAutoScrolling = false;
            return;
        }
        var isScrolling = (this.container && this.container.getAttribute('data-scrolling')) ===
            'true';
        if (isScrolling) {
            this.stopAutoSlideshow();
            //while the scroll is animating, prevent the reaction to this event
            return;
        }
        this.startAutoSlideshowIfNeeded(this.props.styleParams);
        var currentIdx = this.getCenteredItemIdxByScroll();
        if (!pro_gallery_lib_1.utils.isUndefined(currentIdx)) {
            pro_gallery_lib_1.utils.setStateAndLog(this, 'Set Current Item', {
                currentIdx: currentIdx,
            }, function () {
                _this.onCurrentItemChanged();
            });
        }
        return currentIdx;
    };
    SlideshowView.prototype.createDebugMsg = function () {
        return react_1.default.createElement(galleryDebugMessage_js_1.default, tslib_1.__assign({}, this.props.debug));
    };
    SlideshowView.prototype.createNavArrows = function () {
        var _this = this;
        var _a = this.props.styleParams, isRTL = _a.isRTL, oneRow = _a.oneRow, arrowsColor = _a.arrowsColor, isSlideshow = _a.isSlideshow, slideshowInfoSize = _a.slideshowInfoSize, imageMargin = _a.imageMargin, arrowsSize = _a.arrowsSize, arrowsPosition = _a.arrowsPosition, showArrows = _a.showArrows;
        var _b = this.state, hideLeftArrow = _b.hideLeftArrow, hideRightArrow = _b.hideRightArrow;
        var shouldNotRenderNavArrows = !showArrows ||
            this.props.galleryStructure.columns.some(function (column) {
                var allRenderedGroups = column.groups.filter(function (group) { return group.rendered; }) || [];
                var allGroupsWidth = allRenderedGroups.reduce(function (sum, group) { return sum + Math.max(0, group.width); }, 0);
                var isAllItemsFitsGalleryWidth = oneRow && _this.props.container.galleryWidth >= allGroupsWidth;
                return isAllItemsFitsGalleryWidth;
            });
        //remove navBars if no scroll is needed and is column layout
        if (shouldNotRenderNavArrows) {
            return null;
        }
        var arrowWidth = this.props.styleParams.arrowsSize;
        var arrowOrigWidth = 23; //arrow-right svg and arrow-left svg width
        var scalePercentage = arrowWidth / arrowOrigWidth;
        var svgStyle = { transform: "scale(" + scalePercentage + ")" };
        var svgInternalStyle = {};
        if (pro_gallery_lib_1.utils.isMobile()) {
            if (typeof arrowsColor !== 'undefined') {
                svgInternalStyle.fill = arrowsColor.value;
            }
        }
        // nav-arrows-container width is 100. arrowWidth + padding on each side should be 100
        var containerPadding = (100 - arrowWidth) / 2;
        var slideshowSpace = isSlideshow ? slideshowInfoSize : 0;
        // top: imageMargin effect the margin of the main div that SlideshowView is rendering, so the arrows should be places accordingly. 50% is the middle, 50px is half of nav-arrows-container height
        var containerStyle = {
            padding: "0 " + containerPadding + "px 0 " + containerPadding + "px",
            top: "calc(50% - 50px + " + imageMargin / 4 + "px - " + slideshowSpace / 2 + "px)",
        };
        // Add negative positioning for external arrows. consists of arrow size, half of arrow container and padding
        var arrowsPos = oneRow && arrowsPosition === pro_gallery_lib_1.GALLERY_CONSTS.arrowsPosition.OUTSIDE_GALLERY
            ? "-" + (arrowsSize + 50 + 10) + "px"
            : imageMargin / 2 + "px";
        // left & right: imageMargin effect the margin of the main div that SlideshowView is rendering, so the arrows should be places accordingly
        var prevContainerStyle = {
            left: arrowsPos,
        };
        var nextContainerStyle = {
            right: arrowsPos,
        };
        var arrowRenderer = this.props.customNavArrowsRenderer;
        return [
            hideLeftArrow ? null : (react_1.default.createElement("button", { className: 'nav-arrows-container prev ' +
                    (pro_gallery_lib_1.utils.isMobile() ? 'pro-gallery-mobile-indicator ' : ''), onClick: function () { return _this._next({ direction: -1 }); }, "aria-label": (isRTL ? 'Next' : 'Previous') + " Item", tabIndex: pro_gallery_lib_1.utils.getTabIndex('slideshowPrev'), key: "nav-arrow-back", "data-hook": "nav-arrow-back", style: tslib_1.__assign(tslib_1.__assign({}, containerStyle), prevContainerStyle) }, arrowRenderer ? (arrowRenderer('left')) : (react_1.default.createElement("svg", { width: "23", height: "39", viewBox: "0 0 23 39", style: svgStyle },
                react_1.default.createElement("path", { className: "slideshow-arrow", style: svgInternalStyle, d: "M154.994,259.522L153.477,261l-18.471-18,18.473-18,1.519,1.48L138.044,243Z", transform: "translate(-133 -225)" }))))),
            hideRightArrow ? null : (react_1.default.createElement("button", { className: 'nav-arrows-container next', onClick: function () { return _this._next({ direction: 1 }); }, "aria-label": (!isRTL ? 'Next' : 'Previous') + " Item", tabIndex: pro_gallery_lib_1.utils.getTabIndex('slideshowNext'), key: "nav-arrow-next", "data-hook": "nav-arrow-next", style: tslib_1.__assign(tslib_1.__assign({}, containerStyle), nextContainerStyle) }, arrowRenderer ? (arrowRenderer('right')) : (react_1.default.createElement("svg", { width: "23", height: "39", viewBox: "0 0 23 39", style: svgStyle },
                react_1.default.createElement("path", { className: "slideshow-arrow", style: svgInternalStyle, d: "M857.005,231.479L858.5,230l18.124,18-18.127,18-1.49-1.48L873.638,248Z", transform: "translate(-855 -230)" }))))),
        ];
    };
    SlideshowView.prototype.createLayout = function () {
        var _this = this;
        var _a = this.props, itemsLoveData = _a.itemsLoveData, getVisibleItems = _a.getVisibleItems, galleryStructure = _a.galleryStructure, container = _a.container;
        var galleryConfig = {
            scrollingElement: this.props.scrollingElement,
            totalItemsCount: this.props.totalItemsCount,
            scroll: this.props.scroll,
            styleParams: this.props.styleParams,
            container: this.props.container,
            watermark: this.props.watermark,
            settings: this.props.settings,
            currentIdx: this.state.currentIdx,
            customHoverRenderer: this.props.customHoverRenderer,
            customInfoRenderer: this.props.customInfoRenderer,
            customImageRenderer: this.props.customImageRenderer,
            customSlideshowInfoRenderer: this.props.customSlideshowInfoRenderer,
            noFollowForSEO: this.props.noFollowForSEO,
            domId: this.props.domId,
            gotFirstScrollEvent: this.props.gotFirstScrollEvent,
            playingVideoIdx: this.props.playingVideoIdx,
            isPrerenderMode: this.props.isPrerenderMode,
            totalWidth: this.props.galleryStructure.width,
            firstUserInteractionExecuted: this.props.firstUserInteractionExecuted,
            actions: {
                eventsListener: this.props.actions.eventsListener,
            },
        };
        var renderGroups = function (column) {
            var layoutGroupView = !!column.galleryGroups.length &&
                getVisibleItems(column.galleryGroups, container);
            return (layoutGroupView &&
                layoutGroupView.map(function (group) {
                    return group.rendered
                        ? react_1.default.createElement(groupView_js_1.default, tslib_1.__assign(tslib_1.__assign({ allowLoop: _this.props.styleParams.slideshowLoop &&
                                _this.props.galleryStructure.width >
                                    _this.props.container.width, itemsLoveData: itemsLoveData }, group.renderProps(galleryConfig)), { ariaHidden: group.idx > _this.skipFromSlide }))
                        : false;
                }));
        };
        return galleryStructure.columns.map(function (column, c) {
            var columnStyle = {
                width: _this.props.isPrerenderMode ? '100%' : column.width,
                height: container.galleryHeight,
            };
            if (_this.props.styleParams.isSlideshow) {
                Object.assign(columnStyle, {
                    paddingBottom: _this.props.styleParams.slideshowInfoSize,
                });
            }
            return (react_1.default.createElement("div", { "data-hook": "gallery-column", id: "gallery-horizontal-scroll", className: "gallery-horizontal-scroll gallery-column hide-scrollbars " + (_this.props.styleParams.isRTL ? ' rtl ' : ' ltr ') + " " + (_this.props.styleParams.scrollSnap ? ' scroll-snap ' : '') + " ", key: 'column' + c, style: columnStyle },
                react_1.default.createElement("div", { className: "gallery-horizontal-scroll-inner" }, renderGroups(column))));
        });
    };
    SlideshowView.prototype.createGallery = function () {
        // When arrows are set outside of the gallery, gallery is resized and needs to be positioned
        var galleryStyleForExternalArrows = this.props.styleParams.oneRow &&
            this.props.styleParams.arrowsPosition ===
                pro_gallery_lib_1.GALLERY_CONSTS.arrowsPosition.OUTSIDE_GALLERY
            ? {
                overflow: 'visible',
                left: this.props.styleParams.arrowsSize +
                    40 +
                    this.props.styleParams.imageMargin / 2,
            }
            : {};
        var galleryDimensions = this.props.isPrerenderMode
            ? {
                width: '100%',
                height: this.props.container.galleryHeight,
            }
            : {
                height: this.props.container.galleryHeight,
                width: this.props.container.galleryWidth,
            };
        var galleryStyle = tslib_1.__assign(tslib_1.__assign({}, galleryDimensions), galleryStyleForExternalArrows);
        if (this.props.styleParams.isSlideshow) {
            Object.assign(galleryStyle, {
                paddingBottom: this.props.styleParams.slideshowInfoSize,
            });
        }
        return (react_1.default.createElement("div", { id: "pro-gallery-container", className: 'pro-gallery inline-styles one-row hide-scrollbars ' +
                (this.props.styleParams.enableScroll ? ' slider ' : '') +
                (this.props.styleParams.isAccessible ? ' accessible ' : '') +
                (this.props.styleParams.isRTL ? ' rtl ' : ' ltr '), style: galleryStyle },
            this.createDebugMsg(),
            this.createNavArrows(),
            this.createLayout(),
            this.createAutoSlideShowPlayButton(),
            this.createSlideShowNumbers()));
    };
    SlideshowView.prototype.onAutoSlideShowButtonClick = function () {
        var _this = this;
        var currShouldStopAutoSlideShow = this.state.shouldStopAutoSlideShow;
        this.setState({ shouldStopAutoSlideShow: !currShouldStopAutoSlideShow }, function () {
            _this.startAutoSlideshowIfNeeded(_this.props.styleParams);
        });
    };
    SlideshowView.prototype.isFullWidthGallery = function () {
        return this.props.container.galleryWidth >= pro_gallery_lib_1.utils.getWindowWidth() - 10;
    };
    SlideshowView.prototype.onAutoSlideshowAutoPlayKeyPress = function (e) {
        switch (e.keyCode || e.charCode) {
            case 32: //space
            case 13: //enter
                e.preventDefault();
                e.stopPropagation();
                this.onAutoSlideShowButtonClick();
                return false;
            default:
                return true;
        }
    };
    SlideshowView.prototype.calcSlideshowCounterWidth = function () {
        var totalItemsCount = this.props.totalItemsCount;
        if (totalItemsCount < 10) {
            // x/x
            return 26;
        }
        else if (totalItemsCount < 100) {
            // xx/xx
            return 43;
        }
        else if (totalItemsCount < 1000) {
            // xxx/xxx
            return 60;
        }
        else {
            // xxxx/xxxx or more
            return 76;
        }
    };
    SlideshowView.prototype.createAutoSlideShowPlayButton = function () {
        var _this = this;
        if (!this.shouldCreateSlideShowPlayButton) {
            return false;
        }
        var _a = this.props.styleParams, galleryTextAlign = _a.galleryTextAlign, slideshowInfoSize = _a.slideshowInfoSize;
        var imageMargin = this.props.styleParams.imageMargin / 2 +
            (this.isFullWidthGallery() ? 50 : 0);
        var side = galleryTextAlign === 'right'
            ? { left: imageMargin / 2 + "px" }
            : {
                right: imageMargin / 2 +
                    (this.shouldCreateSlideShowNumbers
                        ? this.calcSlideshowCounterWidth()
                        : 0) + "px",
            };
        return (react_1.default.createElement("button", { className: 'auto-slideshow-button', onClick: function () {
                _this.onAutoSlideShowButtonClick();
            }, onKeyDown: this.onAutoSlideshowAutoPlayKeyPress, "data-hook": "auto-slideshow-button", title: 'slideshow auto play', "aria-pressed": this.state.shouldStopAutoSlideShow, tabIndex: 0, style: tslib_1.__assign({ top: "calc(100% - " + slideshowInfoSize + "px + 3px)" }, side) }, this.state.shouldStopAutoSlideShow ? (react_1.default.createElement(play_1.default, { width: "10px", height: "100%" })) : (react_1.default.createElement(pause_1.default, { width: "10px", height: "100%" }))));
    };
    SlideshowView.prototype.createSlideShowNumbers = function () {
        if (!this.shouldCreateSlideShowNumbers) {
            return false;
        }
        var _a = this.props, totalItemsCount = _a.totalItemsCount, _b = _a.styleParams, galleryTextAlign = _b.galleryTextAlign, slideshowInfoSize = _b.slideshowInfoSize;
        var imageMargin = this.props.styleParams.imageMargin / 2 +
            (this.isFullWidthGallery() ? 50 : 0);
        var leftMargin = this.shouldCreateSlideShowPlayButton
            ? imageMargin / 2 + 25
            : imageMargin / 2;
        var side = galleryTextAlign === 'right'
            ? { left: leftMargin + "px" }
            : { right: imageMargin / 2 + "px" };
        return (react_1.default.createElement("div", { className: 'auto-slideshow-counter', "data-hook": "auto-slideshow-counter", style: tslib_1.__assign({ top: "calc(100% - " + slideshowInfoSize + "px + 3px)" }, side) },
            react_1.default.createElement("div", null, (this.state.currentIdx % totalItemsCount) +
                1 +
                '/' +
                totalItemsCount)));
    };
    SlideshowView.prototype.getThumbnails = function () {
        var hasThumbnails = this.props.styleParams.hasThumbnails;
        var thumbnailsPosition = this.props.styleParams
            .galleryThumbnailsAlignment;
        var thumbnailsGallery = hasThumbnails
            ? this.createThumbnails(thumbnailsPosition)
            : false;
        var thumbnails = [];
        switch (thumbnailsPosition) {
            case 'top':
            case 'left':
                thumbnails[0] = thumbnailsGallery;
                thumbnails[1] = false;
                break;
            case 'right':
            case 'bottom':
                thumbnails[0] = false;
                thumbnails[1] = thumbnailsGallery;
                break;
        }
        return thumbnails;
    };
    SlideshowView.prototype.getClassNames = function () {
        var classNames = 'pro-gallery-parent-container';
        if (this.props.styleParams.isSlideshow) {
            classNames += ' gallery-slideshow';
        }
        else if (this.props.styleParams.isSlider) {
            classNames += ' gallery-slider';
        }
        else if (this.props.styleParams.hasThumbnails) {
            classNames += ' gallery-thumbnails';
        }
        else if (this.props.styleParams.isColumns) {
            classNames += ' gallery-columns';
        }
        if (this.isFullWidthGallery()) {
            classNames += ' streched';
        }
        return classNames;
    };
    SlideshowView.prototype.getStyles = function () {
        return {
            margin: -1 *
                (this.props.styleParams.imageMargin / 2 -
                    this.props.styleParams.galleryMargin),
        };
    };
    SlideshowView.prototype.getScrollLeft = function () {
        return this.container
            ? (this.props.styleParams.isRTL ? -1 : 1) * this.container.scrollLeft
            : 0;
    };
    //-----------------------------------------| REACT |--------------------------------------------//
    SlideshowView.prototype.UNSAFE_componentWillReceiveProps = function (props) {
        var _this = this;
        if (props.items) {
            this.ItemsForSlideshowLoopThumbnails = false;
        }
        if (this.props.isInDisplay !== props.isInDisplay) {
            this.setState({ isInView: props.isInDisplay }, function () {
                return _this.startAutoSlideshowIfNeeded(props.styleParams);
            });
        }
        if (pro_gallery_lib_1.isEditMode() || pro_gallery_lib_1.isPreviewMode()) {
            if (
            //check that the change is related to the slideshow settings
            this.props.styleParams.isAutoSlideshow !==
                props.styleParams.isAutoSlideshow ||
                this.props.styleParams.autoSlideshowInterval !==
                    props.styleParams.autoSlideshowInterval) {
                this.startAutoSlideshowIfNeeded(props.styleParams);
            }
        }
        var isAutoSlideShow = props.styleParams.galleryLayout === 5 &&
            props.styleParams.isSlideshow &&
            props.styleParams.isAutoSlideshow;
        this.shouldCreateSlideShowPlayButton =
            isAutoSlideShow && props.styleParams.playButtonForAutoSlideShow;
        this.shouldCreateSlideShowNumbers =
            isAutoSlideShow && props.styleParams.allowSlideshowCounter;
    };
    SlideshowView.prototype.removeArrowsIfNeeded = function () {
        var _this = this;
        setTimeout(function () {
            var isRTL = _this.props.styleParams.isRTL;
            var _a = _this.state, hideLeftArrow = _a.hideLeftArrow, hideRightArrow = _a.hideRightArrow;
            var isScrollStart = _this.isScrollStart();
            var isFirstItem = _this.isFirstItem();
            var isScrollEnd = _this.isScrollEnd();
            var isLastItem = _this.isLastItem();
            var atStart = isScrollStart || isFirstItem;
            var atEnd = isScrollEnd || isLastItem;
            var nextHideLeft = (!isRTL && atStart) || (isRTL && atEnd);
            var nextHideRight = (isRTL && atStart) || (!isRTL && atEnd);
            var isNew = !!nextHideLeft !== !!hideLeftArrow ||
                !!nextHideRight !== !!hideRightArrow;
            if (isNew) {
                _this.setState({
                    hideLeftArrow: !!nextHideLeft,
                    hideRightArrow: !!nextHideRight,
                });
            }
        }, 50);
    };
    SlideshowView.prototype.navigationOutHandler = function () {
        //TODO remove after full refactor release
        pro_gallery_lib_1.utils.setStateAndLog(this, 'Next Item', {
            isInView: false,
        });
        this.stopAutoSlideshow();
    };
    SlideshowView.prototype.navigationInHandler = function () {
        //TODO remove after full refactor release
        pro_gallery_lib_1.utils.setStateAndLog(this, 'Next Item', {
            isInView: true,
        });
        this.startAutoSlideshowIfNeeded(this.props.styleParams);
    };
    SlideshowView.prototype.componentDidMount = function () {
        pro_gallery_lib_1.window.addEventListener('gallery_navigation_out', this.navigationOutHandler);
        pro_gallery_lib_1.window.addEventListener('gallery_navigation_in', this.navigationInHandler);
        this.container = pro_gallery_lib_1.window.document.querySelector("#pro-gallery-" + this.props.domId + " #gallery-horizontal-scroll");
        if (this.container) {
            this.container.addEventListener('scroll', this._setCurrentItemByScroll);
        }
        if (this.state.currentIdx > 0) {
            this.props.actions.scrollToItem(this.state.currentIdx);
            this.onCurrentItemChanged();
        }
        else {
            this.setCurrentItemByScroll();
        }
        this.startAutoSlideshowIfNeeded(this.props.styleParams);
    };
    SlideshowView.prototype.componentWillUnmount = function () {
        pro_gallery_lib_1.window.removeEventListener('gallery_navigation_out', this.navigationOutHandler);
        pro_gallery_lib_1.window.removeEventListener('gallery_navigation_in', this.navigationInHandler);
        if (this.container) {
            this.container.removeEventListener('scroll', this._setCurrentItemByScroll);
        }
    };
    //-----------------------------------------| RENDER |--------------------------------------------//
    SlideshowView.prototype.render = function () {
        if (pro_gallery_lib_1.utils.isVerbose()) {
            console.count('galleryView render');
            console.count('Rendering Gallery count');
            console.time('Rendering Gallery took ');
        }
        var gallery = this.createGallery();
        var thumbnails = this.getThumbnails();
        if (pro_gallery_lib_1.utils.isVerbose()) {
            console.timeEnd('Rendering Gallery took ');
        }
        return (react_1.default.createElement("div", { className: this.getClassNames(), style: this.getStyles(), onKeyDown: this.handleSlideshowKeyPress, role: "region", "aria-label": this.props.proGalleryRegionLabel },
            thumbnails[0],
            gallery,
            thumbnails[1]));
    };
    return SlideshowView;
}(galleryComponent_1.GalleryComponent));
exports.default = SlideshowView;
//# sourceMappingURL=slideshowView.js.map