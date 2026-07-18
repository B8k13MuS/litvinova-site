// content-loader.js — надежная подстановка контента из YAML в HTML
(function() {
  'use strict';

  // Определяем имя текущей страницы (index, about, services, contact)
  const pageName = window.location.pathname.split('/').pop().replace('.html', '') || 'index';

  async function loadContent() {
    try {
      // Умное определение базового пути для GitHub Pages (решает проблему 404)
      const basePath = window.location.pathname.includes("/litvinova-site/") ? "/litvinova-site/" : "/";
      const response = await fetch(`${basePath}content/pages/${pageName}.yml`);
      
      if (!response.ok) {
        console.warn('Content file not found for page:', pageName);
        return;
      }

      const yamlText = await response.text();
      
      // Используем надежную библиотеку js-yaml вместо самописного парсера
      const data = jsyaml.load(yamlText);
      
      if (!data) return;
      applyContent(data);

    } catch (error) {
      console.error('Error loading content:', error);
    }
  }

  function updateText(selector, value) {
    if (value === undefined || value === null) return;
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      el.innerHTML = value; // innerHTML позволяет вставлять HTML-теги из YAML
    });
  }

  function updateAttr(selector, attr, value) {
    if (!value) return;
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      el.setAttribute(attr, value);
    });
  }

  function updateLink(selector, value) {
    if (!value) return;
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      if (el.tagName === 'A') el.href = value;
      else el.setAttribute('href', value);
    });
  }

  function updateCards(selector, items, templateFn) {
    if (!items || !Array.isArray(items)) return;
    const container = document.querySelector(selector);
    if (!container) return;
    container.innerHTML = items.map(templateFn).join('');
  }

  function applyContent(data) {
    if (!data) return;

    // SEO
    if (data.title) document.title = data.title;
    updateAttr('meta[name="description"]', 'content', data.description);
    updateAttr('meta[name="keywords"]', 'content', data.keywords);

    // Header / Hero
    updateText('[data-content="header_tag"]', data.header_tag);
    updateText('[data-content="header_title"]', data.header_title);
    updateText('[data-content="header_subtitle"]', data.header_subtitle);

    updateText('[data-content="hero_title"]', data.hero_title);
    updateText('[data-content="hero_subtitle"]', data.hero_subtitle);
    updateText('[data-content="hero_description"]', data.hero_description);
    updateText('[data-content="hero_cta"]', data.hero_cta);
    updateLink('[data-content="hero_cta_link"]', data.hero_cta_link);

    // Issues / Services on homepage
    updateText('[data-content="issues_title"]', data.issues_title);
    if (data.issues) {
      updateCards('[data-content="issues_list"]', data.issues, item => `
        <div class="issue-card">
          ${item.icon ? `<div class="service-icon">${item.icon}</div>` : ''}
          <h3>${item.title || ''}</h3>
          <p>${item.description || ''}</p>
        </div>
      `);
    }

    // About preview
    updateText('[data-content="about_preview_text"]', data.about_preview_text);
    updateText('[data-content="about_preview_subtitle"]', data.about_preview_subtitle);
    updateText('[data-content="about_preview_details"]', data.about_preview_details);
    updateText('[data-content="about_preview_cta"]', data.about_preview_cta);
    updateLink('[data-content="about_preview_link"]', data.about_preview_link);

    // Methods
    updateText('[data-content="methods_title"]', data.methods_title);
    if (data.methods) {
      updateCards('[data-content="methods_list"]', data.methods, item => `
        <div class="method-card">
          ${item.icon ? `<div class="service-icon">${item.icon}</div>` : ''}
          <h3>${item.title || ''}</h3>
          <p>${item.description || ''}</p>
        </div>
      `);
    }

    // Process
    updateText('[data-content="process_title"]', data.process_title);
    if (data.process_steps) {
      updateCards('[data-content="process_list"]', data.process_steps, item => `
        <div class="process-step">
          ${item.icon ? `<div class="service-icon">${item.icon}</div>` : ''}
          <h3>${item.step || item.title || ''}</h3>
          <p>${item.description || ''}</p>
        </div>
      `);
    }

    // Trust / Safety
    updateText('[data-content="trust_title"]', data.trust_title);
    if (data.trust_items) {
      updateCards('[data-content="trust_list"]', data.trust_items, item => `
        <div class="trust-item">
          ${item.icon ? `<div class="service-icon">${item.icon}</div>` : ''}
          <h3>${item.title || item.name || ''}</h3>
          <p>${item.description || ''}</p>
        </div>
      `);
    }

    // Testimonials
    updateText('[data-content="testimonials_title"]', data.testimonials_title);
    if (data.testimonials) {
      updateCards('[data-content="testimonials_list"]', data.testimonials, item => `
        <blockquote>
          <p>${item.text || ''}</p>
          ${item.author ? `<cite>${item.author}</cite>` : ''}
        </blockquote>
      `);
    }

    // Pricing
    updateText('[data-content="pricing_title"]', data.pricing_title);
    updateText('[data-content="pricing_subtitle"]', data.pricing_subtitle);
    updateText('[data-content="pricing_note"]', data.pricing_note);
    if (data.pricing_items) {
      updateCards('[data-content="pricing_list"]', data.pricing_items, item => `
        <div class="pricing-card${item.popular || item.featured ? ' featured' : ''}">
          ${item.badge ? `<div class="pricing-badge">${item.badge}</div>` : ''}
          <div class="pricing-label">${item.label || item.name || ''}</div>
          <div class="pricing-value">${item.duration || ''}</div>
          <p class="pricing-desc">${item.description || ''}</p>
          ${item.price ? `<p class="price">${item.price}</p>` : ''}
          <a href="${item.cta_link || item.cta_link || '#'}" class="btn"><span>${item.cta || 'Записаться'}</span></a>
        </div>
      `);
    }

    // CTA
    updateText('[data-content="cta_title"]', data.cta_title);
    updateText('[data-content="cta_subtitle"]', data.cta_subtitle);
    updateText('[data-content="cta_button"]', data.cta_button);
    updateLink('[data-content="cta_button_link"]', data.cta_button_link);

    // About Page specific
    updateText('[data-content="lead_text"]', data.lead_text);
    updateText('[data-content="bio_paragraph_1"]', data.bio_paragraph_1);
    updateText('[data-content="bio_paragraph_2"]', data.bio_paragraph_2);
    updateText('[data-content="education_title"]', data.education_title);
    updateText('[data-content="approach_title"]', data.approach_title);
    updateText('[data-content="approach_text"]', data.approach_text);
    updateText('[data-content="call_to_action"]', data.call_to_action);
    updateLink('[data-content="call_to_action_link"]', data.call_to_action_link);
    
    if (data.education_items && Array.isArray(data.education_items)) {
      const container = document.querySelector('[data-content="education_items"]');
      if (container) {
        const list = container.tagName === 'UL' || container.tagName === 'OL' ? container : container.querySelector('ul, ol');
        if (list) list.innerHTML = data.education_items.map(item => `<li>${item}</li>`).join('');
      }
    }

    // Services Page specific
    updateText('[data-content="intro_text"]', data.intro_text);
    if (data.services) {
      updateCards('[data-content="services_list"]', data.services, item => `
        <div class="service-card">
          <h3>${item.title || item.name || ''}</h3>
          <p>${item.description || ''}</p>
          ${item.duration ? `<span class="service-duration">⏱ ${item.duration}</span>` : ''}
          ${item.price ? `<span class="service-price">${item.price}</span>` : ''}
        </div>
      `);
    }
    updateText('[data-content="how_it_works_title"]', data.how_it_works_title);
    if (data.how_it_works_steps && Array.isArray(data.how_it_works_steps)) {
      const container = document.querySelector('[data-content="how_it_works_steps"]');
      if (container) {
        const list = container.tagName === 'UL' || container.tagName === 'OL' ? container : container.querySelector('ul, ol');
        if (list) list.innerHTML = data.how_it_works_steps.map(item => `<li>${item}</li>`).join('');
      }
    }

    // Contact Page specific
    updateText('[data-content="contact_info_title"]', data.contact_info_title);
    updateText('[data-content="phone"]', data.phone);
    updateText('[data-content="email"]', data.email);
    updateText('[data-content="location"]', data.location);
    
    updateText('[data-content="telegram_label"]', data.telegram_label);
    updateLink('[data-content="telegram_link"]', data.telegram_link);
    updateText('[data-content="channel_label"]', data.channel_label);
    updateLink('[data-content="channel_link"]', data.channel_link);
    updateText('[data-content="whatsapp_label"]', data.whatsapp_label);
    updateLink('[data-content="whatsapp_link"]', data.whatsapp_link);
    updateText('[data-content="email_label"]', data.email_label);
    updateLink('[data-content="email_link"]', data.email_link);

    updateText('[data-content="form_description"]', data.form_description);
    updateText('[data-content="form_submit_button"]', data.form_submit_button);
    updateText('[data-content="form_privacy_text"]', data.form_privacy_text);
    updateText('[data-content="response_time"]', data.response_time);
    updateText('[data-content="footer_text"]', data.footer_text);
    
    // Images
    updateAttr('[data-content="contact_image"]', 'src', data.contact_image);
    updateAttr('[data-content="hero_image"]', 'src', data.hero_image);
    updateAttr('[data-content="about_image"]', 'src', data.about_image);
    updateAttr('[data-content="services_image"]', 'src', data.services_image);
  }

  // Запуск после загрузки DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadContent);
  } else {
    loadContent();
  }
  
  // Слушатель для мгновенного обновления при сохранении в Pages CMS (если поддерживается)
  window.addEventListener('pagescms:update', loadContent);
})();
