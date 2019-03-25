import * as Dom from "../utils/dom";

/**
 * Helper for creating an SVG path
 */
export default class Path {
  constructor({color, svg, max, stroke, stepX, opacity = 1}){
    this.svg = svg;
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

  static get CSS(){
    return {
      graphHidden: 'tg-graph--hidden'
    }
  }

  /**
   * @todo get offsetHeight instead of style.height
   * @todo cache value
   * @return {number}
   */
  get canvasHeight(){
    return parseInt(this.svg.style.height, 10);
  }

  get canvasWidth(){
    return this.svg.offsetWidth;
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
   * Create a new line with x and y
   * @param {number} x
   * @param {number} y
   */
  lineTo(x, y){
    this.pathData += ` L ${this.x(x)} ${this.y(y)}`;
  }

  /**
   * Append a line
   */
  render(){
    this.path.setAttribute('d', this.pathData);
    this.svg.appendChild(this.path);
    this.animate();
  }

  /**
   * Drop text to passed point
   * @param value
   */
  dropText(value, skipStepX = false){
    let text = Dom.make('text', null, {
      x: !skipStepX ? this.prevX + this.stepX: this.prevX,
      y: this.y(value),
      fill: '#cccccc',
      textAnchor: 'left',
      'dominant-baseline': 'use-script'
    })

    text.appendChild(document.createTextNode(value));
    text.style.fontSize = 13 + 'px';

    this.svg.appendChild(text);
  }

  animate(){
    const speed = 2000;
    const length = this.path.getTotalLength();

    // Clear any previous transition
    this.path.style.transition = this.path.style.WebkitTransition = 'none';

    // Set up the starting position
    this.path.style.strokeDasharray = length + ' ' + length;
    this.path.style.strokeDashoffset = length;

    // Trigger a Layout so styles are re-calculated
    // A browser picks up the starting position before animating
    this.path.getBoundingClientRect();

    // Define our transition
    this.path.style.transition = this.path.style.WebkitTransition = 'stroke-dashoffset ' + speed + 'ms' + ' ease-in';

    // Go.
    this.path.style.strokeDashoffset = '0';

    setTimeout(() => {
      this.path.style.removeProperty('transition');
      this.path.style.removeProperty('stroke-dasharray');
      this.path.style.removeProperty('stroke-dashoffset');
    }, speed)
  };

  scaleX(scaling){
    let oldTransform = this.path.style.transform;
    // let oldTransition = this.path.style.transition;

    // this.path.style.transition = 'transform 100ms ease, opacity 150ms ease';

    if (oldTransform.includes('scaleX')){
      this.path.style.transform = oldTransform.replace(/(scaleX\(\S+\))/, `scaleX(${scaling})`)
    } else {
      this.path.style.transform = oldTransform + ` scaleX(${scaling})`;
    }

    // setTimeout(() => {
    //   this.path.style.transition = oldTransition;
    // }, 100)
  }

  scaleY(scaling){
    let oldTransform = this.path.style.transform;
    let oldTransition = this.path.style.transition;

    this.path.style.transition = 'transform 100ms ease, opacity 150ms ease';

    if (oldTransform.includes('scaleY')){
      this.path.style.transform = oldTransform.replace(/(scaleY\(\S+\))/, `scaleY(${scaling})`)
    } else {
      this.path.style.transform = oldTransform + ` scaleY(${scaling})`;
    }

      setTimeout(() => {
        this.path.style.transition = oldTransition;
      }, 300)
  }

  get isHidden(){
    return this.path.classList.contains(Path.CSS.graphHidden);
  }

  toggleVisibility(){
    this.path.classList.toggle(Path.CSS.graphHidden);
  }
}