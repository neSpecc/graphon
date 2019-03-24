import * as Dom from '../utils/dom.js';
import Graph from './graph.js';
import Tooltip from "./tooltip";

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
      cursorLine: undefined
    };

    this.tooltip = new Tooltip(this.modules);
    this.graph = new Graph(this.state, {
      stroke: 3
    });

    this.wrapperLeftCoord = undefined;
    this.scaling = 1;
    this.scrollValue = 0;
  }

  static get CSS(){
    return {
      wrapper: 'tg-chart',
      viewport: 'tg-chart__viewport',
      cursorLine: 'tg-chart__cursor-line'
    }
  }

  /**
   * Return current scroll distance
   * @return {number}
   */
  get scrollDistance() {
    return this.scrollValue * this.scaling;
  }

  /**
   * Return current scaling value
   * @return {number|*}
   */
  get scalingValue(){
    return this.scaling;
  }

  renderUi(){
    this.nodes.wrapper = Dom.make('div', Chart.CSS.wrapper);
    this.nodes.viewport = Dom.make('div', Chart.CSS.viewport);
    this.nodes.cursorLine = Dom.make('div', Chart.CSS.cursorLine);

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
      height: 400
    });
    this.nodes.viewport.appendChild(this.nodes.canvas);

    const dates = this.state.dates;

    this.state.linesAvailable.forEach( name => {
      this.graph.renderLine(name);
    });

    this.graph.renderGrid();
    this.graph.renderLegend(dates);
  }

  get width(){
    return this.graph.width;
  }

  get viewportWidth(){
    return this.nodes.wrapper.offsetWidth;
  }

  get viewportHeight(){
    return this.nodes.wrapper.offsetHeight;
  }

  /**
   * Perform scroll
   * @param position
   */
  scroll(position){
    let newLeft = position * -1;
    this.nodes.viewport.style.transform = `translateX(${newLeft}px)`;
    this.scrollValue = newLeft;
  }

  /**
   * Perform scaling
   * @param {number} scaling
   */
  scale(scaling){
    this.graph.scaleLines(scaling);

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
  }

  /**
   * Shows line with Tooltip
   * @param {MouseEvent} event
   */
  mouseMove(event){
    let viewportX = event.pageX - this.wrapperLeftCoord ;
    let pointIndex = Math.round(viewportX / this.graph.stepX / this.scaling);

    this.tooltip.show();

    let scrollOffset = this.scrollValue % this.graph.stepX;
    let newLeft = pointIndex * this.graph.stepX * this.scaling;

    this.nodes.cursorLine.style.left = `${newLeft + scrollOffset}px`;

    const hoveredPointIndex = this.leftPointIndex + pointIndex - 1;

    const values = this.state.linesAvailable.filter(line => this.notHiddenGraph(line)).map( line => {
      return {
        name: line,
        value: this.state.getLinePoints(line)[hoveredPointIndex]
      }
    });

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