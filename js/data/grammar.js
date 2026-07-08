// 실전 문법 24패턴 — 이론 최소화, 회화 빈출 패턴 중심.
// 각 패턴: 설명 → 회화 예문 3개 → 즉석 퀴즈 3문항(해설 포함)

export const GRAMMAR_PATTERNS = [
  // ─── 1개월차: 문장의 뼈대 ───
  {
    id: "be", phase: 1, title: "be동사로 상태 말하기", pattern: "주어 + am/is/are + 상태",
    explain: "\"나는 ~이다/~한 상태다\"를 말하는 영어의 가장 기본 뼈대. I는 am, You/We/They는 are, He/She/It은 is와 짝을 이룹니다. 회화의 절반은 이 패턴에서 시작해요.",
    examples: [
      ["I'm really tired today.", "나 오늘 정말 피곤해."],
      ["She is my coworker.", "그녀는 제 직장 동료예요."],
      ["We're late! Hurry up!", "우리 늦었어! 서둘러!"],
    ],
    quiz: [
      { q: "I ___ so hungry right now.", c: ["am", "is", "are"], a: 0, why: "주어가 I이면 항상 am." },
      { q: "They ___ from Canada.", c: ["is", "are", "am"], a: 1, why: "They(복수)는 are와 짝." },
      { q: "My brother ___ a doctor.", c: ["are", "am", "is"], a: 2, why: "He/She/It(3인칭 단수)은 is." },
    ],
  },
  {
    id: "present", phase: 1, title: "현재 습관 말하기", pattern: "주어 + 동사(s)",
    explain: "매일 하는 일, 습관, 사실을 말할 때. 핵심은 딱 하나 — He/She/It 뒤 동사에 -s를 붙인다는 것. \"I drink coffee. / She drinks coffee.\"",
    examples: [
      ["I usually get up at seven.", "저는 보통 7시에 일어나요."],
      ["He works at a hospital.", "그는 병원에서 일해요."],
      ["We eat out on Fridays.", "우리는 금요일마다 외식해요."],
    ],
    quiz: [
      { q: "She ___ English every morning.", c: ["study", "studies", "studying"], a: 1, why: "3인칭 단수 She → studies." },
      { q: "I ___ to music on the subway.", c: ["listens", "listening", "listen"], a: 2, why: "주어 I → 동사원형 listen." },
      { q: "My dad ___ dinner on Sundays.", c: ["cooks", "cook", "is cook"], a: 0, why: "My dad = He → cooks." },
    ],
  },
  {
    id: "progressive", phase: 1, title: "지금 하는 일 말하기", pattern: "be + 동사ing",
    explain: "\"지금 ~하는 중이야\"는 be동사 + ~ing. 전화로 \"뭐 해?\"라고 물을 때 답이 전부 이 패턴입니다. What are you doing? — I'm cooking.",
    examples: [
      ["I'm watching a movie now.", "지금 영화 보고 있어."],
      ["She's talking on the phone.", "그녀는 통화 중이에요."],
      ["Are you listening to me?", "내 말 듣고 있어?"],
    ],
    quiz: [
      { q: "What are you ___ right now?", c: ["do", "doing", "did"], a: 1, why: "be동사(are) 뒤에는 ~ing." },
      { q: "He ___ studying in his room.", c: ["is", "are", "do"], a: 0, why: "He → is + studying." },
      { q: "I ___ waiting for the bus.", c: ["is", "do", "am"], a: 2, why: "I → am + waiting." },
    ],
  },
  {
    id: "past", phase: 1, title: "지난 일 말하기", pattern: "주어 + 동사ed / 불규칙 과거형",
    explain: "어제 한 일은 동사에 -ed. 단, 자주 쓰는 동사일수록 불규칙(go→went, eat→ate, see→saw, have→had). 불규칙 30개만 외우면 과거 회화의 90%가 해결됩니다.",
    examples: [
      ["I watched a great movie yesterday.", "어제 좋은 영화를 봤어요."],
      ["We went to Busan last weekend.", "우리는 지난 주말에 부산에 갔어요."],
      ["She ate lunch with her friends.", "그녀는 친구들과 점심을 먹었어요."],
    ],
    quiz: [
      { q: "I ___ him at the station yesterday.", c: ["see", "saw", "seen"], a: 1, why: "see의 과거형은 saw." },
      { q: "We ___ a great time last night.", c: ["had", "have", "has"], a: 0, why: "have의 과거형은 had." },
      { q: "She ___ home early yesterday.", c: ["goes", "gone", "went"], a: 2, why: "go의 과거형은 went." },
    ],
  },
  {
    id: "future", phase: 1, title: "미래 계획 말하기", pattern: "will / be going to + 동사",
    explain: "즉흥 결정·약속은 will(\"I'll call you\"), 이미 정한 계획은 be going to(\"I'm going to visit my parents\"). 회화에서는 gonna로 자주 줄여 말합니다.",
    examples: [
      ["I'll text you when I arrive.", "도착하면 문자할게."],
      ["I'm going to start a new job next month.", "다음 달에 새 일을 시작할 거예요."],
      ["It's going to rain soon.", "곧 비가 올 것 같아요."],
    ],
    quiz: [
      { q: "Don't worry. I ___ help you.", c: ["will", "am", "was"], a: 0, why: "그 자리에서 결정한 도움 → will." },
      { q: "We ___ going to move next year.", c: ["will", "are", "is"], a: 1, why: "be going to의 be = are (We)." },
      { q: "She ___ call you back later.", c: ["wills", "is will", "will"], a: 2, why: "will은 주어와 상관없이 형태 고정." },
    ],
  },
  {
    id: "can", phase: 1, title: "능력·허락 말하기", pattern: "can / can't + 동사",
    explain: "\"~할 수 있어\"와 \"~해도 돼?\" 둘 다 can 하나로 해결. Can you ~?는 부탁, Can I ~?는 허락 요청. 회화 사용 빈도 최상위 조동사입니다.",
    examples: [
      ["I can speak a little English.", "저는 영어를 조금 할 수 있어요."],
      ["Can you help me with this?", "이것 좀 도와줄 수 있어요?"],
      ["Can I try this on?", "이거 입어 봐도 될까요?"],
    ],
    quiz: [
      { q: "___ I use your phone for a second?", c: ["Can", "Do", "Am"], a: 0, why: "허락 요청은 Can I ~?" },
      { q: "She can ___ really well.", c: ["sings", "sing", "singing"], a: 1, why: "can 뒤에는 항상 동사원형." },
      { q: "I ___ eat spicy food at all.", c: ["can", "am not", "can't"], a: 2, why: "'전혀 못 먹는다' → can't." },
    ],
  },
  {
    id: "questions", phase: 1, title: "질문 만들기", pattern: "Do/Does/Did + 주어 + 동사?",
    explain: "일반동사 질문은 Do(현재)/Does(3인칭)/Did(과거)를 앞에 세우기만 하면 끝. 의문사(What/Where/When/Why/How)는 그 앞에 붙입니다. 질문을 못 만들면 대화가 안 이어져요 — 최우선 패턴.",
    examples: [
      ["Do you like Korean food?", "한국 음식 좋아하세요?"],
      ["Where does she work?", "그녀는 어디서 일해요?"],
      ["What did you do yesterday?", "어제 뭐 했어요?"],
    ],
    quiz: [
      { q: "___ you have any plans tonight?", c: ["Do", "Are", "Is"], a: 0, why: "일반동사(have) 질문 → Do." },
      { q: "Where ___ he live?", c: ["do", "does", "is"], a: 1, why: "3인칭 단수 he → does." },
      { q: "What ___ you eat for lunch yesterday?", c: ["do", "does", "did"], a: 2, why: "과거(yesterday) → did." },
    ],
  },
  {
    id: "thereis", phase: 1, title: "존재 말하기", pattern: "There is/are + 명사",
    explain: "\"~이 있어요\"는 There is(단수)/There are(복수). 길 묻기, 식당·호텔 대화에서 쉴 새 없이 나옵니다. 질문은 Is there ~? / Are there ~?",
    examples: [
      ["There's a good cafe near here.", "이 근처에 좋은 카페가 있어요."],
      ["Are there any seats left?", "남은 자리 있나요?"],
      ["There are many people in line.", "줄에 사람이 많아요."],
    ],
    quiz: [
      { q: "___ a bank near here?", c: ["Is there", "Are there", "There is"], a: 0, why: "단수(a bank) 질문 → Is there." },
      { q: "There ___ two rooms available.", c: ["is", "are", "be"], a: 1, why: "복수(two rooms) → are." },
      { q: "___ no time. Let's go!", c: ["There are", "It is", "There's"], a: 2, why: "time은 셀 수 없는 명사 → There's no time." },
    ],
  },
  // ─── 2개월차: 표현 넓히기 ───
  {
    id: "haveto", phase: 2, title: "의무 말하기", pattern: "have to / should + 동사",
    explain: "\"~해야 해\"는 have to(필수)와 should(조언·권유)로 구분. \"I have to work(일해야 해, 어쩔 수 없이)\" vs \"You should rest(쉬는 게 좋겠어, 조언)\".",
    examples: [
      ["I have to finish this by Friday.", "금요일까지 이걸 끝내야 해요."],
      ["You should try that restaurant.", "그 식당 꼭 가 봐."],
      ["She doesn't have to come early.", "그녀는 일찍 올 필요 없어요."],
    ],
    quiz: [
      { q: "I ___ to wake up early tomorrow.", c: ["have", "should", "must"], a: 0, why: "to가 있으므로 have to." },
      { q: "You look sick. You ___ see a doctor.", c: ["have", "should", "are"], a: 1, why: "조언 → should + 동사원형." },
      { q: "He ___ have to work on weekends.", c: ["don't", "isn't", "doesn't"], a: 2, why: "3인칭 부정 → doesn't have to." },
    ],
  },
  {
    id: "perfect", phase: 2, title: "경험 말하기", pattern: "have + 과거분사 (Have you ever ~?)",
    explain: "\"~해 본 적 있어?\"는 Have you ever + 과거분사. 답은 \"I have. / I've never ~.\" 처음 만난 사람과 대화를 이어가는 최고의 질문 패턴입니다.",
    examples: [
      ["Have you ever been to Jeju?", "제주도에 가 본 적 있어요?"],
      ["I've never tried Indian food.", "인도 음식은 한 번도 안 먹어 봤어요."],
      ["I've seen this movie three times.", "이 영화 세 번 봤어요."],
    ],
    quiz: [
      { q: "___ you ever eaten sushi?", c: ["Have", "Do", "Did"], a: 0, why: "경험 질문 → Have you ever ~?" },
      { q: "I've ___ been to Europe.", c: ["ever", "never", "yet"], a: 1, why: "'한 번도 없다' → never." },
      { q: "She has ___ in Seoul for ten years.", c: ["live", "living", "lived"], a: 2, why: "have/has + 과거분사(lived)." },
    ],
  },
  {
    id: "comparative", phase: 2, title: "비교하기", pattern: "-er than / more ~ than / the -est",
    explain: "짧은 단어는 -er(taller), 긴 단어는 more(more expensive). \"어느 게 더 좋아?\"라는 일상 대화의 필수 도구. 최상급은 the + -est/most.",
    examples: [
      ["The subway is faster than the bus.", "지하철이 버스보다 빨라요."],
      ["This one is more expensive.", "이게 더 비싸요."],
      ["It's the best pizza in town.", "여기가 이 동네 최고의 피자예요."],
    ],
    quiz: [
      { q: "Today is ___ than yesterday.", c: ["hotter", "more hot", "hottest"], a: 0, why: "짧은 형용사 hot → hotter than." },
      { q: "This bag is ___ expensive than that one.", c: ["most", "more", "much"], a: 1, why: "긴 형용사 → more ~ than." },
      { q: "He's ___ tallest in our class.", c: ["a", "more", "the"], a: 2, why: "최상급 앞에는 the." },
    ],
  },
  {
    id: "wantto", phase: 2, title: "원하는 것 말하기", pattern: "want to / would like to + 동사",
    explain: "\"~하고 싶어\"는 want to(캐주얼, wanna로 축약), 공손하게는 would like to(I'd like to). 식당 주문, 쇼핑, 계획 말하기의 만능 패턴.",
    examples: [
      ["I want to learn how to drive.", "운전을 배우고 싶어요."],
      ["I'd like to book a table for two.", "두 명 자리를 예약하고 싶은데요."],
      ["Do you want to grab a coffee?", "커피 한잔할래?"],
    ],
    quiz: [
      { q: "I want ___ home early today.", c: ["to go", "going", "go"], a: 0, why: "want + to + 동사원형." },
      { q: "___ you like to leave a message?", c: ["Do", "Would", "Are"], a: 1, why: "공손한 제안 → Would you like to ~?" },
      { q: "She wants ___ a new laptop.", c: ["buy", "buying", "to buy"], a: 2, why: "want + to buy." },
    ],
  },
  {
    id: "infinitive", phase: 2, title: "목적 말하기", pattern: "동사 + to + 동사원형 (~하기 위해)",
    explain: "\"왜?\"에 대한 답. \"I went to the store to buy milk(우유 사러 갔어).\" to 하나로 이유를 설명할 수 있어 문장이 길어지고 어른스러워집니다.",
    examples: [
      ["I'm saving money to travel abroad.", "해외여행 가려고 돈을 모으고 있어요."],
      ["She called to say thank you.", "그녀가 고맙다고 말하려고 전화했어요."],
      ["I came here to meet Mr. Kim.", "김 선생님을 만나러 왔는데요."],
    ],
    quiz: [
      { q: "I study English ___ get a better job.", c: ["to", "for", "so"], a: 0, why: "목적 '~하기 위해' → to + 동사원형." },
      { q: "He went out ___ some fresh air.", c: ["to getting", "to get", "for get"], a: 1, why: "to + 동사원형(get)." },
      { q: "We stopped ___ lunch.", c: ["have", "having to", "to have"], a: 2, why: "점심 먹으려고 멈춤 → stopped to have." },
    ],
  },
  {
    id: "gerund", phase: 2, title: "동명사로 말하기", pattern: "동사ing = ~하는 것",
    explain: "동사에 -ing를 붙이면 명사처럼 씁니다. \"I like cooking(요리하는 걸 좋아해)\", \"Thank you for coming(와 줘서 고마워)\". enjoy, finish, stop 뒤에는 반드시 -ing.",
    examples: [
      ["I enjoy walking in the evening.", "저는 저녁 산책을 즐겨요."],
      ["Thanks for inviting me!", "초대해 줘서 고마워!"],
      ["How about eating out tonight?", "오늘 밤 외식하는 거 어때?"],
    ],
    quiz: [
      { q: "I enjoy ___ to music.", c: ["listening", "listen", "to listen"], a: 0, why: "enjoy 뒤에는 항상 ~ing." },
      { q: "Thank you for ___ me.", c: ["help", "helping", "to help"], a: 1, why: "전치사 for 뒤에는 ~ing." },
      { q: "She finished ___ the report.", c: ["write", "to write", "writing"], a: 2, why: "finish 뒤에는 ~ing." },
    ],
  },
  {
    id: "frequency", phase: 2, title: "빈도 말하기", pattern: "always > usually > often > sometimes > never",
    explain: "습관의 정도를 표현하는 부사 5총사. 위치는 일반동사 앞, be동사 뒤. \"How often do you ~?\"라고 물으면 이 단어들로 답하세요.",
    examples: [
      ["I usually cook at home.", "저는 보통 집에서 요리해요."],
      ["He's always late for meetings.", "그는 회의에 항상 늦어요."],
      ["How often do you exercise?", "얼마나 자주 운동해요?"],
    ],
    quiz: [
      { q: "She ___ drinks coffee at night. (절대 안 마심)", c: ["never", "always", "often"], a: 0, why: "'절대 ~않다' → never." },
      { q: "I am ___ busy on Mondays. (거의 매번)", c: ["never", "usually", "sometimes"], a: 1, why: "'보통, 대개' → usually. be동사 뒤 위치." },
      { q: "___ often do you see your friends?", c: ["What", "Why", "How"], a: 2, why: "빈도 질문 → How often ~?" },
    ],
  },
  {
    id: "connectors", phase: 2, title: "문장 연결하기", pattern: "because / so / but / and",
    explain: "짧은 문장 두 개를 연결하면 회화가 두 배 자연스러워집니다. because(이유), so(결과), but(반전), and(추가). \"I was tired, so I went home early.\"",
    examples: [
      ["I stayed home because it was raining.", "비가 와서 집에 있었어요."],
      ["The food was great, but a little expensive.", "음식은 훌륭했지만 조금 비쌌어요."],
      ["I was hungry, so I ordered two burgers.", "배가 고파서 버거를 두 개 시켰어요."],
    ],
    quiz: [
      { q: "I couldn't sleep ___ the coffee.", c: ["because of", "so", "but"], a: 0, why: "명사(the coffee) 앞 → because of." },
      { q: "It was cold, ___ I turned on the heater.", c: ["because", "so", "but"], a: 1, why: "원인 → 결과 연결은 so." },
      { q: "I like him, ___ I don't trust him.", c: ["so", "and", "but"], a: 2, why: "반대 내용 연결 → but." },
    ],
  },
  // ─── 3개월차: 자연스러움 완성 ───
  {
    id: "if", phase: 3, title: "조건 말하기", pattern: "If + 현재, will + 동사",
    explain: "\"~하면 ~할 거야\". If절은 현재형, 결과절은 will. \"If it rains, I'll stay home.\" 약속·계획·제안 대화의 핵심 무기입니다.",
    examples: [
      ["If you're free tomorrow, let's have lunch.", "내일 시간 되면 점심 먹자."],
      ["If it rains, we'll cancel the picnic.", "비가 오면 소풍은 취소할 거예요."],
      ["I'll call you if I need help.", "도움이 필요하면 전화할게."],
    ],
    quiz: [
      { q: "If it ___ tomorrow, I'll take a taxi.", c: ["rains", "will rain", "rained"], a: 0, why: "If절에는 현재형(rains)." },
      { q: "If you hurry, you ___ catch the train.", c: ["would", "will", "did"], a: 1, why: "결과절 → will + 동사원형." },
      { q: "___ you see him, say hi for me.", c: ["Because", "So", "If"], a: 2, why: "'만나면' 조건 → If." },
    ],
  },
  {
    id: "when", phase: 3, title: "시간 관계 말하기", pattern: "when / while / before / after",
    explain: "\"~할 때/~하는 동안/~하기 전에/후에\"로 이야기에 시간 순서를 입힙니다. 경험담을 말할 때 이 접속사가 있어야 이야기가 흘러가요.",
    examples: [
      ["Call me when you get home.", "집에 도착하면 전화해."],
      ["I listen to podcasts while driving.", "저는 운전하는 동안 팟캐스트를 들어요."],
      ["Brush your teeth before going to bed.", "자기 전에 이를 닦으세요."],
    ],
    quiz: [
      { q: "___ I was young, I lived in Busan.", c: ["When", "If", "So"], a: 0, why: "'어렸을 때' → When." },
      { q: "Don't use your phone ___ walking.", c: ["after", "while", "before"], a: 1, why: "'걷는 동안' → while." },
      { q: "Wash your hands ___ you eat.", c: ["while", "when", "before"], a: 2, why: "'먹기 전에' → before." },
    ],
  },
  {
    id: "relative", phase: 3, title: "명사 꾸미기", pattern: "명사 + who/that/which + 문장",
    explain: "\"어제 만난 사람\", \"네가 추천한 식당\"처럼 명사 뒤에 설명을 붙이는 법. 사람은 who, 사물은 that/which. 이게 되면 문장 수준이 확 올라갑니다.",
    examples: [
      ["She's the friend who lives in Canada.", "그녀가 캐나다에 사는 그 친구예요."],
      ["This is the restaurant that I told you about.", "여기가 내가 말했던 그 식당이야."],
      ["I lost the book which you lent me.", "네가 빌려준 책을 잃어버렸어."],
    ],
    quiz: [
      { q: "He's the man ___ helped me yesterday.", c: ["who", "which", "what"], a: 0, why: "사람 → who." },
      { q: "I love the cake ___ you made.", c: ["who", "that", "where"], a: 1, why: "사물(cake) → that." },
      { q: "The movie ___ we watched was boring.", c: ["who", "whose", "that"], a: 2, why: "사물(movie) → that." },
    ],
  },
  {
    id: "passive", phase: 3, title: "수동태 기초", pattern: "be + 과거분사",
    explain: "\"만들어졌다, 지어졌다\"처럼 행위를 받는 쪽이 주어일 때. \"This building was built in 1990.\" 뉴스·설명문 듣기에서 특히 자주 들립니다.",
    examples: [
      ["This song was made in the 90s.", "이 노래는 90년대에 만들어졌어요."],
      ["English is spoken all over the world.", "영어는 전 세계에서 사용돼요."],
      ["My phone was stolen on the bus.", "버스에서 핸드폰을 도둑맞았어요."],
    ],
    quiz: [
      { q: "This bridge ___ built 100 years ago.", c: ["was", "is being", "has"], a: 0, why: "과거의 수동 → was + built." },
      { q: "Korean ___ spoken in Korea.", c: ["are", "is", "was"], a: 1, why: "현재 사실 → is spoken." },
      { q: "The package will ___ delivered tomorrow.", c: ["being", "been", "be"], a: 2, why: "will 뒤 → be + 과거분사." },
    ],
  },
  {
    id: "usedto", phase: 3, title: "과거 습관 말하기", pattern: "used to + 동사",
    explain: "\"예전엔 ~했었지(지금은 아님)\". \"I used to live in Daegu.\" 추억, 변화를 이야기할 때 원어민이 정말 자주 쓰는 표현입니다.",
    examples: [
      ["I used to play soccer every day.", "예전엔 매일 축구를 했었어요."],
      ["She used to have long hair.", "그녀는 예전에 머리가 길었어요."],
      ["We used to be neighbors.", "우리는 예전에 이웃이었어요."],
    ],
    quiz: [
      { q: "I ___ to smoke, but I quit.", c: ["used", "use", "using"], a: 0, why: "과거 습관 → used to." },
      { q: "He used to ___ in this town.", c: ["living", "live", "lived"], a: 1, why: "used to + 동사원형." },
      { q: "Did you ___ to play piano?", c: ["used", "using", "use"], a: 2, why: "질문에서는 Did you use to ~? (원형)." },
    ],
  },
  {
    id: "might", phase: 3, title: "추측 말하기", pattern: "might / may / must + 동사",
    explain: "확신의 정도를 조절하는 법. might/may(~일지도, 50%), must(~임이 틀림없어, 90%). \"He might be busy.\" 단정하지 않고 부드럽게 말하는 어른의 회화.",
    examples: [
      ["I might be a little late.", "나 조금 늦을지도 몰라."],
      ["She must be tired after the long trip.", "긴 여행 후라 그녀는 분명 피곤할 거예요."],
      ["It may rain this afternoon.", "오후에 비가 올지도 몰라요."],
    ],
    quiz: [
      { q: "He didn't answer. He ___ be sleeping. (아마도)", c: ["might", "must", "should"], a: 0, why: "약한 추측 → might." },
      { q: "You worked 12 hours? You ___ be exhausted! (틀림없이)", c: ["might", "must", "may"], a: 1, why: "강한 확신 → must." },
      { q: "Take an umbrella. It ___ rain later.", c: ["must", "should", "may"], a: 2, why: "가능성 → may/might rain." },
    ],
  },
  {
    id: "indirectq", phase: 3, title: "공손한 질문", pattern: "Do you know + 의문사 + 주어 + 동사?",
    explain: "\"Where is the station?\"보다 \"Do you know where the station is?\"가 훨씬 공손. 주의: 뒤쪽 어순이 평서문(주어+동사)으로 바뀝니다.",
    examples: [
      ["Do you know where the exit is?", "출구가 어디인지 아세요?"],
      ["Could you tell me how much it costs?", "가격이 얼마인지 알려 주시겠어요?"],
      ["I wonder what time the store opens.", "가게가 몇 시에 여는지 궁금하네요."],
    ],
    quiz: [
      { q: "Do you know where ___?", c: ["she lives", "does she live", "lives she"], a: 0, why: "간접의문문은 평서문 어순(주어+동사)." },
      { q: "Could you tell me what time ___?", c: ["is it", "it is", "does it"], a: 1, why: "what time + 주어(it) + 동사(is)." },
      { q: "I don't know why ___ angry.", c: ["is he", "does he", "he is"], a: 2, why: "why + he is (평서문 어순)." },
    ],
  },
  {
    id: "tagq", phase: 3, title: "맞장구 질문", pattern: "~, isn't it? / ~, right?",
    explain: "문장 끝에 \"그렇지?\"를 붙여 대화를 부드럽게 이어가는 기술. 긍정문엔 부정 꼬리(It's hot, isn't it?), 어려우면 만능 \", right?\"를 쓰세요.",
    examples: [
      ["Nice weather, isn't it?", "날씨 좋네요, 그렇죠?"],
      ["You're coming tomorrow, right?", "너 내일 오는 거지, 맞지?"],
      ["She doesn't eat meat, does she?", "그녀는 고기 안 먹죠, 그렇죠?"],
    ],
    quiz: [
      { q: "It's really cold today, ___?", c: ["isn't it", "is it", "doesn't it"], a: 0, why: "It's(긍정) → 부정 꼬리 isn't it." },
      { q: "You like coffee, ___ you?", c: ["aren't", "don't", "won't"], a: 1, why: "일반동사 like → don't you." },
      { q: "He can swim, ___ he?", c: ["doesn't", "isn't", "can't"], a: 2, why: "can → 꼬리도 can't." },
    ],
  },
];

export const GRAMMAR_PHASE_LABELS = {
  1: "1개월차 · 문장의 뼈대",
  2: "2개월차 · 표현 넓히기",
  3: "3개월차 · 자연스러움 완성",
};

export function getPattern(id) {
  return GRAMMAR_PATTERNS.find((g) => g.id === id);
}
