import * as Dom from '../utils/dom.js';
import * as Numbers from '../utils/numbers';

export default class Tooltip {
  /**
   * @param {Telegraph} modules
   */
  constructor(modules){
    this.modules = modules;
    this.nodes = {
      wrapper:  undefined,
      title: undefined,
      values: undefined
    };

    this._width = 0;
  }

  /**
   * CSS map
   * @return {{wrapper: string, title: string, values: string, value: string}}
   */
  static get CSS(){
    return {
      wrapper: 'tg-tooltip',
      showed: 'tg-tooltip--showed',
      title: 'tg-tooltip__title',
      values: 'tg-tooltip__values',
      value: 'tg-tooltip__values-item',
    }
  }

  render(){
    this.nodes.wrapper = Dom.make('div', Tooltip.CSS.wrapper);
    this.nodes.title = Dom.make('div', Tooltip.CSS.title);
    this.nodes.values = Dom.make('div', Tooltip.CSS.values);

    this.nodes.wrapper.appendChild(this.nodes.title);
    this.nodes.wrapper.appendChild(this.nodes.values);

    return this.nodes.wrapper;
  }

  show(){
    this.nodes.wrapper.classList.add(Tooltip.CSS.showed);
  }

  hide(){
    this.nodes.wrapper.classList.remove(Tooltip.CSS.showed);
  }

  move(lineLeftCoord){
    if (!this._width){
      this._width = this.nodes.wrapper.offsetWidth;
    }

    let offsetLeft = -25;
    let left = lineLeftCoord + offsetLeft;

    if (left + this._width > this.modules.chart.viewportWidth){
      left = this.modules.chart.viewportWidth - this._width - 30;
    }


    // if (lineLeftCoord > this.modules.chart.viewportWidth - tooltipWidth / 1.3){
    //   offsetLeft = -1.3 * tooltipWidth;
    // } else if (lineLeftCoord > this.modules.chart.viewportWidth - tooltipWidth ){
    //   offsetLeft = -0.8 * tooltipWidth;
    // } else if (lineLeftCoord < 45){
    //   offsetLeft = 20;
    // }

    this.nodes.wrapper.style.left = `${left}px`;
  }

  clear(){
    this.nodes.title.textContent = '';
    this.nodes.values.innerHTML = '';
  }

  /**
   * Render values of current hovered points
   * @param {{name: string, value: number}[]} values
   */
  set values(values){
    this.clear();

    values.forEach( ({name, value}) => {
      const item = Dom.make('div', Tooltip.CSS.value);
      const color = this.modules.state.colors[name];
      const title = this.modules.state.names[name];


      item.innerHTML = `${title} <b style="color: ${color}">${Numbers.addSpaces(value)}</b>`;

      this.nodes.values.appendChild(item);
    })
  }

  set title(string){
    this.nodes.title.innerHTML = string;
  }
}