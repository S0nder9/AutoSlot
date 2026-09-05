# Employee Analytics — frontend-аудит

## Исправление смены дат и переработка интерфейса

Причина рассинхронизации найдена в установленном Next.js: `replaceState(window.history.state, ...)` передавал внутренний флаг `__NA`. App Router считал вызов внутренним и пропускал синхронизацию useSearchParams. Исправлено на `replaceState(null, ...)`: Next сам копирует внутреннее состояние и обновляет URL-контекст без RSC-навигации.

Быстрые нажатия стрелок используют актуальную дату из window.location, а не предыдущий render. Custom range применяется одной операцией после кнопки «Применить»; ввод двух дат не создаёт промежуточные запросы. В toolbar показано состояние загрузки. Query keys и backend API не менялись.

Интерфейс переработан: компактная ставка рядом с именем, редактирование по «Изменить», единая панель периода, две главные суммы и четыре вспомогательных показателя. Причина нулевой выплаты для legacy-работ показана рядом с выплатой. Таблица агрегатов и история разделены переключателем «По видам работ / Все записи» без дополнительных GET при переключении.

После этих правок build/lint/diff check прошли. Browser-проверка снова остановилась на login; подтверждённого визуального и сетевого прогона на пользовательских данных нет.

## Единый экран

Канонический route: `/dashboard/employees/{employeeId}/analytics?scheduleId=...`.
Оба входа используют одну функцию `employeeAnalyticsHref` и один `EmployeeAnalyticsPageContent`:

- «Сотрудники» → кнопка «Статистика» рядом с редактированием и удалением.
- «Аналитика → Подробно → Сотрудники» → ссылка в имени сотрудника.

Идентификаторы находятся в URL. Есть обычный browser Back и ссылка на список сотрудников с сохранённым scheduleId.
Параметры `period`, `date`, `from`, `to` сохраняются через history.replaceState. F5 восстанавливает выбранные значения без localStorage.

## Фактический backend-контракт

Проверены StatisticsController, EmployeeStatisticsDTO, EmployeeStatisticsDTOValidator, EmployeeStatisticsService, EmployeesController, EmployeeDTO и EmployeeDTOValidator.

- GET `/api/schedules/{scheduleId}/statistics/employees/{employeeId}?startTime=...&endTime=...&bucket=day|month`.
- GET `/api/schedules/{scheduleId}/statistics/employees/{employeeId}/work-entries?startTime=...&endTime=...&limit=50&offset=...`.
- GET `/api/schedules/{scheduleId}/employees/{employeeId}` — текущие данные сотрудника, включая отдельные поля имени для обязательного Update DTO.
- PATCH `/api/schedules/{scheduleId}/employees/{employeeId}` — `firstName`, `middleName`, `lastName`, `workPercent`.

Используется существующий Axios client и ApiResponse. Нового HTTP client нет.

Statistics response: employee, summary, timeline, jobs. Все показатели и nullable snapshots типизированы по фактическим DTO.
Work entries response: items, hasMore, nextOffset.

## Ставка и cache

Явная кнопка «Сохранить». Валидация 0–100, максимум два десятичных знака; принимается десятичная запятая. Двойная отправка блокируется ref и pending-состоянием. При ошибке значение остаётся в поле, показываются inline error и toast.

Сохраняется Employee.workPercent через общий useUpdateScheduleEmployee, используемый также обычным Employee Edit. Не создаётся statistics mutation endpoint.

После server success обновляются detail, существующий list, загруженные search pages и employee metadata в analytics caches только текущего Schedule/Employee. Не создаётся частичный list cache из одного сотрудника. Незагруженные поисковые результаты не угадываются.

Summary, jobs, timeline и work-entry snapshots новой ставкой не пересчитываются. После PATCH немедленный refetch не запускается.

## Периоды

По умолчанию — неделя. Общие helper-функции вынесены из Overview без изменения его визуального интерфейса.

| Режим | Локальный диапазон [start, end) | Bucket |
| --- | --- | --- |
| День | Полночь → следующая полночь | day |
| Неделя | Понедельник → следующий понедельник | day |
| Месяц | Первое число → первое число следующего месяца | day |
| Год | 1 января → 1 января следующего года | month |
| Custom | «От» 00:00 → день после «До» 00:00 | day до 62 дней включительно, иначе month |

Границы сериализуются через toISOString(), без фиксированного timezone offset. Custom ограничен 366 календарными днями и фактической длительностью TimeSpan в 366 дней, в том числе при DST. Невалидный диапазон не вызывает analytics/history requests.

Назад/вперёд меняют опорную дату на день/неделю/месяц/год. Возврат к текущему периоду: «Сегодня», «Эта неделя», «Этот месяц», «Этот год». Custom задаётся двумя датами. Некорректные URL period/date дают безопасный fallback.

## Отображение

- Сумма работ и «К выплате» — две главные цифры; заказы, работы и средние значения — компактная строка под ними. При отсутствии рассчитанных работ средняя выплата показана как «—», а причина объясняется рядом с итогом.
- При uncalculatedJobsCount > 0 показано предупреждение об отсутствии исторической ставки.
- Timeline содержит две серии: работы на сумму и к выплате. Используются только точки backend, без генерации дополнительных дат или перерасчёта сумм.
- Backend группирует timeline в UTC. Метки periodStart отображаются как даты UTC-бакетов, не сдвигаются локальным часовым поясом. В UI есть соответствующая подпись.
- Day/одна точка представлены компактно. Для длинных периодов список точек прокручивается. Год запрашивает месячные, не 365 дневных точек.
- Jobs breakdown показывает все поля из задания, а также количество работ без исторической ставки.
- История показывает локальное время события, работу, заказ/автомобиль/клиента, цену, исторический процент и выплату.
- Null snapshot отображается как «Ставка не зафиксирована» / «Выплата не рассчитана», не как 0%.
- Денежные значения используют существующий formatter. Проценты истории сохраняют точность до двух десятичных знаков.
- Главные суммы: 1 → 2 колонки; вспомогательные показатели: 2 → 4. Таблицы имеют горизонтальный scroll. Используются текущие theme tokens и существующий синий акцент, без новой chart dependency.
- Отдельные skeleton для employee settings, KPI, timeline, jobs, history; ошибки с повтором; нормальные empty states.

## Query keys / network-аудит по коду

Analytics:
`['schedule-statistics', scheduleId, 'employee', employeeId, 'analytics', startISO, endISO, bucket]`.

История:
`['schedule-statistics', scheduleId, 'employee', employeeId, 'work-entries', startISO, endISO, 50]`.

Employee detail:
`['schedule-employees', scheduleId, 'detail', employeeId]`.

Stale time 60 секунд; нет placeholder предыдущего сотрудника/диапазона. Передаётся AbortSignal для отмены устаревшего запроса. Analytics/history не refetch-ятся от window focus.

Ожидаемое поведение, подтверждённое структурой вызовов, не live Network capture:

- Первый uncached вход: один Employee GET, один analytics GET, один work-entries GET. Нет запросов по каждой строке.
- Смена периода: один analytics GET и отдельный work-entries GET, если соответствующий cache не свежий. Employee GET не зависит от периода.
- «Показать ещё»: только следующая страница по nextOffset.
- Сохранение процента: один Employee PATCH, без последующего немедленного GET.

## Ограничение дедупликации истории

DTO не содержит EventJob.Id; eventId + jobId не уникальны: одинаковая работа может повторяться внутри события. Поэтому реализованы dedupe страниц по offset, запрет параллельного load-more и проверка, что nextOffset продвигается вперёд. Законные одинаковые строки не удаляются.

При изменении истории на сервере между offset-страницами абсолютная дедупликация отдельных строк невозможна без стабильного ID/cursor. Backend не менялся, поля не выдумывались.

## Изменённые frontend-файлы в этой задаче

- app/dashboard/employees/[employeeId]/analytics/page.tsx
- components/analytics/employee-analytics-page-content.tsx
- components/analytics/employee-analytics-period.tsx
- components/analytics/employee-work-percent-form.tsx
- components/analytics/weekly-analytics-details.tsx
- components/analytics/weekly-analytics-overview.tsx
- components/employees/employees-page-content.tsx
- hooks/use-employee-analytics-period.ts
- hooks/use-employee-statistics.ts
- hooks/use-schedule-employees.ts
- lib/employee-cache.ts
- lib/employee-queries.ts
- lib/employee-statistics-queries.ts
- lib/employee-statistics-types.ts
- lib/employee-types.ts
- lib/format-event.ts
- lib/services/employee-statistics.ts
- lib/services/employees.ts
- lib/statistics-period.ts
- docs/employee-analytics-audit.md

Предыдущие незакоммиченные изменения пользователя сохранены.

## Проверки и ограничения проверки

- npm run build — успешно.
- npm run lint — успешно.
- git diff --check — успешно (есть только Git warnings о LF/CRLF).
- Автоматические тестовые suites не запускались согласно предыдущему указанию пользователя.
- Browser skill: приложение открыто, но произошло перенаправление на login. Другого подключённого авторизованного браузера нет. Авторизация не обходилась.
- Ручные проверки реальных данных: ставка 40/37.5, PATCH 40 → 50, старые/новые ставки, legacy entries, >50 entries, F5/Back, все периоды и responsive UI остаются непроверенными в авторизованном браузере. Это не заявляется как пройденный manual/network test.

## Подтверждения границ задачи

Оба входа ведут на один экран. Event Create/Edit/Details и Event totals не изменялись в этой задаче; процент и payout туда не добавлены. Процент сохраняется у Employee. Историческая аналитика не пересчитывается текущей ставкой. Фактическая выплата денег, payroll history, бонусы, company profit не реализованы. Backend не менялся.
