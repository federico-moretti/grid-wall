"use strict";
// TODO: we may use parallel() to use multiple animation type, like tween and spring
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
var defaultAnimations = {
    onEnter: {
        translate: false,
        from: { opacity: 0, scale: 0.5 },
        to: { opacity: 1, scale: 1 },
    },
    onChange: { translate: true },
    onExit: {
        from: { opacity: 1, scale: 1 },
        to: { opacity: 0, scale: 0.75 },
        duration: 200,
    },
};
var Tile = /** @class */ (function () {
    function Tile(_a) {
        var element = _a.element, id = _a.id;
        this.id = id;
        this.element = element;
        this.styler = stylefire_1.default(element);
        this.firstRender = true;
        this.x = 0;
        this.y = 0;
        this.onEnterAnimations = { from: {}, to: {} };
        this.onChangeAnimations = { from: {}, to: {} };
        this.onExitAnimations = { from: {}, to: {} };
        this.element.style.transform = 'translateX(0px) translateY(0px)';
        this.element.setAttribute('data-gw-id', id.toString());
    }
    Tile.prototype.setCoords = function (x, y) {
        this.x = x;
        this.y = y;
    };
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
        // debugger;
        if (!params)
            throw new Error('Missing mandatory parameters!');
        var container = params.container, childrenWidthInPx = params.childrenWidthInPx, enableResize = params.enableResize, resizeDebounceInMs = params.resizeDebounceInMs, margin = params.margin, onEnter = params.onEnter, onChange = params.onChange, onExit = params.onExit, _a = params.springProperties, springProperties = _a === void 0 ? { stiffness: 120, damping: 14, mass: 1 } : _a;
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
        this.onEnter = typeof onEnter === 'undefined' ? defaultAnimations.onEnter : null;
        this.onChange = typeof onChange === 'undefined' ? defaultAnimations.onChange : null;
        this.onExit = typeof onExit === 'undefined' ? defaultAnimations.onExit : null;
        this.springProperties = springProperties;
        // we have to apply styles to DOM before doing any calculation
        this.addStyleToDOM();
        this.children = this.getInitialChildren();
        this.container.classList.add(this.containerClassName);
        this.containerWidth = this.container.clientWidth;
        this.columnsCount = Math.floor(this.containerWidth / this.childrenWidth);
        this.setChildrenWidth();
        this.setChildrenHeight();
        this.listenToResize();
        this.marginWidth = this.calculateMargin();
        this.addMutationObserverToContainer();
        this.addMutationObserverToChildren();
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
    Tiles.prototype.getInitialChildren = function () {
        var _this = this;
        var children = [];
        if (this.container.children.length > 0) {
            Array.from(this.container.children).forEach(function (child) {
                if (child instanceof HTMLElement) {
                    var tile = new Tile({ element: child, id: _this.childLastId + 1 });
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
        this.childLastId = child.id;
        this.children.push(child);
    };
    // after a child is removed, we append it back
    // just to animate it out, then remove it for real and reflow
    // this feels kinda hacky but it works
    Tiles.prototype._handleRemoveChild = function (element) {
        var _this = this;
        if (this.onExit) {
            element.setAttribute('data-gw-removing', 'true');
            this.container.appendChild(element);
            var from = __assign({}, this.onExit.from);
            var to = __assign({}, this.onExit.to);
            var duration = this.onExit.duration || 150;
            if (Object.keys(from).length > 0 && Object.keys(to).length > 0) {
                var animation = popmotion_1.tween({
                    from: from,
                    to: to,
                    duration: duration,
                });
                animation.start({
                    update: function (v) { return stylefire_1.default(element).set(v); },
                    complete: function () {
                        element.setAttribute('data-gw-removing', 'false');
                        element.remove();
                        _this._removeChild(element);
                        _this.reflow();
                    },
                });
            }
        }
        else {
            this._removeChild(element);
        }
    };
    Tiles.prototype._removeChild = function (element) {
        var id = element.getAttribute('data-gw-id');
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
            // TODO: move logic to Tile
            // child.move(x, y)
            _this.moveChild({ child: child, x: x, y: y });
            child.setCoords(x, y);
            // child.firstRender = false;
        });
        this.container.style.height = Tiles.getMaxHeight(this.columnsHeight) + 'px';
        this.setChildrenHeight();
    };
    Tiles.prototype.moveChild = function (_a) {
        var child = _a.child, x = _a.x, y = _a.y;
        var animation = null;
        var from = {};
        var to = {};
        var fromTranslate = {};
        var toTranslate = {};
        if (child.firstRender && this.onEnter) {
            from = __assign({}, this.onEnter.from);
            to = __assign({}, this.onEnter.to);
        }
        else if (this.onChange) {
            from = __assign({}, this.onChange.from);
            to = __assign({}, this.onChange.to);
        }
        if ((this.onChange && this.onChange.translate && !child.firstRender) ||
            (this.onEnter && this.onEnter.translate && child.firstRender)) {
            // if we are moving the child to a new position
            // get the new position and restart the animation
            // else we leave x and y null so it ends the running animation
            // without starting a new one
            if (x !== child.x || y !== child.y) {
                var oldCoords = { x: 0, y: 0 };
                if (child.element.style.transform) {
                    var regexTransform = /translateX\((-?\d+)?.\w+\).+translateY\((-?\d+)?.\w+\)/;
                    var match = child.element.style.transform.match(regexTransform);
                    if (match && match[1] && match[2]) {
                        oldCoords.x = parseInt(match[1]);
                        oldCoords.y = parseInt(match[2]);
                    }
                }
                fromTranslate = { x: oldCoords.x, y: oldCoords.y };
                toTranslate = { x: x, y: y };
            }
        }
        else {
            // console.log('set', { x, y });
            child.styler.set({ x: x, y: y });
            // console.log(child.element.style.transform);
        }
        from = __assign({}, from, fromTranslate);
        to = __assign({}, to, toTranslate);
        if (Object.keys(from).length > 0 && Object.keys(to).length > 0) {
            animation = popmotion_1.spring(__assign({ from: from,
                to: to }, this.springProperties));
            if (child.animationStop && !child.firstRender)
                child.animationStop.stop();
            if (x !== child.x || y !== child.y) {
                child.animationStop = animation.start({
                    update: function (v) { return child.styler.set(v); },
                    complete: function () { return (child.firstRender = false); },
                });
            }
        }
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
                mutation.addedNodes.forEach(function (element) {
                    if (element instanceof HTMLElement) {
                        if (element.getAttribute('data-gw-removing') === 'true') {
                            if (callback && typeof callback === 'function')
                                callback();
                            return;
                        }
                        var tile = new Tile({ element: element, id: _this.childLastId + 1 });
                        Tiles.setWidth(tile, _this.childrenWidth);
                        _this._addChild(tile);
                    }
                });
                mutation.removedNodes.forEach(function (element) {
                    if (element instanceof HTMLElement) {
                        if (element.getAttribute('data-gw-removing') === 'false') {
                            if (callback && typeof callback === 'function')
                                callback();
                            return;
                        }
                        _this._handleRemoveChild(element);
                    }
                });
                _this.reflow();
            }
        });
        if (callback && typeof callback === 'function')
            callback();
    };
    return Tiles;
}());
exports.default = Tiles;
