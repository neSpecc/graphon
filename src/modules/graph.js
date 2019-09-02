import * as Dom from '../utils/dom';
import Path from './path';
import Bar from './bar';
import Area from './area';
import * as Numbers from "../utils/numbers";

import log from '../utils/log.js';


/**
 * Working with svg paths for charts
 */
export default class Graph {
  /**
   * @param {Graphon} modules
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
      return new Area({
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
      return new Bar({
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
      const path = new Path({
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
      const path = new Path({
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


    newMin = Numbers.roundToMin(newMin, (newMax - newMin) / 5);


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