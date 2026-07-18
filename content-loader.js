// content-loader.js
async function loadContent() {
  const elements = document.querySelectorAll('[data-content]');

  for (const el of elements) {
    const key = el.getAttribute('data-content');
    const [file, path] = key.split(':');

    try {
      const res = await fetch(`/content/${file}.yaml`);
      const text = await res.text();
      const data = parseYAML(text);
      const value = getNestedValue(data, path);

      if (value !== undefined) {
        if (typeof value === 'string') {
          el.innerHTML = value;
        } else if (Array.isArray(value)) {
          renderList(el, value);
        }
      }
    } catch (e) {
      console.warn('⚠️ Не загружен:', key, e);
    }
  }
}

function parseYAML(yaml) {
  const obj = {};
  let currentKey = null;
  let currentList = null;
  let inList = false;

  yaml.split('\n').forEach(line => {
    line = line.trim();
    if (!line || line.startsWith('#')) return;

    if (line.includes(':') && !line.startsWith('-')) {
      const [key, ...valParts] = line.split(':');
      const val = valParts.join(':').trim();
      currentKey = key.trim();
      if (val) {
        obj[currentKey] = val;
      } else {
        obj[currentKey] = [];
        currentList = obj[currentKey];
        inList = true;
      }
    } else if (line.startsWith('-') && inList && currentList) {
      const val = line.substring(1).trim();
      if (val) {
        currentList.push({ value: val });
      } else {
        currentList.push({});
      }
    } else if (line.startsWith('  ') && inList && currentList && currentList.length > 0) {
      const [key, val] = line.split(':').map(s => s.trim());
      if (key && val) {
        const last = currentList[currentList.length - 1];
        last[key] = val;
      }
    }
  });

  return obj;
}

function getNestedValue(obj, path) {
  return path.split('.').reduce((acc, part) => acc?.[part], obj);
}

function renderList(container, items) {
  container.innerHTML = items.map(item => {
    if (typeof item === 'string') return `<div>${item}</div>`;
    if (item.name && item.description) {
      return `
        <div class="service-card">
          ${item.icon ? `<div class="service-icon">${item.icon}</div>` : ''}
          <h3>${item.name}</h3>
          <p>${item.description}</p>
          ${item.price ? `<p class="price">${item.price}</p>` : ''}
          ${item.duration ? `<p class="duration">⏱ ${item.duration}</p>` : ''}
        </div>
      `;
    }
    return `<div>${JSON.stringify(item)}</div>`;
  }).join('');
}

// Запуск при загрузке и после обновления CMS
document.addEventListener('DOMContentLoaded', loadContent);
window.addEventListener('pagescms:update', loadContent);
