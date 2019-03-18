// TODO: test with React
// TODO: cleanup
var ReflowGrid = /** @class */ (function () {
    /**
     * Constructor
     * @resizeDebounceInMs default is 100ms
     */
    function ReflowGrid(_a) {
        var container = _a.container, itemWidth = _a.itemWidth, enableResize = _a.enableResize, resizeDebounceInMs = _a.resizeDebounceInMs;
        var _this = this;
        this.container = container;
        this.enableResize = enableResize || false;
        this.resizeDebounceInMs = resizeDebounceInMs;
        this.container.classList.add('_rg_container');
        this.children = Array.from(container.children);
        this.itemWidth = itemWidth;
        this.addClassesToDOM();
        var containerObserver = new MutationObserver(function (m, o) { return _this.handleContainerMutation(m, o); });
        containerObserver.observe(this.container, { childList: true });
        this.containerWidth = this.container.clientWidth;
        this.columnsCount = Math.floor(this.containerWidth / this.itemWidth);
        this.margin = Math.floor((this.containerWidth - this.columnsCount * this.itemWidth) / 2);
        this.columnsHeight = {};
        this.initColumnsHeight();
        this.listenToResize();
        this.setChildrenWidth(this.container, this.itemWidth);
        this.position();
    }
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
            var wait = this.resizeDebounceInMs || 100;
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
        return columns.reduce(function (prev, curr) {
            if (curr[1] >= prev[1])
                return prev;
            return curr;
        });
    };
    ReflowGrid.prototype.getMaxHeight = function () {
        var heights = Object.values(this.columnsHeight);
        return Math.max.apply(Math, heights);
    };
    ReflowGrid.prototype.position = function () {
        var _this = this;
        this.initColumnsHeight();
        this.children.forEach(function (child, index) {
            // child.classList.add('rg-abs');
            var transform = "translate(" + (index * _this.itemWidth + _this.margin) + "px, 0px)";
            var column = index + 1;
            if (column * _this.itemWidth >= _this.containerWidth) {
                var lowerColumn = _this.getLowerColumn();
                column = Number.parseInt(lowerColumn[0]);
                var x = (column - 1) * _this.itemWidth;
                transform = "translate(" + (_this.margin + x) + "px, " + lowerColumn[1] + "px)";
            }
            console.log(child.offsetHeight, child.clientHeight);
            _this.columnsHeight[column] += child.offsetHeight;
            if (child.style.transform !== transform) {
                child.style.transform = transform;
            }
        });
        this.container.style.height = this.getMaxHeight() + 'px';
        console.log(this.columnsHeight);
    };
    ReflowGrid.prototype.resize = function (containerWidth) {
        this.containerWidth = containerWidth;
        this.columnsCount = Math.floor(this.containerWidth / this.itemWidth);
        this.margin = Math.floor((this.containerWidth - this.columnsCount * this.itemWidth) / 2);
        this.columnsHeight = {};
        // this.setWidth(this.container, this.containerWidth);
        this.position();
    };
    ReflowGrid.prototype.handleContainerMutation = function (mutations, observer) {
        var _this = this;
        console.log('mutation');
        mutations.forEach(function (mutation) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach(function (child) {
                    if (child instanceof HTMLElement) {
                        _this.setWidth(child, _this.itemWidth);
                    }
                });
                _this.children = Array.from(_this.container.children);
                // this.resize(this.containerWidth);
                _this.position();
            }
        });
    };
    return ReflowGrid;
}());
export default ReflowGrid;
