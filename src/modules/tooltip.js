import * as Dom from '../utils/dom.js';
import * as Numbers from '../utils/numbers';

export default class Tooltip {
  /**
   * @param {Graphon} modules
   */
  constructor(modules){
    this.modules = modules;
    this.nodes = {
      wrapper:  undefined,
      title: undefined,
      values: undefined
    };

    this._width = 0;
    this._values = [];
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
      valueTitle: 'tg-tooltip__values-item-title',
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

  move(lineLeftCoord, values){
    if (!this._width){
      this._width = this.nodes.wrapper.offsetWidth;
    }

    let max = Math.max(...values.map(value => value.value));
    let maxBottom = max * this.modules.chart.graph.kY - this.modules.chart.graph.zeroShifting;

    let offsetLeft = -25;
    let left = lineLeftCoord + offsetLeft;

    if (maxBottom > 260) {
      left = left - this._width;
    }

    if (left < this._width + 25){
      left = lineLeftCoord + 25
    }

    if (left + this._width > this.modules.chart.viewportWidth){
      left = left - this._width;
    }

    //
    // if (left + this._width > this.modules.chart.viewportWidth){
    //   left = this.modules.chart.viewportWidth - this._width - 30;
    // }


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

    const prevValues = this._values;

    this._values = [];

    if (this._setValuesDebounce){
      clearTimeout(this._setValuesDebounce);
    }

    let summ = 0;

    for (let i = 0, lenCached = values.length; i < lenCached; i++) {
      summ += values[i].value;
    }


    if (values.length > 2){
      this._setValuesDebounce = setTimeout(() => {
        values.forEach( ({name, value}, index) => {
          this.createItem(this.modules.state.names[name], this.modules.state.colors[name], value, prevValues[index], index, values)
        });

        if (this.modules.state.type === 'bar' && values.length > 1){
          this.createItem('All', '#000', summ, null, values.length, values, true)
        }
      }, 150)

    } else {
        values.forEach( ({name, value}, index) => {
          this.createItem(this.modules.state.names[name], this.modules.state.colors[name], value, prevValues[index], index, values)
        });

        if (this.modules.state.type === 'bar' && values.length > 1){
          this.createItem('All', '#fff', null, values.length, values, true)
        }
    }

  }

  createItem(title, color, value, prevValue, index = 0, all, isAll= false){
    const item = Dom.make('div', Tooltip.CSS.value);
    const counter = Dom.make('b');

    if (isAll){
      item.classList.add('all');
    }

    if (this.modules.state.type === 'area'){
      let total = all.reduce((acc, cur) => acc += cur.value, 0);
      let percent = Math.ceil((value / total) * 100);
      let percentEl = Dom.make('span', 'percents');

      percentEl.textContent = percent + '%';

      item.appendChild(percentEl)
    }

    let titleEl = Dom.make('span', Tooltip.CSS.valueTitle);

    titleEl.textContent = title;

    item.appendChild(titleEl);
    item.appendChild(counter);

    counter.style.color = color;

    let valueBeautified = Numbers.addSpaces(value);

    setTimeout(() => {
      Dom.animateCounter(counter, valueBeautified, prevValue);
    }, 50 * index);


    this.nodes.values.appendChild(item);
    this._values.push(valueBeautified);
  }

  set title(string){
    this.nodes.title.innerHTML = string;
  }

  /**
   * @param {Date} dt
   */
  set date(dt){
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const week = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    let month = dt.getMonth();
    let year = dt.getFullYear();
    let weekday = dt.getDay();
    let day = dt.getDate();
    let left = Dom.make('span', 'left');
    let right = Dom.make('span');

    let newDate = ''

    if (!this.modules.state.byMonth){
      newDate =   `${week[weekday]}, ${day}`;
      right.textContent = months[month] + ' ' + year;
    } else {
      newDate = months[month] + ' ';
      right.textContent = year;
    }

    this.nodes.title.innerHTML = '';
    this.nodes.title.appendChild(left);
    this.nodes.title.appendChild(right);



    Dom.animateCounter(left, newDate, this._prevDate, 'top' );
    this._prevDate = newDate
  }
}