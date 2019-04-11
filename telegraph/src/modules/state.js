/**
 * This class stores the sate of application
 * @todo add cache to all getters
 */
export default class State {
  /**
   * @param {ChartData} chartsData - input data
   */
  constructor(chartsData){
    this.columns = chartsData.columns;
    this.colors = chartsData.colors;
    this.names = chartsData.names;
    this.types = chartsData.types;

    /**
     * Cache
     */
    this._cache = {
      /**
       * @todo maybe array copying worst than slice
       */
      getLinePoints: {},
      dates: this.columns[0].slice(1),
      daysCount: this.columns[0].slice(1).length
    };
  }

  /**
   * Column with dates is 0-index column, so shift it
   * First element in arrays is column name ("x") so slice it
   * @return {number[]} - array of dates in milliseconds
   */
  get dates(){
    return this._cache.dates;
  }

  /**
   * Return available line names
   * @return {string[]} - array of graph names
   */
  get linesAvailable(){
    return Object.keys(this.names);
  }

  /**
   * Returns numbers of days at the input data
   * @return {number}
   */
  get daysCount(){
    return this._cache.daysCount;
  }

  /**
   * Returns values of line by line name
   * @param {string} lineName - "y0", "y1" etc
   * @return {number[]}
   */
  getLinePoints(lineName){
    if (this._cache.getLinePoints[lineName]){
      return this._cache.getLinePoints[lineName];
    }

    this._cache.getLinePoints[lineName] = this.getColumnByName(lineName).slice(1); // slice 0-element because it is a column name


    return this._cache.getLinePoints[lineName];
  }

  /**
   * Return column by name
   * @param {string} name - "y0", "y1" etc
   * @return {array}
   */
  getColumnByName(name){
    return this.columns[this.columns.findIndex(column => column[0] === name)];
  }

  /**
   * Return N points from passed position
   * @param {string} lineName - "y0", "y1", ...etc
   * @param {number} from - start position
   * @param {number} count - how many items requested
   * @return {number[]}
   */
  getPointsSlice(lineName, from, count){
    return this.getLinePoints(lineName).slice(from, from + count);
  }

  /**
   * Returns color of line by line name
   * @param {string} lineName - "y0", "y1" etc
   * @return {string} - hex color like "#333333"
   */
  getLineColor(lineName){
    return this.colors[lineName];
  }

  /**
   * Returns chart type by name
   * @param {string} chartName - "y0", "y1" etc
   * @return {string} - "line", "bar", "area"
   */
  getChartType(chartName){
    return this.types[chartName];
  }

  /**
   * Detect type of charts
   * @return {string}
   */
  getCommonChartsType(){
    return Object.values(this.types)[0];
  }

  /**
   * Return value of same point of previous chart
   * @param currentChartNumber
   * @param pointIndex
   */
  getPrevChartValueForPoint(currentChartNumber, pointIndex){
    let prevChartKey = this.linesAvailable[currentChartNumber - 1];
    return this.getLinePoints(prevChartKey)[pointIndex];
  }

  getMaximumAccumulatedByColumns(from = 0, to = this.daysCount){
    let max = 0;

    for (let pointIndex = from; pointIndex < to; pointIndex++){
      let stackValue = 0;

      this.linesAvailable.forEach(line => {
        stackValue += this.getLinePoints(line)[pointIndex];
      });

      if (max < stackValue){
        max = stackValue;
      }
    }

    return max;
  }

  /**
   * Returns chart type by name
   * @param {string} chartName - "y0", "y1" etc
   * @return {string} - "line", "bar", "area"
   */
  getOhterTypes(chartName){
    return Object.keys(this.types).filter(type => type !== chartName);
  }

  /**
   * Return maximum value from all charts
   * @return {number}
   */
  get max(){
    const maxPerLines = this.linesAvailable.map( name => {
      return Math.max(...this.getLinePoints(name));
    });

    return Math.max(...maxPerLines);
  }

  /**
   * Array of available colors
   * @return {string[]}
   */
  get colorsList(){
    return Object.entries(this.colors).map(([name, value]) => value);
  }

  /**
   * Array of available chart names
   * @return {string[]}
   */
  get namesList(){
    return Object.entries(this.names).map(([name, value]) => value);
  }
}