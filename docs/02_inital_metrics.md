### Метрики

Нічого дуже розумного поки не придумала :) Я очікую, що в кінцевому результаті модель має видавати за запитом по певній темі масив об'єктів з датою та заголовками подій у ці дати. Наприклад

```
[
    {
        "date": "15.03.2020",
        "events": [
            "Росія і Білорусь призупиняють залізничне сполучення з Україною",
            "Львів закриває всі магазини, крім продуктових і аптек – мер"
        ]
    },
...
]
```

[ось тут](../data/toy_data.json) іграшковий приклад за запитом "коронавірус"
[сорс код з прикладом валідації](../src/metrics/example_timeline_metrics.py)

Для цих даних буду рахувати наступне:

-   false-positives - події за дану дату, які не релевантні або такі, в яких суб'єкт не виступає головним
-   false-negatives - релевантні події за дану дату, які відсутні у результативній вибірці або події, у яких неправильна дата; проте останні можна додавати до true-positives, якщо дата входить в рейндж заданих дат (наприклад, подія датована 23.03, хоча насправді відбулася 22.03, але якщо ми шукаємо по березню, то це ок)
-   власне, recall і precision на основі попередніх двох (думаю, в мене вони і будуть ключовими)
-   ще додала таку метрику як неправильність порядку подій за датою, проте треба подумати, чи можна її якось використати (або прибрати, якщо ніт)

Поки що це демо версія класифікатора, взагалі основні метрики буду рахувати за допомогою `sklearn`, коли я його достатньо опаную

### TODO

Треба сформулювати, як будуть порівнюватись між собою самі події. Порівняння на рівні тексту можливо (типу BLUE, банальний diff чи щось подібне), але я би пропонував порівнювати на більш абстрактному рівні, тобто переводити текст у струкутуру і матчити струкутуру. Бачу к мінімум 2 варіанти:

Використати готовий формат, наприклад SRL або AMR. На жаль, для української нема готових бібліотек, що здатні його згенерувати, до того ж залишається проблема потім узгодити (трохи) різні представлення однієй й тої ж інформації.
упинитись на базовому форматі трійки subject-predicate-object (як в RDF/SPARQL). Або декількох, якщо SUBJ або OBJ включає перелічення. Приклади:

```
У своєму першому закордонному візиті Зеленській відвідав таку рідну йому Бєнєсуелу. =>
<wiki:Володимир*Зеленський> <відвідати> <wiki:Вєнесуела>
```

```
У своєму другому закордонному візиті Зеленській відвідав Гондурас і Панаму =>
<wiki:Володимир*Зеленський> <відвідати> <wiki:Гондурас>
<wiki:Володимир_Зеленський> <відвідати> <wiki:Панама>
```

Тут ще класно було б зробити вікіікацію, тобто прив'язати сутності до dbpedia (а також, можна було б до conceptnet'у). Звісно, це трохи додаткової роботи (хоча, на базовому рівні має бути можливим досить простими правилами отримати такий результат з dependency parsу), але цей метод також може бути корисний і для самої роботи...
