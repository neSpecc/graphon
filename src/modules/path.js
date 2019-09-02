import * as Dom from "../utils/dom";

/**
 * Helper for creating an SVG path
 */
export default class Path {
  constructor({canvasHeight, zeroShifting, color, kY, stroke, stepX, max, min, isScaled}){
    this.canvasHeight = canvasHeight;
    this.zeroShifting = zeroShifting;
    this.kY = kY;
    this.stepX = stepX;
    this.prevX = 0;
    this.max = max;
    this.min = min;

    // here will be stored current minimum value for 2-y axis charts
    this.currentMinimum = 0;

    this.path = Dom.make('path', null, {
      'stroke-width' : stroke,
      stroke : color,
      fill : 'transparent',
      'stroke-linecap' : 'round',
      'stroke-linejoin' : 'round',
      'vector-effect': 'non-scaling-stroke',
    });

    if (isScaled){
      this.path.classList.add('scaled');
    }

    this.pathData = '';
  }

  /**
   * CSS classes map
   * @return {{graphHidden: string}}
   */
  static get CSS(){
    return {
      graphHidden: 'tg-graph--hidden',
    }
  }

  /**
   * Compute Y value with scaling
   */
  y(val){
    return Math.round(this.canvasHeight - val * this.kY + this.zeroShifting);
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
  stepTo(y, skipStep){
    if (!skipStep){
      this.prevX = this.prevX + this.stepX;
    }
    this.pathData += ` L ${this.x(this.prevX)} ${this.y(y)}`;
  }

  /**
   * Append a line
   */
  render(){
    this.path.setAttribute('d', this.pathData);
    return this.path;
  }

  get isHidden(){
    return this.path.classList.contains(Path.CSS.graphHidden);
  }

  toggleVisibility(status){
    this.path.classList.toggle(Path.CSS.graphHidden, status);
  }
}