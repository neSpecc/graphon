import * as Dom from '../utils/dom';
import * as Numbers from '../utils/numbers';
import Path from './path';

/**
 * Working with svg paths for charts
 */
export default class Graph {
  /**
   * @param {State} state
   */
  constructor(state, {stroke, animate}){
    /**
     * Width of date label is used for default stepX value in 1:1 scale
     * @type {number}
     */
    const dateLabelWidth = 45;

    this.state = state;
    this.animate = animate || false;
    /**
     * @todo move to this.nodes
     */
    this.canvas = undefined;
    this.legend = undefined;
    this.grid = undefined;
    this.gridLines = [];


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
      grid: 'tg-grid',
      gridSection: 'tg-grid__section',
      gridSectionHidden: 'tg-grid__section--hidden',
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
    this.canvas = Dom.make('svg');
    this.oxGroup = Dom.make('g');
    this.oyGroup = Dom.make('g');

    this.oxGroup.setAttribute('class', Graph.CSS.oxGroup);
    this.oyGroup.setAttribute('class', Graph.CSS.oyGroup);

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
    this.initialWidth = this.state.daysCount * this.stepX;
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
    this.stepX = this.width / this.state.daysCount;

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
        path.stepTo(column);
      } else {
        // path.dropText(column);
        path.stepTo(column);
      }

    });

    path.render(this.animate);

    this.paths[name] = path;
  }

  /**
   * Render or updates a grid
   * @param {number} forceMax - new max value for updating
   * @param {boolean} isUpdating - true for updating
   */
  renderGrid(forceMax, isUpdating = false){
    if (!this.grid) {
      this.grid = Dom.make('div', Graph.CSS.grid);
      this.gridLines = [];
      Dom.insertBefore(this.canvas.parentNode, this.grid);
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

    if (this.gridLines.length){
      this.gridLines.forEach( line => {
        line.classList.add(Graph.CSS.gridSectionHidden);
      })
    }

    // Drawing horizontal lines

    for (let j = 0; j <= linesCount; j++) {
      let y = j * stepY;
      let line;

      if (this.gridLines.length && this.gridLines[j]){
        line = this.gridLines[j];
      } else {
        line = Dom.make('div', Graph.CSS.gridSection);
        this.grid.appendChild(line);
        this.gridLines.push(line);
      }

      if (j === 0){
        line.classList.add('no-animation');
      }

      line.classList.remove(Graph.CSS.gridSectionHidden);
      line.style.bottom = y * kY + 'px';
      line.textContent = Numbers.beautify(Math.round(y));
    }
  }

  /**
   * Renders a legend with dates
   * @param {number[]} dates
   */
  renderLegend(dates){
    this.legend = Dom.make('footer');

    dates.forEach((date, index) => {
      /**
       * Skip every second
       */
      if (index % 2 === 1){
        return;
      }

      const dt = new Date(date);
      const dateEl = Dom.make('time');
      dateEl.textContent = dt.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short'
      });

      this.legend.appendChild(dateEl)
    });

    Dom.insertAfter(this.canvas, this.legend);
  }

  /**
   * Scale left legend
   * @param {number} scaling
   */
  scaleLines(scaling){
    this.oxGroup.style.transform = `scaleX(${scaling})`;
    // this.pathsList.forEach( path => {
    //   path.scaleX(scaling);
    // });

    const newWidth = this.initialWidth * scaling;
    this.width = newWidth;

    const canFit = Math.round(newWidth / this.stepX);
    const nowFit = Math.round(this.initialWidth / this.stepX);
    const fitability = Math.floor(nowFit / canFit + 0.9);

    if (fitability % 2 === 1){
      this.legend.classList.add(`skip-${fitability}`);
    }

    this.legend.classList.toggle('skip-odd', nowFit / canFit > 1.7);
    this.legend.classList.toggle('skip-third', nowFit / canFit > 3.2);
    this.legend.classList.toggle('skip-fifth', nowFit / canFit > 5.5);
    this.legend.classList.toggle('skip-seventh', nowFit / canFit > 7);
    this.legend.classList.toggle('skip-ninth', nowFit / canFit > 9.2);
    this.legend.classList.toggle('skip-eleventh', nowFit / canFit > 14);
  }

  get step(){
    return this.stepX;
  }

  /**
   * Scale path on OY
   * @param {number} newMax - new max value
   */
  scaleToMaxPoint(newMax, scaleX, scroll){
    this.oyScaling = this.maxPoint / newMax * 0.8;

    this.pathsList.forEach( path => {
      // path.setMatrix(scaleX, scaling, scroll);
      // path.scaleY(scaling);
      this.oyGroup.style.transform = `scaleY(${this.oyScaling})`;
    });

    /**
     * Rerender grid if it was rendered before
     */
    if (this.grid){
      this.renderGrid(newMax * 1.2, true);
    }
  }

  checkPathVisibility(name){
    return !this.paths[name].isHidden;
  }

  togglePathVisibility(name){
    this.paths[name].toggleVisibility();
  }
}