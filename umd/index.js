(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = global || self, global.ReflowGrid = factory());
}(this, function () { 'use strict';

    // TODO: test with React
    // TODO: cleanup
    var ReflowGrid = /** @class */ (function () {
        function ReflowGrid(_a) {
            var container = _a.container, itemWidth = _a.itemWidth, enableResize = _a.enableResize, resizeDebounceInMs = _a.resizeDebounceInMs, centerItems = _a.centerItems;
            var _this = this;
            this.missingParameter({ container: container, itemWidth: itemWidth });
            this.container = container;
            this.container.classList.add('_rg_container');
            this.children = Array.from(container.children);
            this.centerItems = Boolean(centerItems);
            this.addClassesToDOM();
            this.containerWidth = this.container.clientWidth;
            this.itemWidth = itemWidth;
            this.columnsCount = Math.floor(this.containerWidth / this.itemWidth);
            this.columnsHeight = {};
            this.initColumnsHeight();
            this.margin = this.calculateMargin();
            this.setChildrenWidth(this.container, this.itemWidth);
            this.enableResize = enableResize || false;
            this.resizeDebounceInMs = resizeDebounceInMs || 100;
            this.listenToResize();
            this.position();
            var containerObserver = new MutationObserver(function (m, o) { return _this.handleContainerMutation(m, o); });
            containerObserver.observe(this.container, { childList: true });
        }
        ReflowGrid.prototype.missingParameter = function (params) {
            var missingParams = [];
            Object.entries(params).forEach(function (_a) {
                var name = _a[0], param = _a[1];
                if (!param)
                    missingParams.push(name);
            });
            if (missingParams.length > 0) {
                var parameter = "parameter" + (missingParams.length > 1 ? 's' : '');
                var message_1 = "Missing " + missingParams.length + " " + parameter + ":";
                missingParams.forEach(function (name) { return (message_1 += "\n  " + name); });
                throw new Error(message_1);
            }
        };
        ReflowGrid.prototype.calculateMargin = function () {
            if (!this.centerItems)
                return 0;
            if (this.columnsCount <= 1)
                return 0;
            return Math.floor((this.containerWidth - this.columnsCount * this.itemWidth) / 2);
        };
        ReflowGrid.prototype.debounce = function (callback, wait) {
            var interval;
            return function () {
                clearTimeout(interval);
                interval = setTimeout(callback, wait);
            };
        };
        ReflowGrid.prototype.listenToResize = function () {
            var _this = this;
            if (this.enableResize) {
                var wait = this.resizeDebounceInMs;
                window.addEventListener('resize', this.debounce(function () { return _this.resize(_this.container.clientWidth); }, wait));
            }
        };
        ReflowGrid.prototype.initColumnsHeight = function () {
            var _this = this;
            Array.from(Array(this.columnsCount)).forEach(function (_, index) {
                _this.columnsHeight[index + 1] = 0;
            });
        };
        ReflowGrid.prototype.addClassesToDOM = function () {
            var head = document.querySelector('head');
            if (head) {
                var style = document.createElement('style');
                var css = document.createTextNode("\n      /* reflow grid classes */\n      ._rg_container {box-sizing:content-box;}\n      ._rg_container > * {box-sizing:border-box;position:absolute;transition:transform ease-in 0.2s;}\n      ");
                style.appendChild(css);
                head.appendChild(style);
            }
        };
        ReflowGrid.prototype.setWidth = function (element, width) {
            element.style.width = width + "px";
        };
        ReflowGrid.prototype.setChildrenWidth = function (element, width) {
            var _this = this;
            if (element.children.length > 0) {
                Array.from(element.children).forEach(function (child) {
                    _this.setWidth(child, width);
                });
            }
        };
        ReflowGrid.prototype.getLowerColumn = function () {
            var columns = Object.entries(this.columnsHeight);
            if (columns.length > 0) {
                return columns.reduce(function (prev, curr) {
                    if (curr[1] >= prev[1])
                        return prev;
                    return curr;
                });
            }
            else {
                return ['1', 0];
            }
        };
        ReflowGrid.prototype.getMaxHeight = function () {
            var heights = Object.values(this.columnsHeight);
            return Math.max.apply(Math, heights);
        };
        ReflowGrid.prototype.position = function () {
            var _this = this;
            this.initColumnsHeight();
            this.children.forEach(function (child, index) {
                var transform = "translate(" + (index * _this.itemWidth + _this.margin) + "px, 0px)";
                var column = index + 1;
                if (column * _this.itemWidth >= _this.containerWidth) {
                    var lowerColumn = _this.getLowerColumn();
                    column = Number.parseInt(lowerColumn[0]);
                    var x = (column - 1) * _this.itemWidth;
                    transform = "translate(" + (_this.margin + x) + "px, " + lowerColumn[1] + "px)";
                }
                _this.columnsHeight[column] += child.offsetHeight;
                if (child.style.transform !== transform)
                    child.style.transform = transform;
            });
            this.container.style.height = this.getMaxHeight() + 'px';
        };
        ReflowGrid.prototype.resize = function (containerWidth) {
            this.containerWidth = containerWidth;
            this.columnsCount = Math.floor(this.containerWidth / this.itemWidth);
            this.margin = this.calculateMargin();
            this.columnsHeight = {};
            this.position();
        };
        ReflowGrid.prototype.handleContainerMutation = function (mutations, observer) {
            var _this = this;
            console.log('mutation');
            mutations.forEach(function (mutation) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(function (child) {
                        if (child instanceof HTMLElement)
                            _this.setWidth(child, _this.itemWidth);
                    });
                    _this.children = Array.from(_this.container.children);
                    _this.position();
                }
            });
        };
        return ReflowGrid;
    }());

    return ReflowGrid;

}));
