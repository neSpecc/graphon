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

export function round(number) {
  if (number < 100) {
    return Math.floor(number / 10 ) * 10
  } else if (number < 1000){
    return Math.floor(number / 100 ) * 100
  } else if (number < 3000) {
    return Math.floor(number / 200) * 200
  } else if (number < 6000) {
    return Math.floor(number / 600 ) * 600
  } else if (number < 10000) {
    return Math.floor(number / 1000 ) * 1000
  } else if (number < 100000) {
    return Math.floor(number / 30000 ) * 30000
  }
}