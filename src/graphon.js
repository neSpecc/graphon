import Styles from './styles/index.pcss';

import State from './modules/state';
import Minimap from './modules/minimap.js';
import Chart from './modules/chart.js';
import Legend from './modules/legend.js';
import Header from './modules/header.js';

export default class Graphon {
  /**
   * Main entry constructor
   * @param {string} holderId - where to append a Chart
   * @param {string} data - chart data in csv format
   * @param {string} dataByMonth - chart data grouped by months in csv format
   * @param {string} type - graph type. Available types: 'line', 'area', 'bar'
   * @param {string[]} colors - colors list for each line
   * @param {string[]} titles - titles list for each line
   * @param {string} title - Graph title
   * @param {boolean} byMonth - is graphs represents data grouped by month
   */
  constructor({holderId, data, dataByMonth, colors, titles, type, title, byMonth}) {
    this.holder = document.getElementById(holderId);

    /**
     * Append <style> with all styles
     */
    this.loadStyles();

    /**
     * Save input params to allow to recreate State object
     */
    this.data = data;
    this.dataByMonth = dataByMonth;
    this.colors = colors;
    this.type = type;
    this.title = title;
    this.titles = titles;
    this.byMonth = byMonth;

    this.createState();

    /**
     * Module for mini map
     */
    this.minimap = new Minimap(this);

    /**
     * Working with main chart zone
     */
    this.chart = new Chart(this);

    /**
     * Working with legend items
     */
    this.legend = new Legend(this);

    /**
     * Header module
     */
    this.header = new Header(this);

    /**
     * Create base UI elements
     */
    this.prepareUi();

    /**
     * Render chart and mini map
     */
    this.chart.renderCharts();
    this.minimap.renderMap();

    // console.timeEnd('telegraph');
  }

  /**
   * CSS classes map
   * @return {{nightModeEnabled: string}}
   */
  static get CSS(){
    return {
      nightModeEnabled : 'tg--night-mode'
    }
  }

  /**
   * Create an object with all graphs data
   * @param {string} dataStoringProperty - name of field that stores input data in csv
   */
  createState(dataStoringProperty = 'data'){
    /**
     * Module that stores all main app state values
     */
    if (dataStoringProperty === 'dataByMonth'){
      this.byMonth = true;
    }

    this.state = new State(this[dataStoringProperty], this.colors, this.titles, this.type, this.title, this.byMonth);
  }

  /**
   * Load styles and append it via <style id="specc-graph-styles"> tag
   */
  loadStyles(){
    const styleIdentifier = 'specc-graph-styles';
    const styleExists = document.getElementById(styleIdentifier);

    if (styleExists){
      return;
    }

    const style = document.createElement('style');
    const head = document.querySelector('head');

    style.id = styleIdentifier;
    style.textContent = Styles;

    head.appendChild(style);
  }

  /**
   * Create base app UI
   */
  prepareUi(){
    this.holder.appendChild(this.header.render());
    this.holder.appendChild(this.chart.renderUi());
    this.holder.appendChild(this.minimap.renderUi());
    this.holder.appendChild(this.legend.render());
  }

  /**
   * @public
   * Toggles night mode
   */
  toggleNightMode(){
    this.holder.classList.toggle(Graphon.CSS.nightModeEnabled);
  }
}