const kazakhSpecificLetters = /[ӘәҒғҚқҢңӨөҰұҮүҺһ]/;

const commonKazakhTokens = new Set([
  "ал", "алина", "анау", "аты", "атым", "атыңыз", "бар", "барамын", "барасың", "барады", "ба", "бе",
  "бүгін", "бұл", "бірге", "дейін", "диас", "дұрыс", "емес", "енді", "ертең", "жақсы", "жаным",
  "жарайды", "жоқ", "жылы", "иә", "кафе", "кітап", "кітабым", "кім", "күн", "керек", "келеді", "мен",
  "менің", "мектеп", "мектепке", "мектепте", "мына", "мынау", "не", "оның", "ол", "оқимын", "рахмет",
  "рақмет", "сабақ", "сабаққа", "сабақта", "саған", "сәлем", "сен", "сенің", "сіз", "сіздің", "су",
  "сөз", "сөйлесемін", "сұрақ", "тіл", "тілі", "түсіндім", "үй", "үйде", "үйге", "уақыт", "қазір",
  "қазақ", "қазақша", "қала", "қалада", "қалаға", "қалам", "қалай", "қайда", "қайталаңызшы", "қанша",
  "шы", "ішемін"
]);

const nonStandaloneMorphemes = new Set([
  "ма", "ме", "ба", "бе", "па", "пе", "да", "де", "та", "те", "ға", "ге", "қа", "ке",
  "дан", "ден", "тан", "тен", "нан", "нен", "лар", "лер", "дар", "дер", "тар", "тер",
  "ның", "нің", "дың", "дің", "тың", "тің", "ны", "ні", "ды", "ді", "ты", "ті",
  "бен", "пен", "ымыз", "іміз", "ың", "ің", "ыңыз", "іңіз"
]);

const ukrainianExplanationTokens = new Set([
  "після", "перед", "варіант", "варіанти", "голосний", "голосні", "приголосний", "приголосні",
  "основа", "основи", "слово", "слова", "місце", "напрям", "особа", "множина", "належність",
  "форма", "форми", "питання", "заперечення", "корінь", "суфікс", "закінчення", "задній", "передній",
  "глухий", "глухих", "дзвінкий", "дзвінких", "сонорний", "сонорних", "умовно", "приклад",
  "значення", "кілька", "наші", "моя", "моє", "твоя", "ваше", "людина", "разом", "окремо",
  "читати", "писати", "йти", "їхати", "робить", "показує", "відповідає", "потрібен", "потрібна",
  "для", "та", "не", "замінюй", "звичним", "дзвінкого", "язик", "губи", "округлені", "уперед",
  "повітря", "проходить", "вузький", "прохід", "глибоко", "роті", "порівнюй", "цілий", "склад",
  "ізольовану", "літеру", "виконавець", "центрі", "дія"
]);

export function looksLikeKazakhText(value: string) {
  const text = value.trim();
  if (!text) return false;
  if (kazakhSpecificLetters.test(text)) return true;
  const normalized = text.toLowerCase().replace(/[.,!?;:()[\]«»“”"']/g, " ");
  const tokens = normalized.split(/\s+/).filter(Boolean);
  return tokens.some((token) => commonKazakhTokens.has(token));
}

export function isCompleteKazakhAudioText(value: string) {
  const text = value.trim();
  if (!looksLikeKazakhText(text)) return false;
  if (/[їєґ]/i.test(text) || /[a-z]/i.test(text)) return false;
  if (/[+|/→↔=≠·\[\]{};]/.test(text) || /—/.test(text) || /[-–]/.test(text) || /\.{2,}|…/.test(text)) return false;
  const commaSegments = text.split(",").map((segment) => segment.trim()).filter(Boolean);
  if (commaSegments.length > 2 && !/[.!?]$/.test(text)) return false;
  const normalized = text.toLowerCase().replace(/[.,!?;:()[\]«»“”"']/g, " ").trim();
  const tokens = normalized.split(/\s+/).filter(Boolean);
  // Some short forms are valid in both languages. For example, Kazakh не
  // means "what", so a Ukrainian stop-word match must not hide audio for
  // a phrase that otherwise contains recognised Kazakh words.
  if (tokens.some((token) => ukrainianExplanationTokens.has(token) && !commonKazakhTokens.has(token))) return false;
  if (tokens.length === 1 && nonStandaloneMorphemes.has(tokens[0])) return false;
  return true;
}
