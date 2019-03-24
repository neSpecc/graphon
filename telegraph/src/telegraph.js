import State from './modules/state';
import Minimap from './modules/minimap.js';
import Chart from './modules/chart.js';
import Legend from './modules/legend.js';

/**
 * @typedef {object} ChartData
 * @property {array} columns – List of all data columns in the chart.
 *                             0 - position ("x", "y0", "y1")
 *                             1+ - values
 *                             "x" values are UNIX timestamps in milliseconds.
 * @property {{x, y0, y1}} types – Chart types for each of the columns.
 *                                 Supported values:
 *                                 "line" (line on the graph with linear interpolation),
 *                                 "x" (x axis values for each of the charts at the corresponding positions).
 * @property {{y0: string, y1: string}} colors – Color for each line in 6-hex-digit format (e.g. "#AAAAAA").
 * @property {{y0: string, y1: string}} names – Names for each line.
 */

export default class Telegraph {
  /**
   * Main entry constructor
   * @param {string} holderId - where to append a Chart
   * @param {ChartData} inputData - chart data
   */
  constructor({holderId, inputData}){
    this.holder = document.getElementById(holderId);

    /**
     * Module that stores all main app state values
     */
    this.state = new State(inputData);

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
     * Create base UI elements
     */
    this.prepareUi();

    /**
     * Render chart and minimap
     */
    this.chart.renderCharts();
    this.minimap.renderMap()
  }

  /**
   * Create base app UI
   */
  prepareUi(){
    this.holder.appendChild(this.chart.renderUi());
    this.holder.appendChild(this.minimap.renderUi());
    this.holder.appendChild(this.legend.render());
  }
}