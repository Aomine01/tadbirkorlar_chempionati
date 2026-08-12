export type Language = "uz" | "ru" | "en";

export type TranslationKey =
  // Navbar
  | "nav.home"
  | "nav.about"
  | "nav.roadmap"
  | "nav.experts"
  | "nav.faq"
  | "nav.participants"
  | "nav.apply"
  | "nav.dashboard"
  | "nav.adminPanel"
  // Hero
  | "hero.title1"
  | "hero.title2"
  | "hero.subtitle"
  | "hero.button"
  // About
  | "about.label"
  | "about.heading1"
  | "about.heading2"
  | "about.text"
  // Stats
  | "stats.scrollText"
  | "stats.counter1.label"
  | "stats.counter2.label"
  | "stats.counter3.label"
  | "stats.counter4.label"
  // Roadmap
  | "roadmap.label"
  | "roadmap.heading"
  | "roadmap.step1.title"
  | "roadmap.step1.subtext"
  | "roadmap.step2.title"
  | "roadmap.step2.subtext"
  | "roadmap.step3.title"
  | "roadmap.step3.subtext"
  | "roadmap.step4.title"
  | "roadmap.step4.subtext"
  | "roadmap.step5.title"
  | "roadmap.step5.subtext"
  // PositiveSides
  | "positive.label"
  | "positive.heading"
  | "positive.card1.title"
  | "positive.card1.desc"
  | "positive.card2.title"
  | "positive.card2.desc"
  | "positive.card3.title"
  | "positive.card3.desc"
  | "positive.card4.title"
  | "positive.card4.desc"
  | "positive.card5.title"
  | "positive.card5.desc"
  | "positive.card6.title"
  | "positive.card6.desc"
  // Categories
  | "cat.label"
  | "cat.heading"
  | "cat.button"
  | "cat.biz.title"
  | "cat.biz.desc"
  | "cat.startup.title"
  | "cat.startup.desc"
  | "cat.idea.title"
  | "cat.idea.desc"
  // Experts
  | "experts.label"
  | "experts.heading"
  // FAQ
  | "faq.label"
  | "faq.heading"
  | "faq.q1" | "faq.a1"
  | "faq.q2" | "faq.a2"
  | "faq.q3" | "faq.a3"
  | "faq.q4" | "faq.a4"
  | "faq.q5" | "faq.a5"
  | "faq.q6" | "faq.a6"
  | "faq.q7" | "faq.a7"
  | "faq.q8" | "faq.a8"
  | "faq.q9" | "faq.a9"
  | "faq.q10" | "faq.a10"
  | "faq.q11" | "faq.a11"
  // CTA
  | "cta.title1"
  | "cta.title2"
  | "cta.button"
  // Footer
  | "footer.contact"
  | "footer.sections"
  | "footer.apply"
  | "footer.startup"
  | "footer.ideas"
  | "footer.business"
  | "footer.copyright"
  | "footer.poweredby"
  // Theme toggle titles
  | "theme.toDark"
  | "theme.toLight";

type Translations = Record<Language, Record<TranslationKey, string>>;

export const translations: Translations = {
  uz: {
    // Navbar
    "nav.home": "Bosh sahifa",
    "nav.about": "Chempionat",
    "nav.roadmap": "Bosqichlar",
    "nav.experts": "Ekspertlar",
    "nav.faq": "FAQ",
    "nav.participants": "Ishtirokchilar",
    "nav.apply": "Ariza topshirish",
    "nav.dashboard": "Dashboard",
    "nav.adminPanel": "Admin Panel",
    // Hero
    "hero.title1": "YOSH TADBIRKORLAR",
    "hero.title2": "CHEMPIONATI",
    "hero.subtitle": "Startapingiz yoki biznesingizni taqdim eting va investitsiya uchun kurashing",
    "hero.button": "Ariza topshirish",
    // About
    "about.label": "Chempionat haqida",
    "about.heading1": "CHEMPIONATDA",
    "about.heading2": "NIMALAR KUTILMOQDA",
    "about.text": "Yurtboshimizning PQ-59 sonli qaroriga asosan tashkil qilingan va har yili o'tkaziladia tanlov bo'lib, 18 yoshdan 30 yoshgacha bo'lgan an'anaviy biznes va startapga ega yoshlar ishtirok etishi mumkin. Tanlov yakunida 100 tagacha biznes va startap loyihalarning har biriga 1 milliard soʻmgacha investitsiya kiritiladi, ularni brendga aylantirish uchun moliyaviy va marketing xizmatlari boʻyicha ekspertlarning bazaviy hisoblash miqdorining 100 baravarigacha miqdorda xarajatlari toʻlab beriladi.",
    // Stats
    "stats.scrollText": "INVESTITSIYA ORQALI - ENG KUCHLI G'OYALAR, ENG JASUR TADBIRKORLAR VA ULARDAN O'SIB CHIQADIGAN DUNYO MIQYOSIDAGI O'ZBEK BRENDLARINI QO'LLAB-QUVVATLAYMIZ",
    "stats.counter1.label": "Yo'nalish",
    "stats.counter2.label": "So'mgacha Investitsiya",
    "stats.counter3.label": "Grant",
    "stats.counter4.label": "G'oliblar soni",
    // Roadmap
    "roadmap.label": "Yo'l xaritasi",
    "roadmap.heading": "CHEMPIONAT YO'L XARITASI",
    "roadmap.step1.title": "Ro'yxatdan o'tish",
    "roadmap.step1.subtext": "Arizalarni qabul qilish va shakllantirish",
    "roadmap.step2.title": "1-Bosqich va natijalar",
    "roadmap.step2.subtext": "Dastlabki saralash va loyihalarni baholash",
    "roadmap.step3.title": "2-Bosqich va natijalar",
    "roadmap.step3.subtext": "Yarim final va akseleratsiya bosqichi",
    "roadmap.step4.title": "Final bosqichi",
    "roadmap.step4.subtext": "Eng kuchli loyihalar taqdimoti va pitch",
    "roadmap.step5.title": "Taqdirlash marosimi",
    "roadmap.step5.subtext": "G'oliblarga investitsiya va grant topshirish",
    // PositiveSides
    "positive.label": "Chempionat afzalliklari",
    "positive.heading": "NIMA UCHUN \nISHTIROK ETISH KERAK",
    "positive.card1.title": "1 mlrd so'mgacha investitsiya",
    "positive.card1.desc": "Eng kuchli 100 tagacha tadbirkorlar o'z loyihalarini rivojlantirish uchun 1 mlrd. so'mgacha investitsiya qo'lga kiritadi.",
    "positive.card2.title": "100 BHM miqdorda grant",
    "positive.card2.desc": "Moliyaviy va marketing xizmatlari boʻyicha ekspertlarning bazaviy hisoblash miqdorining 100 baravarigacha xarajatlari toʻlab beriladi.",
    "positive.card3.title": "Brend shakllantirish",
    "positive.card3.desc": "Loyihalar media, TV va omma oldida targ'ib qilinib, kuchli brend va ishonchli qiyofaga ega bo'ladi.",
    "positive.card4.title": "Yosh tadbirkor Chempion unvoni",
    "positive.card4.desc": "G'olib bo'lgan ishtirokchilar ‘Yosh chempion tadbirkor’ unvoniga ega bo'ladi.",
    "positive.card5.title": "Davlat mukofotlariga tavsiya etilish",
    "positive.card5.desc": "Chempionlar davlat mukofotlari, ‘Faol tadbirkor’ va ‘Oʻzbekiston belgisi’ koʻkrak nishonlariga tavsiya etiladi",
    "positive.card6.title": "Xalqaro dasturlarda amaliyot",
    "positive.card6.desc": "Chempionat gʻoliblari nufuzli xorijiy akseleratorlar va kompaniyalarga amaliyot oʻtash dasturlariga yuboriladi",
    // Categories
    "cat.label": "Chempionat yo'nalishlari",
    "cat.heading": "2ta yo'nalish bo'yicha ariza \nqabul qilamiz",
    "cat.button": "Ariza topshirish",
    "cat.biz.title": "An'anaviy biznes",
    "cat.biz.desc": "Sizda allaqachon ishlayotgan biznes bor. Uni kengaytiring, yangi darajaga olib chiqing va O'zbekistondagi yirik kompaniyalardan biriga aylaning.",
    "cat.startup.title": "Startap",
    "cat.startup.desc": "Siz muammoga aniq va kuchli yechim topgansiz. Endi uni tezroq o'stiring, investitsiya jalb qiling va katta o'yinchilardan biriga aylaning.",
    "cat.idea.title": "G'oya",
    "cat.idea.desc": "Sizda hali amalga oshirilmagan, lekin kuchli potensialga ega g'oya bor. Uni real mahsulotga aylantiring, MVP chiqaring va investitsiya olib keyingi bosqichga olib chiqing.",
    // Experts
    "experts.label": "HAKAMLAR",
    "experts.heading": "jamg'arma kengashi a'zolari",
    // FAQ
    "faq.label": "FAQ",
    "faq.heading": "Ko'p beriladigan savollar",
    "faq.q1": "Kimlar ishtirok etishi mumkin?",
    "faq.a1": "Chempionatda quyidagi talablarga javob beradigan tadbirkorlar ishtirok etishi mumkin:\n\n• 18–30 yosh oralig'idagi O'zbekiston Respublikasi fuqarolari;\n• faoliyatini MChJ shaklida yuritayotgan tadbirkorlar;\n• MChJ kamida 6 oy davomida faoliyat yuritgan va tasdiqlangan biznes aylanmasiga ega bo'lishi;\n• biznesni kengaytirish, yangi ish o'rinlari yaratish hamda ishlab chiqarish yoki xizmat ko'rsatish hajmini oshirish salohiyatiga ega bo'lishi.",
    "faq.q2": "Yakka tartibdagi tadbirkorlar ishtirok etishi mumkinmi?",
    "faq.a2": "Chempionatda faqat MChJ shaklida faoliyat yuritayotgan tadbirkorlik subyektlari ishtirok etishi mumkin.\n\nYakka tartibdagi tadbirkorda ustav fondi va ustav kapitalidagi ulush mavjud emas. Chempionat doirasida loyihalarga investitsiya kiritish kompaniya ustav kapitalidagi ulush bilan bog'liq bo'lganligi sababli, ishtirokchilardan faoliyatini MChJ shaklida yuritishi talab etiladi.\n\nYATT sifatida faoliyat yuritayotgan tadbirkor Chempionatda ishtirok etish uchun MChJ tashkil etishi va biznes faoliyatini ushbu MChJ orqali davom ettirishi lozim.",
    "faq.q3": "Bu qarzmi? Nimani evaziga pul beriladi?",
    "faq.a3": "Qarz emas. Investitsiya sizning ustav kapitalingizga kiritiladigan ulush. Shakli loyihaga qarab farqlanadi — to'g'ridan-to'g'ri ulushdorlik, konvertatsiya qilinadigan moliyalashtirish yoki grant elementi mavjud aralash moliyalashtirish.",
    "faq.q4": "Investitsiyani nimaga ishlatish mumkin va mumkin emas?",
    "faq.a4": "Mumkin: uskunalar, dasturiy ta'minot, MVP, marketing, sertifikatlash, eksportga tayyorgarlik, mutaxassislar, aylanma mablag'lar. Mumkin emas: avvalgi qarzlar, dividendlar, shaxsiy xarajatlar, taqiqlangan faoliyat.",
    "faq.q5": "G'olib bo'lgach nima bo'ladi?",
    "faq.a5": "Investitsiya shartnomasi tuziladi, mablag' bir martalik yoki transhlar asosida ajratiladi. Har chorakda hisobot topshirasiz, loyihangiz KPI lar orqali monitoring qilinadi.",
    "faq.q6": "KPI ga erisha olmasam nima bo'ladi?",
    "faq.a6": "Keyingi transh to'xtatilishi, investitsiya shartlari qayta ko'rib chiqilishi yoki shartnoma bekor qilinishi mumkin. Jiddiy buzilishlarda mablag'lar qonunchilik asosida undiriladi.",
    "faq.q7": "G'oyam maxfiymi?",
    "faq.a7": "Ha. Taqdim etilgan biznes-reja, moliyaviy model va tijorat sirlari uchinchi shaxslarga oshkor etilmaydi.",
    "faq.q8": "Hali tadbirkorlik subyektim ro'yxatdan o'tmagan, ishtirok etsam bo'ladimi?",
    "faq.a8": "Ha, fuqarolik sifatida ariza berish mumkin — g'olib bo'lgach tadbirkorlik subyekti tashkil etish sharti bilan.",
    "faq.q9": "Loyihalar qanday mezonlar asosida baholanadi?",
    "faq.a9": "Biznes modelning asoslanganligi, bozor salohiyati, moliyaviy barqarorlik, jamoa malakasi, innovatsionlik darajasi, texnologik tayyorgarlik, ish o'rinlari yaratish imkoniyati, eksport salohiyati va qo'shimcha xususiy investitsiya jalb qilish imkoniyati. Baholash ikki bosqichda — hujjatlar asosida va pitch taqdimotda amalga oshiriladi.",
    "faq.q10": "Apellyatsiya qanday beriladi?",
    "faq.a10": "Natijalar e'lon qilingan kundan e'tiboran 3 ish kuni ichida yozma yoki elektron shaklda Jamg'armaga apellyatsiya kiritish mumkin. Jamg'arma 10 kun ichida ko'rib chiqib javob beradi.",
    "faq.q11": "Bir nechta odam jamoa sifatida ariza bera oladimi?",
    "faq.a11": "Ha. Jamoa sifatida yuridik shaxs orqali ariza berish mumkin — biroq ustav kapitalining kamida 50% 30 yoshgacha bo'lgan tadbirkorga tegishli bo'lishi shart.",
    // CTA
    "cta.title1": "YOSH TADBIRKORLAR",
    "cta.title2": "CHEMPIONATI",
    "cta.button": "Ariza topshirish",
    // Footer
    "footer.contact": "Savollaringiz bormi? Admin bilan bog'laning:",
    "footer.sections": "Bo'limlar",
    "footer.apply": "Ariza",
    "footer.startup": "Startap uchun",
    "footer.ideas": "G'oya uchun",
    "footer.business": "Biznes uchun",
    "footer.copyright": "Powered by",
    "footer.poweredby": "Yoshlar ishlari agentligi",
    // Theme
    "theme.toDark": "Qorong'u rejimga o'tish",
    "theme.toLight": "Kun rejimiga o'tish",
  },

  ru: {
    // Navbar
    "nav.home": "Главная",
    "nav.about": "О чемпионате",
    "nav.roadmap": "Этапы",
    "nav.experts": "Эксперты",
    "nav.faq": "FAQ",
    "nav.participants": "Участники",
    "nav.apply": "Подать заявку",
    "nav.dashboard": "Личный кабинет",
    "nav.adminPanel": "Панель админа",
    // Hero
    "hero.title1": "ЧЕМПИОНАТ МОЛОДЫХ",
    "hero.title2": "ПРЕДПРИНИМАТЕЛЕЙ",
    "hero.subtitle": "Представьте свой стартап, бизнес или идею и боритесь за инвестиции",
    "hero.button": "Подать заявку",
    // About
    "about.label": "О чемпионате",
    "about.heading1": "ЧТО ЖДЁТ",
    "about.heading2": "НА ЧЕМПИОНАТЕ",
    "about.text": "Ежегодный конкурс, организованный на основании постановления главы государства ПП-59, в котором могут участвовать молодые люди в возрасте от 18 до 30 лет с традиционным бизнесом, стартапом или идеей. По итогам конкурса до 100 бизнес- и стартап-проектов получат инвестиции до 1 млрд сумов, а также покрытие расходов в размере до 100 базовых расчётных величин на маркетинговые и финансовые консультации для развития в бренд.",
    // Stats
    "stats.scrollText": "ЧЕРЕЗ ИНВЕСТИЦИИ — ПОДДЕРЖИВАЕМ СИЛЬНЕЙШИЕ ИДЕИ, САМЫХ СМЕЛЫХ ПРЕДПРИНИМАТЕЛЕЙ И УЗБЕКСКИЕ БРЕНДЫ МИРОВОГО УРОВНЯ, КОТОРЫЕ ОНИ СОЗДАЮТ",
    "stats.counter1.label": "Направления",
    "stats.counter2.label": "Сумов инвестиций",
    "stats.counter3.label": "Грант (БРВ)",
    "stats.counter4.label": "Победителей",
    // Roadmap
    "roadmap.label": "Дорожная карта",
    "roadmap.heading": "ДОРОЖНАЯ КАРТА ЧЕМПИОНАТА",
    "roadmap.step1.title": "Регистрация",
    "roadmap.step1.subtext": "Приём и оформление заявок",
    "roadmap.step2.title": "1-й этап и результаты",
    "roadmap.step2.subtext": "Первичный отбор и оценка проектов",
    "roadmap.step3.title": "2-й этап и результаты",
    "roadmap.step3.subtext": "Полуфинал и акселерационный этап",
    "roadmap.step4.title": "Финальный этап",
    "roadmap.step4.subtext": "Презентация сильнейших проектов и питч",
    "roadmap.step5.title": "Церемония награждения",
    "roadmap.step5.subtext": "Вручение инвестиций и грантов победителям",
    // PositiveSides
    "positive.label": "Преимущества чемпионата",
    "positive.heading": "ПОЧЕМУ СТОИТ \nПРИНЯТЬ УЧАСТИЕ",
    "positive.card1.title": "Инвестиции до 1 млрд сумов",
    "positive.card1.desc": "До 100 сильнейших предпринимателей получат инвестиции до 1 млрд сумов для развития своих проектов.",
    "positive.card2.title": "Грант в размере 100 БРВ",
    "positive.card2.desc": "Оплачиваются расходы в размере до 100 базовых расчётных величин на услуги экспертов по финансам и маркетингу.",
    "positive.card3.title": "Формирование бренда",
    "positive.card3.desc": "Проекты получат продвижение в СМИ, на телевидении и среди широкой аудитории, формируя сильный бренд.",
    "positive.card4.title": "Звание «Молодой чемпион-предприниматель»",
    "positive.card4.desc": "Победители получат почётное звание «Молодой чемпион-предприниматель».",
    "positive.card5.title": "Рекомендация на госнаграды",
    "positive.card5.desc": "Чемпионы будут рекомендованы к государственным наградам, знаку «Активный предприниматель» и нагрудному знаку «Знак Узбекистана».",
    "positive.card6.title": "Стажировка в международных программах",
    "positive.card6.desc": "Победители чемпионата будут направлены на стажировки в известные зарубежные акселераторы и компании.",
    // Categories
    "cat.label": "Направления чемпионата",
    "cat.heading": "Принимаем заявки \nпо 3 направлениям",
    "cat.button": "Подать заявку",
    "cat.biz.title": "Традиционный бизнес",
    "cat.biz.desc": "У вас уже работающий бизнес. Расширьте его, выведите на новый уровень и станьте одной из крупных компаний Узбекистана.",
    "cat.startup.title": "Стартап",
    "cat.startup.desc": "Вы нашли чёткое и мощное решение проблемы. Теперь масштабируйте его быстрее, привлекайте инвестиции и станьте крупным игроком.",
    "cat.idea.title": "Идея",
    "cat.idea.desc": "У вас есть ещё не реализованная идея с сильным потенциалом. Превратите её в реальный продукт, создайте MVP и выйдите на следующий уровень с инвестициями.",
    // Experts
    "experts.label": "ЖЮРИ",
    "experts.heading": "Члены совета фонда",
    // FAQ
    "faq.label": "FAQ",
    "faq.heading": "Часто задаваемые вопросы",
    "faq.q1": "Кто может участвовать?",
    "faq.a1": "В чемпионате могут участвовать предприниматели, отвечающие следующим требованиям:\n\n• Граждане Республики Узбекистан в возрасте от 18 до 30 лет;\n• Предприниматели, ведущие деятельность в форме ООО;\n• ООО должно функционировать не менее 6 месяцев и иметь подтверждённый бизнес-оборот;\n• Наличие потенциала для расширения бизнеса, создания новых рабочих мест и увеличения объёмов производства или услуг.",
    "faq.q2": "Могут ли участвовать индивидуальные предприниматели?",
    "faq.a2": "В чемпионате могут участвовать только субъекты предпринимательства, функционирующие в форме ООО.\n\nУ индивидуального предпринимателя отсутствует уставный фонд и доля в уставном капитале. Поскольку инвестирование в проекты в рамках чемпионата связано с долей в уставном капитале компании, от участников требуется ведение деятельности в форме ООО.\n\nИП, желающий принять участие в чемпионате, должен зарегистрировать ООО и продолжить бизнес-деятельность через него.",
    "faq.q3": "Это заём? За что выдаются деньги?",
    "faq.a3": "Не заём. Инвестиции — это доля, вносимая в ваш уставный капитал. Форма варьируется в зависимости от проекта — прямое участие, конвертируемое финансирование или смешанное с грантовым элементом.",
    "faq.q4": "На что можно и нельзя использовать инвестиции?",
    "faq.a4": "Можно: оборудование, программное обеспечение, MVP, маркетинг, сертификация, подготовка к экспорту, специалисты, оборотные средства. Нельзя: погашение прежних долгов, дивиденды, личные расходы, запрещённая деятельность.",
    "faq.q5": "Что происходит после победы?",
    "faq.a5": "Заключается инвестиционный договор, средства выделяются единоразово или траншами. Раз в квартал подаётся отчёт, проект мониторируется по KPI.",
    "faq.q6": "Что будет, если я не достигну KPI?",
    "faq.a6": "Следующий транш может быть приостановлен, условия инвестирования — пересмотрены, либо договор расторгнут. При серьёзных нарушениях средства взыскиваются в соответствии с законодательством.",
    "faq.q7": "Моя идея конфиденциальна?",
    "faq.a7": "Да. Предоставленные бизнес-план, финансовая модель и коммерческая тайна не раскрываются третьим лицам.",
    "faq.q8": "Мой субъект предпринимательства ещё не зарегистрирован — могу ли я участвовать?",
    "faq.a8": "Да, можно подать заявку как физическое лицо — при условии регистрации субъекта предпринимательства в случае победы.",
    "faq.q9": "По каким критериям оцениваются проекты?",
    "faq.a9": "Обоснованность бизнес-модели, рыночный потенциал, финансовая устойчивость, компетентность команды, уровень инновационности, технологическая готовность, возможность создания рабочих мест, экспортный потенциал и способность привлечь дополнительные частные инвестиции. Оценка проходит в два этапа — по документам и на питч-презентации.",
    "faq.q10": "Как подать апелляцию?",
    "faq.a10": "В течение 3 рабочих дней с момента объявления результатов можно подать апелляцию в Фонд в письменном или электронном виде. Фонд рассмотрит её в течение 10 дней.",
    "faq.q11": "Может ли команда из нескольких человек подать заявку?",
    "faq.a11": "Да. Команда может подать заявку через юридическое лицо — однако не менее 50% уставного капитала должно принадлежать предпринимателю в возрасте до 30 лет.",
    // CTA
    "cta.title1": "ЧЕМПИОНАТ МОЛОДЫХ",
    "cta.title2": "ПРЕДПРИНИМАТЕЛЕЙ",
    "cta.button": "Подать заявку",
    // Footer
    "footer.contact": "Есть вопросы? Свяжитесь с администратором:",
    "footer.sections": "Разделы",
    "footer.apply": "Заявка",
    "footer.startup": "Для стартапа",
    "footer.ideas": "Для идеи",
    "footer.business": "Для бизнеса",
    "footer.copyright": "Powered by",
    "footer.poweredby": "Агентство по делам молодёжи",
    // Theme
    "theme.toDark": "Переключить на тёмный режим",
    "theme.toLight": "Переключить на светлый режим",
  },

  en: {
    // Navbar
    "nav.home": "Home",
    "nav.about": "Championship",
    "nav.roadmap": "Stages",
    "nav.experts": "Experts",
    "nav.faq": "FAQ",
    "nav.participants": "Participants",
    "nav.apply": "Apply Now",
    "nav.dashboard": "Dashboard",
    "nav.adminPanel": "Admin Panel",
    // Hero
    "hero.title1": "YOUNG ENTREPRENEURS",
    "hero.title2": "CHAMPIONSHIP",
    "hero.subtitle": "Present your startup, business or idea and compete for investment",
    "hero.button": "Apply Now",
    // About
    "about.label": "About the Championship",
    "about.heading1": "WHAT TO EXPECT",
    "about.heading2": "AT THE CHAMPIONSHIP",
    "about.text": "An annual competition established by Presidential Decree PP-59, open to young people aged 18 to 30 with a traditional business, startup, or idea. Upon completion, up to 100 business and startup projects will each receive investments of up to 1 billion soums, plus coverage of up to 100 times the base calculation unit for financial and marketing expert services to help them develop into brands.",
    // Stats
    "stats.scrollText": "THROUGH INVESTMENT — WE SUPPORT THE STRONGEST IDEAS, THE BOLDEST ENTREPRENEURS, AND THE WORLD-CLASS UZBEK BRANDS THEY WILL BUILD",
    "stats.counter1.label": "Directions",
    "stats.counter2.label": "Soums in Investment",
    "stats.counter3.label": "Grant (BCU)",
    "stats.counter4.label": "Winners",
    // Roadmap
    "roadmap.label": "Road Map",
    "roadmap.heading": "CHAMPIONSHIP ROAD MAP",
    "roadmap.step1.title": "Registration",
    "roadmap.step1.subtext": "Application submission and processing",
    "roadmap.step2.title": "Stage 1 & Results",
    "roadmap.step2.subtext": "Initial screening and project evaluation",
    "roadmap.step3.title": "Stage 2 & Results",
    "roadmap.step3.subtext": "Semi-final and acceleration phase",
    "roadmap.step4.title": "Final Stage",
    "roadmap.step4.subtext": "Top project presentations and pitch",
    "roadmap.step5.title": "Award Ceremony",
    "roadmap.step5.subtext": "Delivering investments and grants to winners",
    // PositiveSides
    "positive.label": "Championship Benefits",
    "positive.heading": "WHY YOU SHOULD \nPARTICIPATE",
    "positive.card1.title": "Up to 1 Billion Soums in Investment",
    "positive.card1.desc": "Up to 100 of the strongest entrepreneurs will secure investments of up to 1 billion soums to develop their projects.",
    "positive.card2.title": "Grant of 100 BCU",
    "positive.card2.desc": "Expenses of up to 100 base calculation units for financial and marketing expert services will be covered.",
    "positive.card3.title": "Brand Development",
    "positive.card3.desc": "Projects will be promoted across media, TV, and public platforms, building a strong brand and trusted image.",
    "positive.card4.title": "Young Champion Entrepreneur Title",
    "positive.card4.desc": "Winning participants will receive the honorary title of \"Young Champion Entrepreneur\".",
    "positive.card5.title": "State Award Nominations",
    "positive.card5.desc": "Champions will be nominated for state awards, the \"Active Entrepreneur\" badge, and the \"Sign of Uzbekistan\" medal.",
    "positive.card6.title": "International Internships",
    "positive.card6.desc": "Championship winners will be sent to internship programmes at prestigious foreign accelerators and companies.",
    // Categories
    "cat.label": "Championship Tracks",
    "cat.heading": "We accept applications \nin 3 tracks",
    "cat.button": "Apply Now",
    "cat.biz.title": "Traditional Business",
    "cat.biz.desc": "You already have a running business. Expand it, take it to the next level, and become one of Uzbekistan's major companies.",
    "cat.startup.title": "Startup",
    "cat.startup.desc": "You've found a clear and powerful solution to a problem. Now scale it faster, attract investment, and become a major player.",
    "cat.idea.title": "Idea",
    "cat.idea.desc": "You have an idea with strong potential that hasn't been realised yet. Turn it into a real product, launch an MVP, and take it to the next level with investment.",
    // Experts
    "experts.label": "JURY",
    "experts.heading": "Fund Board Members",
    // FAQ
    "faq.label": "FAQ",
    "faq.heading": "Frequently Asked Questions",
    "faq.q1": "Who can participate?",
    "faq.a1": "Entrepreneurs meeting the following requirements can participate:\n\n• Citizens of the Republic of Uzbekistan aged 18–30;\n• Entrepreneurs operating as an LLC;\n• The LLC must have been active for at least 6 months with a confirmed business turnover;\n• Must have the potential to expand business, create new jobs, and increase production or service volumes.",
    "faq.q2": "Can sole proprietors participate?",
    "faq.a2": "Only business entities operating as LLCs may participate in the Championship.\n\nA sole proprietor does not have a charter fund or a share in the charter capital. Since investment in projects within the Championship is linked to a share in the company's charter capital, participants are required to operate as an LLC.\n\nA sole proprietor wishing to participate must establish an LLC and continue their business activities through it.",
    "faq.q3": "Is this a loan? What is given in return?",
    "faq.a3": "It is not a loan. The investment is a share contributed to your charter capital. The form varies by project — direct equity, convertible financing, or mixed financing with a grant element.",
    "faq.q4": "What can and cannot the investment be used for?",
    "faq.a4": "Allowed: equipment, software, MVP, marketing, certification, export readiness, specialists, working capital. Not allowed: repaying previous debts, dividends, personal expenses, prohibited activities.",
    "faq.q5": "What happens after winning?",
    "faq.a5": "An investment agreement is signed and funds are allocated in a lump sum or in tranches. You submit a report quarterly and your project is monitored against KPIs.",
    "faq.q6": "What happens if I miss my KPIs?",
    "faq.a6": "The next tranche may be suspended, investment terms may be revised, or the agreement may be terminated. In cases of serious violation, funds are recovered in accordance with legislation.",
    "faq.q7": "Is my idea confidential?",
    "faq.a7": "Yes. The submitted business plan, financial model, and trade secrets will not be disclosed to third parties.",
    "faq.q8": "My business entity is not yet registered — can I still apply?",
    "faq.a8": "Yes, you can apply as an individual — on the condition that a business entity is established if you win.",
    "faq.q9": "By what criteria are projects evaluated?",
    "faq.a9": "Soundness of the business model, market potential, financial sustainability, team competence, level of innovation, technological readiness, job creation potential, export potential, and the ability to attract additional private investment. Evaluation takes place in two stages — based on documents and during a pitch presentation.",
    "faq.q10": "How is an appeal submitted?",
    "faq.a10": "An appeal can be submitted to the Fund in written or electronic form within 3 business days of the announcement of results. The Fund will review and respond within 10 days.",
    "faq.q11": "Can a team of multiple people apply?",
    "faq.a11": "Yes. A team can apply through a legal entity — however, at least 50% of the charter capital must belong to an entrepreneur under the age of 30.",
    // CTA
    "cta.title1": "YOUNG ENTREPRENEURS",
    "cta.title2": "CHAMPIONSHIP",
    "cta.button": "Apply Now",
    // Footer
    "footer.contact": "Have questions? Contact the admin:",
    "footer.sections": "Sections",
    "footer.apply": "Apply",
    "footer.startup": "For Startup",
    "footer.ideas": "For Idea",
    "footer.business": "For Business",
    "footer.copyright": "Powered by",
    "footer.poweredby": "Youth Affairs Agency",
    // Theme
    "theme.toDark": "Switch to dark mode",
    "theme.toLight": "Switch to light mode",
  },
};
