// TODO: test with React
// TODO: cleanup
var ReflowGrid = /** @class */ (function () {
    function ReflowGrid(_a) {
        var container = _a.container, itemWidth = _a.itemWidth, enableResize = _a.enableResize, resizeDebounceInMs = _a.resizeDebounceInMs, centerItems = _a.centerItems;
        var _this = this;
        this.missingParameter({ container: container, itemWidth: itemWidth });
        this.container = container;
        this.container.classList.add('_rg_container');
        this.children = Array.from(container.childNodes);
        this.centerItems = Boolean(centerItems);
        this.addClassesToDOM();
        this.containerWidth = this.container.clientWidth;
        this.itemWidth = itemWidth;
        this.childrenHeights = {};
        this.columnsCount = Math.floor(this.containerWidth / this.itemWidth);
        this.columnsHeight = [];
        this.margin = this.calculateMargin();
        this.setChildrenWidth(this.itemWidth);
        this.setChildrenHeight();
        this.enableResize = enableResize || false;
        this.resizeDebounceInMs = resizeDebounceInMs || 100;
        this.listenToResize();
        this.reflow();
        var containerObserver = new MutationObserver(function (m, o) { return _this.handleContainerMutation(m, o); });
        containerObserver.observe(this.container, { childList: true });
        this.addMutationObserverToChildren();
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
    ReflowGrid.prototype.setChildrenHeight = function () {
        var _this = this;
        this.children.forEach(function (child) {
            var id = child.getAttribute('data-rg-id');
            if (!id) {
                id = Math.random()
                    .toString(36)
                    .substr(2, 9);
                child.setAttribute('data-rg-id', id);
                _this.childrenHeights[id] = child.offsetHeight;
            }
            else {
                _this.childrenHeights[id] = child.offsetHeight;
            }
        });
    };
    ReflowGrid.prototype.resetColumnsHeight = function () {
        this.columnsHeight = [];
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
    ReflowGrid.prototype.setChildrenWidth = function (width) {
        var _this = this;
        if (this.children.length > 0) {
            this.children.forEach(function (child) {
                _this.setWidth(child, width);
            });
        }
    };
    ReflowGrid.prototype.addMutationObserverToChildren = function () {
        var _this = this;
        if (this.children.length > 0) {
            this.children.forEach(function (child) {
                var containerObserver = new MutationObserver(function (m, o) { return _this.handleChildrenMutation(m, o); });
                containerObserver.observe(child, { attributes: true, attributeOldValue: true });
            });
        }
    };
    ReflowGrid.prototype.getLowerColumn = function () {
        var lower = { index: 0, height: 0 };
        if (this.columnsHeight.length > 0) {
            this.columnsHeight.forEach(function (height, index) {
                if (lower.height === 0 || lower.height >= height) {
                    lower.height = height;
                    lower.index = index;
                }
            });
        }
        return lower;
    };
    ReflowGrid.prototype.getMaxHeight = function () {
        var heights = Object.values(this.columnsHeight);
        return Math.max.apply(Math, heights);
    };
    ReflowGrid.prototype.reflow = function () {
        var _this = this;
        this.resetColumnsHeight();
        this.children.forEach(function (child, index) {
            var column = index;
            var transform = "translate(" + (column * _this.itemWidth + _this.margin) + "px, 0px)";
            if ((column + 1) * _this.itemWidth >= _this.containerWidth) {
                var lowerColumn = _this.getLowerColumn();
                column = lowerColumn.index;
                var x = column * _this.itemWidth;
                transform = "translate(" + (_this.margin + x) + "px, " + lowerColumn.height + "px)";
            }
            _this.columnsHeight[column] = Number.isInteger(_this.columnsHeight[column])
                ? _this.columnsHeight[column] + child.offsetHeight
                : child.offsetHeight;
            if (child.style.transform !== transform)
                child.style.transform = transform;
        });
        this.container.style.height = this.getMaxHeight() + 'px';
        this.setChildrenHeight();
    };
    ReflowGrid.prototype.resize = function (containerWidth) {
        this.containerWidth = containerWidth;
        this.columnsCount = Math.floor(this.containerWidth / this.itemWidth);
        this.margin = this.calculateMargin();
        this.resetColumnsHeight();
        this.reflow();
    };
    ReflowGrid.prototype.handleChildrenMutation = function (mutations, observer) {
        var _this = this;
        mutations.forEach(function (mutation) {
            var elem = mutation.target;
            var id = elem.getAttribute('data-rg-id');
            if (id) {
                var storedHeight = _this.childrenHeights[id];
                if (storedHeight !== elem.offsetHeight)
                    _this.reflow();
            }
        });
    };
    ReflowGrid.prototype.handleContainerMutation = function (mutations, observer) {
        var _this = this;
        mutations.forEach(function (mutation) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach(function (child) {
                    if (child instanceof HTMLElement)
                        _this.setWidth(child, _this.itemWidth);
                });
                _this.children = Array.from(_this.container.children);
                _this.reflow();
            }
        });
    };
    return ReflowGrid;
}());
export default ReflowGrid;
