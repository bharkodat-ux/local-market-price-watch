const resultsEl = document.getElementById('results');
const itemEl = document.getElementById('item');
const vendorEl = document.getElementById('vendor');
const searchBtn = document.getElementById('search');
const resetBtn = document.getElementById('reset');
const submitForm = document.getElementById('submitForm');

async function fetchPrices() {
  const item = encodeURIComponent(itemEl.value.trim());
  const vendor = encodeURIComponent(vendorEl.value.trim());
  const params = [];
  if (item) params.push(`item=${item}`);
  if (vendor) params.push(`vendor=${vendor}`);
  const res = await fetch('/api/prices' + (params.length ? ('?' + params.join('&')) : ''));
  return res.json();
}

function render(list) {
  if (!list.length) {
    resultsEl.innerHTML = '<p class="empty">No price data found.</p>';
    return;
  }
  resultsEl.innerHTML = list.map(p=>`<div class="entry"><strong>${p.item}</strong> — ${p.vendor} — <span class="price">${p.price}</span> ${p.unit || ''} <div class="date">${new Date(p.date).toLocaleString()}</div></div>`).join('\n');
}

searchBtn.addEventListener('click', async ()=>{
  resultsEl.innerText = 'Searching...';
  const list = await fetchPrices();
  render(list);
});

resetBtn.addEventListener('click', async ()=>{
  itemEl.value = '';
  vendorEl.value = '';
  resultsEl.innerText = 'Loading prices…';
  const list = await fetch('/api/prices').then(r=>r.json());
  render(list);
});

submitForm.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const fd = new FormData(submitForm);
  const body = {
    item: fd.get('item'),
    vendor: fd.get('vendor'),
    price: parseFloat(fd.get('price')),
    unit: fd.get('unit') || undefined
  };
  const res = await fetch('/api/prices', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) });
  if (res.ok) {
    alert('Submitted');
    submitForm.reset();
    const list = await fetch('/api/prices').then(r=>r.json());
    render(list);
  } else {
    alert('Failed to submit');
  }
});

// initial load
fetch('/api/prices').then(r=>r.json()).then(render).catch(()=>{resultsEl.innerText='Failed to load prices.'});
