import { useEffect, useState } from "react";
async function send(command:string): Promise<boolean> {
  const registration=await navigator.serviceWorker.ready, worker=registration.active;
  if(!worker)throw new Error("Worker unavailable");
  return new Promise((resolve,reject)=>{
    const channel=new MessageChannel();
    channel.port1.onmessage=e=>{channel.port1.close(); if(e.data.error)reject(new Error("Audio unavailable"));else resolve(e.data.ready);};
    worker.postMessage(command,[channel.port2]);
  });
}
export function OfflineAudio(){
  const [status,set]=useState<"checking"|"available"|"saving"|"ready"|"error">("checking");
  useEffect(()=>{if(import.meta.env.PROD && "serviceWorker" in navigator)send("voice-status").then(ready=>set(ready?"ready":"available")).catch(()=>set("error"));},[]);
  if(!import.meta.env.PROD || !("serviceWorker" in navigator))return null;
  return <section><h2>Аудіо без інтернету</h2><p>Збережи всі озвучення для занять офлайн. Потрібно приблизно 50 МБ на цьому пристрої.</p>
    <button className="secondary" disabled={["saving","ready","checking"].includes(status)} onClick={async()=>{set("saving");try{await send("save-voice");set("ready");}catch{set("error");}}}>
    {status==="ready"?"Аудіо збережено":status==="saving"?"Завантаження…":"Зберегти аудіо"}</button><p role="status">{status==="error"?"Не вдалося зберегти аудіо. Перевір з’єднання й вільне місце та повтори спробу.":""}</p></section>
}
