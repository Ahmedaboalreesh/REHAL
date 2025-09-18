document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registerForm');
    const userType = document.getElementById('userType');
    const affiliation = document.getElementById('affiliation');
    const phone = document.getElementById('phone');
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');

    // Toggle password visibility
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

    // Dynamic placeholder for affiliation based on user type
    userType.addEventListener('change', () => {
        if (userType.value === 'student') {
            affiliation.placeholder = 'مثال: جامعة الأميرة نورة';
        } else if (userType.value === 'worker') {
            affiliation.placeholder = 'مثال: شركة في حي العليا';
        } else {
            affiliation.placeholder = 'الجهة التعليمية/العملية';
        }
    });

    // Simple validators
    const validators = {
        fullName: value => value.length >= 3,
        email: value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        phone: value => /^05\d{8}$/.test(value),
        password: value => /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(value),
        confirmPassword: value => value === password.value,
        userType: value => value === 'student' || value === 'worker',
        district: value => Boolean(value),
        affiliation: value => value.trim().length >= 2,
        terms: checked => checked === true
    };

    function setInvalid(el, message) {
        el.classList.add('invalid');
        clearMessage(el);
        const msg = document.createElement('div');
        msg.className = 'error-msg';
        msg.textContent = message;
        el.parentElement.appendChild(msg);
    }

    function clearMessage(el) {
        el.classList.remove('invalid');
        const msg = el.parentElement.querySelector('.error-msg');
        if (msg) msg.remove();
    }

    function validateField(el) {
        const name = el.name || el.id;
        const value = el.type === 'checkbox' ? el.checked : el.value.trim();
        let valid = true;
        let message = '';

        if (validators[name]) {
            valid = validators[name](value);
        } else if (el.hasAttribute('required')) {
            valid = Boolean(value);
        }

        if (!valid) {
            switch (name) {
                case 'email': message = 'صيغة البريد غير صحيحة'; break;
                case 'phone': message = 'رقم الجوال بصيغة 05XXXXXXXX'; break;
                case 'password': message = '8 أحرف على الأقل وتحتوي رقمًا وحرفًا'; break;
                case 'confirmPassword': message = 'كلمة المرور غير مطابقة'; break;
                case 'userType': message = 'يرجى اختيار النوع'; break;
                case 'district': message = 'يرجى اختيار المنطقة'; break;
                case 'affiliation': message = 'يرجى إدخال الجهة'; break;
                case 'terms': message = 'يجب الموافقة على الشروط'; break;
                default: message = 'هذا الحقل مطلوب';
            }
            setInvalid(el, message);
        } else {
            clearMessage(el);
        }
        return valid;
    }

    form.querySelectorAll('input, select').forEach(el => {
        el.addEventListener('blur', () => validateField(el));
        el.addEventListener('input', () => clearMessage(el));
        if (el.type === 'checkbox') {
            el.addEventListener('change', () => validateField(el));
        }
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const elements = Array.from(form.querySelectorAll('input, select'));
        const results = elements.map(validateField);
        const allValid = results.every(Boolean);
        if (!allValid) return;

        // Real API call to backend
        const submitBtn = form.querySelector('.submit-btn');
        const original = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري إنشاء الحساب...';
        submitBtn.disabled = true;

        const payload = {
            fullName: form.fullName.value.trim(),
            email: email.value.trim(),
            phone: phone.value.trim(),
            userType: userType.value,
            district: form.district.value,
            affiliation: affiliation.value.trim(),
            password: password.value
        };

        fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(async (res) => {
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || 'فشل إنشاء الحساب');
            return data;
        })
        .then((data) => {
            try {
                if (data && data.user) {
                    localStorage.setItem('rehal:user', JSON.stringify(data.user));
                }
            } catch {}
            alert('تم إنشاء الحساب بنجاح! يجري تحويلك للوحة المستخدم.');
            window.location.href = 'dashboard.html';
        })
        .catch((err) => {
            alert(err.message || 'حدث خطأ غير متوقع');
        })
        .finally(() => {
            submitBtn.innerHTML = original;
            submitBtn.disabled = false;
        });
    });
});

