// content-loader.js — подстановка контента из YAML в HTML-страницы

(function() {
  'use strict';

  const pageName = window.location.pathname.split('/').pop().replace('.html', '') || 'index';

  async function loadContent() {
    try {
      const basePath = window.location.pathname.includes("/litvinova-site/") ? "/litvinova-site/" : "/";
      const response = await fetch(`${basePath}content/pages/${pageName}.yml`);
      if (!response.ok) {
        console.log('Content file not found for page:', pageName);
        return;
      }

      const yamlText = await response.text();
      const data = parseYAML(yamlText);
      applyContent(data);

    } catch (error) {
      console.error('Error loading content:', error);
    }
  }

  function parseYAML(text) {
    const data = {};
    const lines = text.split('\n');
    let currentKey = null;
    let currentList = null;
    let currentObject = null;

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const lineIndent = line.search(/\S/);
      if (lineIndent === -1) continue;

      const simpleMatch = trimmed.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*(.*)$/);
      if (simpleMatch && lineIndent === 0) {
        currentKey = simpleMatch[1];
        const value = simpleMatch[2].trim();
        
        if (value === '' || value === '[]') {
          data[currentKey] = [];
          currentList = data[currentKey];
          currentObject = null;
        } else if (value === 'true') {
          data[currentKey] = true;
          currentList = null;
          currentObject = null;
        } else if (value === 'false') {
          data[currentKey] = false;
          currentList = null;
          currentObject = null;
        } else {
          data[currentKey] = value.replace(/^["']|["']$/g, '');
          currentList = null;
          currentObject = null;
        }
        continue;
      }

      const listMatch = trimmed.match(/^-\s+(.*)$/);
      if (listMatch && currentList !== null) {
        const value = listMatch[1].trim();
        const objMatch = value.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*(.*)$/);
        
        if (objMatch) {
          if (!currentObject || lineIndent <= 2) {
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

      const fieldMatch = trimmed.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*(.*)$/);
      if (fieldMatch && currentObject !== null && lineIndent > 0) {
        const val = fieldMatch[2].trim();
        if (val === 'true') {
          currentObject[fieldMatch[1]] = true;
        } else if (val === 'false') {
          currentObject[fieldMatch[1]] = false;
        } else {
          currentObject[fieldMatch[1]] = val.replace(/^["']|["']$/g, '');
        }
      }
    }

    return data;
  }

  function updateText(selector, value) {
    if (value === undefined || value === null) return;
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      el.innerHTML = value;
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

    if (data.title) document.title = data.title;
    updateAttr('meta[name="description"]', 'content', data.description);
    updateAttr('meta[name="keywords"]', 'content', data.keywords);

    updateText('[data-content="header_tag"]', data.header_tag);
    updateText('[data-content="header_title"]', data.header_title);
    updateText('[data-content="header_subtitle"]', data.header_subtitle);

    updateText('[data-content="hero_title"]', data.hero_title);
    updateText('[data-content="hero_subtitle"]', data.hero_subtitle);
    updateText('[data-content="hero_description"]', data.hero_description);
    updateText('[data-content="hero_cta"]', data.hero_cta);
    updateLink('[data-content="hero_cta_link"]', data.hero_cta_link);

    updateText('[data-content="issues_title"]', data.issues_title);
    if (data.issues) {
      updateCards('[data-content="issues_list"]', data.issues, item => `
        <div class="issue-card">
          <h3>${item.title || ''}</h3>
          <p>${item.description || ''}</p>
        </div>
      `);
    }

    updateText('[data-content="about_title"]', data.about_title);
    updateText('[data-content="about_preview_text"]', data.about_preview_text);
    updateText('[data-content="about_preview_subtitle"]', data.about_preview_subtitle);
    updateText('[data-content="about_preview_details"]', data.about_preview_details);
    updateText('[data-content="about_preview_cta"]', data.about_preview_cta);
    updateLink('[data-content="about_preview_link"]', data.about_preview_link);

    updateText('[data-content="methods_title"]', data.methods_title);
    if (data.methods) {
      updateCards('[data-content="methods_list"]', data.methods, item => `
        <div class="method-card">
          <h3>${item.title || ''}</h3>
          <p>${item.description || ''}</p>
        </div>
      `);
    }

    updateText('[data-content="process_title"]', data.process_title);
    if (data.process_steps) {
      updateCards('[data-content="process_list"]', data.process_steps, item => `
        <div class="process-step">
          <h3>${item.title || ''}</h3>
          <p>${item.description || ''}</p>
        </div>
      `);
    }

    updateText('[data-content="trust_title"]', data.trust_title);
    if (data.trust_items) {
      updateCards('[data-content="trust_list"]', data.trust_items, item => `
        <div class="trust-item">
          <h3>${item.title || ''}</h3>
          <p>${item.description || ''}</p>
        </div>
      `);
    }

    updateText('[data-content="testimonials_title"]', data.testimonials_title);
    if (data.testimonials) {
      updateCards('[data-content="testimonials_list"]', data.testimonials, item => `
        <blockquote>
          <p>${item.text || ''}</p>
          ${item.author ? `<cite>${item.author}</cite>` : ''}
        </blockquote>
      `);
    }

    updateText('[data-content="pricing_title"]', data.pricing_title);
    updateText('[data-content="pricing_subtitle"]', data.pricing_subtitle);
    updateText('[data-content="pricing_note"]', data.pricing_note);
    if (data.pricing_items) {
      updateCards('[data-content="pricing_list"]', data.pricing_items, item => `
        <div class="pricing-card${item.featured ? ' featured' : ''}">
          ${item.badge ? `<div class="pricing-badge">${item.badge}</div>` : ''}
          <div class="pricing-label">${item.label || ''}</div>
          <div class="pricing-value">${item.duration || ''}</div>
          <p class="pricing-desc">${item.description || ''}</p>
          <a href="${item.cta_link || '#'}" class="btn"><span>${item.cta || 'Записаться'}</span></a>
        </div>
      `);
    }

    updateText('[data-content="form_title"]', data.form_title);
    updateText('[data-content="form_subtitle"]', data.form_subtitle);

    updateText('[data-content="cta_title"]', data.cta_title);
    updateText('[data-content="cta_subtitle"]', data.cta_subtitle);
    updateText('[data-content="cta_button"]', data.cta_button);
    updateLink('[data-content="cta_button_link"]', data.cta_button_link);

    updateText('[data-content="lead_text"]', data.lead_text);
    updateText('[data-content="bio_paragraph_1"]', data.bio_paragraph_1);
    updateText('[data-content="bio_paragraph_2"]', data.bio_paragraph_2);
    updateText('[data-content="education_title"]', data.education_title);
    
    if (data.education_items) {
      const container = document.querySelector('[data-content="education_items"]');
      if (container) {
        const list = container.tagName === 'UL' || container.tagName === 'OL' ? container : container.querySelector('ul, ol');
        if (list) list.innerHTML = data.education_items.map(item => `<li>${item}</li>`).join('');
      }
    }

    updateText('[data-content="approach_title"]', data.approach_title);
    updateText('[data-content="approach_text"]', data.approach_text);
    updateText('[data-content="call_to_action"]', data.call_to_action);
    updateLink('[data-content="call_to_action_link"]', data.call_to_action_link);

    updateText('[data-content="intro_text"]', data.intro_text);
    if (data.services) {
      updateCards('[data-content="services_list"]', data.services, item => `
        <div class="service-card">
          <h3>${item.title || ''}</h3>
          <p>${item.description || ''}</p>
          ${item.duration ? `<span class="service-duration">${item.duration}</span>` : ''}
          ${item.price ? `<span class="service-price">${item.price}</span>` : ''}
        </div>
      `);
    }
    updateText('[data-content="how_it_works_title"]', data.how_it_works_title);
    
    if (data.how_it_works_steps) {
      const container = document.querySelector('[data-content="how_it_works_steps"]');
      if (container) {
        const list = container.tagName === 'UL' || container.tagName === 'OL' ? container : container.querySelector('ul, ol');
        if (list) list.innerHTML = data.how_it_works_steps.map(item => `<li>${item}</li>`).join('');
      }
    }
    
    updateText('[data-content="cta_text"]', data.cta_text);
    updateText('[data-content="cta_button"]', data.cta_button);
    updateLink('[data-content="cta_link"]', data.cta_link);

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
    updateAttr('[data-content="contact_image"]', 'src', data.contact_image);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadContent);
  } else {
    loadContent();
  }
})();
