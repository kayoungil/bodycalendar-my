const APP_CONFIG = window.BODYCALENDAR_CONFIG || {};
const _APP_NAME = APP_CONFIG.appName || '가영일 바디캘린더';
const _API_PREFIX = APP_CONFIG.storagePrefix || 'gayeongil_bodycalendar';
const _LOCAL_KEY = `${_API_PREFIX}_store_v1`;
const _SEED_KEY = `${_API_PREFIX}_seeded_v1`;
const _SYNC_CHANNEL = `${_API_PREFIX}-sync`;
const _RTDB = APP_CONFIG.firebaseBaseUrl || 'https://YOUR-PROJECT-ID-default-rtdb.firebaseio.com';
const _REMOTE_ENABLED = /^https:\/\/.+\.firebaseio\.com\/?$/.test(_RTDB) && !_RTDB.includes('YOUR-PROJECT-ID');

function _readLocalStore() {
  try {
    const raw = localStorage.getItem(_LOCAL_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function _writeLocalStore(store) {
  try {
    localStorage.setItem(_LOCAL_KEY, JSON.stringify(store));
  } catch (e) {
    console.warn('localStorage 저장 실패:', e);
  }
}

let LOCAL_STORE = _readLocalStore();
const SYNC_LISTENERS = new Set();
let SYNC_BROADCAST = null;

function _emitSync(payload = {}) {
  const message = { ts: Date.now(), ...payload };
  SYNC_LISTENERS.forEach(fn => {
    try { fn(message); } catch (e) { console.error('sync listener failed', e); }
  });
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      if (!SYNC_BROADCAST) SYNC_BROADCAST = new BroadcastChannel(_SYNC_CHANNEL);
      SYNC_BROADCAST.postMessage(message);
    }
  } catch {
    // ignore
  }
}

function _normalizeCollection(value) {
  if (!value) return {};
  if (Array.isArray(value)) {
    return Object.fromEntries(value.filter(item => item && item.id).map(item => [item.id, item]));
  }
  return value;
}

function _getLocal(path) {
  const parts = path.split('/');
  let cur = LOCAL_STORE;
  for (const part of parts) {
    if (cur == null || typeof cur !== 'object') return null;
    cur = cur[part];
  }
  return cur === undefined ? null : cur;
}

function _setLocal(path, data) {
  const parts = path.split('/');
  const root = parts[0];
  if (parts.length === 1) {
    LOCAL_STORE[root] = data;
    _writeLocalStore(LOCAL_STORE);
    return;
  }

  if (!LOCAL_STORE[root] || typeof LOCAL_STORE[root] !== 'object') LOCAL_STORE[root] = {};
  let cur = LOCAL_STORE[root];
  for (let i = 1; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!cur[part] || typeof cur[part] !== 'object') cur[part] = {};
    cur = cur[part];
  }
  cur[parts[parts.length - 1]] = data;
  _writeLocalStore(LOCAL_STORE);
}

function _delLocal(path) {
  const parts = path.split('/');
  const root = parts[0];
  if (parts.length === 1) {
    delete LOCAL_STORE[root];
    _writeLocalStore(LOCAL_STORE);
    return;
  }

  let cur = LOCAL_STORE[root];
  if (!cur || typeof cur !== 'object') return;
  for (let i = 1; i < parts.length - 1; i++) {
    cur = cur[parts[i]];
    if (!cur || typeof cur !== 'object') return;
  }
  delete cur[parts[parts.length - 1]];
  _writeLocalStore(LOCAL_STORE);
}

function _apiPath(path) {
  return `${_RTDB}/${_API_PREFIX}/${path}.json`;
}

function _tryRemote(path, options) {
  if (!_REMOTE_ENABLED) return Promise.resolve(null);
  return fetch(_apiPath(path), options);
}

// ── 기본 운동 DB ─────────────────────────────────────────────
const EXERCISE_DB = {
  '하체': ['스쿼트','프론트 스쿼트','고블릿 스쿼트','수모 스쿼트','핵 스쿼트','씨씨 스쿼트','스미스 스쿼트','박스 스쿼트','레그프레스','핵 레그프레스','레그컬','레그익스텐션','루마니안 데드리프트','싱글레그 데드리프트','힙쓰러스트','바벨 힙쓰러스트','글루트 브릿지','런지','리버스 런지','워킹 런지','불가리안 스플릿 스쿼트','스텝업','점프스쿼트','사이드스텝','박스 점프','카프레이즈','시티드 카프레이즈','레그 어브덕션','레그 어덕션','힙 어브덕션 머신','힙 어덕션 머신','글루트 킥백','사이드 런지','월 스쿼트','래터럴 밴드 워크'],
  '가슴': ['벤치프레스','인클라인 벤치프레스','디클라인 벤치프레스','클로즈그립 벤치프레스','덤벨 벤치프레스','인클라인 덤벨 프레스','덤벨 플라이','인클라인 덤벨 플라이','케이블 크로스오버','로우 케이블 플라이','하이 케이블 플라이','체스트 프레스 머신','펙덱 플라이','딥스','푸시업','와이드 푸시업','인클라인 푸시업','덤벨 풀오버'],
  '등': ['데드리프트','루마니안 데드리프트','풀업','친업','클로즈그립 풀업','랫풀다운','클로즈그립 랫풀다운','리버스 그립 랫풀다운','시티드 케이블 로우','클로즈그립 로우','바벨 로우','언더그립 바벨 로우','원암 덤벨 로우','티바 로우','벤트오버 레터럴 레이즈','리버스 플라이','슈러그','굿모닝','백 익스텐션','하이퍼익스텐션','덤벨 풀오버'],
  '어깨': ['오버헤드 바벨 프레스','덤벨 숄더프레스','아놀드 프레스','머신 숄더프레스','스미스 숄더프레스','사이드 레터럴 레이즈','케이블 레터럴 레이즈','밴드 레터럴 레이즈','프론트 레이즈','케이블 프론트 레이즈','리어 델트 플라이','케이블 리어 델트','벤트오버 레터럴 레이즈','업라이트 로우','케이블 업라이트 로우'],
  '팔': ['바벨 컬','덤벨 컬','해머 컬','인클라인 덤벨 컬','프리처 컬','케이블 컬','리버스 컬','밴드 컬','21s 컬','컨센트레이션 컬','트라이셉스 푸시다운','V바 푸시다운','로프 푸시다운','오버헤드 트라이셉스 익스텐션','스컬크러셔','클로즈그립 벤치프레스','킥백','케이블 킥백'],
  '복부': ['플랭크','사이드 플랭크','크런치','리버스 크런치','바이시클 크런치','레그레이즈','행잉 레그레이즈','힐터치','토터치','싯업','V업','러시안 트위스트','케이블 크런치','드래곤 플래그','에브 휠 롤아웃','풍차'],
  '코어': ['데드버그','버드독','암워킹','마운틴 클라이머','슈퍼맨','글루트 브릿지 싱글','팔로프 프레스','케이블 우드찹','롤아웃','터키시 겟업','TRX 파이크','스위스볼 플랭크','할로우 바디홀드','L싯','베어 크롤','코펜하겐 플랭크'],
  '기능성': ['점핑잭','점프스쿼트','사이드스텝','암워킹','케틀벨 스윙','케틀벨 클린','케틀벨 스내치','케틀벨 고블릿 스쿼트','파워 클린','클린 앤 저크','스내치','배틀로프','메디신볼 슬램','메디신볼 로테이션','파머스워크','슬레드 푸시','슬레드 풀','타이어 플립','버피','점프 스쿼트','박스 점프','래터럴 점프','TRX 로우','TRX 체스트프레스','밴드 몬스터워크'],
  '유산소': ['트레드밀','싸이클','에어바이크','로잉머신','스텝밀','일립티컬','스키에르그','줄넘기','스피닝','계단오르기','배틀로프 인터벌'],
  '스트레칭': ['폼롤러 허벅지','폼롤러 종아리','폼롤러 등','폼롤러 IT밴드','고관절 굴곡근 스트레칭','햄스트링 스트레칭','사두근 스트레칭','흉추 스트레칭','어깨 스트레칭','가슴 스트레칭','고양이 낙타 자세','차일드 포즈','피전 포즈','라잉 글루트 스트레칭','월 스트레칭']
};
// 전체 종목 이름 배열 (기본 + 커스텀)
function getAllExerciseNames() {
  const base = Object.values(EXERCISE_DB).flat();
  const custom = (typeof CACHE !== 'undefined' ? CACHE.custom_exercises || [] : []).map(e => e.name);
  return [...new Set([...base, ...custom])];
}

async function _get(path) {
  try {
    const res = await _tryRemote(path);
    if (!res) return _getLocal(path);
    if (!res.ok) throw new Error(`읽기 실패 (${res.status})`);
    const data = await res.json();
    if (data !== null && data !== undefined) _setLocal(path, data);
    return data;
  } catch (e) {
    const local = _getLocal(path);
    if (local !== null) return local;
    if (path === 'config') return null;
    throw e;
  }
}
function _set(path, data) {
  _setLocal(path, data);
  _tryRemote(path, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).catch(e => console.error('저장 실패:', path, e));
  _emitSync({ path, type: 'set' });
}
function _del(path) {
  _delLocal(path);
  _tryRemote(path, { method: 'DELETE' })
    .catch(e => console.error('삭제 실패:', path, e));
  _emitSync({ path, type: 'delete' });
}
function _toArr(obj) { return obj ? Object.values(obj) : []; }

const CACHE = {
  members: [], sessions: [], schedules: [],
  pt_packages: [], weight_logs: [], routines: [], notices: [],
  pkg_templates: [], personal_logs: [], custom_exercises: [], weekly_checkins: [],
  admin_pw: '0000'
};

function _routineOneRmKey(name = '') {
  const baseName = String(name || '').replace(/^[A-Z]\d\.\s*/, '').trim();
  if (/스쿼트|프론트 스쿼트|오버헤드 스쿼트|레그프레스/.test(baseName)) return 'squat';
  if (/벤치프레스|인클라인 벤치|덤벨 프레스|푸쉬업/.test(baseName)) return 'bench';
  if (/컨벤셔널 데드리프트|컨벤셔널|컨벤션|데드리프트$|^데드리프트$|바벨 데드리프트|클린 풀|스내치 풀/.test(baseName) && !/루마니안/.test(baseName)) return 'deadlift';
  if (/오버헤드|숄더프레스|밀리터리/.test(baseName)) return 'press';
  if (/스내치/.test(baseName)) return 'snatch';
  if (/클린|저크/.test(baseName)) return 'cleanJerk';
  return '';
}

function _normalizeExerciseName(name = '') {
  return /페이스풀/.test(name) ? '벤트오버 레터럴 레이즈' : name;
}

function _duplicateExerciseKey(name = '') {
  const baseName = String(name || '').replace(/^[A-Z]\d\.\s*/, '').trim();
  if (/^(데드리프트|컨벤셔널 데드리프트|바벨 데드리프트)$/.test(baseName)) return 'deadlift';
  return baseName;
}

function _roundHalf(value) {
  return Math.round(value / 2.5) * 2.5;
}

function _bigThreeKey(name = '') {
  const baseName = String(name || '').replace(/^[A-Z]\d\.\s*/, '').trim();
  if (/^스쿼트$/.test(baseName)) return 'squat';
  if (/^벤치프레스$/.test(baseName)) return 'bench';
  if (/^(컨벤셔널 데드리프트|데드리프트)$/.test(baseName) && !/루마니안/.test(baseName)) return 'deadlift';
  return '';
}

function _bigThreeStrengthWeeks() {
  return [
    { week: 1, focus: '적응/기술', percent: 75, reps: '6-8', rpe: 'RPE 7', volume: '중간 볼륨' },
    { week: 2, focus: '볼륨 축적', percent: 77.5, reps: '6-8', rpe: 'RPE 7-8', volume: '중간 볼륨' },
    { week: 3, focus: '강도 상승', percent: 80, reps: '5-6', rpe: 'RPE 8', volume: '중간 볼륨' },
    { week: 4, focus: '강도 축적', percent: 82.5, reps: '5-6', rpe: 'RPE 8', volume: '중간 볼륨' },
    { week: 5, focus: '고강도 진입', percent: 85, reps: '5', rpe: 'RPE 8', volume: '낮은-중간 볼륨' },
    { week: 6, focus: '고강도 축적', percent: 87.5, reps: '5', rpe: 'RPE 8-9', volume: '낮은 볼륨' },
    { week: 7, focus: '피크 준비', percent: 90, reps: '2-4', rpe: 'RPE 9', volume: '낮은 볼륨' },
    { week: 8, focus: '피크/확인', percent: 92.5, reps: '2-4', rpe: 'RPE 9', volume: '매우 낮은 볼륨' }
  ];
}

function _isProgressiveHypertrophyAccessory(name = '', unit = 'weight') {
  if (unit === 'time') return false;
  if (_isKettlebellExerciseName(name)) return false;
  if (_bigThreeKey(name)) return false;
  if (_isBodyweightExerciseName(name)) return false;
  if (/버드독|데드버그|플랭크|월슬라이드|밴드 외회전|스트레칭|폼롤러|싸이클|사이클|트레드밀|로잉머신/.test(name)) return false;
  return true;
}

function _isKettlebellExerciseName(name = '') {
  return /케틀벨|캐틀벨/.test(name);
}

function _isBodyweightExerciseName(name = '') {
  return /암워킹|점핑잭|점프스쿼트|점프 스쿼트|사이드스텝|스텝업|버피|마운틴 클라이머|베어 크롤|푸시업|푸쉬업|딥스|풀업|플랭크|데드버그|버드독|글루트 브릿지|클램쉘|월슬라이드|앵클 모빌리티|흉추 회전|스트레칭|폼롤러/.test(name);
}

function _bodyweightVolumeLabel(name = '') {
  if (/버드독|데드버그|플랭크|암워킹|행잉|할로우|L싯|롤아웃/.test(name)) return '코어 안정화';
  if (/점핑잭|점프|사이드스텝|버피|마운틴 클라이머|베어 크롤/.test(name)) return '컨디셔닝';
  if (/월슬라이드|앵클|흉추|스트레칭|폼롤러|클램쉘|글루트 브릿지/.test(name)) return '움직임 준비';
  return '기능성 보조';
}

function _bodyweightFocusLabel(name = '') {
  if (/버드독|데드버그|플랭크|암워킹|행잉|할로우|L싯|롤아웃/.test(name)) return '코어 안정화';
  if (/점핑잭|점프|사이드스텝|버피|마운틴 클라이머|베어 크롤/.test(name)) return '컨디셔닝';
  if (/월슬라이드|앵클|흉추|스트레칭|폼롤러|클램쉘|글루트 브릿지/.test(name)) return '움직임 준비';
  return '기능성 패턴';
}

function _normalizeRoutineProgramData(routine) {
  if (!routine || !Array.isArray(routine.exercises)) return routine;
  let changed = false;
  const member = routine.memberId ? CACHE.members.find(m => m.id === routine.memberId) : null;
  const oneRms = { ...(member?.oneRms || {}), ...(routine.oneRms || {}) };
  routine.exercises = routine.exercises.map(ex => {
    if (!ex) return ex;
    const next = { ...ex };
    const normalizedName = _normalizeExerciseName(next.name || '');
    const conventionalDeadliftName = /^(데드리프트|컨벤셔널 데드리프트)$/;
    if (normalizedName !== next.name) {
      next.name = normalizedName;
      changed = true;
    }
    if (conventionalDeadliftName.test(next.name || '')) {
      if (next.name !== '컨벤셔널 데드리프트') {
        next.name = '컨벤셔널 데드리프트';
        changed = true;
      }
    }
    if (Array.isArray(next.weeklyLoads)) {
      next.weeklyLoads = next.weeklyLoads.map(load => {
        const normalizedLoadName = _normalizeExerciseName(load?.exerciseName || '');
        const loadName = normalizedLoadName || load?.exerciseName || next.name || '';
        if (_isBodyweightExerciseName(next.name || '') || _isBodyweightExerciseName(loadName)) {
          const volume = /근비대/.test(load?.volume || '') ? _bodyweightVolumeLabel(loadName) : load?.volume;
          const focus = /점진|과부하|볼륨|강도|피크/.test(load?.focus || '') ? _bodyweightFocusLabel(loadName) : (load?.focus || _bodyweightFocusLabel(loadName));
          changed = changed || volume !== load?.volume || focus !== load?.focus || load?.weight || load?.percent;
          return { ...load, exerciseName: normalizedLoadName || load.exerciseName, focus, volume, weight: '', percent: '' };
        }
        if (_bigThreeKey(loadName)) {
          changed = changed || /루마니안/.test(loadName) || /루마니안/.test(next.name || '') || load.exerciseName !== '컨벤셔널 데드리프트';
          return {
            ...load,
            exerciseName: '컨벤셔널 데드리프트',
            focus: load?.focus || '적응/기술',
            volume: load?.volume || '중간 볼륨'
          };
        }
        if (_isKettlebellExerciseName(next.name || '') || _isKettlebellExerciseName(normalizedLoadName)) {
          changed = true;
          return { ...load, exerciseName: normalizedLoadName || load.exerciseName, weight: '', percent: '' };
        }
        if (load?.exerciseName && normalizedLoadName !== load.exerciseName) {
          changed = true;
          return { ...load, exerciseName: normalizedLoadName };
        }
        return load;
      });
    }
    const bigThreeKey = _bigThreeKey(next.name || '');
    const isAccessory = _isProgressiveHypertrophyAccessory(next.name || '', next.unit);
    if (!bigThreeKey && !isAccessory) return next;

    const key = bigThreeKey || _routineOneRmKey(next.name);
    const oneRm = key ? parseFloat(oneRms[key]) : 0;
    const existingLoads = Array.isArray(next.weeklyLoads) ? next.weeklyLoads : [];
    const firstWeekWeight = parseFloat(existingLoads.find(w => w?.week === 1)?.weight);
    const firstSetWeight = parseFloat((next.sets || []).find(s => parseFloat(s?.weight) > 0)?.weight);
    const baseWeight = firstWeekWeight > 0 ? firstWeekWeight : firstSetWeight;

    const preserved = new Map(existingLoads.map(w => [w.week, w]));
    const planSource = bigThreeKey
      ? _bigThreeStrengthWeeks()
      : Array.from({ length: 8 }, (_, i) => ({
        week: i + 1,
        focus: `${i + 1}주차 점진 과부하`,
        percent: '',
        reps: '10-12',
        rpe: i < 4 ? 'RPE 7-8' : 'RPE 8-9',
        volume: '근비대 볼륨'
      }));
    next.weeklyLoads = planSource.map(plan => {
      const old = preserved.get(plan.week) || {};
      const autoWeight = bigThreeKey && oneRm > 0
        ? String(_roundHalf(oneRm * plan.percent / 100))
        : baseWeight > 0 ? String(_roundHalf(baseWeight + (plan.week - 1) * 2.5)) : (old.weight || '');
      return {
        ...old,
        week: plan.week,
        focus: plan.focus,
        rpe: plan.rpe,
        volume: old.manual && old.volume ? old.volume : plan.volume,
        percent: plan.percent,
        reps: old.manual && old.reps ? old.reps : plan.reps,
        weight: old.manual && old.weight ? old.weight : autoWeight,
        exerciseName: _normalizeExerciseName(old.exerciseName || next.name)
      };
    });
    changed = true;
    return next;
  }).filter((ex, index, list) => {
    const key = _duplicateExerciseKey(ex?.name || '');
    if (!key) return true;
    const firstIndex = list.findIndex(item => _duplicateExerciseKey(item?.name || '') === key);
    const keep = firstIndex === index;
    changed = changed || !keep;
    return keep;
  });
  routine.__normalized = changed;
  return routine;
}

function _normalizeAllRoutines() {
  CACHE.routines = CACHE.routines.map(routine => {
    const normalized = _normalizeRoutineProgramData(routine);
    if (normalized.__normalized) {
      delete normalized.__normalized;
      _set(`routines/${normalized.id}`, normalized);
    }
    return normalized;
  });
  _dedupeProgramConventionalDeadlifts();
}

function _programRoutineGroupKey(routine = {}) {
  if (!routine.programTitle) return '';
  return `${routine.memberId || ''}::${routine.programTitle}`;
}

function _dedupeProgramConventionalDeadlifts() {
  const seenByProgram = new Set();
  CACHE.routines.forEach(routine => {
    const groupKey = _programRoutineGroupKey(routine);
    if (!groupKey || !Array.isArray(routine.exercises)) return;
    const before = routine.exercises.length;
    routine.exercises = routine.exercises.filter(ex => {
      const key = _duplicateExerciseKey(ex?.name || '');
      if (key !== 'deadlift') return true;
      const seenKey = `${groupKey}::${key}`;
      if (seenByProgram.has(seenKey)) return false;
      seenByProgram.add(seenKey);
      return true;
    });
    if (routine.exercises.length !== before) _set(`routines/${routine.id}`, routine);
  });
}

const DB = {
  async init() {
    const [members, sessions, schedules, pt_packages, weight_logs, routines, notices, pkg_templates, personal_logs, custom_exercises, weekly_checkins, config] = await Promise.all([
      _get('members'), _get('sessions'), _get('schedules'),
      _get('pt_packages'), _get('weight_logs'), _get('routines'),
      _get('notices'), _get('pkg_templates'), _get('personal_logs'), _get('custom_exercises'), _get('weekly_checkins'), _get('config')
    ]);
    CACHE.members          = _toArr(members);
    CACHE.sessions         = _toArr(sessions);
    CACHE.schedules        = _toArr(schedules);
    CACHE.pt_packages      = _toArr(pt_packages);
    CACHE.weight_logs      = _toArr(weight_logs);
    CACHE.routines         = _toArr(routines);
    CACHE.notices          = _toArr(notices);
    CACHE.pkg_templates    = _toArr(pkg_templates);
    CACHE.personal_logs    = _toArr(personal_logs);
    CACHE.custom_exercises = _toArr(custom_exercises);
    CACHE.weekly_checkins  = _toArr(weekly_checkins);
    CACHE.admin_pw         = config?.admin_pw || '0000';
    _normalizeAllRoutines();

    const hasAnyData = [
      CACHE.members, CACHE.sessions, CACHE.schedules, CACHE.pt_packages,
      CACHE.weight_logs, CACHE.routines, CACHE.notices, CACHE.pkg_templates,
      CACHE.personal_logs, CACHE.custom_exercises, CACHE.weekly_checkins
    ].some(arr => Array.isArray(arr) && arr.length > 0);

    if (!hasAnyData && !LOCAL_STORE[_SEED_KEY]) {
      this.seedDemoData();
      LOCAL_STORE[_SEED_KEY] = true;
      _writeLocalStore(LOCAL_STORE);
      _emitSync({ type: 'seed' });
    }
  },

  onChange(fn) {
    SYNC_LISTENERS.add(fn);
    return () => SYNC_LISTENERS.delete(fn);
  },

  uuid() { return Date.now().toString(36) + Math.random().toString(36).substr(2); },

  getAdminPw() { return CACHE.admin_pw; },
  setAdminPw(pw) { CACHE.admin_pw = pw; _set('config/admin_pw', pw); },

  // 회원
  getMembers() { return CACHE.members; },
  getMember(id) { return CACHE.members.find(m => m.id === id); },
  getMemberByName(name) { return CACHE.members.find(m => m.name === name); },
  addMember(data) {
    const m = { id: this.uuid(), joinDate: new Date().toISOString().split('T')[0], ...data };
    CACHE.members.push(m); _set(`members/${m.id}`, m); return m;
  },
  updateMember(id, updates) {
    const i = CACHE.members.findIndex(m => m.id === id);
    if (i !== -1) { CACHE.members[i] = { ...CACHE.members[i], ...updates }; _set(`members/${id}`, CACHE.members[i]); }
  },
  deleteMember(id) {
    ['sessions','schedules','pt_packages','weight_logs'].forEach(col => {
      CACHE[col].filter(r => r.memberId === id).forEach(r => _del(`${col}/${r.id}`));
    });
    _del(`members/${id}`);
    CACHE.members     = CACHE.members.filter(m => m.id !== id);
    CACHE.sessions    = CACHE.sessions.filter(s => s.memberId !== id);
    CACHE.schedules   = CACHE.schedules.filter(s => s.memberId !== id);
    CACHE.pt_packages = CACHE.pt_packages.filter(p => p.memberId !== id);
    CACHE.weight_logs = CACHE.weight_logs.filter(w => w.memberId !== id);
  },

  // 세션
  getSessions() { return CACHE.sessions; },
  getSession(id) { return CACHE.sessions.find(s => s.id === id); },
  getMemberSessions(memberId) { return CACHE.sessions.filter(s => s.memberId === memberId).sort((a,b) => b.date.localeCompare(a.date)); },
  getDateSessions(date) { return CACHE.sessions.filter(s => s.date === date); },
  getMonthSessions(y, m) { const p=`${y}-${String(m).padStart(2,'0')}`; return CACHE.sessions.filter(s=>s.date.startsWith(p)); },
  addSession(data) {
    const s = { id: this.uuid(), exercises: [], ...data };
    CACHE.sessions.push(s); _set(`sessions/${s.id}`, s);
    const sch = CACHE.schedules.find(sc => sc.memberId === data.memberId && sc.date === data.date);
    if (sch) this.updateSchedule(sch.id, { status: 'completed' });
    return s;
  },
  updateSession(id, updates) {
    const i = CACHE.sessions.findIndex(s => s.id === id);
    if (i !== -1) { CACHE.sessions[i] = { ...CACHE.sessions[i], ...updates }; _set(`sessions/${id}`, CACHE.sessions[i]); }
  },
  deleteSession(id) { CACHE.sessions = CACHE.sessions.filter(s => s.id !== id); _del(`sessions/${id}`); },

  // 일정
  getSchedules() { return CACHE.schedules; },
  getMemberSchedules(memberId) { return CACHE.schedules.filter(s => s.memberId === memberId); },
  getDateSchedules(date) { return CACHE.schedules.filter(s => s.date === date); },
  getMonthSchedules(y, m) { const p=`${y}-${String(m).padStart(2,'0')}`; return CACHE.schedules.filter(s=>s.date.startsWith(p)); },
  addSchedule(data) {
    const s = { id: this.uuid(), status: 'scheduled', ...data };
    CACHE.schedules.push(s); _set(`schedules/${s.id}`, s); return s;
  },
  updateSchedule(id, updates) {
    const i = CACHE.schedules.findIndex(s => s.id === id);
    if (i !== -1) { CACHE.schedules[i] = { ...CACHE.schedules[i], ...updates }; _set(`schedules/${id}`, CACHE.schedules[i]); }
  },
  deleteSchedule(id) { CACHE.schedules = CACHE.schedules.filter(s => s.id !== id); _del(`schedules/${id}`); },

  // PT 패키지
  getPtPackages() { return CACHE.pt_packages; },
  getMemberPtPackages(memberId) { return CACHE.pt_packages.filter(p => p.memberId === memberId).sort((a,b) => b.purchaseDate.localeCompare(a.purchaseDate)); },
  getActivePtPackage(memberId) { return this.getMemberPtPackages(memberId).find(p => p.active); },
  addPtPackage(data) {
    CACHE.pt_packages.forEach(p => { if (p.memberId === data.memberId && p.active) { p.active = false; _set(`pt_packages/${p.id}`, p); } });
    const pkg = { id: this.uuid(), active: true, ...data };
    CACHE.pt_packages.push(pkg); _set(`pt_packages/${pkg.id}`, pkg); return pkg;
  },
  updatePtPackage(id, updates) {
    const i = CACHE.pt_packages.findIndex(p => p.id === id);
    if (i !== -1) { CACHE.pt_packages[i] = { ...CACHE.pt_packages[i], ...updates }; _set(`pt_packages/${id}`, CACHE.pt_packages[i]); }
  },
  deletePtPackage(id) { CACHE.pt_packages = CACHE.pt_packages.filter(p => p.id !== id); _del(`pt_packages/${id}`); },
  getPtRemaining(memberId) {
    const pkg = this.getActivePtPackage(memberId); if (!pkg) return null;
    const used = CACHE.sessions.filter(s => s.memberId === memberId && s.attendance !== false && s.date >= pkg.purchaseDate).length;
    return { total: pkg.total, used, remaining: Math.max(0, pkg.total - used), pkg };
  },

  // 체중 기록
  getWeightLogs() { return CACHE.weight_logs; },
  getMemberWeightLogs(memberId) { return CACHE.weight_logs.filter(w => w.memberId === memberId).sort((a,b) => a.date.localeCompare(b.date)); },
  addWeightLog(data) {
    const ei = CACHE.weight_logs.findIndex(w => w.memberId === data.memberId && w.date === data.date);
    if (ei !== -1) { CACHE.weight_logs[ei] = { ...CACHE.weight_logs[ei], ...data }; _set(`weight_logs/${CACHE.weight_logs[ei].id}`, CACHE.weight_logs[ei]); return CACHE.weight_logs[ei]; }
    const log = { id: this.uuid(), ...data }; CACHE.weight_logs.push(log); _set(`weight_logs/${log.id}`, log); return log;
  },
  deleteWeightLog(id) { CACHE.weight_logs = CACHE.weight_logs.filter(w => w.id !== id); _del(`weight_logs/${id}`); },

  // 루틴
  getRoutines() { return CACHE.routines; },
  getRoutine(id) { return CACHE.routines.find(r => r.id === id); },
  addRoutine(data) {
    const r = _normalizeRoutineProgramData({ id: this.uuid(), ...data });
    delete r.__normalized;
    CACHE.routines.push(r); _set(`routines/${r.id}`, r); return r;
  },
  updateRoutine(id, updates) {
    const i = CACHE.routines.findIndex(r => r.id === id);
    if (i !== -1) {
      CACHE.routines[i] = _normalizeRoutineProgramData({ ...CACHE.routines[i], ...updates });
      delete CACHE.routines[i].__normalized;
      _set(`routines/${id}`, CACHE.routines[i]);
    }
  },
  deleteRoutine(id) { CACHE.routines = CACHE.routines.filter(r => r.id !== id); _del(`routines/${id}`); },

  // 공지사항
  getNotices() { return CACHE.notices; },
  getNotice(id) { return CACHE.notices.find(n => n.id === id); },
  addNotice(data) {
    const n = { id: this.uuid(), date: new Date().toISOString().split('T')[0], pinned: false, ...data };
    CACHE.notices.unshift(n); _set(`notices/${n.id}`, n); return n;
  },
  updateNotice(id, updates) {
    const i = CACHE.notices.findIndex(n => n.id === id);
    if (i !== -1) { CACHE.notices[i] = { ...CACHE.notices[i], ...updates }; _set(`notices/${id}`, CACHE.notices[i]); }
  },
  deleteNotice(id) { CACHE.notices = CACHE.notices.filter(n => n.id !== id); _del(`notices/${id}`); },

  // 인증
  loginAdmin(pw) { if (pw === CACHE.admin_pw) { sessionStorage.setItem('bc_role','admin'); return true; } return false; },
  loginMember(name, pw) {
    const m = this.getMemberByName(name);
    if (m && m.password === pw) { sessionStorage.setItem('bc_role','member'); sessionStorage.setItem('bc_member_id',m.id); return m; }
    return null;
  },
  logout() { sessionStorage.removeItem('bc_role'); sessionStorage.removeItem('bc_member_id'); },
  getRole() { return sessionStorage.getItem('bc_role'); },
  getCurrentMemberId() { return sessionStorage.getItem('bc_member_id'); },

  // 통계
  getMemberStats(memberId) {
    const sessions = this.getMemberSessions(memberId), schedules = this.getMemberSchedules(memberId);
    const now = new Date();
    const thisMonth = sessions.filter(s => s.date.startsWith(`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`));
    const attended = sessions.filter(s => s.attendance !== false).length;
    return { total: sessions.length, thisMonth: thisMonth.length, attendance: sessions.length>0?Math.round(attended/sessions.length*100):0, upcomingCount: schedules.filter(s=>s.status==='scheduled'&&s.date>=now.toISOString().split('T')[0]).length };
  },
  getExerciseStats(memberId) {
    const stats = {};
    this.getMemberSessions(memberId).forEach(s => {
      (s.exercises||[]).forEach(e => {
        if (!stats[e.name]) stats[e.name] = { name:e.name, maxWeight:0, totalSets:0, count:0 };
        stats[e.name].count++; stats[e.name].totalSets += (e.sets||[]).length;
        (e.sets||[]).forEach(set => { const w=parseFloat(set.weight)||0; if(w>stats[e.name].maxWeight) stats[e.name].maxWeight=w; });
      });
    });
    return Object.values(stats).sort((a,b) => b.count-a.count);
  },

  // 주차별 컨디션 체크
  getWeeklyCheckins() { return CACHE.weekly_checkins; },
  getMemberWeeklyCheckins(memberId) { return CACHE.weekly_checkins.filter(c => c.memberId === memberId); },
  getWeeklyCheckin(memberId, weekStart) { return CACHE.weekly_checkins.find(c => c.memberId === memberId && c.weekStart === weekStart); },
  setWeeklyCheckin(memberId, weekStart, condition, memo='') {
    const existing = this.getWeeklyCheckin(memberId, weekStart);
    if (existing) {
      const i = CACHE.weekly_checkins.findIndex(c => c.id === existing.id);
      CACHE.weekly_checkins[i] = { ...existing, condition, memo };
      _set(`weekly_checkins/${existing.id}`, CACHE.weekly_checkins[i]);
      return CACHE.weekly_checkins[i];
    }
    const c = { id: this.uuid(), memberId, weekStart, condition, memo, updatedAt: new Date().toISOString() };
    CACHE.weekly_checkins.push(c); _set(`weekly_checkins/${c.id}`, c); return c;
  },

  // 커스텀 운동 종목
  getCustomExercises() { return CACHE.custom_exercises; },
  addCustomExercise(name, category='기타') {
    if (CACHE.custom_exercises.find(e => e.name === name)) return null;
    const e = { id: this.uuid(), name: name.trim(), category };
    CACHE.custom_exercises.push(e); _set(`custom_exercises/${e.id}`, e); return e;
  },
  deleteCustomExercise(id) { CACHE.custom_exercises = CACHE.custom_exercises.filter(e => e.id !== id); _del(`custom_exercises/${id}`); },

  // 개인 운동 기록
  getPersonalLogs() { return CACHE.personal_logs; },
  getMemberPersonalLogs(memberId) { return CACHE.personal_logs.filter(l => l.memberId === memberId).sort((a,b) => b.date.localeCompare(a.date)); },
  addPersonalLog(data) { const l = { id: this.uuid(), createdAt: new Date().toISOString(), ...data }; CACHE.personal_logs.push(l); _set(`personal_logs/${l.id}`, l); return l; },
  updatePersonalLog(id, updates) {
    const i = CACHE.personal_logs.findIndex(l => l.id === id);
    if (i !== -1) { CACHE.personal_logs[i] = { ...CACHE.personal_logs[i], ...updates }; _set(`personal_logs/${id}`, CACHE.personal_logs[i]); }
  },
  deletePersonalLog(id) { CACHE.personal_logs = CACHE.personal_logs.filter(l => l.id !== id); _del(`personal_logs/${id}`); },

  // 패키지 템플릿
  getPkgTemplates() { return CACHE.pkg_templates; },
  addPkgTemplate(data) { const t = { id: this.uuid(), ...data }; CACHE.pkg_templates.push(t); _set(`pkg_templates/${t.id}`, t); return t; },
  updatePkgTemplate(id, updates) {
    const i = CACHE.pkg_templates.findIndex(t => t.id === id);
    if (i !== -1) { CACHE.pkg_templates[i] = { ...CACHE.pkg_templates[i], ...updates }; _set(`pkg_templates/${id}`, CACHE.pkg_templates[i]); }
  },
  deletePkgTemplate(id) { CACHE.pkg_templates = CACHE.pkg_templates.filter(t => t.id !== id); _del(`pkg_templates/${id}`); },

  exportBackup() {
    return JSON.stringify({
      members:CACHE.members, sessions:CACHE.sessions, schedules:CACHE.schedules,
      pt_packages:CACHE.pt_packages, weight_logs:CACHE.weight_logs, routines:CACHE.routines,
      notices:CACHE.notices, pkg_templates:CACHE.pkg_templates, personal_logs:CACHE.personal_logs,
      custom_exercises:CACHE.custom_exercises, weekly_checkins:CACHE.weekly_checkins,
      admin_pw:CACHE.admin_pw
    }, null, 2);
  },
  async importBackup(jsonStr) {
    const data = JSON.parse(jsonStr);
    const cols = ['members','sessions','schedules','pt_packages','weight_logs','routines','notices','pkg_templates','personal_logs','custom_exercises','weekly_checkins'];
    cols.forEach(col => {
      if (data[col]) {
        const list = Array.isArray(data[col]) ? data[col] : Object.values(data[col]);
        CACHE[col] = list;
        _setLocal(col, _normalizeCollection(list));
      }
    });
    if (data.admin_pw) {
      CACHE.admin_pw = data.admin_pw;
      _setLocal('config/admin_pw', data.admin_pw);
    }
  },
  exportSessionsCsv(memberId) {
    let sessions = [...CACHE.sessions].sort((a,b) => a.date.localeCompare(b.date));
    if (memberId) sessions = sessions.filter(s => s.memberId === memberId);
    const rows = [['날짜','회원','출석','운동 수','운동 목록','트레이너 메모','다음 계획']];
    sessions.forEach(s => {
      const m = this.getMember(s.memberId);
      rows.push([s.date, m?.name||'', s.attendance===false?'결석':'출석', s.exercises?.length||0, (s.exercises||[]).map(e=>e.name).join(' / '), s.trainerNote||'', s.nextPlan||'']);
    });
    return rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
  },

  seedDemoData() {
    if (CACHE.members.length || CACHE.sessions.length || CACHE.schedules.length) return;

    const today = new Date();
    const date = offset => new Date(today.getTime() + offset * 86400000).toISOString().split('T')[0];
    const monday = (() => {
      const d = new Date(today);
      d.setDate(d.getDate() - d.getDay() + 1);
      return d.toISOString().split('T')[0];
    })();

    const memberA = this.addMember({
      memberNo: '1',
      name: '김민수',
      password: '1234',
      phone: '010-1234-5678',
      gender: '남',
      age: 32,
      height: 178,
      weight: 76.4,
      goal: '근력향상',
      memo: '무릎 부담 주의',
    });

    const memberB = this.addMember({
      memberNo: '2',
      name: '이하나',
      password: '1234',
      phone: '010-9876-5432',
      gender: '여',
      age: 28,
      height: 165,
      weight: 58.2,
      goal: '체형교정',
      memo: '주 2회 수업 선호',
    });

    this.addNotice({
      title: '오픈 안내',
      content: '이 버전은 당신 저장소 안에서만 도는 독립 복제본입니다.',
      pinned: true,
    });

    this.addPkgTemplate({ name: '10회권', total: 10, price: 350000, note: '기본 패키지' });
    this.addCustomExercise('밴드 워크', '기능성');

    this.addPtPackage({
      memberId: memberA.id,
      total: 20,
      purchaseDate: date(-28),
      expiryDate: date(62),
      note: '20회 패키지',
    });

    this.addSchedule({ memberId: memberA.id, date: today.toISOString().split('T')[0], time: '19:00', status: 'scheduled', memo: '하체 + 코어' });
    this.addSchedule({ memberId: memberB.id, date: date(1), time: '09:30', status: 'scheduled', memo: '자세 교정' });

    this.addSession({
      memberId: memberA.id,
      date: date(-3),
      startTime: '19:00',
      attendance: true,
      exercises: [
        { name: '스쿼트', unit: 'weight', sets: [{ set: 1, reps: 10, weight: 60 }, { set: 2, reps: 8, weight: 70 }], note: '자세 안정' },
        { name: '플랭크', unit: 'time', sets: [{ set: 1, reps: 1, weight: 45 }, { set: 2, reps: 1, weight: 60 }], note: '코어 유지' },
      ],
      trainerNote: '하체 힘 전달이 좋아졌습니다.',
      nextPlan: '스쿼트 깊이 유지하면서 72.5kg 도전.',
    });

    this.addSession({
      memberId: memberB.id,
      date: date(-1),
      startTime: '09:30',
      attendance: true,
      exercises: [
        { name: '랫풀다운', unit: 'weight', sets: [{ set: 1, reps: 12, weight: 25 }, { set: 2, reps: 10, weight: 30 }], note: '견갑 안정' },
      ],
      trainerNote: '등 자극은 좋았고, 어깨 긴장만 조금 줄이면 됩니다.',
      nextPlan: '좌우 비대칭 체크 후 로우 추가.',
    });

    this.addWeightLog({ memberId: memberA.id, date: date(-10), weight: 77.1, bodyFat: 18.2, muscleMass: 33.6 });
    this.addWeightLog({ memberId: memberA.id, date: date(-3), weight: 76.4, bodyFat: 17.8, muscleMass: 33.9 });
    this.addWeightLog({ memberId: memberB.id, date: date(-9), weight: 58.8, bodyFat: 22.5, muscleMass: 24.1 });

    this.setWeeklyCheckin(memberA.id, monday, '좋음', '수면 7시간');
    this.setWeeklyCheckin(memberB.id, monday, '보통', '어깨 뭉침');

    this.addPersonalLog({
      memberId: memberA.id,
      date: date(-5),
      title: '하체 자율운동',
      exercises: [
        { name: '레그프레스', sets: 4, weight: '120kg' },
        { name: '카프레이즈', sets: 4, weight: '자중' },
      ],
      note: '마지막 세트 자극 좋음',
    });

    this.addRoutine({
      name: '하체 기본 루틴',
      category: '하체',
      description: '초급 회원용 기본 하체 프로그램',
      exercises: [
        { name: '스쿼트', unit: 'weight', sets: [{ set: 1, reps: 10, weight: 40 }, { set: 2, reps: 8, weight: 50 }] },
        { name: '레그프레스', unit: 'weight', sets: [{ set: 1, reps: 12, weight: 100 }, { set: 2, reps: 12, weight: 110 }] },
      ],
    });
  }
};
