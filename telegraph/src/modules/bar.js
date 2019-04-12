import * as Dom from "../utils/dom";

/**
 * Helper for creating an Bar charts
 */
export default class Bar {
  constructor({canvasHeight, kY, stepX, key}){
    this.canvasHeight = canvasHeight;
    this.kY = kY;
    this.key = key;

    this.prevX = 0;
    this.stepX = stepX;

    this.wrapper = Dom.make('g');
    this.wrapper.setAttribute('class', Bar.CSS.wrapper);
    this.wrapper.setAttribute('vector-effect', 'non-scaling-stroke');
  }

  getAll(){
    return this.wrapper;
  }

  /**
   * CSS classes map
   * @return {{graphHidden: string}}
   */
  static get CSS(){
    return {
      wrapper: 'tg-bar',
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
  add(y, stackValue, prevValue, color){
    this.prevX = this.prevX + this.stepX;
    let stackScaled = stackValue * this.kY;
    let heightPrev = prevValue * this.kY;
    let height = stackScaled - heightPrev;

    const bar = Dom.make('rect');
    bar.setAttribute('width', this.stepX + 1);
    bar.setAttribute('height', height);
    bar.setAttribute('x', this.prevX - 1);
    bar.setAttribute('y', this.y(stackValue - prevValue));
    bar.setAttribute('fill', color);
    // bar.setAttribute('stroke', color);
    // bar.setAttribute('opacity', 0.6);


    this.wrapper.appendChild(bar);
  }


  get isHidden(){
    return this.wrapper.classList.contains(Bar.CSS.graphHidden);
  }

  toggleVisibility(){
    this.wrapper.classList.toggle(Bar.CSS.graphHidden);
  }
}