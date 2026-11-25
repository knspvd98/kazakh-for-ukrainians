export type Place = "base" | "where" | "toward";
export type Stem = { kk: string; uk: string; front: boolean; plural: "л" | "д" | "т"; voiceless: boolean; vowel: string };

// Closed teaching vocabulary. Loanwords with exceptional harmony need their own entries.
export const stems: Stem[] = [
  {kk:"қала", uk:"місто", front:false, plural:"л", voiceless:false, vowel:"а"},
  {kk:"үй", uk:"дім", front:true, plural:"л", voiceless:false, vowel:"ү"},
  {kk:"ауыл", uk:"село", front:false, plural:"д", voiceless:false, vowel:"ы"},
  {kk:"көл", uk:"озеро", front:true, plural:"д", voiceless:false, vowel:"ө"},
  {kk:"саябақ", uk:"парк", front:false, plural:"т", voiceless:true, vowel:"а"},
  {kk:"мектеп", uk:"школа", front:true, plural:"т", voiceless:true, vowel:"е"}
];

export function assemble(stem: Stem, many: boolean, place: Place) {
  const vowel = stem.front ? "е" : "а";
  const plural = many ? stem.plural + vowel + "р" : "";
  const voiceless = !many && stem.voiceless;
  let ending = "";
  if (place === "where") ending = (voiceless ? "т" : "д") + vowel;
  if (place === "toward") ending = stem.front ? (voiceless ? "ке" : "ге") : (voiceless ? "қа" : "ға");
  return {plural, ending, word: stem.kk + plural + ending};
}

export const questions = [
  {skill:"Гармонія голосних", prompt:"Яка форма означає «міста»?", options:["қалалер","қалалар","қаладар"], answer:1, why:"Останній голосний а задає задній ряд. Після голосного множина починається з л: қала + лар.", stem:0},
  {skill:"Множина", prompt:"Одна школа — мектеп. Як сказати «школи»?", options:["мектеплер","мектепдер","мектептер"], answer:2, why:"Після глухого п починаємо закінчення з т. Передній е підказує -тер.", stem:5},
  {skill:"Місце й напрямок", prompt:"«Я навчаюсь у школі». Якою формою передати місце?", options:["мектепте","мектепке","мектептер"], answer:0, why:"Дія відбувається у школі. Питання «де?» вимагає місцевого відмінка: мектеп + те. Форма мектепке відповідає на «куди?».", stem:5},
  {skill:"Гармонія голосних", prompt:"Яке закінчення потрібне у слові «озера»?", options:["көлдар","көлдер","көлтер"], answer:1, why:"Ө — голосний переднього ряду, тому у закінченні е. Після л у множині вживаємо д.", stem:3},
  {skill:"Множина", prompt:"Обери множину слова ауыл («село»).", options:["ауылтар","ауыллар","ауылдар"], answer:2, why:"Основа закінчується на л, тому потрібна група -дар/-дер. Останній ы належить до заднього ряду.", stem:2},
  {skill:"Місце й напрямок", prompt:"«Ми йдемо до парку». Яка форма передає напрямок?", options:["саябаққа","саябақта","саябақтар"], answer:0, why:"Рух до місця відповідає на «куди?». Після глухого қ вживаємо -қа: саябақ + қа.", stem:4}
];
