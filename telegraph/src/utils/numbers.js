export function round(number) {
  let zeros = Math.log10(number) >> 0;
  let rounding = Math.pow(10, zeros);

  return Math.round(number / rounding) * rounding;
}

export function roundToMin(number, maxSlicing) {
  let zeros = Math.log10(number) >> 0;
  let rounding = Math.pow(10, zeros);
  let result = Math.floor(number / rounding) * rounding;

  // console.log(number, ' -> zeros', zeros, 'r' , rounding, maxSlicing);

  if (number - result > maxSlicing){
    // let old  =result;
    rounding = Math.pow(10, zeros - 1);
    result = Math.floor(number / rounding) * rounding;
    // console.warn('descreasing', old, result)
  }

  return result;
}

export function beautify(number) {
  if (number < 1000) {
    return number
  } else if (number < 10000){
      let thousands = Math.floor(number / 1000);
      let left = number - thousands * 1000;

      if (left === 0){
        return thousands + ' 000';
      } else if (left >= 100){
        return thousands + ' ' + left;
      } else if (left > 10) {
        return thousands + ' 0' + left;
      } else {
        return thousands + ' 0' + left;
      }
  } else if (number < 1000000) {
      return Math.floor(number / 1000) + 'k';
  } else {
    return Math.floor(number / 1000000) + 'M';
  }
}

/**
 * 1000 -> 1 000
 * @param {number} number
 * @return {string}
 */
export function addSpaces(number) {
  if (isNaN(parseInt(number, 10))){
    return '';
  }

  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}
