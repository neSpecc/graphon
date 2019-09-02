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
    this.hidden = false;
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
      graphHidden: 'tg-bar--hidden',
    }
  }

  /**
   * Compute Y value with scaling
   */
  y(val){
    return this.canvasHeight - val * this.kY;
  }

  /**
   * Compute X value with scaling
   */
  x(val){
    return val;
  }

  /**
   * Continue line to the next value
   * @param {number} y
   */
  add(y, stackValue, prevValue, color){
    let stackScaled = stackValue * this.kY;
    let heightPrev = prevValue * this.kY;
    let height = stackScaled - heightPrev;

    const bar = Dom.make('rect');
    bar.setAttribute('width', this.stepX);
    bar.setAttribute('height', height);
    bar.setAttribute('x', this.prevX);
    bar.setAttribute('y', this.y(stackValue - prevValue));
    bar.setAttribute('fill', color);

    this.prevX = this.prevX + this.stepX;
    // bar.setAttribute('stroke', color);
    // bar.setAttribute('opacity', 0.6);


    this.wrapper.appendChild(bar);
  }

  move(index, newStack, prevValue) {
    let bar = this.wrapper.children[index];
    let stackScaled = newStack * this.kY;
    let heightPrev = prevValue * this.kY;
    let height = stackScaled - heightPrev;

    bar.setAttribute('height', height);
    bar.setAttribute('y', this.y(newStack - prevValue));
  }


  get isHidden(){
    return this.hidden;
  }

  toggleVisibility(status){
    this.hidden = !this.hidden;
    this.wrapper.classList.toggle(Bar.CSS.graphHidden, status);
  }
}