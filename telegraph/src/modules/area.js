import * as Dom from "../utils/dom";

/**
 * Helper for creating an Bar charts
 */
export default class Area {
  constructor({canvasHeight, stepX, key, color}){
    this.canvasHeight = canvasHeight;
    this.key = key;
    this.color = color;

    this.prevX = 0;
    this.stepX = stepX;
    this.hidden = false;


    this.path = this.createPath();
    this.morphing = undefined;

    this.pathData = [];
  }

  createPath(){
    let path = Dom.make('path', null, {
      fill : this.color,
      'vector-effect': 'non-scaling-stroke',
    });

    path.classList.add(Area.CSS.path);

    return path;
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
      path: 'tg-area',
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
    this.pathData.push(`M ${x} ${this.percentToValue(valueInPercents)}`);
  }

  /**
   * Continue line to the next value
   * @param {number} total - this value is 100% for all charts
   */
  stepTo(total, prev, skip = false){
    let prevPercents = 100 / total * prev;
    let percentage = this.percentToValue(100 - prevPercents);
    // console.log('current per %o | 100% is %o | prev percents is %o | -->', curPercents, total, prevPercents, percentage);
    if (!skip) {
      this.prevX = this.prevX + this.stepX;
    }
    this.pathData.push(`L ${this.x(this.prevX)} ${this.y(percentage)}`);
  }

  /**
   * Recalculate Y coordinate
   * @param {number} y
   * @param {number} total - this value is 100% for all charts
   */
  move(index, total, prev){
    let pointToChange = this.pathData[index + 1]; // +1 to skip M value
    let [l, x, y] = pointToChange.trim().split(' ');

    let prevPercents, percentage;

    if (total > 0){
      prevPercents = 100 / total * prev;
      percentage = this.percentToValue(100 - prevPercents);
    } else {
      percentage = this.percentToValue(0 );
    }

    this.pathData[index + 1] = ` L ${x} ${this.y(percentage)}`;
  }

  update(){
    this.morphing = Dom.make('animate');
    this.morphing.setAttribute('attributeName', 'd');
    this.morphing.setAttribute('attributeType', 'XML');
    this.morphing.setAttribute('dur', '170ms');
    this.morphing.setAttribute('fill', 'freeze');
    this.morphing.setAttribute('to', this.pathData.join(' '));
    this.path.appendChild(this.morphing);
    this.morphing.beginElement();
  }

  /**
   * Append a line
   */
  finish(){
    this.pathData.push(`L ${this.x(this.prevX)} ${this.canvasHeight} 0 ${this.canvasHeight} 0 0`);
    this.path.setAttribute('d', this.pathData.join(' '));
  }

  get isHidden(){
    return this.hidden;
  }

  toggleVisibility(status){
    this.hidden = !this.hidden;
    this.path.classList.toggle(Area.CSS.graphHidden, status);
  }
}