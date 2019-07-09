var Telegraph =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);

// CONCATENATED MODULE: ./src/modules/state.js
/**
 * This class stores the sate of application
 * @todo add cache to all getters
 */
class State {
  /**
   * @param {string} chartsData - input data in csv format
   * @param {string[]} colors - colors list for each line
   * @param {string[]} titles - titles list for each line
   * @param {string} type - graph type - line, area, bar
   * @param {string} title - graph title
   * @param {boolean} byMonth - grouped by month
   */
  constructor(chartsData, colors, titles, type, title, byMonth){
    const lines = chartsData.split('\n');

    this.columns = [];
    this.dates = [];
    this.type = type;
    this.title = title;
    this.byMonth = byMonth;

    lines.forEach((line) => {
      let [date, ...values] = line.split(',');

      values.forEach((val, index) => {
        val = parseInt(val, 10);

        if (this.columns[index]){
          this.columns[index].push(val);
        } else {
          this.columns[index] = [val];
        }
      });

      this.dates.push(date);
    });

    this.colors = colors;
    this.names = titles;
    this.isYScaled = false;

    /**
     * Cache
     */
    this._cache = {
      /**
       * @todo maybe array copying worst than slice
       */
      getLinePoints: {},
      dates: this.columns[0].slice(1),
      daysCount: this.columns[0].slice(1).length
    };

    this._recalculatedPoints = [];
  }

  /**
   * Column with dates is 0-index column, so shift it
   * First element in arrays is column name ("x") so slice it
   * @return {number[]} - array of dates in milliseconds
   */
  // get dates(){
  //   return this._cache.dates;
  // }

  /**
   * Return available line names
   * @return {string[]} - array of graph names
   */
  get linesAvailable(){
    return Object.keys(this.names);
  }

  /**
   * Returns numbers of days at the input data
   * @return {number}
   */
  get daysCount(){
    return this._cache.daysCount;
  }

  /**
   * Returns values of line by line name
   * @param {string} lineName - "y0", "y1" etc
   * @return {number[]}
   */
  getLinePoints(lineName){
    if (this._cache.getLinePoints[lineName]){
      return this._cache.getLinePoints[lineName];
    }

    this._cache.getLinePoints[lineName] = this.getColumnByName(lineName);


    return this._cache.getLinePoints[lineName];
  }

  /**
   * Return column by name
   * @param {string} name - "y0", "y1" etc
   * @return {array}
   */
  getColumnByName(name){
    return this.columns[name];
  }

  /**
   * Return N points from passed position
   * @param {string} lineName - "y0", "y1", ...etc
   * @param {number} from - start position
   * @param {number} count - how many items requested
   * @return {number[]}
   */
  getPointsSlice(lineName, from, count){
    return this.getLinePoints(lineName).slice(from, from + count);
  }

  /**
   * Returns color of line by line name
   * @param {string} lineName - "y0", "y1" etc
   * @return {string} - hex color like "#333333"
   */
  getLineColor(lineName){
    return this.colors[lineName];
  }

  /**
   * Returns chart type by name
   * @param {string} chartName - "y0", "y1" etc
   * @return {string} - "line", "bar", "area"
   */
  getChartType(chartName){
    return this.types[chartName];
  }

  /**
   * Detect type of charts
   * @return {string}
   */
  getCommonChartsType(){
    return this.type;
  }

  /**
   * Return value of same point of previous chart
   * @param currentChartNumber
   * @param pointIndex
   */
  getPrevChartValueForPoint(currentChartNumber, pointIndex){
    let prevChartKey = this.linesAvailable[currentChartNumber - 1];
    return this.getLinePoints(prevChartKey)[pointIndex];
  }

  /**
   * Return a stack value for each point
   */
  getStacks(){
    if (this._cache.stacks){
      return this._cache.stacks;
    }

    let from = 0;
    let to = this.daysCount;
    let stacks = [];

    for (let pointIndex = from; pointIndex < to; pointIndex++){
      let stackValue = this.getStackForPoint(pointIndex);

      stacks.push(stackValue);
    }

    this._cache.stacks = stacks;

    return this._cache.stacks;
  }

  /**
   * Return accumulated stack value for point
   * @param {number} pointIndex
   * @param {string[]} skipLines - line numbers to skip (it may be hidden)
   * @return {number}
   */
  getStackForPoint(pointIndex, skipLines = []){
    let stackValue = 0;

    this.linesAvailable.forEach(line => {
      if (skipLines.includes(line)){
        return;
      }

      stackValue += this.getLinePoints(line)[pointIndex];
    });

    return stackValue;
  }

  /**
   *
   * @param from
   * @param to
   * @param {string[]} skipLines - line numbers to skip (it may be hidden)
   * @return {number}
   */
  getMaximumAccumulatedByColumns(from = 0, to = this.daysCount, skipLines = []){
    let max = 0;

    for (let pointIndex = from; pointIndex < to; pointIndex++){
      let stackValue = this.getStackForPoint(pointIndex, skipLines);

      if (max < stackValue){
        max = stackValue;
      }
    }

    return max;
  }

  /**
   * Returns chart type by name
   * @param {string} chartName - "y0", "y1" etc
   * @return {string} - "line", "bar", "area"
   */
  getOhterTypes(chartName){
    return Object.keys(this.types).filter(type => type !== chartName);
  }

  /**
   * Return maximum value from all charts
   * @return {number}
   */
  get max(){
    const maxPerLines = this.linesAvailable.map( name => {
      return Math.max(...this.getLinePoints(name));
    });

    return Math.max(...maxPerLines);
  }

  /**
   * Return maximum value for passed line
   * @return {number}
   */
  maxForLine(name){
    return Math.max(...this.getLinePoints(name));
  }

  /**
   * Return minimum value from all charts
   * @return {number}
   */
  get min(){
    const minPerLines = this.linesAvailable.map( name => {
      return Math.min(...this.getLinePoints(name));
    });

    return Math.min(...minPerLines);
  }

  /**
   * Return minimum value for passed line
   * @return {number}
   */
  minForLine(name){
    return Math.min(...this.getLinePoints(name));
  }

  /**
   * Return max value for line with start point and next N visible
   */
  getMaxForLineSliced(line, leftPointIndex, pointsVisible){
    return Math.max(...this.getPointsSlice(line, leftPointIndex, pointsVisible));
  }

  /**
   * Return min value for line with start point and next N visible
   */
  getMinForLineSliced(line, leftPointIndex, pointsVisible){
    return Math.min(...this.getPointsSlice(line, leftPointIndex, pointsVisible));
  }

  /**
   * Array of available colors
   * @return {string[]}
   */
  get colorsList(){
    return Object.entries(this.colors).map(([name, value]) => value);
  }

  /**
   * Array of available chart names
   * @return {string[]}
   */
  get namesList(){
    return Object.entries(this.names).map(([name, value]) => value);
  }

  /**
   * Stores previously calculated values to prevent do the same both for chart and for mini map
   * @type {Array}
   */
  saveRecalculatedValues(values){
    this._recalculatedPoints.push(values);
  }

  /**
   * Dealloc used values
   * @type {Array}
   */
  clearRecalculatedValues(){
    this._recalculatedPoints = [];
  }

  get recalculatedValues(){
    return this._recalculatedPoints;
  }

}
// CONCATENATED MODULE: ./src/utils/dom.js
/**
 * Create HTML element
 * @param {string} tagName - HTML element tag name
 * @param {string[]|string} classNames - array of CSS classes
 * @param attributes - any attributes
 * @return {HTMLElement}
 */
function make(tagName, classNames = undefined, attributes = {}) {
  const svgNamespace = 'http://www.w3.org/2000/svg';
  const svgElements = ['svg', 'path', 'rect', 'circle', 'text', 'g', 'animate'];
  const isSvg = svgElements.includes(tagName);
  const el = !isSvg ? document.createElement(tagName) : document.createElementNS(svgNamespace, tagName);

  if (Array.isArray(classNames) && classNames.length) {
    el.classList.add(...classNames);
  } else if (classNames) {
    el.className = classNames;
  }

  if (attributes && Object.keys(attributes).length) {
    for (let attrName in attributes) {
      if (attributes.hasOwnProperty(attrName)) {
        el.setAttribute(attrName, attributes[attrName]);
      }
    }
  }

  return el;
}

/**
 * Inserts one element after another
 */
function insertAfter(target, element) {
  target.parentNode.insertBefore(element, target.nextSibling);
}

/**
 * Insert one element before another
 */
function insertBefore(target, element) {
  target.parentNode.insertBefore(element, target);
}

function animateCounter(holder, val, prevVal, animateType = 'default'){
  let prev = make('span', ['counter-prev', animateType]);
  let cur = make('span', ['counter-cur', animateType]);

  holder.style.width = val.length * 7 + 'px';

  prev.textContent = prevVal;
  cur.textContent = val;

  holder.innerHTML = '';
  holder.appendChild(prev);

  holder.appendChild(cur);

}
// CONCATENATED MODULE: ./src/utils/event.js
/**
 * Return pageX for passed Event
 * @param {MouseEvent|TouchEvent} event
 */
function getPageX(event) {
  if (event.touches){
    return event.touches[0].pageX;
  }

  return event.pageX;
}
// CONCATENATED MODULE: ./src/utils/debounce.js
/**
 * Invoke a function with debounce
 * @param {function} func - callback
 * @param {number} wait - how many second should be awaited before calling a callback
 * @param {boolean} immediate - pass true to call immediately
 * @return {Function}
 */
function debounce(func, wait, immediate) {
  var timeout;
  return function() {
    var context = this, args = arguments;
    var later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};
// CONCATENATED MODULE: ./src/modules/path.js


/**
 * Helper for creating an SVG path
 */
class path_Path {
  constructor({canvasHeight, zeroShifting, color, kY, stroke, stepX, max, min, isScaled}){
    this.canvasHeight = canvasHeight;
    this.zeroShifting = zeroShifting;
    this.kY = kY;
    this.stepX = stepX;
    this.prevX = 0;
    this.max = max;
    this.min = min;

    // here will be stored current minimum value for 2-y axis charts
    this.currentMinimum = 0;

    this.path = make('path', null, {
      'stroke-width' : stroke,
      stroke : color,
      fill : 'transparent',
      'stroke-linecap' : 'round',
      'stroke-linejoin' : 'round',
      'vector-effect': 'non-scaling-stroke',
    });

    if (isScaled){
      this.path.classList.add('scaled');
    }

    this.pathData = '';
  }

  /**
   * CSS classes map
   * @return {{graphHidden: string}}
   */
  static get CSS(){
    return {
      graphHidden: 'tg-graph--hidden',
    }
  }

  /**
   * Compute Y value with scaling
   */
  y(val){
    return Math.round(this.canvasHeight - val * this.kY + this.zeroShifting);
  }

  /**
   * Compute X value with scaling
   */
  x(val){
    return val;
  }

  /**
   * Go to passed coords
   * @param {number} x
   * @param {number} y
   */
  moveTo(x, y){
    this.pathData += `M ${this.x(x)} ${this.y(y)}`;
  }

  /**
   * Continue line to the next value
   * @param {number} y
   */
  stepTo(y, skipStep){
    if (!skipStep){
      this.prevX = this.prevX + this.stepX;
    }
    this.pathData += ` L ${this.x(this.prevX)} ${this.y(y)}`;
  }

  /**
   * Append a line
   */
  render(){
    this.path.setAttribute('d', this.pathData);
    return this.path;
  }

  get isHidden(){
    return this.path.classList.contains(path_Path.CSS.graphHidden);
  }

  toggleVisibility(status){
    this.path.classList.toggle(path_Path.CSS.graphHidden, status);
  }
}
// CONCATENATED MODULE: ./src/modules/bar.js


/**
 * Helper for creating an Bar charts
 */
class bar_Bar {
  constructor({canvasHeight, kY, stepX, key}){
    this.canvasHeight = canvasHeight;
    this.kY = kY;
    this.key = key;

    this.prevX = 0;
    this.stepX = stepX;

    this.wrapper = make('g');
    this.wrapper.setAttribute('class', bar_Bar.CSS.wrapper);
    this.wrapper.setAttribute('vector-effect', 'non-scaling-stroke');
    this.hidden = false;
  }

  getAll(){
    return this.wrapper;
  }

  /**
   * CSS classes map
   * @return {{graphHidden: string}}
   */
  static get CSS(){
    return {
      wrapper: 'tg-bar',
      graphHidden: 'tg-bar--hidden',
    }
  }

  /**
   * Compute Y value with scaling
   */
  y(val){
    return this.canvasHeight - val * this.kY;
  }

  /**
   * Compute X value with scaling
   */
  x(val){
    return val;
  }

  /**
   * Continue line to the next value
   * @param {number} y
   */
  add(y, stackValue, prevValue, color){
    this.prevX = this.prevX + this.stepX;
    let stackScaled = stackValue * this.kY;
    let heightPrev = prevValue * this.kY;
    let height = stackScaled - heightPrev;

    const bar = make('rect');
    bar.setAttribute('width', this.stepX);
    bar.setAttribute('height', height);
    bar.setAttribute('x', this.prevX);
    bar.setAttribute('y', this.y(stackValue - prevValue));
    bar.setAttribute('fill', color);
    // bar.setAttribute('stroke', color);
    // bar.setAttribute('opacity', 0.6);


    this.wrapper.appendChild(bar);
  }

  move(index, newStack, prevValue) {
    let bar = this.wrapper.children[index];
    let stackScaled = newStack * this.kY;
    let heightPrev = prevValue * this.kY;
    let height = stackScaled - heightPrev;

    bar.setAttribute('height', height);
    bar.setAttribute('y', this.y(newStack - prevValue));
  }


  get isHidden(){
    return this.hidden;
  }

  toggleVisibility(status){
    this.hidden = !this.hidden;
    this.wrapper.classList.toggle(bar_Bar.CSS.graphHidden, status);
  }
}
// CONCATENATED MODULE: ./src/modules/area.js


/**
 * Helper for creating an Bar charts
 */
class area_Area {
  constructor({canvasHeight, stepX, key, color}){
    this.canvasHeight = canvasHeight;
    this.key = key;
    this.color = color;

    this.prevX = 0;
    this.stepX = stepX;
    this.hidden = false;


    this.path = this.createPath();
    this.morphing = undefined;

    this.pathData = [];
  }

  createPath(){
    let path = make('path', null, {
      fill : this.color,
      'vector-effect': 'non-scaling-stroke',
    });

    path.classList.add(area_Area.CSS.path);

    return path;
  }

  getAll(){
    return this.path;
  }

  /**
   * CSS classes map
   * @return {{graphHidden: string}}
   */
  static get CSS(){
    return {
      path: 'tg-area',
      graphHidden: 'tg-area--hidden',
    }
  }

  /**
   * Compute Y value with scaling
   */
  y(val){
    return this.canvasHeight - val;
  }

  /**
   * Compute X value with scaling
   */
  x(val){
    return val;
  }

  percentToValue(per){
    return this.canvasHeight / 100 * per;
  }

  valueToPercent(val, total){
    return 100 / total * val;
  }

  /**
   * Go to passed coords
   * @param {number} x
   * @param {number} y
   */
  moveTo(x, y, total = 0){
    let valueInPercents = total ? this.valueToPercent(y, total) : y;
    this.pathData.push(`M ${x} ${this.percentToValue(valueInPercents)}`);
  }

  /**
   * Continue line to the next value
   * @param {number} total - this value is 100% for all charts
   */
  stepTo(total, prev, skip = false){
    let prevPercents = 100 / total * prev;
    let percentage = this.percentToValue(100 - prevPercents);
    // console.log('current per %o | 100% is %o | prev percents is %o | -->', curPercents, total, prevPercents, percentage);
    if (!skip) {
      this.prevX = this.prevX + this.stepX;
    }
    this.pathData.push(`L ${this.x(this.prevX)} ${this.y(percentage)}`);
  }

  /**
   * Recalculate Y coordinate
   * @param {number} y
   * @param {number} total - this value is 100% for all charts
   */
  move(index, total, prev){
    let pointToChange = this.pathData[index + 1]; // +1 to skip M value
    let [l, x, y] = pointToChange.trim().split(' ');

    let prevPercents = 100 / total * prev;
    let percentage = this.percentToValue(100 - prevPercents);

    this.pathData[index + 1] = ` L ${x} ${this.y(percentage)}`;
  }

  update(){
    this.morphing = make('animate');
    this.morphing.setAttribute('attributeName', 'd');
    this.morphing.setAttribute('attributeType', 'XML');
    this.morphing.setAttribute('dur', '170ms');
    this.morphing.setAttribute('fill', 'freeze');
    this.morphing.setAttribute('to', this.pathData.join(' '));
    this.path.appendChild(this.morphing);
    this.morphing.beginElement();
  }

  /**
   * Append a line
   */
  finish(){
    this.pathData.push(`L ${this.x(this.prevX)} ${this.canvasHeight} 0 ${this.canvasHeight} 0 0`);
    this.path.setAttribute('d', this.pathData.join(' '));
  }

  get isHidden(){
    return this.hidden;
  }

  toggleVisibility(status){
    this.hidden = !this.hidden;
    this.path.classList.toggle(area_Area.CSS.graphHidden, status);
  }
}
// CONCATENATED MODULE: ./src/utils/numbers.js
function round(number) {
  let zeros = Math.log10(number) >> 0;
  let rounding = Math.pow(10, zeros);

  return Math.round(number / rounding) * rounding;
}

function roundToMin(number, maxSlicing) {
  let zeros = Math.log10(number) >> 0;
  let rounding = Math.pow(10, zeros);
  let result = Math.floor(number / rounding) * rounding;

  // console.log(number, ' -> zeros', zeros, 'r' , rounding, maxSlicing);

  if (number - result > maxSlicing){
    // let old  =result;
    rounding = Math.pow(10, zeros - 1);
    result = Math.floor(number / rounding) * rounding;
    // console.warn('descreasing', old, result)
  }

  return result;
}

function beautify(number) {
  if (number < 1000) {
    return number
  } else if (number < 10000){
      let thousands = Math.floor(number / 1000);
      let left = number - thousands * 1000;

      if (left === 0){
        return thousands + ' 000';
      } else if (left >= 100){
        return thousands + ' ' + left;
      } else if (left > 10) {
        return thousands + ' 0' + left;
      } else {
        return thousands + ' 0' + left;
      }
  } else if (number < 1000000) {
      return Math.floor(number / 1000) + 'k';
  } else {
    return Math.floor(number / 1000000) + 'M';
  }
}

/**
 * 1000 -> 1 000
 * @param {number} number
 * @return {string}
 */
function addSpaces(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

// CONCATENATED MODULE: ./src/utils/log.js
let prevValues = {};


function log(obj){
  let el = document.getElementById('log');
   Object.assign(prevValues, obj);

   let content = '';

   Object.entries(prevValues).forEach(([key, value]) => {
     content += `${key} ${!isNaN(value) ? value.toFixed(3) : value}   `
   })

  el.innerHTML = content;
}
// CONCATENATED MODULE: ./src/modules/graph.js









/**
 * Working with svg paths for charts
 */
class graph_Graph {
  /**
   * @param {Telegraph} modules
   */
  constructor(modules, {stroke}){
    /**
     * Width of date label is used for default stepX value in 1:1 scale
     * @type {number}
     */
    const dateLabelWidth = 45;

    this.modules = modules;
    this.state = modules.state;
    this.type = this.state.getCommonChartsType();

    /**
     * @todo move to this.nodes
     */
    this.canvas = undefined;

    /**
     * Transformations on OY
     */
    this.oyGroup = undefined;

    /**
     * Transformations on OX
     */
    this.oxGroup = undefined;

    this.stepX = dateLabelWidth;
    this.stepY = 10;
    this.strokeWidth = stroke;
    this.initialWidth = undefined;
    this.maxPoint = 0;//
    this.minPoint = 0;

    /**
     * [ canvas height / (Max - Min) ]
     * Ratio from 1:1 scale to fit min (on zero-axis) and max (on top Y axis)
     */
    this.kY = 1;

    /**
     * [ min point * kY ]
     * On how much we should move down chart to make min-point hit zero-axis
     */
    this.zeroShifting = 0;

    /**
     * What point is currently fit zero-axis;
     */
    this.currentMinimum = 0;

    /**
     * [ new kY / original kY ]
     * How much the original kY is changed to fit new min & max points
     */
    this.oyScaling = 1;

    /**
     * [ original shift / new shift ]
     * How much the original zero axis shifting is changed to fit new min & max points
     */
    this.zeroShiftingScaling = 1;



    /**
     * List of drawn charts
     * @type {object} name -> Path
     */
    this.charts = {};

    /**
     * Cache for canvas width and height values
     * @type {number}
     * @private
     */
    this._width = 0;
    this._height = 0;
  }

  static get CSS(){
    return {
      oxGroup: 'ox-group',
      oyGroup: 'oy-group',
    }
  }

  /**
   * How much the original ratio of height to max-min is changed to fit new min & max points
   * @return {number}
   */
  get kYScaled(){
    return this.kY * this.oyScaling;
  }

  /**
   * Prepares the SVG element
   * @param {number} [width] - strict canvas width
   * @param {number} [height] - strict canvas height
   * @return {SVGElement}
   */
  renderCanvas({width, height} = {}){
    this.canvas = make('svg');
    this.oxGroup = make('g');
    this.oyGroup = make('g');

    this.oxGroup.setAttribute('class', graph_Graph.CSS.oxGroup);
    this.oyGroup.setAttribute('class', graph_Graph.CSS.oyGroup);
    this.oyGroup.setAttribute('vector-effect', 'non-scaling-stroke');
    this.oxGroup.setAttribute('vector-effect', 'non-scaling-stroke');

    if (!width){
      this.computeInitialWidth();
    } else {
      this.width = this.initialWidth = width;
    }

    if (height){
      this.height = height;
    }

    this.computeSteps();

    this.oyGroup.appendChild(this.oxGroup);
    this.canvas.appendChild(this.oyGroup);

    return this.canvas;
  }

  /**
   * Compute and set initial canvas width
   */
  computeInitialWidth(){
    this.initialWidth = (this.state.daysCount - 1) * this.stepX;
    this.width = this.initialWidth;
  }

  /**
   * Return total (big) chart width
   * @return {number}
   */
  get width(){
    return this._width;
  }

  /**
   * Set canvas width
   * @param {number} val
   */
  set width(val){
    this._width = val;
    this.canvas.style.width = val + 'px';
  }

  /**
   * Return chart height
   * @return {number}
   */
  get height(){
    return this._height;
  }

  /**
   * Set canvas height
   * @param {number} val
   */
  set height(val){
    this._height = val;
    this.canvas.style.height = val + 'px';
  }

  /**
   * Calculates stepX by canvas width and total points count
   */
  computeSteps(){
    this.stepX = this.width / (this.state.daysCount - 1);

    /**
     * All lines maximum value
     */
    const max = this.state.max;
    const min = this.state.min;
    const stepsAvailable = [5, 10, 25, 50, 100, 1000, 500, 10000, 5000, 100000, 1000000, 10000000];
    let newStepYIndex = stepsAvailable.reverse().findIndex( (step) => {
      let c = (max - min) > step;

      return c;
    }),
    newStepY = stepsAvailable[newStepYIndex];

    if (max / newStepY < 3 && newStepYIndex < stepsAvailable.length - 1){
      newStepY = stepsAvailable[newStepYIndex + 1];
    }

    this.stepY = newStepY;
  }

  renderCharts(){
    const type = this.state.getCommonChartsType();

    switch (type){
      case 'bar':
        this.maxPoint = this.state.getMaximumAccumulatedByColumns(); // 20% for padding top
        this.minPoint = this.state.min;
        this.drawBarCharts();
        break;
      case 'area':
        this.maxPoint = this.state.getMaximumAccumulatedByColumns(); // 20% for padding top
        this.drawAreaCharts();
        break;
      default:
      case 'line':
        if (!this.state.isYScaled) {
          this.maxPoint = this.state.max;
          this.minPoint = this.state.min;

          this.drawLineCharts();
        } else {
          this.drawScaledLineCharts();
        }

        break;
    }
  }

  drawAreaCharts(){
    let areas = this.state.linesAvailable.reverse().map( line => {
      return new area_Area({
        canvasHeight: this.height,
        stepX: this.stepX,
        key: line,
        color: this.state.getLineColor(line)
      });
    });

    const pointsCount = this.state.daysCount;
    const stacks = this.state.getStacks();

    this.state.linesAvailable.reverse().forEach( (line, index) => {
      areas[index].moveTo(0, this.state.getLinePoints(line)[0], stacks[0]);
    });

    for (let pointIndex = 0; pointIndex < pointsCount; pointIndex++) {
      let prevValue = 0;

      this.state.linesAvailable.reverse().forEach( (line, index) => {
        let pointValue = this.state.getLinePoints(line)[pointIndex];

        if (pointIndex === 0){
          areas[index].stepTo(stacks[pointIndex], prevValue, true);
        } else {
          areas[index].stepTo(stacks[pointIndex], prevValue);
        }

        prevValue += pointValue;
      });
    }

    areas.forEach(area => {
      area.finish();
      this.oxGroup.appendChild(area.getAll());
      this.charts[area.key] = area;
    });
  }

  drawBarCharts(){
    const kY = this.maxPoint !== 0 ? this.height / this.maxPoint : 1;
    let barmens = this.state.linesAvailable.reverse().map( line => {
      return new bar_Bar({
        canvasHeight: this.height,
        stepX: this.stepX,
        kY,
        key: line
      });
    });

    const pointsCount = this.state.daysCount;
    const stacks = this.state.getStacks();

    for (let pointIndex = 0; pointIndex < pointsCount; pointIndex++) {
      let prevValue = 0;

      this.state.linesAvailable.reverse().forEach( (line, index) => {
        const color = this.state.getLineColor(line);



        let pointValue = this.state.getLinePoints(line)[pointIndex];

        // const editorLabelStyle = `line-height: 1em;
        //     color: #fff;
        //     display: inline-block;
        //     font-size: 12px;
        //     line-height: 1em;
        //     background-color: ${color};
        //     padding: 4px 9px;
        //     border-radius: 30px;
        //     margin: 4px 5px 4px 0;`;
        // console.log(`%c${pointValue}`, editorLabelStyle);


        barmens[index].add(pointValue, stacks[pointIndex], prevValue, color);
        prevValue += pointValue;
      });



      // console.log('%o -> stack %o', pointIndex, stackValue);
    }

    barmens.forEach(barmen => {
      this.oxGroup.appendChild(barmen.getAll());
      this.charts[barmen.key] = barmen;
    });
  }

  /**
   * Return names of hidden charts
   */
  get hiddenCharts(){
    return Object.entries(this.charts).filter(([name, chart]) => chart.isHidden).map(([name]) => name);
  }

  /**
   * Return max visible point
   * If line passed, check for that. Otherwise, return maximum between all
   */
  getMaxFromVisible(leftPointIndex = 0, pointsVisible = this.state.daysCount, line = undefined){
    const type = this.state.getCommonChartsType();

    switch (type) {
      case 'bar':
        return this.state.getMaximumAccumulatedByColumns(leftPointIndex, leftPointIndex + pointsVisible, this.hiddenCharts);
        break;
      default:
      case 'line':
        if (!line) {
          return Math.max(...this.state.linesAvailable.filter(line => this.checkPathVisibility(line)).map(line => {
            return this.state.getMaxForLineSliced(line, leftPointIndex, pointsVisible);
          }));
        }

        return this.state.getMaxForLineSliced(line, leftPointIndex, pointsVisible, line);
        break;
    }
  }

  drawScaledLineCharts(){
    this.state.linesAvailable.forEach( name => {
      const lineMin = this.state.minForLine(name);
      const lineMax = this.state.maxForLine(name);
      const values = this.state.getLinePoints(name);

      // console.log('[%o] min %o max %o', name, lineMin, lineMax);

      let kY = this.height / (lineMax - lineMin);
      let zeroShifting = lineMin * kY;

      /**
       * Create a Path instance
       */
      const path = new path_Path({
        canvasHeight: this.height,
        isScaled: this.state.isYScaled,
        max: lineMax,
        color: this.state.getLineColor(name),
        zeroShifting,
        kY,
        stroke: this.strokeWidth,
        stepX: this.stepX,
      });

      path.moveTo(0, values[0]);

      values.forEach( (column, index )=> {
        if (index === 0){
          path.stepTo(column, true);
        } else {
          path.stepTo(column);
        }
      });

      this.oxGroup.appendChild(path.render());

      this.charts[name] = path;

    });
  }

  /**
   * Create a 'line' charts
   */
  drawLineCharts(){
    this.state.linesAvailable.forEach( name => {
      /**
       * Array of chart Y values
       */
      const values = this.state.getLinePoints(name);

      /**
       * Color of drawing line
       */
      const color = this.state.getLineColor(name);

      /**
       * Point to from which we will start drawing
       */
      const leftPoint = values[0];

      this.kY = this.height / (this.maxPoint - this.minPoint);
      this.zeroShifting = this.minPoint * this.kY;

      /**
       * Create a Path instance
       */
      const path = new path_Path({
        canvasHeight: this.height,
        max: this.maxPoint,
        min: this.minPoint,
        color,
        zeroShifting: this.zeroShifting,
        kY: this.kY,
        stroke: this.strokeWidth,
        stepX: this.stepX,
      });

      path.moveTo(0, leftPoint);

      values.forEach( (column, index )=> {
        if (index === 0){
          path.stepTo(column, true);
        } else {
          path.stepTo(column);
        }
      });

      this.oxGroup.appendChild(path.render());

      this.charts[name] = path;
    });
  }

  scroll(newLeft){
    this.oxGroup.style.transform = `matrix(${this.modules.chart.scaling},0,0,1,${newLeft},0)`;
  }

  /**
   * Scale left legend
   * @param {number} scaling
   */
  scaleLines(scaling){
    this.oxGroup.style.transform = `scaleX(${scaling})`;
    this.width = this.initialWidth * scaling;
  }

  get step(){
    return this.stepX;
  }

  /**
   * Scale path on OY
   * @param {number} newMax - new max value
   */
  scaleToMaxPoint(newMax, newMin, line){
    // console.log('newMax, newMin, line', newMax, newMin, line);
    // newMax = Numbers.round(newMax);
    // console.warn('min', newMin, Numbers.roundToMin(newMin, (newMax - newMin) / 5));


    newMin = roundToMin(newMin, (newMax - newMin) / 5);


    let max, kY, zeroShifting;

    if (!this.state.isYScaled){
      max = this.maxPoint;
      kY = this.kY;

      // area and bars
      if (!this.zeroShifting || !newMin){
        this.oyScaling = max / newMax;
        this.oyGroup.style.transform = `scaleY(${this.oyScaling})`;
        return;
      }

      let newKY = this.height / (newMax - newMin);
      let newZeroShifting = newMin * kY;
      let shift = newZeroShifting - this.zeroShifting;

      this.oyScaling = newKY / kY;
      this.zeroShiftingScaling = shift !== 0 ? newZeroShifting / this.zeroShifting  : 1;
      this.currentMinimum = newMin;

      this.oyGroup.style.transform = `scaleY(${this.oyScaling}) translateY(${shift}px)`;

    } else {
      const chart = this.charts[line];
      max = chart.max;
      kY = chart.kY;
      zeroShifting = chart.zeroShifting;


      let newKY = this.height / (newMax - newMin);
      let newZeroShifting = newMin * kY;
      let shift = newZeroShifting - zeroShifting;

      // need to store somewhere
      let oyScaling = newKY / kY;
      let zeroShiftingScaling = shift !== 0 ? newZeroShifting / zeroShifting  : 1;
      chart.currentMinimum = newMin;

      chart.path.style.transform = `scaleY(${oyScaling}) translateY(${shift}px)`;
      // chart.path.setAttribute('transform', `scale(1 ${oyScaling}) translate(0, ${shift})`);
    }
  }

  /**
   * Change bars height and Y to fit hidden charts place
   */
  recalculatePointsHeight(useRecalculated = false){
    if (this.type === 'bar'){
      this.recalculateBars(useRecalculated);
    } else if (this.type === 'area') {
      this.recalculateArea(useRecalculated);
    }
  }

  recalculateArea(useRecalculated = false){
    const pointsCount = this.state.daysCount;
    const stacks = this.state.getStacks();

    let recalculated = this.state.recalculatedValues;

    if (useRecalculated && recalculated) {
      for (let i = 0, lenCached = recalculated.length; i < lenCached; i++) {
        if (recalculated[i][1] === 0){
          this.charts[recalculated[i][0]].move(recalculated[i][1], recalculated[i][2], recalculated[i][3], true);
        } else {
          this.charts[recalculated[i][0]].move(recalculated[i][1], recalculated[i][2], recalculated[i][3]);
        }
      }

      this.state.clearRecalculatedValues();
      return;
    }

    let lines = this.state.linesAvailable.filter(line => this.checkPathVisibility(line)).reverse();

    for (let pointIndex = 0; pointIndex < pointsCount; pointIndex++) {
      let prevValue = 0;

      let hiddenPointsValue = this.hiddenCharts.reduce( (val, line) => {
        return val + this.state.getLinePoints(line)[pointIndex];
      }, 0);

      for (let i = 0, lenCached = lines.length; i < lenCached; i++) {
        let newStack = stacks[pointIndex] - hiddenPointsValue;
        let pointValue = this.state.getLinePoints(lines[i])[pointIndex];

        this.state.saveRecalculatedValues([lines[i], pointIndex, newStack, prevValue]);

        if (pointIndex === 0){
          this.charts[lines[i]].move(pointIndex, newStack, prevValue, true);
        } else {
          this.charts[lines[i]].move(pointIndex, newStack, prevValue);
        }

        prevValue += pointValue;
      }
    }

    Object.entries(this.charts).filter(([line, area]) => this.checkPathVisibility(line)).forEach(([line, area]) => {
      area.update();
    });
  }

  /**
   * Changes bars heights to correspond hidden charts
   * @param {boolean} useRecalculated - pass true to use saved value (minimap can use values from main Chart)
   */
  recalculateBars(useRecalculated = false){
    const pointsCount = this.state.daysCount;
    const stacks = this.state.getStacks();

    let recalculated = this.state.recalculatedValues;

    if (useRecalculated && recalculated) {
      for (let i = 0, lenCached = recalculated.length; i < lenCached; i++) {
        this.charts[recalculated[i][0]].move(recalculated[i][1], recalculated[i][2], recalculated[i][3]);
      }

      this.state.clearRecalculatedValues();
      return;
    }

    let lines = this.state.linesAvailable.filter(line => this.checkPathVisibility(line)).reverse();

    for (let pointIndex = 0; pointIndex < pointsCount; pointIndex++) {
      let prevValue = 0;

      let hiddenPointsValue = this.hiddenCharts.reduce( (val, line) => {
        return val + this.state.getLinePoints(line)[pointIndex];
      }, 0);

      for (let i = 0, lenCached = lines.length; i < lenCached; i++) {
        let newStack = stacks[pointIndex] - hiddenPointsValue;
        let pointValue = this.state.getLinePoints(lines[i])[pointIndex];


        this.state.saveRecalculatedValues([lines[i], pointIndex, newStack, prevValue]);
        this.charts[lines[i]].move(pointIndex, newStack, prevValue);

        prevValue += pointValue;
      }
    }
  }

  checkPathVisibility(name){
    return !this.charts[name].isHidden;
  }

  togglePathVisibility(name, status){
    this.charts[name].toggleVisibility(status);
  }
}
// CONCATENATED MODULE: ./src/modules/minimap.js







/**
 * Module for working with Chart Mini map
 * - Render UI
 * - Render graphs
 * - Scaling
 * - Scrolling
 */
class minimap_Minimap {
  /**
   * Telegraph
   * @param modules
   */
  constructor(modules){
    this.modules = modules;
    /**
     * @param {State} state
     */
    this.state = modules.state;
    this.nodes = {
      wrapper: undefined,
      canvas: undefined,

      leftZone: undefined,
      leftZoneScaler: undefined,
      rightZone: undefined,
      rightZoneScaler: undefined,
      centerZone: undefined
    };

    this.wrapperWidthCached = undefined;
    this.viewportWidth = 100;
    this.viewportWidthInitial = 100;
    this.viewportOffsetLeft = 0;

    /**
     * Remember width on touch start
     */
    this.viewportWidthBeforeDrag = undefined;

    /**
     * Clicked pageX
     */
    this.moveStartX = undefined;

    /**
     * Clicked layerX
     */
    this.wrapperLeftCoord = undefined;

    /**
     * Indicator that viewport zone is dragged
     */
    this.viewportPressed = false;

    /**
     * Indicator that left scaler zone is dragged
     */
    this.leftScalerClicked = false;

    /**
     * Indicator that right scaler zone is dragged
     */
    this.rightScalerClicked = false;

    /**
     * Scale debounce
     */
    this.scaleDebounce = undefined;

    /**
     * Cache for zones size
     */
    this.leftZoneWidth = 0;
    this.rightZoneWidth = 0;

    this.prevX = 0;

    this.graph = new graph_Graph(this.modules, {
      stroke: 1,
      animate: true
    });
  }

  static get CSS(){
    return {
      wrapper: 'tg-minimap',
      leftZone: 'tg-minimap__left',
      leftZoneScaler: 'tg-minimap__left-scaler',
      rightZone: 'tg-minimap__right',
      rightZoneScaler: 'tg-minimap__right-scaler',
      centerZone: 'tg-minimap__center',
    }
  }

  /**
   * Prepares minimap UI
   * @return {Element}
   */
  renderUi(){
    this.nodes.wrapper = make('div', minimap_Minimap.CSS.wrapper);
    this.nodes.leftZone = make('div', minimap_Minimap.CSS.leftZone);
    this.nodes.centerZone = make('div', minimap_Minimap.CSS.centerZone);
    this.nodes.rightZone = make('div', minimap_Minimap.CSS.rightZone);
    this.nodes.leftZoneScaler = make('div', minimap_Minimap.CSS.leftZoneScaler);
    this.nodes.rightZoneScaler = make('div', minimap_Minimap.CSS.rightZoneScaler);

    this.nodes.leftZone.appendChild(this.nodes.leftZoneScaler);
    this.nodes.rightZone.appendChild(this.nodes.rightZoneScaler);

    this.nodes.wrapper.appendChild(this.nodes.leftZone);
    this.nodes.wrapper.appendChild(this.nodes.centerZone);
    this.nodes.wrapper.appendChild(this.nodes.rightZone);

    this.bindEvents();

    return this.nodes.wrapper;
  }

  /**
   * Fill UI with chart and set initial Position
   */
  renderMap(){
    if (this.nodes.canvas){
      this.nodes.canvas.remove();
    }

    this.nodes.canvas = this.graph.renderCanvas({
      width: this.nodes.wrapper.offsetWidth,
      height: this.nodes.wrapper.offsetHeight
    });

    this.graph.renderCharts();

    this.setInitialPosition();

    this.nodes.wrapper.appendChild(this.nodes.canvas);
  }

  /**
   * Return width of a mini map
   * @return {number}
   */
  get wrapperWidth(){
    return this.wrapperWidthCached || this.nodes.wrapper.offsetWidth;
  }

  /**
   * Compute current minimap width
   * @return {number}
   */
  get width(){
    return this.wrapperWidth - this.leftZoneWidth - this.rightZoneWidth;
  }

  /**
   * Left zone width setter
   */
  set leftWidth(val){
    this.leftZoneWidth = val;
    this.nodes.leftZone.style.width = val + 'px';
    this.nodes.centerZone.style.left = val + 16 + 'px';
  }

  /**
   * Right zone width setter
   */
  set rightWidth(val){
    this.rightZoneWidth = val;
    this.nodes.rightZone.style.width = val + 'px';
  }

  /**
   * Set new with to the minimap's viewport
   * @param {number} value
   */
  set width(value){
    const scrollDistance = this.modules.chart.scrollDistance;

    this.leftWidth = scrollDistance;
    this.rightWidth = this.wrapperWidth - scrollDistance - value;

    this.viewportWidth = value;
    this.centerWidth = value;
  }

  set centerWidth(value){
    this.nodes.centerZone.style.width = (value - 32) + 'px';
  }

  /**
   * Initial width and offset
   */
  setInitialPosition(){
    let rect = this.nodes.wrapper.getBoundingClientRect();
    this.wrapperWidthCached = rect.width;
    this.wrapperLeftCoord = rect.left;

    this.width = this.modules.chart.minimalMapWidth;

    this.viewportWidthInitial = this.viewportWidthBeforeDrag = this.width;
    this.viewportOffsetLeft = this.wrapperWidth - this.viewportWidthInitial;
    this.moveViewport(this.viewportOffsetLeft);
    this.syncScrollWithChart(this.viewportOffsetLeft);
    this.modules.chart.fitToMax();
  }

  /**
   * Current scroll value
   * @return {number}
   */
  get scrolledValue(){
    return this.leftZoneWidth;
  }

  /**
   * Value of left zone width minimum
   */
  get leftZoneMinimumWidth(){
    return 0;
  }

  /**
   * Value of left zone width maximum
   */
  get leftZoneMaximumWidth(){
    return this.wrapperWidth - this.viewportWidthInitial - this.rightZoneWidth;
  }

  /**
   * Value of right zone width minimum
   */
  get rightZoneMinimumWidth(){
    return this.viewportWidthInitial;
  }

  /**
   * Value of right zone width maximum
   */
  get rightZoneMaximumWidth(){
    return this.wrapperWidth - this.viewportWidthInitial - this.scrolledValue;
  }

  /**
   * Moves viewport from left for passed value
   * @param {string} offsetLeft
   */
  moveViewport(offsetLeft){
    // log({offsetLeft})
    const width = this.width;
    const maxLeft = this.wrapperWidth - width;
    const minLeft = this.leftZoneMinimumWidth;

    let newLeft = this.viewportOffsetLeft + offsetLeft;

    if (newLeft < minLeft){
      newLeft = minLeft;
    } else if (newLeft > maxLeft){
      newLeft = maxLeft;
    }
    this.leftWidth = newLeft;
    this.rightWidth = this.wrapperWidth - this.viewportWidthBeforeDrag - newLeft;
  }

  bindEvents(){
    let supportsPassive = false;
    try {
      let opts = Object.defineProperty({}, 'passive', {
        get: function() {
          supportsPassive = true;
        }
      });
      window.addEventListener("testPassive", null, opts);
      window.removeEventListener("testPassive", null, opts);
    } catch (e) {}


    this.nodes.wrapper.addEventListener('mousedown', (event) => {
      this.viewportMousedown(event);
    }, supportsPassive ? { passive: true } : false);

    document.body.addEventListener('mousemove', (event) => {
      this.viewportMousemove(event);
    }, supportsPassive ? { passive: true } : false);

    document.body.addEventListener('mouseup', (event) => {
      this.viewportMouseup(event);
    }, supportsPassive ? { passive: true } : false);

    this.nodes.wrapper.addEventListener('touchstart', (event) => {
      this.viewportMousedown(event);
    }, supportsPassive ? { passive: true } : false);

    this.nodes.wrapper.addEventListener('touchmove', (event) => {
      this.viewportMousemove(event);
    }, supportsPassive ? { passive: true } : false);

    this.nodes.wrapper.addEventListener('touchend', (event) => {
      this.viewportMouseup(event);
    }, supportsPassive ? { passive: true } : false);
  }

  /**
   * Viewport under finger
   * @param {MouseEvent|TouchEvent} event
   */
  viewportMousedown(event){
    const {target} = event;

    // event.preventDefault();

    const leftScalerClicked = !!target.closest(`.${minimap_Minimap.CSS.leftZoneScaler}`);
    const rightScalerClicked = !!target.closest(`.${minimap_Minimap.CSS.rightZoneScaler}`);

    this.viewportWidthBeforeDrag = this.width;
    this.moveStartX = getPageX(event);

    if (leftScalerClicked || rightScalerClicked){
      this.leftScalerClicked = leftScalerClicked;
      this.rightScalerClicked = rightScalerClicked;
      this.viewportPressed = false;
      return;
    }


    this.viewportPressed = true;
  }

  /**
   * Viewport dragged
   * @param {MouseEvent} event
   */
  viewportMousemove(event){
    if (this.viewportPressed){
      this.viewportDragged(event);
    } else if (this.leftScalerClicked){
      this.scalerDragged(event, 'left');
    } else if (this.rightScalerClicked){
      this.scalerDragged(event, 'right');
    }
  }

  viewportMouseup(){
    if (this.viewportPressed){
      this.finishSliding();
    } else if (this.leftScalerClicked){
      this.finishLeftScaling();
    } else if (this.rightScalerClicked){
      this.finishRightScaling();
    }
  }

  finishSliding(){
    this.viewportPressed = false;
    this.viewportOffsetLeft = this.scrolledValue;


    // let start = null;
    //
    // // console.log('direction', direction);
    //
    // let step = (timestamp) => {
    //   if (!start) start = timestamp;
    //   var progress = timestamp - start;
    //   let forTo = Math.min(progress / this.prevX, 500);
    //
    //   console.log('forTo', this.prevX, progress);
    //
    //   // console.log('progress', progress);
    //   this.moveViewport(forTo * 5);
    //   // element.style.transform = 'translateX(' + Math.min(progress / 10, 200) + 'px)';
    //   if (progress < 100) {
    //     window.requestAnimationFrame(step);
    //   }
    // }

    // window.requestAnimationFrame(step);
  }

  finishLeftScaling(){
    this.leftScalerClicked = false;
    this.viewportOffsetLeft = this.scrolledValue;
  }

  finishRightScaling(){
    this.rightScalerClicked = false;
    this.viewportOffsetLeft = this.scrolledValue;
  }

  /**
   * @param {MouseEvent} event
   */
  viewportDragged(event){
    let delta = getPageX(event) - this.moveStartX;

    // let direction = this.prevX < delta ? 'right' : 'left';

    let prevScrolledValue = this.scrolledValue;

    // this.prevX = delta + 0;
    this.moveViewport(delta);
    // console.log('delta', delta);
    // this.modules.chart.scrollByDelta((prevScrolledValue - delta) * this.modules.chart.width / this.wrapperWidth );

    this.syncScrollWithChart();

    if (this._ftmd){
      clearTimeout(this._ftmd);
    }

    this._ftmd = setTimeout(() => {
      this.modules.chart.fitToMax(true);
    }, 50)

  }

  /**
   * Sync scroll between minimap and chart
   * @param {number} [newScroll] - pass scroll if you have
   */
  syncScrollWithChart(newScroll = null, fromScale = false){
    // console.log('this.scrolledValue', this.scrolledValue);
    /**
     * How many percents of mini-map is scrolled
     */
    let scrolledValue = !isNaN(parseInt(newScroll)) ? newScroll : this.scrolledValue;
    const minimapScrolledPortion = scrolledValue / this.wrapperWidth;
    const chartScroll = minimapScrolledPortion * this.modules.chart.width;

    this.modules.chart.scroll(chartScroll, fromScale);
  }

  /**
   * Viewport side-scaler is moved
   * @param {MouseEvent|TouchEvent} event
   * @param {string} side — 'left' or 'right'
   */
  scalerDragged(event, side){
    let pageX = getPageX(event);
    let delta = pageX - this.moveStartX;

    let direction = this.prevX < pageX ? 'right' : 'left';

    if (!delta || this.prevX === pageX){
      return;
    }

    this.prevX = pageX + 0;

    let newScalerWidth;

    if (side === 'left'){
      delta = delta * -1;
      newScalerWidth = this.viewportOffsetLeft - delta;

      if (newScalerWidth > this.leftZoneMaximumWidth) {
        return;
      }

      this.leftWidth = newScalerWidth;

      this.centerWidth = (this.wrapperWidth - newScalerWidth - this.rightZoneWidth)

    } else {
      newScalerWidth = this.wrapperWidth - this.viewportOffsetLeft - (this.viewportWidthBeforeDrag + delta);

      if (newScalerWidth > this.rightZoneMaximumWidth){
        return;
      }

      this.rightWidth = newScalerWidth;
      this.centerWidth = (this.wrapperWidth - newScalerWidth - this.leftZoneWidth)
    }



    const newViewportWidth = side === 'left' ?
      this.wrapperWidth - newScalerWidth - this.rightZoneWidth :
      this.wrapperWidth - this.leftZoneWidth - newScalerWidth;

    const scaling = this.viewportWidthInitial / newViewportWidth * this.modules.chart.initialScale;

    this.modules.chart.scale(scaling, direction);
    this.syncScrollWithChart(side === 'left' ? newScalerWidth : this.leftZoneWidth, true);

    if (this._ftmd){
      clearTimeout(this._ftmd);
    }

    this._ftmd = setTimeout(() => {
      this.modules.chart.fitToMax();
    }, 20)
  }

  /**
   * Toggle path visibility
   * @param {string} name - graph name
   */
  togglePath(name, status){
    this.graph.togglePathVisibility(name, status);

    if (this.state.type === 'bar'){
      this.graph.recalculatePointsHeight(true);
      this.fitToMax();
    } else if (this.state.type === 'area') {
      this.graph.recalculatePointsHeight(true);
    } else {
      this.fitToMax();
    }


  }

  /**
   * Upscale or downscale graph to fit visible points
   */
  fitToMax(){
    if (this.state.type !== 'area'){
      if (!this.state.isYScaled){
        this.graph.scaleToMaxPoint(this.graph.getMaxFromVisible());
      } else {
        this.state.linesAvailable.filter(line => this.modules.chart.notHiddenGraph(line)).forEach((line) => {
          this.graph.scaleToMaxPoint(this.graph.getMaxFromVisible(line), undefined, line);
        })
      }
    }
  }
}
// CONCATENATED MODULE: ./src/modules/tooltip.js



class tooltip_Tooltip {
  /**
   * @param {Telegraph} modules
   */
  constructor(modules){
    this.modules = modules;
    this.nodes = {
      wrapper:  undefined,
      title: undefined,
      values: undefined
    };

    this._width = 0;
    this._values = [];
  }

  /**
   * CSS map
   * @return {{wrapper: string, title: string, values: string, value: string}}
   */
  static get CSS(){
    return {
      wrapper: 'tg-tooltip',
      showed: 'tg-tooltip--showed',
      title: 'tg-tooltip__title',
      values: 'tg-tooltip__values',
      value: 'tg-tooltip__values-item',
      valueTitle: 'tg-tooltip__values-item-title',
    }
  }

  render(){
    this.nodes.wrapper = make('div', tooltip_Tooltip.CSS.wrapper);
    this.nodes.title = make('div', tooltip_Tooltip.CSS.title);
    this.nodes.values = make('div', tooltip_Tooltip.CSS.values);

    this.nodes.wrapper.appendChild(this.nodes.title);
    this.nodes.wrapper.appendChild(this.nodes.values);

    return this.nodes.wrapper;
  }

  show(){
    this.nodes.wrapper.classList.add(tooltip_Tooltip.CSS.showed);
  }

  hide(){
    this.nodes.wrapper.classList.remove(tooltip_Tooltip.CSS.showed);
  }

  move(lineLeftCoord, values){
    if (!this._width){
      this._width = this.nodes.wrapper.offsetWidth;
    }

    let max = Math.max(...values.map(value => value.value));
    let maxBottom = max * this.modules.chart.graph.kY - this.modules.chart.graph.zeroShifting;

    let offsetLeft = -25;
    let left = lineLeftCoord + offsetLeft;

    if (maxBottom > 260) {
      left = left - this._width;
    }

    if (left < this._width + 25){
      left = lineLeftCoord + 25
    }

    if (left + this._width > this.modules.chart.viewportWidth){
      left = left - this._width;
    }

    //
    // if (left + this._width > this.modules.chart.viewportWidth){
    //   left = this.modules.chart.viewportWidth - this._width - 30;
    // }


    // if (lineLeftCoord > this.modules.chart.viewportWidth - tooltipWidth / 1.3){
    //   offsetLeft = -1.3 * tooltipWidth;
    // } else if (lineLeftCoord > this.modules.chart.viewportWidth - tooltipWidth ){
    //   offsetLeft = -0.8 * tooltipWidth;
    // } else if (lineLeftCoord < 45){
    //   offsetLeft = 20;
    // }

    this.nodes.wrapper.style.left = `${left}px`;
  }

  clear(){
    this.nodes.title.textContent = '';
    this.nodes.values.innerHTML = '';
  }

  /**
   * Render values of current hovered points
   * @param {{name: string, value: number}[]} values
   */
  set values(values){
    this.clear();

    const prevValues = this._values;

    this._values = [];

    if (this._setValuesDebounce){
      clearTimeout(this._setValuesDebounce);
    }

    let summ = 0;

    for (let i = 0, lenCached = values.length; i < lenCached; i++) {
      summ += values[i].value;
    }


    if (values.length > 2){
      this._setValuesDebounce = setTimeout(() => {
        values.forEach( ({name, value}, index) => {
          this.createItem(this.modules.state.names[name], this.modules.state.colors[name], value, prevValues[index], index, values)
        });

        if (this.modules.state.type === 'bar' && values.length > 1){
          this.createItem('All', '#000', summ, null, values.length, values, true)
        }
      }, 150)

    } else {
        values.forEach( ({name, value}, index) => {
          this.createItem(this.modules.state.names[name], this.modules.state.colors[name], value, prevValues[index], index, values)
        });

        if (this.modules.state.type === 'bar' && values.length > 1){
          this.createItem('All', '#fff', null, values.length, values, true)
        }
    }

  }

  createItem(title, color, value, prevValue, index = 0, all, isAll= false){
    const item = make('div', tooltip_Tooltip.CSS.value);
    const counter = make('b');

    if (isAll){
      item.classList.add('all');
    }

    if (this.modules.state.type === 'area'){
      let total = all.reduce((acc, cur) => acc += cur.value, 0);
      let percent = Math.ceil((value / total) * 100);
      let percentEl = make('span', 'percents');

      percentEl.textContent = percent + '%';

      item.appendChild(percentEl)
    }

    let titleEl = make('span', tooltip_Tooltip.CSS.valueTitle);

    titleEl.textContent = title;

    item.appendChild(titleEl);
    item.appendChild(counter);

    counter.style.color = color;

    let valueBeautified = addSpaces(value);

    setTimeout(() => {
      animateCounter(counter, valueBeautified, prevValue);
    }, 50 * index);


    this.nodes.values.appendChild(item);
    this._values.push(valueBeautified);
  }

  set title(string){
    this.nodes.title.innerHTML = string;
  }

  /**
   * @param {Date} dt
   */
  set date(dt){
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const week = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    let month = dt.getMonth();
    let year = dt.getFullYear();
    let weekday = dt.getDay();
    let day = dt.getDate();
    let left = make('span', 'left');
    let right = make('span');

    right.textContent = months[month] + ' ' +year;


    this.nodes.title.innerHTML = '';
    this.nodes.title.appendChild(left);
    this.nodes.title.appendChild(right);

    let newDate = `${week[weekday]}, ${day}`;


    animateCounter(left, `${week[weekday]}, ${day}`, this._prevDate, 'top' );
    this._prevDate = newDate
  }
}
// CONCATENATED MODULE: ./src/modules/pointer.js


/**
 * Line with current values pointers
 */
class pointer_Pointer {
  constructor(modules){
    this.modules = modules;
    this.nodes = {
      wrapper: undefined,
    };
    this.pointers = {};
  }

  /**
   * CSS map
   * @return {{wrapper: string, showed: string, pointer: string}}
   * @constructor
   */
  static get CSS(){
    return {
      wrapper: 'tg-pointer',
      showed: 'tg-pointer--showed',
      pointer: 'tg-pointer__pointer',
      pointerHidden: 'tg-pointer__pointer--hidden'
    }
  }

  render(){
    this.nodes.wrapper = make('div', pointer_Pointer.CSS.wrapper);
    return this.nodes.wrapper;
  }

  show(){
    this.nodes.wrapper.classList.add(pointer_Pointer.CSS.showed);
  }

  hide(){
    this.nodes.wrapper.classList.remove(pointer_Pointer.CSS.showed);
  }

  move(leftPx){
    this.show();
    this.nodes.wrapper.style.left = `${leftPx}px`;
  }

  toggleVisibility(name){
    if (this.pointers[name]) {
      this.pointers[name].classList.toggle(pointer_Pointer.CSS.pointerHidden)
    }
  }

  /**
   * Show circles
   * @param {{name: string, value: number}[]} values
   */
  showValues(values){
    if (!Object.keys(this.pointers).length){
      values.forEach( ({name}) => {
        const item = make('div', pointer_Pointer.CSS.pointer);

        item.style.borderColor = this.modules.state.colors[name];
        this.nodes.wrapper.appendChild(item);
        this.pointers[name] = item;
      })
    }

    /**
     * @type {Graph}
     */
    const {graph} = this.modules.chart;

    values.forEach( ({name, value}) => {
      const item = this.pointers[name];
      const currentZero = graph.currentMinimum;
      const valueFromZero = value - currentZero;
      const coord = valueFromZero * graph.kYScaled;

      // item.style.bottom = `${coord}px`;
      item.style.transform = `translateY(-${coord}px)`;
    })

  }
}
// CONCATENATED MODULE: ./src/modules/chart.js










/**
 * Module for working with main Chart zone
 * - Render UI
 * - Render axes
 * - Render graphs
 * - Toggle lines visibility
 */
class chart_Chart {
  /**
   * @param {Telegraph} modules
   */
  constructor(modules){
    this.modules = modules;
    /**
     * @param {State} state
     */
    this.state = modules.state;
    this.nodes = {
      wrapper: undefined,
      viewport: undefined,
      canvas: undefined,
      cursorLine: undefined,
      grid: undefined,
      gridLines: [],
      legend: undefined,
      legendDates: [],
      overlays: undefined,
      overlayLeft: undefined,
      overlayRight: undefined,

    };

    this.tooltip = new tooltip_Tooltip(this.modules);
    this.pointer = new pointer_Pointer(this.modules);
    this.graph = new graph_Graph(this.modules, {
      stroke: 2
    });

    this.wrapperLeftCoord = undefined;
    this.scaling = 1;
    this.scrollValue = 0;



    this.legendDateWidth = 40;
    this.legendDateWidthMargins = 20 * 2;
    this.legendDatesHidedTimes = 0;
    this.legendDatesRecentlyHided = false;


    /**
     * Set will be store indexes of visible dates
     * @type {Set<number>}
     */
    this.onscreenDates = new Set();
    this.onscreenDatesElements = {}; // origin index -> element mapping
    this._datesPerScreenInitial = undefined;
    this._showEveryNDateInitial = undefined;

    /**
     * Any properties can be cached here
     * @type {{}}
     */
    this.cache = {};

    this._initialScale = undefined;
    this._initialStep = undefined;
    this._hoveredPointIndex = undefined;
  }

  get initialStep(){
    if (!this._initialStep){
      this._initialStep = this.width / (this.state.daysCount - 1);
    }
    return this._initialStep;
  }

  get minimalMapWidth(){
    if (this.modules.state.byMonth){
      return Math.ceil(this.viewportWidth / 12) * 4;
    }

    return 80;
  }

  get initialScale(){
    return this._initialScale;
  }

  /**
   * Get initial scaling corresponded with minimal minimap width
   */
  calculateInitialValues(){
    /**
     * Width of viewport when chart is not scaled
     * @type {number}
     */
    const chartToViewportRatio = this.viewportWidth / this.width;
    const originalWidth = this.viewportWidth * chartToViewportRatio;
    const scaledViewportRatio = this.minimalMapWidth / originalWidth;

    const originalScalingChange = this.scaling / scaledViewportRatio;

    this.initialScale = originalScalingChange;

    // log({scaling: this.scaling});
  }

  set initialScale(value){
    this._initialScale = value;
    this.scale(value);
  }

  /**
   * CSS map
   * @return {{wrapper: string, viewport: string, cursorLine: string}}
   */
  static get CSS(){
    return {
      wrapper: 'tg-chart',
      viewport: 'tg-chart__viewport',
      grid: 'tg-grid',
      gridSection: 'tg-grid__section',
      gridSectionHidden: 'tg-grid__section--hidden',
      gridCounter: 'tg-grid__counter',
      gridCounterHidden: 'tg-grid__counter--hidden',
      gridCounterFirst: 'tg-grid__counter--first',
      gridCounterSecond: 'tg-grid__counter--second',
      dateHidden: 'tg-legend__date--hidden',
      overlays: 'tg-chart__overlays',
      overlayLeft: 'tg-chart__overlay-left',
      overlayRight: 'tg-chart__overlay-right',
    }
  }

  get stepX(){
    return this.graph.stepX;
  }

  get stepY(){
    return this.graph.stepY;
  }

  get maxPoint(){
    return this.graph.maxPoint;
  }

  get height(){
    return this.graph.height;
  }

  /**
   * Total chart width
   * @return {number}
   */
  get width(){
    return this.graph.width;
  }

  /**
   * Return current scroll distance
   * @return {number}
   */
  get scrollDistance() {
    return this.scrollValue * this.scaling;
  }

  /**
   * Visible viewport width
   * @return {number}
   */
  get viewportWidth(){
    if (this.cache.viewportWidth){
      return this.cache.viewportWidth;
    }

    this.cache.viewportWidth = this.nodes.wrapper.offsetWidth;
    return this.cache.viewportWidth;
  }

  /**
   * Visible viewport height
   * @return {number}
   */
  get viewportHeight(){
    if (this.cache.viewportHeight){
      return this.cache.viewportHeight;
    }

    this.cache.viewportHeight = this.nodes.wrapper.offsetHeight;
    return this.cache.viewportHeight;
  }

  /**
   * Prepare UI
   * @return {Element}
   */
  renderUi(){
    this.nodes.wrapper = make('div', chart_Chart.CSS.wrapper);
    this.nodes.viewport = make('div', chart_Chart.CSS.viewport);
    this.nodes.cursorLine = this.pointer.render();

    this.nodes.wrapper.appendChild(this.nodes.viewport);
    this.nodes.wrapper.appendChild(this.nodes.cursorLine);
    this.nodes.wrapper.appendChild(this.tooltip.render());

    this.nodes.wrapper.classList.add(chart_Chart.CSS.wrapper + '--' + this.state.type);

    this.bindEvents();

    return this.nodes.wrapper;
  }

  /**
   * Renders charts
   */
  renderCharts(){
    this.calculateWrapperCoords();

    if (this.nodes.canvas){
      this.nodes.canvas.remove();
    }

    /**
     * @todo pass height through the initial settings
     */
    this.nodes.canvas = this.graph.renderCanvas({
      height: 350
    });
    this.nodes.viewport.appendChild(this.nodes.canvas);

    /**
     * Get initial scale
     */
    this.calculateInitialValues();



    this.graph.renderCharts();
    this.renderGrid();
    this.renderLegend();
    this.renderOverlays();
  }

  createLine(){
    const line = make('div', chart_Chart.CSS.gridSection);
    this.nodes.grid.appendChild(line);
    this.nodes.gridLines.push(line);

    return line;
  }

  getLegendStep(max, min, stepsCount, kY, kYRatio){
    let diffSize = max - min;
    let step = diffSize / stepsCount;
    let decimals = Math.log10(diffSize) >> 0;
    let rounding = Math.pow(10, decimals) / 2;
    // console.log('step', step);

    step = Math.ceil(step / rounding) * rounding;

    let possibleHeight = step * stepsCount * kY;

    if (possibleHeight > this.height){
      step = step / (possibleHeight / this.height >> 0);
    }

    return step;
  }

  getLegendCounter(value, name, isSecond){
    let counter = make('span', chart_Chart.CSS.gridCounter);
    counter.textContent = beautify(Math.round(value));

    counter.dataset.name = name;

    if (isSecond){
      counter.classList.add(chart_Chart.CSS.gridCounterSecond);
    } else {
      counter.classList.add(chart_Chart.CSS.gridCounterFirst);
    }

    return counter;
  }

  /**
   * Render or updates a grid
   */
  renderGrid(){
    if (!this.nodes.grid) {
      this.nodes.grid = make('div', chart_Chart.CSS.grid);
      this.nodes.gridLines = [];
      insertBefore(this.nodes.canvas, this.nodes.grid);
    }

    let height = this.height;
    let max = this.getMaxVisiblePoint();
    let min = !this.state.isYScaled ? this.graph.currentMinimum || 0 : this.graph.charts['y0'].currentMinimum;
    let kY = height / (max - min);
    let linesCount = 5;
    let stepY = this.getLegendStep(max, min, linesCount, kY);

    let stepYSecond, kYSecond, maxSecond, minSecond;

    if (this.state.isYScaled){
      maxSecond = this.getMaxVisiblePoint('y1');
      minSecond = this.getMinVisiblePoint('y1');

      kYSecond = height / (maxSecond - minSecond);
      let kYRatio = kY / kYSecond;

      stepYSecond = this.getLegendStep(maxSecond, minSecond, linesCount, kYSecond, kYRatio);
    }

    if (this.state.type === 'area'){
      stepY = 25;
      linesCount = 5;
      max = 100;
      kY = height / max;
    }

    if (this.nodes.gridLines.length){
      this.nodes.gridLines.forEach( line => {
        line.classList.add(chart_Chart.CSS.gridSectionHidden);
      })
    }

    for (let j = 0; j <= linesCount; j++) {
      let y = j * stepY;
      let line;

      if (this.nodes.gridLines.length && this.nodes.gridLines[j]){
        line = this.nodes.gridLines[j];
      } else {
        line = this.createLine();
      }

      if (j === 0){
        line.classList.add('no-animation');
      }

      let bottom = y * kY;

      if (bottom > this.height){
        continue;
      }

      line.classList.remove(chart_Chart.CSS.gridSectionHidden);
      line.style.bottom = `${y * kY}px`;

      line.innerHTML = '';



      let counter = this.getLegendCounter(y + min, 'y0');
      line.appendChild(counter);

      if (stepYSecond){
        counter.style.color = this.state.getLineColor('y0');
        let kYRatio = kY / kYSecond;
        let counter2 = this.getLegendCounter((j * stepYSecond + minSecond), 'y1', true);
        counter2.style.color = this.state.getLineColor('y1');
        line.appendChild(counter2);
      }
    }

    if (this.state.isYScaled){
      this.toggleGridLabelsForChart();
    }
  }

  /**
   * Check if date under passed index should be visible
   * @param {number} originalIndex - index in this.state.dates
   * @return {boolean}
   */
  checkDateShouldBeHidden(originalIndex){
    let skippedCount = Math.round(((this.onscreenPointsCount / this.datesPerScreen ) - this._showEveryNDateInitial) / this._showEveryNDateInitial);
    let checks = [];

    for (let i = 1; i < skippedCount + 1; i++){
      let idxToCheck = originalIndex + i * this._showEveryNDateInitial;
      let check = idxToCheck % (this._showEveryNDateInitial * 2 * i) === 0;
      checks.push(check)
    }

    return checks.some(check => !!check);
  }

  moveDate(originalIndex){
    let dateEl = this.onscreenDatesElements[originalIndex];
    let centering = 'translateX(-50%)';
    let newX = originalIndex * this.stepScaled + this.scrollValue;

    dateEl.style.transform = `translateX(${ newX }px)` + centering;

    if (this.checkDateShouldBeHidden(originalIndex)){
      dateEl.classList.add('hided');
    } else {
      dateEl.classList.remove('hided');
    }
  }


  pushDate(date, originIndex, visibleIndex){
    if (this.checkDateShouldBeHidden(originIndex)){
      return;
    }

    const dt = new Date(date);
    const dateEl = make('time');
    dateEl.textContent = dt.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short'
    });

    // dateEl.textContent = originIndex;

    this.nodes.legend.appendChild(dateEl);
    this.nodes.legendDates.push(dateEl);
    this.onscreenDates.add(originIndex);
    this.onscreenDatesElements[originIndex] = dateEl;
    this.moveDate(originIndex);
  }

  get onscreenPointsCount(){
    return Math.floor(this.viewportWidth / this.stepScaled);
  }

  /**
   * Left visible point
   * @return {number}
   */
  get leftPointIndex(){
    return parseInt(Math.floor(this.scrollValue * -1/ this.stepX / this.scaling));
  }

  /**
   * Right visible point
   * @return {number}
   */
  get rightPointIndex(){
    return this.leftPointIndex + this.onscreenPointsCount;
  }

  get datesPerScreen(){
    if (!this._datesPerScreenInitial){
      this._datesPerScreenInitial = Math.floor(this.viewportWidth / (this.legendDateWidth + this.legendDateWidthMargins));
    }
    return this._datesPerScreenInitial;
  }

  get stepScaled(){
    return this.stepX * this.scaling
  }

  addOnscreenDates(){
    /**
     * Get slice of timestamps that currently visible on the screen
     */
    let datesOnScreenSlice = this.state.dates.slice(this.leftPointIndex, this.rightPointIndex + 2);
    let datesOnScreenIndexes = new Set();

    if (!this._showEveryNDateInitial){
      let pointsOnScreen = this.rightPointIndex - this.leftPointIndex;
      this._showEveryNDateInitial = Math.ceil(pointsOnScreen / this.datesPerScreen);
    }

    let visibleIndex = 0;

    datesOnScreenSlice.forEach((date, index) => {
      const originIndex = this.leftPointIndex + index;


      /**
       * Skip dates that can not be fit event on maximum zoom
       */
      if (originIndex % this._showEveryNDateInitial !== 0){
        return;
      }

      /**
       * Store index of added date to check if it out of screen
       */
      datesOnScreenIndexes.add(originIndex);

      /**
       * If point already showed, move it
       */
      if (this.onscreenDates.has(originIndex)){
        this.moveDate(originIndex);
        visibleIndex++;
        return
      }

      /**
       * Add new date to its position computed by original index * step scaled
       */
      this.pushDate(date, originIndex, visibleIndex);
      visibleIndex++;
    });

    /**
     * Remove dates that are out of screen
     */
    this.onscreenDates.forEach((originalIndex) => {
      if (!datesOnScreenIndexes.has(originalIndex)) {
        this.removeDate(originalIndex);
      }
    });
  }

  removeDate(originalIndex){
    if (!this.onscreenDatesElements[originalIndex]){
      return;
    }

    this.onscreenDates[originalIndex] = null;
    this.onscreenDates.delete(originalIndex);
    this.onscreenDatesElements[originalIndex].remove();
    this.onscreenDatesElements[originalIndex] = null;
  }

  /**
   * Renders a legend with dates
   * @param {number[]} dates
   */
  renderLegend(){
    this.nodes.legend = make('footer');

    // this.addOnscreenDates();

    insertAfter(this.nodes.canvas, this.nodes.legend);
  }

  /**
   * Perform scroll
   * @param position
   */
  scroll(position, fromScale){
    this.scrollValue = position * -1;
    this.graph.scroll(this.scrollValue);
    this.tooltip.hide();
    this.pointer.hide();
    this.hideBarHighlighting();
    this.addOnscreenDates();

    if (this._sd){
      clearTimeout(this._sd);
    }

    this._sd = setTimeout(()=>{
      this.modules.header.setPeriod(this.state.dates[this.leftPointIndex], this.state.dates[this.rightPointIndex]);
    }, 50)
  }

  /**
   * Perform scaling
   * @param {number} scaling
   */
  scale(scaling, direction){
    this.graph.scaleLines(scaling, direction);

    this.scaling = scaling;
  }

  /**
   * Left visible point
   * @return {number}
   */
  get leftPointIndex(){
    return Math.round(this.scrollValue * -1/ this.graph.step / this.scaling);
  }

  /**
   * Filter to skip hidden line
   * @param {string} line - name of the graph
   * @return {boolean}
   */
  notHiddenGraph(line){
    return this.graph.checkPathVisibility(line);
  }

  get pointsVisible(){
    const stepX = this.graph.step;
    return Math.round(this.viewportWidth / stepX / this.scaling);
  }

  /**
   * Return max visible point
   * If line passed, check for that. Otherwise, return maximum between all
   */
  getMaxVisiblePoint(line = undefined){
    return this.graph.getMaxFromVisible(this.leftPointIndex, this.pointsVisible, line);
  }

  /**
   * Return min visible point
   * If line passed, check for that. Otherwise, return maximum between all
   */
  getMinVisiblePoint(line = undefined){
    if (!line){
      return Math.min(...this.state.linesAvailable.filter(line => this.notHiddenGraph(line)).map(line => {
        return this.state.getMinForLineSliced(line, this.leftPointIndex, this.pointsVisible);
      }));
    }

    return this.state.getMinForLineSliced(line, this.leftPointIndex, this.pointsVisible);
  }

  /**
   * Upscale or downscale graph to fit visible points
   */
  fitToMax(){
    if (this.state.type !== 'area'){
      if (!this.state.isYScaled){
        this.graph.scaleToMaxPoint(this.getMaxVisiblePoint(), this.getMinVisiblePoint());
      } else {
        this.state.linesAvailable.filter(line => this.notHiddenGraph(line)).forEach((line) => {
          this.graph.scaleToMaxPoint(this.getMaxVisiblePoint(line), this.getMinVisiblePoint(line), line);
        })
      }
    }

    /**
     * Rerender grid if it was rendered before
     */
    if (this.nodes.grid){

      if (this._gd){
        clearTimeout(this._gd);
      }

      this._gd = setTimeout(() => {
        this.renderGrid();
      }, 15)
    }
  }

  /**
   * Store wrapper rectangle data
   */
  calculateWrapperCoords(){
    let rect = this.nodes.wrapper.getBoundingClientRect();

    this.wrapperLeftCoord = rect.left;
  }

  bindEvents(){
    let supportsPassive = false;
    try {
      let opts = Object.defineProperty({}, 'passive', {
        get: function() {
          supportsPassive = true;
        }
      });
      window.addEventListener("testPassive", null, opts);
      window.removeEventListener("testPassive", null, opts);
    } catch (e) {}

    this.nodes.wrapper.addEventListener('mousemove', (event) => {
      this.mouseMove(event);
    }, supportsPassive ? { passive: true } : false);

    this.nodes.wrapper.addEventListener('mouseleave', (event) => {
      this.mouseLeave(event);
    }, supportsPassive ? { passive: true } : false);

    this.nodes.wrapper.addEventListener('touchmove', (event) => {
      this.mouseMove(event);
    }, supportsPassive ? { passive: true } : false);

    this.nodes.wrapper.addEventListener('touchcancel', (event) => {
      this.mouseLeave(event);
    }, supportsPassive ? { passive: true } : false);
  }

  /**
   * Shows line with Tooltip
   * @param {MouseEvent|TouchEvent} event
   */
  mouseMove(event){
    let x = getPageX(event);
    let viewportX = x - this.wrapperLeftCoord;

    let stepXWithScale = this.graph.stepX * this.scaling;
    let scrollOffset = this.scrollValue % stepXWithScale;
    let pointIndex = Math.round(viewportX / this.graph.stepX / this.scaling);
    let hoveredPointIndex = pointIndex + this.leftPointIndex;
    // let firstStepOffset = this.graph.stepX - Math.abs(scrollOffset);

    /**
     * Prevent recalculations on mousemove with the same point
     */
    if (hoveredPointIndex === this._hoveredPointIndex){
      return;
    }

    this._hoveredPointIndex = hoveredPointIndex;

    if (Math.abs(scrollOffset) > (stepXWithScale / 2) ){
      pointIndex = pointIndex + 1;
    }

    let newLeft = pointIndex * stepXWithScale + scrollOffset;

    // console.log('scroll offset %o | step %o (%o)| index %o | x %o | drawn at %o | first step offset %o | left index %o ', scrollOffset, this.graph.stepX, stepXWithScale, pointIndex, viewportX, newLeft, firstStepOffset, this.leftPointIndex);

     if (newLeft < this.stepScaled * 2){
       // let old = this.scrollValue;
       // let newScroll = (this.scrollValue + 20) * -1;

       //scroll
       //
       // this.modules.minimap.moveViewport(-1 * (old*-1 - newScroll));
       // this.scroll(newScroll);
     }

    this.tooltip.show();

    if (this.state.type === 'bar'){
      this.highlightBar(pointIndex -1, scrollOffset);
    } else {
      this.pointer.move(newLeft);
    }

    const values = this.state.linesAvailable.filter(line => this.notHiddenGraph(line)).map( line => {
      return {
        name: line,
        value: this.state.getLinePoints(line)[hoveredPointIndex]
      }
    });

    /**
     * Show circles
     */
    this.pointer.showValues(values);

    const date = this.state.dates[hoveredPointIndex];

    /**
     * Skip bounding empty positions
     */
    if (!date){
      return;
    }

    this.tooltip.values = values;
    this.tooltip.move(newLeft, values);
    this.tooltip.date = new Date(date);
  }

  mouseLeave(){
    this.tooltip.hide();
    this.pointer.hide();
    this.hideOverlays();
  }

  /**
   * Toggle path visibility
   * @param {string} name - graph name
   */
  togglePath(name, status){
    this.graph.togglePathVisibility(name, status);
    this.pointer.toggleVisibility(name);

    if (this.state.type === 'bar'){
      this.graph.recalculatePointsHeight();
      this.fitToMax();
    } else if (this.state.type === 'area') {
      this.graph.recalculatePointsHeight();
    } else {
      this.fitToMax();
    }
  }

  toggleGridLabelsForChart(){
    this.state.linesAvailable.forEach(line => {
      this.nodes.grid.querySelectorAll(`[data-name="${line}"]`).forEach( el => {
        el.classList.toggle(chart_Chart.CSS.gridCounterHidden, !this.graph.checkPathVisibility(line))
      });
    });
  }

  highlightBar(index, scrollOffset){
    this.nodes.overlays.style.opacity = '1';
    this.nodes.overlayLeft.setAttribute('width', index * this.stepScaled + scrollOffset);
    this.nodes.overlayRight.setAttribute('x', index * this.stepScaled + this.stepScaled + scrollOffset );
    this.nodes.overlayRight.setAttribute('width', (this.onscreenPointsCount - index) * this.stepScaled - scrollOffset );
  }

  hideBarHighlighting(){
    this.nodes.overlays.style.opacity = '0';
  }

  renderOverlays(){
    this.nodes.overlays = make('g');
    this.nodes.overlays.setAttribute('class', chart_Chart.CSS.overlays);


    this.nodes.overlayLeft = make('rect');
    this.nodes.overlayLeft.setAttribute('class', chart_Chart.CSS.overlayLeft);
    this.nodes.overlayRight = make('rect');
    this.nodes.overlayRight.setAttribute('class', chart_Chart.CSS.overlayRight);

    let defaultWidth = 0;

    this.nodes.overlayLeft.setAttribute('x', 0);
    this.nodes.overlayRight.setAttribute('x', this.viewportWidth - defaultWidth);
    this.nodes.overlayLeft.setAttribute('y', 0);
    this.nodes.overlayRight.setAttribute('y', 0);
    this.nodes.overlayLeft.setAttribute('width', defaultWidth);
    this.nodes.overlayRight.setAttribute('width', defaultWidth);
    this.nodes.overlayLeft.setAttribute('height', this.viewportHeight);
    this.nodes.overlayRight.setAttribute('height', this.viewportHeight);

    this.nodes.overlays.appendChild(this.nodes.overlayLeft);
    this.nodes.overlays.appendChild(this.nodes.overlayRight);
    this.graph.canvas.appendChild(this.nodes.overlays);
  }

  hideOverlays(){
    this.nodes.overlays.style.opacity = 0;
  }

  destroy(){
    this.nodes.canvas.remove();

    if (this.nodes.overlays){
      this.nodes.overlays.remove();
    }

    if (this.nodes.legend){
      this.nodes.legend.remove();
    }

    this.scaling = 1;
    this.scrollValue = 0;
  }
}
// CONCATENATED MODULE: ./src/modules/legend.js


class legend_Legend {
  /**
   * @param {Telegraph} modules
   */
  constructor(modules){
    this.modules = modules;
    this.nodes = {
      wrapper: undefined,
    };

    this.buttons = {};
  }

  static get CSS(){
    return {
      wrapper: 'tg-legend',
      item: 'tg-legend__item',
      itemWobble: 'tg-legend__item--wobble',
      itemSelected: 'tg-legend__item--selected',
      itemEnabled: 'tg-legend__item--enabled',
      checkbox: 'tg-legend__checkbox',
    }
  }

  /**
   * Show graphs togglers
   * @return {Element}
   */
  render(){
    this.nodes.wrapper = make('div', legend_Legend.CSS.wrapper);

    /**
     * Object with names -> array with names
     */
    const namesArray = Object.entries(this.modules.state.names).map(([name, title]) => {
      return {name, title}
    });

    namesArray.forEach(({name, title}) => {
      let item = make('div', [legend_Legend.CSS.item, legend_Legend.CSS.itemEnabled]),
        checkbox = make('span', legend_Legend.CSS.checkbox);

      item.style.borderColor = this.modules.state.colors[name];
      item.style.backgroundColor = this.modules.state.colors[name];

      item.appendChild(checkbox);
      item.appendChild(document.createTextNode(title));

      this.buttons[name] = item;

      this._clickPrevented = false;

      item.addEventListener('click', () => {
        console.log('this._clickPrevented', this._clickPrevented);
        if (!this._clickPrevented){
          this.itemClicked(name);
        }
      });

      item.addEventListener('mousedown', () => {
        this.mousedown(name);
      });

      item.addEventListener('touchstart', () => {
        this.mousedown(name);
      });

      item.addEventListener('mouseup', () => {
        this.mouseup(name);
      });

      item.addEventListener('touchend', () => {
        this.mouseup(name);
      });

      this.nodes.wrapper.appendChild(item);
    });
    return this.nodes.wrapper;
  }

  mousedown(name){
    this._timer = setTimeout(() => {
      this._clickPrevented = true;

      console.log('this._clickPrevented', this._clickPrevented);
      this.uncheckAllExceptPassed(name);
    }, 500);
  }

  uncheckAllExceptPassed(exceptName) {
    Object.entries(this.buttons).forEach(([name, el], index) => {
        if (name !== exceptName){
          this.buttons[name].classList.remove(legend_Legend.CSS.itemEnabled);
          this.buttons[name].style.backgroundColor = 'transparent';
          this.buttons[name].style.color = this.modules.state.colors[name];

          this.modules.chart.togglePath(name, true);
          this.modules.minimap.togglePath(name, true);
        } else {
          this.buttons[name].classList.add(legend_Legend.CSS.itemEnabled);
          this.buttons[name].style.backgroundColor = this.modules.state.colors[name];
          this.buttons[name].style.color = '#fff';

          this.buttons[name].classList.add(legend_Legend.CSS.itemSelected);
          setTimeout(() => {
            this.buttons[name].classList.remove(legend_Legend.CSS.itemSelected);
          }, 300);

          this.modules.chart.togglePath(name, false);
          this.modules.minimap.togglePath(name, false);
        }
    })

  }


  mouseup(name){
    if (!this._timer){
      return;
    }

    setTimeout(() => {
      this._clickPrevented = false;
      console.log('1this._clickPrevented', this._clickPrevented);
    }, 400)

    clearTimeout(this._timer);
  }


  /**
   * Click handler for togglers
   * @param {string} name - graph name
   */
  itemClicked(name){
    let isLast = this.modules.state.linesAvailable.filter(line => this.modules.chart.graph.checkPathVisibility(line)).length === 1;

    if (!this.buttons[name].classList.contains(legend_Legend.CSS.itemEnabled)){
      this.buttons[name].classList.add(legend_Legend.CSS.itemEnabled);
      this.buttons[name].style.backgroundColor = this.modules.state.colors[name];
      this.buttons[name].style.color = '#fff';

      this.buttons[name].classList.add(legend_Legend.CSS.itemSelected);
      setTimeout(() => {
        this.buttons[name].classList.remove(legend_Legend.CSS.itemSelected);
      }, 300);
    } else {
      if (isLast){
        this.buttons[name].classList.add(legend_Legend.CSS.itemWobble);
        setTimeout(() => {
          this.buttons[name].classList.remove(legend_Legend.CSS.itemWobble);
        }, 300);

        return;
      }

      this.buttons[name].classList.remove(legend_Legend.CSS.itemEnabled);
      this.buttons[name].style.backgroundColor = 'transparent';
      this.buttons[name].style.color = this.modules.state.colors[name];
    }

    this.modules.chart.togglePath(name);
    this.modules.minimap.togglePath(name);
  }

  toggle(name){

  }
}

// CONCATENATED MODULE: ./src/modules/header.js


class header_Header {
  constructor(modules){
    this.modules = modules;
    this.nodes = {
      wrapper: undefined,
      title: undefined,
      dates: undefined,
      typeSwitchers: []
    };

  }

  static get CSS(){
    return {
      wrapper: 'tg-header',
      title: 'tg-header__title',
      dates: 'tg-header__dates',
      typeSwitcher: 'tg-header__type-switcher',
      typeSwitcherCurrent: 'tg-header__type-switcher--current',
    }
  }

  render(){
    this.nodes.wrapper = make('div', header_Header.CSS.wrapper);
    this.nodes.title = make('div', header_Header.CSS.title);
    this.nodes.dates = make('div', header_Header.CSS.dates);

    this.nodes.title.textContent = this.modules.state.title || 'Untitled';
    this.nodes.wrapper.appendChild(this.nodes.title);

    [
      {
        type: 'line',
        icon: `<svg width="22" height="16" xmlns="http://www.w3.org/2000/svg">
                <g fill="none" fill-rule="evenodd">
                  <rect stroke="#979797" fill="#D8D8D8" x=".5" y="14.5" width="21" height="1" rx=".5"/>
                  <path d="M17.707 5.708l-2 1.999a3 3 0 1 1-5.685.923l-2.94-1.47A2.99 2.99 0 0 1 5 8c-.463 0-.902-.105-1.293-.292l-2 2L.293 8.292l2-2a3 3 0 1 1 5.685-.923l2.94 1.47A2.99 2.99 0 0 1 13 6c.463 0 .902.105 1.293.292l2-1.999a3 3 0 1 1 1.414 1.414zM5 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm8 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm6-6a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" fill="#979797" fill-rule="nonzero"/>
                </g>
              </svg>`
      },
      {
        type: 'bar',
        icon: `<svg width="21" height="18" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 11.133L8.445 12.926 5.27 8.694 0 11.705v-4.17l4.98-3.32 6.838 4.884L21 6.344v4.789zm0 2.02V16a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-1.991l4.73-2.703 2.825 3.768L21 13.153zm0-8.897l-8.818 2.645L5.02 1.785 0 5.131V2a2 2 0 0 1 2-2h17a2 2 0 0 1 2 2v2.256z" fill="#979797" fill-rule="evenodd"/>
              </svg>`
      },
      {
        type: 'area',
        icon: `<svg width="19" height="18" xmlns="http://www.w3.org/2000/svg">
                <g fill="#979797" fill-rule="evenodd">
                  <rect y="10" width="3" height="8" rx="1.5"/>
                  <path d="M15 9v6h-3V9h3zm0-1h-3V1.5a1.5 1.5 0 0 1 3 0V8zm0 8v.5a1.5 1.5 0 0 1-3 0V16h3z"/>
                  <rect x="16" y="9" width="3" height="9" rx="1.5"/>
                  <path d="M7 10v4H4v-4h3zm0-1H4V6.5a1.5 1.5 0 0 1 3 0V9zm0 6v1.5a1.5 1.5 0 0 1-3 0V15h3zM11 14H8V7h3v7zm0 1v1.5a1.5 1.5 0 0 1-3 0V15h3zm0-9H8V1.5a1.5 1.5 0 0 1 3 0V6z"/>
                </g>
              </svg>`
      }
    ].forEach(({type, icon}) => {
      const switcher = make('span', header_Header.CSS.typeSwitcher);

      if (type === this.modules.state.type){
        switcher.classList.add(header_Header.CSS.typeSwitcherCurrent);
      }

      switcher.innerHTML = icon;
      switcher.addEventListener('click', () => {
        this.typeSwitcherClicked(type, switcher);
      });

      this.nodes.typeSwitchers.push(switcher);

      this.nodes.wrapper.appendChild(switcher);
    });


    this.nodes.wrapper.appendChild(this.nodes.dates);

    return this.nodes.wrapper
  }

  typeSwitcherClicked(type, switcher){
    this.modules.state.type = type;
    this.modules.chart.destroy();
    this.modules.chart.renderCharts();
    this.modules.minimap.renderMap();
    this.modules.minimap.syncScrollWithChart();

    this.nodes.typeSwitchers.forEach(el => el.classList.remove(header_Header.CSS.typeSwitcherCurrent));

    switcher.classList.add(header_Header.CSS.typeSwitcherCurrent);
  }

  setPeriod(leftDateTimestamp, rightDateTimestamp){
    this._sd = setTimeout(() => {
      let leftDate = (new Date(leftDateTimestamp)).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
      let rightDate = (new Date(rightDateTimestamp)).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });

      this.nodes.dates.innerHTML = `${leftDate} - ${rightDate}`;

    }, 20)
  }
}
// CONCATENATED MODULE: ./src/telegraph.js
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return telegraph_Telegraph; });






/**
 * @typedef {object} ChartData
 */

class telegraph_Telegraph {
  /**
   * Main entry constructor
   * @param {string} holderId - where to append a Chart
   * @param {string} data - chart data in csv format
   * @param {string} type - graph type. Available types: 'line', 'area', 'bar'
   * @param {string[]} colors - colors list for each line
   * @param {string[]} titles - titles list for each line
   * @param {string} title - Graph title
   * @param {boolean} byMonth - is graphs represents data grouped by month
   */
  constructor({holderId, data, colors, titles, type, title, byMonth}) {
    this.holder = document.getElementById(holderId);

    /**
     * Module that stores all main app state values
     */
    this.state = new State(data, colors, titles, type, title, byMonth);

    /**
     * Module for mini map
     */
    this.minimap = new minimap_Minimap(this);

    /**
     * Working with main chart zone
     */
    this.chart = new chart_Chart(this);

    /**
     * Working with legend items
     */
    this.legend = new legend_Legend(this);

    /**
     * Header module
     */
    this.header = new header_Header(this);

    /**
     * Create base UI elements
     */
    this.prepareUi();

    /**
     * Render chart and mini map
     */
    this.chart.renderCharts();
    this.minimap.renderMap();

    // console.timeEnd('telegraph');
  }

  /**
   * CSS classes map
   * @return {{nightModeEnabled: string}}
   */
  static get CSS(){
    return {
      nightModeEnabled : 'tg--night-mode'
    }
  }

  /**
   * Create base app UI
   */
  prepareUi(){
    this.holder.appendChild(this.header.render());
    this.holder.appendChild(this.chart.renderUi());
    this.holder.appendChild(this.minimap.renderUi());
    this.holder.appendChild(this.legend.render());
  }

  /**
   * @public
   * Toggles night mode
   */
  toggleNightMode(){
    this.holder.classList.toggle(telegraph_Telegraph.CSS.nightModeEnabled);
  }
}

/***/ })
/******/ ]);