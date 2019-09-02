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
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/telegraph.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/modules/area.js":
/*!*****************************!*\
  !*** ./src/modules/area.js ***!
  \*****************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Area; });
/* harmony import */ var _utils_dom__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/dom */ "./src/utils/dom.js");


/**
 * Helper for creating an Bar charts
 */
class Area {
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
    let path = _utils_dom__WEBPACK_IMPORTED_MODULE_0__["make"]('path', null, {
      fill : this.color,
      'vector-effect': 'non-scaling-stroke',
    });

    path.classList.add(Area.CSS.path);

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

    let prevPercents, percentage;

    if (total > 0){
      prevPercents = 100 / total * prev;
      percentage = this.percentToValue(100 - prevPercents);
    } else {
      percentage = this.percentToValue(0 );
    }

    this.pathData[index + 1] = ` L ${x} ${this.y(percentage)}`;
  }

  update(){
    this.morphing = _utils_dom__WEBPACK_IMPORTED_MODULE_0__["make"]('animate');
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
    this.path.classList.toggle(Area.CSS.graphHidden, status);
  }
}

/***/ }),

/***/ "./src/modules/bar.js":
/*!****************************!*\
  !*** ./src/modules/bar.js ***!
  \****************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Bar; });
/* harmony import */ var _utils_dom__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/dom */ "./src/utils/dom.js");


/**
 * Helper for creating an Bar charts
 */
class Bar {
  constructor({canvasHeight, kY, stepX, key}){
    this.canvasHeight = canvasHeight;
    this.kY = kY;
    this.key = key;

    this.prevX = 0;
    this.stepX = stepX;

    this.wrapper = _utils_dom__WEBPACK_IMPORTED_MODULE_0__["make"]('g');
    this.wrapper.setAttribute('class', Bar.CSS.wrapper);
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
    let stackScaled = stackValue * this.kY;
    let heightPrev = prevValue * this.kY;
    let height = stackScaled - heightPrev;

    const bar = _utils_dom__WEBPACK_IMPORTED_MODULE_0__["make"]('rect');
    bar.setAttribute('width', this.stepX);
    bar.setAttribute('height', height);
    bar.setAttribute('x', this.prevX);
    bar.setAttribute('y', this.y(stackValue - prevValue));
    bar.setAttribute('fill', color);

    this.prevX = this.prevX + this.stepX;
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
    this.wrapper.classList.toggle(Bar.CSS.graphHidden, status);
  }
}

/***/ }),

/***/ "./src/modules/chart.js":
/*!******************************!*\
  !*** ./src/modules/chart.js ***!
  \******************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Chart; });
/* harmony import */ var _utils_dom_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/dom.js */ "./src/utils/dom.js");
/* harmony import */ var _graph_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./graph.js */ "./src/modules/graph.js");
/* harmony import */ var _tooltip__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./tooltip */ "./src/modules/tooltip.js");
/* harmony import */ var _pointer__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./pointer */ "./src/modules/pointer.js");
/* harmony import */ var _utils_event_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../utils/event.js */ "./src/utils/event.js");
/* harmony import */ var _utils_log_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../utils/log.js */ "./src/utils/log.js");
/* harmony import */ var _utils_numbers__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../utils/numbers */ "./src/utils/numbers.js");
/* harmony import */ var _bar__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./bar */ "./src/modules/bar.js");










/**
 * Module for working with main Chart zone
 * - Render UI
 * - Render axes
 * - Render graphs
 * - Toggle lines visibility
 */
class Chart {
  /**
   * @param {Telegraph} modules
   */
  constructor(modules){
    this.modules = modules;
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

    this.tooltip = new _tooltip__WEBPACK_IMPORTED_MODULE_2__["default"](this.modules);
    this.pointer = new _pointer__WEBPACK_IMPORTED_MODULE_3__["default"](this.modules);
    this.graph = new _graph_js__WEBPACK_IMPORTED_MODULE_1__["default"](this.modules, {
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
      this._initialStep = this.width / (this.modules.state.daysCount - 1);
    }
    return this._initialStep;
  }

  get minimalMapWidth(){
    if (this.modules.state.byMonth){
      return Math.ceil(this.viewportWidth / this.modules.state.daysCount) * 4; // 4 month
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
    this.nodes.wrapper = _utils_dom_js__WEBPACK_IMPORTED_MODULE_0__["make"]('div', Chart.CSS.wrapper);
    this.nodes.viewport = _utils_dom_js__WEBPACK_IMPORTED_MODULE_0__["make"]('div', Chart.CSS.viewport);
    this.nodes.cursorLine = this.pointer.render();

    this.nodes.wrapper.appendChild(this.nodes.viewport);
    this.nodes.wrapper.appendChild(this.nodes.cursorLine);
    this.nodes.wrapper.appendChild(this.tooltip.render());

    this.nodes.wrapper.classList.add(Chart.CSS.wrapper + '--' + this.modules.state.type);

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
    const line = _utils_dom_js__WEBPACK_IMPORTED_MODULE_0__["make"]('div', Chart.CSS.gridSection);
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
    let counter = _utils_dom_js__WEBPACK_IMPORTED_MODULE_0__["make"]('span', Chart.CSS.gridCounter);
    let text = _utils_numbers__WEBPACK_IMPORTED_MODULE_6__["beautify"](Math.round(value));

    if (this.modules.state.type === 'area'){
      text += '%';
    }

    counter.textContent = text;
    counter.dataset.name = name;

    if (isSecond){
      counter.classList.add(Chart.CSS.gridCounterSecond);
    } else {
      counter.classList.add(Chart.CSS.gridCounterFirst);
    }

    return counter;
  }

  /**
   * Render or updates a grid
   */
  renderGrid(){
    if (!this.nodes.grid) {
      this.nodes.grid = _utils_dom_js__WEBPACK_IMPORTED_MODULE_0__["make"]('div', Chart.CSS.grid);
      this.nodes.gridLines = [];
      _utils_dom_js__WEBPACK_IMPORTED_MODULE_0__["insertBefore"](this.nodes.canvas, this.nodes.grid);
    }

    let height = this.height;
    let max = this.getMaxVisiblePoint();
    let min = !this.modules.state.isYScaled ? this.graph.currentMinimum || 0 : this.graph.charts['y0'].currentMinimum;
    let kY = height / (max - min);
    let linesCount = 5;
    let stepY = this.getLegendStep(max, min, linesCount, kY);

    let stepYSecond, kYSecond, maxSecond, minSecond;

    if (this.modules.state.isYScaled){
      maxSecond = this.getMaxVisiblePoint('y1');
      minSecond = this.getMinVisiblePoint('y1');

      kYSecond = height / (maxSecond - minSecond);
      let kYRatio = kY / kYSecond;

      stepYSecond = this.getLegendStep(maxSecond, minSecond, linesCount, kYSecond, kYRatio);
    }

    if (this.modules.state.type === 'area'){
      stepY = 25;
      linesCount = 5;
      max = 100;
      kY = height / max;
    }

    if (this.nodes.gridLines.length){
      this.nodes.gridLines.forEach( line => {
        line.classList.add(Chart.CSS.gridSectionHidden);
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

      line.classList.remove(Chart.CSS.gridSectionHidden);
      line.style.bottom = `${y * kY}px`;

      line.innerHTML = '';



      let counter = this.getLegendCounter(y + min, 'y0');
      line.appendChild(counter);

      if (stepYSecond){
        counter.style.color = this.modules.state.getLineColor('y0');
        let kYRatio = kY / kYSecond;
        let counter2 = this.getLegendCounter((j * stepYSecond + minSecond), 'y1', true);
        counter2.style.color = this.modules.state.getLineColor('y1');
        line.appendChild(counter2);
      }
    }

    if (this.modules.state.isYScaled){
      this.toggleGridLabelsForChart();
    }
  }

  /**
   * Check if date under passed index should be visible
   * @param {number} originalIndex - index in this.modules.state.dates
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
    let centering = 'translateX(-85%)';
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
    const dateEl = _utils_dom_js__WEBPACK_IMPORTED_MODULE_0__["make"]('time');

    if (this.modules.state.byMonth){
      dateEl.textContent = dt.toLocaleDateString('en-US', {
        month: 'short'
      });
    } else {
      dateEl.textContent = dt.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short'
      });
    }

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
    let datesOnScreenSlice = this.modules.state.dates.slice(this.leftPointIndex, this.rightPointIndex + 2);
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
    this.nodes.legend = _utils_dom_js__WEBPACK_IMPORTED_MODULE_0__["make"]('footer');

    // this.addOnscreenDates();

    _utils_dom_js__WEBPACK_IMPORTED_MODULE_0__["insertAfter"](this.nodes.canvas, this.nodes.legend);
  }

  /**
   * Perform scroll
   * @param position
   */
  scroll(position, fromScale){
    console.log('scroll', position);
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
      this.modules.header.setPeriod(this.modules.state.dates[this.leftPointIndex], this.modules.state.dates[this.rightPointIndex]);
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
      return Math.min(...this.modules.state.linesAvailable.filter(line => this.notHiddenGraph(line)).map(line => {
        return this.modules.state.getMinForLineSliced(line, this.leftPointIndex, this.pointsVisible);
      }));
    }

    return this.modules.state.getMinForLineSliced(line, this.leftPointIndex, this.pointsVisible);
  }

  /**
   * Upscale or downscale graph to fit visible points
   */
  fitToMax(){
    if (this.modules.state.type !== 'area'){
      if (!this.modules.state.isYScaled){
        this.graph.scaleToMaxPoint(this.getMaxVisiblePoint(), this.getMinVisiblePoint());
      } else {
        this.modules.state.linesAvailable.filter(line => this.notHiddenGraph(line)).forEach((line) => {
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
    let x = _utils_event_js__WEBPACK_IMPORTED_MODULE_4__["getPageX"](event);
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

    if (this.modules.state.type === 'bar'){
      this.highlightBar(pointIndex, scrollOffset);
    } else {
      this.pointer.move(newLeft);
    }

    const values = this.modules.state.linesAvailable.filter(line => this.notHiddenGraph(line)).map( line => {
      return {
        name: line,
        value: this.modules.state.getLinePoints(line)[hoveredPointIndex]
      }
    });

    /**
     * Show circles
     */
    this.pointer.showValues(values);

    const date = this.modules.state.dates[hoveredPointIndex];

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

    if (this.modules.state.type === 'bar'){
      this.graph.recalculatePointsHeight();
      this.fitToMax();
    } else if (this.modules.state.type === 'area') {
      this.graph.recalculatePointsHeight();
    } else {
      this.fitToMax();
    }
  }

  toggleGridLabelsForChart(){
    this.modules.state.linesAvailable.forEach(line => {
      this.nodes.grid.querySelectorAll(`[data-name="${line}"]`).forEach( el => {
        el.classList.toggle(Chart.CSS.gridCounterHidden, !this.graph.checkPathVisibility(line))
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
    this.nodes.overlays = _utils_dom_js__WEBPACK_IMPORTED_MODULE_0__["make"]('g');
    this.nodes.overlays.setAttribute('class', Chart.CSS.overlays);


    this.nodes.overlayLeft = _utils_dom_js__WEBPACK_IMPORTED_MODULE_0__["make"]('rect');
    this.nodes.overlayLeft.setAttribute('class', Chart.CSS.overlayLeft);
    this.nodes.overlayRight = _utils_dom_js__WEBPACK_IMPORTED_MODULE_0__["make"]('rect');
    this.nodes.overlayRight.setAttribute('class', Chart.CSS.overlayRight);

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

    this._datesPerScreenInitial = undefined;
    this._showEveryNDateInitial = undefined;

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

/***/ }),

/***/ "./src/modules/graph.js":
/*!******************************!*\
  !*** ./src/modules/graph.js ***!
  \******************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Graph; });
/* harmony import */ var _utils_dom__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/dom */ "./src/utils/dom.js");
/* harmony import */ var _path__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./path */ "./src/modules/path.js");
/* harmony import */ var _bar__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./bar */ "./src/modules/bar.js");
/* harmony import */ var _area__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./area */ "./src/modules/area.js");
/* harmony import */ var _utils_numbers__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../utils/numbers */ "./src/utils/numbers.js");
/* harmony import */ var _utils_log_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../utils/log.js */ "./src/utils/log.js");









/**
 * Working with svg paths for charts
 */
class Graph {
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
    this.canvas = _utils_dom__WEBPACK_IMPORTED_MODULE_0__["make"]('svg');
    this.oxGroup = _utils_dom__WEBPACK_IMPORTED_MODULE_0__["make"]('g');
    this.oyGroup = _utils_dom__WEBPACK_IMPORTED_MODULE_0__["make"]('g');

    this.oxGroup.setAttribute('class', Graph.CSS.oxGroup);
    this.oyGroup.setAttribute('class', Graph.CSS.oyGroup);
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
    this.initialWidth = (this.modules.state.daysCount - 1) * this.stepX;
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
    if (this.modules.state.byMonth){
      if (this.modules.state.type === 'bar'){
        this.stepX = this.width / (this.modules.state.daysCount);
      } else {
        this.stepX = this.width / (this.modules.state.daysCount - 1);
      }
    } else {
      this.stepX = this.width / (this.modules.state.daysCount + 1);
    }

    /**
     * All lines maximum value
     */
    const max = this.modules.state.max;
    const min = this.modules.state.min;
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
    const type = this.modules.state.getCommonChartsType();

    switch (type){
      case 'bar':
        this.maxPoint = this.modules.state.getMaximumAccumulatedByColumns(); // 20% for padding top
        this.minPoint = this.modules.state.min;
        this.drawBarCharts();
        break;
      case 'area':
        this.maxPoint = this.modules.state.getMaximumAccumulatedByColumns(); // 20% for padding top
        this.drawAreaCharts();
        break;
      default:
      case 'line':
        if (!this.modules.state.isYScaled) {
          this.maxPoint = this.modules.state.max;
          this.minPoint = this.modules.state.min;

          this.drawLineCharts();
        } else {
          this.drawScaledLineCharts();
        }

        break;
    }
  }

  drawAreaCharts(){
    let areas = this.modules.state.linesAvailable.reverse().map( line => {
      return new _area__WEBPACK_IMPORTED_MODULE_3__["default"]({
        canvasHeight: this.height,
        stepX: this.stepX,
        key: line,
        color: this.modules.state.getLineColor(line)
      });
    });

    const pointsCount = this.modules.state.daysCount;
    const stacks = this.modules.state.getStacks();

    this.modules.state.linesAvailable.reverse().forEach( (line, index) => {
      areas[index].moveTo(0, this.modules.state.getLinePoints(line)[0], stacks[0]);
    });


    for (let pointIndex = 0; pointIndex < pointsCount; pointIndex++) {
      let prevValue = 0;

      this.modules.state.linesAvailable.reverse().forEach( (line, index) => {
        let pointValue = this.modules.state.getLinePoints(line)[pointIndex];

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
    let barmens = this.modules.state.linesAvailable.reverse().map( line => {
      return new _bar__WEBPACK_IMPORTED_MODULE_2__["default"]({
        canvasHeight: this.height,
        stepX: this.stepX,
        kY,
        key: line
      });
    });

    const pointsCount = this.modules.state.daysCount;
    const stacks = this.modules.state.getStacks();

    for (let pointIndex = 0; pointIndex < pointsCount; pointIndex++) {
      let prevValue = 0;

      this.modules.state.linesAvailable.reverse().forEach( (line, index) => {
        const color = this.modules.state.getLineColor(line);



        let pointValue = this.modules.state.getLinePoints(line)[pointIndex];

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
  getMaxFromVisible(leftPointIndex = 0, pointsVisible = this.modules.state.daysCount, line = undefined){
    const type = this.modules.state.getCommonChartsType();

    switch (type) {
      case 'bar':
        return this.modules.state.getMaximumAccumulatedByColumns(leftPointIndex, leftPointIndex + pointsVisible, this.hiddenCharts);
        break;
      default:
      case 'line':
        if (!line) {
          return Math.max(...this.modules.state.linesAvailable.filter(line => this.checkPathVisibility(line)).map(line => {
            return this.modules.state.getMaxForLineSliced(line, leftPointIndex, pointsVisible);
          }));
        }

        return this.modules.state.getMaxForLineSliced(line, leftPointIndex, pointsVisible, line);
        break;
    }
  }

  drawScaledLineCharts(){
    this.modules.state.linesAvailable.forEach( name => {
      const lineMin = this.modules.state.minForLine(name);
      const lineMax = this.modules.state.maxForLine(name);
      const values = this.modules.state.getLinePoints(name);

      // console.log('[%o] min %o max %o', name, lineMin, lineMax);

      let kY = this.height / (lineMax - lineMin);
      let zeroShifting = lineMin * kY;

      /**
       * Create a Path instance
       */
      const path = new _path__WEBPACK_IMPORTED_MODULE_1__["default"]({
        canvasHeight: this.height,
        isScaled: this.modules.state.isYScaled,
        max: lineMax,
        color: this.modules.state.getLineColor(name),
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
    this.modules.state.linesAvailable.forEach( name => {
      /**
       * Array of chart Y values
       */
      const values = this.modules.state.getLinePoints(name);

      /**
       * Color of drawing line
       */
      const color = this.modules.state.getLineColor(name);

      /**
       * Point to from which we will start drawing
       */
      const leftPoint = values[0];

      this.kY = this.height / (this.maxPoint - this.minPoint);
      this.zeroShifting = this.minPoint * this.kY;

      /**
       * Create a Path instance
       */
      const path = new _path__WEBPACK_IMPORTED_MODULE_1__["default"]({
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


    newMin = _utils_numbers__WEBPACK_IMPORTED_MODULE_4__["roundToMin"](newMin, (newMax - newMin) / 5);


    let max, kY, zeroShifting;

    if (!this.modules.state.isYScaled){
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
    if (this.modules.state.type === 'bar'){
      this.recalculateBars(useRecalculated);
    } else if (this.modules.state.type === 'area') {
      this.recalculateArea(useRecalculated);
    }
  }

  recalculateArea(useRecalculated = false){
    const pointsCount = this.modules.state.daysCount;
    const stacks = this.modules.state.getStacks();

    let recalculated = this.modules.state.recalculatedValues;

    if (useRecalculated && recalculated) {
      for (let i = 0, lenCached = recalculated.length; i < lenCached; i++) {
        if (recalculated[i][1] === 0){
          this.charts[recalculated[i][0]].move(recalculated[i][1], recalculated[i][2], recalculated[i][3], true);
        } else {
          this.charts[recalculated[i][0]].move(recalculated[i][1], recalculated[i][2], recalculated[i][3]);
        }
      }

      this.modules.state.clearRecalculatedValues();
      return;
    }

    let lines = this.modules.state.linesAvailable.filter(line => this.checkPathVisibility(line)).reverse();

    for (let pointIndex = 0; pointIndex < pointsCount; pointIndex++) {
      let prevValue = 0;
      let hiddenPointsValue = this.hiddenCharts.reduce( (val, line) => {
        return val + this.modules.state.getLinePoints(line)[pointIndex];
      }, 0);

      for (let i = 0, lenCached = lines.length; i < lenCached; i++) {
        let newStack = stacks[pointIndex] - hiddenPointsValue;
        let pointValue = this.modules.state.getLinePoints(lines[i])[pointIndex];

        this.modules.state.saveRecalculatedValues([lines[i], pointIndex, newStack, prevValue]);

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
    const pointsCount = this.modules.state.daysCount;
    const stacks = this.modules.state.getStacks();

    let recalculated = this.modules.state.recalculatedValues;

    if (useRecalculated && recalculated) {
      for (let i = 0, lenCached = recalculated.length; i < lenCached; i++) {
        this.charts[recalculated[i][0]].move(recalculated[i][1], recalculated[i][2], recalculated[i][3]);
      }

      this.modules.state.clearRecalculatedValues();
      return;
    }

    let lines = this.modules.state.linesAvailable.filter(line => this.checkPathVisibility(line)).reverse();

    for (let pointIndex = 0; pointIndex < pointsCount; pointIndex++) {
      let prevValue = 0;

      let hiddenPointsValue = this.hiddenCharts.reduce( (val, line) => {
        return val + this.modules.state.getLinePoints(line)[pointIndex];
      }, 0);

      for (let i = 0, lenCached = lines.length; i < lenCached; i++) {
        let newStack = stacks[pointIndex] - hiddenPointsValue;
        let pointValue = this.modules.state.getLinePoints(lines[i])[pointIndex];


        this.modules.state.saveRecalculatedValues([lines[i], pointIndex, newStack, prevValue]);
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

/***/ }),

/***/ "./src/modules/header.js":
/*!*******************************!*\
  !*** ./src/modules/header.js ***!
  \*******************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Header; });
/* harmony import */ var _utils_dom__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/dom */ "./src/utils/dom.js");


class Header {
  constructor(modules){
    this.modules = modules;
    this.nodes = {
      wrapper: undefined,
      title: undefined,
      dates: undefined,
      typeSwitchers: [],
      detailsTogglers: [],
    };

  }

  /**
   * @return {{wrapper: string, title: string, dates: string, typeSwitcher: string, typeSwitcherCurrent: string, detailsToggler: string, detailsTogglerItem: string, detailsTogglerItemCurrent: string}}
   */
  static get CSS(){
    return {
      wrapper: 'tg-header',
      title: 'tg-header__title',
      dates: 'tg-header__dates',
      typeSwitcher: 'tg-header__type-switcher',
      typeSwitcherCurrent: 'tg-header__type-switcher--current',
      detailsToggler: 'tg-header__details',
      detailsTogglerItem: 'tg-header__details-item',
      detailsTogglerItemCurrent: 'tg-header__details-item--current',
    }
  }

  render(){
    this.nodes.wrapper = _utils_dom__WEBPACK_IMPORTED_MODULE_0__["make"]('div', Header.CSS.wrapper);
    this.nodes.title = _utils_dom__WEBPACK_IMPORTED_MODULE_0__["make"]('div', Header.CSS.title);
    this.nodes.dates = _utils_dom__WEBPACK_IMPORTED_MODULE_0__["make"]('div', Header.CSS.dates);

    this.nodes.title.textContent = this.modules.state.title || 'Untitled';
    this.nodes.wrapper.appendChild(this.nodes.title);

    if (this.modules.dataByMonth){
      this.appendDetailsToggler();
    }

    [
      {
        type: 'line',
        icon: `<svg width="17" height="9" xmlns="http://www.w3.org/2000/svg" style="margin: auto -2px;">
                <path d="M13.638 4.28l-1.566 1.5c.147.294.23.623.23.97 0 1.243-1.053 2.25-2.35 2.25-1.298 0-2.35-1.007-2.35-2.25 0-.094.006-.187.018-.278L5.317 5.37c-.422.39-.997.63-1.63.63-.302 0-.59-.054-.854-.153L1 8 0 7l1.717-2.023a2.172 2.172 0 0 1-.38-1.227c0-1.243 1.052-2.25 2.35-2.25 1.297 0 2.349 1.007 2.349 2.25 0 .094-.006.187-.018.278L8.321 5.13c.422-.39.997-.63 1.63-.63.363 0 .707.079 1.014.22l1.565-1.5a2.163 2.163 0 0 1-.229-.97c0-1.243 1.052-2.25 2.35-2.25C15.948 0 17 1.007 17 2.25S15.948 4.5 14.65 4.5c-.362 0-.706-.079-1.012-.22zm-9.952.22c.433 0 .784-.336.784-.75S4.119 3 3.686 3c-.432 0-.783.336-.783.75s.35.75.783.75zm6.266 3c.432 0 .783-.336.783-.75S10.385 6 9.952 6c-.433 0-.784.336-.784.75s.351.75.784.75zM14.65 3c.432 0 .783-.336.783-.75s-.35-.75-.783-.75c-.433 0-.784.336-.784.75s.351.75.784.75z"/>
              </svg>`
      },
      {
        type: 'area',
        icon: `<svg width="15" height="13" xmlns="http://www.w3.org/2000/svg" style="margin: auto -1px;">
                <path d="M15 7.952L6.032 9.233 3.765 6.21 0 8.36V5.382l3.557-2.371 4.884 3.488L15 4.531v3.42zm0 1.443v1.462a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-.85l3.378-1.931 2.019 2.69L15 9.396zm0-6.355L8.702 4.93 3.585 1.274 0 3.665V2a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v1.04z"/>
              </svg>`
      },
      {
        type: 'bar',
        icon: `<svg width="14" height="13" xmlns="http://www.w3.org/2000/svg">
                <rect y="7" width="2" height="6" rx="1"/>
                <rect x="12" y="6" width="2" height="7" rx="1"/>
                <rect x="4" y="4" width="2" height="9" rx="1"/>
                <rect x="8" width="2" height="13" rx="1"/>
              </svg>`,
      },
    ].forEach(({type, icon}) => {
      const switcher = _utils_dom__WEBPACK_IMPORTED_MODULE_0__["make"]('span', Header.CSS.typeSwitcher);

      if (type === this.modules.state.type){
        switcher.classList.add(Header.CSS.typeSwitcherCurrent);
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

  /**
   * Create Day|Month toggler
   */
  appendDetailsToggler(){
    const toggler = _utils_dom__WEBPACK_IMPORTED_MODULE_0__["make"]('span', Header.CSS.detailsToggler);

    [
      {
        title: 'Day',
        dataStoringProperty: 'data'
      },
      {
        title: 'Month',
        dataStoringProperty: 'dataByMonth'
      }
    ].forEach(({title, dataStoringProperty}, index) => {
      const togglerItem = _utils_dom__WEBPACK_IMPORTED_MODULE_0__["make"]('span', Header.CSS.detailsTogglerItem);

      if (index === 0) {
        togglerItem.classList.add(Header.CSS.detailsTogglerItemCurrent);
      }

      togglerItem.innerHTML = title;
      togglerItem.addEventListener('click', () => {
        this.detailsTogglerClicked(dataStoringProperty, togglerItem);
      });
      toggler.appendChild(togglerItem);

      this.nodes.detailsTogglers.push(togglerItem);
    });

    this.nodes.wrapper.appendChild(toggler);
  }

  typeSwitcherClicked(type, switcher){
    this.modules.state.type = type;
    this.modules.state.clearRecalculatedValues();
    this.modules.chart.destroy();
    this.modules.chart.renderCharts();
    this.modules.minimap.renderMap();
    this.modules.minimap.syncScrollWithChart();

    this.nodes.typeSwitchers.forEach(el => el.classList.remove(Header.CSS.typeSwitcherCurrent));

    switcher.classList.add(Header.CSS.typeSwitcherCurrent);
  }

  detailsTogglerClicked(dataStoringProperty, toggler){
    this.modules.createState(dataStoringProperty);

    this.modules.chart.destroy();
    this.modules.chart.renderCharts();
    this.modules.minimap.renderMap();
    this.modules.minimap.syncScrollWithChart();

    this.nodes.detailsTogglers.forEach(el => el.classList.remove(Header.CSS.detailsTogglerItemCurrent));

    toggler.classList.add(Header.CSS.detailsTogglerItemCurrent);
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

/***/ }),

/***/ "./src/modules/legend.js":
/*!*******************************!*\
  !*** ./src/modules/legend.js ***!
  \*******************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Legend; });
/* harmony import */ var _utils_dom_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/dom.js */ "./src/utils/dom.js");


class Legend {
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
    this.nodes.wrapper = _utils_dom_js__WEBPACK_IMPORTED_MODULE_0__["make"]('div', Legend.CSS.wrapper);

    /**
     * Object with names -> array with names
     */
    const namesArray = Object.entries(this.modules.state.names).map(([name, title]) => {
      return {name, title}
    });

    namesArray.forEach(({name, title}) => {
      let item = _utils_dom_js__WEBPACK_IMPORTED_MODULE_0__["make"]('div', [Legend.CSS.item, Legend.CSS.itemEnabled]),
        checkbox = _utils_dom_js__WEBPACK_IMPORTED_MODULE_0__["make"]('span', Legend.CSS.checkbox);

      item.style.borderColor = this.modules.state.colors[name];
      item.style.backgroundColor = this.modules.state.colors[name];

      item.appendChild(checkbox);
      item.appendChild(document.createTextNode(title));

      this.buttons[name] = item;

      this._clickPrevented = false;

      item.addEventListener('click', () => {
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

      this.uncheckAllExceptPassed(name);
    }, 500);
  }

  uncheckAllExceptPassed(exceptName) {
    Object.entries(this.buttons).forEach(([name, el], index) => {
        if (name !== exceptName){
          this.buttons[name].classList.remove(Legend.CSS.itemEnabled);
          this.buttons[name].style.backgroundColor = 'transparent';
          this.buttons[name].style.color = this.modules.state.colors[name];

          this.modules.chart.togglePath(name, true);
          this.modules.minimap.togglePath(name, true);
        } else {
          this.buttons[name].classList.add(Legend.CSS.itemEnabled);
          this.buttons[name].style.backgroundColor = this.modules.state.colors[name];
          this.buttons[name].style.color = '#fff';

          this.buttons[name].classList.add(Legend.CSS.itemSelected);
          setTimeout(() => {
            this.buttons[name].classList.remove(Legend.CSS.itemSelected);
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
    }, 400)

    clearTimeout(this._timer);
  }


  /**
   * Click handler for togglers
   * @param {string} name - graph name
   */
  itemClicked(name){
    let isLast = this.modules.state.linesAvailable.filter(line => this.modules.chart.graph.checkPathVisibility(line)).length === 1;

    if (!this.buttons[name].classList.contains(Legend.CSS.itemEnabled)){
      this.buttons[name].classList.add(Legend.CSS.itemEnabled);
      this.buttons[name].style.backgroundColor = this.modules.state.colors[name];
      this.buttons[name].style.color = '#fff';

      this.buttons[name].classList.add(Legend.CSS.itemSelected);
      setTimeout(() => {
        this.buttons[name].classList.remove(Legend.CSS.itemSelected);
      }, 300);
    } else {
      if (isLast){
        this.buttons[name].classList.add(Legend.CSS.itemWobble);
        setTimeout(() => {
          this.buttons[name].classList.remove(Legend.CSS.itemWobble);
        }, 300);

        return;
      }

      this.buttons[name].classList.remove(Legend.CSS.itemEnabled);
      this.buttons[name].style.backgroundColor = 'transparent';
      this.buttons[name].style.color = this.modules.state.colors[name];
    }

    this.modules.chart.togglePath(name);
    this.modules.minimap.togglePath(name);
  }

  toggle(name){

  }
}


/***/ }),

/***/ "./src/modules/minimap.js":
/*!********************************!*\
  !*** ./src/modules/minimap.js ***!
  \********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Minimap; });
/* harmony import */ var _utils_dom_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/dom.js */ "./src/utils/dom.js");
/* harmony import */ var _utils_event_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/event.js */ "./src/utils/event.js");
/* harmony import */ var _utils_debounce_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/debounce.js */ "./src/utils/debounce.js");
/* harmony import */ var _graph_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./graph.js */ "./src/modules/graph.js");
/* harmony import */ var _utils_log_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../utils/log.js */ "./src/utils/log.js");







/**
 * Module for working with Chart Mini map
 * - Render UI
 * - Render graphs
 * - Scaling
 * - Scrolling
 */
class Minimap {
  /**
   * Telegraph
   * @param modules
   */
  constructor(modules){
    this.modules = modules;
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
    this.scalerWidth = 14;

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

    /**
     * Wrapper rect cache
     * @type {ClientRect}
     */
    this.wrapperRect = null;

    this.prevX = 0;

    this.graph = new _graph_js__WEBPACK_IMPORTED_MODULE_3__["default"](this.modules, {
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
    this.nodes.wrapper = _utils_dom_js__WEBPACK_IMPORTED_MODULE_0__["make"]('div', Minimap.CSS.wrapper);
    this.nodes.leftZone = _utils_dom_js__WEBPACK_IMPORTED_MODULE_0__["make"]('div', Minimap.CSS.leftZone);
    this.nodes.centerZone = _utils_dom_js__WEBPACK_IMPORTED_MODULE_0__["make"]('div', Minimap.CSS.centerZone);
    this.nodes.rightZone = _utils_dom_js__WEBPACK_IMPORTED_MODULE_0__["make"]('div', Minimap.CSS.rightZone);
    this.nodes.leftZoneScaler = _utils_dom_js__WEBPACK_IMPORTED_MODULE_0__["make"]('div', Minimap.CSS.leftZoneScaler);
    this.nodes.rightZoneScaler = _utils_dom_js__WEBPACK_IMPORTED_MODULE_0__["make"]('div', Minimap.CSS.rightZoneScaler);

    this.nodes.leftZone.appendChild(this.nodes.leftZoneScaler);
    this.nodes.rightZone.appendChild(this.nodes.rightZoneScaler);

    this.nodes.wrapper.appendChild(this.nodes.leftZone);
    this.nodes.wrapper.appendChild(this.nodes.centerZone);
    this.nodes.wrapper.appendChild(this.nodes.rightZone);

    /**
     * Wait dom appending
     */
    setTimeout(() => {
      this.wrapperRect = this.nodes.wrapper.getBoundingClientRect();
    }, 100);

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
      width: this.nodes.wrapper.offsetWidth - 2,  // 2 for borders
      height: this.nodes.wrapper.offsetHeight - 2
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
    this.nodes.centerZone.style.left = val + this.scalerWidth + 'px';
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
    this.nodes.centerZone.style.width = (value - this.scalerWidth*2) + 'px';
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

    window.addEventListener('mousemove', (event) => {
      this.viewportMousemove(event);
    }, supportsPassive ? { passive: true } : false);

    window.addEventListener('mouseup', (event) => {
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

    const leftScalerClicked = !!target.closest(`.${Minimap.CSS.leftZoneScaler}`);
    const rightScalerClicked = !!target.closest(`.${Minimap.CSS.rightZoneScaler}`);

    this.viewportWidthBeforeDrag = this.width;
    this.moveStartX = _utils_event_js__WEBPACK_IMPORTED_MODULE_1__["getPageX"](event);

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
    let delta = _utils_event_js__WEBPACK_IMPORTED_MODULE_1__["getPageX"](event) - this.moveStartX;

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
    let pageX = _utils_event_js__WEBPACK_IMPORTED_MODULE_1__["getPageX"](event);
    let delta = pageX - this.moveStartX;

    let direction = this.prevX < pageX ? 'right' : 'left';

    if (pageX > this.wrapperRect.right || pageX < this.wrapperRect.left){
      return;
    }

    if (!delta || this.prevX === pageX){
      return;
    }

    this.prevX = pageX + 0;

    let newScalerWidth;

    if (side === 'left'){
      delta = delta * -1;
      newScalerWidth = Math.max(0, this.viewportOffsetLeft - delta);

      if (newScalerWidth > this.leftZoneMaximumWidth) {
        return;
      }

      this.leftWidth = newScalerWidth;

      this.centerWidth = (this.wrapperWidth - newScalerWidth - this.rightZoneWidth)

    } else {
      newScalerWidth = Math.max(0, this.wrapperWidth - this.viewportOffsetLeft - (this.viewportWidthBeforeDrag + delta));

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

    if (this.modules.state.type === 'bar'){
      this.graph.recalculatePointsHeight(true);
      this.fitToMax();
    } else if (this.modules.state.type === 'area') {
      this.graph.recalculatePointsHeight(true);
    } else {
      this.fitToMax();
    }
  }

  /**
   * Upscale or downscale graph to fit visible points
   */
  fitToMax(){
    if (this.modules.state.type !== 'area'){
      if (!this.modules.state.isYScaled){
        this.graph.scaleToMaxPoint(this.graph.getMaxFromVisible());
      } else {
        this.modules.state.linesAvailable.filter(line => this.modules.chart.notHiddenGraph(line)).forEach((line) => {
          this.graph.scaleToMaxPoint(this.graph.getMaxFromVisible(line), undefined, line);
        })
      }
    }
  }
}

/***/ }),

/***/ "./src/modules/path.js":
/*!*****************************!*\
  !*** ./src/modules/path.js ***!
  \*****************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Path; });
/* harmony import */ var _utils_dom__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/dom */ "./src/utils/dom.js");


/**
 * Helper for creating an SVG path
 */
class Path {
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

    this.path = _utils_dom__WEBPACK_IMPORTED_MODULE_0__["make"]('path', null, {
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
    return this.path.classList.contains(Path.CSS.graphHidden);
  }

  toggleVisibility(status){
    this.path.classList.toggle(Path.CSS.graphHidden, status);
  }
}

/***/ }),

/***/ "./src/modules/pointer.js":
/*!********************************!*\
  !*** ./src/modules/pointer.js ***!
  \********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Pointer; });
/* harmony import */ var _utils_dom__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/dom */ "./src/utils/dom.js");


/**
 * Line with current values pointers
 */
class Pointer {
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
    this.nodes.wrapper = _utils_dom__WEBPACK_IMPORTED_MODULE_0__["make"]('div', Pointer.CSS.wrapper);
    return this.nodes.wrapper;
  }

  show(){
    this.nodes.wrapper.classList.add(Pointer.CSS.showed);
  }

  hide(){
    this.nodes.wrapper.classList.remove(Pointer.CSS.showed);
  }

  move(leftPx){
    this.show();
    this.nodes.wrapper.style.left = `${leftPx}px`;
  }

  toggleVisibility(name){
    if (this.pointers[name]) {
      this.pointers[name].classList.toggle(Pointer.CSS.pointerHidden)
    }
  }

  /**
   * Show circles
   * @param {{name: string, value: number}[]} values
   */
  showValues(values){
    if (this.modules.state.type === 'area'){
      if (Object.keys(this.pointers).length){
        Object.values(this.pointers).forEach((el) => {
          el.remove();
        });

        this.pointers = {};
      }
      return;
    }

    if (!Object.keys(this.pointers).length){
      values.forEach( ({name}) => {
        const item = _utils_dom__WEBPACK_IMPORTED_MODULE_0__["make"]('div', Pointer.CSS.pointer);

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

/***/ }),

/***/ "./src/modules/state.js":
/*!******************************!*\
  !*** ./src/modules/state.js ***!
  \******************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return State; });
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
      dates: this.columns[0],
      daysCount: this.columns[0].length
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

/***/ }),

/***/ "./src/modules/tooltip.js":
/*!********************************!*\
  !*** ./src/modules/tooltip.js ***!
  \********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Tooltip; });
/* harmony import */ var _utils_dom_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/dom.js */ "./src/utils/dom.js");
/* harmony import */ var _utils_numbers__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/numbers */ "./src/utils/numbers.js");



class Tooltip {
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
    this.nodes.wrapper = _utils_dom_js__WEBPACK_IMPORTED_MODULE_0__["make"]('div', Tooltip.CSS.wrapper);
    this.nodes.title = _utils_dom_js__WEBPACK_IMPORTED_MODULE_0__["make"]('div', Tooltip.CSS.title);
    this.nodes.values = _utils_dom_js__WEBPACK_IMPORTED_MODULE_0__["make"]('div', Tooltip.CSS.values);

    this.nodes.wrapper.appendChild(this.nodes.title);
    this.nodes.wrapper.appendChild(this.nodes.values);

    return this.nodes.wrapper;
  }

  show(){
    this.nodes.wrapper.classList.add(Tooltip.CSS.showed);
  }

  hide(){
    this.nodes.wrapper.classList.remove(Tooltip.CSS.showed);
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
    const item = _utils_dom_js__WEBPACK_IMPORTED_MODULE_0__["make"]('div', Tooltip.CSS.value);
    const counter = _utils_dom_js__WEBPACK_IMPORTED_MODULE_0__["make"]('b');

    if (isAll){
      item.classList.add('all');
    }

    if (this.modules.state.type === 'area'){
      let total = all.reduce((acc, cur) => acc += cur.value, 0);
      let percent = Math.ceil((value / total) * 100);
      let percentEl = _utils_dom_js__WEBPACK_IMPORTED_MODULE_0__["make"]('span', 'percents');

      percentEl.textContent = percent + '%';

      item.appendChild(percentEl)
    }

    let titleEl = _utils_dom_js__WEBPACK_IMPORTED_MODULE_0__["make"]('span', Tooltip.CSS.valueTitle);

    titleEl.textContent = title;

    item.appendChild(titleEl);
    item.appendChild(counter);

    counter.style.color = color;

    let valueBeautified = _utils_numbers__WEBPACK_IMPORTED_MODULE_1__["addSpaces"](value);

    setTimeout(() => {
      _utils_dom_js__WEBPACK_IMPORTED_MODULE_0__["animateCounter"](counter, valueBeautified, prevValue);
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
    let left = _utils_dom_js__WEBPACK_IMPORTED_MODULE_0__["make"]('span', 'left');
    let right = _utils_dom_js__WEBPACK_IMPORTED_MODULE_0__["make"]('span');

    let newDate = ''

    if (!this.modules.state.byMonth){
      newDate =   `${week[weekday]}, ${day}`;
      right.textContent = months[month] + ' ' + year;
    } else {
      newDate = months[month] + ' ';
      right.textContent = year;
    }

    this.nodes.title.innerHTML = '';
    this.nodes.title.appendChild(left);
    this.nodes.title.appendChild(right);



    _utils_dom_js__WEBPACK_IMPORTED_MODULE_0__["animateCounter"](left, newDate, this._prevDate, 'top' );
    this._prevDate = newDate
  }
}

/***/ }),

/***/ "./src/styles/index.pcss":
/*!*******************************!*\
  !*** ./src/styles/index.pcss ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = ":root{--color-bg:#fff;--color-gray:#939ca1;--gray-line:rgba(24,45,59,0.1);--button-bg:#fff;--button-color:#000;--button-border:#e6e6e6;--button-bg-current:#e3f3ff;--button-border-current:#c5e2fa;--minimap-overlays-color:rgba(245,244,245,0.65);--minimap-scaler-bg:rgba(137,138,152,0.7);--minimap-scaler-bg--hover:#898a98;@custom-media --mobile (max-width: 1000px)}.tg--night-mode{--color-bg:#2b3037;--color-gray:rgba(217,242,255,0.27);--gray-line:hsla(0,0%,100%,0.1);--button-color:#fff;--button-bg:#293039;--button-border:hsla(0,0%,100%,0.2);--button-border-current:rgba(195,214,231,0.26);--button-bg-current:rgba(131,145,163,0.11);--minimap-overlays-color:rgba(38,41,43,0.62);--minimap-scaler-bg:rgba(109,146,185,0.4);--minimap-scaler-bg--hover:rgba(109,146,185,0.7)}.tg-chart{position:relative;margin-bottom:25px;//margin-right:15px;font-size:14px;font-family:Roboto,Oxygen,Ubuntu,Cantarell,Fira Sans,Droid Sans,sans-serif;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;-webkit-tap-highlight-color:rgba(255,255,255,0);-webkit-tap-highlight-color:transparent;-webkit-touch-callout:none}.tg-chart__viewport{display:block;overflow-x:hidden}.tg-chart svg{width:100%;height:100%}.tg-header{margin-bottom:20px;padding:15px;display:-webkit-box;display:-ms-flexbox;display:flex;-ms-flex-wrap:wrap;flex-wrap:wrap;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}@media (--mobile){.tg-header{font-size:15px}}.tg-header__title{-ms-flex-preferred-size:100%;flex-basis:100%;margin:0 0 15px;font-weight:600;font-size:18px}.tg-header__dates{margin-left:auto;margin-top:auto;font-size:15px;margin-bottom:auto}@media (--mobile){.tg-header__dates{font-size:13px}}.tg-header__type-switcher{display:-webkit-inline-box;display:-ms-inline-flexbox;display:inline-flex;background:#fff;background:var(--button-bg);border:1px solid #e6e6e6;border:1px solid var(--button-border);-webkit-box-sizing:border-box;box-sizing:border-box;-webkit-box-shadow:0 1px 1px 0 rgba(0,0,0,.03);box-shadow:0 1px 1px 0 rgba(0,0,0,.03);border-radius:2px;height:34px;line-height:32px;padding:0 9px;font-size:14px;font-weight:500;cursor:pointer;z-index:99;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;-webkit-tap-highlight-color:rgba(255,255,255,0);-webkit-tap-highlight-color:transparent;-webkit-touch-callout:none}.tg-header__type-switcher:hover{-webkit-box-shadow:0 1px 1px 0 rgba(0,0,0,.08);box-shadow:0 1px 1px 0 rgba(0,0,0,.08);border-color:#d8d8d8}.tg-header__type-switcher{width:34px;margin-right:5px}.tg-header__type-switcher--current{background:#e3f3ff;background:var(--button-bg-current);border:1px solid #c5e2fa;border:1px solid var(--button-border-current);border-radius:2px}.tg-header__type-switcher--current:hover{border-color:#add6f8}.tg-header__type-switcher svg{fill:currentColor;margin:auto}.tg-header__details{margin-right:15px}.tg-header__details-item{display:-webkit-inline-box;display:-ms-inline-flexbox;display:inline-flex;background:#fff;background:var(--button-bg);border:1px solid #e6e6e6;border:1px solid var(--button-border);-webkit-box-sizing:border-box;box-sizing:border-box;-webkit-box-shadow:0 1px 1px 0 rgba(0,0,0,.03);box-shadow:0 1px 1px 0 rgba(0,0,0,.03);border-radius:2px;height:34px;line-height:32px;padding:0 9px;font-size:14px;font-weight:500;cursor:pointer;z-index:99;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;-webkit-tap-highlight-color:rgba(255,255,255,0);-webkit-tap-highlight-color:transparent;-webkit-touch-callout:none}.tg-header__details-item:hover{-webkit-box-shadow:0 1px 1px 0 rgba(0,0,0,.08);box-shadow:0 1px 1px 0 rgba(0,0,0,.08);border-color:#d8d8d8}.tg-header__details-item{min-width:70px;-webkit-box-pack:center;-ms-flex-pack:center;justify-content:center}.tg-header__details-item--current{background:#e3f3ff;background:var(--button-bg-current);border:1px solid #c5e2fa;border:1px solid var(--button-border-current);border-radius:2px}.tg-header__details-item--current:hover{border-color:#add6f8}.tg-header__details-item svg{fill:currentColor}.tg-header__details-item:first-of-type:not(.tg-header__details-item--current){border-right:0;min-width:69px}.tg-header__details-item--current+.tg-header__details-item{border-left:0;min-width:69px}.tg-header__details-item:not(:last-of-type){border-radius:2px 0 0 2px}.tg-header__details-item:not(:first-of-type){border-radius:0 2px 2px 0}.tg-legend{margin-bottom:50px;padding:0 15px;font-family:Helvetica Neue,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Oxygen,Ubuntu,Cantarell,Fira Sans,Droid Sans,sans-serif}.tg-legend__item{display:-webkit-inline-box;display:-ms-inline-flexbox;display:inline-flex;background:#fff;background:var(--button-bg);border:1px solid #e6e6e6;border:1px solid var(--button-border);-webkit-box-sizing:border-box;box-sizing:border-box;-webkit-box-shadow:0 1px 1px 0 rgba(0,0,0,.03);box-shadow:0 1px 1px 0 rgba(0,0,0,.03);border-radius:2px;height:34px;line-height:32px;padding:0 9px;font-size:14px;font-weight:500;cursor:pointer;z-index:99;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;-webkit-tap-highlight-color:rgba(255,255,255,0);-webkit-tap-highlight-color:transparent;-webkit-touch-callout:none}.tg-legend__item:hover{-webkit-box-shadow:0 1px 1px 0 rgba(0,0,0,.08);box-shadow:0 1px 1px 0 rgba(0,0,0,.08);border-color:#d8d8d8}.tg-legend__item{margin-right:5px;padding:0 22px;color:#fff;-webkit-transition:background-color .2s ease;transition:background-color .2s ease;will-change:background-color,border-color,padding;vertical-align:bottom;-webkit-box-shadow:none;box-shadow:none}.tg-legend__item--current{background:#e3f3ff;background:var(--button-bg-current);border:1px solid #c5e2fa;border:1px solid var(--button-border-current);border-radius:2px}.tg-legend__item--current:hover{border-color:#add6f8}.tg-legend__item svg{fill:currentColor}.tg-legend__item--wobble{-webkit-animation:wobble .6s ease-out!important;animation:wobble .6s ease-out!important}.tg-legend__item--enabled{padding:0 10px}.tg-legend__checkbox{position:relative;width:16px;height:16px;display:none;margin:auto 7px auto 0}.tg-legend__checkbox:before{content:\"\";position:absolute;left:3px;top:3px;display:inline-block;width:11px;height:5px;border-left:2px solid #fff;border-bottom:2px solid #fff;-webkit-transform:rotate(-45deg);transform:rotate(-45deg);opacity:0}@-webkit-keyframes wobble{0%{opacity:.5;-webkit-transform:rotate(-4deg);transform:rotate(-4deg)}25%{opacity:1}75%{opacity:.5;-webkit-transform:rotate(4deg);transform:rotate(4deg)}to{opacity:1}}@keyframes wobble{0%{opacity:.5;-webkit-transform:rotate(-4deg);transform:rotate(-4deg)}25%{opacity:1}75%{opacity:.5;-webkit-transform:rotate(4deg);transform:rotate(4deg)}to{opacity:1}}.tg-legend__item--selected{-webkit-animation:splash .15s ease;animation:splash .15s ease;-webkit-animation-fill-mode:forwards;animation-fill-mode:forwards}.tg-legend__item--enabled .tg-legend__checkbox:before{-webkit-animation:rolling .2s ease .1s;animation:rolling .2s ease .1s;-webkit-animation-fill-mode:forwards;animation-fill-mode:forwards}.tg-legend__item--enabled .tg-legend__checkbox{display:inline-block}@-webkit-keyframes rolling{0%{-webkit-transform:rotate(-20deg) translate(2px,7px) scale(.8);transform:rotate(-20deg) translate(2px,7px) scale(.8);opacity:0;width:0;height:0}to{-webkit-transform:rotate(-50deg);transform:rotate(-50deg);opacity:1;width:11px;height:5px}}@keyframes rolling{0%{-webkit-transform:rotate(-20deg) translate(2px,7px) scale(.8);transform:rotate(-20deg) translate(2px,7px) scale(.8);opacity:0;width:0;height:0}to{-webkit-transform:rotate(-50deg);transform:rotate(-50deg);opacity:1;width:11px;height:5px}}@-webkit-keyframes splash{0%{-webkit-transform:scale(.95);transform:scale(.95)}80%{-webkit-transform:scale(1.05);transform:scale(1.05)}to{-webkit-transform:scale(1);transform:scale(1)}}@keyframes splash{0%{-webkit-transform:scale(.95);transform:scale(.95)}80%{-webkit-transform:scale(1.05);transform:scale(1.05)}to{-webkit-transform:scale(1);transform:scale(1)}}.tg-minimap{position:relative;height:60px;margin:10px 15px 20px;cursor:pointer;border-radius:3px;-webkit-tap-highlight-color:rgba(255,255,255,0);-webkit-tap-highlight-color:transparent;-webkit-touch-callout:none;border:1px solid rgba(24,45,59,.1);border:1px solid var(--gray-line);-webkit-box-sizing:border-box;box-sizing:border-box;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;//border:1px solid #ebebeb}.tg-minimap svg{border-radius:3px;overflow:hidden}.tg-minimap__left,.tg-minimap__right{position:absolute;top:0;bottom:0;width:20%;background:rgba(245,244,245,.65);background:var(--minimap-overlays-color);z-index:2;cursor:default;will-change:width}.tg-minimap__left{left:0;border-radius:3px 0 0 3px}.tg-minimap__center{position:absolute;top:-2px;bottom:-2px;width:10px;border-top:2px solid rgba(137,138,152,.7);border-top:2px solid var(--minimap-scaler-bg);border-bottom:2px solid rgba(137,138,152,.7);border-bottom:2px solid var(--minimap-scaler-bg)}.tg-minimap__right{right:0;border-radius:0 3px 3px 0}.tg-minimap__left-scaler,.tg-minimap__right-scaler{position:absolute;height:calc(100% + 4px);top:-2px;z-index:2;cursor:col-resize}.tg-minimap__left-scaler{right:0}.tg-minimap__right-scaler{left:0}.tg-minimap__left-scaler:before,.tg-minimap__right-scaler:before{content:\"\";position:absolute;height:100%;width:14px;background:rgba(137,138,152,.7);background:var(--minimap-scaler-bg);-webkit-box-sizing:border-box;box-sizing:border-box}.tg-minimap__left-scaler:after,.tg-minimap__right-scaler:after{content:\"\";position:absolute;height:15px;width:2px;border-radius:5px;background:#fff;top:50%;-webkit-transform:translateY(-50%);transform:translateY(-50%)}.tg-minimap__right-scaler:after{left:-6px}.tg-minimap__left-scaler:after{right:-8px}.tg-minimap__left-scaler:before{right:-14px;border-radius:3px 0 0 3px;border-right:0}.tg-minimap__right-scaler:before{left:-12px;border-radius:0 3px 3px 0;border-left:0}.tg-minimap__left-scaler:hover:before,.tg-minimap__right-scaler:hover:before{background:#898a98;background:var(--minimap-scaler-bg--hover)}.tg-chart g,.tg-minimap g{-webkit-transform-origin:bottom left;transform-origin:bottom left;will-change:transform}.tg-chart .oy-group,.tg-minimap .oy-group{-webkit-transition:-webkit-transform .3s ease;transition:-webkit-transform .3s ease;transition:transform .3s ease;transition:transform .3s ease,-webkit-transform .3s ease;will-change:transform;shape-rendering:optimizespeed}.tg-chart path.scaled{-webkit-transition:opacity .3s ease,-webkit-transform .4s ease;transition:opacity .3s ease,-webkit-transform .4s ease;transition:transform .4s ease,opacity .3s ease;transition:transform .4s ease,opacity .3s ease,-webkit-transform .4s ease;will-change:transform,opacity}.tg-chart path,.tg-minimap path{-webkit-transform-origin:bottom left;transform-origin:bottom left;-webkit-transition:opacity .3s ease;transition:opacity .3s ease;will-change:opacity;shape-rendering:optimizespeed}.tg-chart--line path{shape-rendering:geometricprecision}.tg-chart .tg-graph--hidden,.tg-minimap .tg-graph--hidden{opacity:0}.tg-bar{will-change:opacity,transform;-webkit-transition:opacity .35s ease,-webkit-transform .3s ease;transition:opacity .35s ease,-webkit-transform .3s ease;transition:opacity .35s ease,transform .3s ease;transition:opacity .35s ease,transform .3s ease,-webkit-transform .3s ease}.tg-bar--hidden{opacity:0}.tg-chart .tg-bar--hidden{-webkit-transform:matrix(1,0,0,.1,0,50);transform:matrix(1,0,0,.1,0,50)}.tg-minimap .tg-bar{-webkit-transition:none!important;transition:none!important}.tg-bar rect{will-change:height,y;shape-rendering:optimizespeed}.tg-chart__overlays{will-change:opacity;-webkit-transition:opacity .25s ease;transition:opacity .25s ease}.tg-chart__overlay-left,.tg-chart__overlay-right{fill:#fff;opacity:.5;will-change:width,x}.tg-area{will-change:opacity,transform!important;-webkit-transition:all .17s ease!important;transition:all .17s ease!important}.tg-area--hidden{-webkit-transform:scaleY(0)!important;transform:scaleY(0)!important}.tg-chart footer{margin-top:10px;margin-left:15px;height:18px;color:#939ca1;color:var(--color-gray);font-size:12px;font-family:Roboto,Helvetica Neue,-apple-system,BlinkMacSystemFont,Segoe UI,Oxygen,Ubuntu,Cantarell,Fira Sans,Droid Sans,sans-serif;position:relative}.tg-chart time{position:absolute;display:block;white-space:nowrap;-webkit-transition:opacity .25s ease;transition:opacity .25s ease;will-change:opacity,transform;-webkit-animation:fade-in .25s ease;animation:fade-in .25s ease}@-webkit-keyframes fade-in{0%{opacity:0}to{opacity:1}}@keyframes fade-in{0%{opacity:0}to{opacity:1}}.tg-chart time.hided{opacity:0}.tg-pointer{position:absolute;top:0;left:0;height:350px;opacity:0;will-change:opacity,left}.tg-pointer--showed{opacity:1}.tg-pointer:before{content:\"\";position:absolute;top:0;left:0;bottom:0;width:1px;background:rgba(170,181,191,.33)}.tg-chart--area .tg-pointer:before{background-color:hsla(0,0%,100%,.2)}.tg-pointer__pointer{display:inline-block;width:10px;height:10px;border:3px solid #1f2938;background:#fff;border-radius:50%;position:absolute;left:-5px;bottom:0;margin-bottom:-5px;-webkit-box-sizing:border-box;box-sizing:border-box;z-index:2;will-change:transform}.tg-pointer__pointer--hidden{display:none}.tg-grid{position:absolute;right:0;top:0;left:15px;height:350px;color:#939ca1;color:var(--color-gray);font-size:12px;font-family:Roboto,Helvetica Neue,-apple-system,BlinkMacSystemFont,Segoe UI,Oxygen,Ubuntu,Cantarell,Fira Sans,Droid Sans,sans-serif}.tg-grid__section{position:absolute;left:0;right:0;bottom:0;padding-bottom:5px;border-bottom:1px solid rgba(24,45,59,.1);border-bottom:1px solid var(--gray-line);-webkit-transition:opacity .35s ease,bottom .28s ease,-webkit-transform .28s ease;transition:opacity .35s ease,bottom .28s ease,-webkit-transform .28s ease;transition:transform .28s ease,opacity .35s ease,bottom .28s ease;transition:transform .28s ease,opacity .35s ease,bottom .28s ease,-webkit-transform .28s ease;will-change:transfrom,opacity}.tg-grid__counter{-webkit-transition:opacity .3s ease;transition:opacity .3s ease;will-change:opacity}.tg-grid__counter--hidden{opacity:0}.tg-chart--line .tg-grid__counter{display:inline-block;background:#fff;background:var(--color-bg);color:#939ca1;color:var(--color-gray);border-radius:2px;padding:2px 4px;margin:0 -2px}.tg-grid__counter--second{float:right}.tg-grid__section--hidden{opacity:0;-webkit-transform:translateY(-50px);transform:translateY(-50px)}@-webkit-keyframes jump-in{0%{-webkit-transform:translateY(-30px);transform:translateY(-30px);opacity:0}to{-webkit-transform:none;transform:none;opacity:1}}@keyframes jump-in{0%{-webkit-transform:translateY(-30px);transform:translateY(-30px);opacity:0}to{-webkit-transform:none;transform:none;opacity:1}}.tg-tooltip{position:absolute;background:#fff;border-radius:10px;-webkit-box-shadow:0 1px 4px 0 rgba(0,0,0,.13);box-shadow:0 1px 4px 0 rgba(0,0,0,.13);top:20px;padding:10px 15px;z-index:3;-webkit-transition:left .3s ease,opacity .4s ease;transition:left .3s ease,opacity .4s ease;will-change:left,opacity;opacity:0;min-width:140px;font-size:13px;font-family:Roboto,Helvetica Neue,-apple-system,BlinkMacSystemFont,Segoe UI,Oxygen,Ubuntu,Cantarell,Fira Sans,Droid Sans,sans-serif}.tg-tooltip--showed{opacity:1}.tg-tooltip__title{display:block;min-height:1.1em;font-weight:500;white-space:nowrap}.tg-tooltip__title .left{position:relative;margin-right:5px;display:inline-block;vertical-align:top}.tg-tooltip__title .left span{right:auto;left:0}.tg-tooltip__values{-webkit-box-orient:vertical;-webkit-box-direction:normal;-ms-flex-direction:column;flex-direction:column}.tg-tooltip__values,.tg-tooltip__values-item{display:-webkit-box;display:-ms-flexbox;display:flex}.tg-tooltip__values-item{margin-top:5px}.tg-tooltip__values-item:first-of-type{margin-top:7px}.tg-tooltip__values-item-title{display:inline-block;padding-right:20px}.tg-tooltip .percents{display:inline-block;font-weight:500;min-width:26px;text-align:right;margin-right:10px}.tg-tooltip__values-item b{margin-left:auto;white-space:nowrap;position:relative}.counter-prev{-webkit-animation:exit .4s ease;animation:exit .4s ease;-webkit-animation-fill-mode:forwards;animation-fill-mode:forwards}.counter-cur,.counter-prev{position:absolute;will-change:transform,opacity;right:0;height:1em}.counter-cur{-webkit-animation:enter .4s ease;animation:enter .4s ease;-webkit-animation-fill-mode:forwards;animation-fill-mode:forwards}.counter-prev.top{-webkit-animation:exitTop .3s ease;animation:exitTop .3s ease;-webkit-animation-fill-mode:forwards;animation-fill-mode:forwards}.counter-cur.top{-webkit-animation:enterTop .3s ease;animation:enterTop .3s ease;-webkit-animation-fill-mode:forwards;animation-fill-mode:forwards}@-webkit-keyframes exit{0%{-webkit-transform:none;transform:none;opacity:1}to{-webkit-transform:translateY(-1px) scale(1.35);transform:translateY(-1px) scale(1.35);opacity:0}}@keyframes exit{0%{-webkit-transform:none;transform:none;opacity:1}to{-webkit-transform:translateY(-1px) scale(1.35);transform:translateY(-1px) scale(1.35);opacity:0}}@-webkit-keyframes enter{0%{-webkit-transform:scale(.85) translateX(-2px);transform:scale(.85) translateX(-2px);opacity:0}80%{-webkit-transform:scale(1.05);transform:scale(1.05);opacity:1}to{-webkit-transform:none;transform:none}}@keyframes enter{0%{-webkit-transform:scale(.85) translateX(-2px);transform:scale(.85) translateX(-2px);opacity:0}80%{-webkit-transform:scale(1.05);transform:scale(1.05);opacity:1}to{-webkit-transform:none;transform:none}}@-webkit-keyframes exitTop{0%{-webkit-transform:none;transform:none;opacity:1}to{-webkit-transform:translateY(-5px);transform:translateY(-5px);opacity:0}}@keyframes exitTop{0%{-webkit-transform:none;transform:none;opacity:1}to{-webkit-transform:translateY(-5px);transform:translateY(-5px);opacity:0}}@-webkit-keyframes enterTop{0%{-webkit-transform:translateY(5px);transform:translateY(5px);opacity:0}to{-webkit-transform:none;transform:none;opacity:1}}@keyframes enterTop{0%{-webkit-transform:translateY(5px);transform:translateY(5px);opacity:0}to{-webkit-transform:none;transform:none;opacity:1}}.tg--night-mode{background:#2b3037;color:#fff}.tg--night-mode .tg-legend__item{border-color:#384757}.tg--night-mode .tg-tooltip{background:#1c2533;color:#fff;-webkit-box-shadow:none;box-shadow:none}.tg--night-mode .tg-tooltip__title{color:#fff}.tg--night-mode .tg-pointer__pointer{background:#2b3037}.tg--night-mode .tg-chart__overlays rect{fill:#2b3037}.tg--night-mode .tg-grid__section{border-color:rgba(24,45,59,.1);border-color:var(--gray-line)}.tg--night-mode .tg-chart footer,.tg--night-mode .tg-grid{color:#939ca1;color:var(--color-gray)}.tg--night-mode .all b{color:#fff!important}"

/***/ }),

/***/ "./src/telegraph.js":
/*!**************************!*\
  !*** ./src/telegraph.js ***!
  \**************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Telegraph; });
/* harmony import */ var _styles_index_pcss__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./styles/index.pcss */ "./src/styles/index.pcss");
/* harmony import */ var _styles_index_pcss__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_styles_index_pcss__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _modules_state__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./modules/state */ "./src/modules/state.js");
/* harmony import */ var _modules_minimap_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./modules/minimap.js */ "./src/modules/minimap.js");
/* harmony import */ var _modules_chart_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./modules/chart.js */ "./src/modules/chart.js");
/* harmony import */ var _modules_legend_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./modules/legend.js */ "./src/modules/legend.js");
/* harmony import */ var _modules_header_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./modules/header.js */ "./src/modules/header.js");








class Telegraph {
  /**
   * Main entry constructor
   * @param {string} holderId - where to append a Chart
   * @param {string} data - chart data in csv format
   * @param {string} dataByMonth - chart data grouped by months in csv format
   * @param {string} type - graph type. Available types: 'line', 'area', 'bar'
   * @param {string[]} colors - colors list for each line
   * @param {string[]} titles - titles list for each line
   * @param {string} title - Graph title
   * @param {boolean} byMonth - is graphs represents data grouped by month
   */
  constructor({holderId, data, dataByMonth, colors, titles, type, title, byMonth}) {
    this.holder = document.getElementById(holderId);

    /**
     * Append <style> with all styles
     */
    this.loadStyles();

    /**
     * Save input params to allow to recreate State object
     */
    this.data = data;
    this.dataByMonth = dataByMonth;
    this.colors = colors;
    this.type = type;
    this.title = title;
    this.titles = titles;
    this.byMonth = byMonth;

    this.createState();

    /**
     * Module for mini map
     */
    this.minimap = new _modules_minimap_js__WEBPACK_IMPORTED_MODULE_2__["default"](this);

    /**
     * Working with main chart zone
     */
    this.chart = new _modules_chart_js__WEBPACK_IMPORTED_MODULE_3__["default"](this);

    /**
     * Working with legend items
     */
    this.legend = new _modules_legend_js__WEBPACK_IMPORTED_MODULE_4__["default"](this);

    /**
     * Header module
     */
    this.header = new _modules_header_js__WEBPACK_IMPORTED_MODULE_5__["default"](this);

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
   * Create an object with all graphs data
   * @param {string} dataStoringProperty - name of field that stores input data in csv
   */
  createState(dataStoringProperty = 'data'){
    /**
     * Module that stores all main app state values
     */
    if (dataStoringProperty === 'dataByMonth'){
      this.byMonth = true;
    }

    this.state = new _modules_state__WEBPACK_IMPORTED_MODULE_1__["default"](this[dataStoringProperty], this.colors, this.titles, this.type, this.title, this.byMonth);
  }

  /**
   * Load styles and append it via <style id="specc-graph-styles"> tag
   */
  loadStyles(){
    const styleIdentifier = 'specc-graph-styles';
    const styleExists = document.getElementById(styleIdentifier);

    if (styleExists){
      return;
    }

    const style = document.createElement('style');
    const head = document.querySelector('head');

    style.id = styleIdentifier;
    style.textContent = _styles_index_pcss__WEBPACK_IMPORTED_MODULE_0___default.a;

    head.appendChild(style);
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
    this.holder.classList.toggle(Telegraph.CSS.nightModeEnabled);
  }
}

/***/ }),

/***/ "./src/utils/debounce.js":
/*!*******************************!*\
  !*** ./src/utils/debounce.js ***!
  \*******************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return debounce; });
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

/***/ }),

/***/ "./src/utils/dom.js":
/*!**************************!*\
  !*** ./src/utils/dom.js ***!
  \**************************/
/*! exports provided: make, insertAfter, insertBefore, animateCounter */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "make", function() { return make; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "insertAfter", function() { return insertAfter; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "insertBefore", function() { return insertBefore; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "animateCounter", function() { return animateCounter; });
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

/***/ }),

/***/ "./src/utils/event.js":
/*!****************************!*\
  !*** ./src/utils/event.js ***!
  \****************************/
/*! exports provided: getPageX */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getPageX", function() { return getPageX; });
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

/***/ }),

/***/ "./src/utils/log.js":
/*!**************************!*\
  !*** ./src/utils/log.js ***!
  \**************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return log; });
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

/***/ }),

/***/ "./src/utils/numbers.js":
/*!******************************!*\
  !*** ./src/utils/numbers.js ***!
  \******************************/
/*! exports provided: round, roundToMin, beautify, addSpaces */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "round", function() { return round; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "roundToMin", function() { return roundToMin; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "beautify", function() { return beautify; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "addSpaces", function() { return addSpaces; });
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
  if (isNaN(parseInt(number, 10))){
    return '';
  }

  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}


/***/ })

/******/ });
//# sourceMappingURL=main.js.map