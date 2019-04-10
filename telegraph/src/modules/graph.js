import * as Dom from '../utils/dom';
import * as Numbers from '../utils/numbers';
import Path from './path';

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
    this.legend = undefined;
    this.legendDates = [];
    this.legendDatesVisible = 0;
    this.lenendDateWidth = 38;
    this.grid = undefined;
    this.gridLines = [];


    /**
     * Set will be store indexes of visible dates
     * @type {Set<number>}
     */
    this.onscreenDates = new Set();
    this.onscreenDatesElements = {}; // origin index -> element mappind



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
      dateHidden: 'tg-legend__date--hidden',
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

    this.legendDatesVisible = this.initialWidth / this.stepX;

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
   * Left visible point
   * @return {number}
   */
  get leftPointIndex(){
    return parseInt(Math.floor(this.modules.chart.scrollValue * -1/ this.step / this.modules.chart.scaling));
  }

  /**
   * Right visible point
   * @return {number}
   */
  get rightPointIndex(){
    let onscreen = Math.floor(this.modules.chart.viewportWidth / this.step / this.modules.chart.scaling);
    return this.leftPointIndex + onscreen;
  }

  get stepScaled(){
    return this.stepX * this.modules.chart.scaling
  }

  /**
   * @todo add cache
   */
  get datesPerScreen(){
      return Math.floor(this.modules.chart.viewportWidth / (this.lenendDateWidth ));
  }

  scroll(newLeft, fromScale){
    this.oxGroup.style.transform = `matrix(${this.modules.chart.scaling},0,0,1,${newLeft},0)`;
    this.legend.style.transform = `translateX(${newLeft}px)`;
    this.addOnscreenDates(fromScale);
  }

  pushDate(date, originIndex){
    let centering = 'translateX(-50%)';

    if (originIndex === 0){
      centering = '';
    }

    if (this.onscreenDates.has(originIndex)){
      // console.log('presented', originIndex, this.stepScaled );
      this.onscreenDatesElements[originIndex].style.transform = `translateX(${ originIndex * this.stepScaled }px)` + centering;
      return
    }

    if (originIndex % this.datesPerScreen !== 0){
      // console.log('skipped', originIndex, this.datesPerScreen, originIndex % this.datesPerScreen );
      return;
    }

    const dt = new Date(date);
    const dateEl = Dom.make('time');
    // dateEl.textContent = dt.toLocaleDateString('en-US', {
    //   day: 'numeric',
    //   month: 'short'
    // });

    dateEl.textContent = originIndex;


    // console.log('index %o, need hide? %o', index, index * this.step * this.modules.chart.scaling);

    // console.log('originIndex * this.stepScaled', originIndex, this.stepScaled, originIndex * this.stepScaled);

    // console.log('step scaled',  this.stepScaled );
    dateEl.style.transform = `translateX(${ originIndex * this.stepScaled }px)` + centering;
    this.legend.appendChild(dateEl);
    this.legendDates.push(dateEl);
    this.onscreenDates.add(originIndex);
    this.onscreenDatesElements[originIndex] = dateEl;
  }

  addOnscreenDates(dontRemove){
    // console.log('addOnscreenDates', dontRemove);
    let datesOnScreen = this.state.dates.slice(this.leftPointIndex, this.rightPointIndex + 2);
    let datesOnScreenIndexes = new Set();

    // console.log('this.state.dates', this.state.dates.map( dt => new Date(dt)));

    // let leftDate = new Date(this.state.dates[this.leftPointIndex]);
    // let rightDate = new Date(this.state.dates[this.leftPointIndex + this.rightPointIndex]);
    //
    // console.log('l %o (%o) r %o (%o)',
    //   this.leftPointIndex,
    //   leftDate.toLocaleDateString('en-US', {
    //     day: 'numeric',
    //     month: 'short'
    //   }),
    //   this.rightPointIndex,
    //   rightDate.toLocaleDateString('en-US', {
    //     day: 'numeric',
    //     month: 'short'
    //   }),
    // );

    // console.log('left %o right %o', new Date(this.state.dates[this.leftPointIndex]).getDate(), new Date(this.state.dates[this.leftPointIndex + this.rightPointIndex]).getDate());

    datesOnScreen.forEach((date, index) => {
      const originIndex = this.leftPointIndex + index;

      datesOnScreenIndexes.add(originIndex);
      this.pushDate(date, originIndex);
    });

    if (dontRemove){
      return;
    }


    this.onscreenDates.forEach((index) => {
      if (!datesOnScreenIndexes.has(index)) {
        this.onscreenDatesElements[index].remove();
        this.onscreenDates.delete(index);
        delete this.onscreenDatesElements[index];
      }
    });

    // this.prevLeftDateIndex = this.leftPointIndex;
    // this.prevRightDateIndex = this.leftPointIndex + this.rightPointIndex + 1;
  }

  /**
   * Renders a legend with dates
   * @param {number[]} dates
   */
  renderLegend(dates){
    this.legend = Dom.make('footer');

    this.addOnscreenDates();

    Dom.insertAfter(this.canvas, this.legend);

    return;


    let datesPerScreen = Math.floor(this.modules.chart.viewportWidth / (this.lenendDateWidth + 20));

    console.log('total %o , each %o , so fit %o', this.modules.chart.viewportWidth , this.lenendDateWidth, datesPerScreen);
    // let spaceBetween = (this.modules.chart.viewportWidth - ((datesPerScreen + 1) * this.lenendDateWidth)) / datesPerScreen;

    let canFit = this.fitableDatesCount;
    let spaceBetween = this.width / this.legendDatesVisible;

    console.log('canFit', canFit);

    let datesCount = dates.length;




    let skipEvery = Math.ceil(datesCount / canFit);

    let prevTraslateRight = this.lenendDateWidth;

    dates.forEach((date, index) => {
      /**
       * Skip every second
       */
      // if ((index + 1) % skipEvery === 1){
      //   return;
      // }

      // this.pushDate(date, index);
    });

    // this.legendDates.forEach( (el, index) => {
      // let left = spaceBetween * index;
      // let indexFromRight = datesCount - index;


      // let left = prevTraslateRight + (spaceBetween + this.lenendDateWidth) * -1;

      // el.style.left = spaceBetween * index + 'px';
      // dateEl.style.transform = `translateX(${this.width + left}px)`;
      // el.style.transform = `translateX(${left}px)`;
      // dateEl.dataset.left = left;

      // prevTraslateRight = left + 0;
    // })

    // this.skipIntersectedDates();

    // this.skipDatesEvery(2);
    Dom.insertAfter(this.canvas, this.legend);
  }

  /**
   * Scale left legend
   * @param {number} scaling
   */
  scaleLines(scaling, direction){
    this.oxGroup.style.transform = `scaleX(${scaling})`;
    // this.pathsList.forEach( path => {
    //   path.scaleX(scaling);
    // });

    const newWidth = this.initialWidth * scaling;
    console.log('newWidth', newWidth , this.initialWidth);
    this.width = newWidth;

    // this.addOnscreenDates();

    // this.moveDates(scaling)
  }

  get fitableDatesCount(){
    const margins = 20;
    // return Math.floor(this.width / (this.lenendDateWidth + margins));
    return Math.floor(this.width / (this.stepX + margins));
  }

  skipIntersectedDates(scaling = 1){
    // const stepXScaled = this.fitableDatesCount;
    const stepXScaled = this.stepX * scaling;

    console.log('step', stepXScaled, this.legendDatesVisible, this.legendDates.length - 1 , scaling);
    const dtElWidth = 55 + 10;

    this.prevRightSide = 0;

    this.legendDates.forEach((el, index) => {
      let leftSideCoord = index * stepXScaled;
      let rightSideCoord = leftSideCoord + dtElWidth;
      // let real = (index - 1) * dtElWidth;
      // console.log('index %o | left %o | right  %o | prev %o', index, leftSideCoord, rightSideCoord, '-');
      // console.log('index %o | left %o | real %o | prev %o', index, index * stepXScaled, '-', this.prevLeft, this.prevLeft > index * stepXScaled ? '   <- hided' : '');
      if (leftSideCoord < this.prevRightSide){
        if (!el.classList.contains(Graph.CSS.dateHidden)){
          el.classList.add(Graph.CSS.dateHidden);
          this.legendDatesVisible--;
        }
      } else {
        if (el.classList.contains(Graph.CSS.dateHidden)){
          // el.classList.remove(Graph.CSS.dateHidden);
          // this.legendDatesVisible++;
        }
        this.prevRightSide = rightSideCoord;
      }
    })
  }

  moveDates(scaling){
    const dtElWidth = 55;
    const canFit = this.fitableDatesCount;
    const spaceBetween = this.width / canFit;
    // const newStepX = this.stepX * scaling;

    console.log('new can fit:', canFit);

    // let left = spaceBetween * index;
    let datesPerScreen = Math.floor(this.modules.chart.viewportWidth / (55 + 20));
    let spaceBetweenGood = (this.modules.chart.viewportWidth - ((datesPerScreen + 1) * 55)) / datesPerScreen;
    // let left = ((spaceBetweenGood + 55) * index) * -1;

    const newStepX = (spaceBetweenGood * scaling + 55);
    const pointsOnViewport = Math.round(this.modules.chart.viewportWidth / (this.stepX * scaling));

    // console.log('pointsOnViewport', pointsOnViewport);

    let right = Math.round(this.modules.chart.scrollValue * -1 / spaceBetweenGood / scaling) + pointsOnViewport;

    let allDatesCount = this.legendDates.length;

    if (right > allDatesCount - 1){
      right = allDatesCount - 1;
    }

    console.log('right date', right, new Date(this.modules.state.dates[right]));


    this.legendDates.forEach( (el, index) => {
      let indexFromLeft = (allDatesCount - 1) - index;

      if (indexFromLeft === right){
        // console.warn('skipped', index, indexFromLeft);
        return;
      }

      let newLeft = newStepX * index * -1;

      if (index < 3){
       console.log('%o | new %o', index, newLeft);
      }

      el.style.transform = `translateX(${newLeft}px)`;
      // el.dataset.left = newLeft;

      // this.prevLeft = newLeft;
    })

    // this.skipIntersectedDates(scaling);
  }

  /**
   * Hide dates corresponding to scale
   */
  _toggleDatesVisibility(direction = 'left'){
    const canFit = this.fitableDatesCount;
    const nowFit = this.legendDatesVisible;
    const skipEveryIndex = Math.floor(nowFit / canFit);
    let showEveryIndex = Math.floor(canFit / nowFit);
    console.log('can %o now %o (%o)', canFit, nowFit, this.legend.querySelectorAll(`time:not(.${Graph.CSS.dateHidden})`).length ,'skip every', skipEveryIndex, showEveryIndex, Math.floor(canFit / nowFit));


    if (canFit > nowFit && Math.floor(canFit / nowFit) > 1 && direction === 'right'){
      console.warn('will be shown every', showEveryIndex + 1);

      this.showDatesEvery(showEveryIndex + 1);
      return;
    }

    if (skipEveryIndex < 1){
      return;
    }

    let visibleIndex = 0;


    console.warn('SKIP!');
    this.skipDatesEvery(skipEveryIndex + 1);


    // const fitability = Math.floor(nowFit / canFit + 0.9);

    // console.log('canFit', canFit, nowFit, fitability);
    // if (fitability % 2 === 1){
    //   this.legend.classList.add(`skip-${fitability}`);
    // }
    //
    // this.legend.classList.toggle('skip-odd', nowFit / canFit > 1.7);
    // this.legend.classList.toggle('skip-third', nowFit / canFit > 3.2);
    // this.legend.classList.toggle('skip-fifth', nowFit / canFit > 5.5);
    // this.legend.classList.toggle('skip-seventh', nowFit / canFit > 7);
    // this.legend.classList.toggle('skip-ninth', nowFit / canFit > 9.2);
    // this.legend.classList.toggle('skip-eleventh', nowFit / canFit > 14);
  }

  skipDatesEvery(skipEveryIndex){
    this.legendDates.filter(el => !el.classList.contains(Graph.CSS.dateHidden)).forEach( (el, index) => {
      if (index % skipEveryIndex === 0) {
        el.classList.add(Graph.CSS.dateHidden);
        this.legendDatesVisible--;
      }
    });
  }

  showDatesEvery(showEveryIndex){
    this.legendDates.filter(el => el.classList.contains(Graph.CSS.dateHidden)).forEach( (el, index) => {
      if (index % showEveryIndex === 0) {
        el.classList.remove(Graph.CSS.dateHidden);
        this.legendDatesVisible++;
      }
    });
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