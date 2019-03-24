import * as Dom from '../utils/dom.js';
import Graph from './graph.js';


/**
 * Module for working with Chart Mini map
 * - Render UI
 * - Render graphs
 * - Scaling
 * - Scrolling
 */
export default class Minimap {
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
     * Clicked pageX
     */
    this.moveStartX = undefined;

    /**
     * Clicked layerX
     */
    this.moveStartLayerX = undefined;
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

    this.graph = new Graph(this.state, {
      stroke: 1
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
    this.nodes.wrapper = Dom.make('div', Minimap.CSS.wrapper);
    this.nodes.leftZone = Dom.make('div', Minimap.CSS.leftZone);
    this.nodes.rightZone = Dom.make('div', Minimap.CSS.rightZone);
    this.nodes.leftZoneScaler = Dom.make('div', Minimap.CSS.leftZoneScaler);
    this.nodes.rightZoneScaler = Dom.make('div', Minimap.CSS.rightZoneScaler);

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
    return this.wrapperWidth - parseInt(this.nodes.leftZone.style.width, 10) - parseInt(this.nodes.rightZone.style.width, 10);
  }

  /**
   * Set new with to the minimap's viewport
   * @param value
   */
  set width(value){
    const scrollDistance = this.modules.chart.scrollDistance;

    this.nodes.leftZone.style.width = scrollDistance + 'px';
    this.nodes.rightZone.style.width = this.wrapperWidth - scrollDistance - value + 'px';
    this.viewportWidth = value;
  }

  /**
   * Initial width and offset
   */
  setInitialPosition(){
    let rect = this.nodes.wrapper.getBoundingClientRect();
    this.wrapperWidthCached = rect.width;
    this.wrapperLeftCoord = rect.left;

    const chartToViewportRatio = this.modules.chart.viewportWidth / this.modules.chart.width;
    this.width = this.wrapperWidth * chartToViewportRatio;
    this.viewportWidthInitial = this.width;
    this.viewportOffsetLeft = 0;
    this.moveViewport(this.viewportOffsetLeft);
    this.syncScrollWithChart();
  }

  /**
   * Current scroll value
   * @return {number}
   */
  get scrolledValue(){
    return parseInt(this.nodes.leftZone.style.width, 10);
  }

  /**
   * Moves viewport from left for passed value
   * @param {string} offsetLeft
   */
  moveViewport(offsetLeft){
    const width = this.width;
    const maxLeft = this.wrapperWidth - width;
    const minLeft = 0;

    let newLeft = this.viewportOffsetLeft + offsetLeft;

    if (newLeft < minLeft){
      newLeft = minLeft;
    } else if (newLeft > maxLeft){
      newLeft = maxLeft;
    }
    this.nodes.leftZone.style.width = newLeft + 'px';
    this.nodes.rightZone.style.width = this.wrapperWidth - width - newLeft;
  }

  bindEvents(){
    this.nodes.wrapper.addEventListener('mousedown', (event) => {
      this.viewportMousedown(event);
    });

    this.nodes.wrapper.addEventListener('mousemove', (event) => {
      this.viewportMousemove(event);
    });

    this.nodes.wrapper.addEventListener('mouseleave', (event) => {
      this.viewportMouseleave(event);
    });

    this.nodes.wrapper.addEventListener('mouseup', (event) => {
      this.viewportMouseup(event);
    });

    /**
     * @todo add support to touches
     * （╯°□°）╯︵( .o.)
     */

    this.nodes.wrapper.addEventListener('touchstart', (event) => {
      this.viewportMousedown(event);
    });

    this.nodes.wrapper.addEventListener('touchmove', (event) => {
      this.viewportMousemove(event);
   });

    this.nodes.wrapper.addEventListener('touchcancel', (event) => {
      this.viewportMouseleave(event);
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

    const leftScalerClicked = !!target.closest(`.${Minimap.CSS.leftZoneScaler}`);
    const rightScalerClicked = !!target.closest(`.${Minimap.CSS.rightZoneScaler}`);

    this.moveStartX = !event.touches ? event.pageX : event.touches[0].pageX;
    this.moveStartLayerX = !event.touches ? event.layerX : event.touches[0].layerX;

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

  /**
   * Viewport dragend
   * @param {MouseEvent} event
   */
  viewportMouseleave(event){
    if (this.viewportPressed){
      this.finishSliding();
    } else if (this.leftScalerClicked){
      this.finishLeftScaling();
    } else if (this.rightScalerClicked){
      this.finishRightScaling();
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
    this.viewportOffsetLeft = parseInt(this.scrolledValue, 10);
  }

  finishLeftScaling(){
    this.leftScalerClicked = false;
  }

  finishRightScaling(){
    this.rightScalerClicked = false;
  }

  /**
   * @param {MouseEvent} event
   */
  viewportDragged(event){
    let delta = event.pageX - this.moveStartX;

    if (event.touches) {
      delta = event.touches[0].pageX;
    }

    this.moveViewport(delta);
    this.syncScrollWithChart();

    /**
     * @todo add debounce
     */
    this.modules.chart.fitToMax();
  }

  syncScrollWithChart(){
    /**
     * How many percents of mini-map is scrolled
     */
    const minimapScrolledPortion = this.scrolledValue / this.wrapperWidth;
    const chartScroll = minimapScrolledPortion * this.modules.chart.width;

    this.modules.chart.scroll(chartScroll);
  }

  /**
   * Viewport side-scaler is moved
   * @param {MouseEvent} event
   * @param {string} direction — 'left' or 'right'
   */
  scalerDragged(event, side){
    let delta = event.layerX - this.moveStartLayerX;
    let pullDirection = event.pageX - this.moveStartX < 0 ? 'left' : 'right';

    if (!delta){
      return;
    }

    /**
     * Workaround case with fast-forward dragging
     */
    if (delta > 5){
      delta = 5;

      if (side === 'left'){
        delta = pullDirection === 'left' ? -5 : 5;
      }
    } else if (delta < -5){
      delta = -5;
    }

    if (side === 'left'){
      delta = delta * -1;
      this.nodes.leftZone.style.width = parseInt(this.nodes.leftZone.style.width) - delta + 'px';
      this.syncScrollWithChart();
    } else {
      this.nodes.rightZone.style.width = parseInt(this.nodes.rightZone.style.width) - delta + 'px';
    }

    const scaling = this.viewportWidthInitial / this.width ;
    this.modules.chart.scale(scaling);
    this.modules.chart.fitToMax();
  }
}