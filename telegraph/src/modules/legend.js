import * as Dom from '../utils/dom.js';

export default class Legend {
  /**
   * @param {Telegraph} modules
   */
  constructor(modules){
    this.modules = modules;
    this.nodes = {
      wrapper: undefined,
    };

    this.buttons = {};
  }

  static get CSS(){
    return {
      wrapper: 'tg-legend',
      item: 'tg-legend__item',
      itemEnabled: 'tg-legend__item--enabled',
      checkbox: 'tg-legend__checkbox',
    }
  }

  /**
   * Show graphs togglers
   * @return {Element}
   */
  render(){
    this.nodes.wrapper = Dom.make('div', Legend.CSS.wrapper);

    /**
     * Object with names -> array with names
     */
    const namesArray = Object.entries(this.modules.state.names).map(([name, title]) => {
      return {name, title}
    });

    namesArray.forEach(({name, title}) => {
      let item = Dom.make('div', [Legend.CSS.item, Legend.CSS.itemEnabled]),
        checkbox = Dom.make('span', Legend.CSS.checkbox);

      checkbox.style.borderColor = this.modules.state.colors[name];
      checkbox.style.backgroundColor = this.modules.state.colors[name];

      item.appendChild(checkbox);
      item.appendChild(document.createTextNode(title));

      this.buttons[name] = item;

      item.addEventListener('click', () => {
        this.itemClicked(name);
      });

      this.nodes.wrapper.appendChild(item);
    });
    return this.nodes.wrapper;
  }

  /**
   * Click handler for togglers
   * @param {string} name - graph name
   */
  itemClicked(name){
    this.modules.chart.togglePath(name);
    this.buttons[name].classList.toggle(Legend.CSS.itemEnabled);

    const checkbox = this.buttons[name].querySelector(`.${Legend.CSS.checkbox}`);

    /**
     * @todo add animation
     */
    if (this.buttons[name].classList.contains(Legend.CSS.itemEnabled)){
      checkbox.style.backgroundColor = this.modules.state.colors[name];
    } else {
      checkbox.style.backgroundColor = 'transparent';
    }
  }
}
