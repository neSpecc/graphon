import State from './modules/state';
import Minimap from './modules/minimap.js';
import Chart from './modules/chart.js';
import Legend from './modules/legend.js';
import Header from './modules/header.js';

/**
 * @typedef {object} ChartData
 */

export default class Telegraph {
  /**
   * Main entry constructor
   * @param {string} holderId - where to append a Chart
   * @param {string} data - chart data in csv format
   * @param {string} type - graph type. Available types: 'line', 'area', 'bar'
   * @param {string[]} colors - colors list for each line
   * @param {string[]} titles - titles list for each line
   * @param {string} title - Graph title
   * @param {boolean} byMonth - is graphs represents data grouped by month
   */
  constructor({holderId, data, colors, titles, type, title, byMonth}) {
    this.holder = document.getElementById(holderId);

    /**
     * Module that stores all main app state values
     */
    this.state = new State(data, colors, titles, type, title, byMonth);

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
    this.holder.classList.toggle(Telegraph.CSS.nightModeEnabled);
  }
}