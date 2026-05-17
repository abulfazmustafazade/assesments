// ══════════════════════════════════════════════════════
//  GOOGLE APPS SCRIPT — Qiymətləndirmə Sistemi Backend
//  Bu kodu Google Apps Script editor-a yapışdırın.
//  Deploy → New deployment → Web app → Anyone can access
// ══════════════════════════════════════════════════════

// Google Sheet-inizin ID-sini bura yazın (URL-dəki /d/XXXXXXX/edit hissəsi)
const SHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();

function getSheet(name) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  return ss.getSheetByName(name);
}

// ── Main Router ──
function doGet(e) {
  const action = e.parameter.action;
  let result;

  try {
    switch (action) {
      case 'login': result = handleLogin(e.parameter); break;
      case 'team': result = handleTeam(e.parameter); break;
      case 'questions': result = handleQuestions(); break;
      case 'answers': result = handleAnswers(e.parameter); break;
      case 'submit': result = handleSubmit(e.parameter); break;
      case 'stats': result = handleStats(); break;
      default: result = { error: 'Unknown action' };
    }
  } catch (err) {
    result = { error: err.message };
  }

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  return doGet(e);
}

// ── Login ──
function handleLogin(params) {
  const email = (params.email || '').trim().toLowerCase();
  const idCode = (params.idCode || '').trim();

  if (!email || !idCode) return { success: false, error: 'MISSING_FIELDS' };

  const sheet = getSheet('Employees');
  const data = sheet.getDataRange().getValues();
  const headers = data[0].map(h => String(h).trim().toLowerCase());

  const colIdx = {
    idCode: findCol(headers, ['id code', 'idcode', 'id_code', 'kod']),
    fullName: findCol(headers, ['full name', 'fullname', 'ad soyad', 'name']),
    managerMail: findCol(headers, ['manager mail', 'manager email', 'manageremail', 'rəhbər email']),
  };

  // Find the employee by ID Code
  let foundRow = null;
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][colIdx.idCode]).trim() === idCode) {
      foundRow = data[i];
      break;
    }
  }

  if (!foundRow) return { success: false, error: 'INVALID' };

  // Check if this person is a manager (their email appears as Manager mail somewhere)
  // We check if the provided email is used as Manager mail by any employee
  let isManager = false;
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][colIdx.managerMail]).trim().toLowerCase() === email) {
      isManager = true;
      break;
    }
  }

  if (!isManager) return { success: false, error: 'NOT_MANAGER' };

  return {
    success: true,
    email: email,
    name: String(foundRow[colIdx.fullName]).trim()
  };
}

// ── Get Team ──
function handleTeam(params) {
  const managerEmail = (params.email || '').trim().toLowerCase();
  if (!managerEmail) return { team: [] };

  const empSheet = getSheet('Employees');
  const data = empSheet.getDataRange().getValues();
  const headers = data[0].map(h => String(h).trim().toLowerCase());

  const col = {
    idCode: findCol(headers, ['id code', 'idcode', 'id_code', 'kod']),
    fullName: findCol(headers, ['full name', 'fullname', 'ad soyad', 'name']),
    managerMail: findCol(headers, ['manager mail', 'manager email', 'manageremail', 'rəhbər email']),
    jobTitle: findCol(headers, ['job title', 'jobtitle', 'vəzifə', 'position', 'title']),
    department: findCol(headers, ['department', 'şöbə', 'departament']),
    division: findCol(headers, ['division', 'bölmə']),
    company: findCol(headers, ['company', 'şirkət']),
  };

  // Get assessments to check completion
  const assessSheet = getSheet('Assessments');
  const assessData = assessSheet ? assessSheet.getDataRange().getValues() : [[]];
  const assessHeaders = assessData[0]?.map(h => String(h).trim().toLowerCase()) || [];
  const aColEval = findCol(assessHeaders, ['evaluator email', 'evaluator_email']);
  const aColEmp = findCol(assessHeaders, ['employee idcode', 'employee_idcode']);

  const questionsCount = getQuestionsCount();

  // Build set of completed assessments
  const evalCounts = {};
  for (let i = 1; i < assessData.length; i++) {
    const ev = String(assessData[i][aColEval] || '').toLowerCase();
    const emp = String(assessData[i][aColEmp] || '');
    if (ev === managerEmail) {
      const key = emp;
      evalCounts[key] = (evalCounts[key] || 0) + 1;
    }
  }

  const team = [];
  for (let i = 1; i < data.length; i++) {
    const mgrMail = String(data[i][col.managerMail] || '').trim().toLowerCase();
    if (mgrMail === managerEmail) {
      const idCode = String(data[i][col.idCode] || '').trim();
      team.push({
        idCode: idCode,
        fullName: String(data[i][col.fullName] || '').trim(),
        jobTitle: col.jobTitle >= 0 ? String(data[i][col.jobTitle] || '').trim() : '',
        department: col.department >= 0 ? String(data[i][col.department] || '').trim() : '',
        division: col.division >= 0 ? String(data[i][col.division] || '').trim() : '',
        company: col.company >= 0 ? String(data[i][col.company] || '').trim() : '',
        isComplete: (evalCounts[idCode] || 0) >= questionsCount
      });
    }
  }

  return { team };
}

// ── Get Questions ──
function handleQuestions() {
  const sheet = getSheet('Questions');
  if (!sheet) return { questions: [] };

  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return { questions: [] };

  const headers = data[0].map(h => String(h).trim().toLowerCase());
  const c = {
    id: findCol(headers, ['id']),
    textAZ: findCol(headers, ['text_az', 'sual_az', 'text az']),
    textEN: findCol(headers, ['text_en', 'sual_en', 'text en']),
    catAZ: findCol(headers, ['category_az', 'kateqoriya_az', 'category az']),
    catEN: findCol(headers, ['category_en', 'kateqoriya_en', 'category en']),
    o1az: findCol(headers, ['opt1_az', 'option1_az']),
    o1en: findCol(headers, ['opt1_en', 'option1_en']),
    o2az: findCol(headers, ['opt2_az', 'option2_az']),
    o2en: findCol(headers, ['opt2_en', 'option2_en']),
    o3az: findCol(headers, ['opt3_az', 'option3_az']),
    o3en: findCol(headers, ['opt3_en', 'option3_en']),
    o4az: findCol(headers, ['opt4_az', 'option4_az']),
    o4en: findCol(headers, ['opt4_en', 'option4_en']),
  };

  const questions = [];
  for (let i = 1; i < data.length; i++) {
    const r = data[i];
    const id = c.id >= 0 ? r[c.id] : i;
    if (!r[c.textAZ] && !r[c.textEN]) continue;

    questions.push({
      id: Number(id) || i,
      textAZ: s(r, c.textAZ),
      textEN: s(r, c.textEN),
      categoryAZ: s(r, c.catAZ),
      categoryEN: s(r, c.catEN),
      opts_az: [s(r, c.o1az), s(r, c.o2az), s(r, c.o3az), s(r, c.o4az)].filter(Boolean),
      opts_en: [s(r, c.o1en), s(r, c.o2en), s(r, c.o3en), s(r, c.o4en)].filter(Boolean),
    });
  }

  return { questions };
}

// ── Get Existing Answers ──
function handleAnswers(params) {
  const evaluatorEmail = (params.evaluatorEmail || '').toLowerCase();
  const employeeIdCode = params.employeeIdCode || '';

  const sheet = getSheet('Assessments');
  if (!sheet) return { answers: [] };

  const data = sheet.getDataRange().getValues();
  const headers = data[0].map(h => String(h).trim().toLowerCase());
  const c = {
    eval: findCol(headers, ['evaluator email', 'evaluator_email']),
    emp: findCol(headers, ['employee idcode', 'employee_idcode']),
    qId: findCol(headers, ['question id', 'question_id']),
    aIdx: findCol(headers, ['answer index', 'answer_index']),
  };

  const answers = [];
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][c.eval] || '').toLowerCase() === evaluatorEmail &&
        String(data[i][c.emp] || '') === employeeIdCode) {
      answers.push({
        questionId: Number(data[i][c.qId]) || 0,
        answerIndex: Number(data[i][c.aIdx]) || 0
      });
    }
  }

  return { answers };
}

// ── Submit Assessment ──
function handleSubmit(params) {
  const evaluatorEmail = (params.evaluatorEmail || '').toLowerCase();
  const evaluatorName = params.evaluatorName || '';
  const employeeIdCode = params.employeeIdCode || '';
  const employeeName = params.employeeName || '';
  const department = params.department || '';
  let answersJson;

  try {
    answersJson = JSON.parse(params.answers || '[]');
  } catch {
    return { success: false, error: 'Invalid answers format' };
  }

  if (!evaluatorEmail || !employeeIdCode || !answersJson.length) {
    return { success: false, error: 'Missing data' };
  }

  const sheet = getSheet('Assessments');
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    // Delete existing answers for this evaluator+employee pair
    const data = sheet.getDataRange().getValues();
    const headers = data[0].map(h => String(h).trim().toLowerCase());
    const cEval = findCol(headers, ['evaluator email', 'evaluator_email']);
    const cEmp = findCol(headers, ['employee idcode', 'employee_idcode']);

    // Find and delete old rows (from bottom up to avoid shifting issues)
    const rowsToDelete = [];
    for (let i = data.length - 1; i >= 1; i--) {
      if (String(data[i][cEval] || '').toLowerCase() === evaluatorEmail &&
          String(data[i][cEmp] || '') === employeeIdCode) {
        rowsToDelete.push(i + 1); // Sheet rows are 1-indexed
      }
    }
    rowsToDelete.forEach(row => sheet.deleteRow(row));

    // Get question texts for readable output
    const qSheet = getSheet('Questions');
    const qData = qSheet.getDataRange().getValues();
    const qHeaders = qData[0].map(h => String(h).trim().toLowerCase());
    const qIdCol = findCol(qHeaders, ['id']);
    const qTextCol = findCol(qHeaders, ['text_az', 'sual_az', 'text az']);
    const qOptCols = [
      findCol(qHeaders, ['opt1_az', 'option1_az']),
      findCol(qHeaders, ['opt2_az', 'option2_az']),
      findCol(qHeaders, ['opt3_az', 'option3_az']),
      findCol(qHeaders, ['opt4_az', 'option4_az']),
    ];

    const qMap = {};
    for (let i = 1; i < qData.length; i++) {
      const id = Number(qData[i][qIdCol]) || i;
      qMap[id] = {
        text: s(qData[i], qTextCol),
        opts: qOptCols.map(c => s(qData[i], c))
      };
    }

    // Write new answers
    const timestamp = new Date().toISOString();
    answersJson.forEach(a => {
      const q = qMap[a.qId] || {};
      const answerText = (q.opts || [])[a.aIdx] || '';
      sheet.appendRow([
        timestamp,
        evaluatorEmail,
        evaluatorName,
        employeeIdCode,
        employeeName,
        department,
        a.qId,
        q.text || '',
        a.aIdx,
        answerText
      ]);
    });

  } finally {
    lock.releaseLock();
  }

  return { success: true };
}

// ── Stats (for admin/reporting) ──
function handleStats() {
  const empSheet = getSheet('Employees');
  const empCount = empSheet ? Math.max(0, empSheet.getLastRow() - 1) : 0;

  const assessSheet = getSheet('Assessments');
  const assessCount = assessSheet ? Math.max(0, assessSheet.getLastRow() - 1) : 0;

  const qCount = getQuestionsCount();

  return { employees: empCount, assessments: assessCount, questions: qCount };
}

// ── Helpers ──
function findCol(headers, aliases) {
  for (let i = 0; i < headers.length; i++) {
    if (aliases.includes(headers[i])) return i;
  }
  return -1;
}

function s(row, colIdx) {
  if (colIdx < 0 || colIdx >= row.length) return '';
  return String(row[colIdx] || '').trim();
}

function getQuestionsCount() {
  const sheet = getSheet('Questions');
  if (!sheet) return 0;
  return Math.max(0, sheet.getLastRow() - 1);
}
