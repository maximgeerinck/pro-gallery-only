"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function findNeighborItem(itemIdx, dir, layoutItems) {
    var currentItem = layoutItems[itemIdx];
    var neighborItem;
    var findClosestItem = function (currentItemX, currentItemY, condition) {
        var minDistance = null;
        var minDistanceItem = {};
        var itemY;
        var itemX;
        var distance;
        // each(slice(layoutItems, itemIdx - 50, itemIdx + 50), (item) => {
        layoutItems.forEach(function (item) {
            itemY = item.offset.top + item.height / 2;
            itemX = item.offset.left + item.width / 2;
            distance = Math.sqrt(Math.pow(itemY - currentItemY, 2) + Math.pow(itemX - currentItemX, 2));
            if ((minDistance === null || (distance > 0 && distance < minDistance)) &&
                condition(currentItemX, currentItemY, itemX, itemY)) {
                minDistance = distance;
                minDistanceItem = item;
            }
        });
        return minDistanceItem;
    };
    switch (dir) {
        case 'up':
            neighborItem = findClosestItem(currentItem.offset.left + currentItem.width / 2, currentItem.offset.top, function (curX, curY, itmX, itmY) { return itmY < curY; });
            break;
        case 'left':
            neighborItem = findClosestItem(currentItem.offset.left, currentItem.offset.top + currentItem.height / 2, function (curX, curY, itmX) { return itmX < curX; });
            break;
        case 'down':
            neighborItem = findClosestItem(currentItem.offset.left + currentItem.width / 2, currentItem.offset.bottom, function (curX, curY, itmX, itmY) { return itmY > curY; });
            break;
        default:
        case 'right':
            neighborItem = findClosestItem(currentItem.offset.right, currentItem.offset.top + currentItem.height / 2, function (curX, curY, itmX) { return itmX > curX; });
            break;
    }
    if (neighborItem.idx >= 0) {
        return neighborItem.idx;
    }
    else {
        console.warn('Could not find offset for itemIdx', itemIdx, dir);
        return itemIdx; //stay on the same item
    }
}
exports.default = findNeighborItem;
//# sourceMappingURL=layoutUtils.js.map