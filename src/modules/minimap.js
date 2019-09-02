import * as Dom from '../utils/dom.js';
import * as Event from '../utils/event.js';
import debounce from '../utils/debounce.js';
import Graph from './graph.js';
import log from '../utils/log.js';


/**
 * Module for working with Chart Mini map
 * - Render UI
 * - Render graphs
 * - Scaling
 * - Scrolling
 */
export default class Minimap {
  /**
   * Graphon
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

    this.graph = new Graph(this.modules, {
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
    this.nodes.wrapper = Dom.make('div', Minimap.CSS.wrapper);
    this.nodes.leftZone = Dom.make('div', Minimap.CSS.leftZone);
    this.nodes.centerZone = Dom.make('div', Minimap.CSS.centerZone);
    this.nodes.rightZone = Dom.make('div', Minimap.CSS.rightZone);
    this.nodes.leftZoneScaler = Dom.make('div', Minimap.CSS.leftZoneScaler);
    this.nodes.rightZoneScaler = Dom.make('div', Minimap.CSS.rightZoneScaler);

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
    this.moveStartX = Event.getPageX(event);

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
    let delta = Event.getPageX(event) - this.moveStartX;

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
    let pageX = Event.getPageX(event);
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