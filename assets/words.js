// Word sets for spaced-repetition flashcards (page /words/, portal panel, Teacher Desk "Words").
// HOW TO ADD A SET after a lesson: see words/README.md. Short version:
//   { id: "unique-id", title: "Shown to the student", for: ["sasha"], added: "YYYY-MM-DD",
//     words: [ { w: "English word", ru: "перевод", def: "simple English meaning", ex: "Example sentence." }, ... ] }
// `for` = student names as slugs (lowercase latin, e.g. "sasha", "victoria", "diana") or "all".
// Progress is stored per word text: renaming `w` later resets that card. Don't reuse an id.
window.WORD_SETS = [
  {
    id: "sasha-clothes", title: "Clothes and fashion", for: ["sasha"], added: "2026-11-20",
    words: [
      { w: "loose", ru: "свободный, широкий", def: "not tight; there is space between the clothes and your body", ex: "My favourite hoodie is really loose and comfortable." },
      { w: "tight", ru: "тесный, облегающий", def: "fitting very close to your body", ex: "These jeans are so tight I can't sit down." },
      { w: "hooded", ru: "с капюшоном", def: "with a hood, a part that covers your head", ex: "I always wear a hooded jacket when it rains." },
      { w: "long-sleeved", ru: "с длинным рукавом", def: "with long sleeves (the parts that cover your arms)", ex: "A long-sleeved T-shirt is perfect for autumn." },
      { w: "polo neck", ru: "водолазка, высокий воротник", def: "a high collar that folds over and covers your neck", ex: "He wore a black polo neck sweater with a grey suit." },
      { w: "sleeveless", ru: "без рукавов", def: "with no sleeves", ex: "It was so hot that I put on a sleeveless dress." },
      { w: "V-neck", ru: "с V-образным вырезом", def: "with a neck opening in the shape of a V", ex: "A V-neck sweater looks good over a shirt." },
      { w: "checked", ru: "в клетку", def: "with a pattern of squares", ex: "He always wears red checked shirts in winter." },
      { w: "patterned", ru: "с узором, с рисунком", def: "with a design on it, for example flowers", ex: "She bought a patterned skirt for the holiday." },
      { w: "plain", ru: "однотонный, без рисунка", def: "one colour, with no pattern", ex: "I prefer plain T-shirts, they go with everything." },
      { w: "spotted", ru: "в горошек", def: "with a pattern of round dots", ex: "A spotted tie looks a bit old-fashioned." },
      { w: "striped", ru: "в полоску", def: "with a pattern of lines", ex: "Sailors wear blue and white striped tops." },
      { w: "cotton", ru: "хлопок", def: "light natural material from a plant; easy to wash", ex: "Cotton is the best material for summer." },
      { w: "denim", ru: "джинсовая ткань", def: "thick cotton material, usually blue, used for jeans", ex: "She wore a denim jacket over her dress." },
      { w: "fur", ru: "мех", def: "the soft hair of an animal (or a copy of it)", ex: "The coat has a fur collar." },
      { w: "lace", ru: "кружево", def: "delicate material with a pattern of holes", ex: "She wore a lace top to the wedding." },
      { w: "linen", ru: "лён", def: "natural material that is cool to wear but creases easily", ex: "A linen suit is smart but you need to iron it." },
      { w: "silk", ru: "шёлк", def: "very soft, smooth, shiny material", ex: "Her silk scarf was a present from Italy." },
      { w: "velvet", ru: "бархат", def: "soft thick material with a surface like short fur", ex: "A velvet jacket looks great at a party." },
      { w: "woollen", ru: "шерстяной", def: "made of wool, material from sheep; keeps you warm", ex: "My grandmother knitted me a woollen cardigan." },
      { w: "leather", ru: "кожа (материал)", def: "material made from animal skin, smooth and strong", ex: "Leather sandals last for years." },
      { w: "suede", ru: "замша", def: "leather with a soft, rough surface", ex: "Don't wear suede boots in the rain!" },
      { w: "waistcoat", ru: "жилет", def: "a short jacket with no sleeves, often worn over a shirt", ex: "He wore a waistcoat with his suit." },
      { w: "cardigan", ru: "кардиган", def: "a knitted jacket with buttons at the front", ex: "Take a cardigan in case it gets cold." },
      { w: "casual", ru: "повседневный", def: "comfortable, not formal", ex: "On Fridays everybody wears casual clothes to work." },
      { w: "scruffy", ru: "неопрятный, потрёпанный", def: "untidy and dirty; looks old and worn", ex: "He went to the interview in scruffy jeans." },
      { w: "smart", ru: "нарядный, элегантный", def: "clean, elegant, quite formal", ex: "You look very smart in that suit!" },
      { w: "old-fashioned", ru: "старомодный", def: "not modern any more; out of fashion", ex: "That jacket looks really old-fashioned now." },
      { w: "dress up", ru: "наряжаться", def: "put on smart or special clothes for an occasion", ex: "We always dress up for New Year." },
      { w: "hang up", ru: "повесить (одежду)", def: "put clothes on a hanger or a hook", ex: "Hang up your jacket, don't throw it on the bed." },
      { w: "fit", ru: "подходить по размеру", def: "be the right size for you", ex: "These shoes don't fit me. They're too big." },
      { w: "suit", ru: "идти, быть к лицу", def: "look good on you (colour, style)", ex: "Green really suits you." },
      { w: "match", ru: "сочетаться", def: "look good together (two things)", ex: "Your bag matches your shoes perfectly." }
    ]
  },
  {
    id: "vlada-money", title: "Money", for: ["vlada"], added: "2026-11-20",
    words: [
      { w: "be worth", ru: "стоить, иметь ценность", def: "to have a particular value", ex: "This old ring is worth about €500." },
      { w: "borrow (from)", ru: "брать в долг", def: "to take money from someone and give it back later", ex: "Can I borrow €10 from you?" },
      { w: "lend (to)", ru: "давать в долг", def: "to give money to someone who will give it back later", ex: "I lent my brother €50 last month." },
      { w: "can't afford", ru: "не могу себе позволить", def: "to not have enough money for something", ex: "We can't afford a new car this year." },
      { w: "charge (for)", ru: "брать плату", def: "to ask someone to pay a price for a service", ex: "The hotel charged us €20 for parking." },
      { w: "earn", ru: "зарабатывать", def: "to get money for the work you do", ex: "She earns more than her husband." },
      { w: "inherit", ru: "унаследовать", def: "to get money or property from someone after they die", ex: "He inherited his grandmother's flat." },
      { w: "invest (in)", ru: "вкладывать, инвестировать", def: "to put money into something to make a profit", ex: "They invested in gold." },
      { w: "owe", ru: "быть должным", def: "to have to pay money back to someone", ex: "You still owe me €30!" },
      { w: "raise", ru: "собирать (деньги)", def: "to collect money for a good cause", ex: "The school raised €2,000 for the animal shelter." },
      { w: "save up", ru: "копить", def: "to keep money so you can use it later", ex: "I'm saving up for a trip to Japan." },
      { w: "waste (on)", ru: "тратить впустую", def: "to spend money badly, on things you don't need", ex: "Don't waste your money on that app." },
      { w: "a bill", ru: "счёт (к оплате)", def: "a paper that shows how much you have to pay", ex: "The electricity bill was huge this month." },
      { w: "a budget", ru: "бюджет", def: "the money you have and a plan for how to spend it", ex: "Our budget for the holiday is €1,500." },
      { w: "insurance", ru: "страховка", def: "money you pay a company, so they pay you if something bad happens", ex: "Don't travel without travel insurance." },
      { w: "a loan", ru: "кредит, заём", def: "money that a bank or a person lends you", ex: "He took out a loan to buy a car." },
      { w: "a mortgage", ru: "ипотека", def: "a big loan from a bank to buy a house or a flat", ex: "They'll pay off their mortgage in 20 years." },
      { w: "a salary", ru: "зарплата", def: "the money you get for your job, usually every month", ex: "She got a higher salary at her new job." },
      { w: "tax", ru: "налог", def: "money you have to pay to the government", ex: "Prices include tax." },
      { w: "take out", ru: "снять (деньги)", def: "to get money from a cash machine or a bank account", ex: "I took out €100 at the airport." },
      { w: "pay back", ru: "вернуть долг", def: "to give back money that you borrowed", ex: "I'll pay you back on Friday." },
      { w: "live on", ru: "жить на (сумму)", def: "to have a certain amount of money to pay for everything", ex: "It's hard to live on €700 a month." },
      { w: "live off", ru: "жить за счёт", def: "to get the money you need from someone or something", ex: "He's 30 and still lives off his parents." },
      { w: "get into debt", ru: "влезть в долги", def: "to start owing money", ex: "It's easy to get into debt with credit cards." }
    ]
  },
  {
    id: "group-phrasal", title: "Phrasal verbs", for: ["victoria", "diana"], added: "2026-11-20",
    words: [
      { w: "wake up", ru: "просыпаться", def: "stop sleeping", ex: "I usually wake up before my alarm." },
      { w: "get up", ru: "вставать (с кровати)", def: "get out of bed", ex: "On Sundays I get up at eleven." },
      { w: "go off", ru: "зазвенеть (о будильнике)", def: "start ringing (an alarm)", ex: "My alarm went off at 6.15." },
      { w: "turn down", ru: "убавить (звук)", def: "make music or TV quieter", ex: "Could you turn the music down, please?" },
      { w: "turn off", ru: "выключить", def: "stop a machine or a light", ex: "Turn off the lights when you go out." },
      { w: "go away", ru: "уехать (отдыхать)", def: "leave home for a holiday", ex: "We're going away for the weekend." },
      { w: "take back", ru: "вернуть (в магазин)", def: "return something to the shop", ex: "The jeans were too small, so I took them back." },
      { w: "try on", ru: "примерить", def: "put on clothes to see if they fit", ex: "Can I try on this jacket?" },
      { w: "run out of", ru: "закончиться (о запасах)", def: "have no more of something", ex: "Oh no, we've run out of coffee!" },
      { w: "get on with", ru: "ладить с кем-то", def: "have a good relationship with someone", ex: "Diana gets on with her cousin really well." },
      { w: "look for", ru: "искать", def: "try to find", ex: "I'm looking for my phone. Have you seen it?" },
      { w: "go on", ru: "продолжать", def: "continue", ex: "Go on reading, the next letter is really good." },
      { w: "write down", ru: "записать", def: "write something on paper so you remember it", ex: "Write down these new words." },
      { w: "pick up", ru: "забрать, подвезти", def: "collect someone in a car", ex: "Could you pick me up from the station?" },
      { w: "pay back", ru: "вернуть долг", def: "give back money you borrowed", ex: "I paid my sister back yesterday." },
      { w: "look round", ru: "осмотреть (место)", def: "walk around a place to see it", ex: "We looked round the city all afternoon." },
      { w: "put away", ru: "убрать на место", def: "put something in its place", ex: "Put your clothes away, please." },
      { w: "get on", ru: "сесть (в автобус, поезд)", def: "enter a bus, train or plane", ex: "Hurry up! We need to get on the bus." },
      { w: "get off", ru: "выйти (из автобуса)", def: "leave a bus, train or plane", ex: "Get off at the next stop." },
      { w: "take out", ru: "вынести (мусор)", def: "carry something outside", ex: "It's your turn to take out the rubbish." },
      { w: "check in", ru: "зарегистрироваться (в отеле)", def: "arrive and give your name at a hotel or airport", ex: "We checked in at three o'clock." },
      { w: "give back", ru: "отдать, вернуть", def: "return something to its owner", ex: "Can you give me back my charger?" }
    ]
  }
];
