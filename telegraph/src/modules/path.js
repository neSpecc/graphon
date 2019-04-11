import * as Dom from "../utils/dom";

/**
 * Helper for creating an SVG path
 */
export default class Path {
  constructor({color, svg, max, stroke, stepX, opacity = 1, g}){
    this.svg = svg;
    this.group = g;
    this.canvasHeight = parseInt(this.svg.style.height, 10);
    this.kY = max !== 0 ? this.canvasHeight / max : 1;
    this.stepX = stepX;
    this.prevX = 0;

    this.path = Dom.make('path', null, {
      'stroke-width' : stroke,
      stroke : color,
      fill : 'transparent',
      'stroke-linecap' : 'round',
      'stroke-linejoin' : 'round',
      'vector-effect': 'non-scaling-stroke',
      opacity
    });

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
    this.group.appendChild(this.path);
  }

  get isHidden(){
    return this.path.classList.contains(Path.CSS.graphHidden);
  }

  toggleVisibility(){
    this.path.classList.toggle(Path.CSS.graphHidden);
  }
}