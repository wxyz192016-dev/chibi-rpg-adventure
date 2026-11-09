const KEY="wuxia_jianghu_rpg_v1";
export function saveGame(state){localStorage.setItem(KEY,JSON.stringify(state));return true;}
export function loadGame(){try{const raw=localStorage.getItem(KEY);return raw?JSON.parse(raw):null;}catch{return null;}}
export function exportGame(state){const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="wuxia-jianghu-save.json";a.click();URL.revokeObjectURL(a.href);}
export function importGame(file){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>{try{const s=JSON.parse(reader.result);if(!s.player||!s.version)throw new Error("存檔格式不正確");resolve(s);}catch(e){reject(e);}};reader.onerror=()=>reject(new Error("無法讀取檔案"));reader.readAsText(file);});}
