'use strict';
(() => {
  const roles = JSON.parse(document.getElementById('role-index-data').textContent);
  const search = document.getElementById('role-search');
  const group = document.getElementById('role-group');
  const availability = document.getElementById('role-availability');
  const buttons = [...document.querySelectorAll('.category-buttons button')];
  const cards = new Map(roles.map(r => [r.id, document.getElementById('role-' + r.id)]));
  const groups = [...document.querySelectorAll('.role-group')];
  const controls = document.getElementById('role-controls');
  const normalize = text => String(text).normalize('NFKC').toLocaleLowerCase().replace(/狐狸/g,'狐').replace(/回血/g,'恢复').replace(/奶妈/g,'恢复');
  const haystacks = new Map(roles.map(r => [r.id, normalize(r.search)]));
  const params = new URLSearchParams(location.search);
  let category = params.get('category') || '';
  if (!buttons.some(b => b.dataset.category === category)) category = '';
  search.value = params.get('q') || '';
  if ([...group.options].some(o => o.value === params.get('group'))) group.value = params.get('group');
  if ([...availability.options].some(o => o.value === params.get('availability'))) availability.value = params.get('availability');
  function apply(writeURL = true, reveal = false) {
    const terms = normalize(search.value.trim()).split(/\s+/).filter(Boolean);
    let count = 0;
    for (const role of roles) {
      const match = (!category || role.tags.includes(category)) && (!group.value || role.group === group.value) && (!availability.value || role.status === availability.value) && terms.every(t => haystacks.get(role.id).includes(t));
      cards.get(role.id).hidden = !match;
      if (match) count++;
    }
    for (const section of groups) section.hidden = ![...section.querySelectorAll('.role-card')].some(c => !c.hidden);
    for (const button of buttons) button.setAttribute('aria-pressed', String(button.dataset.category === category));
    document.getElementById('role-count').textContent = `显示${count} / ${roles.length}名角色${category ? ' · ' + category + '（含副标签）' : ''}`;
    document.getElementById('role-empty').hidden = count !== 0;
    if (writeURL) {
      const url = new URL(location.href);
      for (const [key, value] of Object.entries({q:search.value, group:group.value, availability:availability.value, category})) {
        if (value) url.searchParams.set(key, value); else url.searchParams.delete(key);
      }
      try { history.replaceState(null, '', url); } catch (_) { /* Offline host may disallow URL updates; filtering remains available. */ }
    }
    if (reveal && controls.getBoundingClientRect().bottom < 0) controls.scrollIntoView({block:'start'});
  }
  search.addEventListener('input', () => apply());
  group.addEventListener('change', () => apply());
  availability.addEventListener('change', () => apply());
  for (const button of buttons) button.addEventListener('click', () => { category = button.dataset.category; apply(true, true); });
  document.getElementById('role-reset').addEventListener('click', () => { search.value=''; group.value=''; availability.value=''; category=''; apply(true, true); search.focus(); });
  apply(false);
})();
