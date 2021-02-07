"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
require("../../../common/utils/polyfills");
var react_1 = tslib_1.__importDefault(require("react"));
var pro_gallery_lib_1 = require("pro-gallery-lib");
var galleryContainerNew_js_1 = tslib_1.__importDefault(require("./galleryContainerNew.js"));
var galleryComponent_1 = require("../../galleryComponent");
require("../../../versionLogger");
var ProGallery = /** @class */ (function (_super) {
    tslib_1.__extends(ProGallery, _super);
    function ProGallery(props) {
        var _this = _super.call(this) || this;
        _this.init(props);
        if (pro_gallery_lib_1.utils.isLocal() && !pro_gallery_lib_1.utils.isTest()) {
            console.log('PRO GALLERY DEV');
        }
        return _this;
    }
    ProGallery.prototype.init = function (props) {
        if (typeof props.viewMode !== 'undefined') {
            pro_gallery_lib_1.viewModeWrapper.setViewMode(props.viewMode);
        }
        if (typeof props.formFactor !== 'undefined') {
            pro_gallery_lib_1.viewModeWrapper.setFormFactor(props.formFactor);
        }
    };
    ProGallery.prototype.UNSAFE_componentWillReceiveProps = function (nextProps) {
        if (this.props.viewMode !== nextProps.viewMode) {
            pro_gallery_lib_1.utils.dumpCache();
            pro_gallery_lib_1.viewModeWrapper.setViewMode(nextProps.viewMode);
        }
        if (this.props.formFactor !== nextProps.formFactor) {
            pro_gallery_lib_1.utils.dumpCache();
            pro_gallery_lib_1.viewModeWrapper.setFormFactor(nextProps.formFactor);
        }
    };
    ProGallery.prototype.renderProps = function () {
        return tslib_1.__assign(tslib_1.__assign({}, this.props), { domId: this.props.domId, items: this.props.items || [], watermarkData: this.props.watermarkData, settings: this.props.settings || {}, offsetTop: this.props.offsetTop, itemsLoveData: this.props.itemsLoveData || {}, proGalleryRegionLabel: this.props.proGalleryRegionLabel ||
                'Gallery. you can navigate the gallery with keyboard arrow keys.' });
    };
    ProGallery.prototype.containerProps = function () {
        return {
            id: "pro-gallery-" + this.props.domId,
            className: 'pro-gallery',
        };
    };
    ProGallery.prototype.render = function () {
        return (react_1.default.createElement("div", tslib_1.__assign({}, this.containerProps()),
            react_1.default.createElement(galleryContainerNew_js_1.default, tslib_1.__assign({}, this.renderProps()))));
    };
    return ProGallery;
}(galleryComponent_1.GalleryComponent));
exports.default = ProGallery;
//# sourceMappingURL=proGallery.js.map