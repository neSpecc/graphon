let prevValues = {};


export default function log(obj){
  let el = document.getElementById('log');
   Object.assign(prevValues, obj);

   Object.entries(prevValues).forEach(([key, value]) => {
      el.innerHTML = `${key} ${value.toFixed(3)}   `
   })
}