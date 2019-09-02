/**
 * This class stores the sate of application
 * @todo add cache to all getters
 */
export default class State {
  /**
   * @param {string} chartsData - input data in csv format
   * @param {string[]} colors - colors list for each line
   * @param {string[]} titles - titles list for each line
   * @param {string} type - graph type - line, area, bar
   * @param {string} title - graph title
   * @param {boolean} byMonth - grouped by month
   */
  constructor(chartsData, colors, titles, type, title, byMonth){
    const lines = chartsData.split('\n');

    this.columns = [];
    this.dates = [];
    this.type = type;
    this.title = title;
    this.byMonth = byMonth;

    lines.forEach((line) => {
      let [date, ...values] = line.split(',');

      values.forEach((val, index) => {
        val = parseInt(val, 10);

        if (this.columns[index]){
          this.columns[index].push(val);
        } else {
          this.columns[index] = [val];
        }
      });

      this.dates.push(date);
    });

    this.colors = colors;
    this.names = titles;
    this.isYScaled = false;

    /**
     * Cache
     */
    this._cache = {
      /**
       * @todo maybe array copying worst than slice
       */
      getLinePoints: {},
      dates: this.columns[0],
      daysCount: this.columns[0].length
    };

    this._recalculatedPoints = [];
  }

  /**
   * Column with dates is 0-index column, so shift it
   * First element in arrays is column name ("x") so slice it
   * @return {number[]} - array of dates in milliseconds
   */
  // get dates(){
  //   return this._cache.dates;
  // }

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

    this._cache.getLinePoints[lineName] = this.getColumnByName(lineName);


    return this._cache.getLinePoints[lineName];
  }

  /**
   * Return column by name
   * @param {string} name - "y0", "y1" etc
   * @return {array}
   */
  getColumnByName(name){
    return this.columns[name];
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
    return this.type;
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

  /**
   * Return a stack value for each point
   */
  getStacks(){
    if (this._cache.stacks){
      return this._cache.stacks;
    }

    let from = 0;
    let to = this.daysCount;
    let stacks = [];

    for (let pointIndex = from; pointIndex < to; pointIndex++){
      let stackValue = this.getStackForPoint(pointIndex);

      stacks.push(stackValue);
    }

    this._cache.stacks = stacks;

    return this._cache.stacks;
  }

  /**
   * Return accumulated stack value for point
   * @param {number} pointIndex
   * @param {string[]} skipLines - line numbers to skip (it may be hidden)
   * @return {number}
   */
  getStackForPoint(pointIndex, skipLines = []){
    let stackValue = 0;

    this.linesAvailable.forEach(line => {
      if (skipLines.includes(line)){
        return;
      }

      stackValue += this.getLinePoints(line)[pointIndex];
    });

    return stackValue;
  }

  /**
   *
   * @param from
   * @param to
   * @param {string[]} skipLines - line numbers to skip (it may be hidden)
   * @return {number}
   */
  getMaximumAccumulatedByColumns(from = 0, to = this.daysCount, skipLines = []){
    let max = 0;

    for (let pointIndex = from; pointIndex < to; pointIndex++){
      let stackValue = this.getStackForPoint(pointIndex, skipLines);

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
   * Return maximum value for passed line
   * @return {number}
   */
  maxForLine(name){
    return Math.max(...this.getLinePoints(name));
  }

  /**
   * Return minimum value from all charts
   * @return {number}
   */
  get min(){
    const minPerLines = this.linesAvailable.map( name => {
      return Math.min(...this.getLinePoints(name));
    });

    return Math.min(...minPerLines);
  }

  /**
   * Return minimum value for passed line
   * @return {number}
   */
  minForLine(name){
    return Math.min(...this.getLinePoints(name));
  }

  /**
   * Return max value for line with start point and next N visible
   */
  getMaxForLineSliced(line, leftPointIndex, pointsVisible){
    return Math.max(...this.getPointsSlice(line, leftPointIndex, pointsVisible));
  }

  /**
   * Return min value for line with start point and next N visible
   */
  getMinForLineSliced(line, leftPointIndex, pointsVisible){
    return Math.min(...this.getPointsSlice(line, leftPointIndex, pointsVisible));
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

  /**
   * Stores previously calculated values to prevent do the same both for chart and for mini map
   * @type {Array}
   */
  saveRecalculatedValues(values){
    this._recalculatedPoints.push(values);
  }

  /**
   * Dealloc used values
   * @type {Array}
   */
  clearRecalculatedValues(){
    this._recalculatedPoints = [];
  }

  get recalculatedValues(){
    return this._recalculatedPoints;
  }

}