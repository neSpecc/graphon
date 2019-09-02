/**
 * Return pageX for passed Event
 * @param {MouseEvent|TouchEvent} event
 */
export function getPageX(event) {
  if (event.touches){
    return event.touches[0].pageX;
  }

  return event.pageX;
}