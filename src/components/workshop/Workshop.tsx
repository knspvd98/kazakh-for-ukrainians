import { useState } from "react";
import { assemble, questions, stems, type Place } from "./forms";
import { useProgress } from "../progress/useProgress";
type Progress = ReturnType<typeof useProgress>;

export function Workshop({ progress }: {progress: Progress}) {
  const [stemIndex,setStem] = useState(0), [many,setMany] = useState(false);
  const [place,setPlace] = useState<Place>("base"), [position,setPosition] = useState(0);
  const [answer,setAnswer] = useState<number|null>(null);
  const stem=stems[stemIndex], result=assemble(stem,many,place);
  const question=questions[position], skills=[...new Set(questions.map(q=>q.skill))];
  function grade(choice:number) {
    if(answer!==null) return;
    setAnswer(choice);
    progress.answerTask("forms-diagnostic-"+position,choice===question.answer);
  }
  function start(i:number) {setPosition(i);setStem(questions[i].stem);setAnswer(null);}
  return <main className="page workshop">
    <div className="page-title"><h1>Майстерня словоформ</h1><p>Зміни число або відмінок. Простеж, як останній звук слова впливає на наступне закінчення.</p></div>
    <div className="workshop-grid"><section><h2>Конструктор</h2>
      <div className="workshop-controls"><label>Основа<select value={stemIndex} onChange={e=>setStem(Number(e.target.value))}>{stems.map((s,i)=><option value={i} key={s.kk}>{s.kk} · {s.uk}</option>)}</select></label>
      <label>Число<select value={many?"many":"one"} onChange={e=>setMany(e.target.value==="many")}><option value="one">Однина</option><option value="many">Множина</option></select></label>
      <label>Значення<select value={place} onChange={e=>setPlace(e.target.value as Place)}><option value="base">Хто? Що?</option><option value="where">Де?</option><option value="toward">Куди?</option></select></label></div>
      <div className="workshop-result" aria-live="polite"><strong lang="kk">{result.word}</strong><span lang="kk">{[stem.kk,result.plural,result.ending].filter(Boolean).join(" + ")}</span></div>
      <p>Останній голосний <b lang="kk">{stem.vowel}</b> належить до {stem.front?"переднього":"заднього"} ряду.{many && <> Після кінцевого <b>{stem.kk.slice(-1)}</b> множина має форму <b lang="kk">-{result.plural}</b>.</>}</p>
      {result.ending&&<p>{many?"Після множини закінчення приєднується до р. ":""}{place==="where"?"Місцевий відмінок позначає місце дії.":"Давальний відмінок тут позначає напрямок руху."} Форма закінчення — <b lang="kk">-{result.ending}</b>.</p>}
    </section><section><h2>Перевір себе</h2><small>Питання {position+1} із {questions.length}</small>
    <p>{question.prompt}</p><div className="workshop-options">{question.options.map((o,i)=><button key={o} lang="kk" disabled={answer!==null} onClick={()=>grade(i)}>{o}</button>)}</div>
    {answer!==null&&<div role="status"><p><b>{answer===question.answer?"Правильно.":"Правильна форма — "+question.options[question.answer]+"."}</b> {question.why}</p>
    <button className="secondary" onClick={()=>start((position+1)%questions.length)}>Наступне питання</button></div>}
    <h3>Навички</h3>{skills.map(skill=>{
      const ids=questions.map((q,i)=>q.skill===skill?i:-1).filter(i=>i>=0);
      const correct=ids.filter(i=>progress.state.taskResults["forms-diagnostic-"+i]===true).length;
      const next=ids.find(i=>!progress.state.taskResults["forms-diagnostic-"+i])??ids[0];
      return <div key={skill} className="workshop-skill"><span>{skill} · {correct}/{ids.length}</span><button className="text-button" onClick={()=>start(next)}>Повторити</button></div>;
    })}</section></div></main>;
}
