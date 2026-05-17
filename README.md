# Potensial Qiymətləndirmə Sistemi

Şirkət daxili işçilərin rəhbərlər tərəfindən qiymətləndirilməsi üçün veb platforma.

**Texnologiya:** HTML/CSS/JS (statik) + Google Sheets (database) + Google Apps Script (API)
**Hosting:** Vercel.app (pulsuz)
**Dil dəstəyi:** Azərbaycanca / İngiliscə
**Tema:** Light / Dark mode

---

## Quruluş — Addım-addım

### 1. Google Sheets hazırla

Google Drive-da yeni Google Sheet yarat. Adını `Qiymətləndirmə Sistemi` qoy.

**3 sheet (tab) yarat:**

#### Tab 1: `Employees`
Öz Excel faylını birbaşa bura import et (File → Import → Upload).
Mövcud sütunların olduğu kimi qalsın:
```
ID Code | Manager ID | Manager Name | Manager mail | Company | Full name | Job title | Division | Department | Subdepartment | Unit | Subunit
```

#### Tab 2: `Questions`
Bu sütunları yarat və sualları doldur:
```
ID | Text_AZ | Text_EN | Category_AZ | Category_EN | Opt1_AZ | Opt1_EN | Opt2_AZ | Opt2_EN | Opt3_AZ | Opt3_EN | Opt4_AZ | Opt4_EN
```

Nümunə:
| ID | Text_AZ | Text_EN | Category_AZ | Category_EN | Opt1_AZ | Opt1_EN | Opt2_AZ | Opt2_EN | Opt3_AZ | Opt3_EN | Opt4_AZ | Opt4_EN |
|----|---------|---------|-------------|-------------|---------|---------|---------|---------|---------|---------|---------|---------|
| 1 | İşçi komandadakı digər üzvlərlə ünsiyyəti necə qurur? | How well does the employee communicate with team members? | Ünsiyyət | Communication | Çətinlik çəkir | Struggles | Bəzən uğurludur | Sometimes successful | Yaxşı qura bilir | Good communicator | Mükəmməl qura bilir | Excellent communicator |
| 2 | Çətin vəziyyətlərdə qərar qəbul edə bilirmi? | Can the employee make decisions under pressure? | Liderlik | Leadership | Çətinlik çəkir | Struggles | Bəzən uğurludur | Sometimes | Yaxşı qərarlar verir | Good decisions | Mükəmməl idarə edir | Excellent decisions |

#### Tab 3: `Assessments`
Bu sütunları yarat (boş qalsın, sistem avtomatik dolduracaq):
```
Timestamp | Evaluator Email | Evaluator Name | Employee IDCode | Employee Name | Department | Question ID | Question Text | Answer Index | Answer Text
```

---

### 2. Google Apps Script qur

1. Google Sheet-in içində: **Extensions → Apps Script**
2. Açılan editor-da default kodu sil
3. `google-apps-script.js` faylındakı kodu bura yapışdır
4. **Deploy → New deployment**
5. Type: **Web app**
6. Execute as: **Me**
7. Who has access: **Anyone**
8. **Deploy** düyməsinə bas
9. URL-i kopyala — bu sənin API ünvanındır (belə görünəcək: `https://script.google.com/macros/s/XXXX/exec`)

---

### 3. Frontend-ə API URL-i əlavə et

`js/app.js` faylında 4-cü sətri dəyiş:
```javascript
const API_URL = localStorage.getItem('api_url') || 'BURA_GOOGLE_APPS_SCRIPT_URL';
```

Google Apps Script URL-ini `'BURA_GOOGLE_APPS_SCRIPT_URL'` yerinə yaz.

---

### 4. Vercel-ə deploy et

**Variant A — GitHub üzərindən:**
```bash
# 1. GitHub-da yeni repo yarat
# 2. Faylları push et
git init
git add .
git commit -m "initial"
git remote add origin https://github.com/SENIN_HESAB/assessment.git
git push -u origin main

# 3. vercel.com-a daxil ol, GitHub hesabını bağla
# 4. "Import Project" → GitHub repo-nu seç
# 5. Deploy düyməsinə bas — hazır!
```

**Variant B — Vercel CLI ilə:**
```bash
npm install -g vercel
vercel login
vercel --prod
```

---

### 5. İstifadə

1. Rəhbərlərə saytın URL-ini göndər (məs. `https://assessment.vercel.app`)
2. Hər rəhbər öz **emaili** (Excel-dəki Manager mail) və **ID Kodu** (öz ID Code-u) ilə daxil olur
3. Yalnız öz tabeçiliyindəkiləri görür
4. Tək səhifədə bütün sualları cavablayır
5. Nəticələr avtomatik Google Sheets-in `Assessments` tabına yazılır
6. HR birbaşa Google Sheets-dən bütün nəticələri görür və ixrac edə bilər

---

## Təhlükəsizlik

- Admin paneli yoxdur — bütün admin idarəetməsi Google Sheets-dən edilir (Sheet-ə kimlər giriş edə bilər, onu siz idarə edirsiniz)
- Hər rəhbər yalnız öz tabeçiliyindəkiləri görür (Manager mail filtrləməsi)
- Data Google Sheets-dədir — Google-un öz backup sistemi qoruyur
- Version history Google Sheets-də avtomatikdir — heç bir data itirilmir
- Session brauzer bağlananda bitir (sessionStorage)

## Fayl strukturu

```
├── index.html           ← Login səhifəsi
├── dashboard.html       ← Komanda siyahısı
├── assessment.html      ← Qiymətləndirmə forması
├── css/style.css        ← Dark/Light mode dəstəkli
├── js/app.js            ← API, i18n, tema
├── vercel.json          ← Vercel konfiqurasiyası
├── google-apps-script.js← Google-a yapışdırılacaq kod
└── README.md
```
