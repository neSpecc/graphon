/**
 * Create HTML element
 * @param {string} tagName - HTML element tag name
 * @param {string[]|string} classNames - array of CSS classes
 * @param attributes - any attributes
 * @return {HTMLElement}
 */
export function make(tagName, classNames = undefined, attributes = {}) {
  const svgNamespace = 'http://www.w3.org/2000/svg';
  const svgElements = ['svg', 'path', 'rect', 'circle', 'text', 'g', 'animate'];
  const isSvg = svgElements.includes(tagName);
  const el = !isSvg ? document.createElement(tagName) : document.createElementNS(svgNamespace, tagName);

  if (Array.isArray(classNames) && classNames.length) {
    el.classList.add(...classNames);
  } else if (classNames) {
    el.className = classNames;
  }

  if (attributes && Object.keys(attributes).length) {
    for (let attrName in attributes) {
      if (attributes.hasOwnProperty(attrName)) {
        el.setAttribute(attrName, attributes[attrName]);
      }
    }
  }

  return el;
}

/**
 * Inserts one element after another
 */
export function insertAfter(target, element) {
  target.parentNode.insertBefore(element, target.nextSibling);
}

/**
 * Insert one element before another
 */
export function insertBefore(target, element) {
  target.parentNode.insertBefore(element, target);
}

export function animateCounter(holder, val, prevVal, animateType = 'default'){
  let prev = make('span', ['counter-prev', animateType]);
  let cur = make('span', ['counter-cur', animateType]);

  holder.style.width = val.length * 7 + 'px';

  prev.textContent = prevVal;
  cur.textContent = val;

  holder.innerHTML = '';
  holder.appendChild(prev);

  holder.appendChild(cur);

}