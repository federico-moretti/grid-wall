(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = global || self, global.ReflowGrid = factory());
}(this, function () { 'use strict';

	function unwrapExports (x) {
		return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x.default : x;
	}

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var dist = createCommonjsModule(function (module, exports) {
	// TODO: test with React
	// TODO: cleanup
	Object.defineProperty(exports, "__esModule", { value: true });
	var ReflowGrid = /** @class */ (function () {
	    function ReflowGrid(_a) {
	        var container = _a.container, childrenWidth = _a.childrenWidth, enableResize = _a.enableResize, resizeDebounceInMs = _a.resizeDebounceInMs, margin = _a.margin, childrenStyleTransition = _a.childrenStyleTransition;
	        this.missingParameter({ container: container, childrenWidth: childrenWidth });
	        this.container = container;
	        this.childrenWidth = childrenWidth;
	        this.margin = margin || 'center';
	        this.columnsHeight = [];
	        this.childrenHeights = {};
	        this.childLastId = 0;
	        this.enableResize = enableResize || false;
	        this.resizeDebounceInMs = resizeDebounceInMs || 100;
	        this.containerClassName = 'rg-container';
	        this.childrenStyleTransition = childrenStyleTransition || 'transform ease-in 0.2s';
	        // we have to apply styles to DOM before doing any calculation
	        this.addStyleToDOM();
	        this.children = this.getChildren();
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
	        if (this.margin === 'right')
	            return 0;
	        if (this.columnsCount <= 1)
	            return 0;
	        var remainingSpace = this.containerWidth - this.columnsCount * this.childrenWidth;
	        if (this.margin === 'left')
	            return remainingSpace;
	        return Math.floor(remainingSpace / 2);
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
	                _this.childLastId = _this.childLastId + 1;
	                id = _this.childLastId.toString();
	                child.setAttribute('data-rg-id', id);
	            }
	            _this.childrenHeights[id] = child.offsetHeight;
	        });
	    };
	    ReflowGrid.prototype.resetColumnsHeight = function () {
	        this.columnsHeight = [];
	    };
	    ReflowGrid.prototype.addStyleToDOM = function () {
	        var head = document.querySelector('head');
	        if (head) {
	            var style = document.createElement('style');
	            var css = document.createTextNode("/* reflow grid */" +
	                ("." + this.containerClassName + "{") +
	                "  box-sizing:content-box;" +
	                "}" +
	                ("." + this.containerClassName + ">*{") +
	                "  box-sizing:border-box;" +
	                "  position:absolute;" +
	                ("  transition:" + this.childrenStyleTransition + ";") +
	                "}");
	            style.appendChild(css);
	            head.appendChild(style);
	        }
	    };
	    ReflowGrid.prototype.setWidth = function (element, width) {
	        element.style.width = width + "px";
	    };
	    ReflowGrid.prototype.getChildren = function () {
	        var children = [];
	        if (this.container.children.length > 0) {
	            Array.from(this.container.children).forEach(function (child) {
	                if (child instanceof HTMLElement) {
	                    children.push(child);
	                }
	            });
	        }
	        return children;
	    };
	    ReflowGrid.prototype.setChildrenWidth = function () {
	        var _this = this;
	        if (this.children.length > 0) {
	            this.children.forEach(function (child) {
	                _this.setWidth(child, _this.childrenWidth);
	            });
	        }
	    };
	    ReflowGrid.prototype.addMutationObserverToContainer = function () {
	        var _this = this;
	        var containerObserver = new MutationObserver(function (m) { return _this.handleContainerMutation(m); });
	        containerObserver.observe(this.container, { childList: true });
	    };
	    ReflowGrid.prototype.addMutationObserverToChildren = function () {
	        var _this = this;
	        if (this.children.length > 0) {
	            this.children.forEach(function (child) {
	                var containerObserver = new MutationObserver(function (m) { return _this.handleChildrenMutation(m); });
	                containerObserver.observe(child, { attributes: true });
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
	            if (child.style.transform !== transform)
	                child.style.transform = transform;
	        });
	        this.container.style.height = this.getMaxHeight() + 'px';
	        this.setChildrenHeight();
	    };
	    ReflowGrid.prototype.resize = function (containerWidth) {
	        this.containerWidth = containerWidth;
	        this.columnsCount = Math.floor(this.containerWidth / this.childrenWidth);
	        this.marginWidth = this.calculateMargin();
	        this.resetColumnsHeight();
	        this.reflow();
	    };
	    ReflowGrid.prototype.handleChildrenMutation = function (mutations) {
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
	    ReflowGrid.prototype.handleContainerMutation = function (mutations) {
	        var _this = this;
	        mutations.forEach(function (mutation) {
	            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
	                mutation.addedNodes.forEach(function (child) {
	                    if (child instanceof HTMLElement)
	                        _this.setWidth(child, _this.childrenWidth);
	                });
	                _this.children = _this.getChildren();
	                _this.reflow();
	            }
	        });
	    };
	    return ReflowGrid;
	}());
	exports.default = ReflowGrid;
	});

	var index = unwrapExports(dist);

	return index;

}));
