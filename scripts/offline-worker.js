/* global self, caches */
const files="__SHELL__", packs="__VOICE__";
const prefix="kazakh-course:"+new URL(self.registration.scope).pathname+":";
const shell=prefix+"shell:"+"__SHELL_VERSION__", audio=prefix+"voice:"+"__VOICE_VERSION__";
const absolute=entry=>new URL(entry,self.registration.scope).href;
const completed=absolute("offline/voice-complete");
self.addEventListener("install",event=>event.waitUntil(caches.open(shell).then(cache=>cache.addAll(files.map(absolute)))));
self.addEventListener("activate",event=>event.waitUntil((async()=>{
  for(const name of await caches.keys()) if(name.startsWith(prefix)&&name!==shell&&name!==audio) await caches.delete(name);
  await self.clients.claim();
})()));
self.addEventListener("fetch",event=>{
  const request=event.request;
  if(request.method!=="GET" || !request.url.startsWith(self.registration.scope))return;
  const url=new URL(request.url);
  if (url.pathname.includes("/api/")) return;
  event.respondWith((async()=>{
    const cache=await caches.open(shell);
    if(request.mode==="navigate") return (await cache.match(absolute("index.html")))||fetch(request);
    if(url.pathname.endsWith(".mp3")){
      const voices=await caches.open(audio);
      const saved=await voices.match(request.url);
      if(saved){
        const range=request.headers.get("range");
        if(!range)return saved;
        const bytes=await saved.blob();
        const match=/^bytes=(\d*)-(\d*)$/.exec(range);
        if(!match||!(match[1]||match[2]))return new Response(null,{status:416,headers:{"Content-Range":"bytes */"+bytes.size}});
        const first=match[1]?Number(match[1]):Math.max(0,bytes.size-Number(match[2]));
        const last=match[1]&&match[2]?Math.min(bytes.size-1,Number(match[2])):bytes.size-1;
        if(first>last||first>=bytes.size)return new Response(null,{status:416,headers:{"Content-Range":"bytes */"+bytes.size}});
        return new Response(bytes.slice(first,last+1),{status:206,headers:{"Content-Type":"audio/mpeg","Accept-Ranges":"bytes","Content-Range":"bytes "+first+"-"+last+"/"+bytes.size,"Content-Length":String(last-first+1)}});
      }
      const response=await fetch(request);
      if(response.status===200) await voices.put(request.url,response.clone()).catch(()=>{});
      return response;
    }
    return (await cache.match(request, { ignoreVary: true }))||fetch(request);
  })());
});
let saving;
async function downloadAudio(){
  const cache=await caches.open(audio);
  for(const pack of packs){
    const stamp=absolute(pack.name+"?saved");
    if(await cache.match(stamp))continue;
    const response=await fetch(absolute(pack.name));
    if(!response.ok)throw Error("Audio pack unavailable");
    const bytes=await response.blob();
    const last=pack.entries[pack.entries.length-1];
    if(bytes.size!==last[1]+last[2])throw Error("Incomplete audio pack");
    for(const [file,start,length] of pack.entries) await cache.put(absolute(file),new Response(bytes.slice(start,start+length),{headers:{"Content-Type":"audio/mpeg","Content-Length":String(length)}}));
    await cache.put(stamp,new Response("1"));
  }
  await cache.put(completed,new Response("1"));
}
self.addEventListener("message",event=>{
  if(!event.ports.length)return;
  const port=event.ports[0];
  event.waitUntil((async()=>{
    try{
      if(event.data==="save-voice"){saving??=downloadAudio().finally(()=>{saving=undefined});await saving;}
      const ready=!!await (await caches.open(audio)).match(completed);port.postMessage({ready});
    }catch{port.postMessage({error:true})}
  })());
});
