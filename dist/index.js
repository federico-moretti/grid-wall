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
var GridWall = /** @class */ (function () {
    function GridWall(params) {
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
            types: ['tween'],
            properties: ['opacity', 'transform'],
            from: [0, 'scale(0.5)'],
            to: [1, 'scale(1)'],
        } : _a, _b = params.onChange, onChange = _b === void 0 ? { types: ['spring'], properties: ['position'] } : _b, _c = params.onExit, onExit = _c === void 0 ? { types: ['tween'], properties: ['opacity'], from: [1], to: [0] } : _c;
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
        this.onChange = onChange;
        this.positionAnimationEnabled = this.isPositionAnimationEnabled();
        this.onExit = onExit;
        this.springProperties = { stiffness: 100, damping: 14, mass: 1 };
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
    GridWall.prototype.missingParameter = function (params) {
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
    GridWall.prototype.calculateMargin = function () {
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
    GridWall.debounce = function (callback, wait) {
        var interval;
        return function () {
            clearTimeout(interval);
            interval = setTimeout(callback, wait);
        };
    };
    GridWall.prototype.listenToResize = function () {
        var _this = this;
        if (this.enableResize) {
            var wait = this.resizeDebounceInMs;
            window.addEventListener('resize', GridWall.debounce(function () { return _this.resize(_this.container.clientWidth); }, wait));
        }
    };
    GridWall.prototype.setChildId = function (child) {
        this.childLastId = this.childLastId + 1;
        var id = this.childLastId.toString();
        child.setAttribute('data-gw-id', id);
        return id;
    };
    GridWall.prototype.setChildrenHeight = function () {
        var _this = this;
        this.children.forEach(function (child) {
            var id = child.getAttribute('data-gw-id');
            if (!id)
                id = _this.setChildId(child);
            _this.childrenHeights[id] = child.offsetHeight;
        });
    };
    GridWall.prototype.isPositionAnimationEnabled = function () {
        return Boolean(this.onChange.properties.find(function (property) { return property === 'position'; }));
    };
    GridWall.prototype.resetColumnsHeight = function () {
        this.columnsHeight = [];
    };
    GridWall.prototype.addStyleToDOM = function () {
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
    GridWall.setWidth = function (element, width) {
        element.style.width = width + "px";
    };
    GridWall.addStyles = function (element, styles) {
        for (var property in styles) {
            if (element.style.hasOwnProperty(property)) {
                element.style[property] = styles[property];
            }
        }
    };
    GridWall.prototype.removeChild = function (index, callback) {
        // remove children with animation
        // on animation end do callback
    };
    GridWall.prototype.getInitialChildren = function () {
        var _this = this;
        var children = [];
        if (this.container.children.length > 0) {
            Array.from(this.container.children).forEach(function (child) {
                if (child instanceof HTMLElement) {
                    var elem = child;
                    elem.firstRender = true;
                    elem.style.transform = 'translate(0px, 0px)';
                    _this.setChildId(elem);
                    children.push(elem);
                }
            });
        }
        return children;
    };
    GridWall.prototype._addChild = function (child) {
        var _this = this;
        var animation = popmotion_1.spring(__assign({ from: this.onEnter.from, to: this.onEnter.to }, this.springProperties));
        animation.start(function (v) {
            _this.onEnter.properties.forEach(function (property, i) {
                if (property === 'transform')
                    return;
                child.style[property] = v[i];
            });
        });
        var elem = child;
        elem.firstRender = true;
        this.children.push(child);
    };
    GridWall.prototype._removeChild = function (child) {
        var id = child.getAttribute('data-gw-id');
        this.children = this.children.filter(function (c) { return c.getAttribute('data-gw-id') !== id; });
    };
    GridWall.prototype.setChildrenWidth = function () {
        var _this = this;
        if (this.children.length > 0) {
            this.children.forEach(function (child) {
                GridWall.setWidth(child, _this.childrenWidth);
            });
        }
    };
    GridWall.prototype.addMutationObserverToContainer = function () {
        var _this = this;
        var containerObserver = new MutationObserver(function (m) { return _this.handleContainerMutation(m); });
        containerObserver.observe(this.container, { childList: true });
    };
    GridWall.prototype.addMutationObserverToChildren = function () {
        var _this = this;
        if (this.children.length > 0) {
            this.children.forEach(function (child) {
                var containerObserver = new MutationObserver(function (m) { return _this.handleChildrenMutation(m); });
                containerObserver.observe(child, { attributes: true });
            });
        }
    };
    GridWall.prototype.getLowerColumn = function () {
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
    GridWall.getMaxHeight = function (columnsHeight) {
        return Math.max.apply(Math, columnsHeight);
    };
    GridWall.prototype.reflow = function () {
        var _this = this;
        this.resetColumnsHeight();
        this.marginWidth = this.calculateMargin();
        this.children.forEach(function (child, index) {
            var column = index;
            var childStyler = popmotion_1.styler(child);
            var transform = "translate(" + (column * _this.childrenWidth + _this.marginWidth) + "px, 0px)";
            if ((column + 1) * _this.childrenWidth >= _this.containerWidth) {
                var lowerColumn = _this.getLowerColumn();
                column = lowerColumn.index;
                var x = column * _this.childrenWidth;
                transform = "translate(" + (_this.marginWidth + x) + "px, " + lowerColumn.height + "px)";
            }
            _this.columnsHeight[column] = Number.isInteger(_this.columnsHeight[column])
                ? _this.columnsHeight[column] + child.offsetHeight
                : child.offsetHeight;
            if (_this.positionAnimationEnabled && !child.firstRender) {
                var oldTransform = child.style.transform;
                var animation = popmotion_1.spring(__assign({ from: [oldTransform], to: [transform] }, _this.springProperties));
                if (child.animationStop)
                    child.animationStop.stop();
                child.animationStop = animation.start(function (v) { return (child.style.transform = v[0]); });
            }
            else {
                child.style.transform = transform;
            }
            child.firstRender = false;
        });
        this.container.style.height = GridWall.getMaxHeight(this.columnsHeight) + 'px';
        this.setChildrenHeight();
    };
    GridWall.prototype.resize = function (containerWidthInPx) {
        if (!containerWidthInPx && !Number.isNaN(containerWidthInPx)) {
            throw new Error('Width must be a number and more than 0');
        }
        this.containerWidth = containerWidthInPx;
        this.columnsCount = Math.floor(this.containerWidth / this.childrenWidth);
        this.reflow();
    };
    GridWall.prototype.handleChildrenMutation = function (mutations, callback) {
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
    GridWall.prototype.handleContainerMutation = function (mutations, callback) {
        var _this = this;
        mutations.forEach(function (mutation) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(function (child) {
                    if (child instanceof HTMLElement) {
                        GridWall.setWidth(child, _this.childrenWidth);
                        child.style.transform = 'translate(0px, 0px)';
                        _this.setChildId(child);
                        _this._addChild(child);
                    }
                });
                mutation.removedNodes.forEach(function (child) {
                    if (child instanceof HTMLElement) {
                        _this._removeChild(child);
                    }
                });
                // this.children = this.getChildren();
                _this.reflow();
            }
        });
        if (callback && typeof callback === 'function')
            callback();
    };
    return GridWall;
}());
exports.default = GridWall;
