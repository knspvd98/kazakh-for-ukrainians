import { createHash } from "node:crypto";
import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const out = path.resolve("dist");
const relative = file => path.relative(out, file).split(path.sep).join("/");
async function filesIn(dir) {
  const result = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...await filesIn(file));
    else result.push(file);
  }
  return result.sort();
}
const files = (await filesIn(out)).filter(f => !relative(f).startsWith("offline/") && relative(f) !== "sw.js");
const shell = files.filter(f => !f.endsWith(".mp3"));
const sum = createHash("sha256");
for (const f of shell) sum.update(relative(f)).update(await readFile(f));
const shellVersion = sum.digest("hex").slice(0,16);
const audioDir = path.join(out,"offline");
await mkdir(audioDir,{recursive:true});
let buffers=[], entries=[], size=0, groups=[];
async function flush() {
  if (!entries.length) return;
  const blob=Buffer.concat(buffers), digest=createHash("sha256").update(blob).digest("hex").slice(0,16);
  const name="offline/voice-"+digest+".bin";
  await writeFile(path.join(out,name),blob);
  groups.push({name,entries}); buffers=[];entries=[];size=0;
}
for (const file of files.filter(f=>f.endsWith(".mp3"))) {
  const bytes=await readFile(file);
  if (size+bytes.length>3*1024*1024) await flush();
  entries.push([relative(file),size,bytes.length]);buffers.push(bytes);size+=bytes.length;
}
await flush();
const voiceVersion=createHash("sha256").update(JSON.stringify(groups)).digest("hex").slice(0,16);
const source=await readFile("scripts/offline-worker.js","utf8");
await writeFile(path.join(out,"sw.js"),source.replace('"__SHELL__"',JSON.stringify(shell.map(relative)))
  .replace('"__SHELL_VERSION__"',JSON.stringify(shellVersion)).replace('"__VOICE_VERSION__"',JSON.stringify(voiceVersion))
  .replace('"__VOICE__"',JSON.stringify(groups)));
console.log("Offline shell and "+groups.length+" audio packs built.");
