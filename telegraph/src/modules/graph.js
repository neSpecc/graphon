import * as Dom from '../utils/dom';
import Path from './path';
import Bar from './bar';

import log from '../utils/log.js';


/**
 * Working with svg paths for charts
 */
export default class Graph {
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
    this.maxPoint = 0;//
    this.minPoint = 0;
    this.oyScaling = 1;

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
        this.drawBarCharts();
        break;
      default:
      case 'line':
        this.maxPoint = this.state.max; // @todo removed *1.2 (20% for padding top)
        this.state.linesAvailable.forEach( name => {
          /**
           * Array of chart Y values
           */
          const values = this.state.getLinePoints(name);

          /**
           * Color of drawing line
           */
          const color = this.state.getLineColor(name);

          this.charts[name] = this.drawLineChart(values, color);
        });

        break;
    }
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

    // console.log('this.state.colors', this.state.colors);

    // Object.entries(this.state.colors).forEach(([name, color]) => {
    //   let el = document.createElement('div');
    //   el.style.height = 100 + 'px';
    //   el.style.backgroundColor = color;
    //   el.textContent = name;
    //
    //   document.body.appendChild(el);
    // })



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
   * Create a 'line' chart
   * @return {Path}
   */
  drawLineChart(values, color){
    /**
     * Point to from which we will start drawing
     */
    const leftPoint = values[0];

    /**
     * Create a Path instance
     */
    const path = new Path({
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

    return path;
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
    // console.log('max %o new max %o', this.maxPoint, newMax, this.maxPoint / newMax);

    // let hiddenChartsMax = this.hiddenCharts.reduce((prev, line) => {
    //   return prev + Math.max(...this.state.getLinePoints(line));
    // }, 0);

    this.oyScaling = this.maxPoint / newMax;
    this.oyGroup.style.transform = `scaleY(${this.oyScaling})`;

    // let emptyAreaHeight = this.height /this.maxPoint * newMin;
    // console.log('Should be moved to', this.maxPoint , newMin, emptyAreaHeight, this.height - emptyAreaHeight);
    // this.oyGroup.style.transform = `scaleY(${this.oyScaling}) translateY(${emptyAreaHeight}px)`;
  }

  checkPathVisibility(name){
    return !this.charts[name].isHidden;
  }

  togglePathVisibility(name){
    this.charts[name].toggleVisibility();
  }
}