import * as Dom from "../utils/dom";

export default class Header {
  constructor(modules){
    this.modules = modules;
    this.nodes = {
      wrapper: undefined,
      title: undefined,
      dates: undefined,
      typeSwitchers: [],
      detailsTogglers: [],
    };

  }

  /**
   * @return {{wrapper: string, title: string, dates: string, typeSwitcher: string, typeSwitcherCurrent: string, detailsToggler: string, detailsTogglerItem: string, detailsTogglerItemCurrent: string}}
   */
  static get CSS(){
    return {
      wrapper: 'tg-header',
      title: 'tg-header__title',
      dates: 'tg-header__dates',
      typeSwitcher: 'tg-header__type-switcher',
      typeSwitcherCurrent: 'tg-header__type-switcher--current',
      detailsToggler: 'tg-header__details',
      detailsTogglerItem: 'tg-header__details-item',
      detailsTogglerItemCurrent: 'tg-header__details-item--current',
    }
  }

  render(){
    this.nodes.wrapper = Dom.make('div', Header.CSS.wrapper);
    this.nodes.title = Dom.make('div', Header.CSS.title);
    this.nodes.dates = Dom.make('div', Header.CSS.dates);

    this.nodes.title.textContent = this.modules.state.title || 'Untitled';
    this.nodes.wrapper.appendChild(this.nodes.title);

    if (this.modules.dataByMonth){
      this.appendDetailsToggler();
    }

    [
      {
        type: 'line',
        icon: `<svg width="17" height="9" xmlns="http://www.w3.org/2000/svg" style="margin: auto -2px;">
                <path d="M13.638 4.28l-1.566 1.5c.147.294.23.623.23.97 0 1.243-1.053 2.25-2.35 2.25-1.298 0-2.35-1.007-2.35-2.25 0-.094.006-.187.018-.278L5.317 5.37c-.422.39-.997.63-1.63.63-.302 0-.59-.054-.854-.153L1 8 0 7l1.717-2.023a2.172 2.172 0 0 1-.38-1.227c0-1.243 1.052-2.25 2.35-2.25 1.297 0 2.349 1.007 2.349 2.25 0 .094-.006.187-.018.278L8.321 5.13c.422-.39.997-.63 1.63-.63.363 0 .707.079 1.014.22l1.565-1.5a2.163 2.163 0 0 1-.229-.97c0-1.243 1.052-2.25 2.35-2.25C15.948 0 17 1.007 17 2.25S15.948 4.5 14.65 4.5c-.362 0-.706-.079-1.012-.22zm-9.952.22c.433 0 .784-.336.784-.75S4.119 3 3.686 3c-.432 0-.783.336-.783.75s.35.75.783.75zm6.266 3c.432 0 .783-.336.783-.75S10.385 6 9.952 6c-.433 0-.784.336-.784.75s.351.75.784.75zM14.65 3c.432 0 .783-.336.783-.75s-.35-.75-.783-.75c-.433 0-.784.336-.784.75s.351.75.784.75z"/>
              </svg>`
      },
      {
        type: 'area',
        icon: `<svg width="15" height="13" xmlns="http://www.w3.org/2000/svg" style="margin: auto -1px;">
                <path d="M15 7.952L6.032 9.233 3.765 6.21 0 8.36V5.382l3.557-2.371 4.884 3.488L15 4.531v3.42zm0 1.443v1.462a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-.85l3.378-1.931 2.019 2.69L15 9.396zm0-6.355L8.702 4.93 3.585 1.274 0 3.665V2a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v1.04z"/>
              </svg>`
      },
      {
        type: 'bar',
        icon: `<svg width="14" height="13" xmlns="http://www.w3.org/2000/svg">
                <rect y="7" width="2" height="6" rx="1"/>
                <rect x="12" y="6" width="2" height="7" rx="1"/>
                <rect x="4" y="4" width="2" height="9" rx="1"/>
                <rect x="8" width="2" height="13" rx="1"/>
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

  /**
   * Create Day|Month toggler
   */
  appendDetailsToggler(){
    const toggler = Dom.make('span', Header.CSS.detailsToggler);

    [
      {
        title: 'Day',
        dataStoringProperty: 'data'
      },
      {
        title: 'Month',
        dataStoringProperty: 'dataByMonth'
      }
    ].forEach(({title, dataStoringProperty}, index) => {
      const togglerItem = Dom.make('span', Header.CSS.detailsTogglerItem);

      if (index === 0) {
        togglerItem.classList.add(Header.CSS.detailsTogglerItemCurrent);
      }

      togglerItem.innerHTML = title;
      togglerItem.addEventListener('click', () => {
        this.detailsTogglerClicked(dataStoringProperty, togglerItem);
      });
      toggler.appendChild(togglerItem);

      this.nodes.detailsTogglers.push(togglerItem);
    });

    this.nodes.wrapper.appendChild(toggler);
  }

  typeSwitcherClicked(type, switcher){
    this.modules.state.type = type;
    this.modules.state.clearRecalculatedValues();
    this.modules.chart.destroy();
    this.modules.chart.renderCharts();
    this.modules.minimap.renderMap();
    this.modules.minimap.syncScrollWithChart();

    this.nodes.typeSwitchers.forEach(el => el.classList.remove(Header.CSS.typeSwitcherCurrent));

    switcher.classList.add(Header.CSS.typeSwitcherCurrent);
  }

  detailsTogglerClicked(dataStoringProperty, toggler){
    this.modules.createState(dataStoringProperty);

    this.modules.chart.destroy();
    this.modules.chart.renderCharts();
    this.modules.minimap.renderMap();
    this.modules.minimap.syncScrollWithChart();

    this.nodes.detailsTogglers.forEach(el => el.classList.remove(Header.CSS.detailsTogglerItemCurrent));

    toggler.classList.add(Header.CSS.detailsTogglerItemCurrent);
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