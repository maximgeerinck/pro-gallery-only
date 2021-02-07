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
        var _this = _super.call(this, props) || this;
        _this.domId = props.domId || 'default-dom-id';
        return _this;
    }
    BaseGallery.prototype.render = function () {
        var _a = this.props, styles = _a.styles, options = _a.options, styleParams = _a.styleParams, eventsListener = _a.eventsListener, otherProps = tslib_1.__rest(_a, ["styles", "options", "styleParams", "eventsListener"]);
        var _eventsListener = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return typeof eventsListener === 'function' && eventsListener.apply(void 0, args);
        };
        var _styles = tslib_1.__assign(tslib_1.__assign(tslib_1.__assign(tslib_1.__assign({}, pro_gallery_lib_1.defaultStyles), options), styles), styleParams);
        var galleryProps = tslib_1.__assign(tslib_1.__assign({}, otherProps), { styles: _styles, eventsListener: _eventsListener, domId: this.domId });
        if (!this.props.useBlueprints) {
            pro_gallery_lib_1.dimensionsHelper.updateParams({
                domId: galleryProps.domId,
                container: galleryProps.container,
                styles: galleryProps.styles,
            });
            var _b = galleryProps.styles, galleryType = _b.galleryType, galleryLayout = _b.galleryLayout;
            if (galleryType === undefined || galleryLayout !== undefined) {
                galleryProps = tslib_1.__assign(tslib_1.__assign({}, galleryProps), { styles: pro_gallery_lib_1.addPresetStyles(galleryProps.styles) });
            }
        }
        pro_gallery_lib_1.utils.logPlaygroundLink(galleryProps.styles);
        if (galleryProps.styles &&
            galleryProps.items &&
            galleryProps.container &&
            galleryProps.structure) {
            return react_1.default.createElement(proBlueprintsGallery_1.default, tslib_1.__assign({}, galleryProps));
        }
        else {
            return null;
        }
    };
    BaseGallery.propTypes = propTypes_1.default;
    return BaseGallery;
}(react_1.default.Component));
exports.default = BaseGallery;
//# sourceMappingURL=blueprintsIndex.js.map