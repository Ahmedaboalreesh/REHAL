document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('ownerRegisterForm');
  const email = document.getElementById('email');
  const phone = document.getElementById('phone');
  const password = document.getElementById('password');
  const confirmPassword = document.getElementById('confirmPassword');

  document.querySelectorAll('.toggle-pass').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.parentElement.querySelector('input');
      const icon = btn.querySelector('i');
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      icon.classList.toggle('fa-eye');
      icon.classList.toggle('fa-eye-slash');
    });
  });

  function invalid(el, msg){
    el.classList.add('invalid');
    const old = el.parentElement.querySelector('.error-msg');
    if (old) old.remove();
    const m = document.createElement('div');
    m.className = 'error-msg';
    m.textContent = msg;
    el.parentElement.appendChild(m);
  }
  function clear(el){
    el.classList.remove('invalid');
    const old = el.parentElement.querySelector('.error-msg');
    if (old) old.remove();
  }

  form.querySelectorAll('input').forEach(el => {
    el.addEventListener('input',()=>clear(el));
    el.addEventListener('blur',()=>validateField(el));
  });

  function validateField(el){
    const name = el.name;
    const val = el.value.trim();
    let ok = true, msg = '';
    if (el.hasAttribute('required') && !val){ ok=false; msg='هذا الحقل مطلوب'; }
    if (ok && name==='email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)){ ok=false; msg='صيغة البريد غير صحيحة'; }
    if (ok && name==='phone' && !/^05\d{8}$/.test(val)){ ok=false; msg='رقم الجوال بصيغة 05XXXXXXXX'; }
    if (ok && name==='password' && !/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(val)){ ok=false; msg='8 أحرف على الأقل مع رقم وحرف'; }
    if (ok && name==='confirmPassword' && val !== password.value){ ok=false; msg='كلمة المرور غير متطابقة'; }
    if (!ok) invalid(el,msg); else clear(el);
    return ok;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const elements = Array.from(form.querySelectorAll('input'));
    const allValid = elements.map(validateField).every(Boolean) && document.getElementById('terms').checked;
    if (!allValid) return;

    const payload = {
      ownerName: form.ownerName.value.trim(),
      company: form.company.value.trim(),
      email: email.value.trim(),
      phone: phone.value.trim(),
      plateNumber: form.plateNumber.value.trim(),
      capacity: Number(form.capacity.value),
      licenseNumber: form.licenseNumber.value.trim(),
      licenseExpiry: form.licenseExpiry.value,
      password: password.value
    };

    const btn = form.querySelector('.submit-btn');
    const original = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري إنشاء الحساب...';
    btn.disabled = true;

    fetch('/api/owners/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(async res => {
      const data = await res.json().catch(()=>({}));
      if (!res.ok) throw new Error(data.error || 'فشل إنشاء الحساب');
      return data;
    })
    .then((data) => {
      try { if (data && data.owner) localStorage.setItem('rehal:owner', JSON.stringify(data.owner)); } catch {}
      alert('تم إنشاء الحساب بنجاح. يجري تحويلك للوحة المالك.');
      window.location.href = 'owner-dashboard.html';
    })
    .catch(err => alert(err.message || 'حدث خطأ'))
    .finally(()=>{ btn.innerHTML = original; btn.disabled=false; });
  });
});


