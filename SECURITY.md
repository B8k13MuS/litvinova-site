# 🔒 Рекомендации по защите сайта от DDoS и атак

## Внедрено в код (уже в index.html)

### HTTP Security Headers
| Заголовок | Значение | Защита от |
|-----------|----------|-----------|
| Content-Security-Policy | Strict rules + block-all-mixed-content | XSS, code injection, mixed content |
| X-Content-Type-Options | nosniff | MIME sniffing attacks |
| X-Frame-Options | DENY | Clickjacking |
| Referrer-Policy | strict-origin-when-cross-origin | Data leak via referrer |
| Permissions-Policy | All features disabled | Feature abuse, fingerprinting |
| X-DNS-Prefetch-Control | off | DNS prefetch abuse |
| Strict-Transport-Security | max-age=31536000; preload | SSL stripping, MITM |
| Cache-Control | no-cache, no-store, must-revalidate | Cache poisoning |

### Защита формы
- **Rate limiting**: максимум 3 отправки в минуту
- **Honeypot поле**: скрытое поле `website` — боты заполнят, люди нет
- **Input sanitization**: блокировка `<script>`, `javascript:`, `on*` атрибутов
- **Maxlength**: имя 100 симв., контакт 200, сообщение 2000
- **Autocomplete off** на форме: защита от автозаполнения ботами

### Anti-clickjacking
- JS frame buster: если сайт в iframe — редирект на самого себя
- X-Frame-Options: DENY

---

## 🛡️ Критически важно: настройте Cloudflare (бесплатно)

GitHub Pages НЕ защищает от DDoS. Нужен посредник.

### Шаг 1: Зарегистрируйтесь на Cloudflare
1. https://dash.cloudflare.com/sign-up
2. Добавьте домен (если есть свой) или используйте поддомен Cloudflare

### Шаг 2: DNS настройки
```
Type: CNAME
Name: www (или @)
Target: b8k13mus.github.io
Proxy status: Proxied (оранжевое облако) ← ВАЖНО!
TTL: Auto
```

### Шаг 3: Включите защиту в Cloudflare
**Security → WAF → Tools:**
- Security Level: High
- Challenge Passage: 30 minutes
- Browser Integrity Check: ON

**Security → Bots:**
- Bot Fight Mode: ON
- Super Bot Fight Mode: ON (бесплатно)

**Speed → Optimization:**
- Auto Minify: JS, CSS, HTML — ON
- Brotli: ON
- Early Hints: ON

**Rules → Page Rules (создайте):**
```
URL: b8k13mus.github.io/litvinova-site/*
Settings:
  - Security Level: High
  - Cache Level: Cache Everything
  - Edge Cache TTL: 2 hours
  - Browser Cache TTL: 4 hours
```

**Network:**
- HTTP/2: ON
- HTTP/3 (QUIC): ON
- 0-RTT Connection Resumption: ON
- WebSockets: OFF (не нужен для статики)

### Шаг 4: Rate Limiting (бесплатно 10k запросов)
**Security → WAF → Rate limiting rules:**
```
Rule name: Protect form
URL path: /litvinova-site/
Action: Block
Duration: 1 hour
Requests: 30 per 10 seconds
```

---

## 🔐 Дополнительные меры

### 1. Кастомный домен (рекомендуется)
GitHub Pages на кастомном домене + Cloudflare = полная защита.
```
Ваш домен → Cloudflare → GitHub Pages
```

### 2. GitHub Pages настройки
**Settings → Pages:**
- Enforce HTTPS: ✅ ON (уже должно быть)

### 3. Мониторинг
- Google Search Console: https://search.google.com/search-console
- Cloudflare Analytics: бесплатно с проксированием
- UptimeRobot: бесплатный мониторинг доступности

### 4. Резервное копирование
```bash
# Делайте бэкап перед изменениями
git tag backup-$(date +%Y%m%d)
git push origin --tags
```

---

## ⚠️ Ограничения GitHub Pages

| Угроза | Защита GitHub | Нужно Cloudflare? |
|--------|---------------|-------------------|
| DDoS (L3/L4) | ❌ Нет | ✅ Да |
| DDoS (L7/app) | ⚠️ Частично | ✅ Да |
| XSS | ✅ CSP (наш) | ❌ Нет |
| Clickjacking | ✅ X-Frame (наш) | ❌ Нет |
| Bot scraping | ❌ Нет | ✅ Да |
| SQL injection | N/A (статика) | ❌ Нет |
| Brute force формы | ❌ Нет | ✅ Rate limit |

---

## 📋 Чек-лист безопасности

- [ ] Cloudflare proxy включён (оранжевое облако)
- [ ] HTTPS enforced
- [ ] Security Level: High
- [ ] Bot Fight Mode: ON
- [ ] Rate limiting настроено
- [ ] HSTS preload submitted (https://hstspreload.org)
- [ ] Регулярные бэкапы
- [ ] Мониторинг uptime

---

**Без Cloudflare ваш сайт уязвим к DDoS.**
С Cloudflare + наши заголовки — защита на уровне enterprise.
