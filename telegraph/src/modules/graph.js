import * as Dom from '../utils/dom';
import Path from './path';
import Bar from './bar';
import Area from './area';

import log from '../utils/log.js';


/**
 * Working with svg paths for charts
 */
export default class Graph {
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
    this.canvas = Dom.make('svg');
    this.oxGroup = Dom.make('g');
    this.oyGroup = Dom.make('g');

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
        this.maxPoint = this.state.max; // @todo removed *1.2 (20% for padding top)
        this.minPoint = this.state.min;
        this.drawLineCharts();

        break;
    }
  }

  drawAreaCharts(){
    let areas = this.state.linesAvailable.reverse().map( line => {
      return new Area({
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
      return new Bar({
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

  getMaxFromVisible(leftPointIndex = 0, pointsVisible = this.state.daysCount){
    const type = this.state.getCommonChartsType();

    switch (type) {
      case 'bar':
        return this.state.getMaximumAccumulatedByColumns(leftPointIndex, leftPointIndex + pointsVisible, this.hiddenCharts);
        break;
      default:
      case 'line':
        return Math.max(...this.state.linesAvailable.filter(line => this.checkPathVisibility(line)).map(line => {
          let slice = this.state.getPointsSlice(line, leftPointIndex, pointsVisible);
          return Math.max(...slice);
        }));
        break;
    }

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


      // let kY = this.maxPoint !== 0 ? this.height / this.maxPoint : 1;

      this.kY = this.height / (this.maxPoint - this.minPoint);
      this.zeroShifting = this.minPoint * this.kY;

      // let chartHeight = this.height - this.state.min;

      /**
       * Create a Path instance
       */
      const path = new Path({
        canvasHeight: this.height,
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
  scaleToMaxPoint(newMax, newMin){
    if (!this.zeroShifting || !newMin){
      this.oyScaling = this.maxPoint / newMax;
      this.oyGroup.style.transform = `scaleY(${this.oyScaling})`;
      return;
    }

    let newKY = this.height / (newMax - newMin);
    let newZeroShifting = newMin * this.kY;
    let shift = newZeroShifting - this.zeroShifting;

    this.oyScaling = newKY / this.kY;
    this.zeroShiftingScaling = shift !== 0 ? newZeroShifting / this.zeroShifting  : 1;
    this.currentMinimum = newMin;

    this.oyGroup.style.transform = `scaleY(${this.oyScaling}) translateY(${shift}px)`;
  }

  /**
   * Change bars height and Y to fit hidden charts place
   */
  recalculatePointsHeight(){
    if (this.type === 'bar'){
      this.recalculateBars();
    } else if (this.type === 'area') {
      this.recalculateArea();
    }
  }

  recalculateArea(){
    const pointsCount = this.state.daysCount;
    const stacks = this.state.getStacks();

    for (let pointIndex = 0; pointIndex < pointsCount; pointIndex++) {
      let prevValue = 0;

      let hiddenPointsValue = this.hiddenCharts.reduce( (val, line) => {
        return val + this.state.getLinePoints(line)[pointIndex];
      }, 0);

      this.state.linesAvailable.filter(line => this.checkPathVisibility(line)).reverse().forEach( (line, index) => {
        let newStack = stacks[pointIndex] - hiddenPointsValue;
        let pointValue = this.state.getLinePoints(line)[pointIndex];

        if (pointIndex === 0){
          this.charts[line].move(pointIndex, newStack, prevValue, true);
        } else {
          this.charts[line].move(pointIndex, newStack, prevValue);
        }

        prevValue += pointValue;
      });
    }

    Object.entries(this.charts).filter(([line, area]) => this.checkPathVisibility(line)).forEach(([line, area]) => {
      area.update();
    });
  }

  recalculateBars(){
    const pointsCount = this.state.daysCount;
    const stacks = this.state.getStacks();

    for (let pointIndex = 0; pointIndex < pointsCount; pointIndex++) {
      let prevValue = 0;

      let hiddenPointsValue = this.hiddenCharts.reduce( (val, line) => {
        return val + this.state.getLinePoints(line)[pointIndex];
      }, 0);

      this.state.linesAvailable.filter(line => this.checkPathVisibility(line)).reverse().forEach( (line, index) => {
        let newStack = stacks[pointIndex] - hiddenPointsValue;
        let pointValue = this.state.getLinePoints(line)[pointIndex];

        this.charts[line].move(pointIndex, newStack, prevValue);
        prevValue += pointValue;
      });
    }
  }

  checkPathVisibility(name){
    return !this.charts[name].isHidden;
  }

  togglePathVisibility(name){
    this.charts[name].toggleVisibility();
  }
}