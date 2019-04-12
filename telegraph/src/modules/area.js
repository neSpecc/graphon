import * as Dom from "../utils/dom";

/**
 * Helper for creating an Bar charts
 */
export default class Area {
  constructor({canvasHeight, kY, stepX, key, color}){
    this.canvasHeight = canvasHeight;
    this.kY = kY;
    this.key = key;

    this.prevX = 0;
    this.stepX = stepX;

    this.wrapper = Dom.make('g');
    this.wrapper.setAttribute('class', Area.CSS.wrapper);
    this.wrapper.setAttribute('vector-effect', 'non-scaling-stroke');
    this.hidden = false;


    this.path = Dom.make('path', null, {
      fill : color,
      'vector-effect': 'non-scaling-stroke',
      stroke: color,
      strokeWidth : 2
    });

    this.pathData = '';
  }

  getAll(){
    return this.path;
  }

  /**
   * CSS classes map
   * @return {{graphHidden: string}}
   */
  static get CSS(){
    return {
      wrapper: 'tg-area',
      graphHidden: 'tg-area--hidden',
    }
  }

  /**
   * Compute Y value with scaling
   */
  y(val){
    return this.canvasHeight - val;
  }

  /**
   * Compute X value with scaling
   */
  x(val){
    return val;
  }

  percentToValue(per){
    return this.canvasHeight / 100 * per;
  }

  valueToPercent(val, total){
    return 100 / total * val;
  }

  /**
   * Go to passed coords
   * @param {number} x
   * @param {number} y
   */
  moveTo(x, y, total = 0){
    let valueInPercents = total ? this.valueToPercent(y, total) : y;
    console.log('move to', valueInPercents);
    this.pathData += `M ${x} ${this.percentToValue(valueInPercents)}`;
  }

  /**
   * Continue line to the next value
   * @param {number} y
   * @param {number} total - this value is 100% for all charts
   */
  stepTo(y, total, prev, skip = false){
    let curPercents = 100/ total * y;
    let prevPercents = 100 / total * prev;
    let percentage = this.percentToValue(100 - prevPercents);
    // console.log('current per %o | 100% is %o | prev percents is %o | -->', curPercents, total, prevPercents, percentage);
    if (!skip) {
      this.prevX = this.prevX + this.stepX;
    }
    this.pathData += ` L ${this.x(this.prevX)} ${this.y(percentage)}`;
  }

  /**
   * Append a line
   */
  finish(){
    // console.log('finished', this.pathData);
    this.pathData += ` L ${this.x(this.prevX)} ${this.canvasHeight} 0 ${this.canvasHeight} 0 0`;
    this.path.setAttribute('d', this.pathData);
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
    bar.setAttribute('width', this.stepX);
    bar.setAttribute('height', height);
    bar.setAttribute('x', this.prevX);
    bar.setAttribute('y', this.y(stackValue - prevValue));
    bar.setAttribute('fill', color);
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

  toggleVisibility(){
    this.hidden = !this.hidden;
    this.wrapper.classList.toggle(Area.CSS.graphHidden);
  }
}