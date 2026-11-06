/* ============================================================
   ПАНТЕОН — app.js
   Афиша · арт-лавка · калькулятор · заявки · CRM (воронка, экспорт, Telegram)
   ============================================================ */
(function () {
  'use strict';

  const $  = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const money = n => new Intl.NumberFormat('ru-RU').format(Math.round(n)) + ' ₽';
  const digits = s => (s || '').replace(/\D/g, '');

  const LS = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };

  /* ---------------- Каталог услуг ---------------- */
  const SERVICES = {
    // 1. АРТ мастерская по пятницам
    art_friday: {
      label: 'АРТ мастерская по пятницам (18:30)',
      short: 'АРТ мастерская', price: 2500, per: 'участник', qty: true,
      note: 'Каждую пятницу 18:30 (2 часа, до 8 мест). Роспись одежды, холст, карта желаний, свечи и чай.'
    },
    // 2. Вечер для мамы
    mom_evening: {
      label: 'Вечер для мамы, досуг (Мамин день, Чт 16:00)',
      short: 'Мамин день', price: 1000, per: 'мама+ребёнок', qty: true,
      note: 'Каждый четверг 16:00 (2 часа, до 7 мам). Своп детских вещей, эксперт, детская зона творчества. Доп. ребёнок +500 ₽.'
    },
    // 3. Вечер знакомств
    dating_evening: {
      label: 'Вечер знакомств «Атмосфера сближения» (Сб 20:00)',
      short: 'Вечер знакомств', price: 2000, per: 'участник', qty: true,
      note: 'Суббота 20:00 (25–45 лет, 2 часа). Живой формат, видео на iPhone, чай/угощения, тайное голосование. 7М + 7Ж.'
    },
    // 4. Квест для детей
    quest_kuku: {
      label: 'Квест-игра для детей «Лаборатория доктора КУ-КУ»',
      short: 'Квест доктора КУ-КУ', price: 1500, per: 'участник', qty: true,
      note: 'Пятница 16:00 (6–14 лет, 1.5 часа). Интерактивные научные опыты, халаты и очки включены.'
    },
    // 5. Фото-движ
    photo_dvizh: {
      label: 'Фото-движ «Создадим кадр, который порвёт ленту»',
      short: 'Фото-движ', price: 2500, per: 'участник', qty: true,
      note: 'Воскресенье 14:00 (1.5 часа, до 8 участников). 10 необычных фото, видео в день съёмки, профи свет.'
    },
    // 6. Зоо Тайм с кроликами
    zoo_time: {
      label: 'Зоо Тайм с кроликами (Сб 13:00–15:00)',
      short: 'Зоо Тайм с кроликами', price: 700, per: 'гость', qty: true,
      note: 'Суббота 13:00–15:00 (1 час). Общение с кроликами, кормление, костюмерная и фотозоны. Дети до 3 лет бесплатно.'
    },
    // 7. Женский клуб
    women_club: {
      label: 'Женский клуб «ВОЛШЕБНАЯ СРЕДА» (Ср 18:30)',
      short: 'Женский клуб', price: 0, per: 'участница', qty: false,
      note: 'Среда 18:30–21:00 (до 15 участниц). Бесплатная встреча, своп, нетворкинг, чаепитие, закрытый чат.'
    },
    // 8. Иммерсивная экскурсия
    excursion_immersive: {
      label: 'Иммерсивная экскурсия по арт-пространству',
      short: 'Экскурсия по Пантеону', price: 500, per: 'гость', qty: true,
      note: '«Исследователь» (7–14 лет, 500 ₽) или «Авторский взгляд» (14+, 800 ₽). Костюмерная включена.'
    },
    // 9. Аренда фотостудии
    rent_studio: {
      label: 'Аренда фотостудии (10 локаций + циклорама)',
      short: 'Аренда фотостудии', price: 3000, per: 'час', qty: true,
      note: 'Круглосуточно: 10 локаций + циклорама, свет, мыльные пузыри, реквизит. До 10 чел (свыше +500 ₽/чел).'
    },
    // 10. Аренда реквизита
    rent_props: {
      label: 'Аренда реквизита и оборудования',
      short: 'Аренда реквизита', price: 500, per: 'позиция', qty: true,
      note: 'Свадебные арки, крылья ангела, платья, корсеты, свет, дым/снег-машина, гирлянды. Доставка по городу.'
    },
    // 11. Экспресс-фотосессия
    photo_express: {
      label: 'Экспресс-фотосессия в фотозонах (20 минут)',
      short: 'Экспресс-фотосессия', price: 3500, per: 'съёмка', qty: false,
      note: '20 минут, 40+ исходников, 15–20 фото в цветокоррекции за 2–3 дня. До 4 участников. Животные +500 ₽.'
    },
    // 12. Подарочный сертификат
    cert_photo: {
      label: 'Подарочный сертификат на фотосессию',
      short: 'Сертификат на фотосессию', price: 8000, per: 'сертификат', qty: true,
      note: 'Пакеты: Экспресс 8 000 ₽ / Часовая 12 000 ₽ / Всё включено 15 000 ₽. Крафтовое оформление.'
    },
    // 13. Фотосессии от создателя
    photo_author: {
      label: 'Фотосессия от создателя (Ольга Вознесенская)',
      short: 'Фотосессия от создателя', price: 6000, per: 'съёмка', qty: false,
      note: 'Лайт 6 000 ₽ / Стандарт 8 000 ₽ / Всё включено 15 000 ₽ (с макияжем, укладкой и Reels). Ретушь всех фото.'
    },
    // 14. Выпускные альбомы
    grad_albums: {
      label: 'Изготовление выпускных альбомов',
      short: 'Выпускные альбомы', price: 3000, per: 'альбом', qty: true,
      note: 'Аренда студии в подарок! Папка Куб 3 000 ₽, Трио 3 500 ₽, Базовая 4 500 ₽, Премиум 6 000 ₽. Учителю бесплатно.'
    },
    // Псевдонимы для совместимости
    visite: {
      label: 'Иммерсивная экскурсия по арт-пространству',
      short: 'Экскурсия по Пантеону', price: 500, per: 'гость', qty: true,
      note: '«Исследователь» 500 ₽ / «Авторский взгляд» 800 ₽. Костюмерная с образами и фотозоны включены.'
    },
    excursion: {
      label: 'Иммерсивная экскурсия по арт-пространству',
      short: 'Экскурсия по Пантеону', price: 500, per: 'гость', qty: true,
      note: '«Исследователь» 500 ₽ / «Авторский взгляд» 800 ₽. Костюмерная с образами и фотозоны включены.'
    },
    club: {
      label: 'Женский клуб «ВОЛШЕБНАЯ СРЕДА»',
      short: 'Женский клуб', price: 0, per: 'участница', qty: false,
      note: 'Среда 18:30–21:00 (до 15 участниц). Бесплатная встреча, своп, нетворкинг, чаепитие.'
    },
    photo: {
      label: 'Экспресс-фотосессия в фотозонах',
      short: 'Экспресс-фотосессия', price: 3500, per: 'съёмка', qty: false,
      note: '20 минут, 40+ исходников, 15–20 фото в цветокоррекции за 2–3 дня. До 4 участников.'
    },
    kids: {
      label: 'Квест-игра для детей «Лаборатория доктора КУ-КУ»',
      short: 'Квест доктора КУ-КУ', price: 1500, per: 'участник', qty: true,
      note: 'Пятница 16:00 (6–14 лет, 1.5 часа). Интерактивные научные опыты, халаты и очки включены.'
    },
    rent: {
      label: 'Аренда фотостудии (10 локаций + циклорама)',
      short: 'Аренда фотостудии', price: 3000, per: 'час', qty: true,
      note: 'Круглосуточно: 10 локаций + циклорама, свет, реквизит. До 10 человек (свыше +500 ₽/чел).'
    },
    cert: {
      label: 'Подарочный сертификат на фотосессию',
      short: 'Сертификат на фотосессию', price: 8000, per: 'сертификат', qty: true,
      note: 'Экспресс 8 000 ₽ / Часовая 12 000 ₽ / Всё включено 15 000 ₽. Крафтовое оформление.'
    },
    shop: {
      label: 'Заказ из арт-лавки', short: 'Арт-лавка', price: 0, per: 'заказ', qty: false, note: ''
    }
  };

  const PRICE_ROWS = [
    // --- Организация праздников и интерактивов (10 услуг) ---
    {
      id: 'art_friday',
      cat: 'events',
      catName: 'Праздники и интерактивы',
      name: 'АРТ мастерская по пятницам',
      sub: 'Каждую пятницу 18:30 · 2 часа · до 8 мест',
      desc: 'Два часа свободы от рутины в атмосфере свечей и чая: роспись одежды (пиджак, футболка), создание картины на холсте, брызги и капли, рисование с закрытыми глазами, карта желаний, декор предметов. Мастер рядом для поддержки.',
      price: '2 500 ₽',
      unit: 'за участника',
      act: 'Записаться'
    },
    {
      id: 'mom_evening',
      cat: 'events',
      catName: 'Праздники и интерактивы',
      name: 'Вечер для мамы, досуг (Мамин день)',
      sub: 'Каждый четверг 16:00 · 2 часа · до 7 мам',
      desc: 'Тёплое пространство заботы и отдыха для мам: своп детской одежды (экологичный обмен), секретный эксперт (психолог, визажист, таролог, арт-терапевт), детская зона с творчеством и ведущим (лепка, браслеты, от 2 лет), домашний стол и чай.',
      price: '1 000 ₽',
      unit: 'мама + ребёнок (+500 ₽ доп.)',
      act: 'Записаться'
    },
    {
      id: 'dating_evening',
      cat: 'events',
      catName: 'Праздники и интерактивы',
      name: 'Вечер знакомств «Атмосфера сближения»',
      sub: 'Каждую субботу 20:00 · 2 часа · 25–45 лет',
      desc: 'Живой формат знакомства через мини-сценки и совместную игру без неловкости и шаблонных самопрезентаций. Видео на iPhone без постановочных поз, чай, кофе, угощения. Тайное голосование — контакты только при взаимности. 7 мужчин + 7 женщин.',
      price: '2 000 ₽',
      unit: 'за вечер',
      act: 'Забронировать'
    },
    {
      id: 'quest_kuku',
      cat: 'events',
      catName: 'Праздники и интерактивы',
      name: 'Квест-игра для детей «Лаборатория доктора КУ-КУ»',
      sub: 'Каждую пятницу 16:00 · 1,5 часа · 6–14 лет',
      desc: 'Интерактивное научное приключение в секретной лаборатории: зрелищные эксперименты, физика и химия как магия (свечение в темноте, смена цветов, вспышки). Никаких скучных формул — только живое шоу. Халаты и очки включены.',
      price: '1 500 ₽',
      unit: 'за участника',
      act: 'Записаться'
    },
    {
      id: 'photo_dvizh',
      cat: 'events',
      catName: 'Праздники и интерактивы',
      name: 'Фото-движ «Создадим кадр, который порвёт ленту»',
      sub: 'Каждое воскресенье 14:00 · 1,5 часа · до 8 мест',
      desc: 'Взрывной фото-челлендж для соцсетей: 10 мощных кадров (5 общих игровых поз + 5 индивидуальных по карточкам), профессиональный свет и вспышки. Видео процесса отдаётся в тот же день, фото за 5 дней. Доступен под дни рождения.',
      price: '2 500 ₽',
      unit: 'за участника',
      act: 'Участвовать'
    },
    {
      id: 'zoo_time',
      cat: 'events',
      catName: 'Праздники и интерактивы',
      name: 'Зоо Тайм с кроликами',
      sub: 'Каждую субботу 13:00–15:00 · 1 час',
      desc: 'Тактильный и познавательный опыт для детей и взрослых: погладить ручных пушистых кроликов, покормить (корм выдаётся), узнать о повадках и снять стресс. Бонус: бесплатная костюмерная с образами и сказочные фотозоны. Дети до 3 лет бесплатно.',
      price: '700 ₽',
      unit: 'за гостя (до 3 лет бесплатно)',
      act: 'Записаться'
    },
    {
      id: 'women_club',
      cat: 'events',
      catName: 'Праздники и интерактивы',
      name: 'Женский клуб «ВОЛШЕБНАЯ СРЕДА»',
      sub: 'Каждую среду 18:30–21:00 · до 15 участниц',
      desc: 'Еженедельные дружеские встречи в тёплом кругу: своп одежды и косметики, обмен опытом («Расскажи о своём деле»), «Творческая витрина» изделий ручной работы, фотосессия в фотозоне (костюмерная и реквизит бесплатно), чаепитие и закрытый чат.',
      price: 'Бесплатно',
      unit: 'вход по записи',
      act: 'Прийти'
    },
    {
      id: 'excursion_immersive',
      cat: 'events',
      catName: 'Праздники и интерактивы',
      name: 'Иммерсивная экскурсия по арт-пространству',
      sub: 'По записи · группы от 5 человек',
      desc: 'Погружение в искусство всеми чувствами. Два формата: «Исследователь» (7–14 лет, 500 ₽) — игровое приключение и эксперименты со светом; «Авторский взгляд» (14+, 800 ₽) — рождение инсталляций и техники мастеров. Бесплатная костюмерная с образами включена.',
      price: 'от 500 ₽',
      unit: '500–800 ₽ за гостя',
      act: 'Записаться'
    },
    {
      id: 'rent_studio',
      cat: 'events',
      catName: 'Праздники и интерактивы',
      name: 'Аренда фотостудии',
      sub: 'Круглосуточно · 10 локаций + циклорама',
      desc: 'Зал с 10 готовыми локациями и циклорамой. Включено: студийный постоянный и импульсный свет, машина мыльных пузырей, одежда и аксессуары за отметку. До 10 человек (свыше +500 ₽/чел). Дополнительно: кролики, цыплята, ёжик, гримёрка, дым-машина, визажист.',
      price: '3 000 ₽',
      unit: 'за час (до 10 человек)',
      act: 'Забронировать'
    },
    {
      id: 'rent_props',
      cat: 'events',
      catName: 'Праздники и интерактивы',
      name: 'Аренда реквизита и оборудования',
      sub: 'Для фотосессий, свадеб и праздников',
      desc: 'Широкий выбор предметов напрокат: свадебные арки и колонны, крылья ангела, диадемы, корсеты, вечерние платья и обувь, студийный свет, вспышки, дым-машина, снег-машина, «бабломёт» с пачками долларов, гирлянды. Доставка по городу.',
      price: 'по запросу',
      unit: 'от 500 ₽ / гибкие условия',
      act: 'Уточнить'
    },

    // --- Фото- и видеоуслуги (4 услуги) ---
    {
      id: 'photo_express',
      cat: 'photo',
      catName: 'Фото- и видеоуслуги',
      name: 'Экспресс-фотосессия',
      sub: '20 минут в студии · быстрый результат',
      desc: 'Быстрая съёмка для тех, кто ценит время: более 40 качественных фото в исходниках, 15–20 обработанных кадров в цветокоррекции за 2–3 дня. До 4 участников. Вход свободный, оплата только съёмки. Дополнительно доступны пушистые кролики и цыплята (+500 ₽).',
      price: '3 500 ₽',
      unit: 'за 20 минут съёмки',
      act: 'Забронировать'
    },
    {
      id: 'cert_photo',
      cat: 'photo',
      catName: 'Фото- и видеоуслуги',
      name: 'Подарочный сертификат на фотосессию',
      sub: 'Крафтовое оформление · 3 готовых пакета',
      desc: 'Подарите незабываемые эмоции и профессиональные фотографии: пакет «Экспресс» (30 мин съёмка, 1 ч аренда, гардероб) — 8 000 ₽; «Часовая фотосессия» (60 мин съёмка, аренда, образы) — 12 000 ₽; «Всё включено» (макияж, укладка, платье, аренда) — 15 000 ₽.',
      price: 'от 8 000 ₽',
      unit: '8 000 – 15 000 ₽',
      act: 'Выбрать'
    },
    {
      id: 'photo_author',
      cat: 'photo',
      catName: 'Фото- и видеоуслуги',
      name: 'Фотосессии от создателя (Ольга Вознесенская)',
      sub: 'Авторская съёмка от фотохудожника пространства',
      desc: 'Индивидуальные фотосессии: «Лайт» 30 мин (аренда включена, ретушь, видео на iPhone в подарок) — 6 000 ₽; «Стандарт» 60 мин (аренда включена, ретушь, видео) — 8 000 ₽; «Всё включено» 60 мин (макияж, укладка, гримёрка, ретушь, монтаж Reels) — 15 000 ₽. Огромный гардероб студии бесплатно.',
      price: 'от 6 000 ₽',
      unit: '6 000 – 15 000 ₽',
      act: 'Забронировать'
    },
    {
      id: 'grad_albums',
      cat: 'photo',
      catName: 'Фото- и видеоуслуги',
      name: 'Изготовление выпускных альбомов',
      sub: 'Школы, детсады, вузы · аренда студии в подарок',
      desc: 'Выпускные альбомы под ключ: аренда студии на Ленинском 151 в подарок выпускникам, все фото в цветокоррекции и ретуши в облаке. Папка «Куб» (30×30 см) — 3 000 ₽; Папка «Трио» — 3 500 ₽; Книга «Базовая» — 4 500 ₽; Книга «Премиум» — 6 000 ₽. Учителю альбом бесплатно (от 25 книг).',
      price: 'от 2 500 ₽',
      unit: '2 500 – 6 000 ₽ / книга',
      act: 'Заказать'
    }
  ];

  /* ---------------- Арт-лавка ---------------- */
  const PRODUCTS = [
    { id: 'p1', type: 'paint', tag: 'Живопись', author: 'Калининградский художник', title: 'Дюны Куршской косы', mat: 'Холст, масло · 60 × 90 см', price: 24000, img: 'assets/img/painting-sea.jpg', tall: true },
    { id: 'p2', type: 'paint', tag: 'Живопись', author: 'Мастерская «Пантеона»', title: 'Крыши старого города', mat: 'Холст, масло · 50 × 70 см', price: 19500, img: 'assets/img/painting-city.jpg', tall: true },
    { id: 'p3', type: 'paint', tag: 'Живопись', author: 'Калининградский автор', title: 'Кот на подоконнике', mat: 'Холст, масло · 40 × 60 см', price: 12800, img: 'assets/img/painting-cat.jpg', tall: true },
    { id: 'p4', type: 'paint', tag: 'Живопись', author: 'Мастерская «Пантеона»', title: 'Балтийская зима', mat: 'Холст, масло · 45 × 65 см', price: 15400, img: 'assets/img/painting-winter.jpg', tall: true },
    { id: 'c1', type: 'craft', tag: 'Керамика', author: 'Авторская керамика', title: 'Сервиз «Тёплый вечер»', mat: 'Шамот, ручная лепка · чайник и 4 чашки', price: 6900, img: 'assets/img/ceramics-sq.jpg', wide: true },
    { id: 'a1', type: 'craft', tag: 'Янтарь', author: 'Балтийские мастера', title: 'Бусы из медового янтаря', mat: 'Натуральный янтарь · серебро 925', price: 8400, img: 'assets/img/amber-sq.jpg', wide: true },
    { id: 'p5', type: 'paint', tag: 'Живопись', author: 'Калининградский автор', title: 'Полевые цветы в кувшине', mat: 'Холст, масло · 40 × 55 см', price: 11200, img: 'assets/img/painting-flowers.jpg', tall: true },
    { id: 'c2', type: 'craft', tag: 'Текстиль', author: 'Ручное ткачество', title: 'Льняная салфетка с вышивкой', mat: 'Лён, ручная вышивка · 40 × 40 см', price: 2400, img: 'assets/img/loft-vert.jpg', wide: true }
  ];

  /* ---------------- Афиша ---------------- */
  const AFISHA = [
    { key: 'tue', short: 'Вт', name: 'Вторник', title: 'День экскурсий', img: 'assets/img/loft.jpg', imgNote: 'Залы «Пантеона» · иммерсивные экскурсии',
      desc: 'Погружение в искусство всеми чувствами. Исследуем рождение инсталляций, секреты света и спецэффектов. Бесплатная костюмерная с образами и сказочные фотозоны.',
      slots: [
        { time: '12:00', name: 'Экскурсия «Исследователь»', sub: '7–14 лет · интерактив и опыты', price: '500 ₽', book: 'excursion_immersive' },
        { time: '15:00', name: 'Экскурсия «Авторский взгляд»', sub: '14+ · техники и концепции мастеров', price: '800 ₽', book: 'excursion_immersive' },
        { time: '18:00', name: 'Вечерняя экскурсия по залам', sub: 'по записи · костюмерная включена', price: 'от 500 ₽', book: 'excursion_immersive' }
      ] },
    { key: 'wed', short: 'Ср', name: 'Среда', title: '«Волшебная среда»', img: 'assets/img/amber.jpg', imgNote: 'Чайная зона · женский клуб',
      desc: 'Женский клуб собирается каждую среду в 18:30. Бесплатные тёплые встречи: своп одежды и косметики, обмен опытом, «Творческая витрина» хендмейда, фотосессия и чаепитие.',
      slots: [
        { time: '13:00', name: 'Свободные фотозоны студии', sub: '10 локаций + циклорама · по записи', price: '3 000 ₽/ч', book: 'rent_studio' },
        { time: '18:30', name: 'Женский клуб «ВОЛШЕБНАЯ СРЕДА»', sub: 'своп · нетворкинг · чаепитие · чат', price: 'бесплатно', book: 'women_club' }
      ] },
    { key: 'thu', short: 'Чт', name: 'Четверг', title: 'Мамин день', img: 'assets/img/ceramics.jpg', imgNote: 'Тёплый вечер заботы и отдыха для мам',
      desc: 'Пространство поддержки для мам: своп детской одежды, секретный эксперт (психолог, визажист, арт-терапевт), детская зона с ведущим и домашний чай.',
      slots: [
        { time: '12:00', name: 'Экспресс-фотосессия', sub: '20 минут · 15–20 фото в ретуши', price: '3 500 ₽', book: 'photo_express' },
        { time: '16:00', name: 'Вечер для мамы, досуг', sub: 'мама + ребёнок (от 2 лет) · эксперт', price: '1 000 ₽', book: 'mom_evening' }
      ] },
    { key: 'fri', short: 'Пт', name: 'Пятница', title: 'Наука и АРТ', img: 'assets/img/hero-sculpture.jpg', imgNote: 'Эксперименты и вечернее творчество',
      desc: 'Два уникальных формата: в 16:00 научный квест для детей с доктором КУ-КУ, а в 18:30 вечерняя АРТ мастерская со свечами, росписью одежды и созданием картин.',
      slots: [
        { time: '16:00', name: 'Квест «Лаборатория доктора КУ-КУ»', sub: '6–14 лет · научные опыты и шоу', price: '1 500 ₽', book: 'quest_kuku' },
        { time: '18:30', name: 'АРТ мастерская по пятницам', sub: '2 часа · роспись одежды, холст, свечи', price: '2 500 ₽', book: 'art_friday' }
      ] },
    { key: 'sat', short: 'Сб', name: 'Суббота', title: 'Кролики и Знакомства', img: 'assets/img/painting-rabbit.jpg', imgNote: 'Пушистые кролики днём, вечер знакомств ночью',
      desc: 'Днём — тёплый ЗооТайм с ручными кроликами и примерка образов, вечером — лёгкий и живой вечер знакомств «Атмосфера сближения» для 7 пар.',
      slots: [
        { time: '13:00', name: 'Зоо Тайм с кроликами', sub: 'тактильный контакт · кормление · костюмы', price: '700 ₽', book: 'zoo_time' },
        { time: '14:00', name: 'Зоо Тайм с кроликами (2 смена)', sub: 'дети до 3 лет бесплатно', price: '700 ₽', book: 'zoo_time' },
        { time: '20:00', name: 'Вечер знакомств «Атмосфера сближения»', sub: '25–45 лет · игра · видео · 7М + 7Ж', price: '2 000 ₽', book: 'dating_evening' }
      ] },
    { key: 'sun', short: 'Вс', name: 'Воскресенье', title: 'Фото-движ', img: 'assets/img/painting-cat.jpg', imgNote: 'Взрывные фотосессии и авторские кадры',
      desc: 'День ярких кадров: в 14:00 фото-челлендж на 10 необычных фото для соцсетей со вспышками и видео в тот же день. В течение дня — авторские съёмки от Ольги.',
      slots: [
        { time: '12:00', name: 'Экспресс-фотосессия', sub: '20 минут · студийный свет', price: '3 500 ₽', book: 'photo_express' },
        { time: '14:00', name: 'Фото-движ (10 взрывных кадров)', sub: 'видео в день съёмки · до 8 мест', price: '2 500 ₽', book: 'photo_dvizh' },
        { time: '16:30', name: 'Авторская фотосессия от создателя', sub: 'Ольга Вознесенская · пакеты от Лайт', price: 'от 6 000 ₽', book: 'photo_author' }
      ] }
  ];

  /* ============================================================
     РЕНДЕР ПРАЙСА
     ============================================================ */
  let currentPriceCat = 'all';

  function renderPrice() {
    const box = $('#priceList');
    if (!box) return;
    const filtered = currentPriceCat === 'all'
      ? PRICE_ROWS
      : PRICE_ROWS.filter(r => r.cat === currentPriceCat);

    box.innerHTML = filtered.map((r, i) => `
      <article class="prow" data-rev style="--d:${i * 35}ms">
        <h3 class="prow__name">
          <span class="prow__cat">${r.catName}</span>
          ${r.name}
          <small>${r.sub}</small>
        </h3>
        <p class="prow__desc">${r.desc}</p>
        <div class="prow__price">${r.price}<small>${r.unit}</small></div>
        <span class="prow__act"><button class="btn btn--ghost btn--sm" data-book="${r.id}" ${r.id === 'rent_studio' || r.id === 'rent' ? 'data-rent="1"' : ''}>${r.act}</button></span>
      </article>`).join('');
    observeReveals();
  }

  function initPriceFilters() {
    const filtersBox = $('#priceFilters');
    if (!filtersBox) return;
    filtersBox.addEventListener('click', e => {
      const btn = e.target.closest('.pfilter');
      if (!btn) return;
      $$('.pfilter', filtersBox).forEach(b => b.classList.remove('is-on'));
      btn.classList.add('is-on');
      currentPriceCat = btn.dataset.pcat || 'all';
      renderPrice();
    });
  }

  /* ============================================================
     РЕНДЕР АРТ-ЛАВКИ
     ============================================================ */
  function renderShelf() {
    const box = $('#shelf');
    if (!box) return;
    const cards = PRODUCTS.map((p, i) => `
      <article class="card ${p.tall ? 'card--tall' : 'card--wide'}" data-rev style="--d:${i * 50}ms">
        <div class="card__media">
          <img src="${p.img}" alt="${p.title} — ${p.mat}" loading="lazy" width="800" height="800">
          <span class="card__tag">${p.tag}</span>
        </div>
        <div class="card__body">
          <span class="card__author">${p.author}</span>
          <h3 class="card__title">${p.title}</h3>
          <p class="card__mat">${p.mat}</p>
          <div class="card__foot">
            <span class="card__price">${money(p.price)}</span>
            <button class="card__buy" data-add="${p.id}">
              В корзину
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 5v14M5 12h14"/></svg>
            </button>
          </div>
        </div>
      </article>`).join('');

    const cert = `
      <article class="card--cert" data-rev style="--d:400ms">
        <span class="cert-orn" aria-hidden="true"></span>
        <div>
          <span class="label">Подарочный сертификат</span>
          <h4>Подарить<br>впечатление</h4>
          <p>Крафтовый конверт, номинал на выбор. Действует на всё: билеты, экскурсии, мастер-классы, фотосессии и работы из лавки.</p>
          <div class="cert-amounts" id="certAmounts">
            ${[1000, 2000, 3500, 5000].map((v, i) => `<button data-cert="${v}" class="${i === 1 ? 'is-on' : ''}">${new Intl.NumberFormat('ru-RU').format(v)} ₽</button>`).join('')}
          </div>
        </div>
        <button class="btn btn--paper btn--full" id="certOrder">
          <span>Заказать сертификат</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 12h15M13 6l6 6-6 6"/></svg>
        </button>
      </article>`;

    box.innerHTML = cards + cert;

    // сертификат: выбор номинала
    let certValue = 2000;
    $$('#certAmounts button').forEach(b => b.addEventListener('click', () => {
      $$('#certAmounts button').forEach(x => x.classList.remove('is-on'));
      b.classList.add('is-on');
      certValue = +b.dataset.cert;
    }));
    $('#certOrder').addEventListener('click', () => openBooking('cert', { certValue }));

    observeReveals();
  }

  /* ============================================================
     АФИША
     ============================================================ */
  function renderAfisha(activeKey) {
    const nav = $('#daynav');
    if (!nav) return;
    if (!nav.dataset.built) {
      nav.innerHTML = AFISHA.map((d, i) => `
        <button class="daychip ${i === 0 ? 'is-on' : ''}" role="tab" data-day="${d.key}" aria-selected="${i === 0}">
          <b>${d.short}</b><span>${d.name}</span>
        </button>`).join('');
      nav.dataset.built = '1';
      nav.addEventListener('click', e => {
        const b = e.target.closest('[data-day]');
        if (!b) return;
        renderAfisha(b.dataset.day);
      });
    }
    const day = AFISHA.find(d => d.key === (activeKey || 'tue')) || AFISHA[0];
    $$('#daynav .daychip').forEach(c => {
      const on = c.dataset.day === day.key;
      c.classList.toggle('is-on', on);
      c.setAttribute('aria-selected', on ? 'true' : 'false');
    });

    const panel = $('#afishaPanel');
    panel.style.animation = 'none';
    void panel.offsetWidth;
    panel.style.animation = '';

    $('#afDayTitle').innerHTML = `${day.name} — <em>${day.title}</em>`;
    $('#afDayDesc').textContent = day.desc;
    $('#afSlots').innerHTML = day.slots.map((s, i) => `
      <div class="slot" ${i === 0 && day.slots.length === 1 ? '' : ''}>
        <span class="slot__time">${s.time}</span>
        <span class="slot__name">${s.name}<small>${s.sub}</small></span>
        <span class="slot__price">${s.price}</span>
      </div>`).join('') + `
      <div style="display:flex;gap:10px;flex-wrap:wrap;padding-top:16px">
        <button class="btn btn--sm" data-book="${day.slots.find(s => s.book) ? day.slots.find(s => s.book).book : 'visite'}" data-day-prefill="${day.name}">
          Забронировать этот день
        </button>
        <a class="link-u" href="tel:+79216137540">Уточнить слот
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 12h15M13 6l6 6-6 6"/></svg>
        </a>
      </div>`;

    const img = $('#afImg');
    img.src = day.img;
    img.alt = day.imgNote;
    $('#afImgNote').textContent = day.imgNote;
  }

  /* ============================================================
     КАЛЬКУЛЯТОР АРЕНДЫ
     ============================================================ */
  const RENT = { hours: 2, format: 'shoot' };
  const RENT_FORMATS = [
    { id: 'shoot', name: 'Фотосъёмка', note: 'Фотосъёмка: 10 локаций + циклорама, студийный постоянный и импульсный свет включены.' },
    { id: 'devi', name: 'Девичник', note: 'Девичник: сказочные фотозоны, чайная зона, платья и аксессуары студии.' },
    { id: 'bday', name: 'День рождения', note: 'День рождения: пространство для гостей, зона чаепития, мыльные пузыри и музыка.' },
    { id: 'lecture', name: 'Лекция / МК / Своп', note: 'Лекция или мастер-класс: посадка для участников, столы, свет, чайная зона.' }
  ];

  function renderCalc() {
    const hb = $('#calcHours'), fb = $('#calcFormat');
    if (!hb) return;
    hb.innerHTML = [1, 2, 3, 4, 5].map(h => `
      <button class="chip ${RENT.hours === h ? 'is-on' : ''}" data-hours="${h}">
        ${h === 5 ? '5+' : h}<small>${h === 1 ? 'час' : h < 5 ? 'часа' : 'и более'}</small>
      </button>`).join('');
    fb.innerHTML = RENT_FORMATS.map(f => `
      <button class="chip ${RENT.format === f.id ? 'is-on' : ''}" data-format="${f.id}">${f.name}</button>`).join('');

    hb.onclick = e => {
      const b = e.target.closest('[data-hours]'); if (!b) return;
      RENT.hours = +b.dataset.hours; renderCalc();
    };
    fb.onclick = e => {
      const b = e.target.closest('[data-format]'); if (!b) return;
      RENT.format = b.dataset.format; renderCalc();
    };
    updateCalc();
  }
  function updateCalc() {
    const sum = RENT.hours * 3000;
    $('#calcSum').innerHTML = `${new Intl.NumberFormat('ru-RU').format(sum)}<sup>₽</sup>`;
    $('#calcHint').textContent = `${RENT.hours} ${RENT.hours === 1 ? 'час' : RENT.hours < 5 ? 'часа' : 'часов'} × 3 000 ₽ · до 10 человек · предоплата ${money(sum * 0.3)}`;
    const f = RENT_FORMATS.find(x => x.id === RENT.format);
    $('#calcFormatNote').textContent = f ? f.note : '';
  }

  /* ============================================================
     ЗАЯВКИ (CRM)
     ============================================================ */
  const LEADS_KEY = 'pantheon_leads_v1';
  const TG_KEY = 'pantheon_tg_v1';
  let leads = LS.get(LEADS_KEY, null);

  if (!leads) {
    // демонстрационные заявки — чтобы воронка не была пустой при первой загрузке
    leads = [
      { n: 'ПН-1041', name: 'Анна Гущина', phone: '+7 (911) 455-20-18', service: 'excursion', sum: 1000, qty: 2, date: todayISO(2), time: '13:00', comment: 'Придём вдвоём, интересует керамика', status: 'new', created: Date.now() - 1000 * 60 * 42, demo: true },
      { n: 'ПН-1040', name: 'Ирина Сорокина', phone: '+7 (963) 288-71-04', service: 'club', sum: 380, qty: 1, date: todayISO(-1), time: '18:30', comment: 'Первый раз, одна', status: 'work', created: Date.now() - 1000 * 60 * 60 * 22, demo: true },
      { n: 'ПН-1039', name: 'Дмитрий Ковалёв', phone: '+7 (909) 774-12-66', service: 'rent', sum: 4500, qty: 3, date: todayISO(9), time: '17:00', comment: 'Девичник, 12 гостей, нужен стол', status: 'done', created: Date.now() - 1000 * 60 * 60 * 52, demo: true }
    ];
    LS.set(LEADS_KEY, leads);
  }
  function todayISO(offset) {
    const d = new Date(); d.setDate(d.getDate() + (offset || 0));
    return d.toISOString().slice(0, 10);
  }
  function saveLeads() { LS.set(LEADS_KEY, leads); updateLeadBadge(); }

  function nextNumber() {
    const nums = leads.map(l => parseInt((l.n || '').replace(/\D/g, ''), 10) || 1000);
    const max = nums.length ? Math.max.apply(null, nums) : 1040;
    return 'ПН-' + (max + 1);
  }

  function addLead(data) {
    const lead = Object.assign({
      n: nextNumber(), status: 'new', created: Date.now(),
      date: '', time: '', comment: '', qty: 1, sum: 0, service: 'visite'
    }, data);
    leads.unshift(lead);
    saveLeads();
    pushTelegram(lead);
    logEvent(`Новая заявка ${lead.n} · ${lead.name} · ${money(lead.sum)}`);
    if ($('#crm').classList.contains('is-open')) renderCRM();
    return lead;
  }

  function updateLeadBadge() {
    const badge = $('[data-lead-count]');
    const fresh = leads.filter(l => l.status === 'new').length;
    if (badge) {
      badge.textContent = fresh;
      badge.classList.toggle('is-on', fresh > 0);
    }
  }

  function updateCartBadge() {
    const badge = $('[data-cart-count]');
    const c = cartCount();
    if (badge) { badge.textContent = c; badge.classList.toggle('is-on', c > 0); }
  }

  /* ---------------- Модалка бронирования ---------------- */
  const modal = $('#modal');
  const overlay = $('#overlay');

  function openOverlay() {
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }
  function closeAll() {
    modal.classList.remove('is-open');
    overlay.classList.remove('is-open');
    $('#cart').classList.remove('is-open');
    document.body.style.overflow = '';
  }

  function openBooking(key, opts) {
    opts = opts || {};
    const svc = SERVICES[key] || SERVICES.excursion_immersive || SERVICES.visite;
    $('#modalEyebrow').textContent = 'Заявка с сайта';
    $('#modalTitle').textContent = svc.short;
    $('#modalSub').textContent = svc.note;

    const isHours = (key === 'rent' || key === 'rent_studio');
    const isCert = (key === 'cert' || key === 'cert_photo');
    const isAlbums = (key === 'grad_albums');
    const isAuthorPhoto = (key === 'photo_author');
    const isExcursion = (key === 'excursion_immersive' || key === 'excursion' || key === 'visite');
    const isFree = (svc.price === 0);

    let variantHTML = '';
    if (isCert) {
      variantHTML = `
        <div class="field">
          <label for="fVariant">Пакет подарочного сертификата</label>
          <select id="fVariant" name="variant">
            <option value="8000" ${opts.certValue === 8000 ? 'selected' : ''}>Экспресс (30 мин съёмка, 1 ч аренда, гардероб) — 8 000 ₽</option>
            <option value="12000" ${opts.certValue === 12000 ? 'selected' : ''}>Часовая фотосессия (60 мин съёмка, аренда, образы) — 12 000 ₽</option>
            <option value="15000" ${opts.certValue === 15000 ? 'selected' : ''}>Всё включено (макияж, укладка, платье, аренда) — 15 000 ₽</option>
          </select>
        </div>`;
    } else if (isAuthorPhoto) {
      variantHTML = `
        <div class="field">
          <label for="fVariant">Пакет авторской фотосессии</label>
          <select id="fVariant" name="variant">
            <option value="6000">Пакет «Лайт» (30 мин съёмка, аренда включена, ретушь, видео) — 6 000 ₽</option>
            <option value="8000" selected>Пакет «Стандарт» (60 мин съёмка, аренда включена, ретушь, видео) — 8 000 ₽</option>
            <option value="15000">Пакет «Всё включено» (макияж, укладка, гримёрка, ретушь, Reels) — 15 000 ₽</option>
          </select>
        </div>`;
    } else if (isExcursion) {
      variantHTML = `
        <div class="field">
          <label for="fVariant">Формат экскурсии</label>
          <select id="fVariant" name="variant">
            <option value="500" selected>Формат «Исследователь» (дети 7–14 лет) — 500 ₽ / чел</option>
            <option value="800">Формат «Авторский взгляд» (взрослые 14+) — 800 ₽ / чел</option>
          </select>
        </div>`;
    } else if (isAlbums) {
      variantHTML = `
        <div class="field">
          <label for="fVariant">Вариант выпускного альбома</label>
          <select id="fVariant" name="variant">
            <option value="3000">Папка «Куб» (30×30 см, 2 разворота) — 3 000 ₽ / экз.</option>
            <option value="3500">Папка «Трио» (20×30 см, 3 разворота) — 3 500 ₽ / экз.</option>
            <option value="4500" selected>Книга «Базовая» (20×30 см, 8–12 стр., 3 съёмки) — 4 500 ₽ / экз.</option>
            <option value="5500">Индивидуальная книга (10–14 фото в ретуши) — 5 500 ₽ / экз.</option>
            <option value="6000">Книга «Премиум» (20×30 см, 2 съёмочных дня) — 6 000 ₽ / экз.</option>
          </select>
        </div>`;
    }

    const qtyLabel = isHours
      ? 'Количество часов'
      : isCert
      ? 'Количество сертификатов'
      : isAlbums
      ? 'Количество альбомов (от 25 экз. учителю бесплатно)'
      : key === 'mom_evening'
      ? 'Количество мам (+500 ₽ за 2-го ребёнка)'
      : 'Количество гостей / участников';

    $('#modalBody').innerHTML = `
      <form id="bookForm" novalidate>
        <div class="field--row">
          <div class="field">
            <label for="fName">Как вас зовут *</label>
            <input id="fName" name="name" type="text" placeholder="Имя" required autocomplete="name">
          </div>
          <div class="field">
            <label for="fPhone">Телефон *</label>
            <input id="fPhone" name="phone" type="tel" placeholder="+7 (___) ___-__-__" required autocomplete="tel">
          </div>
        </div>
        <div class="field--row">
          <div class="field">
            <label for="fDate">Дата</label>
            <input id="fDate" name="date" type="date" value="${opts.date || ''}" min="${todayISO(0)}">
          </div>
          <div class="field">
            <label for="fTime">Удобное время</label>
            <select id="fTime" name="time">
              ${['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:30', '20:00'].map(t => `<option ${opts.time === t ? 'selected' : ''}>${t}</option>`).join('')}
            </select>
          </div>
        </div>
        ${variantHTML}
        ${svc.qty ? `
        <div class="field">
          <label for="fQty">${qtyLabel}</label>
          <input id="fQty" name="qty" type="number" min="1" max="100" value="${opts.qty || (isHours ? RENT.hours : 1)}">
        </div>` : ''}
        <div class="field">
          <label for="fComment">Комментарий</label>
          <textarea id="fComment" name="comment" placeholder="Повод, пожелания, особенности — всё, что нам важно знать"></textarea>
        </div>
        <div class="form__sum">
          <span>Стоимость</span>
          <b id="bookSum">${isFree ? 'Бесплатно' : money(svc.price)}</b>
        </div>
        <button class="btn btn--full" type="submit" style="justify-content:center">
          Отправить заявку
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 12h15M13 6l6 6-6 6"/></svg>
        </button>
        <p class="form__legal">Заявка сразу попадает в панель управления и приходит Ольге в Telegram.<br>Мы позвоним, чтобы подтвердить время.</p>
      </form>`;

    const form = $('#bookForm');
    const qtyEl = $('#fQty');
    const varEl = $('#fVariant');

    const recalc = () => {
      if (isFree) {
        $('#bookSum').textContent = 'Бесплатно';
        return 0;
      }
      if (key === 'rent_props') {
        $('#bookSum').textContent = 'От 500 ₽ (расчёт)';
        return 500;
      }
      let base = svc.price;
      if (varEl) base = +varEl.value;
      const count = qtyEl ? Math.max(1, +qtyEl.value || 1) : 1;
      const sum = base * count;
      $('#bookSum').textContent = money(sum);
      return sum;
    };

    if (qtyEl) qtyEl.addEventListener('input', recalc);
    if (varEl) varEl.addEventListener('change', recalc);
    recalc();

    form.addEventListener('submit', e => {
      e.preventDefault();
      const name = form.name.value.trim();
      const phone = form.phone.value.trim();
      if (name.length < 2) { form.name.focus(); toast('Напишите, пожалуйста, имя'); return; }
      if (digits(phone).length < 10) { form.phone.focus(); toast('Проверьте номер телефона'); return; }
      const sum = recalc();
      const lead = addLead({
        name, phone, service: key, sum,
        qty: qtyEl ? +qtyEl.value : 1,
        date: form.date.value, time: form.time.value,
        comment: form.comment.value.trim()
      });
      showSuccess(lead);
    });

    openOverlay();
    modal.classList.add('is-open');
    setTimeout(() => $('#fName') && $('#fName').focus(), 380);
  }

  function showSuccess(lead) {
    $('#modalEyebrow').textContent = 'Заявка ' + lead.n;
    $('#modalTitle').textContent = 'Спасибо, заявка принята';
    $('#modalSub').textContent = 'Она уже в панели управления — Ольга получит уведомление и позвонит, чтобы подтвердить время.';
    $('#modalBody').innerHTML = `
      <div style="display:grid;gap:14px">
        <div style="border:1px solid var(--line);background:rgba(251,247,240,.7);padding:16px 18px;border-radius:2px;display:grid;gap:8px">
          <div style="display:flex;justify-content:space-between;gap:12px"><span class="label">Номер</span><span style="font-family:var(--serif);font-size:17px">${lead.n}</span></div>
          <div style="display:flex;justify-content:space-between;gap:12px"><span class="label">Услуга</span><span style="font-size:13.5px;text-align:right">${(SERVICES[lead.service] || {}).short || 'Заявка'}</span></div>
          <div style="display:flex;justify-content:space-between;gap:12px"><span class="label">Сумма</span><span style="font-family:var(--serif);font-size:17px">${money(lead.sum)}</span></div>
          <div style="display:flex;justify-content:space-between;gap:12px"><span class="label">Дата</span><span style="font-size:13.5px">${lead.date ? fmtDate(lead.date) + ' · ' + lead.time : 'уточним по телефону'}</span></div>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <a class="btn btn--ghost btn--sm" href="tel:+79216137540">Позвонить нам</a>
          <button class="btn btn--sm" data-close-modal>Хорошо</button>
        </div>
        <p class="form__legal" style="text-align:left">Если планы изменятся — просто позвоните: +7 (921) 613-75-40.</p>
      </div>`;
  }

  function fmtDate(iso) {
    try {
      return new Date(iso + 'T00:00:00').toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
    } catch (e) { return iso; }
  }

  /* ---------------- Корзина ---------------- */
  const CART_KEY = 'pantheon_cart_v1';
  let cart = LS.get(CART_KEY, []);
  function cartCount() { return cart.reduce((s, i) => s + i.qty, 0); }
  function cartTotal() {
    return cart.reduce((s, i) => {
      const p = PRODUCTS.find(x => x.id === i.id);
      return s + (p ? p.price * i.qty : 0);
    }, 0);
  }
  function saveCart() { LS.set(CART_KEY, cart); updateCartBadge(); renderCart(); }

  function addToCart(id) {
    const p = PRODUCTS.find(x => x.id === id);
    if (!p) return;
    const ex = cart.find(i => i.id === id);
    if (ex) ex.qty++; else cart.push({ id, qty: 1 });
    saveCart();
    toast(`«${p.title}» — в корзине`);
  }

  function renderCart() {
    const body = $('#cartBody'), foot = $('#cartFoot');
    if (!body) return;
    if (!cart.length) {
      body.innerHTML = `<div class="empty">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M6 8h12l-1.2 12H7.2L6 8Z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/></svg>
        <p>Пока пусто. Загляните в арт-лавку — там живопись, керамика и янтарь.</p>
        <button class="btn btn--ghost btn--sm" data-close-cart>В арт-лавку</button>
      </div>`;
      foot.innerHTML = '';
      return;
    }
    body.innerHTML = cart.map(i => {
      const p = PRODUCTS.find(x => x.id === i.id);
      if (!p) return '';
      return `<div class="citem">
        <img class="citem__img" src="${p.img}" alt="" width="64" height="76">
        <div>
          <div class="citem__t">${p.title}</div>
          <div class="citem__m">${p.tag}</div>
          <div class="citem__qty">
            <button data-cq="${p.id}" data-d="-1" aria-label="Меньше">−</button>
            <span>${i.qty}</span>
            <button data-cq="${p.id}" data-d="1" aria-label="Больше">+</button>
          </div>
        </div>
        <div style="text-align:right">
          <div class="citem__p">${money(p.price * i.qty)}</div>
          <button class="citem__del" data-del="${p.id}" style="margin-top:8px">Убрать</button>
        </div>
      </div>`;
    }).join('');
    foot.innerHTML = `
      <div class="total"><span>Итого</span><b>${money(cartTotal())}</b></div>
      <button class="btn btn--full" id="cartCheckout" style="justify-content:center">
        Оформить заказ
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 12h15M13 6l6 6-6 6"/></svg>
      </button>
      <p class="form__legal" style="text-align:left">Оплата при получении в галерее. Мы отложим работы на ваше имя.</p>`;

    $('#cartCheckout').addEventListener('click', openCheckout);
  }

  function openCheckout() {
    $('#cart').classList.remove('is-open');
    $('#modalEyebrow').textContent = 'Заказ из арт-лавки';
    $('#modalTitle').textContent = 'Оформление заказа';
    $('#modalSub').textContent = 'Проверим наличие, отложим работы и позвоним для подтверждения.';
    const items = cart.map(i => {
      const p = PRODUCTS.find(x => x.id === i.id);
      return p ? `${p.title} × ${i.qty}` : '';
    }).filter(Boolean).join(', ');
    $('#modalBody').innerHTML = `
      <form id="shopForm" novalidate>
        <div class="field--row">
          <div class="field"><label for="sName">Имя *</label><input id="sName" name="name" required autocomplete="name" placeholder="Имя"></div>
          <div class="field"><label for="sPhone">Телефон *</label><input id="sPhone" name="phone" type="tel" required autocomplete="tel" placeholder="+7 (___) ___-__-__"></div>
        </div>
        <div class="field"><label for="sComment">Комментарий</label><textarea id="sComment" name="comment" placeholder="Как удобнее забрать заказ, нужна ли упаковка в подарок"></textarea></div>
        <div style="border:1px solid var(--line);padding:12px 14px;border-radius:2px;font-size:13px;line-height:1.6;color:var(--ink-soft);margin-bottom:14px">
          ${items}
        </div>
        <div class="form__sum"><span>Итого</span><b>${money(cartTotal())}</b></div>
        <button class="btn btn--full" type="submit" style="justify-content:center">Отправить заказ</button>
        <p class="form__legal">Заказ попадёт в панель управления заявками с составом корзины.</p>
      </form>`;
    const f = $('#shopForm');
    f.addEventListener('submit', e => {
      e.preventDefault();
      if (f.name.value.trim().length < 2) { f.name.focus(); toast('Напишите имя'); return; }
      if (digits(f.phone.value).length < 10) { f.phone.focus(); toast('Проверьте телефон'); return; }
      const lead = addLead({
        name: f.name.value.trim(), phone: f.phone.value.trim(),
        service: 'shop', sum: cartTotal(), qty: cartCount(),
        comment: `Состав заказа: ${items}. ${f.comment.value.trim()}`
      });
      cart = []; saveCart();
      showSuccess(lead);
    });
    openOverlay();
    modal.classList.add('is-open');
  }

  /* ============================================================
     TELEGRAM-УВЕДОМЛЕНИЯ
     ============================================================ */
  let tg = LS.get(TG_KEY, { token: '', chat: '', enabled: false });
  let tgLog = [];

  function logEvent(text) {
    tgLog.unshift(new Date().toLocaleTimeString('ru-RU') + ' · ' + text);
    tgLog = tgLog.slice(0, 40);
    const box = $('#crmLog');
    if (box) box.innerHTML = tgLog.map(t => `<div>${t}</div>`).join('');
  }

  function pushTelegram(lead) {
    if (!tg.enabled || !tg.token || !tg.chat) {
      logEvent(`Уведомление не отправлено (бот не подключён) · ${lead.n}`);
      return;
    }
    const text =
      `🖼 *Новая заявка ${lead.n}*\n` +
      `Услуга: ${(SERVICES[lead.service] || {}).label || lead.service}\n` +
      `Имя: ${lead.name}\nТелефон: ${lead.phone}\n` +
      `Сумма: ${money(lead.sum)}\n` +
      (lead.date ? `Дата: ${lead.date} ${lead.time || ''}\n` : '') +
      (lead.comment ? `Комментарий: ${lead.comment}\n` : '') +
      `Пантеон · Ленинский пр-т, 151`;
    fetch(`https://api.telegram.org/bot${tg.token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: tg.chat, text, parse_mode: 'Markdown' })
    }).then(r => r.json()).then(j => {
      if (j && j.ok) { logEvent(`Telegram: заявка ${lead.n} отправлена`); }
      else { logEvent(`Telegram: ошибка — ${(j && j.description) || 'нет ответа'}`); }
    }).catch(() => logEvent('Telegram: сеть недоступна, заявка сохранена в панели'));
  }

  /* ============================================================
     CRM
     ============================================================ */
  const STATUS = { new: 'Новая', work: 'В работе', done: 'Завершена' };
  let crmTab = 'board';

  function openCRM() {
    renderCRM();
    $('#crm').classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }
  function closeCRM() {
    $('#crm').classList.remove('is-open');
    document.body.style.overflow = '';
    updateLeadBadge();
  }

  function renderCRM() {
    const body = $('#crmBody');
    if (!body) return;
    $$('.crm__tab').forEach(t => t.classList.toggle('is-on', t.dataset.crmTab === crmTab));

    const byS = { new: [], work: [], done: [] };
    leads.forEach(l => (byS[l.status] || byS.new).push(l));
    const totalSum = leads.filter(l => l.status !== 'done').reduce((s, l) => s + (+l.sum || 0), 0);
    const doneSum = leads.filter(l => l.status === 'done').reduce((s, l) => s + (+l.sum || 0), 0);

    const stats = `
      <div class="crm__stats">
        <div class="cstat"><b>${leads.length}</b><span>Всего заявок</span></div>
        <div class="cstat"><b>${byS.new.length}</b><span>Новых</span></div>
        <div class="cstat"><b>${money(totalSum)}</b><span>В работе, сумма</span></div>
        <div class="cstat"><b>${money(doneSum)}</b><span>Закрыто, сумма</span></div>
      </div>`;

    if (crmTab === 'board') {
      if (!leads.length) { body.innerHTML = stats + emptyCRM(); return; }
      body.innerHTML = stats + `<p class="crm__hint">Перетаскивайте карточки между колонками, чтобы менять статус. Каждая заявка с сайта появляется здесь мгновенно.</p>
        <div class="kanban">
          ${['new', 'work', 'done'].map(st => `
            <div class="kcol" data-col="${st}">
              <div class="kcol__head">
                <b>${STATUS[st]}</b>
                <span class="kcol__count">${byS[st].length}</span>
              </div>
              ${byS[st].map(leadCard).join('') || `<p style="font-size:11.5px;color:var(--muted);padding:10px 4px;line-height:1.5">Перетащите карточку сюда</p>`}
            </div>`).join('')}
        </div>`;
      bindKanban();
    } else if (crmTab === 'table') {
      if (!leads.length) { body.innerHTML = stats + emptyCRM(); return; }
      body.innerHTML = stats + `
        <p class="crm__hint">Полная база: контакт, услуга, дата, сумма, статус и комментарий. Экспорт доступен в шапке панели.</p>
        <div style="overflow:auto">
        <table class="ctable">
          <thead><tr>
            <th>№</th><th>Дата заявки</th><th>Клиент</th><th>Телефон</th><th>Услуга</th><th>Визит</th><th>Сумма</th><th>Статус</th>
          </tr></thead>
          <tbody>
            ${leads.map(l => `<tr>
              <td><b>${l.n}</b>${l.demo ? '<br><span style="font-size:9px;letter-spacing:.1em;color:var(--muted)">ДЕМО</span>' : ''}</td>
              <td>${new Date(l.created).toLocaleDateString('ru-RU')}<br><span style="color:var(--muted)">${new Date(l.created).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</span></td>
              <td>${esc(l.name)}</td>
              <td style="white-space:nowrap"><a href="tel:${digits(l.phone)}">${esc(l.phone)}</a></td>
              <td>${(SERVICES[l.service] || {}).short || l.service}${l.comment ? `<br><span style="color:var(--muted);font-size:11px">${esc(l.comment).slice(0, 70)}</span>` : ''}</td>
              <td>${l.date ? fmtDate(l.date) + (l.time ? '<br><span style="color:var(--muted)">' + l.time + '</span>' : '') : '—'}</td>
              <td><b>${money(l.sum)}</b></td>
              <td>
                <select data-status-sel="${l.n}" style="border:1px solid var(--line);padding:5px 7px;font-size:11px;background:var(--paper-3);font-family:var(--sans)">
                  ${Object.keys(STATUS).map(s => `<option value="${s}" ${l.status === s ? 'selected' : ''}>${STATUS[s]}</option>`).join('')}
                </select>
              </td>
            </tr>`).join('')}
          </tbody>
        </table></div>`;
      $$('[data-status-sel]').forEach(sel => sel.addEventListener('change', () => {
        setStatus(sel.dataset.statusSel, sel.value);
      }));
    } else {
      renderTG(body, stats);
    }
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function leadCard(l) {
    const svc = SERVICES[l.service] || {};
    return `<div class="lead" draggable="true" data-status="${l.status}" data-n="${l.n}">
      <div class="lead__top">
        <span class="lead__id">${l.n}${l.demo ? ' · demo' : ''}</span>
        <span class="lead__date">${new Date(l.created).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })}</span>
      </div>
      <div class="lead__name">${esc(l.name)}</div>
      <div class="lead__svc">${svc.short || l.service}${l.qty > 1 ? ' · ' + l.qty + ' чел.' : ''}${l.date ? ' · ' + fmtDate(l.date) : ''}</div>
      ${l.comment ? `<div class="lead__note">${esc(l.comment).slice(0, 96)}</div>` : ''}
      <div class="lead__meta">
        <a class="lead__phone" href="tel:${digits(l.phone)}">${esc(l.phone)}</a>
        <span class="lead__sum">${money(l.sum)}</span>
      </div>
      <div class="lead__acts">
        ${l.status !== 'new' ? `<button data-set="${l.n}" data-to="new">Новая</button>` : ''}
        ${l.status !== 'work' ? `<button data-set="${l.n}" data-to="work">В работу</button>` : ''}
        ${l.status !== 'done' ? `<button data-set="${l.n}" data-to="done">Завершить</button>` : ''}
        <button data-remove="${l.n}">Удалить</button>
      </div>
    </div>`;
  }

  function bindKanban() {
    $$('.kcol').forEach(col => {
      col.addEventListener('dragover', e => { e.preventDefault(); col.classList.add('is-over'); });
      col.addEventListener('dragleave', () => col.classList.remove('is-over'));
      col.addEventListener('drop', e => {
        e.preventDefault();
        col.classList.remove('is-over');
        const n = e.dataTransfer.getData('text/plain');
        if (n) setStatus(n, col.dataset.col);
      });
    });
    $$('.lead').forEach(card => {
      card.addEventListener('dragstart', e => {
        e.dataTransfer.setData('text/plain', card.dataset.n);
        e.dataTransfer.effectAllowed = 'move';
      });
    });
  }

  function setStatus(n, status) {
    const l = leads.find(x => x.n === n);
    if (!l || l.status === status) return;
    l.status = status;
    saveLeads();
    renderCRM();
    logEvent(`Заявка ${n} → ${STATUS[status]}`);
  }

  document.addEventListener('click', e => {
    const setB = e.target.closest('[data-set]');
    if (setB) { setStatus(setB.dataset.set, setB.dataset.to); return; }
    const rem = e.target.closest('[data-remove]');
    if (rem) {
      const n = rem.dataset.remove;
      if (confirm('Удалить заявку ' + n + '?')) {
        leads = leads.filter(l => l.n !== n);
        saveLeads(); renderCRM();
      }
    }
  });

  function emptyCRM() {
    return `<div class="crm__empty">
      <p>Здесь появятся заявки с сайта: билеты, экскурсии, фотосессии, аренда зала и заказы из арт-лавки. Пока ни одной — попробуйте оформить бронь на странице.</p>
      <button class="btn btn--sm" data-close-crm>Вернуться на сайт</button>
    </div>`;
  }

  /* ---------------- Telegram: настройки ---------------- */
  function renderTG(body, stats) {
    body.innerHTML = stats + `
      <div class="setgrid">
        <div class="panel">
          <div class="tg-state ${tg.enabled && tg.token && tg.chat ? 'is-on' : ''}" id="tgState">
            <i></i><span>${tg.enabled && tg.token && tg.chat ? 'Уведомления включены' : 'Бот не подключён'}</span>
          </div>
          <h4>Telegram-бот для заявок</h4>
          <p>Создайте бота через @BotFather, вставьте токен и chat_id Ольги. Каждая новая заявка будет приходить пуш-уведомлением на телефон.</p>
          <div class="field">
            <label for="tgToken">Токен бота</label>
            <input id="tgToken" type="text" placeholder="123456789:AA..." value="${esc(tg.token)}" autocomplete="off">
          </div>
          <div class="field">
            <label for="tgChat">chat_id получателя</label>
            <input id="tgChat" type="text" placeholder="например 512345678" value="${esc(tg.chat)}" autocomplete="off">
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button class="btn btn--sm" id="tgSave">Сохранить</button>
            <button class="btn btn--ghost btn--sm" id="tgTest">Тестовое сообщение</button>
            <button class="btn btn--ghost btn--sm" id="tgOff">Отключить</button>
          </div>
          <p style="margin-top:14px">Как получить chat_id: напишите боту любое сообщение, затем откройте <span class="code">api.telegram.org/bot&lt;токен&gt;/getUpdates</span> и возьмите значение <span class="code">message.chat.id</span>.</p>
        </div>
        <div class="panel">
          <h4>Журнал событий</h4>
          <p>Что происходило с заявками в этой сессии браузера.</p>
          <div class="crm__log" id="crmLog">${tgLog.length ? tgLog.map(t => `<div>${t}</div>`).join('') : '<div>Пока пусто</div>'}</div>
          <h4 style="margin-top:22px">Данные и экспорт</h4>
          <p>Заявки хранятся локально в браузере телефона или компьютера Ольги. Для резервной копии выгрузите базу в Excel или CSV — файл откроется в любой таблице.</p>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button class="btn btn--sm" id="tgExportCsv">Скачать CSV</button>
            <button class="btn btn--ghost btn--sm" id="tgExportXls">Скачать Excel</button>
            <button class="btn btn--ghost btn--sm" id="tgClearDemo">Убрать демо-заявки</button>
          </div>
          <p style="margin-top:14px">Подключение к серверу: для синхронизации между устройствами и приёма заявок без браузера укажите endpoint в настройках — форма отправит POST с той же структурой данных.</p>
        </div>
      </div>`;

    $('#tgSave').addEventListener('click', () => {
      tg.token = $('#tgToken').value.trim();
      tg.chat = $('#tgChat').value.trim();
      tg.enabled = !!(tg.token && tg.chat);
      LS.set(TG_KEY, tg);
      renderCRM();
      toast(tg.enabled ? 'Telegram подключён' : 'Заполните токен и chat_id');
      logEvent(tg.enabled ? 'Бот подключён' : 'Бот отключён (недостаточно данных)');
    });
    $('#tgTest').addEventListener('click', () => {
      if (!tg.token || !tg.chat) { toast('Сначала сохраните токен и chat_id'); return; }
      fetch(`https://api.telegram.org/bot${tg.token}/sendMessage`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: tg.chat, text: '🖼 Пантеон: тестовое уведомление. Заявки будут приходить сюда.' })
      }).then(r => r.json()).then(j => {
        toast(j && j.ok ? 'Тестовое сообщение отправлено' : 'Telegram отклонил запрос');
        logEvent(j && j.ok ? 'Отправлено тестовое сообщение' : 'Ошибка тестового сообщения');
        renderCRM();
      }).catch(() => { toast('Нет сети для отправки'); logEvent('Ошибка сети при отправке в Telegram'); });
    });
    $('#tgOff').addEventListener('click', () => {
      tg = { token: '', chat: '', enabled: false };
      LS.set(TG_KEY, tg); renderCRM(); toast('Уведомления отключены'); logEvent('Бот отключён');
    });
    $('#tgExportCsv').addEventListener('click', exportCSV);
    $('#tgExportXls').addEventListener('click', exportXLSX);
    $('#tgClearDemo').addEventListener('click', () => {
      leads = leads.filter(l => !l.demo);
      saveLeads(); renderCRM(); toast('Демо-заявки удалены');
    });
  }

  /* ---------------- Экспорт CSV ---------------- */
  function exportRows() {
    const head = ['Номер', 'Дата заявки', 'Время заявки', 'Клиент', 'Телефон', 'Услуга', 'Дата визита', 'Время визита', 'Гостей/часов', 'Сумма, ₽', 'Статус', 'Комментарий'];
    const rows = leads.map(l => [
      l.n,
      new Date(l.created).toLocaleDateString('ru-RU'),
      new Date(l.created).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      l.name, l.phone,
      (SERVICES[l.service] || {}).label || l.service,
      l.date ? fmtDate(l.date) : '', l.time || '',
      l.qty || 1, +l.sum || 0,
      STATUS[l.status] || l.status,
      l.comment || ''
    ]);
    return { head, rows };
  }

  function download(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1200);
  }

  function exportCSV() {
    const { head, rows } = exportRows();
    const q = v => '"' + String(v).replace(/"/g, '""') + '"';
    const csv = '\ufeff' + [head, ...rows].map(r => r.map(q).join(';')).join('\r\n');
    download(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), `pantheon-zayavki-${todayISO(0)}.csv`);
    toast('CSV выгружен');
    logEvent(`Экспорт CSV · ${rows.length} записей`);
  }

  /* ---------------- Экспорт XLSX (без библиотек) ---------------- */
  function crc32(buf) {
    let c, crc = 0xFFFFFFFF;
    for (let i = 0; i < buf.length; i++) {
      c = (crc ^ buf[i]) & 0xFF;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
      crc = (crc >>> 8) ^ c;
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }

  function zipStore(files) {
    const enc = new TextEncoder();
    const chunks = [];
    const central = [];
    let offset = 0;
    files.forEach(f => {
      const data = typeof f.data === 'string' ? enc.encode(f.data) : f.data;
      const name = enc.encode(f.name);
      const crc = crc32(data);
      const lh = new Uint8Array(30 + name.length);
      const dv = new DataView(lh.buffer);
      dv.setUint32(0, 0x04034b50, true);
      dv.setUint16(4, 20, true);
      dv.setUint16(6, 0x0800, true);
      dv.setUint16(8, 0, true);
      dv.setUint16(10, 0, true); dv.setUint16(12, 0x21, true);
      dv.setUint32(14, crc, true);
      dv.setUint32(18, data.length, true);
      dv.setUint32(22, data.length, true);
      dv.setUint16(26, name.length, true);
      dv.setUint16(28, 0, true);
      lh.set(name, 30);
      chunks.push(lh, data);

      const ch = new Uint8Array(46 + name.length);
      const dv2 = new DataView(ch.buffer);
      dv2.setUint32(0, 0x02014b50, true);
      dv2.setUint16(4, 20, true);
      dv2.setUint16(6, 20, true);
      dv2.setUint16(8, 0x0800, true);
      dv2.setUint16(10, 0, true);
      dv2.setUint16(12, 0, true); dv2.setUint16(14, 0x21, true);
      dv2.setUint32(16, crc, true);
      dv2.setUint32(20, data.length, true);
      dv2.setUint32(24, data.length, true);
      dv2.setUint16(28, name.length, true);
      dv2.setUint32(42, offset, true);
      ch.set(name, 46);
      central.push(ch);
      offset += lh.length + data.length;
    });
    const centralSize = central.reduce((s, c) => s + c.length, 0);
    const end = new Uint8Array(22);
    const dv3 = new DataView(end.buffer);
    dv3.setUint32(0, 0x06054b50, true);
    dv3.setUint16(8, files.length, true);
    dv3.setUint16(10, files.length, true);
    dv3.setUint32(12, centralSize, true);
    dv3.setUint32(16, offset, true);
    return new Blob([...chunks, ...central, end], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }

  function exportXLSX() {
    const { head, rows } = exportRows();
    const cell = (v, r, c) => {
      const ref = colLetter(c) + r;
      if (typeof v === 'number') return `<c r="${ref}"><v>${v}</v></c>`;
      return `<c r="${ref}" t="inlineStr" s="1"><is><t xml:space="preserve">${esc(v)}</t></is></c>`;
    };
    const colLetter = n => {
      let s = '';
      n = n + 1;
      while (n > 0) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); }
      return s;
    };
    const sheetRows = [head, ...rows].map((row, ri) =>
      `<row r="${ri + 1}">${row.map((v, ci) => cell(v, ri + 1, ci)).join('')}</row>`).join('');
    const cols = head.map((h, i) => `<col min="${i + 1}" max="${i + 1}" width="${[10, 12, 10, 22, 20, 34, 14, 12, 14, 12, 12, 46][i] || 16}" customWidth="1"/>`).join('');

    const sheet = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><cols>${cols}</cols><sheetData>${sheetRows}</sheetData></worksheet>`;
    const styles = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts>
<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFEFE5D6"/><bgColor indexed="64"/></patternFill></fill></fills>
<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf></cellXfs>
</styleSheet>`;

    const workbook = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Заявки" sheetId="1" r:id="rId1"/></sheets></workbook>`;
    const wbRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`;
    const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`;
    const ct = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`;

    const blob = zipStore([
      { name: '[Content_Types].xml', data: ct },
      { name: '_rels/.rels', data: rels },
      { name: 'xl/workbook.xml', data: workbook },
      { name: 'xl/_rels/workbook.xml.rels', data: wbRels },
      { name: 'xl/styles.xml', data: styles },
      { name: 'xl/worksheets/sheet1.xml', data: sheet }
    ]);
    download(blob, `pantheon-zayavki-${todayISO(0)}.xlsx`);
    toast('Excel выгружен');
    logEvent(`Экспорт Excel · ${rows.length} записей`);
  }

  /* ============================================================
     ТОСТ
     ============================================================ */
  let toastT;
  function toast(text) {
    const t = $('#toast');
    $('#toastText').textContent = text;
    t.classList.add('is-on');
    clearTimeout(toastT);
    toastT = setTimeout(() => t.classList.remove('is-on'), 2900);
  }

  /* ============================================================
     REVEAL + СКРОЛЛ + НАВИГАЦИЯ
     ============================================================ */
  let revObs;
  function observeReveals() {
    if (!('IntersectionObserver' in window)) {
      $$('[data-rev]').forEach(el => el.classList.add('is-in'));
      return;
    }
    if (!revObs) {
      revObs = new IntersectionObserver(entries => {
        entries.forEach(en => {
          if (en.isIntersecting) { en.target.classList.add('is-in'); revObs.unobserve(en.target); }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    }
    $$('[data-rev]:not(.is-in)').forEach(el => revObs.observe(el));
  }

  function initScroll() {
    const bar = $('#topbar');
    const onScroll = () => bar.classList.toggle('is-stuck', window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    // активный пункт меню
    const links = $$('.nav a');
    const secs = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
    if ('IntersectionObserver' in window && secs.length) {
      const io = new IntersectionObserver(entries => {
        entries.forEach(en => {
          if (en.isIntersecting) {
            links.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id));
          }
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      secs.forEach(s => io.observe(s));
    }
  }

  /* ============================================================
     СОБЫТИЯ
     ============================================================ */
  document.addEventListener('click', e => {
    const book = e.target.closest('[data-book]');
    if (book) {
      e.preventDefault();
      const key = book.dataset.book;
      const opts = {};
      if (book.dataset.dayPrefill) opts.date = '';
      if (key === 'rent' || key === 'rent_studio') { opts.qty = RENT.hours; }
      if (key === 'club' || key === 'women_club') opts.time = '18:30';
      if (key === 'art_friday') opts.time = '18:30';
      if (key === 'dating_evening') opts.time = '20:00';
      if (key === 'mom_evening') opts.time = '16:00';
      if (key === 'quest_kuku') opts.time = '16:00';
      if (key === 'photo_dvizh') opts.time = '14:00';
      if (key === 'zoo_time') opts.time = '13:00';
      openBooking(key, opts);
      return;
    }
    if (e.target.closest('[data-add]')) { addToCart(e.target.closest('[data-add]').dataset.add); return; }
    if (e.target.closest('[data-open-cart]')) { renderCart(); openOverlay(); $('#cart').classList.add('is-open'); return; }
    if (e.target.closest('[data-close-cart]')) { $('#cart').classList.remove('is-open'); overlay.classList.remove('is-open'); document.body.style.overflow = ''; return; }
    if (e.target.closest('[data-open-crm]')) { closeAll(); openCRM(); return; }
    if (e.target.closest('[data-close-crm]')) { closeCRM(); return; }
    if (e.target.closest('[data-close-modal]')) { closeAll(); return; }
    if (e.target.closest('[data-open-mnav]')) { $('#mnav').classList.add('is-open'); $('#mnav').setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; return; }
    if (e.target.closest('[data-close-mnav]') || e.target.closest('.mnav__list a')) {
      $('#mnav').classList.remove('is-open'); $('#mnav').setAttribute('aria-hidden', 'true');
      document.body.style.overflow = ''; return;
    }

    // корзина: количество
    const cq = e.target.closest('[data-cq]');
    if (cq) {
      const item = cart.find(i => i.id === cq.dataset.cq);
      if (item) {
        item.qty += +cq.dataset.d;
        if (item.qty <= 0) cart = cart.filter(i => i.id !== cq.dataset.cq);
        saveCart();
      }
      return;
    }
    const del = e.target.closest('[data-del]');
    if (del) { cart = cart.filter(i => i.id !== del.dataset.del); saveCart(); return; }
  });

  overlay.addEventListener('click', closeAll);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeAll();
      $('#crm') && closeCRM();
      $('#mnav').classList.remove('is-open');
      document.body.style.overflow = '';
    }
  });

  $('#calcBook') && $('#calcBook').addEventListener('click', () => {
    openBooking('rent', { qty: RENT.hours, time: '17:00' });
  });

  $$('.crm__tab').forEach(t => t.addEventListener('click', () => { crmTab = t.dataset.crmTab; renderCRM(); }));
  $('#crmExport') && $('#crmExport').addEventListener('click', exportCSV);
  $('#crmXls') && $('#crmXls').addEventListener('click', exportXLSX);
  $('#crmXls') && $('#crmXls').addEventListener('dblclick', exportXLSX);

  /* ============================================================
     INIT
     ============================================================ */
  initPriceFilters();
  renderPrice();
  renderShelf();
  renderAfisha('tue');
  renderCalc();
  renderCart();
  updateCartBadge();
  updateLeadBadge();
  initScroll();
  observeReveals();
  logEvent('Панель заявок готова к работе');

  // страховка: если IntersectionObserver не сработал — показываем блоки принудительно
  window.addEventListener('load', () => setTimeout(() => {
    $$('[data-rev]:not(.is-in)').forEach(el => {
      if (el.getBoundingClientRect().top < window.innerHeight * 1.25) el.classList.add('is-in');
    });
  }, 900));
})();
