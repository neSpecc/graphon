import * as Dom from "../utils/dom";

/**
 * Line with current values pointers
 */
export default class Pointer {
  constructor(modules){
    this.modules = modules;
    this.nodes = {
      wrapper: undefined,
    }
    this.pointers = [];
  }

  /**
   * CSS map
   * @return {{wrapper: string, showed: string, pointer: string}}
   * @constructor
   */
  static get CSS(){
    return {
      wrapper: 'tg-pointer',
      showed: 'tg-pointer--showed',
      pointer: 'tg-pointer__pointer'
    }
  }

  render(){
    this.nodes.wrapper = Dom.make('div', Pointer.CSS.wrapper);
    return this.nodes.wrapper;
  }

  show(){
    this.nodes.wrapper.classList.add(Pointer.CSS.showed);
  }

  hide(){
    this.nodes.wrapper.classList.remove(Pointer.CSS.showed);
  }

  move(leftPx){
    this.show();
    this.nodes.wrapper.style.left = `${leftPx}px`;
  }

  /**
   * Show circles
   * @param {{name: string, value: number}[]} values
   */
  showValues(values){
    if (!this.pointers.length){
      values.forEach( ({name}) => {
        const item = Dom.make('div', Pointer.CSS.pointer);

        item.style.borderColor = this.modules.state.colors[name];
        this.nodes.wrapper.appendChild(item);
        this.pointers.push(item);
      })
    }

    /**
     * @type {Graph}
     */
    const {graph} = this.modules.chart;

    values.forEach( ({name, value}, index) => {
      const item = this.pointers[index];
      const currentZero = graph.currentMinimum;
      const valueFromZero = value - currentZero;
      const coord = valueFromZero * graph.kYScaled;

      item.style.bottom = `${coord}px`;
      // item.style.transform = `translateY(${coord}px)`;
    })

  }
}