const stepTemplate = document.getElementById('stepTemplate');
const btnTemplate = document.getElementById('btnTemplate');
const stepsRoot = document.getElementById('steps');
const startStepSelect = document.getElementById('startStepId');

let currentStartStepId = 'start';

function mkStep(step = { id: '', text: '', image: '', buttons: [] }) {
  const node = stepTemplate.content.firstElementChild.cloneNode(true);
  node.querySelector('.step-id').value = step.id || '';
  node.querySelector('.step-text').value = step.text || '';
  node.querySelector('.step-image').value = step.image || '';

  const btnRoot = node.querySelector('.buttons');
  for (const btn of step.buttons || []) addBtn(btnRoot, btn);

  node.querySelector('.add-btn').onclick = () => addBtn(btnRoot);
  node.querySelector('.make-start').onclick = () => {
    const id = node.querySelector('.step-id').value.trim();
    if (!id) return alert('Сначала напиши id шага');
    currentStartStepId = id;
    renderAll();
  };
  node.querySelector('.remove-step').onclick = () => {
    node.remove();
    renderAll();
  };
  node.addEventListener('input', renderAll);
  return node;
}

function addBtn(root, btn = { text: '', type: 'step', target: '', url: '' }) {
  const row = btnTemplate.content.firstElementChild.cloneNode(true);
  const text = row.querySelector('.btn-text');
  const type = row.querySelector('.btn-type');
  const target = row.querySelector('.btn-target');
  const url = row.querySelector('.btn-url');

  text.value = btn.text || '';
  type.value = btn.type || 'step';
  target.value = btn.target || '';
  url.value = btn.url || '';

  const sync = () => {
    const isStep = type.value === 'step';
    target.classList.toggle('hidden', !isStep);
    url.classList.toggle('hidden', isStep);
    renderGraph();
  };

  type.onchange = sync;
  row.querySelector('.remove-btn').onclick = () => {
    row.remove();
    renderGraph();
  };
  row.addEventListener('input', renderGraph);
  sync();
  root.appendChild(row);
}

function collectSteps() {
  return [...stepsRoot.querySelectorAll('.step-card')].map((card) => {
    const buttons = [...card.querySelectorAll('.btn-row')].map((r) => {
      const type = r.querySelector('.btn-type').value;
      return type === 'step'
        ? { text: r.querySelector('.btn-text').value.trim(), type, target: r.querySelector('.btn-target').value.trim() }
        : { text: r.querySelector('.btn-text').value.trim(), type, url: r.querySelector('.btn-url').value.trim() };
    }).filter((b) => b.text);

    return {
      id: card.querySelector('.step-id').value.trim(),
      text: card.querySelector('.step-text').value.trim(),
      image: card.querySelector('.step-image').value.trim(),
      buttons
    };
  }).filter((s) => s.id);
}

function collect() {
  const steps = collectSteps();
  const startStepId = startStepSelect.value || currentStartStepId || steps[0]?.id || 'start';

  return {
    startStepId,
    welcome: { text: document.getElementById('welcomeText').value.trim(), image: '' },
    steps
  };
}

function renderStartOptions() {
  const steps = collectSteps();
  const ids = steps.map((step) => step.id);
  if (!ids.includes(currentStartStepId)) currentStartStepId = ids[0] || 'start';

  startStepSelect.innerHTML = '';
  for (const step of steps) {
    const option = document.createElement('option');
    option.value = step.id;
    option.textContent = step.id;
    option.selected = step.id === currentStartStepId;
    startStepSelect.appendChild(option);
  }

  for (const card of stepsRoot.querySelectorAll('.step-card')) {
    const id = card.querySelector('.step-id').value.trim();
    card.classList.toggle('is-start', id && id === currentStartStepId);
  }
}

function renderGraph() {
  const graph = document.getElementById('graph');
  const steps = collectSteps();
  graph.innerHTML = '';
  for (const step of steps) {
    if (!step.buttons.length) {
      const one = document.createElement('div');
      one.className = 'edge';
      one.textContent = `${step.id}${step.id === currentStartStepId ? ' ★ старт' : ''} (без кнопок)`;
      graph.appendChild(one);
      continue;
    }
    for (const b of step.buttons) {
      const edge = document.createElement('div');
      edge.className = 'edge';
      edge.textContent = b.type === 'step'
        ? `${step.id}${step.id === currentStartStepId ? ' ★' : ''} → [${b.text}] → ${b.target || '???'}`
        : `${step.id}${step.id === currentStartStepId ? ' ★' : ''} → [${b.text}] → ${b.url || 'https://...'}`;
      graph.appendChild(edge);
    }
  }
}

function renderAll() {
  renderStartOptions();
  renderGraph();
}

async function load() {
  const r = await fetch(`/api/admin/scenario?key=${window.ADMIN_KEY}`);
  const data = await r.json();
  document.getElementById('welcomeText').value = data.welcome?.text || '';
  currentStartStepId = data.startStepId || data.steps?.[0]?.id || 'start';
  stepsRoot.innerHTML = '';
  for (const step of data.steps || []) stepsRoot.appendChild(mkStep(step));
  if (!data.steps?.length) stepsRoot.appendChild(mkStep({ id: 'start', text: '', image: '', buttons: [] }));
  renderAll();
}

startStepSelect.onchange = () => {
  currentStartStepId = startStepSelect.value;
  renderAll();
};

document.getElementById('addStep').onclick = () => {
  stepsRoot.appendChild(mkStep());
  renderAll();
};

document.getElementById('save').onclick = async () => {
  const payload = collect();
  if (!payload.welcome.text) return alert('Добавь приветствие');
  if (!payload.steps.length) return alert('Добавь хотя бы один шаг');
  if (!payload.steps.some((step) => step.id === payload.startStepId)) return alert('Выбери стартовый шаг');

  const res = await fetch(`/api/admin/scenario?key=${window.ADMIN_KEY}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) return alert(await res.text());
  alert('Сохранено');
};

load();
