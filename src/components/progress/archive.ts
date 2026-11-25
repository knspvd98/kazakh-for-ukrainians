const database="kazakh-course-progress";
let opening:Promise<IDBDatabase>|undefined;
function open() {
  return opening??=new Promise<IDBDatabase>((resolve,reject)=>{
    if(!globalThis.indexedDB){reject(new Error("IndexedDB unavailable"));return;}
    const request=indexedDB.open(database,1);
    request.onupgradeneeded=()=>request.result.createObjectStore("progress");
    request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);
  });
}
export async function loadArchive():Promise<unknown>{
  const db=await open();
  return new Promise((resolve,reject)=>{const r=db.transaction("progress").objectStore("progress").get("current");r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
}
export async function saveArchive(state:unknown):Promise<void>{
  const db=await open();
  return new Promise((resolve,reject)=>{const tx=db.transaction("progress","readwrite");tx.objectStore("progress").put(state,"current");tx.oncomplete=()=>resolve();tx.onabort=()=>reject(tx.error);});
}
