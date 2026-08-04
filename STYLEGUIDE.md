## 1. Технологический стек

- **Framework:** Next.js (App Router) + React, `"use client"` компоненты
- **Язык:** TypeScript
- **Стили:** Tailwind CSS **v3** (`tailwind.config.ts`, `darkMode: 'class'`)
- **UI-библиотека:** shadcn/ui (Card, Tabs, Badge, Avatar, Select, Skeleton, Dialog, Separator, Progress и т.д.)
- **Иконки:** `lucide-react` (размеры 16/20/24px, чаще `h-4 w-4` и `h-5 w-5`)
- **Уведомления:** `react-hot-toast`
- **Куки:** `js-cookie` (например `scheduleId`)
- **PDF:** `pdfmake` (заказ-наряды)
- **Язык интерфейса:** русский (`<html lang="ru">`), даты в формате `ru-RU`


---

## 2. Типографика

- **Шрифт:** `Inter` (Google Fonts, `subsets: ["latin"]`) — единственное семейство, применяется глобально через `inter.className` на `<body>`
- **Размеры заголовков:**

- Заголовок страницы: `text-2xl sm:text-3xl font-bold`
- Заголовки секций/карточек: `text-lg` / `text-base font-medium`
- Основной текст: базовый размер, `text-sm` для вторичного
- Подписи/мета: `text-sm text-muted-foreground`



- **Утилита:** `.text-balance` (`text-wrap: balance`) для аккуратных переносов заголовков


---

## 3. Цветовая система (черно-белая / монохром)

Проект намеренно построен на **нейтральной черно-белой палитре** через HSL CSS-переменные. Все оттенки — это `0 0%` (то есть чистая серая шкала без насыщенности).

### Светлая тема (`:root`)

| Токен | Значение (HSL) | Что это
|-----|-----|-----
| `--background` | `0 0% 100%` | белый фон
| `--foreground` | `0 0% 3.9%` | почти черный текст
| `--primary` | `0 0% 9%` | тёмно-серый (кнопки)
| `--primary-foreground` | `0 0% 98%` | белый текст на primary
| `--secondary` / `--muted` / `--accent` | `0 0% 96.1%` | светло-серый фон
| `--muted-foreground` | `0 0% 45.1%` | серый вторичный текст
| `--border` / `--input` | `0 0% 89.8%` | границы
| `--ring` | `0 0% 3.9%` | фокус-обводка
| `--destructive` | `0 84.2% 60.2%` | **красный** (единственный цветной акцент — для ошибок/удаления)


### Тёмная тема (`.dark`)

- `--background: 0 0% 3.9%` (почти чёрный), `--foreground: 0 0% 98%` (белый)
- primary инвертируется в белый (`0 0% 98%`), фоны карточек `0 0% 3.9%`, вторичные поверхности `0 0% 14.9%`
- Текущий превью работает именно в **dark mode**


### Радиус

- `--radius: 0.5rem` → `rounded-lg` (0.5rem), `rounded-md` (calc −2px), `rounded-sm` (calc −4px)


### Правило по цвету

Мы придерживаемся строго **монохромного стиля**: фон/текст/границы только через семантические токены (`bg-background`, `text-foreground`, `bg-muted`, `text-muted-foreground`, `border-border`). Цвет добавляется точечно — красный (`destructive`) для ошибок, и статусные бейджи. В аналитике сотрудников мы специально убирали цветные градиенты ради единого ч/б вида.

---

## 4. Служебные токены

- **Sidebar:** отдельный набор (`--sidebar-background`, `--sidebar-foreground`, `--sidebar-primary` и т.д.) — для боковой навигации профиля
- **Charts:** `--chart-1..5` заданы, но в большинстве страниц графики мы рисовали **вручную через SVG** (круговые диаграммы, progress-bars), без recharts — по твоему требованию


---

## 5. Раскладка (Layout)

- **Подход:** mobile-first, основной инструмент — **flexbox**, для метрик — CSS Grid
- **Типовые сетки карточек:**

- Метрики: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2/gap-4`
- Календари профиля: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`



- **Отступы:** шкала Tailwind (`p-4 sm:p-6`, `gap-2/4/6`, `mb-6`), без произвольных `[16px]`
- **Оболочка страниц:** `min-h-screen bg-background flex flex-col` + `ProfileSidebar` / `ProfileFooter`
- **Диалоги:** двухколоночная компоновка с фиксированными панелями (форма события), вкладки внутри, фиксированные header/footer
- **Загрузка:** `MountedLoading` (глобальный оверлей до монтирования) + `loading.tsx` со `Skeleton` на страницах


---

## 6. Страницы проекта

**Публичные / auth:**

- `app/page.tsx` — главная
- `app/login/page.tsx`, `app/signup/page.tsx` — вход/регистрация
- `app/profile/page.tsx`, `app/profile/info/page.tsx` — профиль пользователя


**Расписания:**

- `app/schedule/[scheduleId]/page.tsx` — конкретный календарь


**Dashboard (админ/аналитика):**

- `app/dashboard/employees/page.tsx` — список сотрудников
- `app/dashboard/analytics/employee/page.tsx` — аналитика по сотруднику
- `app/dashboard/employees/[employeeId]/analytics/page.tsx`
- `app/dashboard/clients/[clientId]/analytics/page.tsx`
- `app/dashboard/cars/[carId]/analytics/page.tsx`
- `app/dashboard/jobs/[jobId]/analytics/page.tsx`
- `app/dashboard/parts/[partId]/analytics/page.tsx`
- `app/dashboard/server-status/page.tsx` — мониторинг сервера


**Demo:**

- `app/find-user-demo/page.tsx`, `app/improved-tabs-demo/page.tsx`


**Ключевые компоненты:** `work-order` (PDF заказ-наряд), `find-event`, `bell-dialog` + страницы уведомлений, `users-admin-page`, `notifications-admin-page`, `event-form-dialog`.

---

## 7. Повторяющиеся паттерны дизайна

- **Карточки метрик** с цветной полоской-акцентом справа и крупным числом
- **Tabs** «Обзор / Подробно» для разделения простой и детальной аналитики
- **Аватары с инициалами** для клиентов и сотрудников
- **Статусные бейджи** (оплачено/не оплачено, роли, приоритеты)
- **Progress-bars** для долей в выручке
- **Скелетоны** во всех состояниях загрузки
- **Метаданные** (`layout.tsx`): title «AutoSchedule — Система управления автосервисом»
