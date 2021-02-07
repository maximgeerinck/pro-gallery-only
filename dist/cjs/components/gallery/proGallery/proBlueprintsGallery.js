"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var react_1 = tslib_1.__importDefault(require("react"));
var galleryContainerExtraNew_js_1 = tslib_1.__importDefault(require("./galleryContainerExtraNew.js"));
var proGallery_1 = tslib_1.__importDefault(require("./proGallery"));
var ProBlueprintsGallery = /** @class */ (function (_super) {
    tslib_1.__extends(ProBlueprintsGallery, _super);
    function ProBlueprintsGallery() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ProBlueprintsGallery.prototype.render = function () {
        return (react_1.default.createElement("div", tslib_1.__assign({}, this.containerProps()),
            react_1.default.createElement(galleryContainerExtraNew_js_1.default, tslib_1.__assign({}, this.renderProps()))));
    };
    return ProBlueprintsGallery;
}(proGallery_1.default));
exports.default = ProBlueprintsGallery;
//# sourceMappingURL=proBlueprintsGallery.js.map