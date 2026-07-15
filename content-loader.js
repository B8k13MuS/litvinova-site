// content-loader.js — подстановка контента из YAML в HTML-страницы
// Автоматически загружает данные из content/pages/{page}.yml

(function() {
  'use strict';

  // Определяем текущую страницу по имени файла
  const pageName = window.location.pathname.split('/').pop().replace('.html', '') || 'index';

  // Загружаем YAML-контент
  async function loadContent() {
    try {
      const response = await fetch(`content/pages/${pageName}.yml`);
      if (!response.ok) {
        console.log('Content file not found for page:', pageName);
        return;
      }

      const yamlText = await response.text();
      const data = parseYAML(yamlText);

      // Применяем данные к странице
      applyContent(data);

    } catch (error) {
      console.error('Error loading content:', error);
    }
  }

  // Простой парсер YAML
  function parseYAML(text) {
    const data = {};
    const lines = text.split('\n');
    let currentKey = null;
    let currentList = null;
    let currentObject = null;
    let indent = 0;

    for (let line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      // Простые ключ-значение
      const simpleMatch = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*(.*)$/);
      if (simpleMatch && !line.startsWith('  ') && !line.startsWith('\t')) {
        currentKey = simpleMatch[1];
        const value = simpleMatch[2].trim();

        if (value === '') {
          // Может быть список или объект ниже
          data[currentKey] = [];
          currentList = data[currentKey];
          currentObject = null;
        } else {
          // Убираем кавычки
          data[currentKey] = value.replace(/^["']|["']$/g, '');
          currentList = null;
          currentObject = null;
        }
        continue;
      }

      // Элементы списка
      const listMatch = line.match(/^\s*-\s+(.*)$/);
      if (listMatch && currentList !== null) {
        const value = listMatch[1].trim();

        // Проверяем, является ли элемент объектом
        const objMatch = value.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*(.*)$/);
        if (objMatch) {
          if (!currentObject) {
            currentObject = {};
            currentList.push(currentObject);
          }
          currentObject[objMatch[1]] = objMatch[2].replace(/^["']|["']$/g, '');
        } else {
          currentList.push(value.replace(/^["']|["']$/g, ''));
          currentObject = null;
        }
        continue;
      }

      // Поля объекта (с отступом)
      const fieldMatch = line.match(/^\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*(.*)$/);
      if (fieldMatch && currentObject !== null) {
        currentObject[fieldMatch[1]] = fieldMatch[2].replace(/^["']|["']$/g, '');
      }
    }

    return data;
  }

  // Применяем данные к элементам страницы
  function applyContent(data) {
    // SEO
    if (data.title) document.title = data.title;
    if (data.description) {
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.content = data.description;
    }
    if (data.keywords) {
      const metaKeywords = document.querySelector('meta[name="keywords"]');
      if (metaKeywords) metaKeywords.content = data.keywords;
    }

    // Заголовки
    updateText('[data-content="header_tag"]', data.header_tag);
    updateText('[data-content="header_title"]', data.header_title);
    updateText('[data-content="header_subtitle"]', data.header_subtitle);

    // Тексты
    updateText('[data-content="lead_text"]', data.lead_text);
    updateText('[data-content="bio_paragraph_1"]', data.bio_paragraph_1);
    updateText('[data-content="bio_paragraph_2"]', data.bio_paragraph_2);
    updateText('[data-content="intro_text"]', data.intro_text);
    updateText('[data-content="approach_text"]', data.approach_text);

    // Образование
    updateText('[data-content="education_title"]', data.education_title);
    updateList('[data-content="education_items"]', data.education_items);

    // Услуги
    updateText('[data-content="how_it_works_title"]', data.how_it_works_title);
    updateList('[data-content="how_it_works_steps"]', data.how_it_works_steps);

    // CTA
    updateText('[data-content="cta_title"]', data.cta_title);
    updateText('[data-content="cta_text"]', data.cta_text);
    updateText('[data-content="cta_button"]', data.cta_button);
    updateLink('[data-content="cta_link"]', data.cta_link);

    // Контакты
    updateText('[data-content="contact_info_title"]', data.contact_info_title);
    updateText('[data-content="phone"]', data.phone);
    updateText('[data-content="email"]', data.email);
    updateText('[data-content="location"]', data.location);

    // Форма
    updateText('[data-content="form_title"]', data.form_title);
    updateText('[data-content="form_description"]', data.form_description);
    updateText('[data-content="form_submit_button"]', data.form_submit_button);
    updateText('[data-content="form_privacy_text"]', data.form_privacy_text);
    updateText('[data-content="response_time"]', data.response_time);

    // Главная страница
    updateText('[data-content="hero_title"]', data.hero_title);
    updateText('[data-content="hero_subtitle"]', data.hero_subtitle);
    updateText('[data-content="hero_description"]', data.hero_description);
    updateText('[data-content="hero_cta"]', data.hero_cta);
    updateLink('[data-content="hero_cta_link"]', data.hero_cta_link);

    updateText('[data-content="specialization_title"]', data.specialization_title);
    updateText('[data-content="about_preview_title"]', data.about_preview_title);
    updateText('[data-content="about_preview_text"]', data.about_preview_text);
    updateText('[data-content="about_preview_cta"]', data.about_preview_cta);
    updateText('[data-content="services_preview_title"]', data.services_preview_title);
    updateText('[data-content="services_preview_cta"]', data.services_preview_cta);

    updateText('[data-content="contact_phone"]', data.contact_phone);
    updateText('[data-content="contact_email"]', data.contact_email);
    updateText('[data-content="contact_cta"]', data.contact_cta);

    updateText('[data-content="call_to_action"]', data.call_to_action);
    updateLink('[data-content="call_to_action_link"]', data.call_to_action_link);

    // Услуги (список объектов)
    if (data.services && Array.isArray(data.services)) {
      updateServices(data.services);
    }
  }

  function updateText(selector, value) {
    if (!value) return;
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      el.innerHTML = value;
    });
  }

  function updateLink(selector, value) {
    if (!value) return;
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      if (el.tagName === 'A') {
        el.href = value;
      }
    });
  }

  function updateList(selector, items) {
    if (!items || !Array.isArray(items)) return;
    const container = document.querySelector(selector);
    if (!container) return;

    const list = container.tagName === 'UL' || container.tagName === 'OL' ? container : container.querySelector('ul, ol');
    if (list) {
      list.innerHTML = items.map(item => `<li>${item}</li>`).join('');
    }
  }

  function updateServices(services) {
    const container = document.querySelector('[data-content="services_list"]');
    if (!container) return;

    container.innerHTML = services.map(service => `
      <div class="service-card">
        <h3>${service.title || ''}</h3>
        <p>${service.description || ''}</p>
        ${service.duration ? `<span class="service-duration">${service.duration}</span>` : ''}
        ${service.price ? `<span class="service-price">${service.price}</span>` : ''}
      </div>
    `).join('');
  }

  // Запускаем загрузку контента
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadContent);
  } else {
    loadContent();
  }
})();
