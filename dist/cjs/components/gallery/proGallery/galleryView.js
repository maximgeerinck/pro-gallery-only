"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var react_1 = tslib_1.__importDefault(require("react"));
var pro_gallery_lib_1 = require("pro-gallery-lib");
var galleryDebugMessage_1 = tslib_1.__importDefault(require("./galleryDebugMessage"));
var itemView_js_1 = tslib_1.__importDefault(require("../../item/itemView.js"));
var galleryComponent_1 = require("../../galleryComponent");
var GalleryView = /** @class */ (function (_super) {
    tslib_1.__extends(GalleryView, _super);
    function GalleryView(props) {
        var _this = _super.call(this, props) || this;
        _this.handleArrowKeys = _this.handleArrowKeys.bind(_this);
        _this.showMoreItems = _this.showMoreItems.bind(_this);
        _this.createGalleryConfig = _this.createGalleryConfig.bind(_this);
        _this.screenLogs = _this.screenLogs.bind(_this);
        _this.createGallery = _this.createGallery.bind(_this);
        _this.id = Date.now() + '|' + Math.floor(Math.random() * 10000);
        _this.state = {
            currentIdx: 0,
        };
        return _this;
    }
    GalleryView.prototype.handleArrowKeys = function (e) {
        var activeItemIdx = pro_gallery_lib_1.window.document.activeElement.getAttribute('data-idx');
        if (activeItemIdx) {
            var findNeighborItem = this.props.actions.findNeighborItem ||
                this.props.galleryStructure.findNeighborItem ||
                (function () { }); //temp change for tests to pass
            var idx = Number(activeItemIdx);
            var newIdx = -1;
            switch (e.keyCode || e.charCode) {
                case 38: //up
                    newIdx = findNeighborItem(idx, 'up');
                    break;
                case 37: //left
                    newIdx = findNeighborItem(idx, this.props.styleParams.isRTL ? 'right' : 'left');
                    break;
                case 40: //down
                    newIdx = findNeighborItem(idx, 'down');
                    break;
                case 39: //right
                    newIdx = findNeighborItem(idx, this.props.styleParams.isRTL ? 'left' : 'right');
                    break;
            }
            //if nextIdx is below the lastVisibleItemIdx (higher idx), we will ignore the findNeighborItem answer and stay on the same item
            if (newIdx > this.lastVisibleItemIdx()) {
                newIdx = idx;
            }
            if (newIdx >= 0) {
                e.preventDefault();
                e.stopPropagation();
                pro_gallery_lib_1.utils.setStateAndLog(this, 'Set Gallery Current Item', {
                    currentIdx: newIdx,
                });
                return false;
            }
        }
        return true;
    };
    GalleryView.prototype.lastVisibleItemIdxInHeight = function (height) {
        for (var i = this.props.galleryStructure.items.length - 1; i >= 0; i--) {
            var item = this.props.galleryStructure.items[i];
            var isVisible = item.offset.top < height;
            if (isVisible) {
                return i;
            }
        }
        return this.items.length - 1;
    };
    GalleryView.prototype.lastVisibleItemIdx = function () {
        //the item must be visible and above the show more button
        return this.lastVisibleItemIdxInHeight(this.props.container.galleryHeight - 100);
    };
    GalleryView.prototype.showMoreItems = function () {
        var _this = this;
        if (this.props.styleParams.isAccessible) {
            // tal - I left this check since we do not want to focus the last item in non-accessibility mode
            //find the last visible item and focus on it
            try {
                var lastItemIdx = this.lastVisibleItemIdx();
                pro_gallery_lib_1.utils.setStateAndLog(this, 'Focus on Last Gallery Item', {
                    currentIdx: lastItemIdx + 1,
                }, function () {
                    _this.props.actions.toggleLoadMoreItems();
                });
            }
            catch (e) {
                console.warn('Cannot find item to focus', e);
            }
        }
        else {
            this.props.actions.toggleLoadMoreItems();
        }
    };
    GalleryView.prototype.createGallery = function (showMore) {
        var _a = this.props, itemsLoveData = _a.itemsLoveData, styleParams = _a.styleParams, container = _a.container, galleryStructure = _a.galleryStructure, getVisibleItems = _a.getVisibleItems;
        var galleryConfig = this.createGalleryConfig();
        var showMoreContainerHeight = 138; //according to the scss
        var debugMsg = react_1.default.createElement(galleryDebugMessage_1.default, tslib_1.__assign({}, this.props.debug));
        var galleryHeight;
        if (showMore) {
            galleryHeight = container.galleryHeight - showMoreContainerHeight;
        }
        else {
            galleryHeight = galleryStructure.height + 'px';
        }
        var galleryStructureItems = getVisibleItems(galleryStructure.galleryItems, container);
        var layout = galleryStructureItems.map(function (item, index) {
            return react_1.default.createElement(itemView_js_1.default, item.renderProps(tslib_1.__assign(tslib_1.__assign(tslib_1.__assign({}, galleryConfig), itemsLoveData[item.id]), { visible: item.isVisible, key: "itemView-" + item.id + "-" + index })));
        });
        return (react_1.default.createElement("div", { id: "pro-gallery-container", className: 'pro-gallery inline-styles ' +
                (styleParams.oneRow ? ' one-row slider hide-scrollbars ' : '') +
                (styleParams.isAccessible ? ' accessible ' : '') +
                (styleParams.isRTL ? ' rtl ' : ' ltr '), style: {
                height: galleryHeight,
                overflowX: 'hidden',
            }, onKeyDown: this.handleArrowKeys },
            react_1.default.createElement("div", { id: "pro-gallery-margin-container", style: {
                    margin: styleParams.galleryMargin + 'px',
                    height: galleryHeight,
                    width: this.props.container.galleryWidth - styleParams.imageMargin,
                    overflow: 'visible',
                    position: 'relative',
                } },
                debugMsg,
                layout)));
    };
    GalleryView.prototype.createGalleryConfig = function () {
        return {
            scrollingElement: this.props.scrollingElement,
            scroll: this.props.scroll,
            container: this.props.container,
            styleParams: this.props.styleParams,
            watermark: this.props.watermark,
            settings: this.props.settings,
            currentIdx: this.state.currentIdx,
            customHoverRenderer: this.props.customHoverRenderer,
            customInfoRenderer: this.props.customInfoRenderer,
            customImageRenderer: this.props.customImageRenderer,
            domId: this.props.domId,
            gotFirstScrollEvent: this.props.gotFirstScrollEvent,
            playingVideoIdx: this.props.playingVideoIdx,
            noFollowForSEO: this.props.noFollowForSEO,
            isPrerenderMode: this.props.isPrerenderMode,
            firstUserInteractionExecuted: this.props.firstUserInteractionExecuted,
            actions: {
                eventsListener: this.props.actions.eventsListener,
            },
        };
    };
    GalleryView.prototype.screenLogs = function () {
        return pro_gallery_lib_1.utils.shouldDebug('screenLogs') ? (react_1.default.createElement("div", { className: "screen-logs" },
            "URL width: ",
            pro_gallery_lib_1.utils.parseGetParam('width'),
            ", Container:",
            ' ',
            JSON.stringify(this.props.container.galleryWidth),
            ", window.document.body.clientWidth ",
            document.body.clientWidth,
            ", window.innerWidth ",
            pro_gallery_lib_1.window.innerWidth,
            ", window.screen.width:",
            ' ',
            pro_gallery_lib_1.window.screen.width)) : ('');
    };
    GalleryView.prototype.createShowMoreButton = function () {
        if (typeof this.props.customLoadMoreRenderer === 'function') {
            return (react_1.default.createElement("div", { onClick: this.showMoreItems }, this.props.customLoadMoreRenderer(this.props)));
        }
        var styleParams = this.props.styleParams;
        var showMoreButton = false;
        var buttonState = this.props.displayShowMore;
        var shouldShowButton = buttonState &&
            this.props.galleryStructure.height > this.props.container.height;
        if (shouldShowButton) {
            var buttonText = styleParams.loadMoreButtonText || 'Load More';
            showMoreButton = (react_1.default.createElement("div", { className: 'show-more-container' +
                    (pro_gallery_lib_1.utils.isMobile() ? ' pro-gallery-mobile-indicator' : '') },
                react_1.default.createElement("button", { tabIndex: pro_gallery_lib_1.utils.getTabIndex('loadMoreButton'), id: 'show-more-' + this.props.domId, className: "show-more", onClick: this.showMoreItems, onMouseDown: function (e) { return e.preventDefault(); }, "data-hook": "show-more", "aria-label": buttonText }, buttonText)));
        }
        return showMoreButton;
    };
    //-----------------------------------------| RENDER |--------------------------------------------//
    GalleryView.prototype.render = function () {
        if (pro_gallery_lib_1.utils.isVerbose()) {
            console.count('galleryView render');
            console.time('Rendering Gallery took ');
            console.log('[DEBUG_RENDER] GalleryView styleParams', this.props.styleParams);
            console.log('[DEBUG_RENDER] GalleryView props changed', pro_gallery_lib_1.utils.printableObjectsDiff(this.lastProps || {}, this.props));
            this.lastProps = tslib_1.__assign({}, this.props);
            console.log('[DEBUG_RENDER] GalleryView state changed', pro_gallery_lib_1.utils.printableObjectsDiff(this.lastState || {}, this.state));
            this.lastState = tslib_1.__assign({}, this.state);
            this.renderCount = (this.renderCount || 0) + 1;
        }
        var showMore = this.createShowMoreButton();
        var gallery = this.createGallery(showMore);
        if (pro_gallery_lib_1.utils.isVerbose()) {
            console.timeEnd('Rendering Gallery took ');
        }
        var screenLogs = this.screenLogs();
        return (react_1.default.createElement("div", { className: 'pro-gallery-parent-container', key: "pro-gallery-" + this.id, role: "region", "aria-label": this.props.proGalleryRegionLabel },
            screenLogs,
            gallery,
            showMore));
    };
    return GalleryView;
}(galleryComponent_1.GalleryComponent));
exports.default = GalleryView;
//# sourceMappingURL=galleryView.js.map