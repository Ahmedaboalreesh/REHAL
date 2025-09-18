document.addEventListener('DOMContentLoaded', () => {
  const raw = localStorage.getItem('rehal:owner');
  if (!raw) {
    alert('يرجى تسجيل الدخول كمالكة أولاً');
    window.location.href = 'owner-register.html';
    return;
  }
  const owner = JSON.parse(raw);
  document.getElementById('ownerName').textContent = owner.ownerName || '—';
  document.getElementById('accountStatus').textContent = owner.status ? (owner.status === 'approved' ? 'معتمد' : owner.status === 'pending' ? 'قيد المراجعة' : 'مرفوض') : 'قيد المراجعة';

  // Load stored fleet and trips
  const fleet = JSON.parse(localStorage.getItem('rehal:owner:fleet') || '[]');
  const trips = JSON.parse(localStorage.getItem('rehal:owner:trips') || '[]');

  setStat('statFleet', fleet.length);
  setStat('statUpcoming', trips.filter(t=>new Date(`${t.date}T${t.time}`)>new Date()).length);
  setStat('statCompleted', trips.filter(t=>new Date(`${t.date}T${t.time}`)<=new Date()).length);

  renderFleet();
  renderTrips();

  // Tabs
  const tabs = [
    { link: 'link-overview', section: 'section-overview' },
    { link: 'link-fleet', section: 'section-fleet' },
    { link: 'link-trips', section: 'section-trips' }
  ];
  tabs.forEach(t => {
    document.getElementById(t.link).addEventListener('click', (e) => {
      e.preventDefault();
      setActiveTab(t.section, t.link);
    });
  });

  // Add vehicle
  document.getElementById('addVehicleForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const plate = document.getElementById('vPlate').value.trim();
    const capacity = Number(document.getElementById('vCapacity').value);
    const features = document.getElementById('vFeatures').value.trim();
    if (!plate || !capacity) return;
    fleet.push({ plate, capacity, features });
    localStorage.setItem('rehal:owner:fleet', JSON.stringify(fleet));
    e.target.reset();
    renderFleet();
    alert('تمت إضافة المركبة');
  });

  // Add trip
  document.getElementById('addTripForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const plate = document.getElementById('tPlate').value;
    const departure = document.getElementById('tDeparture').value;
    const destination = document.getElementById('tDestination').value;
    const date = document.getElementById('tDate').value;
    const time = document.getElementById('tTime').value;
    const price = Number(document.getElementById('tPrice').value);
    if (!plate || !departure || !destination || !date || !time || !price) return;
    trips.push({ id: `t${Date.now()}`, plate, departure, destination, date, time, price });
    localStorage.setItem('rehal:owner:trips', JSON.stringify(trips));
    e.target.reset();
    renderTrips();
    alert('تمت إضافة الرحلة');
  });

  // Logout
  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('rehal:owner');
    alert('تم تسجيل الخروج');
    window.location.href = 'index.html';
  });

  function renderFleet(){
    const list = document.getElementById('fleetList');
    if (!fleet.length){ list.innerHTML = '<div class="row">لا توجد مركبات بعد</div>'; }
    else {
      list.innerHTML = fleet.map((v,i)=>`
        <div class="row">
          <div><strong>${v.plate}</strong></div>
          <div>${v.capacity} مقعد</div>
          <div>${v.features || '—'}</div>
          <div class="actions">
            <button class="btn outline" onclick="prefillTrip('${v.plate}')">إنشاء رحلة</button>
            <button class="btn danger" onclick="removeVehicle(${i})">حذف</button>
          </div>
        </div>
      `).join('');
    }
    // populate trip plate select
    const select = document.getElementById('tPlate');
    select.innerHTML = '<option value="">اختر المركبة</option>' + fleet.map(v=>`<option value="${v.plate}">${v.plate}</option>`).join('');
  }

  function renderTrips(){
    const list = document.getElementById('tripsList');
    if (!trips.length){ list.innerHTML = '<div class="row">لا توجد رحلات</div>'; return; }
    list.innerHTML = trips.map((t,i)=>`
      <div class="row">
        <div><strong>${t.plate}</strong></div>
        <div>${mapLocation(t.departure)} → ${mapLocation(t.destination)}</div>
        <div>${t.date} · ${t.time} · ${t.price} ريال</div>
        <div class="actions">
          <button class="btn danger" onclick="removeTrip(${i})">حذف</button>
        </div>
      </div>
    `).join('');
  }

  window.prefillTrip = function(plate){
    setActiveTab('section-trips','link-trips');
    document.getElementById('tPlate').value = plate;
  };

  window.removeVehicle = function(index){
    fleet.splice(index,1);
    localStorage.setItem('rehal:owner:fleet', JSON.stringify(fleet));
    renderFleet();
  };

  window.removeTrip = function(index){
    trips.splice(index,1);
    localStorage.setItem('rehal:owner:trips', JSON.stringify(trips));
    renderTrips();
  };
});

function setActiveTab(sectionId, linkId){
  document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));
  document.getElementById(sectionId).classList.add('active');
  document.querySelectorAll('.links a').forEach(a=>a.classList.remove('active'));
  document.getElementById(linkId).classList.add('active');
}

function setStat(id, value){ document.getElementById(id).textContent = value; }

function mapLocation(code){
  const map = {
    'riyadh-center':'وسط الرياض','riyadh-north':'شمال الرياض','riyadh-south':'جنوب الرياض','riyadh-east':'شرق الرياض','riyadh-west':'غرب الرياض',
    'olaya':'العليا','malaz':'الملز','nasim':'النسيم','shifa':'الشفا','hittin':'حطين','al-nakheel':'النخيل',
    'ksu':'جامعة الملك سعود','imamu':'جامعة الإمام محمد بن سعود','ksau':'جامعة الملك سعود للعلوم الصحية','psu':'جامعة الأميرة نورة'
  };
  return map[code] || code;
}


