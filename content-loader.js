/**
 * Production-ready Content Loader для Pages CMS
 * Особенности: Кеширование, XSS-защита (DOMPurify), Graceful Degradation
 */

document.addEventListener('DOMContentLoaded', async () => {
    const path = window.location.pathname;
    const pageName = path.split('/').pop().replace('.html', '') || 'index';
    const yamlUrl = `content/pages/${pageName}.yml`;
    
    const CACHE_KEY = `cms_cache_${pageName}`;
    const CACHE_TIME_KEY = `${CACHE_KEY}_time`;
    const CACHE_DURATION = 5 * 60 * 1000; // 5 минут

    try {
        let data;
        const cachedData = localStorage.getItem(CACHE_KEY);
        const cachedTime = localStorage.getItem(CACHE_TIME_KEY);
        
        // 1. Проверка кеша для мгновенной загрузки
        if (cachedData && cachedTime && (Date.now() - parseInt(cachedTime)) < CACHE_DURATION) {
            data = jsyaml.load(cachedData);
        } else {
            // 2. Загрузка с сервера
            const response = await fetch(yamlUrl);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const yamlText = await response.text();
            data = jsyaml.load(yamlText);
            
            if (!data) throw new Error('YAML пуст или невалиден');
            
            // 3. Сохранение в кеш
            localStorage.setItem(CACHE_KEY, yamlText);
            localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
        }

        // 4. Рендеринг данных
        renderContent(data);

    } catch (error) {
        console.warn('CMS Content Loader: используем fallback (оригинальный HTML). Ошибка:', error.message);
        // Graceful degradation: ничего не делаем, пользователь видит оригинальный HTML
    }
});

function renderContent(data) {
    if (!data || typeof data !== 'object') return;

    // Хелпер для получения вложенных значений (напр., "seo.title")
    const getValue = (obj, path) => path.split('.').reduce((acc, part) => acc && acc[part], obj);

    // 1. Обновление простых текстовых полей
    document.querySelectorAll('[data-content]').forEach(el => {
        // Пропускаем поля, которые управляют ссылками (они обрабатываются отдельно)
        if (el.hasAttribute('data-content-link')) return;
        
        const key = el.getAttribute('data-content');
        const value = getValue(data, key);
        
        // Обновляем ТОЛЬКО если значение есть и оно не пустое
        if (value !== undefined && value !== null && String(value).trim() !== '') {
            // ✅ XSS ЗАЩИТА: Санитизация перед вставкой в DOM
            if (typeof DOMPurify !== 'undefined') {
                el.innerHTML = DOMPurify.sanitize(value);
            } else {
                el.innerHTML = value; // Fallback, если библиотека не загрузилась
            }
        }
    });

    // 2. Обновление списков (карточек) с сохранением оригинальной верстки
    const listRenderers = {
        'issues_list': renderIssues,
        'methods_list': renderMethods,
        'process_list': renderProcess,
        'trust_list': renderTrust,
        'testimonials_list': renderTestimonials,
        'pricing_list': renderPricing
    };

    Object.entries(listRenderers).forEach(([key, renderer]) => {
        const container = document.querySelector(`[data-content="${key}"]`);
        if (container && Array.isArray(data[key]) && data[key].length > 0) {
            container.innerHTML = renderer(data[key]);
            
            // Переинициализация анимаций для новых элементов
            if (typeof IntersectionObserver !== 'undefined') {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('visible');
                            observer.unobserve(entry.target);
                        }
                    });
                }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
                
                container.querySelectorAll('.reveal').forEach(el => observer.observe(el));
            }
        }
    });
}

// --- Рендереры (точно копируют оригинальную HTML-структуру и SVG) ---

function renderIssues(items) {
    const icons = [
        '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M12 8v4M12 16h.01"/>',
        '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
        '<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>',
        '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
        '<circle cx="12" cy="12" r="10"/><path d="M8 15s1.5-2 4-2 4 2 4 2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>',
        '<path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/><path d="M12 6v6l4 2"/>'
    ];
    return items.map((item, i) => `
        <div class="issue-card reveal reveal-delay-${(i % 3) + 1}">
            <div class="issue-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${icons[i % icons.length]}</svg></div>
            <h3>${sanitize(item.title)}</h3>
            <p>${sanitize(item.description)}</p>
        </div>
    `).join('');
}

function renderMethods(items) {
    return items.map((item, i) => `
        <div class="method-card reveal reveal-delay-${(i % 3) + 1}">
            <div class="method-number">${String(i + 1).padStart(2, '0')}</div>
            <h3>${sanitize(item.title)}</h3>
            <p>${sanitize(item.description)}</p>
        </div>
    `).join('');
}

function renderProcess(items) {
    return items.map((item, i) => `
        <div class="process-step reveal reveal-delay-${(i % 4) + 1}">
            <div class="step-number">${String(i + 1).padStart(2, '0')}</div>
            <h3>${sanitize(item.title)}</h3>
            <p>${sanitize(item.description)}</p>
        </div>
    `).join('');
}

function renderTrust(items) {
    const icons = [
        '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>',
        '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>',
        '<path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/><line x1="16" y1="8" x2="2" y2="22"/><line x1="17.5" y1="15" x2="9" y2="15"/>',
        '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>'
    ];
    return items.map((item, i) => `
        <div class="trust-card reveal reveal-delay-${(i % 2) + 1}">
            <div class="trust-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${icons[i % icons.length]}</svg></div>
            <div><h3>${sanitize(item.title)}</h3><p>${sanitize(item.description)}</p></div>
        </div>
    `).join('');
}

function renderTestimonials(items) {
    return items.map((item, i) => {
        const initial = (item.author || 'К').charAt(0).toUpperCase();
        return `
            <article class="testimonial-card reveal reveal-delay-${(i % 3) + 1}" itemscope itemtype="https://schema.org/Review">
                <blockquote itemprop="reviewBody">${sanitize(item.text)}</blockquote>
                <div class="testimonial-meta">
                    <div class="t-avatar">${initial}</div>
                    <div class="t-info">
                        <strong itemprop="author">${sanitize(item.author)}</strong>
                        <span>${sanitize(item.details)}</span>
                    </div>
                </div>
            </article>
        `;
    }).join('');
}

function renderPricing(items) {
    return items.map((item, i) => {
        const featured = item.featured ? ' featured' : '';
        const badge = item.badge ? `<div class="pricing-badge">${sanitize(item.badge)}</div>` : '';
        return `
            <div class="pricing-card${featured} reveal reveal-delay-${(i % 3) + 1}">
                ${badge}
                <div class="pricing-label">${sanitize(item.label)}</div>
                <div class="pricing-value">${sanitize(item.value)}</div>
                <p class="pricing-desc">${sanitize(item.description)}</p>
                <a href="#contact" class="btn"><span>Записаться</span></a>
            </div>
        `;
    }).join('');
}

// Локальная функция санитизации для шаблонов
function sanitize(str) {
    if (!str) return '';
    return typeof DOMPurify !== 'undefined' ? DOMPurify.sanitize(str) : str;
}
