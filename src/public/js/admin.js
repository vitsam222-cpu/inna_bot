async function load() {
  const r = await fetch(`/api/admin/scenario?key=${window.ADMIN_KEY}`);
  const data = await r.json();
  document.getElementById('welcomeText').value = data.welcome.text || '';
  document.getElementById('steps').value = JSON.stringify(data.steps, null, 2);
  renderGraph(data.steps);
}

function renderGraph(steps){
  const root = document.getElementById('graph');
  root.innerHTML='';
  for(const step of steps){
    const node = document.createElement('div');
    node.className='node';
    node.textContent = step.id;
    root.appendChild(node);
    for(const b of (step.buttons||[])){
      if(b.type==='step'){
        const edge = document.createElement('div');
        edge.className='edge';
        edge.textContent=`${step.id} --(${b.text})-> ${b.target}`;
        root.appendChild(edge);
      }
    }
  }
}

document.getElementById('save').onclick = async () => {
  const payload = {
    welcome: { text: document.getElementById('welcomeText').value, image: '' },
    steps: JSON.parse(document.getElementById('steps').value)
  };

  const res = await fetch(`/api/admin/scenario?key=${window.ADMIN_KEY}`, {
    method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify(payload)
  });

  if(!res.ok){
    alert(await res.text());
    return;
  }
  renderGraph(payload.steps);
  alert('Сохранено');
};

load();
