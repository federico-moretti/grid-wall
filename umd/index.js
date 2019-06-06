(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = global || self, global.GridWall = factory());
}(this, function () { 'use strict';

	var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function unwrapExports (x) {
		return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x.default : x;
	}

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	/*! *****************************************************************************
	Copyright (c) Microsoft Corporation. All rights reserved.
	Licensed under the Apache License, Version 2.0 (the "License"); you may not use
	this file except in compliance with the License. You may obtain a copy of the
	License at http://www.apache.org/licenses/LICENSE-2.0

	THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
	KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
	WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
	MERCHANTABLITY OR NON-INFRINGEMENT.

	See the Apache Version 2.0 License for specific language governing permissions
	and limitations under the License.
	***************************************************************************** */
	/* global Reflect, Promise */

	var extendStatics = function(d, b) {
	    extendStatics = Object.setPrototypeOf ||
	        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
	        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
	    return extendStatics(d, b);
	};

	function __extends(d, b) {
	    extendStatics(d, b);
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	}

	var __assign = function() {
	    __assign = Object.assign || function __assign(t) {
	        for (var s, i = 1, n = arguments.length; i < n; i++) {
	            s = arguments[i];
	            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
	        }
	        return t;
	    };
	    return __assign.apply(this, arguments);
	};

	function __rest(s, e) {
	    var t = {};
	    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
	        t[p] = s[p];
	    if (s != null && typeof Object.getOwnPropertySymbols === "function")
	        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
	            t[p[i]] = s[p[i]];
	    return t;
	}

	/*! *****************************************************************************
	Copyright (c) Microsoft Corporation. All rights reserved.
	Licensed under the Apache License, Version 2.0 (the "License"); you may not use
	this file except in compliance with the License. You may obtain a copy of the
	License at http://www.apache.org/licenses/LICENSE-2.0

	THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
	KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
	WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
	MERCHANTABLITY OR NON-INFRINGEMENT.

	See the Apache Version 2.0 License for specific language governing permissions
	and limitations under the License.
	***************************************************************************** */

	var __assign$1 = function() {
	    __assign$1 = Object.assign || function __assign(t) {
	        for (var s, i = 1, n = arguments.length; i < n; i++) {
	            s = arguments[i];
	            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
	        }
	        return t;
	    };
	    return __assign$1.apply(this, arguments);
	};

	var clamp = function (min, max) { return function (v) {
	    return Math.max(Math.min(v, max), min);
	}; };
	var isFirstChars = function (term) { return function (v) {
	    return typeof v === 'string' && v.indexOf(term) === 0;
	}; };
	var getValueFromFunctionString = function (value) {
	    return value.substring(value.indexOf('(') + 1, value.lastIndexOf(')'));
	};
	var splitCommaDelimited = function (value) {
	    return typeof value === 'string' ? value.split(/,\s*/) : [value];
	};
	var sanitize = function (v) { return (v % 1 ? Number(v.toFixed(5)) : v); };

	var number = {
	    test: function (v) { return typeof v === 'number'; },
	    parse: parseFloat,
	    transform: function (v) { return v; }
	};
	var alpha = __assign$1({}, number, { transform: clamp(0, 1) });
	var scale = __assign$1({}, number, { default: 1 });

	var createUnitType = function (unit) { return ({
	    test: function (v) {
	        return typeof v === 'string' && v.endsWith(unit) && v.split(' ').length === 1;
	    },
	    parse: parseFloat,
	    transform: function (v) { return "" + v + unit; }
	}); };
	var degrees = createUnitType('deg');
	var percent = createUnitType('%');
	var px = createUnitType('px');
	var vh = createUnitType('vh');
	var vw = createUnitType('vw');
	var progressPercentage = __assign$1({}, percent, { parse: function (v) { return percent.parse(v) / 100; }, transform: function (v) { return percent.transform(v * 100); } });

	var clampRgbUnit = clamp(0, 255);
	var onlyColorRegex = /^(#[0-9a-f]{3}|#(?:[0-9a-f]{2}){2,4}|(rgb|hsl)a?\((-?\d+%?[,\s]+){2,3}\s*[\d\.]+%?\))$/i;
	var isRgba = function (v) { return v.red !== undefined; };
	var isHsla = function (v) { return v.hue !== undefined; };
	var splitColorValues = function (terms) {
	    var numTerms = terms.length;
	    return function (v) {
	        if (typeof v !== 'string')
	            return v;
	        var values = {};
	        var valuesArray = splitCommaDelimited(getValueFromFunctionString(v));
	        for (var i = 0; i < numTerms; i++) {
	            values[terms[i]] =
	                valuesArray[i] !== undefined ? parseFloat(valuesArray[i]) : 1;
	        }
	        return values;
	    };
	};
	var rgbaTemplate = function (_a) {
	    var red = _a.red, green = _a.green, blue = _a.blue, _b = _a.alpha, alpha$$1 = _b === void 0 ? 1 : _b;
	    return "rgba(" + red + ", " + green + ", " + blue + ", " + alpha$$1 + ")";
	};
	var hslaTemplate = function (_a) {
	    var hue = _a.hue, saturation = _a.saturation, lightness = _a.lightness, _b = _a.alpha, alpha$$1 = _b === void 0 ? 1 : _b;
	    return "hsla(" + hue + ", " + saturation + ", " + lightness + ", " + alpha$$1 + ")";
	};
	var rgbUnit = __assign$1({}, number, { transform: function (v) { return Math.round(clampRgbUnit(v)); } });
	var testRgbaString = isFirstChars('rgb');
	var rgba = {
	    test: function (v) { return (typeof v === 'string' ? testRgbaString(v) : isRgba(v)); },
	    parse: splitColorValues(['red', 'green', 'blue', 'alpha']),
	    transform: function (_a) {
	        var red = _a.red, green = _a.green, blue = _a.blue, alpha$$1 = _a.alpha;
	        return rgbaTemplate({
	            red: rgbUnit.transform(red),
	            green: rgbUnit.transform(green),
	            blue: rgbUnit.transform(blue),
	            alpha: sanitize(alpha$$1)
	        });
	    }
	};
	var testHslaString = isFirstChars('hsl');
	var hsla = {
	    test: function (v) { return (typeof v === 'string' ? testHslaString(v) : isHsla(v)); },
	    parse: splitColorValues(['hue', 'saturation', 'lightness', 'alpha']),
	    transform: function (_a) {
	        var hue = _a.hue, saturation = _a.saturation, lightness = _a.lightness, alpha$$1 = _a.alpha;
	        return hslaTemplate({
	            hue: Math.round(hue),
	            saturation: percent.transform(sanitize(saturation)),
	            lightness: percent.transform(sanitize(lightness)),
	            alpha: sanitize(alpha$$1)
	        });
	    }
	};
	var hex = __assign$1({}, rgba, { test: isFirstChars('#'), parse: function (v) {
	        var r = '';
	        var g = '';
	        var b = '';
	        if (v.length > 4) {
	            r = v.substr(1, 2);
	            g = v.substr(3, 2);
	            b = v.substr(5, 2);
	        }
	        else {
	            r = v.substr(1, 1);
	            g = v.substr(2, 1);
	            b = v.substr(3, 1);
	            r += r;
	            g += g;
	            b += b;
	        }
	        return {
	            red: parseInt(r, 16),
	            green: parseInt(g, 16),
	            blue: parseInt(b, 16),
	            alpha: 1
	        };
	    } });
	var color = {
	    test: function (v) {
	        return (typeof v === 'string' && onlyColorRegex.test(v)) ||
	            rgba.test(v) ||
	            hsla.test(v) ||
	            hex.test(v);
	    },
	    parse: function (v) {
	        if (rgba.test(v)) {
	            return rgba.parse(v);
	        }
	        else if (hsla.test(v)) {
	            return hsla.parse(v);
	        }
	        else if (hex.test(v)) {
	            return hex.parse(v);
	        }
	        return v;
	    },
	    transform: function (v) {
	        if (isRgba(v)) {
	            return rgba.transform(v);
	        }
	        else if (isHsla(v)) {
	            return hsla.transform(v);
	        }
	        return v;
	    }
	};

	var floatRegex = /(-)?(\d[\d\.]*)/g;
	var colorRegex = /(#[0-9a-f]{6}|#[0-9a-f]{3}|#(?:[0-9a-f]{2}){2,4}|(rgb|hsl)a?\((-?\d+%?[,\s]+){2,3}\s*[\d\.]+%?\))/gi;
	var COLOR_TOKEN = '${c}';
	var NUMBER_TOKEN = '${n}';
	var complex = {
	    test: function (v) {
	        if (typeof v !== 'string' || !isNaN(v))
	            return false;
	        var numValues = 0;
	        var foundNumbers = v.match(floatRegex);
	        var foundColors = v.match(colorRegex);
	        if (foundNumbers)
	            numValues += foundNumbers.length;
	        if (foundColors)
	            numValues += foundColors.length;
	        return numValues > 0;
	    },
	    parse: function (v) {
	        var input = v;
	        var parsed = [];
	        var foundColors = input.match(colorRegex);
	        if (foundColors) {
	            input = input.replace(colorRegex, COLOR_TOKEN);
	            parsed.push.apply(parsed, foundColors.map(color.parse));
	        }
	        var foundNumbers = input.match(floatRegex);
	        if (foundNumbers) {
	            parsed.push.apply(parsed, foundNumbers.map(number.parse));
	        }
	        return parsed;
	    },
	    createTransformer: function (prop) {
	        var template = prop;
	        var token = 0;
	        var foundColors = prop.match(colorRegex);
	        var numColors = foundColors ? foundColors.length : 0;
	        if (foundColors) {
	            for (var i = 0; i < numColors; i++) {
	                template = template.replace(foundColors[i], COLOR_TOKEN);
	                token++;
	            }
	        }
	        var foundNumbers = template.match(floatRegex);
	        var numNumbers = foundNumbers ? foundNumbers.length : 0;
	        if (foundNumbers) {
	            for (var i = 0; i < numNumbers; i++) {
	                template = template.replace(foundNumbers[i], NUMBER_TOKEN);
	                token++;
	            }
	        }
	        return function (v) {
	            var output = template;
	            for (var i = 0; i < token; i++) {
	                output = output.replace(i < numColors ? COLOR_TOKEN : NUMBER_TOKEN, i < numColors ? color.transform(v[i]) : sanitize(v[i]));
	            }
	            return output;
	        };
	    }
	};

	var styleValueTypes_es = /*#__PURE__*/Object.freeze({
		number: number,
		scale: scale,
		alpha: alpha,
		degrees: degrees,
		percent: percent,
		progressPercentage: progressPercentage,
		px: px,
		vw: vw,
		vh: vh,
		rgba: rgba,
		rgbUnit: rgbUnit,
		hsla: hsla,
		hex: hex,
		color: color,
		complex: complex
	});

	var warning = function () { };
	var invariant = function () { };

	var prevTime = 0;
	var onNextFrame = typeof window !== 'undefined' && window.requestAnimationFrame !== undefined
	    ? function (callback) { return window.requestAnimationFrame(callback); }
	    : function (callback) {
	        var timestamp = Date.now();
	        var timeToCall = Math.max(0, 16.7 - (timestamp - prevTime));
	        prevTime = timestamp + timeToCall;
	        setTimeout(function () { return callback(prevTime); }, timeToCall);
	    };

	var createStep = (function (setRunNextFrame) {
	    var processToRun = [];
	    var processToRunNextFrame = [];
	    var numThisFrame = 0;
	    var isProcessing = false;
	    var i = 0;
	    var cancelled = new WeakSet();
	    var toKeepAlive = new WeakSet();
	    var renderStep = {
	        cancel: function (process) {
	            var indexOfCallback = processToRunNextFrame.indexOf(process);
	            cancelled.add(process);
	            if (indexOfCallback !== -1) {
	                processToRunNextFrame.splice(indexOfCallback, 1);
	            }
	        },
	        process: function (frame) {
	            var _a;
	            isProcessing = true;
	            _a = [
	                processToRunNextFrame,
	                processToRun
	            ], processToRun = _a[0], processToRunNextFrame = _a[1];
	            processToRunNextFrame.length = 0;
	            numThisFrame = processToRun.length;
	            if (numThisFrame) {
	                var process_1;
	                for (i = 0; i < numThisFrame; i++) {
	                    process_1 = processToRun[i];
	                    process_1(frame);
	                    if (toKeepAlive.has(process_1) === true && !cancelled.has(process_1)) {
	                        renderStep.schedule(process_1);
	                        setRunNextFrame(true);
	                    }
	                }
	            }
	            isProcessing = false;
	        },
	        schedule: function (process, keepAlive, immediate) {
	            if (keepAlive === void 0) { keepAlive = false; }
	            if (immediate === void 0) { immediate = false; }
	            invariant(typeof process === 'function', 'Argument must be a function');
	            var addToCurrentBuffer = immediate && isProcessing;
	            var buffer = addToCurrentBuffer ? processToRun : processToRunNextFrame;
	            cancelled.delete(process);
	            if (keepAlive)
	                toKeepAlive.add(process);
	            if (buffer.indexOf(process) === -1) {
	                buffer.push(process);
	                if (addToCurrentBuffer)
	                    numThisFrame = processToRun.length;
	            }
	        }
	    };
	    return renderStep;
	});

	var StepId;
	(function (StepId) {
	    StepId["Read"] = "read";
	    StepId["Update"] = "update";
	    StepId["Render"] = "render";
	    StepId["PostRender"] = "postRender";
	    StepId["FixedUpdate"] = "fixedUpdate";
	})(StepId || (StepId = {}));

	var maxElapsed = 40;
	var defaultElapsed = (1 / 60) * 1000;
	var useDefaultElapsed = true;
	var willRunNextFrame = false;
	var isProcessing = false;
	var frame = {
	    delta: 0,
	    timestamp: 0
	};
	var stepsOrder = [
	    StepId.Read,
	    StepId.Update,
	    StepId.Render,
	    StepId.PostRender
	];
	var setWillRunNextFrame = function (willRun) { return (willRunNextFrame = willRun); };
	var _a = stepsOrder.reduce(function (acc, key) {
	    var step = createStep(setWillRunNextFrame);
	    acc.sync[key] = function (process, keepAlive, immediate) {
	        if (keepAlive === void 0) { keepAlive = false; }
	        if (immediate === void 0) { immediate = false; }
	        if (!willRunNextFrame)
	            startLoop();
	        step.schedule(process, keepAlive, immediate);
	        return process;
	    };
	    acc.cancelSync[key] = function (process) { return step.cancel(process); };
	    acc.steps[key] = step;
	    return acc;
	}, {
	    steps: {},
	    sync: {},
	    cancelSync: {}
	}), steps = _a.steps, sync = _a.sync, cancelSync = _a.cancelSync;
	var processStep = function (stepId) { return steps[stepId].process(frame); };
	var processFrame = function (timestamp) {
	    willRunNextFrame = false;
	    frame.delta = useDefaultElapsed
	        ? defaultElapsed
	        : Math.max(Math.min(timestamp - frame.timestamp, maxElapsed), 1);
	    if (!useDefaultElapsed)
	        defaultElapsed = frame.delta;
	    frame.timestamp = timestamp;
	    isProcessing = true;
	    stepsOrder.forEach(processStep);
	    isProcessing = false;
	    if (willRunNextFrame) {
	        useDefaultElapsed = false;
	        onNextFrame(processFrame);
	    }
	};
	var startLoop = function () {
	    willRunNextFrame = true;
	    useDefaultElapsed = true;
	    if (!isProcessing)
	        onNextFrame(processFrame);
	};
	var getFrameData = function () { return frame; };

	var DEFAULT_OVERSHOOT_STRENGTH = 1.525;
	var reversed = function (easing) {
	    return function (p) {
	        return 1 - easing(1 - p);
	    };
	};
	var mirrored = function (easing) {
	    return function (p) {
	        return p <= 0.5 ? easing(2 * p) / 2 : (2 - easing(2 * (1 - p))) / 2;
	    };
	};
	var createReversedEasing = reversed;
	var createMirroredEasing = mirrored;
	var createExpoIn = function (power) {
	    return function (p) {
	        return Math.pow(p, power);
	    };
	};
	var createBackIn = function (power) {
	    return function (p) {
	        return p * p * ((power + 1) * p - power);
	    };
	};
	var createAnticipateEasing = function (power) {
	    var backEasing = createBackIn(power);
	    return function (p) {
	        return (p *= 2) < 1 ? 0.5 * backEasing(p) : 0.5 * (2 - Math.pow(2, -10 * (p - 1)));
	    };
	};
	var linear = function (p) {
	    return p;
	};
	var easeIn = /*#__PURE__*/createExpoIn(2);
	var easeOut = /*#__PURE__*/reversed(easeIn);
	var easeInOut = /*#__PURE__*/mirrored(easeIn);
	var circIn = function (p) {
	    return 1 - Math.sin(Math.acos(p));
	};
	var circOut = /*#__PURE__*/reversed(circIn);
	var circInOut = /*#__PURE__*/mirrored(circOut);
	var backIn = /*#__PURE__*/createBackIn(DEFAULT_OVERSHOOT_STRENGTH);
	var backOut = /*#__PURE__*/reversed(backIn);
	var backInOut = /*#__PURE__*/mirrored(backIn);
	var anticipate = /*#__PURE__*/createAnticipateEasing(DEFAULT_OVERSHOOT_STRENGTH);
	var BOUNCE_FIRST_THRESHOLD = 4.0 / 11.0;
	var BOUNCE_SECOND_THRESHOLD = 8.0 / 11.0;
	var BOUNCE_THIRD_THRESHOLD = 9.0 / 10.0;
	var ca = 4356.0 / 361.0;
	var cb = 35442.0 / 1805.0;
	var cc = 16061.0 / 1805.0;
	var bounceOut = function (p) {
	    var p2 = p * p;
	    return p < BOUNCE_FIRST_THRESHOLD ? 7.5625 * p2 : p < BOUNCE_SECOND_THRESHOLD ? 9.075 * p2 - 9.9 * p + 3.4 : p < BOUNCE_THIRD_THRESHOLD ? ca * p2 - cb * p + cc : 10.8 * p * p - 20.52 * p + 10.72;
	};
	var bounceIn = function (p) {
	    return 1.0 - bounceOut(1.0 - p);
	};
	var bounceInOut = function (p) {
	    return p < 0.5 ? 0.5 * (1.0 - bounceOut(1.0 - p * 2.0)) : 0.5 * bounceOut(p * 2.0 - 1.0) + 0.5;
	};
	var NEWTON_ITERATIONS = 8;
	var NEWTON_MIN_SLOPE = 0.001;
	var SUBDIVISION_PRECISION = 0.0000001;
	var SUBDIVISION_MAX_ITERATIONS = 10;
	var K_SPLINE_TABLE_SIZE = 11;
	var K_SAMPLE_STEP_SIZE = 1.0 / (K_SPLINE_TABLE_SIZE - 1.0);
	var FLOAT_32_SUPPORTED = typeof Float32Array !== 'undefined';
	var a = function (a1, a2) {
	    return 1.0 - 3.0 * a2 + 3.0 * a1;
	};
	var b = function (a1, a2) {
	    return 3.0 * a2 - 6.0 * a1;
	};
	var c = function (a1) {
	    return 3.0 * a1;
	};
	var getSlope = function (t, a1, a2) {
	    return 3.0 * a(a1, a2) * t * t + 2.0 * b(a1, a2) * t + c(a1);
	};
	var calcBezier = function (t, a1, a2) {
	    return ((a(a1, a2) * t + b(a1, a2)) * t + c(a1)) * t;
	};
	function cubicBezier(mX1, mY1, mX2, mY2) {
	    var sampleValues = FLOAT_32_SUPPORTED ? new Float32Array(K_SPLINE_TABLE_SIZE) : new Array(K_SPLINE_TABLE_SIZE);
	    var binarySubdivide = function (aX, aA, aB) {
	        var i = 0;
	        var currentX;
	        var currentT;
	        do {
	            currentT = aA + (aB - aA) / 2.0;
	            currentX = calcBezier(currentT, mX1, mX2) - aX;
	            if (currentX > 0.0) {
	                aB = currentT;
	            } else {
	                aA = currentT;
	            }
	        } while (Math.abs(currentX) > SUBDIVISION_PRECISION && ++i < SUBDIVISION_MAX_ITERATIONS);
	        return currentT;
	    };
	    var newtonRaphsonIterate = function (aX, aGuessT) {
	        var i = 0;
	        var currentSlope = 0;
	        var currentX;
	        for (; i < NEWTON_ITERATIONS; ++i) {
	            currentSlope = getSlope(aGuessT, mX1, mX2);
	            if (currentSlope === 0.0) {
	                return aGuessT;
	            }
	            currentX = calcBezier(aGuessT, mX1, mX2) - aX;
	            aGuessT -= currentX / currentSlope;
	        }
	        return aGuessT;
	    };
	    var calcSampleValues = function () {
	        for (var i = 0; i < K_SPLINE_TABLE_SIZE; ++i) {
	            sampleValues[i] = calcBezier(i * K_SAMPLE_STEP_SIZE, mX1, mX2);
	        }
	    };
	    var getTForX = function (aX) {
	        var intervalStart = 0.0;
	        var currentSample = 1;
	        var lastSample = K_SPLINE_TABLE_SIZE - 1;
	        var dist = 0.0;
	        var guessForT = 0.0;
	        var initialSlope = 0.0;
	        for (; currentSample !== lastSample && sampleValues[currentSample] <= aX; ++currentSample) {
	            intervalStart += K_SAMPLE_STEP_SIZE;
	        }
	        --currentSample;
	        dist = (aX - sampleValues[currentSample]) / (sampleValues[currentSample + 1] - sampleValues[currentSample]);
	        guessForT = intervalStart + dist * K_SAMPLE_STEP_SIZE;
	        initialSlope = getSlope(guessForT, mX1, mX2);
	        if (initialSlope >= NEWTON_MIN_SLOPE) {
	            return newtonRaphsonIterate(aX, guessForT);
	        } else if (initialSlope === 0.0) {
	            return guessForT;
	        } else {
	            return binarySubdivide(aX, intervalStart, intervalStart + K_SAMPLE_STEP_SIZE);
	        }
	    };
	    calcSampleValues();
	    var resolver = function (aX) {
	        var returnValue;
	        if (mX1 === mY1 && mX2 === mY2) {
	            returnValue = aX;
	        } else if (aX === 0) {
	            returnValue = 0;
	        } else if (aX === 1) {
	            returnValue = 1;
	        } else {
	            returnValue = calcBezier(getTForX(aX), mY1, mY2);
	        }
	        return returnValue;
	    };
	    return resolver;
	}

	var easing_es = /*#__PURE__*/Object.freeze({
		reversed: reversed,
		mirrored: mirrored,
		createReversedEasing: createReversedEasing,
		createMirroredEasing: createMirroredEasing,
		createExpoIn: createExpoIn,
		createBackIn: createBackIn,
		createAnticipateEasing: createAnticipateEasing,
		linear: linear,
		easeIn: easeIn,
		easeOut: easeOut,
		easeInOut: easeInOut,
		circIn: circIn,
		circOut: circOut,
		circInOut: circInOut,
		backIn: backIn,
		backOut: backOut,
		backInOut: backInOut,
		anticipate: anticipate,
		bounceOut: bounceOut,
		bounceIn: bounceIn,
		bounceInOut: bounceInOut,
		cubicBezier: cubicBezier
	});

	var zeroPoint = {
	    x: 0,
	    y: 0,
	    z: 0
	};
	var isNum = function (v) { return typeof v === 'number'; };

	var radiansToDegrees = (function (radians) { return (radians * 180) / Math.PI; });

	var angle = (function (a, b) {
	    if (b === void 0) { b = zeroPoint; }
	    return radiansToDegrees(Math.atan2(b.y - a.y, b.x - a.x));
	});

	var applyOffset = (function (from, to) {
	    var hasReceivedFrom = true;
	    if (to === undefined) {
	        to = from;
	        hasReceivedFrom = false;
	    }
	    return function (v) {
	        if (hasReceivedFrom) {
	            return v - from + to;
	        }
	        else {
	            from = v;
	            hasReceivedFrom = true;
	            return to;
	        }
	    };
	});

	var curryRange = (function (func) { return function (min, max, v) { return (v !== undefined ? func(min, max, v) : function (cv) { return func(min, max, cv); }); }; });

	var clamp$1 = function (min, max, v) {
	    return Math.min(Math.max(v, min), max);
	};
	var clamp$1$1 = curryRange(clamp$1);

	var conditional = (function (check, apply) { return function (v) {
	    return check(v) ? apply(v) : v;
	}; });

	var degreesToRadians = (function (degrees) { return (degrees * Math.PI) / 180; });

	var isPoint = (function (point) {
	    return point.hasOwnProperty('x') && point.hasOwnProperty('y');
	});

	var isPoint3D = (function (point) {
	    return isPoint(point) && point.hasOwnProperty('z');
	});

	var distance1D = function (a, b) { return Math.abs(a - b); };
	var distance = (function (a, b) {
	    if (b === void 0) { b = zeroPoint; }
	    if (isNum(a) && isNum(b)) {
	        return distance1D(a, b);
	    }
	    else if (isPoint(a) && isPoint(b)) {
	        var xDelta = distance1D(a.x, b.x);
	        var yDelta = distance1D(a.y, b.y);
	        var zDelta = isPoint3D(a) && isPoint3D(b) ? distance1D(a.z, b.z) : 0;
	        return Math.sqrt(Math.pow(xDelta, 2) + Math.pow(yDelta, 2) + Math.pow(zDelta, 2));
	    }
	    return 0;
	});

	var progress = (function (from, to, value) {
	    var toFromDifference = to - from;
	    return toFromDifference === 0 ? 1 : (value - from) / toFromDifference;
	});

	var mix = (function (from, to, progress) {
	    return -progress * from + progress * to + from;
	});

	/*! *****************************************************************************
	Copyright (c) Microsoft Corporation. All rights reserved.
	Licensed under the Apache License, Version 2.0 (the "License"); you may not use
	this file except in compliance with the License. You may obtain a copy of the
	License at http://www.apache.org/licenses/LICENSE-2.0

	THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
	KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
	WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
	MERCHANTABLITY OR NON-INFRINGEMENT.

	See the Apache Version 2.0 License for specific language governing permissions
	and limitations under the License.
	***************************************************************************** */

	var __assign$2 = function() {
	    __assign$2 = Object.assign || function __assign(t) {
	        for (var s, i = 1, n = arguments.length; i < n; i++) {
	            s = arguments[i];
	            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
	        }
	        return t;
	    };
	    return __assign$2.apply(this, arguments);
	};

	var mixLinearColor = function (from, to, v) {
	    var fromExpo = from * from;
	    var toExpo = to * to;
	    return Math.sqrt(Math.max(0, v * (toExpo - fromExpo) + fromExpo));
	};
	var colorTypes = [hex, rgba, hsla];
	var getColorType = function (v) {
	    return colorTypes.find(function (type) { return type.test(v); });
	};
	var notAnimatable = function (color$$1) {
	    return "'" + color$$1 + "' is not an animatable color. Use the equivalent color code instead.";
	};
	var mixColor = (function (from, to) {
	    var fromColorType = getColorType(from);
	    var toColorType = getColorType(to);
	    invariant(!!fromColorType, notAnimatable(from));
	    invariant(!!toColorType, notAnimatable(to));
	    invariant(fromColorType.transform === toColorType.transform, 'Both colors must be hex/RGBA, OR both must be HSLA.');
	    var fromColor = fromColorType.parse(from);
	    var toColor = toColorType.parse(to);
	    var blended = __assign$2({}, fromColor);
	    var mixFunc = fromColorType === hsla ? mix : mixLinearColor;
	    return function (v) {
	        for (var key in blended) {
	            if (key !== 'alpha') {
	                blended[key] = mixFunc(fromColor[key], toColor[key], v);
	            }
	        }
	        blended.alpha = mix(fromColor.alpha, toColor.alpha, v);
	        return fromColorType.transform(blended);
	    };
	});

	var combineFunctions = function (a, b) { return function (v) { return b(a(v)); }; };
	var pipe = (function () {
	    var transformers = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        transformers[_i] = arguments[_i];
	    }
	    return transformers.reduce(combineFunctions);
	});

	var mixArray = function (from, to) {
	    var output = from.slice();
	    var numValues = output.length;
	    var blendValue = from.map(function (fromThis, i) {
	        var toThis = to[i];
	        if (isNum(fromThis)) {
	            return function (v) { return mix(fromThis, toThis, v); };
	        }
	        else if (color.test(fromThis)) {
	            return mixColor(fromThis, toThis);
	        }
	        else {
	            return mixComplex(fromThis, toThis);
	        }
	    });
	    return function (v) {
	        for (var i = 0; i < numValues; i++) {
	            output[i] = blendValue[i](v);
	        }
	        return output;
	    };
	};
	var mixComplex = function (from, to) {
	    var valueTemplate = complex.createTransformer(from);
	    invariant(valueTemplate(from) === complex.createTransformer(to)(from), "Values '" + from + "' and '" + to + "' are of different format, or a value might have changed value type.");
	    return pipe(mixArray(complex.parse(from), complex.parse(to)), valueTemplate);
	};

	var mixNumber = function (from, to) { return function (p) { return mix(from, to, p); }; };
	function detectMixerFactory(v) {
	    if (typeof v === 'number') {
	        return mixNumber;
	    }
	    if (color.test(v)) {
	        return mixColor;
	    }
	    else {
	        return mixComplex;
	    }
	}
	function createMixers(output, ease, customMixer) {
	    var mixers = [];
	    var mixerFactory = customMixer || detectMixerFactory(output[0]);
	    var numMixers = output.length - 1;
	    for (var i = 0; i < numMixers; i++) {
	        var mixer = mixerFactory(output[i], output[i + 1]);
	        if (ease) {
	            var easingFunction = Array.isArray(ease) ? ease[i] : ease;
	            mixer = pipe(easingFunction, mixer);
	        }
	        mixers.push(mixer);
	    }
	    return mixers;
	}
	function fastInterpolate(_a, _b) {
	    var from = _a[0], to = _a[1];
	    var mixer = _b[0];
	    return function (v) { return mixer(progress(from, to, v)); };
	}
	function slowInterpolate(input, mixers) {
	    var inputLength = input.length;
	    var lastInputIndex = inputLength - 1;
	    return function (v) {
	        var mixerIndex = 0;
	        var foundMixerIndex = false;
	        if (v <= input[0]) {
	            foundMixerIndex = true;
	        }
	        else if (v >= input[lastInputIndex]) {
	            mixerIndex = lastInputIndex - 1;
	            foundMixerIndex = true;
	        }
	        if (!foundMixerIndex) {
	            var i = 1;
	            for (; i < inputLength; i++) {
	                if (input[i] > v || i === lastInputIndex) {
	                    break;
	                }
	            }
	            mixerIndex = i - 1;
	        }
	        var progressInRange = progress(input[mixerIndex], input[mixerIndex + 1], v);
	        return mixers[mixerIndex](progressInRange);
	    };
	}
	function interpolate(input, output, _a) {
	    var _b = _a === void 0 ? {} : _a, _c = _b.clamp, clamp = _c === void 0 ? true : _c, ease = _b.ease, mixer = _b.mixer;
	    var inputLength = input.length;
	    invariant(inputLength === output.length, 'Both input and output ranges must be the same length');
	    invariant(!ease || !Array.isArray(ease) || ease.length === inputLength - 1, 'Array of easing functions must be of length `input.length - 1`, as it applies to the transitions **between** the defined values.');
	    if (input[0] > input[inputLength - 1]) {
	        input = [].concat(input);
	        output = [].concat(output);
	        input.reverse();
	        output.reverse();
	    }
	    var mixers = createMixers(output, ease, mixer);
	    var interpolator = inputLength === 2
	        ? fastInterpolate(input, mixers)
	        : slowInterpolate(input, mixers);
	    return clamp
	        ? pipe(clamp$1$1(input[0], input[inputLength - 1]), interpolator)
	        : interpolator;
	}

	var pointFromVector = (function (origin, angle, distance) {
	    angle = degreesToRadians(angle);
	    return {
	        x: distance * Math.cos(angle) + origin.x,
	        y: distance * Math.sin(angle) + origin.y
	    };
	});

	var toDecimal = (function (num, precision) {
	    if (precision === void 0) { precision = 2; }
	    precision = Math.pow(10, precision);
	    return Math.round(num * precision) / precision;
	});

	var smoothFrame = (function (prevValue, nextValue, duration, smoothing) {
	    if (smoothing === void 0) { smoothing = 0; }
	    return toDecimal(prevValue +
	        (duration * (nextValue - prevValue)) / Math.max(smoothing, duration));
	});

	var smooth = (function (strength) {
	    if (strength === void 0) { strength = 50; }
	    var previousValue = 0;
	    var lastUpdated = 0;
	    return function (v) {
	        var currentFramestamp = getFrameData().timestamp;
	        var timeDelta = currentFramestamp !== lastUpdated ? currentFramestamp - lastUpdated : 0;
	        var newValue = timeDelta
	            ? smoothFrame(previousValue, v, timeDelta, strength)
	            : previousValue;
	        lastUpdated = currentFramestamp;
	        previousValue = newValue;
	        return newValue;
	    };
	});

	var snap = (function (points) {
	    if (typeof points === 'number') {
	        return function (v) { return Math.round(v / points) * points; };
	    }
	    else {
	        var i_1 = 0;
	        var numPoints_1 = points.length;
	        return function (v) {
	            var lastDistance = Math.abs(points[0] - v);
	            for (i_1 = 1; i_1 < numPoints_1; i_1++) {
	                var point = points[i_1];
	                var distance = Math.abs(point - v);
	                if (distance === 0)
	                    return point;
	                if (distance > lastDistance)
	                    return points[i_1 - 1];
	                if (i_1 === numPoints_1 - 1)
	                    return point;
	                lastDistance = distance;
	            }
	        };
	    }
	});

	var identity = function (v) { return v; };
	var springForce = function (alterDisplacement) {
	    if (alterDisplacement === void 0) { alterDisplacement = identity; }
	    return curryRange(function (constant, origin, v) {
	        var displacement = origin - v;
	        var springModifiedDisplacement = -(0 - constant + 1) * (0 - alterDisplacement(Math.abs(displacement)));
	        return displacement <= 0
	            ? origin + springModifiedDisplacement
	            : origin - springModifiedDisplacement;
	    });
	};
	var springForceLinear = springForce();
	var springForceExpo = springForce(Math.sqrt);

	var velocityPerFrame = (function (xps, frameDuration) {
	    return isNum(xps) ? xps / (1000 / frameDuration) : 0;
	});

	var velocityPerSecond = (function (velocity, frameDuration) {
	    return frameDuration ? velocity * (1000 / frameDuration) : 0;
	});

	var wrap = function (min, max, v) {
	    var rangeSize = max - min;
	    return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
	};
	var wrap$1 = curryRange(wrap);

	var clampProgress = clamp$1$1(0, 1);

	/*! *****************************************************************************
	Copyright (c) Microsoft Corporation. All rights reserved.
	Licensed under the Apache License, Version 2.0 (the "License"); you may not use
	this file except in compliance with the License. You may obtain a copy of the
	License at http://www.apache.org/licenses/LICENSE-2.0

	THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
	KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
	WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
	MERCHANTABLITY OR NON-INFRINGEMENT.

	See the Apache Version 2.0 License for specific language governing permissions
	and limitations under the License.
	***************************************************************************** */

	var __assign$3 = function () {
	    __assign$3 = Object.assign || function __assign(t) {
	        for (var s, i = 1, n = arguments.length; i < n; i++) {
	            s = arguments[i];
	            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
	        }
	        return t;
	    };
	    return __assign$3.apply(this, arguments);
	};

	function __rest$1(s, e) {
	    var t = {};
	    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
	    if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0) t[p[i]] = s[p[i]];
	    return t;
	}

	var createStyler = function (_a) {
	    var onRead = _a.onRead,
	        onRender = _a.onRender,
	        _b = _a.uncachedValues,
	        uncachedValues = _b === void 0 ? new Set() : _b,
	        _c = _a.useCache,
	        useCache = _c === void 0 ? true : _c;
	    return function (props) {
	        var state = {};
	        var changedValues = [];
	        var hasChanged = false;
	        var setValue = function (key, value) {
	            var currentValue = state[key];
	            state[key] = value;
	            if (state[key] !== currentValue) {
	                if (changedValues.indexOf(key) === -1) {
	                    changedValues.push(key);
	                }
	                if (!hasChanged) {
	                    hasChanged = true;
	                    sync.render(render);
	                }
	            }
	        };
	        function render(forceRender) {
	            if (forceRender === void 0) {
	                forceRender = false;
	            }
	            if (forceRender === true || hasChanged) {
	                onRender(state, props, changedValues);
	                hasChanged = false;
	                changedValues.length = 0;
	            }
	            return this;
	        }
	        return {
	            get: function (key) {
	                return key ? useCache && !uncachedValues.has(key) && state[key] !== undefined ? state[key] : onRead(key, props) : state;
	            },
	            set: function (values, value) {
	                if (typeof values === 'string') {
	                    if (value !== undefined) {
	                        setValue(values, value);
	                    } else {
	                        return function (v) {
	                            return setValue(values, v);
	                        };
	                    }
	                } else {
	                    for (var key in values) {
	                        if (values.hasOwnProperty(key)) {
	                            setValue(key, values[key]);
	                        }
	                    }
	                }
	                return this;
	            },
	            render: render
	        };
	    };
	};

	var CAMEL_CASE_PATTERN = /([a-z])([A-Z])/g;
	var REPLACE_TEMPLATE = '$1-$2';
	var camelToDash = function (str) {
	    return str.replace(CAMEL_CASE_PATTERN, REPLACE_TEMPLATE).toLowerCase();
	};
	var setDomAttrs = function (element, attrs) {
	    for (var key in attrs) {
	        if (attrs.hasOwnProperty(key)) {
	            element.setAttribute(key, attrs[key]);
	        }
	    }
	};

	var camelCache = /*#__PURE__*/new Map();
	var dashCache = /*#__PURE__*/new Map();
	var prefixes = ['Webkit', 'Moz', 'O', 'ms', ''];
	var numPrefixes = prefixes.length;
	var isBrowser = typeof document !== 'undefined';
	var testElement;
	var setDashPrefix = function (key, prefixed) {
	    return dashCache.set(key, camelToDash(prefixed));
	};
	var testPrefix = function (key) {
	    testElement = testElement || document.createElement('div');
	    for (var i = 0; i < numPrefixes; i++) {
	        var prefix = prefixes[i];
	        var noPrefix = prefix === '';
	        var prefixedPropertyName = noPrefix ? key : prefix + key.charAt(0).toUpperCase() + key.slice(1);
	        if (prefixedPropertyName in testElement.style || noPrefix) {
	            camelCache.set(key, prefixedPropertyName);
	            setDashPrefix(key, "" + (noPrefix ? '' : '-') + camelToDash(prefixedPropertyName));
	        }
	    }
	};
	var setServerProperty = function (key) {
	    return setDashPrefix(key, key);
	};
	var prefixer = function (key, asDashCase) {
	    if (asDashCase === void 0) {
	        asDashCase = false;
	    }
	    var cache = asDashCase ? dashCache : camelCache;
	    if (!cache.has(key)) isBrowser ? testPrefix(key) : setServerProperty(key);
	    return cache.get(key) || key;
	};

	var axes = ['', 'X', 'Y', 'Z'];
	var order = ['scale', 'rotate', 'skew', 'transformPerspective'];
	var transformProps = /*#__PURE__*/order.reduce(function (acc, key) {
	    return axes.reduce(function (axesAcc, axesKey) {
	        axesAcc.push(key + axesKey);
	        return axesAcc;
	    }, acc);
	}, ['x', 'y', 'z']);
	var transformPropDictionary = /*#__PURE__*/transformProps.reduce(function (dict, key) {
	    dict[key] = true;
	    return dict;
	}, {});
	var isTransformProp = function (key) {
	    return transformPropDictionary[key] === true;
	};
	var sortTransformProps = function (a, b) {
	    return transformProps.indexOf(a) - transformProps.indexOf(b);
	};
	var isTransformOriginProp = function (key) {
	    return key === 'originX' || key === 'originY';
	};

	var valueTypes = {
	    color: color,
	    backgroundColor: color,
	    outlineColor: color,
	    fill: color,
	    stroke: color,
	    borderColor: color,
	    borderTopColor: color,
	    borderRightColor: color,
	    borderBottomColor: color,
	    borderLeftColor: color,
	    borderWidth: px,
	    borderTopWidth: px,
	    borderRightWidth: px,
	    borderBottomWidth: px,
	    borderLeftWidth: px,
	    borderRadius: px,
	    borderTopLeftRadius: px,
	    borderTopRightRadius: px,
	    borderBottomRightRadius: px,
	    borderBottomLeftRadius: px,
	    width: px,
	    maxWidth: px,
	    height: px,
	    maxHeight: px,
	    top: px,
	    right: px,
	    bottom: px,
	    left: px,
	    padding: px,
	    paddingTop: px,
	    paddingRight: px,
	    paddingBottom: px,
	    paddingLeft: px,
	    margin: px,
	    marginTop: px,
	    marginRight: px,
	    marginBottom: px,
	    marginLeft: px,
	    rotate: degrees,
	    rotateX: degrees,
	    rotateY: degrees,
	    rotateZ: degrees,
	    scale: scale,
	    scaleX: scale,
	    scaleY: scale,
	    scaleZ: scale,
	    skew: degrees,
	    skewX: degrees,
	    skewY: degrees,
	    distance: px,
	    x: px,
	    y: px,
	    z: px,
	    perspective: px,
	    opacity: alpha,
	    originX: percent,
	    originY: percent,
	    originZ: px
	};
	var getValueType = function (key) {
	    return valueTypes[key];
	};

	var SCROLL_LEFT = 'scrollLeft';
	var SCROLL_TOP = 'scrollTop';
	var scrollKeys = /*#__PURE__*/new Set([SCROLL_LEFT, SCROLL_TOP]);

	var blacklist = /*#__PURE__*/new Set([SCROLL_LEFT, SCROLL_TOP, 'transform']);
	var aliasMap = {
	    x: 'translateX',
	    y: 'translateY',
	    z: 'translateZ'
	};
	var isCustomTemplate = function (v) {
	    return typeof v === 'function';
	};
	var buildTransform = function (state, transform, transformKeys, transformIsDefault, enableHardwareAcceleration) {
	    var transformString = '';
	    var transformHasZ = false;
	    transformKeys.sort(sortTransformProps);
	    var numTransformKeys = transformKeys.length;
	    for (var i = 0; i < numTransformKeys; i++) {
	        var key = transformKeys[i];
	        transformString += (aliasMap[key] || key) + "(" + transform[key] + ") ";
	        transformHasZ = key === 'z' ? true : transformHasZ;
	    }
	    if (!transformHasZ && enableHardwareAcceleration) {
	        transformString += 'translateZ(0)';
	    } else {
	        transformString = transformString.trim();
	    }
	    if (isCustomTemplate(state.transform)) {
	        transformString = state.transform(transform, transformString);
	    } else if (transformIsDefault) {
	        transformString = 'none';
	    }
	    return transformString;
	};
	var buildStyleProperty = function (state, enableHardwareAcceleration, styles, transform, transformOrigin, transformKeys, isDashCase) {
	    if (enableHardwareAcceleration === void 0) {
	        enableHardwareAcceleration = true;
	    }
	    if (styles === void 0) {
	        styles = {};
	    }
	    if (transform === void 0) {
	        transform = {};
	    }
	    if (transformOrigin === void 0) {
	        transformOrigin = {};
	    }
	    if (transformKeys === void 0) {
	        transformKeys = [];
	    }
	    if (isDashCase === void 0) {
	        isDashCase = false;
	    }
	    var transformIsDefault = true;
	    var hasTransform = false;
	    var hasTransformOrigin = false;
	    for (var key in state) {
	        var value = state[key];
	        var valueType = getValueType(key);
	        var valueAsType = typeof value === 'number' && valueType ? valueType.transform(value) : value;
	        if (isTransformProp(key)) {
	            hasTransform = true;
	            transform[key] = valueAsType;
	            transformKeys.push(key);
	            if (transformIsDefault) {
	                if (valueType.default && value !== valueType.default || !valueType.default && value !== 0) {
	                    transformIsDefault = false;
	                }
	            }
	        } else if (isTransformOriginProp(key)) {
	            transformOrigin[key] = valueAsType;
	            hasTransformOrigin = true;
	        } else if (!blacklist.has(key) || !isCustomTemplate(valueAsType)) {
	            styles[prefixer(key, isDashCase)] = valueAsType;
	        }
	    }
	    if (hasTransform || typeof state.transform === 'function') {
	        styles.transform = buildTransform(state, transform, transformKeys, transformIsDefault, enableHardwareAcceleration);
	    }
	    if (hasTransformOrigin) {
	        styles.transformOrigin = (transformOrigin.originX || 0) + " " + (transformOrigin.originY || 0) + " " + (transformOrigin.originZ || 0);
	    }
	    return styles;
	};
	var createStyleBuilder = function (enableHardwareAcceleration) {
	    if (enableHardwareAcceleration === void 0) {
	        enableHardwareAcceleration = true;
	    }
	    var styles = {};
	    var transform = {};
	    var transformOrigin = {};
	    var transformKeys = [];
	    return function (state) {
	        transformKeys.length = 0;
	        buildStyleProperty(state, enableHardwareAcceleration, styles, transform, transformOrigin, transformKeys, true);
	        return styles;
	    };
	};

	var cssStyler = /*#__PURE__*/createStyler({
	    onRead: function (key, _a) {
	        var element = _a.element,
	            preparseOutput = _a.preparseOutput;
	        var valueType = getValueType(key);
	        if (isTransformProp(key)) {
	            return valueType ? valueType.default || 0 : 0;
	        } else if (scrollKeys.has(key)) {
	            return element[key];
	        } else {
	            var domValue = window.getComputedStyle(element, null).getPropertyValue(prefixer(key, true)) || 0;
	            return preparseOutput && valueType && valueType.parse ? valueType.parse(domValue) : domValue;
	        }
	    },
	    onRender: function (state, _a, changedValues) {
	        var element = _a.element,
	            buildStyles = _a.buildStyles;
	        Object.assign(element.style, buildStyles(state));
	        if (changedValues.indexOf(SCROLL_LEFT) !== -1) element.scrollLeft = state.scrollLeft;
	        if (changedValues.indexOf(SCROLL_TOP) !== -1) element.scrollTop = state.scrollTop;
	    },
	    uncachedValues: scrollKeys
	});
	var css = function (element, _a) {
	    if (_a === void 0) {
	        _a = {};
	    }
	    var enableHardwareAcceleration = _a.enableHardwareAcceleration,
	        props = __rest$1(_a, ["enableHardwareAcceleration"]);
	    return cssStyler(__assign$3({ element: element, buildStyles: createStyleBuilder(enableHardwareAcceleration), preparseOutput: true }, props));
	};

	var camelCaseAttributes = /*#__PURE__*/new Set(['baseFrequency', 'diffuseConstant', 'kernelMatrix', 'kernelUnitLength', 'keySplines', 'keyTimes', 'limitingConeAngle', 'markerHeight', 'markerWidth', 'numOctaves', 'targetX', 'targetY', 'surfaceScale', 'specularConstant', 'specularExponent', 'stdDeviation', 'tableValues']);

	var ZERO_NOT_ZERO = 0.0000001;
	var percentToPixels = function (percent$$1, length) {
	    return percent$$1 / 100 * length + 'px';
	};
	var build = function (state, dimensions, isPath, pathLength) {
	    var hasTransform = false;
	    var hasDashArray = false;
	    var props = {};
	    var dashArrayStyles = isPath ? {
	        pathLength: '0',
	        pathSpacing: "" + pathLength
	    } : undefined;
	    var scale$$1 = state.scale !== undefined ? state.scale || ZERO_NOT_ZERO : state.scaleX || 1;
	    var scaleY = state.scaleY !== undefined ? state.scaleY || ZERO_NOT_ZERO : scale$$1 || 1;
	    var transformOriginX = dimensions.width * ((state.originX || 50) / 100) + dimensions.x;
	    var transformOriginY = dimensions.height * ((state.originY || 50) / 100) + dimensions.y;
	    var scaleTransformX = -transformOriginX * (scale$$1 * 1);
	    var scaleTransformY = -transformOriginY * (scaleY * 1);
	    var scaleReplaceX = transformOriginX / scale$$1;
	    var scaleReplaceY = transformOriginY / scaleY;
	    var transform = {
	        translate: "translate(" + state.x + ", " + state.y + ") ",
	        scale: "translate(" + scaleTransformX + ", " + scaleTransformY + ") scale(" + scale$$1 + ", " + scaleY + ") translate(" + scaleReplaceX + ", " + scaleReplaceY + ") ",
	        rotate: "rotate(" + state.rotate + ", " + transformOriginX + ", " + transformOriginY + ") ",
	        skewX: "skewX(" + state.skewX + ") ",
	        skewY: "skewY(" + state.skewY + ") "
	    };
	    for (var key in state) {
	        if (state.hasOwnProperty(key)) {
	            var value = state[key];
	            if (isTransformProp(key)) {
	                hasTransform = true;
	            } else if (isPath && (key === 'pathLength' || key === 'pathSpacing') && typeof value === 'number') {
	                hasDashArray = true;
	                dashArrayStyles[key] = percentToPixels(value, pathLength);
	            } else if (isPath && key === 'pathOffset') {
	                props['stroke-dashoffset'] = percentToPixels(-value, pathLength);
	            } else {
	                var attrKey = !camelCaseAttributes.has(key) ? camelToDash(key) : key;
	                props[attrKey] = value;
	            }
	        }
	    }
	    if (hasDashArray) {
	        props['stroke-dasharray'] = dashArrayStyles.pathLength + ' ' + dashArrayStyles.pathSpacing;
	    }
	    if (hasTransform) {
	        props.transform = '';
	        for (var key in transform) {
	            if (transform.hasOwnProperty(key)) {
	                var defaultValue = key === 'scale' ? '1' : '0';
	                props.transform += transform[key].replace(/undefined/g, defaultValue);
	            }
	        }
	    }
	    return props;
	};

	var int = /*#__PURE__*/__assign$3({}, number, { transform: Math.round });
	var valueTypes$1 = {
	    fill: color,
	    stroke: color,
	    scale: scale,
	    scaleX: scale,
	    scaleY: scale,
	    opacity: alpha,
	    fillOpacity: alpha,
	    strokeOpacity: alpha,
	    numOctaves: int
	};
	var getValueType$1 = function (key) {
	    return valueTypes$1[key];
	};

	var getDimensions = function (element) {
	    return typeof element.getBBox === 'function' ? element.getBBox() : element.getBoundingClientRect();
	};
	var getSVGElementDimensions = function (element) {
	    try {
	        return getDimensions(element);
	    } catch (e) {
	        return { x: 0, y: 0, width: 0, height: 0 };
	    }
	};

	var svgStyler = /*#__PURE__*/createStyler({
	    onRead: function (key, _a) {
	        var element = _a.element;
	        if (!isTransformProp(key)) {
	            return element.getAttribute(key);
	        } else {
	            var valueType = getValueType$1(key);
	            return valueType ? valueType.default : 0;
	        }
	    },
	    onRender: function (state, _a) {
	        var dimensions = _a.dimensions,
	            element = _a.element,
	            isPath = _a.isPath,
	            pathLength = _a.pathLength;
	        setDomAttrs(element, build(state, dimensions, isPath, pathLength));
	    }
	});
	var svg = function (element) {
	    var dimensions = getSVGElementDimensions(element);
	    var props = {
	        element: element,
	        dimensions: dimensions,
	        isPath: false
	    };
	    if (element.tagName === 'path') {
	        props.isPath = true;
	        props.pathLength = element.getTotalLength();
	    }
	    return svgStyler(props);
	};

	var viewport = /*#__PURE__*/createStyler({
	    useCache: false,
	    onRead: function (key) {
	        return key === 'scrollTop' ? window.pageYOffset : window.pageXOffset;
	    },
	    onRender: function (_a) {
	        var _b = _a.scrollTop,
	            scrollTop = _b === void 0 ? 0 : _b,
	            _c = _a.scrollLeft,
	            scrollLeft = _c === void 0 ? 0 : _c;
	        return window.scrollTo(scrollLeft, scrollTop);
	    }
	});

	var cache = /*#__PURE__*/new WeakMap();
	var createDOMStyler = function (node, props) {
	    var styler;
	    if (node instanceof HTMLElement) {
	        styler = css(node, props);
	    } else if (node instanceof SVGElement) {
	        styler = svg(node);
	    } else if (node === window) {
	        styler = viewport(node);
	    }
	    invariant(styler !== undefined, 'No valid node provided. Node must be HTMLElement, SVGElement or window.');
	    cache.set(node, styler);
	    return styler;
	};
	var getStyler = function (node, props) {
	    return cache.has(node) ? cache.get(node) : createDOMStyler(node, props);
	};
	function index(nodeOrSelector, props) {
	    var node = typeof nodeOrSelector === 'string' ? document.querySelector(nodeOrSelector) : nodeOrSelector;
	    return getStyler(node, props);
	}

	var Chainable = /*#__PURE__*/function () {
	    function Chainable(props) {
	        if (props === void 0) {
	            props = {};
	        }
	        this.props = props;
	    }
	    Chainable.prototype.applyMiddleware = function (middleware) {
	        return this.create(__assign({}, this.props, { middleware: this.props.middleware ? [middleware].concat(this.props.middleware) : [middleware] }));
	    };
	    Chainable.prototype.pipe = function () {
	        var funcs = [];
	        for (var _i = 0; _i < arguments.length; _i++) {
	            funcs[_i] = arguments[_i];
	        }
	        var pipedUpdate = funcs.length === 1 ? funcs[0] : pipe.apply(void 0, funcs);
	        return this.applyMiddleware(function (update) {
	            return function (v) {
	                return update(pipedUpdate(v));
	            };
	        });
	    };
	    Chainable.prototype.while = function (predicate) {
	        return this.applyMiddleware(function (update, complete) {
	            return function (v) {
	                return predicate(v) ? update(v) : complete();
	            };
	        });
	    };
	    Chainable.prototype.filter = function (predicate) {
	        return this.applyMiddleware(function (update) {
	            return function (v) {
	                return predicate(v) && update(v);
	            };
	        });
	    };
	    return Chainable;
	}();

	var Observer = /*#__PURE__*/function () {
	    function Observer(_a, observer) {
	        var middleware = _a.middleware,
	            onComplete = _a.onComplete;
	        var _this = this;
	        this.isActive = true;
	        this.update = function (v) {
	            if (_this.observer.update) _this.updateObserver(v);
	        };
	        this.complete = function () {
	            if (_this.observer.complete && _this.isActive) _this.observer.complete();
	            if (_this.onComplete) _this.onComplete();
	            _this.isActive = false;
	        };
	        this.error = function (err) {
	            if (_this.observer.error && _this.isActive) _this.observer.error(err);
	            _this.isActive = false;
	        };
	        this.observer = observer;
	        this.updateObserver = function (v) {
	            return observer.update(v);
	        };
	        this.onComplete = onComplete;
	        if (observer.update && middleware && middleware.length) {
	            middleware.forEach(function (m) {
	                return _this.updateObserver = m(_this.updateObserver, _this.complete);
	            });
	        }
	    }
	    return Observer;
	}();
	var createObserver = function (observerCandidate, _a, onComplete) {
	    var middleware = _a.middleware;
	    if (typeof observerCandidate === 'function') {
	        return new Observer({ middleware: middleware, onComplete: onComplete }, { update: observerCandidate });
	    } else {
	        return new Observer({ middleware: middleware, onComplete: onComplete }, observerCandidate);
	    }
	};

	var Action = /*#__PURE__*/function (_super) {
	    __extends(Action, _super);
	    function Action() {
	        return _super !== null && _super.apply(this, arguments) || this;
	    }
	    Action.prototype.create = function (props) {
	        return new Action(props);
	    };
	    Action.prototype.start = function (observerCandidate) {
	        if (observerCandidate === void 0) {
	            observerCandidate = {};
	        }
	        var isComplete = false;
	        var subscription = {
	            stop: function () {
	                return undefined;
	            }
	        };
	        var _a = this.props,
	            init = _a.init,
	            observerProps = __rest(_a, ["init"]);
	        var observer = createObserver(observerCandidate, observerProps, function () {
	            isComplete = true;
	            subscription.stop();
	        });
	        var api = init(observer);
	        subscription = api ? __assign({}, subscription, api) : subscription;
	        if (observerCandidate.registerParent) {
	            observerCandidate.registerParent(subscription);
	        }
	        if (isComplete) subscription.stop();
	        return subscription;
	    };
	    return Action;
	}(Chainable);
	var action = function (init) {
	    return new Action({ init: init });
	};

	var BaseMulticast = /*#__PURE__*/function (_super) {
	    __extends(BaseMulticast, _super);
	    function BaseMulticast() {
	        var _this = _super !== null && _super.apply(this, arguments) || this;
	        _this.subscribers = [];
	        return _this;
	    }
	    BaseMulticast.prototype.complete = function () {
	        this.subscribers.forEach(function (subscriber) {
	            return subscriber.complete();
	        });
	    };
	    BaseMulticast.prototype.error = function (err) {
	        this.subscribers.forEach(function (subscriber) {
	            return subscriber.error(err);
	        });
	    };
	    BaseMulticast.prototype.update = function (v) {
	        for (var i = 0; i < this.subscribers.length; i++) {
	            this.subscribers[i].update(v);
	        }
	    };
	    BaseMulticast.prototype.subscribe = function (observerCandidate) {
	        var _this = this;
	        var observer = createObserver(observerCandidate, this.props);
	        this.subscribers.push(observer);
	        var subscription = {
	            unsubscribe: function () {
	                var index = _this.subscribers.indexOf(observer);
	                if (index !== -1) _this.subscribers.splice(index, 1);
	            }
	        };
	        return subscription;
	    };
	    BaseMulticast.prototype.stop = function () {
	        if (this.parent) this.parent.stop();
	    };
	    BaseMulticast.prototype.registerParent = function (subscription) {
	        this.stop();
	        this.parent = subscription;
	    };
	    return BaseMulticast;
	}(Chainable);

	var Multicast = /*#__PURE__*/function (_super) {
	    __extends(Multicast, _super);
	    function Multicast() {
	        return _super !== null && _super.apply(this, arguments) || this;
	    }
	    Multicast.prototype.create = function (props) {
	        return new Multicast(props);
	    };
	    return Multicast;
	}(BaseMulticast);
	var multicast = function () {
	    return new Multicast();
	};

	var stepProgress = function (steps, progress$$1) {
	    var segment = 1 / (steps - 1);
	    var subsegment = 1 / (2 * (steps - 1));
	    var percentProgressOfTarget = Math.min(progress$$1, 1);
	    var subsegmentProgressOfTarget = percentProgressOfTarget / subsegment;
	    var segmentProgressOfTarget = Math.floor((subsegmentProgressOfTarget + 1) / 2);
	    return segmentProgressOfTarget * segment;
	};

	var calc = /*#__PURE__*/Object.freeze({
	    angle: angle,
	    degreesToRadians: degreesToRadians,
	    distance: distance,
	    isPoint3D: isPoint3D,
	    isPoint: isPoint,
	    dilate: mix,
	    getValueFromProgress: mix,
	    pointFromAngleAndDistance: pointFromVector,
	    getProgressFromValue: progress,
	    radiansToDegrees: radiansToDegrees,
	    smooth: smoothFrame,
	    speedPerFrame: velocityPerFrame,
	    speedPerSecond: velocityPerSecond,
	    stepProgress: stepProgress
	});

	var isValueList = function (v) {
	    return Array.isArray(v);
	};
	var isSingleValue = function (v) {
	    var typeOfV = typeof v;
	    return typeOfV === 'string' || typeOfV === 'number';
	};
	var ValueReaction = /*#__PURE__*/function (_super) {
	    __extends(ValueReaction, _super);
	    function ValueReaction(props) {
	        var _this = _super.call(this, props) || this;
	        _this.scheduleVelocityCheck = function () {
	            return sync.postRender(_this.velocityCheck);
	        };
	        _this.velocityCheck = function (_a) {
	            var timestamp = _a.timestamp;
	            if (timestamp !== _this.lastUpdated) {
	                _this.prev = _this.current;
	            }
	        };
	        _this.prev = _this.current = props.value || 0;
	        if (isSingleValue(_this.current)) {
	            _this.updateCurrent = function (v) {
	                return _this.current = v;
	            };
	            _this.getVelocityOfCurrent = function () {
	                return _this.getSingleVelocity(_this.current, _this.prev);
	            };
	        } else if (isValueList(_this.current)) {
	            _this.updateCurrent = function (v) {
	                return _this.current = v.slice();
	            };
	            _this.getVelocityOfCurrent = function () {
	                return _this.getListVelocity();
	            };
	        } else {
	            _this.updateCurrent = function (v) {
	                _this.current = {};
	                for (var key in v) {
	                    if (v.hasOwnProperty(key)) {
	                        _this.current[key] = v[key];
	                    }
	                }
	            };
	            _this.getVelocityOfCurrent = function () {
	                return _this.getMapVelocity();
	            };
	        }
	        if (props.initialSubscription) _this.subscribe(props.initialSubscription);
	        return _this;
	    }
	    ValueReaction.prototype.create = function (props) {
	        return new ValueReaction(props);
	    };
	    ValueReaction.prototype.get = function () {
	        return this.current;
	    };
	    ValueReaction.prototype.getVelocity = function () {
	        return this.getVelocityOfCurrent();
	    };
	    ValueReaction.prototype.update = function (v) {
	        _super.prototype.update.call(this, v);
	        this.prev = this.current;
	        this.updateCurrent(v);
	        var _a = getFrameData(),
	            delta = _a.delta,
	            timestamp = _a.timestamp;
	        this.timeDelta = delta;
	        this.lastUpdated = timestamp;
	        sync.postRender(this.scheduleVelocityCheck);
	    };
	    ValueReaction.prototype.subscribe = function (observerCandidate) {
	        var sub = _super.prototype.subscribe.call(this, observerCandidate);
	        this.subscribers[this.subscribers.length - 1].update(this.current);
	        return sub;
	    };
	    ValueReaction.prototype.getSingleVelocity = function (current, prev) {
	        return typeof current === 'number' && typeof prev === 'number' ? velocityPerSecond(current - prev, this.timeDelta) : velocityPerSecond(parseFloat(current) - parseFloat(prev), this.timeDelta) || 0;
	    };
	    ValueReaction.prototype.getListVelocity = function () {
	        var _this = this;
	        return this.current.map(function (c, i) {
	            return _this.getSingleVelocity(c, _this.prev[i]);
	        });
	    };
	    ValueReaction.prototype.getMapVelocity = function () {
	        var velocity = {};
	        for (var key in this.current) {
	            if (this.current.hasOwnProperty(key)) {
	                velocity[key] = this.getSingleVelocity(this.current[key], this.prev[key]);
	            }
	        }
	        return velocity;
	    };
	    return ValueReaction;
	}(BaseMulticast);
	var value = function (value, initialSubscription) {
	    return new ValueReaction({ value: value, initialSubscription: initialSubscription });
	};

	var multi = function (_a) {
	    var getCount = _a.getCount,
	        getFirst = _a.getFirst,
	        getOutput = _a.getOutput,
	        mapApi = _a.mapApi,
	        setProp = _a.setProp,
	        startActions = _a.startActions;
	    return function (actions) {
	        return action(function (_a) {
	            var update = _a.update,
	                complete = _a.complete,
	                error = _a.error;
	            var numActions = getCount(actions);
	            var output = getOutput();
	            var updateOutput = function () {
	                return update(output);
	            };
	            var numCompletedActions = 0;
	            var subs = startActions(actions, function (a, name) {
	                var hasCompleted = false;
	                return a.start({
	                    complete: function () {
	                        if (!hasCompleted) {
	                            hasCompleted = true;
	                            numCompletedActions++;
	                            if (numCompletedActions === numActions) sync.update(complete);
	                        }
	                    },
	                    error: error,
	                    update: function (v) {
	                        setProp(output, name, v);
	                        sync.update(updateOutput, false, true);
	                    }
	                });
	            });
	            return Object.keys(getFirst(subs)).reduce(function (api, methodName) {
	                api[methodName] = mapApi(subs, methodName);
	                return api;
	            }, {});
	        });
	    };
	};

	var composite = /*#__PURE__*/multi({
	    getOutput: function () {
	        return {};
	    },
	    getCount: function (subs) {
	        return Object.keys(subs).length;
	    },
	    getFirst: function (subs) {
	        return subs[Object.keys(subs)[0]];
	    },
	    mapApi: function (subs, methodName) {
	        return function () {
	            var args = [];
	            for (var _i = 0; _i < arguments.length; _i++) {
	                args[_i] = arguments[_i];
	            }
	            return Object.keys(subs).reduce(function (output, propKey) {
	                var _a;
	                if (subs[propKey][methodName]) {
	                    args[0] && args[0][propKey] !== undefined ? output[propKey] = subs[propKey][methodName](args[0][propKey]) : output[propKey] = (_a = subs[propKey])[methodName].apply(_a, args);
	                }
	                return output;
	            }, {});
	        };
	    },
	    setProp: function (output, name, v) {
	        return output[name] = v;
	    },
	    startActions: function (actions, starter) {
	        return Object.keys(actions).reduce(function (subs, key) {
	            subs[key] = starter(actions[key], key);
	            return subs;
	        }, {});
	    }
	});

	var parallel = /*#__PURE__*/multi({
	    getOutput: function () {
	        return [];
	    },
	    getCount: function (subs) {
	        return subs.length;
	    },
	    getFirst: function (subs) {
	        return subs[0];
	    },
	    mapApi: function (subs, methodName) {
	        return function () {
	            var args = [];
	            for (var _i = 0; _i < arguments.length; _i++) {
	                args[_i] = arguments[_i];
	            }
	            return subs.map(function (sub, i) {
	                if (sub[methodName]) {
	                    return Array.isArray(args[0]) ? sub[methodName](args[0][i]) : sub[methodName].apply(sub, args);
	                }
	            });
	        };
	    },
	    setProp: function (output, name, v) {
	        return output[name] = v;
	    },
	    startActions: function (actions, starter) {
	        return actions.map(function (action, i) {
	            return starter(action, i);
	        });
	    }
	});
	var parallel$1 = function () {
	    var actions = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        actions[_i] = arguments[_i];
	    }
	    return parallel(actions);
	};

	var createVectorTests = function (typeTests) {
	    var testNames = Object.keys(typeTests);
	    var isVectorProp = function (prop, key) {
	        return prop !== undefined && !typeTests[key](prop);
	    };
	    var getVectorKeys = function (props) {
	        return testNames.reduce(function (vectorKeys, key) {
	            if (isVectorProp(props[key], key)) vectorKeys.push(key);
	            return vectorKeys;
	        }, []);
	    };
	    var testVectorProps = function (props) {
	        return props && testNames.some(function (key) {
	            return isVectorProp(props[key], key);
	        });
	    };
	    return { getVectorKeys: getVectorKeys, testVectorProps: testVectorProps };
	};
	var unitTypes = [px, percent, degrees, vh, vw];
	var findUnitType = function (prop) {
	    return unitTypes.find(function (type) {
	        return type.test(prop);
	    });
	};
	var isUnitProp = function (prop) {
	    return Boolean(findUnitType(prop));
	};
	var createAction = function (action, props) {
	    return action(props);
	};
	var reduceArrayValue = function (i) {
	    return function (props, key) {
	        props[key] = props[key][i];
	        return props;
	    };
	};
	var createArrayAction = function (action, props, vectorKeys) {
	    var firstVectorKey = vectorKeys[0];
	    var actionList = props[firstVectorKey].map(function (v, i) {
	        var childActionProps = vectorKeys.reduce(reduceArrayValue(i), __assign({}, props));
	        return getActionCreator(v)(action, childActionProps);
	    });
	    return parallel$1.apply(void 0, actionList);
	};
	var reduceObjectValue = function (key) {
	    return function (props, propKey) {
	        props[propKey] = props[propKey][key];
	        return props;
	    };
	};
	var createObjectAction = function (action, props, vectorKeys) {
	    var firstVectorKey = vectorKeys[0];
	    var actionMap = Object.keys(props[firstVectorKey]).reduce(function (map, key) {
	        var childActionProps = vectorKeys.reduce(reduceObjectValue(key), __assign({}, props));
	        map[key] = getActionCreator(props[firstVectorKey][key])(action, childActionProps);
	        return map;
	    }, {});
	    return composite(actionMap);
	};
	var createUnitAction = function (action, _a) {
	    var from = _a.from,
	        to = _a.to,
	        props = __rest(_a, ["from", "to"]);
	    var unitType = findUnitType(from) || findUnitType(to);
	    var transform = unitType.transform,
	        parse = unitType.parse;
	    return action(__assign({}, props, { from: typeof from === 'string' ? parse(from) : from, to: typeof to === 'string' ? parse(to) : to })).pipe(transform);
	};
	var createColorAction = function (action, _a) {
	    var from = _a.from,
	        to = _a.to,
	        props = __rest(_a, ["from", "to"]);
	    return action(__assign({}, props, { from: 0, to: 1 })).pipe(mixColor(from, to), color.transform);
	};
	var createComplexAction = function (action, _a) {
	    var from = _a.from,
	        to = _a.to,
	        props = __rest(_a, ["from", "to"]);
	    var valueTemplate = complex.createTransformer(from);
	    invariant(valueTemplate(from) === complex.createTransformer(to)(from), "Values '" + from + "' and '" + to + "' are of different format, or a value might have changed value type.");
	    return action(__assign({}, props, { from: 0, to: 1 })).pipe(mixArray(complex.parse(from), complex.parse(to)), valueTemplate);
	};
	var createVectorAction = function (action, typeTests) {
	    var _a = createVectorTests(typeTests),
	        testVectorProps = _a.testVectorProps,
	        getVectorKeys = _a.getVectorKeys;
	    var vectorAction = function (props) {
	        var isVector = testVectorProps(props);
	        if (!isVector) return action(props);
	        var vectorKeys = getVectorKeys(props);
	        var testKey = vectorKeys[0];
	        var testProp = props[testKey];
	        return getActionCreator(testProp)(action, props, vectorKeys);
	    };
	    return vectorAction;
	};
	var getActionCreator = function (prop) {
	    var actionCreator = createAction;
	    if (typeof prop === 'number') {
	        actionCreator = createAction;
	    } else if (Array.isArray(prop)) {
	        actionCreator = createArrayAction;
	    } else if (isUnitProp(prop)) {
	        actionCreator = createUnitAction;
	    } else if (color.test(prop)) {
	        actionCreator = createColorAction;
	    } else if (complex.test(prop)) {
	        actionCreator = createComplexAction;
	    } else if (typeof prop === 'object') {
	        actionCreator = createObjectAction;
	    }
	    return actionCreator;
	};

	var decay = function (props) {
	    if (props === void 0) {
	        props = {};
	    }
	    return action(function (_a) {
	        var complete = _a.complete,
	            update = _a.update;
	        var _b = props.velocity,
	            velocity = _b === void 0 ? 0 : _b,
	            _c = props.from,
	            from = _c === void 0 ? 0 : _c,
	            _d = props.power,
	            power = _d === void 0 ? 0.8 : _d,
	            _e = props.timeConstant,
	            timeConstant = _e === void 0 ? 350 : _e,
	            _f = props.restDelta,
	            restDelta = _f === void 0 ? 0.5 : _f,
	            modifyTarget = props.modifyTarget;
	        var elapsed = 0;
	        var amplitude = power * velocity;
	        var idealTarget = Math.round(from + amplitude);
	        var target = typeof modifyTarget === 'undefined' ? idealTarget : modifyTarget(idealTarget);
	        var process = sync.update(function (_a) {
	            var frameDelta = _a.delta;
	            elapsed += frameDelta;
	            var delta = -amplitude * Math.exp(-elapsed / timeConstant);
	            var isMoving = delta > restDelta || delta < -restDelta;
	            var current = isMoving ? target + delta : target;
	            update(current);
	            if (!isMoving) {
	                cancelSync.update(process);
	                complete();
	            }
	        }, true);
	        return {
	            stop: function () {
	                return cancelSync.update(process);
	            }
	        };
	    });
	};
	var vectorDecay = /*#__PURE__*/createVectorAction(decay, {
	    from: number.test,
	    modifyTarget: function (func) {
	        return typeof func === 'function';
	    },
	    velocity: number.test
	});

	var spring = function (props) {
	    if (props === void 0) {
	        props = {};
	    }
	    return action(function (_a) {
	        var update = _a.update,
	            complete = _a.complete;
	        var _b = props.velocity,
	            velocity = _b === void 0 ? 0.0 : _b;
	        var _c = props.from,
	            from = _c === void 0 ? 0.0 : _c,
	            _d = props.to,
	            to = _d === void 0 ? 0.0 : _d,
	            _e = props.stiffness,
	            stiffness = _e === void 0 ? 100 : _e,
	            _f = props.damping,
	            damping = _f === void 0 ? 10 : _f,
	            _g = props.mass,
	            mass = _g === void 0 ? 1.0 : _g,
	            _h = props.restSpeed,
	            restSpeed = _h === void 0 ? 0.01 : _h,
	            _j = props.restDelta,
	            restDelta = _j === void 0 ? 0.01 : _j;
	        var initialVelocity = velocity ? -(velocity / 1000) : 0.0;
	        var t = 0;
	        var delta = to - from;
	        var position = from;
	        var prevPosition = position;
	        var process = sync.update(function (_a) {
	            var timeDelta = _a.delta;
	            t += timeDelta;
	            var dampingRatio = damping / (2 * Math.sqrt(stiffness * mass));
	            var angularFreq = Math.sqrt(stiffness / mass) / 1000;
	            prevPosition = position;
	            if (dampingRatio < 1) {
	                var envelope = Math.exp(-dampingRatio * angularFreq * t);
	                var expoDecay = angularFreq * Math.sqrt(1.0 - dampingRatio * dampingRatio);
	                position = to - envelope * ((initialVelocity + dampingRatio * angularFreq * delta) / expoDecay * Math.sin(expoDecay * t) + delta * Math.cos(expoDecay * t));
	            } else {
	                var envelope = Math.exp(-angularFreq * t);
	                position = to - envelope * (delta + (initialVelocity + angularFreq * delta) * t);
	            }
	            velocity = velocityPerSecond(position - prevPosition, timeDelta);
	            var isBelowVelocityThreshold = Math.abs(velocity) <= restSpeed;
	            var isBelowDisplacementThreshold = Math.abs(to - position) <= restDelta;
	            if (isBelowVelocityThreshold && isBelowDisplacementThreshold) {
	                position = to;
	                update(position);
	                cancelSync.update(process);
	                complete();
	            } else {
	                update(position);
	            }
	        }, true);
	        return {
	            stop: function () {
	                return cancelSync.update(process);
	            }
	        };
	    });
	};
	var vectorSpring = /*#__PURE__*/createVectorAction(spring, {
	    from: number.test,
	    to: number.test,
	    stiffness: number.test,
	    damping: number.test,
	    mass: number.test,
	    velocity: number.test
	});

	var inertia = function (_a) {
	    var _b = _a.from,
	        from = _b === void 0 ? 0 : _b,
	        _c = _a.velocity,
	        velocity = _c === void 0 ? 0 : _c,
	        min = _a.min,
	        max = _a.max,
	        _d = _a.power,
	        power = _d === void 0 ? 0.8 : _d,
	        _e = _a.timeConstant,
	        timeConstant = _e === void 0 ? 700 : _e,
	        _f = _a.bounceStiffness,
	        bounceStiffness = _f === void 0 ? 500 : _f,
	        _g = _a.bounceDamping,
	        bounceDamping = _g === void 0 ? 10 : _g,
	        _h = _a.restDelta,
	        restDelta = _h === void 0 ? 1 : _h,
	        modifyTarget = _a.modifyTarget;
	    return action(function (_a) {
	        var update = _a.update,
	            complete = _a.complete;
	        var current = value(from);
	        var activeAnimation;
	        var isSpring = false;
	        var isLessThanMin = function (v) {
	            return min !== undefined && v <= min;
	        };
	        var isMoreThanMax = function (v) {
	            return max !== undefined && v >= max;
	        };
	        var isOutOfBounds = function (v) {
	            return isLessThanMin(v) || isMoreThanMax(v);
	        };
	        var isTravellingAwayFromBounds = function (v, currentVelocity) {
	            return isLessThanMin(v) && currentVelocity < 0 || isMoreThanMax(v) && currentVelocity > 0;
	        };
	        var startAnimation = function (animation, next) {
	            activeAnimation && activeAnimation.stop();
	            activeAnimation = animation.start({
	                update: function (v) {
	                    return current.update(v);
	                },
	                complete: function () {
	                    if (next) {
	                        next();
	                        return;
	                    }
	                    complete();
	                }
	            });
	        };
	        var startSpring = function (props) {
	            isSpring = true;
	            startAnimation(vectorSpring(__assign({}, props, { to: isLessThanMin(props.from) ? min : max, stiffness: bounceStiffness, damping: bounceDamping, restDelta: restDelta })));
	        };
	        current.subscribe(function (v) {
	            update(v);
	            var currentVelocity = current.getVelocity();
	            if (activeAnimation && !isSpring && isTravellingAwayFromBounds(v, currentVelocity)) {
	                startSpring({ from: v, velocity: currentVelocity });
	            }
	        });
	        if (isOutOfBounds(from)) {
	            startSpring({ from: from, velocity: velocity });
	        } else if (velocity !== 0) {
	            var animation = vectorDecay({
	                from: from,
	                velocity: velocity,
	                timeConstant: timeConstant,
	                power: power,
	                restDelta: isOutOfBounds(from) ? 20 : restDelta,
	                modifyTarget: modifyTarget
	            });
	            startAnimation(animation, function () {
	                var v = current.get();
	                if (isOutOfBounds(v)) {
	                    startSpring({ from: v, velocity: current.getVelocity() });
	                } else {
	                    complete();
	                }
	            });
	        } else {
	            complete();
	        }
	        return {
	            stop: function () {
	                return activeAnimation && activeAnimation.stop();
	            }
	        };
	    });
	};
	var index$1 = /*#__PURE__*/createVectorAction(inertia, {
	    from: number.test,
	    velocity: number.test,
	    min: number.test,
	    max: number.test,
	    damping: number.test,
	    stiffness: number.test,
	    modifyTarget: function (func) {
	        return typeof func === 'function';
	    }
	});

	var frame$1 = function () {
	    return action(function (_a) {
	        var update = _a.update;
	        var initialTime = 0;
	        var process = sync.update(function (_a) {
	            var timestamp = _a.timestamp;
	            if (!initialTime) initialTime = timestamp;
	            update(timestamp - initialTime);
	        }, true, true);
	        return {
	            stop: function () {
	                return cancelSync.update(process);
	            }
	        };
	    });
	};

	var scrubber = function (_a) {
	    var _b = _a.from,
	        from = _b === void 0 ? 0 : _b,
	        _c = _a.to,
	        to = _c === void 0 ? 1 : _c,
	        _d = _a.ease,
	        ease = _d === void 0 ? linear : _d;
	    return action(function (_a) {
	        var update = _a.update;
	        return {
	            seek: function (progress$$1) {
	                return update(progress$$1);
	            }
	        };
	    }).pipe(ease, function (v) {
	        return mix(from, to, v);
	    });
	};
	var vectorScrubber = /*#__PURE__*/createVectorAction(scrubber, {
	    ease: function (func) {
	        return typeof func === 'function';
	    },
	    from: number.test,
	    to: number.test
	});

	var clampProgress$1 = /*#__PURE__*/clamp$1$1(0, 1);
	var tween = function (props) {
	    if (props === void 0) {
	        props = {};
	    }
	    return action(function (_a) {
	        var update = _a.update,
	            complete = _a.complete;
	        var _b = props.duration,
	            duration = _b === void 0 ? 300 : _b,
	            _c = props.ease,
	            ease = _c === void 0 ? easeOut : _c,
	            _d = props.flip,
	            flip = _d === void 0 ? 0 : _d,
	            _e = props.loop,
	            loop = _e === void 0 ? 0 : _e,
	            _f = props.yoyo,
	            yoyo = _f === void 0 ? 0 : _f;
	        var _g = props.from,
	            from = _g === void 0 ? 0 : _g,
	            _h = props.to,
	            to = _h === void 0 ? 1 : _h,
	            _j = props.elapsed,
	            elapsed = _j === void 0 ? 0 : _j,
	            _k = props.playDirection,
	            playDirection = _k === void 0 ? 1 : _k,
	            _l = props.flipCount,
	            flipCount = _l === void 0 ? 0 : _l,
	            _m = props.yoyoCount,
	            yoyoCount = _m === void 0 ? 0 : _m,
	            _o = props.loopCount,
	            loopCount = _o === void 0 ? 0 : _o;
	        var playhead = vectorScrubber({ from: from, to: to, ease: ease }).start(update);
	        var currentProgress = 0;
	        var process;
	        var isActive = false;
	        var reverseTween = function () {
	            if (elapsed > duration) {
	                var remainder = elapsed - duration;
	                elapsed = elapsed - remainder * 2;
	            } else if (elapsed < 0) {
	                var remainder = -1 * elapsed;
	                elapsed = elapsed + remainder * 2;
	            }
	            playDirection *= -1;
	        };
	        var isTweenComplete = function () {
	            var _a;
	            var isComplete = playDirection === 1 ? isActive && elapsed >= duration : isActive && elapsed <= 0;
	            if (!isComplete) return false;
	            if (isComplete && !loop && !flip && !yoyo) return true;
	            var isStepTaken = false;
	            if (loop && loopCount < loop) {
	                elapsed = duration - elapsed;
	                loopCount++;
	                isStepTaken = true;
	            } else if (flip && flipCount < flip) {
	                elapsed = duration - elapsed;
	                _a = [to, from], from = _a[0], to = _a[1];
	                playhead = vectorScrubber({ from: from, to: to, ease: ease }).start(update);
	                flipCount++;
	                isStepTaken = true;
	            } else if (yoyo && yoyoCount < yoyo) {
	                reverseTween();
	                yoyoCount++;
	                isStepTaken = true;
	            }
	            return !isStepTaken;
	        };
	        var updateTween = function () {
	            currentProgress = clampProgress$1(progress(0, duration, elapsed));
	            playhead.seek(currentProgress);
	        };
	        var startTimer = function () {
	            isActive = true;
	            process = sync.update(function (_a) {
	                var delta = _a.delta;
	                elapsed += delta * playDirection;
	                updateTween();
	                if (isTweenComplete() && complete) {
	                    cancelSync.update(process);
	                    sync.update(complete, false, true);
	                }
	            }, true);
	        };
	        var stopTimer = function () {
	            isActive = false;
	            if (process) cancelSync.update(process);
	        };
	        startTimer();
	        return {
	            isActive: function () {
	                return isActive;
	            },
	            getElapsed: function () {
	                return clamp$1$1(0, duration, elapsed);
	            },
	            getProgress: function () {
	                return currentProgress;
	            },
	            stop: function () {
	                stopTimer();
	            },
	            pause: function () {
	                stopTimer();
	                return this;
	            },
	            resume: function () {
	                if (!isActive) startTimer();
	                return this;
	            },
	            seek: function (newProgress) {
	                elapsed = mix(0, duration, newProgress);
	                sync.update(updateTween, false, true);
	                return this;
	            },
	            reverse: function () {
	                reverseTween();
	                return this;
	            }
	        };
	    });
	};

	var clampProgress$1$1 = /*#__PURE__*/clamp$1$1(0, 1);
	var defaultEasings = function (values, easing$$1) {
	    return values.map(function () {
	        return easing$$1 || easeOut;
	    }).splice(0, values.length - 1);
	};
	var defaultTimings = function (values) {
	    var numValues = values.length;
	    return values.map(function (value, i) {
	        return i !== 0 ? i / (numValues - 1) : 0;
	    });
	};
	var interpolateScrubbers = function (input, scrubbers, update) {
	    var rangeLength = input.length;
	    var finalInputIndex = rangeLength - 1;
	    var finalScrubberIndex = finalInputIndex - 1;
	    var subs = scrubbers.map(function (scrub) {
	        return scrub.start(update);
	    });
	    return function (v) {
	        if (v <= input[0]) {
	            subs[0].seek(0);
	        }
	        if (v >= input[finalInputIndex]) {
	            subs[finalScrubberIndex].seek(1);
	        }
	        var i = 1;
	        for (; i < rangeLength; i++) {
	            if (input[i] > v || i === finalInputIndex) break;
	        }
	        var progressInRange = progress(input[i - 1], input[i], v);
	        subs[i - 1].seek(clampProgress$1$1(progressInRange));
	    };
	};
	var keyframes = function (_a) {
	    var easings = _a.easings,
	        _b = _a.ease,
	        ease = _b === void 0 ? linear : _b,
	        times = _a.times,
	        values = _a.values,
	        tweenProps = __rest(_a, ["easings", "ease", "times", "values"]);
	    easings = Array.isArray(easings) ? easings : defaultEasings(values, easings);
	    times = times || defaultTimings(values);
	    var scrubbers = easings.map(function (easing$$1, i) {
	        return vectorScrubber({
	            from: values[i],
	            to: values[i + 1],
	            ease: easing$$1
	        });
	    });
	    return tween(__assign({}, tweenProps, { ease: ease })).applyMiddleware(function (update) {
	        return interpolateScrubbers(times, scrubbers, update);
	    });
	};

	var physics = function (props) {
	    if (props === void 0) {
	        props = {};
	    }
	    return action(function (_a) {
	        var complete = _a.complete,
	            update = _a.update;
	        var _b = props.acceleration,
	            acceleration = _b === void 0 ? 0 : _b,
	            _c = props.friction,
	            friction = _c === void 0 ? 0 : _c,
	            _d = props.velocity,
	            velocity = _d === void 0 ? 0 : _d,
	            springStrength = props.springStrength,
	            to = props.to;
	        var _e = props.restSpeed,
	            restSpeed = _e === void 0 ? 0.001 : _e,
	            _f = props.from,
	            from = _f === void 0 ? 0 : _f;
	        var current = from;
	        var process = sync.update(function (_a) {
	            var delta = _a.delta;
	            var elapsed = Math.max(delta, 16);
	            if (acceleration) velocity += velocityPerFrame(acceleration, elapsed);
	            if (friction) velocity *= Math.pow(1 - friction, elapsed / 100);
	            if (springStrength !== undefined && to !== undefined) {
	                var distanceToTarget = to - current;
	                velocity += distanceToTarget * velocityPerFrame(springStrength, elapsed);
	            }
	            current += velocityPerFrame(velocity, elapsed);
	            update(current);
	            var isComplete = restSpeed !== false && (!velocity || Math.abs(velocity) <= restSpeed);
	            if (isComplete) {
	                cancelSync.update(process);
	                complete();
	            }
	        }, true);
	        return {
	            set: function (v) {
	                current = v;
	                return this;
	            },
	            setAcceleration: function (v) {
	                acceleration = v;
	                return this;
	            },
	            setFriction: function (v) {
	                friction = v;
	                return this;
	            },
	            setSpringStrength: function (v) {
	                springStrength = v;
	                return this;
	            },
	            setSpringTarget: function (v) {
	                to = v;
	                return this;
	            },
	            setVelocity: function (v) {
	                velocity = v;
	                return this;
	            },
	            stop: function () {
	                return cancelSync.update(process);
	            }
	        };
	    });
	};
	var vectorPhysics = /*#__PURE__*/createVectorAction(physics, {
	    acceleration: number.test,
	    friction: number.test,
	    velocity: number.test,
	    from: number.test,
	    to: number.test,
	    springStrength: number.test
	});

	var DEFAULT_DURATION = 300;
	var flattenTimings = function (instructions) {
	    var flatInstructions = [];
	    var lastArg = instructions[instructions.length - 1];
	    var isStaggered = typeof lastArg === 'number';
	    var staggerDelay = isStaggered ? lastArg : 0;
	    var segments = isStaggered ? instructions.slice(0, -1) : instructions;
	    var numSegments = segments.length;
	    var offset = 0;
	    segments.forEach(function (item, i) {
	        flatInstructions.push(item);
	        if (i !== numSegments - 1) {
	            var duration = item.duration || DEFAULT_DURATION;
	            offset += staggerDelay;
	            flatInstructions.push("-" + (duration - offset));
	        }
	    });
	    return flatInstructions;
	};
	var flattenArrayInstructions = function (instructions, instruction) {
	    Array.isArray(instruction) ? instructions.push.apply(instructions, flattenTimings(instruction)) : instructions.push(instruction);
	    return instructions;
	};
	var convertDefToProps = function (props, def, i) {
	    var duration = props.duration,
	        easings = props.easings,
	        times = props.times,
	        values = props.values;
	    var numValues = values.length;
	    var prevTimeTo = times[numValues - 1];
	    var timeFrom = def.at === 0 ? 0 : def.at / duration;
	    var timeTo = (def.at + def.duration) / duration;
	    if (i === 0) {
	        values.push(def.from);
	        times.push(timeFrom);
	    } else {
	        if (prevTimeTo !== timeFrom) {
	            if (def.from !== undefined) {
	                values.push(values[numValues - 1]);
	                times.push(timeFrom);
	                easings.push(linear);
	            }
	            var from = def.from !== undefined ? def.from : values[numValues - 1];
	            values.push(from);
	            times.push(timeFrom);
	            easings.push(linear);
	        } else if (def.from !== undefined) {
	            values.push(def.from);
	            times.push(timeFrom);
	            easings.push(linear);
	        }
	    }
	    values.push(def.to);
	    times.push(timeTo);
	    easings.push(def.ease || easeInOut);
	    return props;
	};
	var timeline = function (instructions, _a) {
	    var _b = _a === void 0 ? {} : _a,
	        duration = _b.duration,
	        elapsed = _b.elapsed,
	        ease = _b.ease,
	        loop = _b.loop,
	        flip = _b.flip,
	        yoyo = _b.yoyo;
	    var playhead = 0;
	    var calculatedDuration = 0;
	    var flatInstructions = instructions.reduce(flattenArrayInstructions, []);
	    var animationDefs = [];
	    flatInstructions.forEach(function (instruction) {
	        if (typeof instruction === 'string') {
	            playhead += parseFloat(instruction);
	        } else if (typeof instruction === 'number') {
	            playhead = instruction;
	        } else {
	            var def = __assign({}, instruction, { at: playhead });
	            def.duration = def.duration === undefined ? DEFAULT_DURATION : def.duration;
	            animationDefs.push(def);
	            playhead += def.duration;
	            calculatedDuration = Math.max(calculatedDuration, def.at + def.duration);
	        }
	    });
	    var tracks = {};
	    var numDefs = animationDefs.length;
	    for (var i = 0; i < numDefs; i++) {
	        var def = animationDefs[i];
	        var track = def.track;
	        if (track === undefined) {
	            throw new Error('No track defined');
	        }
	        if (!tracks.hasOwnProperty(track)) tracks[track] = [];
	        tracks[track].push(def);
	    }
	    var trackKeyframes = {};
	    for (var key in tracks) {
	        if (tracks.hasOwnProperty(key)) {
	            var keyframeProps = tracks[key].reduce(convertDefToProps, {
	                duration: calculatedDuration,
	                easings: [],
	                times: [],
	                values: []
	            });
	            trackKeyframes[key] = keyframes(__assign({}, keyframeProps, { duration: duration || calculatedDuration, ease: ease,
	                elapsed: elapsed,
	                loop: loop,
	                yoyo: yoyo,
	                flip: flip }));
	        }
	    }
	    return composite(trackKeyframes);
	};

	var listen = function (element, events, options) {
	    return action(function (_a) {
	        var update = _a.update;
	        var eventNames = events.split(' ').map(function (eventName) {
	            element.addEventListener(eventName, update, options);
	            return eventName;
	        });
	        return {
	            stop: function () {
	                return eventNames.forEach(function (eventName) {
	                    return element.removeEventListener(eventName, update, options);
	                });
	            }
	        };
	    });
	};

	var defaultPointerPos = function () {
	    return {
	        clientX: 0,
	        clientY: 0,
	        pageX: 0,
	        pageY: 0,
	        x: 0,
	        y: 0
	    };
	};
	var eventToPoint = function (e, point) {
	    if (point === void 0) {
	        point = defaultPointerPos();
	    }
	    point.clientX = point.x = e.clientX;
	    point.clientY = point.y = e.clientY;
	    point.pageX = e.pageX;
	    point.pageY = e.pageY;
	    return point;
	};

	var points = [/*#__PURE__*/defaultPointerPos()];
	var isTouchDevice = false;
	if (typeof document !== 'undefined') {
	    var updatePointsLocation = function (_a) {
	        var touches = _a.touches;
	        isTouchDevice = true;
	        var numTouches = touches.length;
	        points.length = 0;
	        for (var i = 0; i < numTouches; i++) {
	            var thisTouch = touches[i];
	            points.push(eventToPoint(thisTouch));
	        }
	    };
	    listen(document, 'touchstart touchmove', {
	        passive: true,
	        capture: true
	    }).start(updatePointsLocation);
	}
	var multitouch = function (_a) {
	    var _b = _a === void 0 ? {} : _a,
	        _c = _b.preventDefault,
	        preventDefault = _c === void 0 ? true : _c,
	        _d = _b.scale,
	        scale = _d === void 0 ? 1.0 : _d,
	        _e = _b.rotate,
	        rotate = _e === void 0 ? 0.0 : _e;
	    return action(function (_a) {
	        var update = _a.update;
	        var output = {
	            touches: points,
	            scale: scale,
	            rotate: rotate
	        };
	        var initialDistance = 0.0;
	        var initialRotation = 0.0;
	        var isGesture = points.length > 1;
	        if (isGesture) {
	            var firstTouch = points[0],
	                secondTouch = points[1];
	            initialDistance = distance(firstTouch, secondTouch);
	            initialRotation = angle(firstTouch, secondTouch);
	        }
	        var updatePoint = function () {
	            if (isGesture) {
	                var firstTouch = points[0],
	                    secondTouch = points[1];
	                var newDistance = distance(firstTouch, secondTouch);
	                var newRotation = angle(firstTouch, secondTouch);
	                output.scale = scale * (newDistance / initialDistance);
	                output.rotate = rotate + (newRotation - initialRotation);
	            }
	            update(output);
	        };
	        var onMove = function (e) {
	            if (preventDefault || e.touches.length > 1) e.preventDefault();
	            sync.update(updatePoint);
	        };
	        var updateOnMove = listen(document, 'touchmove', {
	            passive: !preventDefault
	        }).start(onMove);
	        if (isTouchDevice) sync.update(updatePoint);
	        return {
	            stop: function () {
	                cancelSync.update(updatePoint);
	                updateOnMove.stop();
	            }
	        };
	    });
	};
	var getIsTouchDevice = function () {
	    return isTouchDevice;
	};

	var point = /*#__PURE__*/defaultPointerPos();
	var isMouseDevice = false;
	if (typeof document !== 'undefined') {
	    var updatePointLocation = function (e) {
	        isMouseDevice = true;
	        eventToPoint(e, point);
	    };
	    listen(document, 'mousedown mousemove', true).start(updatePointLocation);
	}
	var mouse = function (_a) {
	    var _b = (_a === void 0 ? {} : _a).preventDefault,
	        preventDefault = _b === void 0 ? true : _b;
	    return action(function (_a) {
	        var update = _a.update;
	        var updatePoint = function () {
	            return update(point);
	        };
	        var onMove = function (e) {
	            if (preventDefault) e.preventDefault();
	            sync.update(updatePoint);
	        };
	        var updateOnMove = listen(document, 'mousemove').start(onMove);
	        if (isMouseDevice) sync.update(updatePoint);
	        return {
	            stop: function () {
	                cancelSync.update(updatePoint);
	                updateOnMove.stop();
	            }
	        };
	    });
	};

	var getFirstTouch = function (_a) {
	    var firstTouch = _a[0];
	    return firstTouch;
	};
	var pointer = function (props) {
	    if (props === void 0) {
	        props = {};
	    }
	    return getIsTouchDevice() ? multitouch(props).pipe(function (_a) {
	        var touches = _a.touches;
	        return touches;
	    }, getFirstTouch) : mouse(props);
	};
	var index$1$1 = function (_a) {
	    if (_a === void 0) {
	        _a = {};
	    }
	    var x = _a.x,
	        y = _a.y,
	        props = __rest(_a, ["x", "y"]);
	    if (x !== undefined || y !== undefined) {
	        var applyXOffset_1 = applyOffset(x || 0);
	        var applyYOffset_1 = applyOffset(y || 0);
	        var delta_1 = { x: 0, y: 0 };
	        return pointer(props).pipe(function (point) {
	            delta_1.x = applyXOffset_1(point.x);
	            delta_1.y = applyYOffset_1(point.y);
	            return delta_1;
	        });
	    } else {
	        return pointer(props);
	    }
	};

	var chain = function () {
	    var actions = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        actions[_i] = arguments[_i];
	    }
	    return action(function (_a) {
	        var update = _a.update,
	            complete = _a.complete;
	        var i = 0;
	        var current;
	        var playCurrent = function () {
	            current = actions[i].start({
	                complete: function () {
	                    i++;
	                    i >= actions.length ? complete() : playCurrent();
	                },
	                update: update
	            });
	        };
	        playCurrent();
	        return {
	            stop: function () {
	                return current && current.stop();
	            }
	        };
	    });
	};

	var crossfade = function (a, b) {
	    return action(function (observer) {
	        var balance = 0;
	        var fadable = parallel$1(a, b).start(__assign({}, observer, { update: function (_a) {
	                var va = _a[0],
	                    vb = _a[1];
	                observer.update(mix(va, vb, balance));
	            } }));
	        return {
	            setBalance: function (v) {
	                return balance = v;
	            },
	            stop: function () {
	                return fadable.stop();
	            }
	        };
	    });
	};

	var delay = function (timeToDelay) {
	    return action(function (_a) {
	        var complete = _a.complete;
	        var timeout = setTimeout(complete, timeToDelay);
	        return {
	            stop: function () {
	                return clearTimeout(timeout);
	            }
	        };
	    });
	};

	var merge = function () {
	    var actions = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        actions[_i] = arguments[_i];
	    }
	    return action(function (observer) {
	        var subs = actions.map(function (thisAction) {
	            return thisAction.start(observer);
	        });
	        return {
	            stop: function () {
	                return subs.forEach(function (sub) {
	                    return sub.stop();
	                });
	            }
	        };
	    });
	};

	var schedule = function (scheduler, schedulee) {
	    return action(function (_a) {
	        var update = _a.update,
	            complete = _a.complete;
	        var latest;
	        var schedulerSub = scheduler.start({
	            update: function () {
	                return latest !== undefined && update(latest);
	            },
	            complete: complete
	        });
	        var scheduleeSub = schedulee.start({
	            update: function (v) {
	                return latest = v;
	            },
	            complete: complete
	        });
	        return {
	            stop: function () {
	                schedulerSub.stop();
	                scheduleeSub.stop();
	            }
	        };
	    });
	};

	var stagger = function (actions, interval) {
	    var intervalIsNumber = typeof interval === 'number';
	    var actionsWithDelay = actions.map(function (a, i) {
	        var timeToDelay = intervalIsNumber ? interval * i : interval(i);
	        return chain(delay(timeToDelay), a);
	    });
	    return parallel$1.apply(void 0, actionsWithDelay);
	};

	var appendUnit = function (unit) {
	    return function (v) {
	        return "" + v + unit;
	    };
	};
	var steps$1 = function (st, min, max) {
	    if (min === void 0) {
	        min = 0;
	    }
	    if (max === void 0) {
	        max = 1;
	    }
	    return function (v) {
	        var current = progress(min, max, v);
	        return mix(min, max, stepProgress(st, current));
	    };
	};
	var transformMap = function (childTransformers) {
	    return function (v) {
	        var output = __assign({}, v);
	        for (var key in childTransformers) {
	            if (childTransformers.hasOwnProperty(key)) {
	                var childTransformer = childTransformers[key];
	                output[key] = childTransformer(v[key]);
	            }
	        }
	        return output;
	    };
	};

	var transformers = /*#__PURE__*/Object.freeze({
	    applyOffset: applyOffset,
	    clamp: clamp$1$1,
	    conditional: conditional,
	    interpolate: interpolate,
	    blendArray: mixArray,
	    blendColor: mixColor,
	    pipe: pipe,
	    smooth: smooth,
	    snap: snap,
	    generateStaticSpring: springForce,
	    nonlinearSpring: springForceExpo,
	    linearSpring: springForceLinear,
	    wrap: wrap$1,
	    appendUnit: appendUnit,
	    steps: steps$1,
	    transformMap: transformMap
	});

	var css$1 = function (element, props) {
	    warning(false, 'css() is deprecated, use styler instead');
	    return index(element, props);
	};
	var svg$1 = function (element, props) {
	    warning(false, 'svg() is deprecated, use styler instead');
	    return index(element, props);
	};

	var popmotion_es = /*#__PURE__*/Object.freeze({
		valueTypes: styleValueTypes_es,
		easing: easing_es,
		action: action,
		multicast: multicast,
		value: value,
		decay: vectorDecay,
		inertia: index$1,
		keyframes: keyframes,
		everyFrame: frame$1,
		physics: vectorPhysics,
		spring: vectorSpring,
		timeline: timeline,
		tween: tween,
		listen: listen,
		pointer: index$1$1,
		mouse: mouse,
		multitouch: multitouch,
		chain: chain,
		composite: composite,
		crossfade: crossfade,
		delay: delay,
		merge: merge,
		parallel: parallel$1,
		schedule: schedule,
		stagger: stagger,
		calc: calc,
		transform: transformers,
		css: css$1,
		svg: svg$1,
		Action: Action,
		ValueReaction: ValueReaction,
		styler: index
	});

	/*! *****************************************************************************
	Copyright (c) Microsoft Corporation. All rights reserved.
	Licensed under the Apache License, Version 2.0 (the "License"); you may not use
	this file except in compliance with the License. You may obtain a copy of the
	License at http://www.apache.org/licenses/LICENSE-2.0

	THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
	KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
	WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
	MERCHANTABLITY OR NON-INFRINGEMENT.

	See the Apache Version 2.0 License for specific language governing permissions
	and limitations under the License.
	***************************************************************************** */

	var __assign$4 = function() {
	    __assign$4 = Object.assign || function __assign(t) {
	        for (var s, i = 1, n = arguments.length; i < n; i++) {
	            s = arguments[i];
	            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
	        }
	        return t;
	    };
	    return __assign$4.apply(this, arguments);
	};

	var clamp$2 = function (min, max) { return function (v) {
	    return Math.max(Math.min(v, max), min);
	}; };
	var sanitize$1 = function (v) { return (v % 1 ? Number(v.toFixed(5)) : v); };
	var singleColorRegex = /^(#[0-9a-f]{3}|#(?:[0-9a-f]{2}){2,4}|(rgb|hsl)a?\((-?\d+%?[,\s]+){2,3}\s*[\d\.]+%?\))$/i;

	var number$1 = {
	    test: function (v) { return typeof v === 'number'; },
	    parse: parseFloat,
	    transform: function (v) { return v; }
	};
	var alpha$1 = __assign$4({}, number$1, { transform: clamp$2(0, 1) });
	var scale$1 = __assign$4({}, number$1, { default: 1 });

	var createUnitType$1 = function (unit) { return ({
	    test: function (v) {
	        return typeof v === 'string' && v.endsWith(unit) && v.split(' ').length === 1;
	    },
	    parse: parseFloat,
	    transform: function (v) { return "" + v + unit; }
	}); };
	var degrees$1 = createUnitType$1('deg');
	var percent$1 = createUnitType$1('%');
	var px$1 = createUnitType$1('px');
	var progressPercentage$1 = __assign$4({}, percent$1, { parse: function (v) { return percent$1.parse(v) / 100; }, transform: function (v) { return percent$1.transform(v * 100); } });

	var getValueFromFunctionString$1 = function (value) {
	    return value.substring(value.indexOf('(') + 1, value.lastIndexOf(')'));
	};
	var clampRgbUnit$1 = clamp$2(0, 255);
	var isRgba$1 = function (v) { return v.red !== undefined; };
	var isHsla$1 = function (v) { return v.hue !== undefined; };
	var splitColorValues$1 = function (terms) {
	    return function (v) {
	        if (typeof v !== 'string')
	            return v;
	        var values = {};
	        var valuesArray = getValueFromFunctionString$1(v).split(/,\s*/);
	        for (var i = 0; i < 4; i++) {
	            values[terms[i]] =
	                valuesArray[i] !== undefined ? parseFloat(valuesArray[i]) : 1;
	        }
	        return values;
	    };
	};
	var rgbaTemplate$1 = function (_a) {
	    var red = _a.red, green = _a.green, blue = _a.blue, _b = _a.alpha, alpha$$1 = _b === void 0 ? 1 : _b;
	    return "rgba(" + red + ", " + green + ", " + blue + ", " + alpha$$1 + ")";
	};
	var hslaTemplate$1 = function (_a) {
	    var hue = _a.hue, saturation = _a.saturation, lightness = _a.lightness, _b = _a.alpha, alpha$$1 = _b === void 0 ? 1 : _b;
	    return "hsla(" + hue + ", " + saturation + ", " + lightness + ", " + alpha$$1 + ")";
	};
	var rgbUnit$1 = __assign$4({}, number$1, { transform: function (v) { return Math.round(clampRgbUnit$1(v)); } });
	function isColorString(color, colorType) {
	    return color.startsWith(colorType) && singleColorRegex.test(color);
	}
	var rgba$1 = {
	    test: function (v) { return (typeof v === 'string' ? isColorString(v, 'rgb') : isRgba$1(v)); },
	    parse: splitColorValues$1(['red', 'green', 'blue', 'alpha']),
	    transform: function (_a) {
	        var red = _a.red, green = _a.green, blue = _a.blue, alpha$$1 = _a.alpha;
	        return rgbaTemplate$1({
	            red: rgbUnit$1.transform(red),
	            green: rgbUnit$1.transform(green),
	            blue: rgbUnit$1.transform(blue),
	            alpha: sanitize$1(alpha$$1)
	        });
	    }
	};
	var hsla$1 = {
	    test: function (v) { return (typeof v === 'string' ? isColorString(v, 'hsl') : isHsla$1(v)); },
	    parse: splitColorValues$1(['hue', 'saturation', 'lightness', 'alpha']),
	    transform: function (_a) {
	        var hue = _a.hue, saturation = _a.saturation, lightness = _a.lightness, alpha$$1 = _a.alpha;
	        return hslaTemplate$1({
	            hue: Math.round(hue),
	            saturation: percent$1.transform(sanitize$1(saturation)),
	            lightness: percent$1.transform(sanitize$1(lightness)),
	            alpha: sanitize$1(alpha$$1)
	        });
	    }
	};
	var hex$1 = __assign$4({}, rgba$1, { test: function (v) { return typeof v === 'string' && isColorString(v, '#'); }, parse: function (v) {
	        var r = '';
	        var g = '';
	        var b = '';
	        if (v.length > 4) {
	            r = v.substr(1, 2);
	            g = v.substr(3, 2);
	            b = v.substr(5, 2);
	        }
	        else {
	            r = v.substr(1, 1);
	            g = v.substr(2, 1);
	            b = v.substr(3, 1);
	            r += r;
	            g += g;
	            b += b;
	        }
	        return {
	            red: parseInt(r, 16),
	            green: parseInt(g, 16),
	            blue: parseInt(b, 16),
	            alpha: 1
	        };
	    } });
	var color$1 = {
	    test: function (v) {
	        return (typeof v === 'string' && singleColorRegex.test(v)) ||
	            isRgba$1(v) ||
	            isHsla$1(v);
	    },
	    parse: function (v) {
	        if (rgba$1.test(v)) {
	            return rgba$1.parse(v);
	        }
	        else if (hsla$1.test(v)) {
	            return hsla$1.parse(v);
	        }
	        else if (hex$1.test(v)) {
	            return hex$1.parse(v);
	        }
	        return v;
	    },
	    transform: function (v) {
	        if (isRgba$1(v)) {
	            return rgba$1.transform(v);
	        }
	        else if (isHsla$1(v)) {
	            return hsla$1.transform(v);
	        }
	        return v;
	    }
	};

	/*! *****************************************************************************
	Copyright (c) Microsoft Corporation. All rights reserved.
	Licensed under the Apache License, Version 2.0 (the "License"); you may not use
	this file except in compliance with the License. You may obtain a copy of the
	License at http://www.apache.org/licenses/LICENSE-2.0

	THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
	KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
	WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
	MERCHANTABLITY OR NON-INFRINGEMENT.

	See the Apache Version 2.0 License for specific language governing permissions
	and limitations under the License.
	***************************************************************************** */

	var __assign$5 = function () {
	    __assign$5 = Object.assign || function __assign(t) {
	        for (var s, i = 1, n = arguments.length; i < n; i++) {
	            s = arguments[i];
	            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
	        }
	        return t;
	    };
	    return __assign$5.apply(this, arguments);
	};

	function __rest$2(s, e) {
	    var t = {};
	    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
	    if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0) t[p[i]] = s[p[i]];
	    return t;
	}

	var createStyler$1 = function (_a) {
	    var onRead = _a.onRead,
	        onRender = _a.onRender,
	        _b = _a.uncachedValues,
	        uncachedValues = _b === void 0 ? new Set() : _b,
	        _c = _a.useCache,
	        useCache = _c === void 0 ? true : _c;
	    return function (_a) {
	        if (_a === void 0) {
	            _a = {};
	        }
	        var props = __rest$2(_a, []);
	        var state = {};
	        var changedValues = [];
	        var hasChanged = false;
	        function setValue(key, value) {
	            if (key.startsWith('--')) {
	                props.hasCSSVariable = true;
	            }
	            var currentValue = state[key];
	            state[key] = value;
	            if (state[key] === currentValue) return;
	            if (changedValues.indexOf(key) === -1) {
	                changedValues.push(key);
	            }
	            if (!hasChanged) {
	                hasChanged = true;
	                sync.render(styler.render);
	            }
	        }
	        var styler = {
	            get: function (key, forceRead) {
	                if (forceRead === void 0) {
	                    forceRead = false;
	                }
	                var useCached = !forceRead && useCache && !uncachedValues.has(key) && state[key] !== undefined;
	                return useCached ? state[key] : onRead(key, props);
	            },
	            set: function (values, value) {
	                if (typeof values === 'string') {
	                    setValue(values, value);
	                } else {
	                    for (var key in values) {
	                        setValue(key, values[key]);
	                    }
	                }
	                return this;
	            },
	            render: function (forceRender) {
	                if (forceRender === void 0) {
	                    forceRender = false;
	                }
	                if (hasChanged || forceRender === true) {
	                    onRender(state, props, changedValues);
	                    hasChanged = false;
	                    changedValues.length = 0;
	                }
	                return this;
	            }
	        };
	        return styler;
	    };
	};

	var CAMEL_CASE_PATTERN$1 = /([a-z])([A-Z])/g;
	var REPLACE_TEMPLATE$1 = '$1-$2';
	var camelToDash$1 = function (str) {
	    return str.replace(CAMEL_CASE_PATTERN$1, REPLACE_TEMPLATE$1).toLowerCase();
	};
	var setDomAttrs$1 = function (element, attrs) {
	    for (var key in attrs) {
	        if (attrs.hasOwnProperty(key)) {
	            element.setAttribute(key, attrs[key]);
	        }
	    }
	};

	var camelCache$1 = /*#__PURE__*/new Map();
	var dashCache$1 = /*#__PURE__*/new Map();
	var prefixes$1 = ['Webkit', 'Moz', 'O', 'ms', ''];
	var numPrefixes$1 = prefixes$1.length;
	var isBrowser$1 = typeof document !== 'undefined';
	var testElement$1;
	var setDashPrefix$1 = function (key, prefixed) {
	    return dashCache$1.set(key, camelToDash$1(prefixed));
	};
	var testPrefix$1 = function (key) {
	    testElement$1 = testElement$1 || document.createElement('div');
	    for (var i = 0; i < numPrefixes$1; i++) {
	        var prefix = prefixes$1[i];
	        var noPrefix = prefix === '';
	        var prefixedPropertyName = noPrefix ? key : prefix + key.charAt(0).toUpperCase() + key.slice(1);
	        if (prefixedPropertyName in testElement$1.style || noPrefix) {
	            camelCache$1.set(key, prefixedPropertyName);
	            setDashPrefix$1(key, "" + (noPrefix ? '' : '-') + camelToDash$1(prefixedPropertyName));
	        }
	    }
	};
	var setServerProperty$1 = function (key) {
	    return setDashPrefix$1(key, key);
	};
	var prefixer$1 = function (key, asDashCase) {
	    if (asDashCase === void 0) {
	        asDashCase = false;
	    }
	    var cache = asDashCase ? dashCache$1 : camelCache$1;
	    if (!cache.has(key)) isBrowser$1 ? testPrefix$1(key) : setServerProperty$1(key);
	    return cache.get(key) || key;
	};

	var axes$1 = ['', 'X', 'Y', 'Z'];
	var order$1 = ['scale', 'rotate', 'skew', 'transformPerspective'];
	var transformProps$1 = /*#__PURE__*/order$1.reduce(function (acc, key) {
	    return axes$1.reduce(function (axesAcc, axesKey) {
	        axesAcc.push(key + axesKey);
	        return axesAcc;
	    }, acc);
	}, ['x', 'y', 'z']);
	var transformPropDictionary$1 = /*#__PURE__*/transformProps$1.reduce(function (dict, key) {
	    dict[key] = true;
	    return dict;
	}, {});
	function isTransformProp$1(key) {
	    return transformPropDictionary$1[key] === true;
	}
	function sortTransformProps$1(a, b) {
	    return transformProps$1.indexOf(a) - transformProps$1.indexOf(b);
	}
	var transformOriginProps = /*#__PURE__*/new Set(['originX', 'originY', 'originZ']);
	function isTransformOriginProp$1(key) {
	    return transformOriginProps.has(key);
	}

	var rounded = /*#__PURE__*/__assign$5({}, number$1, { transform: Math.round });
	var valueTypes$2 = {
	    color: color$1,
	    backgroundColor: color$1,
	    outlineColor: color$1,
	    fill: color$1,
	    stroke: color$1,
	    borderColor: color$1,
	    borderTopColor: color$1,
	    borderRightColor: color$1,
	    borderBottomColor: color$1,
	    borderLeftColor: color$1,
	    borderWidth: px$1,
	    borderTopWidth: px$1,
	    borderRightWidth: px$1,
	    borderBottomWidth: px$1,
	    borderLeftWidth: px$1,
	    borderRadius: px$1,
	    radius: px$1,
	    borderTopLeftRadius: px$1,
	    borderTopRightRadius: px$1,
	    borderBottomRightRadius: px$1,
	    borderBottomLeftRadius: px$1,
	    width: px$1,
	    maxWidth: px$1,
	    height: px$1,
	    maxHeight: px$1,
	    size: px$1,
	    top: px$1,
	    right: px$1,
	    bottom: px$1,
	    left: px$1,
	    padding: px$1,
	    paddingTop: px$1,
	    paddingRight: px$1,
	    paddingBottom: px$1,
	    paddingLeft: px$1,
	    margin: px$1,
	    marginTop: px$1,
	    marginRight: px$1,
	    marginBottom: px$1,
	    marginLeft: px$1,
	    rotate: degrees$1,
	    rotateX: degrees$1,
	    rotateY: degrees$1,
	    rotateZ: degrees$1,
	    scale: scale$1,
	    scaleX: scale$1,
	    scaleY: scale$1,
	    scaleZ: scale$1,
	    skew: degrees$1,
	    skewX: degrees$1,
	    skewY: degrees$1,
	    distance: px$1,
	    x: px$1,
	    y: px$1,
	    z: px$1,
	    perspective: px$1,
	    opacity: alpha$1,
	    originX: progressPercentage$1,
	    originY: progressPercentage$1,
	    originZ: px$1,
	    zIndex: rounded
	};
	var getValueType$2 = function (key) {
	    return valueTypes$2[key];
	};
	var getValueAsType = function (value, type) {
	    return type && typeof value === 'number' ? type.transform(value) : value;
	};

	var SCROLL_LEFT$1 = 'scrollLeft';
	var SCROLL_TOP$1 = 'scrollTop';
	var scrollKeys$1 = /*#__PURE__*/new Set([SCROLL_LEFT$1, SCROLL_TOP$1]);

	var blacklist$1 = /*#__PURE__*/new Set([SCROLL_LEFT$1, SCROLL_TOP$1, 'transform']);
	var translateAlias = {
	    x: 'translateX',
	    y: 'translateY',
	    z: 'translateZ'
	};
	function isCustomTemplate$1(v) {
	    return typeof v === 'function';
	}
	function buildTransform$1(state, transform, transformKeys, transformIsDefault, enableHardwareAcceleration) {
	    var transformString = '';
	    var transformHasZ = false;
	    transformKeys.sort(sortTransformProps$1);
	    var numTransformKeys = transformKeys.length;
	    for (var i = 0; i < numTransformKeys; i++) {
	        var key = transformKeys[i];
	        transformString += (translateAlias[key] || key) + "(" + transform[key] + ") ";
	        transformHasZ = key === 'z' ? true : transformHasZ;
	    }
	    if (!transformHasZ && enableHardwareAcceleration) {
	        transformString += 'translateZ(0)';
	    } else {
	        transformString = transformString.trim();
	    }
	    if (isCustomTemplate$1(state.transform)) {
	        transformString = state.transform(transform, transformString);
	    } else if (transformIsDefault) {
	        transformString = 'none';
	    }
	    return transformString;
	}
	function buildStyleProperty$1(state, enableHardwareAcceleration, styles, transform, transformOrigin, transformKeys, isDashCase) {
	    if (enableHardwareAcceleration === void 0) {
	        enableHardwareAcceleration = true;
	    }
	    if (styles === void 0) {
	        styles = {};
	    }
	    if (transform === void 0) {
	        transform = {};
	    }
	    if (transformOrigin === void 0) {
	        transformOrigin = {};
	    }
	    if (transformKeys === void 0) {
	        transformKeys = [];
	    }
	    if (isDashCase === void 0) {
	        isDashCase = false;
	    }
	    var transformIsDefault = true;
	    var hasTransform = false;
	    var hasTransformOrigin = false;
	    for (var key in state) {
	        var value = state[key];
	        var valueType = getValueType$2(key);
	        var valueAsType = getValueAsType(value, valueType);
	        if (isTransformProp$1(key)) {
	            hasTransform = true;
	            transform[key] = valueAsType;
	            transformKeys.push(key);
	            if (transformIsDefault) {
	                if (valueType.default && value !== valueType.default || !valueType.default && value !== 0) {
	                    transformIsDefault = false;
	                }
	            }
	        } else if (isTransformOriginProp$1(key)) {
	            transformOrigin[key] = valueAsType;
	            hasTransformOrigin = true;
	        } else if (!blacklist$1.has(key) || !isCustomTemplate$1(valueAsType)) {
	            styles[prefixer$1(key, isDashCase)] = valueAsType;
	        }
	    }
	    if (hasTransform || typeof state.transform === 'function') {
	        styles.transform = buildTransform$1(state, transform, transformKeys, transformIsDefault, enableHardwareAcceleration);
	    }
	    if (hasTransformOrigin) {
	        styles.transformOrigin = (transformOrigin.originX || 0) + " " + (transformOrigin.originY || 0) + " " + (transformOrigin.originZ || 0);
	    }
	    return styles;
	}
	function createStyleBuilder$1(enableHardwareAcceleration) {
	    if (enableHardwareAcceleration === void 0) {
	        enableHardwareAcceleration = true;
	    }
	    var styles = {};
	    var transform = {};
	    var transformOrigin = {};
	    var transformKeys = [];
	    return function (state) {
	        transformKeys.length = 0;
	        buildStyleProperty$1(state, enableHardwareAcceleration, styles, transform, transformOrigin, transformKeys, true);
	        return styles;
	    };
	}

	function onRead(key, options) {
	    var element = options.element,
	        preparseOutput = options.preparseOutput;
	    var defaultValueType = getValueType$2(key);
	    if (isTransformProp$1(key)) {
	        return defaultValueType ? defaultValueType.default || 0 : 0;
	    } else if (scrollKeys$1.has(key)) {
	        return element[key];
	    } else {
	        var domValue = window.getComputedStyle(element, null).getPropertyValue(prefixer$1(key, true)) || 0;
	        return preparseOutput && defaultValueType && defaultValueType.test(domValue) && defaultValueType.parse ? defaultValueType.parse(domValue) : domValue;
	    }
	}
	function onRender(state, _a, changedValues) {
	    var element = _a.element,
	        buildStyles = _a.buildStyles,
	        hasCSSVariable = _a.hasCSSVariable;
	    Object.assign(element.style, buildStyles(state));
	    if (hasCSSVariable) {
	        var numChangedValues = changedValues.length;
	        for (var i = 0; i < numChangedValues; i++) {
	            var key = changedValues[i];
	            if (key.startsWith('--')) {
	                element.style.setProperty(key, state[key]);
	            }
	        }
	    }
	    if (changedValues.indexOf(SCROLL_LEFT$1) !== -1) {
	        element[SCROLL_LEFT$1] = state[SCROLL_LEFT$1];
	    }
	    if (changedValues.indexOf(SCROLL_TOP$1) !== -1) {
	        element[SCROLL_TOP$1] = state[SCROLL_TOP$1];
	    }
	}
	var cssStyler$1 = /*#__PURE__*/createStyler$1({
	    onRead: onRead,
	    onRender: onRender,
	    uncachedValues: scrollKeys$1
	});
	function createCssStyler(element, _a) {
	    if (_a === void 0) {
	        _a = {};
	    }
	    var enableHardwareAcceleration = _a.enableHardwareAcceleration,
	        props = __rest$2(_a, ["enableHardwareAcceleration"]);
	    return cssStyler$1(__assign$5({ element: element, buildStyles: createStyleBuilder$1(enableHardwareAcceleration), preparseOutput: true }, props));
	}

	var camelCaseAttributes$1 = /*#__PURE__*/new Set(['baseFrequency', 'diffuseConstant', 'kernelMatrix', 'kernelUnitLength', 'keySplines', 'keyTimes', 'limitingConeAngle', 'markerHeight', 'markerWidth', 'numOctaves', 'targetX', 'targetY', 'surfaceScale', 'specularConstant', 'specularExponent', 'stdDeviation', 'tableValues']);

	var ZERO_NOT_ZERO$1 = 0.0000001;
	var progressToPixels = function (progress, length) {
	    return progress * length + 'px';
	};
	var build$1 = function (state, dimensions, isPath, pathLength) {
	    var hasTransform = false;
	    var hasDashArray = false;
	    var props = {};
	    var dashArrayStyles = isPath ? {
	        pathLength: '0',
	        pathSpacing: "" + pathLength
	    } : undefined;
	    var scale$$1 = state.scale !== undefined ? state.scale || ZERO_NOT_ZERO$1 : state.scaleX || 1;
	    var scaleY = state.scaleY !== undefined ? state.scaleY || ZERO_NOT_ZERO$1 : scale$$1 || 1;
	    var transformOriginX = dimensions.width * (state.originX || 50) + dimensions.x;
	    var transformOriginY = dimensions.height * (state.originY || 50) + dimensions.y;
	    var scaleTransformX = -transformOriginX * (scale$$1 * 1);
	    var scaleTransformY = -transformOriginY * (scaleY * 1);
	    var scaleReplaceX = transformOriginX / scale$$1;
	    var scaleReplaceY = transformOriginY / scaleY;
	    var transform = {
	        translate: "translate(" + state.x + ", " + state.y + ") ",
	        scale: "translate(" + scaleTransformX + ", " + scaleTransformY + ") scale(" + scale$$1 + ", " + scaleY + ") translate(" + scaleReplaceX + ", " + scaleReplaceY + ") ",
	        rotate: "rotate(" + state.rotate + ", " + transformOriginX + ", " + transformOriginY + ") ",
	        skewX: "skewX(" + state.skewX + ") ",
	        skewY: "skewY(" + state.skewY + ") "
	    };
	    for (var key in state) {
	        if (state.hasOwnProperty(key)) {
	            var value = state[key];
	            if (isTransformProp$1(key)) {
	                hasTransform = true;
	            } else if (isPath && (key === 'pathLength' || key === 'pathSpacing') && typeof value === 'number') {
	                hasDashArray = true;
	                dashArrayStyles[key] = progressToPixels(value, pathLength);
	            } else if (isPath && key === 'pathOffset') {
	                props['stroke-dashoffset'] = progressToPixels(-value, pathLength);
	            } else {
	                var attrKey = !camelCaseAttributes$1.has(key) ? camelToDash$1(key) : key;
	                props[attrKey] = value;
	            }
	        }
	    }
	    if (hasDashArray) {
	        props['stroke-dasharray'] = dashArrayStyles.pathLength + ' ' + dashArrayStyles.pathSpacing;
	    }
	    if (hasTransform) {
	        props.transform = '';
	        for (var key in transform) {
	            if (transform.hasOwnProperty(key)) {
	                var defaultValue = key === 'scale' ? '1' : '0';
	                props.transform += transform[key].replace(/undefined/g, defaultValue);
	            }
	        }
	    }
	    return props;
	};

	var int$1 = /*#__PURE__*/__assign$5({}, number$1, { transform: Math.round });
	var valueTypes$1$1 = {
	    fill: color$1,
	    stroke: color$1,
	    scale: scale$1,
	    scaleX: scale$1,
	    scaleY: scale$1,
	    opacity: alpha$1,
	    fillOpacity: alpha$1,
	    strokeOpacity: alpha$1,
	    numOctaves: int$1
	};
	var getValueType$1$1 = function (key) {
	    return valueTypes$1$1[key];
	};

	var getDimensions$1 = function (element) {
	    return typeof element.getBBox === 'function' ? element.getBBox() : element.getBoundingClientRect();
	};
	var getSVGElementDimensions$1 = function (element) {
	    try {
	        return getDimensions$1(element);
	    } catch (e) {
	        return { x: 0, y: 0, width: 0, height: 0 };
	    }
	};

	var svgStyler$1 = /*#__PURE__*/createStyler$1({
	    onRead: function (key, _a) {
	        var element = _a.element;
	        if (!isTransformProp$1(key)) {
	            return element.getAttribute(key);
	        } else {
	            var valueType = getValueType$1$1(key);
	            return valueType ? valueType.default : 0;
	        }
	    },
	    onRender: function (state, _a) {
	        var dimensions = _a.dimensions,
	            element = _a.element,
	            isPath = _a.isPath,
	            pathLength = _a.pathLength;
	        setDomAttrs$1(element, build$1(state, dimensions, isPath, pathLength));
	    }
	});
	var svg$2 = function (element) {
	    var dimensions = getSVGElementDimensions$1(element);
	    var props = {
	        element: element,
	        dimensions: dimensions,
	        isPath: false
	    };
	    if (element.tagName === 'path') {
	        props.isPath = true;
	        props.pathLength = element.getTotalLength();
	    }
	    return svgStyler$1(props);
	};

	var viewport$1 = /*#__PURE__*/createStyler$1({
	    useCache: false,
	    onRead: function (key) {
	        return key === 'scrollTop' ? window.pageYOffset : window.pageXOffset;
	    },
	    onRender: function (_a) {
	        var _b = _a.scrollTop,
	            scrollTop = _b === void 0 ? 0 : _b,
	            _c = _a.scrollLeft,
	            scrollLeft = _c === void 0 ? 0 : _c;
	        return window.scrollTo(scrollLeft, scrollTop);
	    }
	});

	var cache$1 = /*#__PURE__*/new WeakMap();
	var createDOMStyler$1 = function (node, props) {
	    var styler;
	    if (node instanceof HTMLElement) {
	        styler = createCssStyler(node, props);
	    } else if (node instanceof SVGElement) {
	        styler = svg$2(node);
	    } else if (node === window) {
	        styler = viewport$1(node);
	    }
	    invariant(styler !== undefined, 'No valid node provided. Node must be HTMLElement, SVGElement or window.');
	    cache$1.set(node, styler);
	    return styler;
	};
	var getStyler$1 = function (node, props) {
	    return cache$1.has(node) ? cache$1.get(node) : createDOMStyler$1(node, props);
	};
	function index$2(nodeOrSelector, props) {
	    var node = typeof nodeOrSelector === 'string' ? document.querySelector(nodeOrSelector) : nodeOrSelector;
	    return getStyler$1(node, props);
	}

	var dist = createCommonjsModule(function (module, exports) {
	// TODO: we may use parallel() to use multiple animation type, like tween and spring
	var __assign = (commonjsGlobal && commonjsGlobal.__assign) || function () {
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
	        this.styler = index$2.default(element);
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
	                var animation = popmotion_es.tween({
	                    from: from,
	                    to: to,
	                    duration: duration,
	                });
	                animation.start({
	                    update: function (v) { return index$2.default(element).set(v); },
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
	            animation = popmotion_es.spring(__assign({ from: from,
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
	});

	var index$3 = unwrapExports(dist);

	return index$3;

}));
