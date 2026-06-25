# SEO-оптимизация сайта Надежды Литвиновой — v2

## Что сделано

### Критические исправления (из аудита другой нейросети)
- `<title>` оптимизирован, без "Bundled Page"
- `<meta name="description">` — 209 символов с ключевыми словами
- `<html lang="ru">` — добавлен
- Canonical + hreflang — настроены
- Весь контент в HTML — без JS-бандлера (критично для Яндекса)

### Schema.org — 8 типов
- Person (с knowsAbout: Brainspotting, EMDR, ММИЛ)
- ProfessionalService + OfferCatalog (3 услуги с ценами)
- FAQPage (8 вопросов-ответов) → featured snippets
- 3× Review с рейтингом 5.0 + AggregateRating
- WebSite, WebPage, BreadcrumbList

### Open Graph + Twitter Card
- Полный набор для соцсетей
- OG-image 1200×630

### Техническая оптимизация
- Preconnect/preload шрифтов (LCP)
- prefers-reduced-motion (accessibility)
- Семантический HTML5 + ARIA
- Alt-тексты для всех изображений
- Иерархия: 1×H1 → 8×H2 → 19×H3
- Lazy loading для изображений

### Уникальное УТП (по пожеланиям психолога)
- **Brainspotting** — ключевой метод, редкая компетенция в РФ
- **EMDR (ДПДГ)** — добавлено
- **ММИЛ** — психодиагностика, с которой начинается работа
- **Убрано "коуч"** из позиционирования
- Реальный Telegram: @nadezhda_litvinova_coach
- Канал: @uspeh_prosto

### Структура сайта (10 файлов)
| Файл | Назначение |
|------|-----------|
| `index.html` | Главная (лендинг) |
| `services.html` | Услуги — Brainspotting, EMDR, ММИЛ |
| `blog.html` | Блог — список статей |
| `blog/trevoga-kak-spravitsya.html` | Статья «Как справиться с тревогой» |
| `blog/brainspotting-chto-eto.html` | Статья «Brainspotting: что это» |
| `contact.html` | Контакты |
| `privacy.html` | Политика конфиденциальности |
| `robots.txt` | Разрешение индексации + Host для Яндекса |
| `sitemap.xml` | Карта сайта с приоритетами |
| `README.md` | Этот файл |

## Как залить на GitHub Pages

```bash
cd /path/to/litvinova-site

# Удалить старый JS-бандлер
rm -f e1f6df60-*

# Распаковать архив в эту папку
git add .
git commit -m "SEO: полная оптимизация + Brainspotting + FAQ + JSON-LD"
git push
```

Через 1-2 минуты GitHub Pages задеплоит.

## Дальнейшие шаги
1. Заменить `+7-XXX-XXX-XX-XX` на реальный телефон
2. Заменить `contact@litvinova-site.com` на реальный email
3. Добавить реальные фото в папку `images/`
4. Добавить сайт в Google Search Console
5. Добавить сайт в Яндекс.Вебмастер
6. Зарегистрировать в Яндекс.Справочнике
7. Написать ещё 3-5 статей для блога
