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
   * @param {ChartData} chartsData - input data
   */
  constructor(chartsData){
    this.columns = chartsData.columns;
    this.colors = chartsData.colors;
    this.names = chartsData.names;
    this.types = chartsData.types;

    /**
     * Cache
     */
    this._dates = this.columns[0].slice(1);
  }

  /**
   * Column with dates is 0-index column, so shift it
   * First element in arrays is column name ("x") so slice it
   * @return {number[]} - array of dates in milliseconds
   */
  get dates(){
    return this._dates;
  }

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
    return this.columns[0].length - 1; // -1 because the first element is column type ("x")
  }

  /**
   * Returns values of line by line name
   * @param {string} lineName - "y0", "y1" etc
   * @return {number[]}
   */
  getLinePoints(lineName){
    return this.getColumnByName(lineName).slice(1); // slice 0-element because it is a column name
  }

  /**
   * Return column by name
   * @param {string} name - "y0", "y1" etc
   * @return {array}
   */
  getColumnByName(name){
    return this.columns[this.columns.findIndex(column => column[0] === name)];
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
  const svgElements = ['svg', 'path', 'rect', 'circle', 'text', 'g'];
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
// CONCATENATED MODULE: ./src/utils/numbers.js
function beautify(number) {
  if (number < 1000) {
    return number
  } else if (number < 10000){
      let thousands = Math.floor(number / 1000);
      let left = number - thousands * 1000;

      if (left > 100){
        return thousands + ' ' + left;
      } else if (left > 10) {
        return thousands + ' 0' + left;
      } else {
        return thousands + ' 00' + left;
      }
  } else if (number < 1000000) {
      return Math.floor(number / 1000) + 'k';
  } else {
    return Math.floor(number / 1000000) + 'M';
  }
}
// CONCATENATED MODULE: ./src/modules/path.js


/**
 * Helper for creating an SVG path
 */
class path_Path {
  constructor({color, svg, max, stroke, stepX, opacity = 1, g}){
    this.svg = svg;
    this.group = g;
    this.canvasHeight = parseInt(this.svg.style.height, 10);
    this.kY = max !== 0 ? this.canvasHeight / max : 1;
    this.stepX = stepX;
    this.prevX = 0;

    this.path = make('path', null, {
      'stroke-width' : stroke,
      stroke : color,
      fill : 'transparent',
      'stroke-linecap' : 'round',
      'stroke-linejoin' : 'round',
      'vector-effect': 'non-scaling-stroke',
      opacity
    });

    this.pathData = '';

    /**
     * Cache for CSS transform matrix
     * @type {{scaleX: number, scaleY: number, translateX: number}}
     */
    this.matrix = {
      scaleX: 1,
      scaleY: 1,
      translateX: 0
    };

    /**
     * Debounce for transition removing
     * @type {null}
     */
    this.debounce = null;
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
    return Math.round(this.canvasHeight - val * this.kY);
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
   * Create a new line with x and y
   * @param {number} x
   * @param {number} y
   */
  lineTo(x, y){
    this.pathData += ` L ${this.x(x)} ${this.y(y)}`;
  }

  /**
   * Append a line
   */
  render(withAnimate = false){
    this.path.setAttribute('d', this.pathData);
    this.group.appendChild(this.path);

    if (withAnimate){
      this.animate();
    }
  }

  /**
   * Drop text to passed point
   * @param value
   */
  dropText(value, skipStepX = false){
    let text = make('text', null, {
      x: !skipStepX ? this.prevX + this.stepX: this.prevX,
      y: this.y(value),
      fill: '#cccccc',
      textAnchor: 'left',
      'dominant-baseline': 'use-script'
    })

    text.appendChild(document.createTextNode(value));
    text.style.fontSize = 13 + 'px';

    this.svg.appendChild(text);
  }

  animate(){
    const speed = 2000;
    const length = this.path.getTotalLength();

    // Clear any previous transition
    this.path.style.transition = this.path.style.WebkitTransition = 'none';

    // Set up the starting position
    this.path.style.strokeDasharray = length + ' ' + length;
    this.path.style.strokeDashoffset = length;

    // Trigger a Layout so styles are re-calculated
    // A browser picks up the starting position before animating
    this.path.getBoundingClientRect();

    // Define our transition
    this.path.style.transition = this.path.style.WebkitTransition = 'stroke-dashoffset ' + speed + 'ms' + ' ease-in';

    // Go.
    this.path.style.strokeDashoffset = '0';

    setTimeout(() => {
      this.path.style.removeProperty('transition');
      this.path.style.removeProperty('stroke-dasharray');
      this.path.style.removeProperty('stroke-dashoffset');
    }, speed)
  };

  setMatrix(scaleX, scaleY, translateX){
    this.path.style.transform = `matrix(${scaleX},0,0,${scaleY}, ${translateX},0)`;
    this.matrix = {
      scaleX, scaleY, translateX
    }
  }

  scaleX(scaling){
    let oldTransform = this.path.style.transform;

    if (oldTransform.includes('scaleX')){
      this.path.style.transform = oldTransform.replace(/(scaleX\(\S+\))/, `scaleX(${scaling})`)
    } else {
      this.path.style.transform = oldTransform + ` scaleX(${scaling})`;
    }
  }

  scaleY(scaleY){
    // this.matrix.scaleY = scaleY;
    this.path.style.transition = 'transform 250ms ease, opacity 150ms ease';
    // this.setMatrix(this.matrix.scaleX, scaleY, this.matrix.translateX);

    let oldTransform = this.path.style.transform;

    if (oldTransform.includes('scaleY')){
      this.path.style.transform = oldTransform.replace(/(scaleY\(\S+\))/, `scaleY(${scaleY})`)
    } else {
      this.path.style.transform = oldTransform + ` scaleY(${scaleY})`;
    }


    if (this.debounce){
      clearTimeout(this.debounce);
    }

    this.debounce = setTimeout(() => {
      this.path.style.transition = 'opacity 150ms ease';
    }, 270)
  }

  get isHidden(){
    return this.path.classList.contains(path_Path.CSS.graphHidden);
  }

  toggleVisibility(){
    this.path.classList.toggle(path_Path.CSS.graphHidden);
  }
}
// CONCATENATED MODULE: ./src/utils/log.js
let prevValues = {};


function log(obj){
  let el = document.getElementById('log');
   Object.assign(prevValues, obj);

   let content = '';

   Object.entries(prevValues).forEach(([key, value]) => {
     content += `${key} ${value.toFixed(3)}   `
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
  constructor(modules, {stroke, animate}){
    /**
     * Width of date label is used for default stepX value in 1:1 scale
     * @type {number}
     */
    const dateLabelWidth = 45;

    this.modules = modules;
    this.state = modules.state;
    this.animate = animate || false;
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
    this.maxPoint = this.state.max * 1.2; // 20% for padding top
    this.oyScaling = 1;

    /**
     * List of drawn lines
     * @type {object} name -> Path
     */
    this.paths = {};

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
   * Return Graph's paths as array
   * @return {Path[]}
   */
  get pathsList(){
    return Object.entries(this.paths).map(([name, path]) => {
      return path;
    });
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
    const stepsAvailable = [5, 10, 25, 50, 100, 1000, 500, 10000, 5000, 100000, 1000000, 10000000];
    let newStepYIndex = stepsAvailable.reverse().findIndex( step => max > step ),
    newStepY = stepsAvailable[newStepYIndex];

    if (max / newStepY < 3 && newStepYIndex < stepsAvailable.length - 1){
      newStepY = stepsAvailable[newStepYIndex + 1];
    }

    this.stepY = newStepY;
  }


  /**
   * Renders a line by name
   * @param {string} name - line name ("y0", "y1" etc)
   */
  renderLine(name){
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

    /**
     * Create a Path instance
     */
    const path = new path_Path({
      svg: this.canvas,
      g: this.oxGroup,
      color,
      max: this.maxPoint,
      stroke: this.strokeWidth,
      stepX: this.stepX,
    });

    path.moveTo(0, leftPoint);

    values.forEach( (column, index )=> {
      if (index === 0){
        // path.dropText(column, true);
        path.stepTo(column, true);
      } else {
        // path.dropText(column);
        path.stepTo(column);
      }

    });

    path.render(this.animate);

    this.paths[name] = path;
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
  scaleToMaxPoint(newMax){
    this.oyScaling = this.maxPoint / newMax * 0.8;
    this.oyGroup.style.transform = `scaleY(${this.oyScaling})`;
  }

  checkPathVisibility(name){
    return !this.paths[name].isHidden;
  }

  togglePathVisibility(name){
    this.paths[name].toggleVisibility();
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
    }
  }

  /**
   * Prepares minimap UI
   * @return {Element}
   */
  renderUi(){
    this.nodes.wrapper = make('div', minimap_Minimap.CSS.wrapper);
    this.nodes.leftZone = make('div', minimap_Minimap.CSS.leftZone);
    this.nodes.rightZone = make('div', minimap_Minimap.CSS.rightZone);
    this.nodes.leftZoneScaler = make('div', minimap_Minimap.CSS.leftZoneScaler);
    this.nodes.rightZoneScaler = make('div', minimap_Minimap.CSS.rightZoneScaler);

    this.nodes.leftZone.appendChild(this.nodes.leftZoneScaler);
    this.nodes.rightZone.appendChild(this.nodes.rightZoneScaler);

    this.nodes.wrapper.appendChild(this.nodes.leftZone);
    this.nodes.wrapper.appendChild(this.nodes.rightZone);

    this.bindEvents();

    return this.nodes.wrapper;
  }

  /**
   * Fill UI with chart and set initial Position
   */
  renderMap(){
    this.nodes.canvas = this.graph.renderCanvas({
      width: this.nodes.wrapper.offsetWidth,
      height: this.nodes.wrapper.offsetHeight
    });

    this.state.linesAvailable.forEach( name => {
      this.graph.renderLine(name);
    });

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
    log({offsetLeft})
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
    this.nodes.wrapper.addEventListener('mousedown', (event) => {
      this.viewportMousedown(event);
    });

    document.body.addEventListener('mousemove', (event) => {
      this.viewportMousemove(event);
    });

    document.body.addEventListener('mouseup', (event) => {
      this.viewportMouseup(event);
    });

    this.nodes.wrapper.addEventListener('touchstart', (event) => {
      this.viewportMousedown(event);
    });

    this.nodes.wrapper.addEventListener('touchmove', (event) => {
      this.viewportMousemove(event);
    });

    this.nodes.wrapper.addEventListener('touchend', (event) => {
      this.viewportMouseup(event);
    });
  }

  /**
   * Viewport under finger
   * @param {MouseEvent|TouchEvent} event
   */
  viewportMousedown(event){
    const {target} = event;

    event.preventDefault();

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

    // this.prevX = delta + 0;
    this.moveViewport(delta);
    this.syncScrollWithChart();

    this.modules.chart.fitToMax(true);
  }

  /**
   * Sync scroll between minimap and chart
   * @param {number} [newScroll] - pass scroll if you have
   */
  syncScrollWithChart(newScroll = null, fromScale = false, scaling = 1){
    /**
     * How many percents of mini-map is scrolled
     */
    let scrolledValue = !isNaN(parseInt(newScroll)) ? newScroll : this.scrolledValue;
    const minimapScrolledPortion = scrolledValue / this.wrapperWidth;
    const chartScroll = minimapScrolledPortion * this.modules.chart.width;

    this.modules.chart.scroll(chartScroll * scaling, fromScale);
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

    } else {
      newScalerWidth = this.wrapperWidth - this.viewportOffsetLeft - (this.viewportWidthBeforeDrag + delta);

      if (newScalerWidth > this.rightZoneMaximumWidth){
        return;
      }

      this.rightWidth = newScalerWidth;
    }

    const newViewportWidth = side === 'left' ?
      this.wrapperWidth - newScalerWidth - this.rightZoneWidth :
      this.wrapperWidth - this.leftZoneWidth - newScalerWidth;

    const scaling = this.viewportWidthInitial / newViewportWidth * this.modules.chart.initialScale;

    this.modules.chart.scale(scaling, direction);
    this.syncScrollWithChart(side === 'left' ? newScalerWidth : this.leftZoneWidth, true);
    this.modules.chart.fitToMax();
  }

  /**
   * Toggle path visibility
   * @param {string} name - graph name
   */
  togglePath(name){
    this.graph.togglePathVisibility(name);
    this.fitToMax();
  }

  /**
   * Upscale or downscale graph to fit visible points
   */
  fitToMax(){
    const maxVisiblePoint = Math.max(...this.state.linesAvailable.filter(line => this.graph.checkPathVisibility(line)).map(line => {
      return Math.max(...this.state.getLinePoints(line));
    }));

    this.graph.scaleToMaxPoint(maxVisiblePoint);
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
    }
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

  move(lineLeftCoord){
    let offsetLeft = -25;
    const tooltipWidth = this.nodes.wrapper.offsetWidth;

    if (lineLeftCoord > this.modules.chart.viewportWidth - tooltipWidth / 1.3){
      offsetLeft = -1.3 * tooltipWidth;
    } else if (lineLeftCoord > this.modules.chart.viewportWidth - tooltipWidth ){
      offsetLeft = -0.8 * tooltipWidth;
    } else if (lineLeftCoord < 45){
      offsetLeft = 20;
    }

    this.nodes.wrapper.style.left = `${lineLeftCoord + offsetLeft}px`;
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

    values.forEach( ({name, value}) => {
      const item = make('div', tooltip_Tooltip.CSS.value);
      const color = this.modules.state.colors[name];
      const title = this.modules.state.names[name];


      item.innerHTML = `<b>${beautify(value)}</b>${title}`;
      item.style.color = color;

      this.nodes.values.appendChild(item);
    })
  }

  set title(string){
    this.nodes.title.innerHTML = string;
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
    }
    this.pointers = [];
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
      pointer: 'tg-pointer__pointer'
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

  /**
   * Show circles
   * @param {{name: string, value: number}[]} values
   */
  showValues(values){
    if (!this.pointers.length){
      values.forEach( ({name}) => {
        const item = make('div', pointer_Pointer.CSS.pointer);

        item.style.borderColor = this.modules.state.colors[name];
        this.nodes.wrapper.appendChild(item);
        this.pointers.push(item);
      })
    }

    /**
     * @type {Graph}
     */
    const {graph} = this.modules.chart;

    let kY = graph.height / graph.maxPoint * graph.oyScaling;

    values.forEach( ({name, value}, index) => {
      const item = this.pointers[index];

      item.style.transform = `translateY(-${value * kY}px)`;
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
    };

    this.tooltip = new tooltip_Tooltip(this.modules);
    this.pointer = new pointer_Pointer(this.modules);
    this.graph = new graph_Graph(this.modules, {
      stroke: 2
    });

    this.wrapperLeftCoord = undefined;
    this.scaling = 1;
    this.scrollValue = 0;



    this.lenendDateWidth = 38;

    /**
     * Set will be store indexes of visible dates
     * @type {Set<number>}
     */
    this.onscreenDates = new Set();
    this.onscreenDatesElements = {}; // origin index -> element mapping
    this._datesPerScreen = undefined;






    /**
     * Any properties can be cached here
     * @type {{}}
     */
    this.cache = {};

    this._initialScale = undefined;
    this._initialStep = undefined;
  }

  get initialStep(){
    if (!this._initialStep){
      this._initialStep = this.width / (this.state.daysCount - 1);
    }
    return this._initialStep;
  }

  get minimalMapWidth(){
    return 2 * this.initialStep;
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

    log({scaling: this.scaling});
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
      dateHidden: 'tg-legend__date--hidden',
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

    this.bindEvents();

    return this.nodes.wrapper;
  }

  /**
   * Renders charts
   */
  renderCharts(){
    this.calculateWrapperCoords();

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



    this.state.linesAvailable.forEach( name => {
      this.graph.renderLine(name);
    });

    this.renderGrid();
    this.renderLegend();
  }

  /**
   * Render or updates a grid
   * @param {number} forceMax - new max value for updating
   * @param {boolean} isUpdating - true for updating
   */
  renderGrid(forceMax, isUpdating = false){
    if (!this.nodes.grid) {
      this.nodes.grid = make('div', chart_Chart.CSS.grid);
      this.nodes.gridLines = [];
      insertBefore(this.nodes.canvas, this.nodes.grid);
    }



    let stepY = this.stepY;
    const height = this.height;
    const max = forceMax || this.maxPoint;
    const kY = height / max;

    let linesCount = height / (stepY * kY) >> 0;

    if (linesCount === 0){
      stepY = stepY / 3;
      linesCount = height / (stepY * kY) >> 0;
    }

    if (linesCount === 1){
      stepY = stepY / 2;
      linesCount = height / (stepY * kY) >> 0;
    }

    if (linesCount === 2){
      stepY = stepY / 2;
      linesCount = height / (stepY * kY) >> 0;
    }

    if (linesCount > 5){
      stepY = stepY * 2;
      linesCount = height / (stepY * kY) >> 0;
    }

    if (this.nodes.gridLines.length){
      this.nodes.gridLines.forEach( line => {
        line.classList.add(chart_Chart.CSS.gridSectionHidden);
      })
    }

    // Drawing horizontal lines

    for (let j = 0; j <= linesCount; j++) {
      let y = j * stepY;
      let line;

      if (this.nodes.gridLines.length && this.nodes.gridLines[j]){
        line = this.nodes.gridLines[j];
      } else {
        line = make('div', chart_Chart.CSS.gridSection);
        this.nodes.grid.appendChild(line);
        this.nodes.gridLines.push(line);
      }

      if (j === 0){
        line.classList.add('no-animation');
      }

      /**
       * To prevent overflow last line
       */
      if (y * kY > 325){
        return;
      }

      line.classList.remove(chart_Chart.CSS.gridSectionHidden);
      line.style.bottom = y * kY + 'px';
      line.textContent = beautify(Math.round(y));
    }
  }


  pushDate(date, originIndex){
    let centering = 'translateX(-50%)';

    if (originIndex === 0){
      centering = '';
    }


    let pointsOnScreen = this.rightPointIndex - this.leftPointIndex;
    let showEvery = Math.ceil(pointsOnScreen / this.datesPerScreen);

    log({
      'points on screen': pointsOnScreen,
      'vlezet': this.datesPerScreen,
      showEvery
    });


    /**
     * If point already showed, move it or hide
     */
    if (this.onscreenDates.has(originIndex)){
      if (originIndex % showEvery !== 0){
        this.onscreenDatesElements[originIndex].remove();
        this.onscreenDates.delete(originIndex );
        delete this.onscreenDatesElements[originIndex];
      } else {
        this.onscreenDatesElements[originIndex].style.transform = `translateX(${ originIndex * this.stepScaled }px)` + centering;
      }


      return
    }



    if (originIndex % showEvery !== 0){
      return;
    }

    const dt = new Date(date);
    const dateEl = make('time');
    dateEl.textContent = dt.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short'
    });

    dateEl.style.transform = `translateX(${ originIndex * this.stepScaled }px)` + centering;
    this.nodes.legend.appendChild(dateEl);
    this.nodes.legendDates.push(dateEl);
    this.onscreenDates.add(originIndex);
    this.onscreenDatesElements[originIndex] = dateEl;
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
    let onscreen = Math.floor(this.viewportWidth / this.stepX / this.scaling);
    return this.leftPointIndex + onscreen;
  }

  /**
   * @todo add cache
   */
  get datesPerScreen(){
    if (!this._datesPerScreen){
      this._datesPerScreen = Math.floor(this.viewportWidth / (this.lenendDateWidth + 40));
    }
    return this._datesPerScreen;
  }

  get stepScaled(){
    return this.stepX * this.scaling
  }

  addOnscreenDates(){
    let datesOnScreen = this.state.dates.slice(this.leftPointIndex, this.rightPointIndex + 2);
    let datesOnScreenIndexes = new Set();

    // let leftDate = new Date(this.state.dates[this.leftPointIndex]);
    // let rightDate = new Date(this.state.dates[this.leftPointIndex + this.rightPointIndex]);
    // console.log('l %o (%o) r %o (%o)', this.leftPointIndex, leftDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }), this.rightPointIndex, rightDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }));

    datesOnScreen.forEach((date, index) => {
      const originIndex = this.leftPointIndex + index;

      datesOnScreenIndexes.add(originIndex);
      this.pushDate(date, originIndex);
    });

    this.onscreenDates.forEach((index) => {
      if (!datesOnScreenIndexes.has(index)) {
        this.onscreenDatesElements[index].remove();
        this.onscreenDates.delete(index);
        delete this.onscreenDatesElements[index];
      }
    });
  }

  /**
   * Renders a legend with dates
   * @param {number[]} dates
   */
  renderLegend(){
    this.nodes.legend = make('footer');

    this.addOnscreenDates();

    insertAfter(this.nodes.canvas, this.nodes.legend);
  }

  /**
   * Perform scroll
   * @param position
   */
  scroll(position){
    this.scrollValue = position * -1;
    this.graph.scroll(this.scrollValue);
    this.nodes.legend.style.transform = `translateX(${this.scrollValue}px)`;
    this.addOnscreenDates();
    this.tooltip.hide();
    this.pointer.hide();
  }

  /**
   * Perform scaling
   * @param {number} scaling
   */
  scale(scaling, direction){
    this.graph.scaleLines(scaling, direction);

    log({scaling});

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

  /**
   * Upscale or downscale graph to fit visible points
   */
  fitToMax(){
    const stepX = this.graph.step;
    const pointsVisible = Math.round(this.viewportWidth / stepX / this.scaling);
    const maxVisiblePoint = Math.max(...this.state.linesAvailable.filter(line => this.notHiddenGraph(line)).map(line => {
      let slice = this.state.getPointsSlice(line, this.leftPointIndex, pointsVisible);
      return Math.max(...slice);
    }));

    this.graph.scaleToMaxPoint(maxVisiblePoint);

    /**
     * Rerender grid if it was rendered before
     */
    if (this.nodes.grid){
      this.renderGrid(maxVisiblePoint * 1.2, true);
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
    this.nodes.wrapper.addEventListener('mousemove', (event) => {
      this.mouseMove(event);
    });

    this.nodes.wrapper.addEventListener('mouseleave', (event) => {
      this.mouseLeave(event);
    });

    this.nodes.wrapper.addEventListener('touchmove', (event) => {
      this.mouseMove(event);
    });

    this.nodes.wrapper.addEventListener('touchcancel', (event) => {
      this.mouseLeave(event);
    });
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

    if (Math.abs(scrollOffset) > (stepXWithScale / 2) ){
      pointIndex = pointIndex + 1;
    }

    let newLeft = pointIndex * stepXWithScale + scrollOffset;

    // console.log('scroll offset %o | step %o (%o)| index %o | x %o | drawn at %o | first step offset %o | left index %o ', scrollOffset, this.graph.stepX, stepXWithScale, pointIndex, viewportX, newLeft, firstStepOffset, this.leftPointIndex);

    this.tooltip.show();
    this.pointer.move(newLeft);

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
    this.tooltip.move(newLeft);
    this.tooltip.title = (new Date(date)).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      weekday: 'short'
    });
  }

  mouseLeave(){
    this.tooltip.hide();
    this.pointer.hide();
  }

  /**
   * Toggle path visibility
   * @param {string} name - graph name
   */
  togglePath(name){
    this.graph.togglePathVisibility(name);
    this.fitToMax();
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

      checkbox.style.borderColor = this.modules.state.colors[name];
      checkbox.style.backgroundColor = this.modules.state.colors[name];

      item.appendChild(checkbox);
      item.appendChild(document.createTextNode(title));

      this.buttons[name] = item;

      item.addEventListener('click', () => {
        this.itemClicked(name);
      });

      this.nodes.wrapper.appendChild(item);
    });
    return this.nodes.wrapper;
  }

  /**
   * Click handler for togglers
   * @param {string} name - graph name
   */
  itemClicked(name){
    this.modules.chart.togglePath(name);
    this.modules.minimap.togglePath(name);

    this.buttons[name].classList.toggle(legend_Legend.CSS.itemEnabled);

    const checkbox = this.buttons[name].querySelector(`.${legend_Legend.CSS.checkbox}`);

    /**
     * @todo add animation
     */
    if (this.buttons[name].classList.contains(legend_Legend.CSS.itemEnabled)){
      checkbox.style.boxShadow = `inset 0 0 0 10px ${this.modules.state.colors[name]}`;
    } else {
      checkbox.style.boxShadow = 'none';
      checkbox.style.backgroundColor = 'transparent';
    }
  }
}

// CONCATENATED MODULE: ./src/telegraph.js
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return telegraph_Telegraph; });





/**
 * @typedef {object} ChartData
 * @property {array} columns – List of all data columns in the chart.
 *                             0 - position ("x", "y0", "y1")
 *                             1+ - values
 *                             "x" values are UNIX timestamps in milliseconds.
 * @property {{x, y0, y1}} types – Chart types for each of the columns.
 *                                 Supported values:
 *                                 "line" (line on the graph with linear interpolation),
 *                                 "x" (x axis values for each of the charts at the corresponding positions).
 * @property {{y0: string, y1: string}} colors – Color for each line in 6-hex-digit format (e.g. "#AAAAAA").
 * @property {{y0: string, y1: string}} names – Names for each line.
 */

class telegraph_Telegraph {
  /**
   * Main entry constructor
   * @param {string} holderId - where to append a Chart
   * @param {ChartData} inputData - chart data
   */
  constructor({holderId, inputData}){
    this.holder = document.getElementById(holderId);

    /**
     * Module that stores all main app state values
     */
    this.state = new State(inputData);

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
     * Create base UI elements
     */
    this.prepareUi();

    /**
     * Render chart and minimap
     */
    this.chart.renderCharts();
    this.minimap.renderMap();
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
//# sourceMappingURL=main.js.map