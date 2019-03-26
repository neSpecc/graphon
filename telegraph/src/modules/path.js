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

    /**
     * Cache for CSS transform matrix
     * @type {{scaleX: number, scaleY: number, translateX: number}}
     */
    this.matrix = {
      scaleX: 1,
      scaleY: 1,
      translateX: 0
    };

    /**
     * Debounce for transition removing
     * @type {null}
     */
    this.debounce = null;
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
  render(withAnimate = false){
    this.path.setAttribute('d', this.pathData);
    this.group.appendChild(this.path);

    if (withAnimate){
      this.animate();
    }
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

  setMatrix(scaleX, scaleY, translateX){
    this.path.style.transform = `matrix(${scaleX},0,0,${scaleY}, ${translateX},0)`;
    this.matrix = {
      scaleX, scaleY, translateX
    }
  }

  scaleX(scaling){
    let oldTransform = this.path.style.transform;

    if (oldTransform.includes('scaleX')){
      this.path.style.transform = oldTransform.replace(/(scaleX\(\S+\))/, `scaleX(${scaling})`)
    } else {
      this.path.style.transform = oldTransform + ` scaleX(${scaling})`;
    }
  }

  scaleY(scaleY){
    // this.matrix.scaleY = scaleY;
    this.path.style.transition = 'transform 250ms ease, opacity 150ms ease';
    // this.setMatrix(this.matrix.scaleX, scaleY, this.matrix.translateX);

    let oldTransform = this.path.style.transform;

    if (oldTransform.includes('scaleY')){
      this.path.style.transform = oldTransform.replace(/(scaleY\(\S+\))/, `scaleY(${scaleY})`)
    } else {
      this.path.style.transform = oldTransform + ` scaleY(${scaleY})`;
    }


    if (this.debounce){
      clearTimeout(this.debounce);
    }

    this.debounce = setTimeout(() => {
      this.path.style.transition = 'opacity 150ms ease';
    }, 270)
  }

  get isHidden(){
    return this.path.classList.contains(Path.CSS.graphHidden);
  }

  toggleVisibility(){
    this.path.classList.toggle(Path.CSS.graphHidden);
  }
}