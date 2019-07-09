import * as Dom from "../utils/dom";

export default class Header {
  constructor(modules){
    this.modules = modules;
    this.nodes = {
      wrapper: undefined,
      title: undefined,
      dates: undefined,
      typeSwitchers: []
    };

  }

  static get CSS(){
    return {
      wrapper: 'tg-header',
      title: 'tg-header__title',
      dates: 'tg-header__dates',
      typeSwitcher: 'tg-header__type-switcher',
      typeSwitcherCurrent: 'tg-header__type-switcher--current',
    }
  }

  render(){
    this.nodes.wrapper = Dom.make('div', Header.CSS.wrapper);
    this.nodes.title = Dom.make('div', Header.CSS.title);
    this.nodes.dates = Dom.make('div', Header.CSS.dates);

    this.nodes.title.textContent = this.modules.state.title || 'Untitled';
    this.nodes.wrapper.appendChild(this.nodes.title);

    [
      {
        type: 'line',
        icon: `<svg width="22" height="16" xmlns="http://www.w3.org/2000/svg">
                <g fill="none" fill-rule="evenodd">
                  <rect stroke="#979797" fill="#D8D8D8" x=".5" y="14.5" width="21" height="1" rx=".5"/>
                  <path d="M17.707 5.708l-2 1.999a3 3 0 1 1-5.685.923l-2.94-1.47A2.99 2.99 0 0 1 5 8c-.463 0-.902-.105-1.293-.292l-2 2L.293 8.292l2-2a3 3 0 1 1 5.685-.923l2.94 1.47A2.99 2.99 0 0 1 13 6c.463 0 .902.105 1.293.292l2-1.999a3 3 0 1 1 1.414 1.414zM5 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm8 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm6-6a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" fill="#979797" fill-rule="nonzero"/>
                </g>
              </svg>`
      },
      {
        type: 'area',
        icon: `<svg width="21" height="18" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 11.133L8.445 12.926 5.27 8.694 0 11.705v-4.17l4.98-3.32 6.838 4.884L21 6.344v4.789zm0 2.02V16a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-1.991l4.73-2.703 2.825 3.768L21 13.153zm0-8.897l-8.818 2.645L5.02 1.785 0 5.131V2a2 2 0 0 1 2-2h17a2 2 0 0 1 2 2v2.256z" fill="#979797" fill-rule="evenodd"/>
              </svg>`
      },
      {
        type: 'bar',
        icon: `<svg width="19" height="18" xmlns="http://www.w3.org/2000/svg">
                <g fill="#979797" fill-rule="evenodd">
                  <rect y="10" width="3" height="8" rx="1.5"/>
                  <path d="M15 9v6h-3V9h3zm0-1h-3V1.5a1.5 1.5 0 0 1 3 0V8zm0 8v.5a1.5 1.5 0 0 1-3 0V16h3z"/>
                  <rect x="16" y="9" width="3" height="9" rx="1.5"/>
                  <path d="M7 10v4H4v-4h3zm0-1H4V6.5a1.5 1.5 0 0 1 3 0V9zm0 6v1.5a1.5 1.5 0 0 1-3 0V15h3zM11 14H8V7h3v7zm0 1v1.5a1.5 1.5 0 0 1-3 0V15h3zm0-9H8V1.5a1.5 1.5 0 0 1 3 0V6z"/>
                </g>
              </svg>`,
      },
    ].forEach(({type, icon}) => {
      const switcher = Dom.make('span', Header.CSS.typeSwitcher);

      if (type === this.modules.state.type){
        switcher.classList.add(Header.CSS.typeSwitcherCurrent);
      }

      switcher.innerHTML = icon;
      switcher.addEventListener('click', () => {
        this.typeSwitcherClicked(type, switcher);
      });

      this.nodes.typeSwitchers.push(switcher);

      this.nodes.wrapper.appendChild(switcher);
    });


    this.nodes.wrapper.appendChild(this.nodes.dates);

    return this.nodes.wrapper
  }

  typeSwitcherClicked(type, switcher){
    this.modules.state.type = type;
    this.modules.chart.destroy();
    this.modules.chart.renderCharts();
    this.modules.minimap.renderMap();
    this.modules.minimap.syncScrollWithChart();

    this.nodes.typeSwitchers.forEach(el => el.classList.remove(Header.CSS.typeSwitcherCurrent));

    switcher.classList.add(Header.CSS.typeSwitcherCurrent);
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