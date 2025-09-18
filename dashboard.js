document.addEventListener('DOMContentLoaded', () => {
  // Auth guard (simple localStorage simulation)
  const raw = localStorage.getItem('rehal:user');
  if (!raw) {
    alert('يرجى تسجيل الدخول أولاً');
    window.location.href = 'register.html';
    return;
  }

  const user = JSON.parse(raw);

  // Populate header and profile
  document.getElementById('userName').textContent = user.fullName || 'مستخدمة';
  document.getElementById('pName').textContent = user.fullName || '—';
  document.getElementById('pEmail').textContent = user.email || '—';
  document.getElementById('pPhone').textContent = user.phone || '—';
  document.getElementById('pType').textContent = user.userType === 'student' ? 'طالبة' : 'عاملة';
  document.getElementById('pDistrict').textContent = mapLocation(user.district);
  document.getElementById('pAffiliation').textContent = user.affiliation || '—';

  // Stats and lists (mock data)
  const upcoming = JSON.parse(localStorage.getItem('rehal:upcoming') || '[]');
  const recent = JSON.parse(localStorage.getItem('rehal:recent') || '[]');
  const saved = JSON.parse(localStorage.getItem('rehal:saved') || '[]');

  setStat('statUpcoming', upcoming.length);
  setStat('statTrips', recent.length);
  setStat('statSaved', saved.length);

  renderTripList('upcomingList', upcoming, 'قادم');
  renderTripList('recentList', recent, 'منتهي');

  // Nav switcher
  const tabs = [
    { link: 'link-home', section: 'section-home' },
    { link: 'link-search', section: 'section-search' },
    { link: 'link-profile', section: 'section-profile' }
  ];
  tabs.forEach(t => {
    document.getElementById(t.link).addEventListener('click', (e) => {
      e.preventDefault();
      setActiveTab(t.section, t.link);
    });
  });

  // Quick search form
  const qDate = document.getElementById('qDate');
  const today = new Date(); today.setDate(today.getDate() + 1);
  qDate.min = today.toISOString().split('T')[0];
  qDate.value = qDate.min;

  document.getElementById('quickSearch').addEventListener('submit', (e) => {
    e.preventDefault();
    const departure = document.getElementById('qDeparture').value;
    const destination = document.getElementById('qDestination').value;
    const date = document.getElementById('qDate').value;
    if (!departure || !destination || !date) return;

    const results = mockSearch({ departure, destination, date });
    renderResults(results);
  });

  // Logout
  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('rehal:user');
    alert('تم تسجيل الخروج');
    window.location.href = 'index.html';
  });
});

function setActiveTab(sectionId, linkId){
  document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));
  document.getElementById(sectionId).classList.add('active');
  document.querySelectorAll('.links a').forEach(a=>a.classList.remove('active'));
  document.getElementById(linkId).classList.add('active');
}

function setStat(id, value){
  const el = document.getElementById(id);
  el.textContent = value;
}

function renderTripList(containerId, list, status){
  const el = document.getElementById(containerId);
  if (!list.length){
    el.classList.add('empty');
    el.textContent = containerId === 'upcomingList' ? 'لا توجد رحلات قادمة بعد' : 'لا يوجد سجل رحلات';
    return;
  }
  el.classList.remove('empty');
  el.innerHTML = list.map(t => `
    <div class="trip-item">
      <div>
        <div><strong>${mapLocation(t.departure)}</strong> → <strong>${mapLocation(t.destination)}</strong></div>
        <div class="meta"><i class="fas fa-calendar"></i> ${t.date} &nbsp; <i class="fas fa-clock"></i> ${t.time || '—'}</div>
      </div>
      <div><span class="chip">${status}</span></div>
    </div>
  `).join('');
}

function renderResults(routes){
  const box = document.getElementById('searchResults');
  if (!routes.length){
    box.innerHTML = '<div class="list empty">لا توجد رحلات مطابقة</div>';
    return;
  }
  box.innerHTML = routes.map(r => `
    <div class="result-card">
      <div>
        <div><strong>${mapLocation(r.departure)}</strong> → <strong>${mapLocation(r.destination)}</strong></div>
        <div class="meta"><i class="fas fa-clock"></i> ${r.time} · <i class="fas fa-route"></i> ${r.duration} دقيقة · <strong>${r.price} ريال</strong></div>
      </div>
      <div class="actions">
        <button class="btn primary" onclick='saveUpcoming(${JSON.stringify(r)})'>حجز</button>
        <button class="btn outline" onclick='saveSaved(${JSON.stringify(r)})'>حفظ</button>
      </div>
    </div>
  `).join('');
}

function mockSearch({ departure, destination, date }){
  const times = ['06:00','06:30','07:00','15:00','17:00'];
  return Array.from({length: Math.floor(Math.random()*3)+1}).map((_,i)=>({
    id: `r${Date.now()}_${i}`,
    departure, destination, date,
    time: times[i%times.length],
    duration: Math.floor(Math.random()*30)+20,
    price: Math.floor(Math.random()*20)+15
  }));
}

function saveUpcoming(route){
  const list = JSON.parse(localStorage.getItem('rehal:upcoming')||'[]');
  list.push(route);
  localStorage.setItem('rehal:upcoming', JSON.stringify(list));
  alert('تم حجز الرحلة مؤقتاً في حسابك');
  location.reload();
}

function saveSaved(route){
  const list = JSON.parse(localStorage.getItem('rehal:saved')||'[]');
  list.push(route);
  localStorage.setItem('rehal:saved', JSON.stringify(list));
  alert('تم حفظ المسار');
}

function mapLocation(code){
  const map = {
    'riyadh-center':'وسط الرياض','riyadh-north':'شمال الرياض','riyadh-south':'جنوب الرياض','riyadh-east':'شرق الرياض','riyadh-west':'غرب الرياض',
    'olaya':'العليا','malaz':'الملز','nasim':'النسيم','shifa':'الشفا','hittin':'حطين','al-nakheel':'النخيل',
    'ksu':'جامعة الملك سعود','imamu':'جامعة الإمام محمد بن سعود','ksau':'جامعة الملك سعود للعلوم الصحية','psu':'جامعة الأميرة نورة'
  };
  return map[code] || code;
}


