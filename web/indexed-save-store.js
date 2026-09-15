// One IndexedDB record contains the active save, recovery save and migration baseline.
// Validation and SHA-256 run before opening a write transaction, never between requests.
export function createIndexedSaveStore({storage, indexedDB, key, validate, fault=()=>{}}) {
  const dbName='multihistoria.saves.v1';
  let dbPromise=null, backupAvailable=false;
  const conflict=()=>Error('La partida cambió en otra pestaña. Recupera la partida guardada.');
  async function digest(raw){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(raw))),b=>b.toString(16).padStart(2,'0')).join('');}
  async function wrap(raw){return raw===null?null:{raw,sha256:await digest(raw)};}
  async function checked(item){
    if(item===null)return null;
    if(!item||typeof item.raw!=='string'||item.sha256!==await digest(item.raw))throw Error('La integridad de esta copia no es válida. Usa una copia anterior o una exportación.');
    await validate(item.raw);return item.raw;
  }
  async function open(){
    if(!indexedDB)throw Error('IndexedDB no está disponible. La partida antigua se conserva.');
    if(!dbPromise)dbPromise=new Promise((resolve,reject)=>{
      const req=indexedDB.open(dbName,1);let rejected=false;
      req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains('saves'))req.result.createObjectStore('saves');};
      req.onblocked=()=>{rejected=true;dbPromise=null;reject(Error('Cierra las otras pestañas del juego y vuelve a abrirlo para actualizar el guardado.'));};
      req.onerror=()=>{dbPromise=null;reject(req.error);};
      req.onsuccess=()=>{const db=req.result;if(rejected){db.close();return;}db.onversionchange=()=>{db.close();dbPromise=null;};resolve(db);};
    });
    return dbPromise;
  }
  async function record(){
    const db=await open();return new Promise((resolve,reject)=>{
      const tx=db.transaction('saves','readonly'),req=tx.objectStore('saves').get(key);let value;
      req.onsuccess=()=>value=req.result??null;
      tx.oncomplete=()=>{if(value&&(value.version!==1||!Number.isSafeInteger(value.generation)||value.generation<0)){reject(Error('Versión del almacén no compatible. La copia se conserva.'));return;}backupAvailable=!!value?.previous;resolve(value);};
      tx.onabort=()=>reject(tx.error||Error('No se pudo leer la partida.'));
    });
  }
  async function exchange(old,next){
    const db=await open();return new Promise((resolve,reject)=>{
      let failure=null;
      const tx=db.transaction('saves','readwrite',{durability:'strict'}),store=tx.objectStore('saves'),req=store.get(key);
      const abort=e=>{failure=e;try{tx.abort();}catch{}};
      tx.onabort=()=>reject(failure||tx.error||Error('Guardado interrumpido. La última partida confirmada se conserva.'));
      tx.oncomplete=()=>{backupAvailable=!!next.previous;try{fault('after-complete',tx);resolve();}catch(e){reject(e);}};
      req.onsuccess=()=>{
        try{
          if(JSON.stringify(req.result??null)!==JSON.stringify(old))throw conflict();
          fault('before-put',tx);
          const put=store.put(next,key);
          fault('after-put-queued',tx);
          put.onsuccess=()=>{try{fault('after-put-success',tx);}catch(e){abort(e);}};
        }catch(e){abort(e);}
      };
    });
  }
  async function ensure(){
    let current=await record();if(current)return current;
    // Legacy bytes are copied, never changed or deleted, even if corrupt.
    const legacy=storage.getItem(key),previous=storage.getItem(key+'.previous');
    let recovery=null;if(previous!==null){try{await validate(previous);recovery=await wrap(previous);}catch{}}
    const initial={version:1,generation:0,active:await wrap(legacy),previous:recovery,legacy};
    try{await exchange(null,initial);}catch(e){current=await record();if(!current)throw e;return current;}
    return initial;
  }
  async function readRaw(){return (await ensure()).active?.raw??null;}
  async function read(){const r=await ensure();return checked(r.active);}
  async function previous(){return checked((await ensure()).previous);}
  async function write(next,expected){
    const raw=JSON.stringify(next);await validate(raw);const packed=await wrap(raw),current=await ensure();
    if(current.active?.raw===raw&&current.active?.sha256===packed.sha256){await checked(current.active);return;}
    if((current.active?.raw??null)!==expected)throw conflict();
    let previous=current.previous;
    try{await checked(current.active);if(current.active)previous=current.active;}catch{}
    await exchange(current,{...current,generation:current.generation+1,active:packed,previous});
  }
  async function legacyChanged(){const r=await ensure();return storage.getItem(key)!==r.legacy;}
  async function close(){if(dbPromise){const db=await dbPromise;db.close();dbPromise=null;}}
  return {read,readRaw,previous,write,hasPrevious:()=>backupAvailable,legacyChanged,legacyRaw:()=>storage.getItem(key),close};
}
