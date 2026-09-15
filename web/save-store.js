// Each setItem is the commit boundary. Backup is durable before replacing active.
// A failed write never requires deleting the active record to free space.
export function createSaveStore({storage, locks, key, lockName, validate}) {
  const backupKey=key+'.previous';
  const conflict=()=>Error('La partida cambió en otra pestaña. Recupera la partida guardada.');
  async function checked(raw){if(raw===null)return null;await validate(raw);return raw;}
  async function read(){
    const raw=storage.getItem(key);
    if(raw===null)return null;
    return checked(raw); // Never silently roll back a completed choice.
  }
  async function previous(){return checked(storage.getItem(backupKey));}
  async function write(next, expected){
    const raw=JSON.stringify(next);await checked(raw);
    if(!locks)throw Error('Este navegador no permite bloquear el guardado entre pestañas. Usa Chrome.');
    return locks.request(lockName,async()=>{
      const active=storage.getItem(key);
      if(active===raw)return; // A committed operation whose acknowledgement was lost.
      if(active!==expected)throw conflict();
      if(active!==null){
        // Never overwrite a good recovery copy with corrupt active data.
        let valid=true;try{await checked(active);}catch{valid=false;}
        if(valid)storage.setItem(backupKey,active);
      }
      storage.setItem(key,raw);
    });
  }
  return {read,previous,write,hasPrevious:()=>storage.getItem(backupKey)!==null};
}
