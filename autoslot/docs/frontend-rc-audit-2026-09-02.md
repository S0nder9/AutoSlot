# AutoSlot Frontend — RC audit, 2026-09-02

## Статус и границы отчёта

**FRONTEND BUSINESS CORE: NOT READY — обязательная acceptance-матрица ещё не закрыта.**

Исправления frontend внесены, production build и lint проходят. Это не подтверждение полного release acceptance: удаления/soft-delete, настоящий pointer Drag/Resize с отказами, полная auth-матрица и нагрузочные сценарии истории пока не проверены через UI. Не проверенный сценарий ниже не считается PASS и не означает найденный дефект.

Backend не изменялся. Новые бизнес-функции, метрики, framework тестирования, warehouse, payroll transactions и optimistic concurrency не добавлялись. Существующая сериализация времени в UTC сохранена.

Пользователь разрешил создание и редактирование тестовых данных в календаре `RC 2026-09-02`. Отдельное подтверждение удаления запрошено, но к моменту отчёта не получено. Созданные данные не удалялись; существующие данные других календарей только просматривались.

Пользователь отдельно подтвердил: **сотрудник обязателен для каждой добавленной работы Event**. Наличие хотя бы одной работы этим не навязывается.

Обозначения:

- **UI PASS** — действие действительно выполнено в браузере, результат проверен.
- **CHECK PASS** — проверка кода/изолированное моделирование, не browser E2E.
- **PARTIAL** — перечислены только пройденные части сценария.
- **NOT RUN** — acceptance не подтверждён.

## 1. Baseline и архитектура

До hardening: `npm run build` и `npm run lint` проходили. Рабочее дерево уже содержало незакоммиченные изменения Analytics; они сохранены. Общий `git diff` включает их и не равен исключительно изменениям этого аудита.

Стек: Next 16.2.6 / React 19, Axios, TanStack Query 5, react-big-calendar 1.20, date-fns, Zod. В package.json нет test script; отдельного установленного E2E framework нет. Новый framework не устанавливался.

| Route / экран | Источник данных | Query family / состояние |
|---|---|---|
| `/auth/login`, `/account`, protected layout | `auth/me`, login, logout, logout-all, refresh-tokens | AuthProvider, HttpOnly cookies, таймер 14 минут |
| `/dashboard/profile`, `/dashboard/schedule` без ID | `schedules` | `['schedules']` |
| `/dashboard/schedule?scheduleId=...&date=...&view=...` | Schedule metadata; lightweight range Events | `['schedules', scheduleId]`; schedule-events + ISO range |
| Event Details / Edit | полный Event GET по клику; POST / PUT / DELETE / PATCH time | range cache + локальное состояние Details; per-event pending guards |
| `/dashboard/jobs`, `/employees`, `/clients`, `/cars`, `/parts` | scoped list/search, POST/PATCH/DELETE | `['schedule-<catalog>', scheduleId]`, search text/limit/filters |
| `/dashboard/analytics` | statistics/overview или statistics/details | schedule-statistics + scheduleId/range/bucket/timezone |
| `/dashboard/employees/[id]/analytics` | employee summary + work-entries | schedule-statistics + scheduleId/employeeId/range/bucket/timezone |
| `/dashboard/{jobs,parts,clients,cars}/[id]/analytics` | entity summary + entries/orders | entity-analytics + scheduleId/kind/entityId/range/bucket/timezone |

General Analytics: Details загружается только для соответствующей вкладки. Внутренние Employees/Jobs/Parts используют уже полученный response. Истории открывают общий EventDetailsDialog, не отдельные реализации карточки.

## 2. Golden UI Flow

Создан календарь `RC 2026-09-02`, ID `6cb77d9a-8608-4f69-8026-b38b7ed6d1c3`.

| Шаг | Результат |
|---|---|
| Вход | PARTIAL: пользователь вошёл сам; браузер подтвердил authenticated UI `testTest1`. Автоматический ввод логина/пароля не проверялся |
| Создание Schedule | UI PASS |
| Employee Иван Петров | UI PASS: создан, ставка выставлена 40% |
| Job Замена масла | UI PASS: 3000 ₽, 1.5 часа |
| Part Масляный фильтр | UI PASS: закупка 700 ₽, базовая продажа 1200 ₽ |
| Client RC Клиент | UI PASS |
| Car Lada Vesta RC | UI PASS: выбран RC Клиент |
| Event RC Заказ 5200 | UI PASS: 02.09.2026, 14:00–15:00 local, работа 3000 ₽, запчасть 2 × 1100 ₽ |
| Event Details | UI PASS: 3000 + 2200 = 5200 ₽; клиент, автомобиль, исполнитель, описание, время корректны |
| Overview / Details | UI PASS: один заказ, work 3000, parts 2200, total 5200 |
| Себестоимость / маржа | UI PASS: 1400 / 800 ₽; Overview раскрывает их по кнопке |
| Выплата сотруднику | UI PASS: 1200 ₽ при исторических 40% |
| Текущая ставка 40 → 50 | UI PASS: текущий Employee изменился, старый ряд остался 40% / 1200 ₽ |
| Закупка Part 700 → 900 | UI PASS: каталог 900, исторический заказ/аналитика продолжают использовать 700 / 1400 / 800 |
| Сложный Edit / F5 | UI PASS для цен/количества/оплаты: работа 3100, запчасть 3 × 1050, итог 6250, оплачено; F5 сохранил значения. Затем контрольные 3000 / 2 × 1100 / неоплачено восстановлены |
| Удаления и inactive history | NOT RUN — требуется подтверждение удаления |

Дополнительно создана `RC Вложенная работа` (0 ₽) внутри Event. Она автоматически добавилась в форму, затем была убрана из Event до его сохранения. Сам справочник сохранён. `RC Отмена` не создавалась: форма была закрыта Escape без сохранения.

Итоговое оставленное состояние: контрольный заказ снова 5200 ₽ / неоплачено; текущая ставка сотрудника 50%; текущая закупка Part 900 ₽; снимки контрольного заказа — 40% / 700 ₽.

## 3. Event / Calendar acceptance

| Сценарий | Статус / свидетельство |
|---|---|
| Existing Client / Car / Job / Part selection | UI PASS; запчасть доступна без ввода поиска |
| Nested Job Cancel | UI PASS: Escape закрывает только Job; title, description, time, client/car, jobs/parts и цены остаются |
| Nested Job Create | UI PASS: новая работа выбирается; Event остаётся открыт до явного Save |
| Nested Client / Car / Part / Employee Create | CHECK PASS по общему modal/form pattern; отдельный полный UI flow для каждого NOT RUN |
| Client → null | UI PASS: автомобиль очищается сразу, selector disabled |
| Client A → B | CHECK PASS: тот же атомарный обработчик сбрасывает carId при изменении clientId; отдельная UI пара A/B NOT RUN |
| Event Edit Cancel | UI PASS: несохранённый title и удалённый из формы клиент не меняют Details |
| Event Edit → Details | UI PASS: новая server-confirmed сумма 6250 ₽ отображается сразу, затем подтверждена F5 |
| Historical purchase in Edit | UI PASS: 700 ₽, а не 900 ₽ текущего каталога |
| Payroll в Event | UI PASS: ставка и выплаты отсутствуют в Create/Edit/Details |
| Required Employee | CHECK PASS: validation до request, опция «Без сотрудника» убрана; подтверждено пользователем |
| Двойной submit | CHECK PASS: синхронный ref lock в форме и create hook; pending disables submit. Измеренный browser double-click request count NOT RUN |
| Ошибка Create от backend | NOT RUN; frontend numeric validation проверена в Job Form, failed mutation code-path сохраняет форму |
| Delete / failed Delete | NOT RUN |
| Drag / Resize / F5 после них | CHECK PASS только для helpers; pointer UI NOT RUN |
| Failed Drag rollback / parallel A+B | CHECK PASS по per-event map/guards и scoped cache updater; controlled backend failure UI NOT RUN |
| Month → 12 Next → F5 | UI PASS: сентябрь 2027 и `date=2027-09-02&view=month` сохраняются |
| Week / Day / Agenda → F5 | UI PASS: каждый режим и опорная дата сохраняются |
| Today | UI PASS: `date=2026-09-02`, Agenda сохраняется |
| Back/Next range arithmetic | CHECK PASS; Next и возврат через Today выполнены в UI; все варианты Prev/Next не перебраны |
| Invalid date/view URL | CHECK PASS helpers: безопасный fallback; отдельная browser URL-матрица NOT RUN |
| Cache freshness / manual Refresh | CHECK PASS: 30s staleTime, refetch action; network trace для fresh cache не записан |
| Большой Event 10–20 Jobs + Parts | NOT RUN |

Calendar controlled date/view берутся из `useSearchParams`, а не дублируются во внутреннем useState. `replaceState(null, '', url)` синхронизируется с Next; передача internal history state могла обходить обработчик Next. Range вычисляется из URL до первого query. Дополнительный RSC navigation только ради date/view не требуется.

Month/Week/Day/Agenda range contract и ISO serialization не менялись в этом hardening.

## 4. Каталоги, поиск, изоляция

| Модуль | UI проверено | Не закрыто |
|---|---|---|
| Jobs | Create, fractional hours, price validation, nested Create/Cancel, search «масло», clear, A/B switching | отдельный Edit/Delete, >10 search pagination |
| Employees | Create, ставка 40→50, переход в analytics | основной Edit/Delete, search UI matrix |
| Parts | Create, Edit закупки 700→900, историческая закупка в Event/analytics, initial selector list | Delete, search pagination |
| Clients | Create, search RC / нет совпадений / clear, analytics, existing selector | основной Edit/Delete, nested Create UI |
| Cars | Create, owner, existing selector, A/B switching, analytics | Edit/Delete, search pagination, nested Create UI |

Общий search contract сохранён: normalize trim → существующий debounce 300 ms → server search `text/limit/offset`. Пустая строка выбирает обычный list. Локальная fuzzy-фильтрация не добавлялась.

Ключи содержат scheduleId, text, limit и clientId для car search. Старый search response не может стать результатом другого ключа. Кнопка Load More использует `cancelRefetch: false`; nextOffset должен увеличиваться. Results dedupe by ID. Это CHECK PASS, не измерение задержки и количества HTTP requests в DevTools.

UI A/B проверен для Jobs, Cars и General Analytics: данные RC не выдаются за df и возвращаются при выборе RC. Остальные модули используют scoped keys и keyed page state; их полная A/B browser-матрица NOT RUN.

## 5. Analytics acceptance

| Область | Статус |
|---|---|
| General Overview / Details | UI PASS по golden amounts |
| General Day / Week / Month / Year | UI PASS, соответствующие данные отображаются после смены периода |
| General custom | UI PASS: 31.08–02.09 содержит ровно 31.08, 01.09, 02.09; total 5200; Details также корректен |
| Week local buckets | UI PASS: 31.08–06.09 — 7 дней, без лишнего предыдущего дня |
| Employee Day / Week / Month / Year / custom | UI PASS; custom после F5 сохраняется |
| Employee historical payout | UI PASS: 1200; изменение текущей ставки не пересчитывает историю |
| Job Analytics | UI PASS: summary 3000, history, F5, Event Details и Back |
| Part Analytics | UI PASS: 2200 / 1400 / 800, history 700, F5, Event Details |
| Client Analytics | UI PASS: 5200, history, F5, Event Details |
| Car Analytics | UI PASS: 5200, history, F5, Event Details; исправлена неверная подпись отсутствующего автомобиля |
| Все периоды каждой Job/Part/Client/Car | NOT RUN; общий range/query механизм проверен кодом |
| Unpaid → Details | Общий flow проверен кодом; отдельный click из unpaid NOT RUN |
| History >50 / Show More всех типов | NOT RUN; продолжение по nextOffset проверено кодом |
| Новая работа по новой ставке 50% | NOT RUN |
| Legacy null rate/payout | CHECK PASS: individual rows отличают null от 0; реальные legacy rows не прогонялись полностью |
| 123.45 × 33.33% → 41.15 | CHECK PASS: frontend форматирует server payout до двух знаков и не пересчитывает его; отдельный backend/UI golden row NOT RUN |
| 404 / foreign entity direct route | CHECK PASS: error + Retry вместо бесконечной загрузки; browser negative scenario NOT RUN |

Payout = «К выплате», не «Выплачено». OrdersTotal = стоимость заказов, не прибыль компании. Employee current metadata и historical snapshots разделены. General/individual analytics помечается stale после изменения Event и каталога; eager reload всей аналитики после каждого drag не добавлен.

## 6. Auth / cache / network

Сохранены HttpOnly cookies, background refresh 14 минут, `_retry`, `refreshPromise`, login/register/refresh exclusions и существующие logout endpoints.

Новое усиление: API-запросы помечены номером локальной auth-сессии. `clearLocalSession` меняет номер, останавливает таймер, очищает QueryClient и user. Поздние responses прежней сессии отклоняются как cancelled; callbacks после await/cancel проверяют версию. Login начинает с чистого cache. Старый refresh не очищает новую сессию своим handler и не сбрасывает её refreshPromise.

Изолированные проверки с Axios adapter, без HTTP и без браузерных cookies:

- 3 параллельных protected 401: **1 refresh**, 3 initial + 3 retry — CHECK PASS.
- Failed refresh 401: unauthorized callback один раз, цикл отсутствует — CHECK PASS.
- Login endpoint не запускает auto-refresh — CHECK PASS.
- Late successful response после invalidateApiSession становится CanceledError — CHECK PASS.
- Реальные expiry/refresh cookies, Logout, Logout-all, A logout / B refresh, Login User B, Back after logout — NOT RUN в этой сессии аудита.

Catalog reconciliation:

1. Отменяет конфликтующий GET перед cache write; защищён auth epoch.
2. Обновляет уже загруженный list полной server entity, не создаёт частичный list из одного элемента.
3. Обновляет существующие detail/search items в текущем Schedule.
4. Create/Edit инвалидирует активный fuzzy search: допустим search GET, потому что frontend не знает серверное membership/order.
5. Delete локально удаляет из list и всех загруженных search pages, поправляет offsets; немедленного search/list GET не требуется.
6. При ещё не загруженном list разрешён GET полного списка; mutation response не подменяет его неполным cache.

Event reconciliation различает range array и infinite search pages. Delete больше не вызывает `.filter()` на search object. Отменяются конфликтующие range GET; server-confirmed Event обновляет затронутые ranges. Time override и rollback остаются per Event. Analytics становится stale без eager refetch.

При Schedule Delete очищаются все его query families и убирается выбранный ID из маршрута. При неудаче cleanup не выполняется. Browser deletion acceptance NOT RUN.

Ожидаемая структура запросов по фактическому коду (не HAR-замер):

| Flow | Запросы |
|---|---|
| Calendar range | Schedule metadata + lightweight `GET schedules/{id}/events?startTime&endTime`; не full details × N |
| Details click | `GET schedules/{id}/events/{eventId}`, без Client/Job/Part N+1 |
| Create/Edit/Delete Event | один POST / PUT / DELETE при принятом submit; range cache reconciliation |
| Drag/Resize | один PATCH `.../events/{id}/time` на принятую операцию |
| Каталог | list; непустой search с limit/offset; один POST/PATCH/DELETE при принятом submit |
| General Analytics | overview либо details; inner tabs без собственных GET |
| Individual Analytics | summary + первая history page; Show More — следующий history request |

Точные browser request counts, abort/race timings и искусственно медленная сеть не измерялись. Нельзя считать эту таблицу подтверждением zero-extra-GET E2E.

## 7. Исправленные дефекты

Severity: P1 — корректность бизнес-данных/изоляции; P2 — UX/recovery.

| Severity | Воспроизведение / причина | Исправление | Проверка |
|---|---|---|---|
| P1 | Запрос прежней auth-сессии завершается после очистки/нового входа и может повторно наполнить state/cache | Auth epoch в Axios, refresh и mutation callbacks; QueryClient.clear; guards auth/me | Adapter late-response CHECK PASS, build |
| P1 | Refetch списка конкурирует с mutation и возвращает старые данные | Отмена конфликтующего GET перед server-confirmed write; единый catalog reconciler | QueryClient моделирование + реальный Create/Edit UI |
| P1 | Create до загрузки list создаёт cache из единственного нового элемента | Не seed-ить неполный list; при необходимости загрузить полный | Code CHECK PASS |
| P1 | Удаление Event при наличии search cache применяет array filter к InfiniteData | Range key guard + отдельный search-pages updater | Моделирование структуры / build; DELETE UI ещё не выполнен |
| P1 | Несколько EventJob одного Job у разных Employees редактировались по одному jobId | Стабильный rowKey из EventJob.id/UUID; update/remove по строке; payload не содержит rowKey | Code CHECK PASS; стандартный Edit UI PASS; дубль-пара UI NOT RUN |
| P1 | Edit мог отображать текущие имена Job/Employee вместо сохранённых снимков | Initial EventJob snapshot имеет приоритет для неизменённой пары | Code CHECK PASS; историческая ставка/закупка UI PASS |
| P1 | Денежные поля пропускали >2 знаков/большие числа или мешали вводу запятой; quantity молча обрезалась | Общая money validation/input; явная integer validation; без округления пользовательского ввода | Job 1,231 отклонён в UI, 3000/1.5 приняты; boundary checks PASS |
| P1 | Форма допускала работу без Employee, backend её отклонял | Required Employee validation; убрана пустая опция | Контракт сверён; пользователь подтвердил; code/build PASS |
| P2 | Schedule/date/view менялись в URL, но могли расходиться с локальным controlled state / Next history | Один URL source of truth; replaceState с null вместо internal state | Month+12Next/F5; Week/Day/Agenda/F5 UI PASS |
| P2 | Sidebar сохранял Schedule только через click-handler, href новой вкладки терял scope | scheduleId непосредственно в href | DOM href и переходы Jobs/Cars/Analytics UI PASS |
| P2 | Dialog/search state переживал смену Schedule | Keyed scope контейнеры каталогов; keyed Details statistics | A/B Jobs/Cars/Analytics UI PASS; прочие CHECK PASS |
| P2 | Refresh при активном search обновлял ordinary list, а не видимые результаты | Выбор list.refetch/search.refetch по строке; disable pending | Code CHECK PASS |
| P2 | Load More мог отменять предыдущую загрузку и принимать неувеличивающийся offset | cancelRefetch:false, increasing nextOffset, dedupe | Code CHECK PASS; high-volume UI NOT RUN |
| P2 | Clear car search временно выбирал старые pages по debounced text; empty retry мог вызвать search | Ordinary list выбирается по текущему normalized text; корректный refetch branch | Code CHECK PASS |
| P2 | Недостаточная focus containment и риск bubbling submit вложенной формы | Top-modal focus/Tab/Escape, restore focus, остановка submit propagation на shell | Nested Job Create/Cancel UI PASS |
| P2 | Ошибки list/selectors выглядели как отсутствие данных, не было удобного Retry | Error/retry Calendar, schedules, Job/Employee/Client/Car/Part selectors, history | Code/build PASS; controlled network-failure UI NOT RUN |
| P2 | История Employee не открывала общий Event Details | Общий useEventDetails / read-only dialog | UI PASS |
| P2 | Возврат в analytics терял выбранные вкладки | tab/section в URL с native history | Job Analytics → Back UI PASS |
| P2 | Entity summary error продолжал показывать «Загрузка»; error следующей history page скрывал уже загруженное | Error title + retry; сохранение rows при paging error | Code/build PASS |
| P2 | Dark tokens следовали системной теме, Tailwind dark: — только .dark классу | Dark variant учитывает prefers-color-scheme и explicit .light | Dark UI просмотрен; light UI NOT RUN |
| P2 | Car history показывала «Автомобиль не указан», потому что endpoint intentionally omits redundant carName | Для car-specific history не выводить ложный missing label | Реально воспроизведено, backend projection прочитан, повторный UI PASS |
| P2 | Schedule metadata cache мог терять дополнительные поля при замене коротким response; отмена unrelated metadata requests | Merge metadata; cancel только list + нужный ID; refetch активного незагруженного cache | Code/build PASS |

## 8. Responsive / focus / console

- UI PASS: Details 390 × 844 — dialog шириной 358 px, отступы 16 px, без horizontal page overflow.
- UI PASS: Client Analytics narrow — sidebar переходит в mobile toggle, period buttons переносятся, карточки читаемы; document scrollWidth = clientWidth.
- UI PASS: 1024 — Part Analytics без horizontal page overflow; 1920 — General Analytics без overflow.
- 1440/1366 использовались при работе с аналитикой/календарём. Не все страницы проверены на каждой ширине.
- Nested Escape, закрытие дочернего Job и возврат в Event проверены. Полная Tab/Enter/backdrop-матрица, большие списки и light theme NOT RUN.
- Зафиксированы dev warnings об outdated JSX transform при календаре и Fast Refresh full reload во время правок. Runtime key/hydration/controlled warnings и unhandled promise errors в просмотренных шагах не наблюдались. Это не утверждение о полном покрытии Console всех 100 сценариев.
- Размер браузера после responsive-проверок восстановлен.

## 9. Проверки и файлы

Финальные проверки:

- `npm run build` — PASS, production compilation, TypeScript, prerender 19 страниц.
- `npm run lint` — PASS; повторный финальный прогон указан в итоговом сообщении.
- `npx tsc --noEmit` — PASS.
- `git diff --check` — PASS; Git может печатать предупреждения LF→CRLF, это не whitespace errors.
- Test script отсутствует. Backend tests не запускались и не менялись.
- Одноразовые Node assertions без HTTP/framework: money boundaries/comma, statistics ranges, UTC round-trip, drag duration, resize minimum, parallel refresh/exclusions/failure, late-session response, schedule/search cache deletion — CHECK PASS.

Основные frontend-файлы hardening (относительно `autoslot/`):

```text
app/globals.css
components/auth/auth-provider.tsx
components/calendar/create-event-dialog.tsx
components/calendar/event-car-field.tsx
components/calendar/event-client-field.tsx
components/calendar/event-form.tsx
components/calendar/event-jobs-field.tsx
components/calendar/event-parts-field.tsx
components/calendar/schedule-page-content.tsx
components/calendar/selected-schedule-calendar.tsx
components/dashboard/dashboard-sidebar.tsx
components/dashboard/profile-dashboard.tsx
components/dashboard/schedule-dialog-shell.tsx
components/jobs/job-form.tsx
components/jobs/jobs-page-content.tsx
components/employees/employee-form.tsx
components/employees/employees-page-content.tsx
components/clients/clients-page-content.tsx
components/cars/cars-page-content.tsx
components/parts/part-form.tsx
components/parts/parts-page-content.tsx
components/analytics/weekly-analytics-overview.tsx
components/analytics/weekly-analytics-details.tsx
components/analytics/employee-analytics-page-content.tsx
components/analytics/entity-analytics-page-content.tsx
components/ui/money-input.tsx                         [new]
hooks/use-dashboard-session.ts
hooks/use-modal-behavior.ts
hooks/use-job-form.ts
hooks/use-part-form.ts
hooks/use-schedules.ts
hooks/use-selected-calendar.ts
hooks/use-schedule-{job,employee,client,car,part,event}-search.ts
hooks/use-schedule-{jobs,employees,clients,cars,parts}.ts
lib/api.ts
lib/cache-reconciliation.ts                          [new]
lib/calendar-types.ts
lib/format-event.ts
lib/services/schedules.ts
lib/services/schedule-events.ts
lib/validations/money.ts                             [new]
lib/validations/{job,employee,part,event}.ts
docs/frontend-rc-audit-2026-09-02.md                  [new]
```

Существующие незакоммиченные Analytics routes/types/services/helpers и другие изменения пользователя в общем diff сохранены. Коммитов и destructive Git operations не выполнялось.

## 10. Release blockers и ограничения

Для закрытия acceptance остаются:

1. Разрешение и UI-проверка удаления только созданных RC-данных; inactive Client/Car/Job/Employee/Part в старом Event, unrelated Save, Event Delete и Schedule cleanup.
2. Настоящий pointer Drag/Resize, F5, controlled failure rollback, parallel Events и last-write-wins в двух вкладках.
3. Реальные Logout/Logout-all, expired/missing cookies, два независимых браузера, User A→B cache isolation, direct protected URL/Back после выхода.
4. Nested Client/Car/Part/Employee acceptance, backend validation failure/retry, большие Events, >10 search / >50 history, полный light/responsive проход и network trace.

Непройденные пункты не выдаются за отложенные подтверждённые frontend bugs: найденные однозначные дефекты исправлены, а ограничение здесь — неполнота release verification.

Известные backend semantics не менялись: last-write-wins; отсутствие POST Idempotency-Key; READ COMMITTED analytics; текущие Client/Car names в history; historical Job/Employee/Part snapshots. Cache write не заменяет серверную проверку доступа. Active fuzzy search может refetch после Create/Edit — это намеренно, не лишний full list reload.

**FRONTEND BUSINESS CORE: NOT READY**
