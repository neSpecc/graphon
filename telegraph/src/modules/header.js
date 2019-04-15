import * as Dom from "../utils/dom";

export default class Header {
  constructor(){
    this.nodes = {
      wrapper: undefined,
      title: undefined,
      dates: undefined,
    };

  }

  static get CSS(){
    return {
      wrapper: 'tg-header',
      title: 'tg-header__title',
      dates: 'tg-header__dates',
    }
  }

  render(){
    this.nodes.wrapper = Dom.make('div', Header.CSS.wrapper);
    this.nodes.title = Dom.make('div', Header.CSS.title);
    this.nodes.dates = Dom.make('div', Header.CSS.dates);

    this.nodes.title.textContent = 'Messages';

    this.nodes.wrapper.appendChild(this.nodes.title);
    this.nodes.wrapper.appendChild(this.nodes.dates);

    return this.nodes.wrapper
  }

  setPeriod(leftDateTimestamp, rightDateTimestamp){
    this._sd = setTimeout(() => {
      let leftDate = (new Date(leftDateTimestamp)).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
      let rightDate = (new Date(rightDateTimestamp)).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });

      this.nodes.dates.innerHTML = `${leftDate} - ${rightDate}`;

    }, 20)
  }
}