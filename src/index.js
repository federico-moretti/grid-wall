// track changes on dom
// new MutationObserver()
var ReflowGrid = /** @class */ (function () {
    function ReflowGrid(_a) {
        var container = _a.container, containerWidth = _a.containerWidth, itemWidth = _a.itemWidth;
        this.container = container;
        this.children = Array.from(container.children);
        this.itemWidth = itemWidth;
        this.containerWidth = containerWidth;
        this.columnsCount = Math.floor(this.containerWidth / this.itemWidth);
        this.columnsHeight = {};
        console.log('init');
        this.initColumnsHeight();
        console.log(this.columnsHeight);
        this.addClassesToDOM();
        this.execute(containerWidth, itemWidth);
    }
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
            var css = document.createTextNode("\n      /* reflow grid classes */\n      .rg-abs { position: absolute; }\n      ");
            style.appendChild(css);
            head.appendChild(style);
        }
    };
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
        this.position();
    };
    ReflowGrid.prototype.getLowerColumn = function () {
        var columns = Object.entries(this.columnsHeight);
        return columns.reduce(function (prev, curr) {
            console.log(prev, curr);
            if (curr[1] >= prev[1])
                return prev;
            return curr;
        });
    };
    ReflowGrid.prototype.position = function () {
        var _this = this;
        this.container.style.position = 'relative';
        this.children.forEach(function (child, index) {
            child.classList.add('rg-abs');
            var transform = "translateX(" + index * _this.itemWidth + "px)";
            var column = index + 1;
            console.log(index);
            // check lower column
            // then insert the child in the column
            // the update column height
            if (index * _this.itemWidth >= _this.containerWidth) {
                console.log('+ 2nd row');
                var lowerColumn = _this.getLowerColumn();
                column = Number.parseInt(lowerColumn[0]);
                index = index - _this.columnsCount;
                var x = (column - 1) * _this.itemWidth;
                console.log('lowerColumn', lowerColumn);
                transform = "translateX(" + x + "px) translateY(" + lowerColumn[1] + "px)";
            }
            console.log(transform);
            _this.columnsHeight[column] += child.clientHeight;
            console.log(_this.columnsHeight);
            child.style.transform = transform;
        });
    };
    return ReflowGrid;
}());
export default ReflowGrid;
