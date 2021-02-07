"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var react_1 = tslib_1.__importDefault(require("react"));
var pro_gallery_lib_1 = require("pro-gallery-lib");
var proBlueprintsGallery_1 = tslib_1.__importDefault(require("./proGallery/proBlueprintsGallery"));
var propTypes_1 = tslib_1.__importDefault(require("./proGallery/propTypes"));
var BaseGallery = /** @class */ (function (_super) {
    tslib_1.__extends(BaseGallery, _super);
    function BaseGallery(props) {
        var _this = _super.call(this) || this;
        _this.blueprintsManager = new pro_gallery_lib_1.BlueprintsManager({ id: 'layoutingGallery' });
        _this.domId = props.domId || 'default-dom-id';
        _this.state = {
            blueprint: _this.blueprintsManager.existingBlueprint || null,
        };
        _this.blueprintsManager.init({
            api: {
                isUsingCustomInfoElements: function () {
                    return props.customHoverRenderer ||
                        props.customInfoRenderer ||
                        props.customSlideshowInfoRenderer;
                },
                fetchMoreItems: function (from) {
                    typeof props.eventsListener === 'function' &&
                        props.eventsListener(pro_gallery_lib_1.GALLERY_CONSTS.events.NEED_MORE_ITEMS, from);
                },
                onBlueprintReady: function (_a) {
                    var blueprint = _a.blueprint, blueprintChanged = _a.blueprintChanged;
                    if (blueprintChanged) {
                        _this.setBlueprint(blueprint);
                    }
                    else {
                        if (pro_gallery_lib_1.utils.isVerbose()) {
                            console.count('>>> Blueprint not changed, not setting it');
                        }
                    }
                },
            },
        });
        _this.onNewProps(props);
        return _this;
    }
    BaseGallery.prototype.setBlueprint = function (blueprint) {
        this.setState({ blueprint: blueprint });
    };
    BaseGallery.prototype.onNewProps = function (props) {
        var _this = this;
        var styles = props.styles, options = props.options, styleParams = props.styleParams, eventsListener = props.eventsListener, otherProps = tslib_1.__rest(props, ["styles", "options", "styleParams", "eventsListener"]);
        var _eventsListener = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var eventName = args[0], value = args[1];
            if (eventName === pro_gallery_lib_1.GALLERY_CONSTS.events.NEED_MORE_ITEMS) {
                _this.blueprintsManager.getMoreItems(value);
            }
            else {
                typeof eventsListener === 'function' && eventsListener.apply(void 0, args);
            }
        };
        var _styles = tslib_1.__assign(tslib_1.__assign(tslib_1.__assign(tslib_1.__assign({}, pro_gallery_lib_1.defaultStyles), options), styles), styleParams);
        this.galleryProps = tslib_1.__assign(tslib_1.__assign({}, otherProps), { styles: _styles, eventsListener: _eventsListener, domId: this.domId });
        this.blueprintsManager.createBlueprint(this.galleryProps).catch(function (e) {
            console.error('Could not breate a blueprints in layoutingIndex from given props', e);
        });
    };
    BaseGallery.prototype.UNSAFE_componentWillReceiveProps = function (newProps) {
        this.onNewProps(newProps);
    };
    BaseGallery.prototype.render = function () {
        var blueprint = this.state.blueprint;
        if (blueprint && Object.keys(blueprint).length > 0) {
            return react_1.default.createElement(proBlueprintsGallery_1.default, tslib_1.__assign({}, this.galleryProps, blueprint));
        }
        else {
            return null;
        }
    };
    BaseGallery.propTypes = propTypes_1.default;
    return BaseGallery;
}(react_1.default.Component));
exports.default = BaseGallery;
//# sourceMappingURL=layoutingIndex.js.map