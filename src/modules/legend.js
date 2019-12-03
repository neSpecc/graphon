import * as Dom from '../utils/dom.js';

export default class Legend {
  /**
   * @param {Graphon} modules
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
      itemWobble: 'tg-legend__item--wobble',
      itemSelected: 'tg-legend__item--selected',
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

      item.appendChild(checkbox);
      item.appendChild(document.createTextNode(title));

      this.buttons[name] = item;

      this._clickPrevented = false;

      item.addEventListener('click', () => {
        if (!this._clickPrevented){
          this.itemClicked(name);
        }
      });

      item.addEventListener('mousedown', () => {
        this.mousedown(name);
      });

      item.addEventListener('touchstart', () => {
        this.mousedown(name);
      });

      item.addEventListener('mouseup', () => {
        this.mouseup(name);
      });

      item.addEventListener('touchend', () => {
        this.mouseup(name);
      });

      this.toggle(name, true);

      this.nodes.wrapper.appendChild(item);
    });
    return this.nodes.wrapper;
  }

  mousedown(name){
    this._timer = setTimeout(() => {
      this._clickPrevented = true;

      this.uncheckAllExceptPassed(name);
    }, 500);
  }

  uncheckAllExceptPassed(exceptName) {
    Object.entries(this.buttons).forEach(([name, el], index) => {
        if (name !== exceptName){
          this.toggle(name, false);

          this.modules.chart.togglePath(name, true);
          this.modules.minimap.togglePath(name, true);
        } else {
          this.toggle(name, true);

          this.modules.chart.togglePath(name, false);
          this.modules.minimap.togglePath(name, false);
        }
    })

  }


  mouseup(name){
    if (!this._timer){
      return;
    }

    setTimeout(() => {
      this._clickPrevented = false;
    }, 400)

    clearTimeout(this._timer);
  }


  /**
   * Click handler for togglers
   * @param {string} name - graph name
   */
  itemClicked(name){
    let isLast = this.modules.state.linesAvailable.filter(line => this.modules.chart.graph.checkPathVisibility(line)).length === 1;

    if (!this.buttons[name].classList.contains(Legend.CSS.itemEnabled)){
      this.toggle(name, true);
    } else {
      if (isLast){
        this.buttons[name].classList.add(Legend.CSS.itemWobble);
        setTimeout(() => {
          this.buttons[name].classList.remove(Legend.CSS.itemWobble);
        }, 300);

        return;
      }

      this.toggle(name, false);
    }

    this.modules.chart.togglePath(name);
    this.modules.minimap.togglePath(name);
  }

  toggle(name, status = true){
    const checkbox = this.buttons[name].querySelector(`.${Legend.CSS.checkbox}`);

    this.buttons[name].classList.toggle(Legend.CSS.itemEnabled, status);

    checkbox.style.backgroundColor = status ? this.modules.state.colors[name] : '#EFEFEF';
  }
}
