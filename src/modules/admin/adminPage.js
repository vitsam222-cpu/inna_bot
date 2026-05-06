export function renderAdminPage(adminKey) {
  return `<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Bot Flow Editor</title>
  <link rel="stylesheet" href="/css/admin.css" />
</head>
<body>
  <div class="app">
    <aside class="panel">
      <h1>Flow</h1>
      <label>Приветствие</label>
      <textarea id="welcomeText" placeholder="Текст приветствия"></textarea>
      <label>Стартовый шаг</label>
      <select id="startStepId"></select>
      <button id="addStep" class="ghost">+ Шаг</button>
      <button id="save" class="primary">Сохранить</button>
    </aside>

    <main class="workspace">
      <section id="steps" class="steps"></section>
      <section class="map-wrap">
        <div id="graph" class="graph"></div>
      </section>
    </main>
  </div>

  <template id="stepTemplate">
    <article class="step-card">
      <div class="row">
        <input class="step-id" placeholder="id шага" />
        <button class="make-start ghost">Старт</button>
        <button class="remove-step danger">✕</button>
      </div>
      <textarea class="step-text" placeholder="Текст шага"></textarea>
      <input class="step-image" placeholder="URL изображения (опционально)" />
      <div class="buttons"></div>
      <button class="add-btn ghost">+ Кнопка</button>
    </article>
  </template>

  <template id="btnTemplate">
    <div class="btn-row">
      <input class="btn-text" placeholder="Текст кнопки" />
      <select class="btn-type">
        <option value="step">Шаг</option>
        <option value="url">URL</option>
      </select>
      <input class="btn-target" placeholder="id шага" />
      <input class="btn-url hidden" placeholder="https://..." />
      <button class="remove-btn danger">✕</button>
    </div>
  </template>

  <script>window.ADMIN_KEY='${adminKey}'</script>
  <script src="/js/admin.js"></script>
</body>
</html>`;
}
