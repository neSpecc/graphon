import * as Dom from '../utils/dom.js';
import Graph from './graph.js';
import Tooltip from "./tooltip";
import Pointer from "./pointer";
import * as Event from '../utils/event.js';

import log from '../utils/log.js';
import * as Numbers from "../utils/numbers";

/**
 * Module for working with main Chart zone
 * - Render UI
 * - Render axes
 * - Render graphs
 * - Toggle lines visibility
 */
export default class Chart {
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

    this.tooltip = new Tooltip(this.modules);
    this.pointer = new Pointer(this.modules);
    this.graph = new Graph(this.modules, {
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
    this.nodes.wrapper = Dom.make('div', Chart.CSS.wrapper);
    this.nodes.viewport = Dom.make('div', Chart.CSS.viewport);
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
      this.nodes.grid = Dom.make('div', Chart.CSS.grid);
      this.nodes.gridLines = [];
      Dom.insertBefore(this.nodes.canvas, this.nodes.grid);
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
        line.classList.add(Chart.CSS.gridSectionHidden);
      })
    }

    // Drawing horizontal lines

    for (let j = 0; j <= linesCount; j++) {
      let y = j * stepY;
      let line;

      if (this.nodes.gridLines.length && this.nodes.gridLines[j]){
        line = this.nodes.gridLines[j];
      } else {
        line = Dom.make('div', Chart.CSS.gridSection);
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

      line.classList.remove(Chart.CSS.gridSectionHidden);
      line.style.bottom = y * kY + 'px';
      line.textContent = Numbers.beautify(Math.round(y));
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
    const dateEl = Dom.make('time');
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
    this.nodes.legend = Dom.make('footer');

    this.addOnscreenDates();

    Dom.insertAfter(this.nodes.canvas, this.nodes.legend);
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
    let x = Event.getPageX(event);
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