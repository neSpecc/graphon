/**
 * Invoke a function with debounce
 * @param {function} func - callback
 * @param {number} wait - how many second should be awaited before calling a callback
 * @param {boolean} immediate - pass true to call immediately
 * @return {Function}
 */
export default function debounce(func, wait, immediate) {
  var timeout;
  return function() {
    var context = this, args = arguments;
    var later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};