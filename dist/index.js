"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var popmotion_1 = require("popmotion");
var stylefire_1 = require("stylefire");
// interface ChildElement extends HTMLElement {
//   animations?: Action[];
//   animationStop?: ColdSubscription;
//   firstRender?: boolean;
// }
var Tile = /** @class */ (function () {
    function Tile(element) {
        this.element = element;
        this.styler = stylefire_1.default(element);
        this.firstRender = true;
        this.x = 0;
        this.y = 0;
        this.onEnterAnimations = { from: {}, to: {} };
    }
    return Tile;
}());
var Tiles = /** @class */ (function () {
    function Tiles(params) {
        var _this = this;
        this.addAfterStyle = function (event) {
            if (event.target instanceof HTMLElement) {
                event.target.setAttribute('data-gw-transition', 'true');
                event.target.removeEventListener('transitionend', _this.addAfterStyle, true);
            }
        };
        if (!params)
            throw new Error('Missing mandatory parameters!');
        var container = params.container, childrenWidthInPx = params.childrenWidthInPx, enableResize = params.enableResize, resizeDebounceInMs = params.resizeDebounceInMs, margin = params.margin, _a = params.onEnter, onEnter = _a === void 0 ? {
            // types: ['tween'],
            // properties: ['opacity', 'scale'],
            from: { opacity: 0, scale: 0.5 },
            to: { opacity: 1, scale: 1 },
        } : _a, 
        // onChange = { types: ['spring'], properties: ['position'] } as Animations,
        _b = params.onExit, 
        // onChange = { types: ['spring'], properties: ['position'] } as Animations,
        onExit = _b === void 0 ? { types: ['tween'], from: { opacity: 1 }, to: { opacity: 0 } } : _b;
        this.missingParameter({ container: container, childrenWidthInPx: childrenWidthInPx });
        this.container = container;
        this.childrenWidth = childrenWidthInPx;
        this.margin = margin || 'center';
        this.columnsHeight = [];
        this.childrenHeights = {};
        this.childLastId = 0;
        this.enableResize = enableResize || false;
        this.resizeDebounceInMs = resizeDebounceInMs || 100;
        this.containerClassName = 'gw-container';
        this.onEnter = onEnter;
        // this.onChange = onChange;
        this.positionAnimationEnabled = this.isPositionAnimationEnabled();
        this.onExit = onExit;
        this.springProperties = { stiffness: 120, damping: 14, mass: 1 };
        // we have to apply styles to DOM before doing any calculation
        this.addStyleToDOM();
        this.children = this.getInitialChildren();
        this.container.classList.add(this.containerClassName);
        this.containerWidth = this.container.clientWidth;
        this.columnsCount = Math.floor(this.containerWidth / this.childrenWidth);
        this.setChildrenWidth();
        this.setChildrenHeight();
        // this.setInitialChildrenTransition();
        this.listenToResize();
        this.marginWidth = this.calculateMargin();
        this.addMutationObserverToContainer();
        this.addMutationObserverToChildren();
        // spring({ from: 0, to: 110 }).start((v: number) => console.log(v));
        this.reflow();
    }
    Tiles.prototype.missingParameter = function (params) {
        var missingParams = [];
        Object.entries(params).forEach(function (_a) {
            var name = _a[0], param = _a[1];
            if (!param)
                missingParams.push(name);
        });
        if (missingParams.length > 0) {
            var parameter = "parameter" + (missingParams.length > 1 ? 's' : '');
            var message_1 = "Missing " + missingParams.length + " mandatory " + parameter + ":";
            missingParams.forEach(function (name) { return (message_1 += "\n  " + name); });
            throw new Error(message_1);
        }
    };
    Tiles.prototype.calculateMargin = function () {
        if (this.margin === 'right')
            return 0;
        if (this.columnsCount <= 1)
            return 0;
        var count = this.children.length > this.columnsCount ? this.columnsCount : this.children.length;
        var remainingSpace = this.containerWidth - count * this.childrenWidth;
        if (this.margin === 'left')
            return remainingSpace;
        return Math.floor(remainingSpace / 2);
    };
    Tiles.debounce = function (callback, wait) {
        var interval;
        return function () {
            clearTimeout(interval);
            interval = setTimeout(callback, wait);
        };
    };
    Tiles.prototype.listenToResize = function () {
        var _this = this;
        if (this.enableResize) {
            var wait = this.resizeDebounceInMs;
            window.addEventListener('resize', Tiles.debounce(function () { return _this.resize(_this.container.clientWidth); }, wait));
        }
    };
    Tiles.prototype.setChildId = function (child) {
        this.childLastId = this.childLastId + 1;
        var id = this.childLastId.toString();
        child.element.setAttribute('data-gw-id', id);
        return id;
    };
    Tiles.prototype.setChildrenHeight = function () {
        var _this = this;
        this.children.forEach(function (child) {
            var id = child.element.getAttribute('data-gw-id');
            if (!id)
                id = _this.setChildId(child);
            _this.childrenHeights[id] = child.element.offsetHeight;
        });
    };
    Tiles.prototype.isPositionAnimationEnabled = function () {
        return true;
        // return Boolean(this.onChange.properties.find(property => property === 'position'));
    };
    Tiles.prototype.resetColumnsHeight = function () {
        this.columnsHeight = [];
    };
    Tiles.prototype.addStyleToDOM = function () {
        var head = document.querySelector('head');
        if (head) {
            var style = document.createElement('style');
            style.id = 'grid-wall-style';
            var css = document.createTextNode("/* grid-wall */" +
                ("." + this.containerClassName + "{") +
                "  box-sizing:content-box;" +
                "}" +
                ("." + this.containerClassName + ">*{") +
                "  box-sizing:border-box;" +
                "  position:absolute;" +
                "}");
            style.appendChild(css);
            head.appendChild(style);
        }
    };
    Tiles.setWidth = function (element, width) {
        element.element.style.width = width + "px";
    };
    Tiles.addStyles = function (element, styles) {
        for (var property in styles) {
            if (element.element.style.hasOwnProperty(property)) {
                element.element.style[property] = styles[property];
            }
        }
    };
    Tiles.prototype.removeChild = function (index, callback) {
        // remove children with animation
        // on animation end do callback
    };
    Tiles.prototype.getInitialChildren = function () {
        var _this = this;
        var children = [];
        if (this.container.children.length > 0) {
            Array.from(this.container.children).forEach(function (child) {
                if (child instanceof HTMLElement) {
                    var tile = new Tile(child);
                    tile.firstRender = true;
                    tile.element.style.transform = 'translateX(0px) translateY(0px)';
                    _this.setChildId(tile);
                    children.push(tile);
                }
            });
        }
        return children;
    };
    Tiles.prototype._addChild = function (child) {
        // const animation = spring({
        //   from: this.onEnter.from,
        //   to: this.onEnter.to,
        //   ...this.springProperties,
        // });
        // animation.start((v: any) => child.styler.set(v));
        var elem = child;
        elem.onEnterAnimations = { from: this.onEnter.from, to: this.onEnter.to };
        elem.firstRender = true;
        this.children.push(child);
    };
    Tiles.prototype._removeChild = function (child) {
        var id = child.element.getAttribute('data-gw-id');
        this.children = this.children.filter(function (c) { return c.element.getAttribute('data-gw-id') !== id; });
    };
    Tiles.prototype.setChildrenWidth = function () {
        var _this = this;
        if (this.children.length > 0) {
            this.children.forEach(function (child) {
                Tiles.setWidth(child, _this.childrenWidth);
            });
        }
    };
    Tiles.prototype.addMutationObserverToContainer = function () {
        var _this = this;
        var containerObserver = new MutationObserver(function (m) { return _this.handleContainerMutation(m); });
        containerObserver.observe(this.container, { childList: true });
    };
    Tiles.prototype.addMutationObserverToChildren = function () {
        var _this = this;
        if (this.children.length > 0) {
            this.children.forEach(function (child) {
                var containerObserver = new MutationObserver(function (m) { return _this.handleChildrenMutation(m); });
                containerObserver.observe(child.element, { attributes: true });
            });
        }
    };
    Tiles.prototype.getLowerColumn = function () {
        var lower = { index: 0, height: 0 };
        if (this.columnsHeight.length > 0) {
            this.columnsHeight.forEach(function (height, index) {
                if (lower.height === 0 || lower.height > height) {
                    lower.height = height;
                    lower.index = index;
                }
            });
        }
        return lower;
    };
    Tiles.getMaxHeight = function (columnsHeight) {
        return Math.max.apply(Math, columnsHeight);
    };
    Tiles.prototype.reflow = function () {
        var _this = this;
        this.resetColumnsHeight();
        this.marginWidth = this.calculateMargin();
        this.children.forEach(function (child, index) {
            var column = index;
            var x = column * _this.childrenWidth + _this.marginWidth;
            var y = 0;
            if ((column + 1) * _this.childrenWidth >= _this.containerWidth) {
                var lowerColumn = _this.getLowerColumn();
                column = lowerColumn.index;
                x = _this.marginWidth + column * _this.childrenWidth;
                y = lowerColumn.height;
            }
            _this.columnsHeight[column] = Number.isInteger(_this.columnsHeight[column])
                ? _this.columnsHeight[column] + child.element.offsetHeight
                : child.element.offsetHeight;
            var from = {};
            var to = {};
            if (child.firstRender) {
                from = __assign({}, child.onEnterAnimations.from);
                to = __assign({}, child.onEnterAnimations.to);
            }
            var coords = [0, 0];
            if (child.element.style.transform) {
                var regexTransform = /translateX\((\d+)?.\w+\).+translateY\((\d+)?.\w+\)/;
                var match = child.element.style.transform.match(regexTransform);
                if (match && match[1] && match[2])
                    coords = [parseInt(match[1]), parseInt(match[2])];
            }
            if (_this.positionAnimationEnabled) {
                var animation = popmotion_1.spring(__assign({ from: __assign({}, from, { x: coords[0], y: coords[1] }), to: __assign({}, to, { x: x, y: y }) }, _this.springProperties));
                if (child.animationStop)
                    child.animationStop.stop();
                animation.start(function (v) { return child.styler.set(v); });
            }
            // } else {
            //   child.element.style.transform = transform;
            // }
            child.x = x;
            child.y = y;
            child.firstRender = false;
        });
        this.container.style.height = Tiles.getMaxHeight(this.columnsHeight) + 'px';
        this.setChildrenHeight();
    };
    Tiles.prototype.resize = function (containerWidthInPx) {
        if (!containerWidthInPx && !Number.isNaN(containerWidthInPx)) {
            throw new Error('Width must be a number and more than 0');
        }
        this.containerWidth = containerWidthInPx;
        this.columnsCount = Math.floor(this.containerWidth / this.childrenWidth);
        this.reflow();
    };
    Tiles.prototype.handleChildrenMutation = function (mutations, callback) {
        var _this = this;
        mutations.forEach(function (mutation) {
            var elem = mutation.target;
            var id = elem.getAttribute('data-gw-id');
            if (id) {
                var storedHeight = _this.childrenHeights[id];
                if (storedHeight !== elem.offsetHeight) {
                    _this.reflow();
                }
            }
        });
        if (callback && typeof callback === 'function')
            callback();
    };
    Tiles.prototype.handleContainerMutation = function (mutations, callback) {
        var _this = this;
        mutations.forEach(function (mutation) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(function (elem) {
                    if (elem instanceof HTMLElement) {
                        var tile = new Tile(elem);
                        Tiles.setWidth(tile, _this.childrenWidth);
                        tile.element.style.transform = 'translateX(0px) translateY(0px)';
                        _this.setChildId(tile);
                        _this._addChild(tile);
                    }
                });
                mutation.removedNodes.forEach(function (elem) {
                    if (elem instanceof HTMLElement) {
                        var tile = new Tile(elem);
                        _this._removeChild(tile);
                    }
                });
                // this.children = this.getChildren();
                _this.reflow();
            }
        });
        if (callback && typeof callback === 'function')
            callback();
    };
    return Tiles;
}());
exports.default = Tiles;
