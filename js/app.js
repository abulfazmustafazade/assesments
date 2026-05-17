// ═══════════════════════════════════════
//  CONFIG — Bunu Google Apps Script URL ilə dəyişdirin
// ═══════════════════════════════════════
const API_URL = localStorage.getItem('api_url') || 'https://script.google.com/macros/s/AKfycbxo-VIjufnG8WlaOfY-ci3h53d7ws4ZmxNgGNzOdabQYMSro4J0Cqq03hQA5ifOJ5HrFg/exec';

// ═══════════════════════════════════════
//  i18n — Dil dəstəyi
// ═══════════════════════════════════════
const LANG = {
  az: {
    'login.title': 'Rəhbər girişi',
    'login.subtitle': 'Email və ID kodunuzu daxil edin',
    'login.email': 'Korporativ email',
    'login.email.ph': 'emailiniz@sirket.az',
    'login.code': 'ID kod',
    'login.code.ph': '6 rəqəmli kod',
    'login.btn': 'Daxil ol',
    'login.hint': 'ID kodunuzu bilmirsinizsə HR şöbəsinə müraciət edin',
    'login.err.empty': 'Email və ID kod daxil edin',
    'login.err.invalid': 'Email və ya ID kod yanlışdır',
    'login.err.notmgr': 'Bu hesab rəhbər kimi qeydiyyatda deyil',
    'login.err.server': 'Server xətası, yenidən cəhd edin',
    'login.err.noapi': 'API ünvanı təyin edilməyib. README-dəki təlimata baxın.',
    'dash.title': 'Mənim komandam',
    'dash.progress': 'İrəliləyiş',
    'dash.evaluated': 'işçi qiymətləndirilib',
    'dash.completed': 'Tamamlandı',
    'dash.pending': 'Qalıb',
    'dash.empty': 'Sizə tabe işçi tapılmadı',
    'dash.loading': 'Komanda yüklənir...',
    'assess.back': 'Komandaya qayıt',
    'assess.answered': 'cavablandı',
    'assess.q': 'Sual',
    'assess.submit': 'Qiymətləndirməni göndər',
    'assess.remaining': 'sual qaldı',
    'assess.sending': 'Göndərilir...',
    'assess.success': 'Qiymətləndirmə uğurla yadda saxlanıldı!',
    'assess.err': 'Xəta baş verdi',
    'assess.fill': 'Bütün suallara cavab verin',
    'common.logout': 'Çıxış',
    'common.loading': 'Yüklənir...',
  },
  en: {
    'login.title': 'Manager login',
    'login.subtitle': 'Enter your email and ID code',
    'login.email': 'Corporate email',
    'login.email.ph': 'you@company.com',
    'login.code': 'ID code',
    'login.code.ph': '6-digit code',
    'login.btn': 'Sign in',
    'login.hint': "Contact HR if you don't know your ID code",
    'login.err.empty': 'Please enter email and ID code',
    'login.err.invalid': 'Invalid email or ID code',
    'login.err.notmgr': 'This account is not registered as a manager',
    'login.err.server': 'Server error, please try again',
    'login.err.noapi': 'API URL not configured. See README for instructions.',
    'dash.title': 'My team',
    'dash.progress': 'Progress',
    'dash.evaluated': 'employees evaluated',
    'dash.completed': 'Completed',
    'dash.pending': 'Pending',
    'dash.empty': 'No subordinates found',
    'dash.loading': 'Loading team...',
    'assess.back': 'Back to team',
    'assess.answered': 'answered',
    'assess.q': 'Question',
    'assess.submit': 'Submit assessment',
    'assess.remaining': 'questions remaining',
    'assess.sending': 'Submitting...',
    'assess.success': 'Assessment saved successfully!',
    'assess.err': 'An error occurred',
    'assess.fill': 'Please answer all questions',
    'common.logout': 'Sign out',
    'common.loading': 'Loading...',
  }
};

function getLang() {
  return localStorage.getItem('lang') || 'az';
}

function setLang(lang) {
  localStorage.setItem('lang', lang);
  applyLang();
}

function t(key) {
  const lang = getLang();
  return LANG[lang]?.[key] || LANG['az'][key] || key;
}

function applyLang() {
  const lang = getLang();
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    el.placeholder = t(el.getAttribute('data-i18n-ph'));
  });
  // Update lang toggle buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
}

// ═══════════════════════════════════════
//  THEME — Dark / Light
// ═══════════════════════════════════════
function getTheme() {
  return localStorage.getItem('theme') || 'light';
}

function setTheme(theme) {
  localStorage.setItem('theme', theme);
  applyTheme();
}

function toggleTheme() {
  setTheme(getTheme() === 'dark' ? 'light' : 'dark');
}

function applyTheme() {
  const theme = getTheme();
  document.documentElement.setAttribute('data-theme', theme);
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.innerHTML = theme === 'dark'
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  });
}

// ═══════════════════════════════════════
//  API — Google Sheets Backend
// ═══════════════════════════════════════
async function api(action, params = {}) {
  if (!API_URL) throw new Error('API_NOT_SET');
  const url = new URL(API_URL);
  url.searchParams.set('action', action);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, typeof v === 'object' ? JSON.stringify(v) : String(v)));

  const res = await fetch(url.toString(), { redirect: 'follow' });
  const text = await res.text();
  try { return JSON.parse(text); }
  catch { throw new Error('Invalid response from server'); }
}

// ═══════════════════════════════════════
//  SESSION
// ═══════════════════════════════════════
function getSession() {
  try { return JSON.parse(sessionStorage.getItem('session')); }
  catch { return null; }
}

function setSession(data) {
  sessionStorage.setItem('session', JSON.stringify(data));
}

function clearSession() {
  sessionStorage.removeItem('session');
}

function requireAuth() {
  const s = getSession();
  if (!s) { window.location.href = 'index.html'; return null; }
  return s;
}

// ═══════════════════════════════════════
//  UTILS
// ═══════════════════════════════════════
function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase();
}

function showToast(msg, isError) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.className = `toast ${isError ? 'toast-err' : 'toast-ok'}`;
  setTimeout(() => toast.classList.add('hide'), 3500);
}

// ═══════════════════════════════════════
//  INIT — Call on every page
// ═══════════════════════════════════════
function initPage() {
  applyTheme();
  applyLang();
}
