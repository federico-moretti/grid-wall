(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = global || self, global.ReflowGrid = factory());
}(this, function () { 'use strict';

    var ReflowGrid = /** @class */ (function () {
        function ReflowGrid(_a) {
            var container = _a.container, containerWidth = _a.containerWidth, itemWidth = _a.itemWidth;
            this.container = container;
            console.log('init');
            this.execute(containerWidth, itemWidth);
        }
        ReflowGrid.prototype.setWidth = function (element, width) {
            console.log(width);
            element.style.width = width + "px";
        };
        ReflowGrid.prototype.setChildrenWidth = function (element, width) {
            var _this = this;
            console.log(element.children.length);
            if (element.children.length > 0) {
                Array.from(element.children).forEach(function (child) {
                    _this.setWidth(child, width);
                });
            }
        };
        ReflowGrid.prototype.execute = function (containerWidth, itemWidth) {
            console.log('execute!');
            this.setWidth(this.container, containerWidth);
            this.setChildrenWidth(this.container, itemWidth);
        };
        ReflowGrid.prototype.position = function () { };
        return ReflowGrid;
    }());

    return ReflowGrid;

}));
