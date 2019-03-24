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
    }
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
    let offsetLeft = -25;
    const tooltipWidth = this.nodes.wrapper.offsetWidth;

    if (lineLeftCoord > this.modules.chart.viewportWidth - tooltipWidth / 3){
      offsetLeft = -1.1 * tooltipWidth;
    } else if (lineLeftCoord > this.modules.chart.viewportWidth - tooltipWidth ){
      offsetLeft = -0.8 * tooltipWidth;
    } else if (lineLeftCoord < 45){
      offsetLeft = 20;
    }

    this.nodes.wrapper.style.left = `${lineLeftCoord + offsetLeft}px`;
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


      item.innerHTML = `<b>${Numbers.beautify(value)}</b>${title}`;
      item.style.color = color;

      this.nodes.values.appendChild(item);
    })
  }

  set title(string){
    this.nodes.title.innerHTML = string;
  }
}