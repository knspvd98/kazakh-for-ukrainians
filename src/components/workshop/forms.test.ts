import { describe, it, expect } from "vitest";
import { assemble, stems } from "./forms";
describe("case endings with and without an intervening plural",()=>{
  it.each([["мектеп","мектепте","мектептерге"],["үй","үйде","үйлерге"],["саябақ","саябақта","саябақтарға"],["ауыл","ауылда","ауылдарға"]])("%s", (word,where,toward)=>{
    const stem=stems.find(s=>s.kk===word)!;
    expect(assemble(stem,false,"where").word).toBe(where);expect(assemble(stem,true,"toward").word).toBe(toward);
  });
});
