let prevValues = {};


export default function log(obj){
  let el = document.getElementById('log');
   Object.assign(prevValues, obj);

   let content = '';

   Object.entries(prevValues).forEach(([key, value]) => {
     content += `${key} ${!isNaN(value) ? value.toFixed(3) : value}   `
   })

  el.innerHTML = content;
}