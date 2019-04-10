let prevValues = {};


export default function log(obj){
  let el = document.getElementById('log');
   Object.assign(prevValues, obj);

   let content = '';

   Object.entries(prevValues).forEach(([key, value]) => {
     content += `${key} ${value.toFixed(3)}   `
   })

  el.innerHTML = content;
}