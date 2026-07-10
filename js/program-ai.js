const AIProgram = (() => {
  const evidence = [
    '성인은 주 2일 이상 주요 근육군 근력운동을 포함한다. HHS Physical Activity Guidelines 2nd ed.',
    '초중급자는 점진적 과부하, 큰 근육/복합 운동 우선, 목표별 반복수와 휴식을 조절한다. ACSM Progression Models in Resistance Training.',
    '근비대는 주당 세트 수와 가까운 실패 지점(RPE 7-9)의 누적 볼륨이 중요하다. Schoenfeld et al. meta-analysis.',
    '고중량 근력은 긴 휴식, 낮은 반복, 충분한 기술 품질을 우선한다. NSCA/ACSM program design principles.',
    '교정운동은 호흡, 가동성, 안정화, 약한 움직임 패턴 재학습을 먼저 두고 통증 없는 범위에서 점진 진행한다. NASM Corrective Exercise Continuum.',
    '캐틀벨 스윙/클린/스내치 계열은 힙힌지, 파워, 심폐 지구력과 악력 요구가 높아 기술 숙련과 피로 관리가 필요하다. Lake & Lauder kettlebell training research.',
    '주기화는 볼륨과 강도를 계획적으로 바꾸어 피로를 관리하고 경기력 피크를 만드는 접근이다. 강도는 1RM 비율과 RPE를 함께 사용한다.',
    '역도 프로그램은 스내치, 클린&저크, 풀, 프론트 스쿼트, 오버헤드 안정화를 기술 품질 우선으로 배치하고 대개 60-85% 1RM 범위에서 누적한다.'
  ];

  const catalog = [
    e('스쿼트', '하체', ['knee-dominant','compound','barbell'], ['대퇴사두','둔근','코어'], ['barbell'], 'intermediate', ['knee','lowBack']),
    e('프론트 스쿼트', '하체', ['knee-dominant','compound','barbell'], ['대퇴사두','코어'], ['barbell'], 'advanced', ['knee','wrist']),
    e('고블릿 스쿼트', '하체', ['knee-dominant','compound'], ['대퇴사두','둔근'], ['dumbbell','kettlebell'], 'beginner', ['knee']),
    e('레그프레스', '하체', ['knee-dominant','machine'], ['대퇴사두','둔근'], ['machine'], 'beginner', ['knee']),
    e('런지', '하체', ['single-leg','knee-dominant'], ['대퇴사두','둔근'], ['bodyweight','dumbbell'], 'beginner', ['knee']),
    e('스텝업', '하체', ['single-leg','knee-dominant','bodyweight'], ['대퇴사두','둔근','균형'], ['bodyweight','box','step'], 'beginner', ['knee']),
    e('점프스쿼트', '하체', ['knee-dominant','bodyweight','power','conditioning'], ['대퇴사두','둔근','심폐'], ['bodyweight'], 'intermediate', ['knee']),
    e('사이드스텝', '하체', ['single-leg','bodyweight','lateral','conditioning'], ['중둔근','대퇴사두','심폐'], ['bodyweight','band'], 'beginner', []),
    e('불가리안 스플릿 스쿼트', '하체', ['single-leg','knee-dominant'], ['대퇴사두','둔근'], ['dumbbell'], 'intermediate', ['knee']),
    e('힙쓰러스트', '하체', ['hip-dominant','compound'], ['둔근','햄스트링'], ['barbell','machine'], 'beginner', []),
    e('루마니안 데드리프트', '하체', ['hinge','compound'], ['햄스트링','둔근','척추기립근'], ['barbell','dumbbell'], 'intermediate', ['lowBack']),
    e('컨벤셔널 데드리프트', '하체', ['hinge','compound','barbell'], ['햄스트링','둔근','등','전완'], ['barbell'], 'advanced', ['lowBack']),
    e('레그컬', '하체', ['isolation','machine'], ['햄스트링'], ['machine'], 'beginner', []),
    e('레그익스텐션', '하체', ['isolation','machine'], ['대퇴사두'], ['machine'], 'beginner', ['knee']),
    e('카프레이즈', '하체', ['isolation'], ['종아리'], ['machine','dumbbell','bodyweight'], 'beginner', []),
    e('벤치프레스', '가슴', ['horizontal-push','compound','barbell'], ['가슴','삼두','전면어깨'], ['barbell'], 'intermediate', ['shoulder']),
    e('덤벨 벤치프레스', '가슴', ['horizontal-push','compound'], ['가슴','삼두','전면어깨'], ['dumbbell'], 'beginner', ['shoulder']),
    e('인클라인 덤벨 프레스', '가슴', ['incline-push','compound'], ['상부가슴','전면어깨','삼두'], ['dumbbell'], 'beginner', ['shoulder']),
    e('푸시업', '가슴', ['horizontal-push','bodyweight'], ['가슴','삼두','코어'], ['bodyweight'], 'beginner', ['wrist','shoulder']),
    e('딥스', '가슴', ['vertical-push','bodyweight'], ['가슴','삼두'], ['bodyweight'], 'advanced', ['shoulder']),
    e('케이블 플라이', '가슴', ['isolation','cable'], ['가슴'], ['cable'], 'beginner', ['shoulder']),
    e('펙덱 플라이', '가슴', ['isolation','machine'], ['가슴'], ['machine'], 'beginner', ['shoulder']),
    e('풀업', '등', ['vertical-pull','bodyweight'], ['광배','이두','상부등'], ['bodyweight'], 'advanced', ['shoulder','elbow']),
    e('랫풀다운', '등', ['vertical-pull','machine'], ['광배','이두'], ['machine','cable'], 'beginner', ['shoulder']),
    e('시티드 케이블 로우', '등', ['horizontal-pull','cable'], ['광배','능형근','이두'], ['cable'], 'beginner', []),
    e('바벨 로우', '등', ['horizontal-pull','compound','barbell'], ['광배','상부등','이두'], ['barbell'], 'intermediate', ['lowBack']),
    e('원암 덤벨 로우', '등', ['horizontal-pull'], ['광배','상부등'], ['dumbbell'], 'beginner', []),
    e('벤트오버 레터럴 레이즈', '어깨', ['rear-delt','isolation'], ['후면어깨','중하부승모'], ['dumbbell'], 'beginner', []),
    e('덤벨 숄더프레스', '어깨', ['vertical-push','compound'], ['어깨','삼두'], ['dumbbell'], 'beginner', ['shoulder']),
    e('오버헤드 바벨 프레스', '어깨', ['vertical-push','compound','barbell'], ['어깨','삼두','코어'], ['barbell'], 'intermediate', ['shoulder','lowBack']),
    e('사이드 레터럴 레이즈', '어깨', ['isolation'], ['측면어깨'], ['dumbbell','cable'], 'beginner', []),
    e('리어 델트 플라이', '어깨', ['rear-delt','isolation'], ['후면어깨'], ['dumbbell','machine'], 'beginner', []),
    e('바벨 컬', '팔', ['elbow-flexion'], ['이두'], ['barbell'], 'beginner', ['elbow','wrist']),
    e('덤벨 컬', '팔', ['elbow-flexion'], ['이두'], ['dumbbell'], 'beginner', ['elbow']),
    e('해머 컬', '팔', ['elbow-flexion'], ['상완근','전완'], ['dumbbell'], 'beginner', ['elbow']),
    e('트라이셉스 푸시다운', '팔', ['elbow-extension','cable'], ['삼두'], ['cable'], 'beginner', ['elbow']),
    e('오버헤드 트라이셉스 익스텐션', '팔', ['elbow-extension'], ['삼두'], ['dumbbell','cable'], 'beginner', ['shoulder','elbow']),
    e('플랭크', '코어', ['anti-extension','core'], ['복부','코어'], ['bodyweight'], 'beginner', []),
    e('데드버그', '코어', ['anti-extension','core'], ['복부','코어'], ['bodyweight'], 'beginner', []),
    e('팔로프 프레스', '코어', ['anti-rotation','core'], ['복부','코어'], ['cable','band'], 'beginner', []),
    e('암워킹', '코어', ['bodyweight','core','anti-extension','conditioning'], ['코어','어깨','햄스트링'], ['bodyweight'], 'beginner', ['wrist','shoulder']),
    e('점핑잭', '기능성', ['bodyweight','conditioning','cardio'], ['심폐','전신'], ['bodyweight'], 'beginner', []),
    e('버드독', '교정운동', ['corrective','spine-stability','anti-extension','core'], ['코어','둔근','척추안정화'], ['bodyweight'], 'beginner', []),
    e('월슬라이드', '교정운동', ['corrective','shoulder-mobility'], ['견갑안정화','흉추'], ['bodyweight','band'], 'beginner', ['shoulder']),
    e('밴드 풀어파트', '교정운동', ['corrective','scapular-control','rear-delt'], ['후면어깨','중하부승모'], ['band'], 'beginner', []),
    e('밴드 외회전', '교정운동', ['corrective','rotator-cuff'], ['회전근개'], ['band','cable'], 'beginner', ['shoulder']),
    e('글루트 브릿지', '교정운동', ['corrective','hip-dominant'], ['둔근','코어'], ['bodyweight','band'], 'beginner', []),
    e('클램쉘', '교정운동', ['corrective','hip-stability'], ['중둔근'], ['bodyweight','band'], 'beginner', []),
    e('힙힌지 드릴', '교정운동', ['corrective','hinge-pattern'], ['햄스트링','둔근','척추정렬'], ['bodyweight','stick'], 'beginner', ['lowBack']),
    e('앵클 모빌리티', '교정운동', ['corrective','ankle-mobility','mobility'], ['발목'], ['bodyweight'], 'beginner', []),
    e('흉추 회전', '교정운동', ['corrective','thoracic-mobility','mobility'], ['흉추'], ['bodyweight'], 'beginner', []),
    e('행잉 레그레이즈', '복부', ['hip-flexion','core'], ['복부','고관절굴곡근'], ['bodyweight'], 'advanced', ['shoulder','lowBack']),
    e('케이블 크런치', '복부', ['trunk-flexion','cable'], ['복부'], ['cable'], 'beginner', []),
    e('트레드밀 걷기', '유산소', ['cardio','low-impact'], ['심폐'], ['machine'], 'beginner', []),
    e('싸이클', '유산소', ['cardio','low-impact'], ['심폐','하체'], ['machine'], 'beginner', ['knee']),
    e('로잉머신', '유산소', ['cardio','hinge'], ['심폐','등','하체'], ['machine'], 'intermediate', ['lowBack']),
    e('싱글 케틀벨 데드리프트', '캐틀벨', ['kettlebell','single-kb','hinge','corrective'], ['둔근','햄스트링','척추정렬'], ['kettlebell'], 'beginner', ['lowBack']),
    e('싱글 케틀벨 스윙', '캐틀벨', ['kettlebell','single-kb','power','hinge','conditioning'], ['둔근','햄스트링','심폐'], ['kettlebell'], 'intermediate', ['lowBack']),
    e('싱글 케틀벨 고블릿 스쿼트', '캐틀벨', ['kettlebell','single-kb','knee-dominant','compound'], ['대퇴사두','둔근','코어'], ['kettlebell'], 'beginner', ['knee']),
    e('싱글 케틀벨 프론트 스쿼트', '캐틀벨', ['kettlebell','single-kb','knee-dominant','compound'], ['대퇴사두','코어','둔근'], ['kettlebell'], 'intermediate', ['knee']),
    e('싱글 케틀벨 로우', '캐틀벨', ['kettlebell','single-kb','horizontal-pull'], ['광배','상부등','이두'], ['kettlebell'], 'beginner', []),
    e('싱글 케틀벨 플로어 프레스', '캐틀벨', ['kettlebell','single-kb','horizontal-push'], ['가슴','삼두','전면어깨'], ['kettlebell'], 'beginner', ['shoulder']),
    e('싱글 케틀벨 하이풀', '캐틀벨', ['kettlebell','single-kb','power','vertical-pull'], ['상부등','어깨','둔근'], ['kettlebell'], 'intermediate', ['shoulder','lowBack']),
    e('싱글 케틀벨 클린', '캐틀벨', ['kettlebell','single-kb','power','hinge'], ['둔근','햄스트링','전완','어깨'], ['kettlebell'], 'intermediate', ['wrist','lowBack']),
    e('싱글 케틀벨 프레스', '캐틀벨', ['kettlebell','single-kb','vertical-push'], ['어깨','삼두','코어'], ['kettlebell'], 'intermediate', ['shoulder']),
    e('싱글 케틀벨 푸시프레스', '캐틀벨', ['kettlebell','single-kb','vertical-push','power'], ['어깨','삼두','하체'], ['kettlebell'], 'intermediate', ['shoulder']),
    e('싱글 케틀벨 스내치', '캐틀벨', ['kettlebell','single-kb','power','conditioning'], ['둔근','햄스트링','어깨','심폐'], ['kettlebell'], 'advanced', ['shoulder','lowBack']),
    e('싱글 케틀벨 클린 → 프레스', '캐틀벨', ['kettlebell','single-kb','complex','power','vertical-push'], ['전신','어깨','둔근'], ['kettlebell'], 'intermediate', ['shoulder','lowBack']),
    e('싱글 케틀벨 클린 → 스쿼트 → 프레스', '캐틀벨', ['kettlebell','single-kb','complex','knee-dominant','vertical-push'], ['전신','하체','어깨'], ['kettlebell'], 'intermediate', ['knee','shoulder']),
    e('싱글 케틀벨 스윙 → 클린 → 스내치', '캐틀벨', ['kettlebell','single-kb','complex','conditioning','power'], ['전신','심폐','둔근'], ['kettlebell'], 'advanced', ['shoulder','lowBack']),
    e('싱글 케틀벨 윈드밀', '캐틀벨', ['kettlebell','single-kb','core','shoulder-stability','mobility'], ['코어','어깨안정화','햄스트링'], ['kettlebell'], 'advanced', ['shoulder','lowBack']),
    e('싱글 케틀벨 터키시 겟업', '캐틀벨', ['kettlebell','single-kb','core','shoulder-stability','corrective'], ['코어','어깨안정화','둔근'], ['kettlebell'], 'advanced', ['shoulder']),
    e('싱글 케틀벨 캐리', '캐틀벨', ['kettlebell','single-kb','loaded-carry','core'], ['악력','코어','승모'], ['kettlebell'], 'beginner', []),
    e('싱글 케틀벨 랙 캐리', '캐틀벨', ['kettlebell','single-kb','loaded-carry','core'], ['코어','전완','상부등'], ['kettlebell'], 'intermediate', []),
    e('싱글 케틀벨 오버헤드 캐리', '캐틀벨', ['kettlebell','single-kb','loaded-carry','shoulder-stability'], ['어깨안정화','코어'], ['kettlebell'], 'advanced', ['shoulder']),
    e('싱글 케틀벨 할로', '캐틀벨', ['kettlebell','single-kb','shoulder-mobility','core'], ['어깨','코어'], ['kettlebell'], 'beginner', ['shoulder']),
    e('싱글 케틀벨 싯업 → 프레스', '캐틀벨', ['kettlebell','single-kb','complex','core','vertical-push'], ['복부','어깨'], ['kettlebell'], 'intermediate', ['lowBack','shoulder']),
    e('더블 케틀벨 데드리프트', '캐틀벨', ['kettlebell','double-kb','hinge','compound'], ['둔근','햄스트링','척추기립근'], ['kettlebell'], 'beginner', ['lowBack']),
    e('더블 케틀벨 스윙', '캐틀벨', ['kettlebell','double-kb','power','hinge','conditioning'], ['둔근','햄스트링','심폐'], ['kettlebell'], 'advanced', ['lowBack']),
    e('더블 케틀벨 프론트 스쿼트', '캐틀벨', ['kettlebell','double-kb','knee-dominant','compound'], ['대퇴사두','코어','둔근'], ['kettlebell'], 'intermediate', ['knee']),
    e('더블 케틀벨 클린', '캐틀벨', ['kettlebell','double-kb','power','hinge'], ['둔근','햄스트링','전완','어깨'], ['kettlebell'], 'intermediate', ['wrist','lowBack']),
    e('더블 케틀벨 프레스', '캐틀벨', ['kettlebell','double-kb','vertical-push'], ['어깨','삼두','코어'], ['kettlebell'], 'intermediate', ['shoulder']),
    e('더블 케틀벨 푸시프레스', '캐틀벨', ['kettlebell','double-kb','vertical-push','power'], ['어깨','삼두','하체'], ['kettlebell'], 'intermediate', ['shoulder']),
    e('더블 케틀벨 클린 → 프레스', '캐틀벨', ['kettlebell','double-kb','complex','power','vertical-push'], ['전신','어깨','둔근'], ['kettlebell'], 'intermediate', ['shoulder','lowBack']),
    e('더블 케틀벨 클린 → 프론트 스쿼트', '캐틀벨', ['kettlebell','double-kb','complex','knee-dominant','power'], ['전신','하체','코어'], ['kettlebell'], 'intermediate', ['knee','lowBack']),
    e('더블 케틀벨 클린 → 스쿼트 → 프레스', '캐틀벨', ['kettlebell','double-kb','complex','knee-dominant','vertical-push'], ['전신','하체','어깨'], ['kettlebell'], 'advanced', ['knee','shoulder','lowBack']),
    e('더블 케틀벨 스윙 → 클린 → 프레스', '캐틀벨', ['kettlebell','double-kb','complex','conditioning','power'], ['전신','심폐','어깨'], ['kettlebell'], 'advanced', ['shoulder','lowBack']),
    e('더블 케틀벨 레니게이드 로우', '캐틀벨', ['kettlebell','double-kb','horizontal-pull','core'], ['광배','코어','전완'], ['kettlebell'], 'advanced', ['wrist','lowBack']),
    e('더블 케틀벨 랙 캐리', '캐틀벨', ['kettlebell','double-kb','loaded-carry','core'], ['코어','전완','상부등'], ['kettlebell'], 'intermediate', []),
    e('더블 케틀벨 오버헤드 캐리', '캐틀벨', ['kettlebell','double-kb','loaded-carry','shoulder-stability'], ['어깨안정화','코어'], ['kettlebell'], 'advanced', ['shoulder']),
    e('더블 케틀벨 플로우', '캐틀벨', ['kettlebell','double-kb','conditioning','complex'], ['전신','심폐'], ['kettlebell'], 'advanced', ['lowBack','shoulder']),
    e('파워 스내치', '역도', ['olympic','snatch','power'], ['전신','승모','둔근'], ['barbell'], 'advanced', ['shoulder','lowBack']),
    e('행 파워 스내치', '역도', ['olympic','snatch','power','hinge'], ['전신','둔근','승모'], ['barbell'], 'intermediate', ['shoulder','lowBack']),
    e('스내치 풀', '역도', ['olympic','snatch-pull','power','hinge'], ['둔근','햄스트링','승모'], ['barbell'], 'intermediate', ['lowBack']),
    e('오버헤드 스쿼트', '역도', ['olympic','snatch','knee-dominant'], ['대퇴사두','코어','어깨안정화'], ['barbell'], 'advanced', ['shoulder','knee']),
    e('파워 클린', '역도', ['olympic','clean','power','hinge'], ['전신','둔근','승모'], ['barbell'], 'intermediate', ['wrist','lowBack']),
    e('행 파워 클린', '역도', ['olympic','clean','power','hinge'], ['전신','둔근','승모'], ['barbell'], 'intermediate', ['wrist','lowBack']),
    e('클린 풀', '역도', ['olympic','clean-pull','power','hinge'], ['둔근','햄스트링','승모'], ['barbell'], 'intermediate', ['lowBack']),
    e('프론트 스쿼트', '역도', ['olympic','knee-dominant','compound'], ['대퇴사두','코어','둔근'], ['barbell'], 'intermediate', ['knee','wrist']),
    e('푸시 저크', '역도', ['olympic','jerk','vertical-push','power'], ['어깨','삼두','하체'], ['barbell'], 'intermediate', ['shoulder']),
    e('스플릿 저크', '역도', ['olympic','jerk','vertical-push','power'], ['어깨','삼두','하체'], ['barbell'], 'advanced', ['shoulder','knee']),
    e('슬레드 푸시', '기능성', ['conditioning','knee-dominant'], ['하체','심폐'], ['sled'], 'beginner', []),
    e('배틀로프', '기능성', ['conditioning'], ['심폐','어깨'], ['rope'], 'beginner', ['shoulder']),
    e('폼롤러 흉추', '스트레칭', ['mobility'], ['흉추'], ['bodyweight'], 'beginner', []),
    e('고관절 굴곡근 스트레칭', '스트레칭', ['mobility'], ['고관절'], ['bodyweight'], 'beginner', []),
    e('햄스트링 스트레칭', '스트레칭', ['mobility'], ['햄스트링'], ['bodyweight'], 'beginner', [])
  ];

  function e(name, category, tags, muscles, equipment, level, caution) {
    return { name, category, tags, muscles, equipment, level, caution };
  }

  function generate(input) {
    const cfg = normalize(input);
    cfg.weeklyPlan = buildWeeklyPlan(cfg);
    const split = adjustSplitForGoals(getSplit(cfg.days), cfg);
    const usedProgramKeys = new Set();
    const routines = split.map((day, i) => buildDay(day, i + 1, cfg, usedProgramKeys));
    return {
      title: `${cfg.weeks}주 ${cfg.goalLabel} ${cfg.days}일 프로그램`,
      summary: `${cfg.levelLabel} · ${cfg.weeks}주 · ${cfg.duration}분 · ${cfg.goalLabel}`,
      memberId: cfg.memberId || '',
      memberName: cfg.memberName || '',
      oneRms: cfg.oneRms || {},
      evidence,
      weeklyPlan: cfg.weeklyPlan,
      routines
    };
  }

  function normalize(input) {
    const goals = Array.isArray(input.goals) && input.goals.length ? input.goals : [input.goal || 'hypertrophy'];
    const priority = ['corrective','rehab','strength','hypertrophy','fatloss','endurance'];
    const goal = priority.find(g => goals.includes(g)) || goals[0];
    const level = input.level || 'beginner';
    const days = clamp(parseInt(input.days, 10) || 3, 1, 6);
    const weeks = clamp(parseInt(input.weeks, 10) || 4, 2, 12);
    const duration = clamp(parseInt(input.duration, 10) || 60, 30, 100);
    const requestText = `${input.avoid || ''} ${input.emphasis || ''}`.toLowerCase();
    return {
      goal, level, days, weeks, duration,
      goals,
      equipment: input.equipment || 'gym',
      trainingType: input.trainingType || 'mixed',
      oneRms: input.oneRms || {},
      avoid: (input.avoid || '').split(',').map(s => s.trim()).filter(Boolean),
      emphasis: input.emphasis || '',
      excludeCardio: shouldExcludeCardio(requestText),
      pairSets: !!input.pairSets || shouldUsePairSets(requestText),
      memberName: input.memberName || '',
      goalLabel: goals.map(g => goalMap()[g]).filter(Boolean).join(' + '),
      levelLabel: levelMap()[level]
    };
  }

  function shouldUsePairSets(text) {
    return /a\s*1\s*\/?\s*a\s*2|a-?1\s*a-?2|슈퍼\s*세트|수퍼\s*세트|super\s*set|superset|컴파운드\s*세트|페어\s*세트|두\s*가지|두\s*동작|한\s*세트|묶어|묶어서|묶는|붙여서|연속|끝나면|후에|다음에/.test(text);
  }

  function shouldExcludeCardio(text) {
    return /(유산소|심폐|컨디셔닝|cardio|aerobic|싸이클|사이클|자전거|트레드밀|러닝|런닝|걷기|계단|로잉|스텝밀).*(제외|빼|빼고|없이|하지\s*마|금지|no|exclude|without|remove)|(?:제외|빼|빼고|없이|하지\s*마|금지|no|exclude|without|remove).*(유산소|심폐|컨디셔닝|cardio|aerobic|싸이클|사이클|자전거|트레드밀|러닝|런닝|걷기|계단|로잉|스텝밀)/i.test(text);
  }

  function goalMap() {
    return { hypertrophy:'근비대', strength:'근력향상', fatloss:'체중감량', posture:'체형교정', corrective:'교정운동', rehab:'재활/복귀', endurance:'체력증진' };
  }

  function levelMap() {
    return { beginner:'초급', intermediate:'중급', advanced:'상급' };
  }

  function getSplit(days) {
    const base = days === 1 ? ['전신'] :
      days === 2 ? ['상체','하체'] :
      days === 3 ? ['전신 A','상체','하체'] :
      days === 4 ? ['상체 A','하체 A','상체 B','하체 B'] :
      days === 5 ? ['푸시','풀','하체','상체 보강','전신 컨디셔닝'] :
      ['푸시','풀','하체 A','상체 보강','하체 B','전신 컨디셔닝'];
    return base;
  }

  function adjustSplitForGoals(split, cfg) {
    const next = [...split];
    if (isKettlebellType(cfg.trainingType)) {
      const prefix = cfg.trainingType === 'singleKettlebell' ? '싱글 케틀벨' : cfg.trainingType === 'doubleKettlebell' ? '더블 케틀벨' : '캐틀벨';
      return split.map((_, i) => [`${prefix} 전신 A`,`${prefix} 하체/힌지`,`${prefix} 상체/캐리`,`${prefix} 컴플렉스`,`${prefix} 전신 B`,`${prefix} 컨디셔닝`][i] || `${prefix} ${i + 1}일차`);
    }
    if (cfg.trainingType === 'olympic') {
      return split.map((_, i) => ['역도 기술 A - 스내치','역도 기술 B - 클린&저크','역도 힘 A - 풀/스쿼트','역도 기술 C - 파워 변형','역도 힘 B - 프론트 스쿼트','역도 피크 - 속도/싱글'][i] || `역도 ${i + 1}일차`);
    }
    if (cfg.trainingType === 'corrective' || hasGoal(cfg, 'corrective') || cfg.goal === 'rehab') {
      return split.map((_, i) => ['교정운동 A - 호흡/척추 안정화','교정운동 B - 고관절/하체 정렬','교정운동 C - 흉추/견갑 안정화','교정운동 D - 통합 패턴','교정운동 E - 밸런스/보행','교정운동 F - 전신 리셋'][i] || `교정운동 ${i + 1}일차`);
    }
    return next;
  }

  function buildDay(dayName, index, cfg, usedProgramKeys = new Set()) {
    const targets = targetTags(dayName);
    const count = cfg.duration >= 75 ? 7 : cfg.duration >= 55 ? 6 : 5;
    const picked = cfg.pairSets
      ? applyPairSets(orderCorrectiveFirst(pickExercises(targets, count, cfg, dayName, usedProgramKeys)), cfg, dayName, count)
      : orderCorrectiveFirst(pickExercises(targets, count, cfg, dayName, usedProgramKeys));
    picked.forEach(ex => {
      const key = programUniqueExerciseKey(ex);
      if (key) usedProgramKeys.add(key);
    });
    const exercises = picked.map((ex, idx) => toPrescription(ex, idx, cfg, picked, dayName));
    if (needsCardio(cfg, dayName)) exercises.push(cardioPrescription(cfg));
    return {
      name: `${cfg.memberName ? cfg.memberName + ' ' : ''}${cfg.goalLabel} ${index}일차 - ${dayName}`,
      category: dayName.includes('하체') ? '하체' : dayName.includes('상체') ? '상체' : dayName,
      description: periodizationText(cfg),
      weeklyPlan: cfg.weeklyPlan,
      exercises
    };
  }

  function buildWeeklyPlan(cfg) {
    const plans = {
      strength: [
        ['적응/기술', -8, 'RPE 6-7', '중간 볼륨'],
        ['볼륨 축적', -4, 'RPE 7', '높은 볼륨'],
        ['강도 상승', 0, 'RPE 7-8', '중간 볼륨'],
        ['감량/회복', -12, 'RPE 6', '낮은 볼륨'],
        ['고강도 축적', 2, 'RPE 8', '중간 볼륨'],
        ['피크 준비', 5, 'RPE 8-9', '낮은 볼륨'],
        ['피크/테스트', 8, 'RPE 8-9', '매우 낮은 볼륨'],
        ['회복/재평가', -15, 'RPE 5-6', '낮은 볼륨']
      ],
      olympic: [
        ['기술 볼륨', -8, 'RPE 6', '중간 볼륨'],
        ['속도/파워', -4, 'RPE 6-7', '중간 볼륨'],
        ['파워 축적', 0, 'RPE 7', '높은 품질 반복'],
        ['감량/기술', -12, 'RPE 5-6', '낮은 볼륨'],
        ['고강도 더블', 3, 'RPE 7-8', '중간 볼륨'],
        ['고강도 싱글', 6, 'RPE 8', '낮은 볼륨'],
        ['피크 싱글', 9, 'RPE 8-9', '매우 낮은 볼륨'],
        ['회복/기술 리셋', -15, 'RPE 5-6', '낮은 볼륨']
      ],
      default: [
        ['적응', -6, 'RPE 6-7', '중간 볼륨'],
        ['볼륨 증가', -3, 'RPE 7', '높은 볼륨'],
        ['강도 증가', 0, 'RPE 7-8', '중간 볼륨'],
        ['감량', -10, 'RPE 6', '낮은 볼륨'],
        ['재축적', 1, 'RPE 7-8', '중간 볼륨'],
        ['고강도', 3, 'RPE 8', '낮은 볼륨'],
        ['피크', 5, 'RPE 8-9', '매우 낮은 볼륨'],
        ['회복', -12, 'RPE 5-6', '낮은 볼륨']
      ]
    };
    const source = cfg.trainingType === 'olympic' ? plans.olympic : cfg.goal === 'strength' ? plans.strength : plans.default;
    return Array.from({ length: cfg.weeks }, (_, i) => {
      const row = source[i % source.length];
      return { week: i + 1, focus: row[0], delta: row[1], rpe: row[2], volume: row[3] };
    });
  }

  function periodizationText(cfg) {
    if (cfg.trainingType === 'olympic') {
      return `${cfg.weeks}주 역도식 주기화. 1주 60-70% 기술 볼륨, 2주 70-78% 속도/파워, 3주 78-85% 고강도 싱글·더블, 마지막 주 60-70% 감량 후 기술 품질 확인.`;
    }
    if (cfg.goal === 'strength') {
      return `${cfg.weeks}주 선형/블록 혼합 주기화. 1주 70-75%, 2주 75-80%, 3주 80-88%, 마지막 주 60-70% 감량 또는 테스트 준비.`;
    }
    if (isKettlebellType(cfg.trainingType)) {
      return `${cfg.weeks}주 캐틀벨 주기화. 1주 기술 밀도, 2주 볼륨 증가, 3주 인터벌 강도 증가, 마지막 주 볼륨 20-30% 감량.`;
    }
    return `${cfg.weeks}주 진행. 1-2주 적응, 3주 볼륨/부하 증가, 마지막 주는 피로도에 따라 10-20% 감량.`;
  }

  function targetTags(dayName) {
    if (dayName.includes('교정운동 A')) return ['spine-stability','anti-extension','thoracic-mobility','hinge-pattern','corrective','mobility'];
    if (dayName.includes('교정운동 B')) return ['hip-stability','hip-dominant','ankle-mobility','hinge-pattern','corrective','anti-extension'];
    if (dayName.includes('교정운동 C')) return ['scapular-control','rotator-cuff','shoulder-mobility','rear-delt','thoracic-mobility','corrective'];
    if (dayName.includes('교정')) return ['corrective','thoracic-mobility','hip-stability','scapular-control','anti-extension','hinge-pattern'];
    if (dayName.includes('케틀벨 컴플렉스')) return ['complex','power','vertical-push','knee-dominant','conditioning','loaded-carry'];
    if (dayName.includes('케틀벨 전신')) return ['hinge','knee-dominant','horizontal-pull','horizontal-push','complex','loaded-carry'];
    if (dayName.includes('케틀벨 하체')) return ['hinge','power','knee-dominant','loaded-carry','conditioning','core'];
    if (dayName.includes('케틀벨 상체')) return ['horizontal-pull','horizontal-push','vertical-push','loaded-carry','core','conditioning'];
    if (dayName.includes('케틀벨 컨디셔닝')) return ['conditioning','power','hinge','loaded-carry','core','kettlebell'];
    if (dayName.includes('케틀벨')) return ['kettlebell','hinge','knee-dominant','loaded-carry','conditioning','core'];
    if (dayName.includes('역도 기술 A')) return ['snatch','snatch-pull','knee-dominant','shoulder-stability','core'];
    if (dayName.includes('역도 기술 B')) return ['clean','jerk','clean-pull','knee-dominant','core'];
    if (dayName.includes('역도 힘 A')) return ['clean-pull','snatch-pull','knee-dominant','hinge','core'];
    if (dayName.includes('역도 기술 C')) return ['snatch','clean','jerk','power','knee-dominant'];
    if (dayName.includes('역도')) return ['olympic','snatch','clean','jerk','knee-dominant','core'];
    if (isPushDay(dayName)) return ['horizontal-push','vertical-push','elbow-extension','isolation','core'];
    if (isPullDay(dayName)) return ['vertical-pull','horizontal-pull','rear-delt','elbow-flexion','core'];
    if (isUpperA(dayName)) return ['horizontal-push','vertical-pull','incline-push','elbow-extension','core','rear-delt'];
    if (isUpperB(dayName)) return ['vertical-push','horizontal-pull','rear-delt','elbow-flexion','elbow-extension','core'];
    if (dayName.includes('상체')) return ['horizontal-push','vertical-pull','horizontal-pull','vertical-push','rear-delt','elbow-extension','elbow-flexion'];
    if (isLowerA(dayName)) return ['knee-dominant','single-leg','isolation','core','hip-dominant'];
    if (isLowerB(dayName)) return ['hinge','hip-dominant','single-leg','isolation','core'];
    if (dayName.includes('하체')) return ['knee-dominant','hinge','single-leg','hip-dominant','isolation','core'];
    if (dayName.includes('컨디셔닝')) return ['conditioning','cardio','core','mobility'];
    return ['knee-dominant','horizontal-push','horizontal-pull','hinge','vertical-pull','core'];
  }

  function pickExercises(tags, count, cfg, dayName, usedProgramKeys = new Set()) {
    const pool = catalog.filter(ex => allowed(ex, cfg) && allowedForDay(ex, dayName) && !usedProgramKeys.has(programUniqueExerciseKey(ex)));
    const picked = [];
    const hasPicked = ex => picked.some(item => duplicateExerciseKey(item) === duplicateExerciseKey(ex));
    const addPicked = ex => {
      if (ex && !hasPicked(ex)) picked.push(ex);
    };
    const emphasisTerms = cfg.emphasis.split(/[,\s/]+/).map(s => s.trim()).filter(Boolean);
    emphasisTerms.forEach(term => {
      const found = pickBest(pool, picked, dayName, '', cfg, ex =>
        ex.name.includes(term) || ex.category.includes(term) || ex.muscles.some(m => m.includes(term))
      );
      addPicked(found);
    });
    tags.forEach(tag => {
      if (picked.some(ex => ex.tags.includes(tag))) return;
      const found = pickBest(pool, picked, dayName, tag, cfg, ex => ex.tags.includes(tag));
      addPicked(found);
    });
    if (hasGoal(cfg, 'corrective')) {
      ['corrective','rotator-cuff','hip-stability'].forEach(tag => {
        const found = pickBest(pool, picked, dayName, tag, cfg, ex => ex.tags.includes(tag));
        if (found && picked.length < count && !hasPicked(found)) picked.unshift(found);
      });
    }
    if (isKettlebellType(cfg.trainingType)) {
      ['kettlebell','loaded-carry'].forEach(tag => {
        const found = pickBest(pool, picked, dayName, tag, cfg, ex => ex.tags.includes(tag));
        if (found && picked.length < count) addPicked(found);
      });
    }
    [...pool].sort((a, b) => scoreExercise(b, dayName, '', cfg) - scoreExercise(a, dayName, '', cfg)).forEach(ex => {
      if (picked.length < count) addPicked(ex);
    });
    return picked.slice(0, count);
  }

  function orderCorrectiveFirst(exercises) {
    return [...exercises].sort((a, b) => correctivePriority(b) - correctivePriority(a));
  }

  function applyPairSets(exercises, cfg, dayName, count) {
    const result = [];
    const used = new Set();
    const maxPairs = cfg.duration >= 60 ? 2 : 1;
    let pairIndex = 0;
    exercises.forEach(ex => {
      const exKey = duplicateExerciseKey(ex);
      if (used.has(exKey)) return;
      if (pairIndex >= maxPairs || correctivePriority(ex) > 0 || isKettlebellExercise(ex) || !canLeadPair(ex, dayName)) {
        result.push(ex);
        used.add(exKey);
        return;
      }
      const companion = pickPairCompanion(ex, cfg, dayName, used);
      if (!companion) {
        result.push(ex);
        used.add(exKey);
        return;
      }
      const group = String.fromCharCode(65 + pairIndex);
      result.push({ ...ex, pairGroup: group, pairLabel: `${group}1`, pairRole: 'lead' });
      result.push({ ...companion, pairGroup: group, pairLabel: `${group}2`, pairRole: 'follow' });
      used.add(exKey);
      used.add(duplicateExerciseKey(companion));
      pairIndex += 1;
    });
    return result.slice(0, count + maxPairs);
  }

  function canLeadPair(ex, dayName) {
    if (isLowerDay(dayName)) return ex.tags.some(tag => ['knee-dominant','hinge','hip-dominant','single-leg'].includes(tag));
    if (isUpperDay(dayName)) return ex.tags.some(tag => ['horizontal-push','vertical-push','horizontal-pull','vertical-pull'].includes(tag));
    return ex.tags.includes('compound') || ex.tags.includes('knee-dominant') || ex.tags.includes('hinge');
  }

  function pickPairCompanion(lead, cfg, dayName, used) {
    const requested = cfg.emphasis.split(/[,\s/]+/).map(cleanRequestTerm).filter(Boolean);
    const leadKey = duplicateExerciseKey(lead);
    const pool = catalog
      .filter(ex => !used.has(duplicateExerciseKey(ex)) && duplicateExerciseKey(ex) !== leadKey)
      .filter(ex => ex.equipment.includes('bodyweight') || ex.tags.includes('bodyweight'))
      .filter(ex => allowed(ex, cfg) && allowedForDay(ex, dayName));
    const exact = requested
      .map(term => pickRequestedCompanion(pool, lead, term))
      .find(Boolean);
    if (exact) return exact;
    const names = pairCompanionNames(lead, dayName);
    return names.map(name => pool.find(ex => ex.name === name)).find(Boolean) ||
      pool.sort((a, b) => scoreExercise(b, dayName, 'conditioning', cfg) - scoreExercise(a, dayName, 'conditioning', cfg))[0];
  }

  function pairCompanionNames(lead, dayName) {
    if (lead.tags.includes('knee-dominant')) return ['스텝업','사이드스텝','점프스쿼트'];
    if (lead.tags.includes('hinge') || lead.tags.includes('hip-dominant')) return ['암워킹','스텝업','사이드스텝'];
    if (lead.tags.includes('horizontal-push') || lead.tags.includes('vertical-push')) return ['암워킹','푸시업','점핑잭'];
    if (lead.tags.includes('horizontal-pull') || lead.tags.includes('vertical-pull')) return ['암워킹','점핑잭','밴드 풀어파트'];
    if (dayName.includes('컨디셔닝')) return ['점핑잭','점프스쿼트','사이드스텝'];
    return ['스텝업','암워킹','점핑잭'];
  }

  function cleanRequestTerm(term) {
    return String(term || '')
      .trim()
      .replace(/[.,!?]/g, '')
      .replace(/(으로|로|하고|이랑|랑|와|과|도|을|를|이|가|은|는)$/g, '');
  }

  function pickRequestedCompanion(pool, lead, term) {
    const exact = pool.find(ex => ex.name === term || term.includes(ex.name));
    if (exact) return exact;
    if (term.length < 3 || lead.name.includes(term)) return null;
    return pool.find(ex => ex.name.includes(term));
  }

  function correctivePriority(ex) {
    if (!ex) return 0;
    if (/버드독|데드버그|월슬라이드|밴드 외회전|클램쉘|힙힌지 드릴|앵클 모빌리티|흉추 회전/.test(ex.name)) return 3;
    if (ex.tags.includes('corrective')) return 2;
    if (ex.tags.includes('mobility')) return 1;
    return 0;
  }

  function pickBest(pool, picked, dayName, tag, cfg, predicate) {
    return pool
      .filter(ex => !picked.find(p => duplicateExerciseKey(p) === duplicateExerciseKey(ex)) && predicate(ex))
      .sort((a, b) => scoreExercise(b, dayName, tag, cfg) - scoreExercise(a, dayName, tag, cfg))[0];
  }

  function duplicateExerciseKey(ex) {
    const name = String(ex?.name || ex || '')
      .replace(/^[A-Z]\d\.\s*/, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (/^(데드리프트|컨벤셔널 데드리프트|바벨 데드리프트)$/.test(name)) return 'deadlift';
    return name;
  }

  function programUniqueExerciseKey(ex) {
    const key = duplicateExerciseKey(ex);
    return key === 'deadlift' ? key : '';
  }

  function scoreExercise(ex, dayName, tag, cfg) {
    let score = ex.tags.includes('compound') ? 5 : 0;
    const upperDay = isUpperDay(dayName);
    const lowerDay = isLowerDay(dayName);

    if (upperDay) {
      if (['가슴','등','어깨','팔'].includes(ex.category)) score += 10;
      if (isUpperA(dayName)) {
        if (/벤치프레스|인클라인|풀업|랫풀다운|딥스|트라이셉스/.test(ex.name)) score += 18;
        if (/바벨 로우|오버헤드 바벨 프레스|덤벨 숄더프레스|바벨 컬/.test(ex.name)) score -= 18;
      }
      if (isUpperB(dayName)) {
        if (/오버헤드 바벨 프레스|덤벨 숄더프레스|바벨 로우|시티드 케이블 로우|원암 덤벨 로우|벤트오버 레터럴 레이즈|바벨 컬|덤벨 컬/.test(ex.name)) score += 22;
        if (/벤치프레스|덤벨 벤치프레스|인클라인|풀업|딥스/.test(ex.name)) score -= 25;
      }
      if (tag === 'horizontal-push' && ex.category === '가슴') score += 25;
      if ((tag === 'vertical-pull' || tag === 'horizontal-pull') && ex.category === '등') score += 25;
      if (tag === 'vertical-push') {
        if (ex.category === '어깨') score += 35;
        if (/오버헤드/.test(ex.name)) score += 35;
        if (/숄더프레스|바벨 프레스/.test(ex.name)) score += 20;
        if (/딥스/.test(ex.name)) score -= 20;
      }
      if (tag === 'rear-delt' && ['어깨','등'].includes(ex.category)) score += 25;
      if (tag === 'isolation') {
        if (ex.category === '어깨') score += 20;
        if (ex.category === '팔') score += 15;
        if (ex.category === '가슴') score += 5;
      }
      if ((tag === 'elbow-extension' || tag === 'elbow-flexion') && ex.category === '팔') score += 25;
    }

    if (lowerDay) {
      if (ex.category === '하체') score += 25;
      if (cfg?.goal === 'strength' && /루마니안/.test(ex.name)) score -= 120;
      if (isLowerA(dayName)) {
        if (/스쿼트|레그프레스|런지|스플릿 스쿼트|레그익스텐션/.test(ex.name)) score += 22;
        if (/루마니안|힙쓰러스트|레그컬/.test(ex.name)) score -= 18;
        if (/컨벤셔널 데드리프트/.test(ex.name)) score += 28;
      }
      if (isLowerB(dayName)) {
        if (/컨벤셔널 데드리프트/.test(ex.name)) score += 24;
        if (/루마니안|힙쓰러스트|레그컬|글루트|카프레이즈/.test(ex.name)) score += 24;
        if (/스쿼트|레그프레스|런지|레그익스텐션/.test(ex.name)) score -= 18;
      }
      if (ex.tags.some(t => ['knee-dominant','hinge','hip-dominant','single-leg'].includes(t))) score += 15;
      if (ex.muscles.some(m => ['대퇴사두','햄스트링','둔근','종아리','하체'].includes(m))) score += 10;
      if (['가슴','등','어깨','팔'].includes(ex.category) && !ex.tags.includes('hinge')) score -= 40;
    }

    return score;
  }

  function allowedForDay(ex, dayName) {
    if (isLowerDay(dayName)) {
      if (['하체','코어','복부','유산소','스트레칭','교정운동'].includes(ex.category)) return true;
      if (ex.tags.some(tag => ['knee-dominant','hinge','hip-dominant','single-leg','core','anti-extension','anti-rotation'].includes(tag))) return true;
      return ex.muscles.some(m => ['대퇴사두','햄스트링','둔근','종아리','하체'].includes(m));
    }
    if (!isUpperDay(dayName)) return true;
    if (isPullDay(dayName)) {
      if (ex.category === '가슴' || ex.muscles.some(m => ['가슴','상부가슴','전면어깨'].includes(m))) return false;
      if (ex.tags.some(tag => ['horizontal-push','vertical-push','incline-push'].includes(tag))) return false;
    }
    if (isPushDay(dayName)) {
      if (ex.category === '등' || ex.muscles.some(m => ['광배','상부등','능형근'].includes(m))) return false;
      if (ex.tags.some(tag => ['horizontal-pull','vertical-pull','rear-delt','elbow-flexion'].includes(tag))) return false;
    }
    if (ex.category === '하체') return false;
    if (ex.muscles.some(m => ['대퇴사두','햄스트링','둔근','종아리','하체'].includes(m))) return false;
    if (ex.tags.some(tag => ['knee-dominant','hinge','hip-dominant','single-leg'].includes(tag))) return false;
    return true;
  }

  function isUpperDay(dayName) {
    const name = String(dayName).toLowerCase();
    return name.includes('상체') ||
      isPushDay(dayName) ||
      isPullDay(dayName) ||
      dayName.includes('케틀벨 상체');
  }

  function isLowerDay(dayName) {
    return dayName.includes('하체') && !dayName.includes('상체') && !dayName.includes('케틀벨 상체');
  }

  function isUpperA(dayName) {
    return /상체\s*A|상체\s*a/.test(dayName);
  }

  function isUpperB(dayName) {
    return /상체\s*B|상체\s*b/.test(dayName);
  }

  function isLowerA(dayName) {
    return /하체\s*A|하체\s*a/.test(dayName);
  }

  function isLowerB(dayName) {
    return /하체\s*B|하체\s*b/.test(dayName);
  }

  function isPushDay(dayName) {
    const name = String(dayName).toLowerCase();
    return (name.includes('푸시') || /\bpush\b/.test(name)) && !name.includes('슬레드 푸시');
  }

  function isPullDay(dayName) {
    const name = String(dayName).toLowerCase();
    return (name.includes('풀') || /\bpull\b/.test(name)) && !name.includes('풀/스쿼트');
  }

  function allowed(ex, cfg) {
    if (cfg.excludeCardio && isCardioExercise(ex)) return false;
    if (cfg.goal === 'strength' && /루마니안/.test(ex.name)) return false;
    if (cfg.level === 'beginner' && ex.level === 'advanced') return false;
    if (isKettlebellType(cfg.trainingType) && !ex.tags.includes('kettlebell') && !ex.tags.includes('mobility')) return false;
    if (cfg.trainingType === 'singleKettlebell' && ex.tags.includes('double-kb')) return false;
    if (cfg.trainingType === 'doubleKettlebell' && ex.tags.includes('single-kb')) return false;
    if (cfg.trainingType === 'olympic' && (!ex.tags.includes('olympic') && !ex.tags.includes('core') && !ex.tags.includes('mobility') || ex.tags.includes('kettlebell'))) return false;
    if (cfg.trainingType === 'corrective' && !ex.tags.includes('corrective') && !ex.tags.includes('mobility')) return false;
    if (cfg.trainingType === 'bodyweight' && !ex.equipment.some(eq => ['bodyweight','band','stick'].includes(eq))) return false;
    if (cfg.trainingType === 'weight' && ex.tags.includes('kettlebell')) return false;
    if (cfg.equipment === 'home' && !ex.equipment.some(eq => ['bodyweight','dumbbell','band','kettlebell','stick'].includes(eq))) return false;
    if (cfg.equipment === 'machine' && !ex.equipment.some(eq => ['machine','cable','bodyweight'].includes(eq))) return false;
    return !cfg.avoid.some(flag => ex.caution.includes(flag));
  }

  function isCardioExercise(ex) {
    return ex.category === '유산소' ||
      ex.tags.includes('cardio') ||
      /싸이클|사이클|트레드밀|로잉머신|에어바이크|스텝밀|일립티컬|줄넘기|스피닝|계단|걷기|러닝|런닝/.test(ex.name);
  }

  function toPrescription(ex, idx, cfg, picked, dayName) {
    const main = isMainExercise(ex, picked);
    const scheme = schemeFor(cfg, main, ex);
    const unit = ex.tags.includes('cardio') || ex.tags.includes('mobility') ? 'time' : 'weight';
    const weight = prescribeWeight(ex, scheme.percent, cfg);
    const percentNote = weight && scheme.percent ? `${scheme.percent}% 1RM · ` : '';
    const displayName = displayExerciseName(ex);
    const pairNote = pairInstruction(ex);
    return {
      name: displayName,
      unit,
      sets: Array.from({ length: scheme.sets }, (_, i) => ({ set: i + 1, reps: scheme.reps, weight })),
      note: `${percentNote}${scheme.rpe} · 휴식 ${scheme.rest}. ${pairNote ? pairNote + ' ' : ''}${cueFor(ex, cfg)}`,
      weeklyLoads: buildWeeklyLoads(ex, scheme, cfg, main, dayName, picked)
    };
  }

  function displayExerciseName(ex) {
    return ex.pairLabel ? `${ex.pairLabel}. ${ex.name}` : ex.name;
  }

  function pairInstruction(ex) {
    if (!ex.pairLabel) return '';
    if (ex.pairRole === 'lead') return `${ex.pairGroup} 페어세트: ${ex.pairLabel} 후 30초 이내 ${ex.pairGroup}2 진행.`;
    return `${ex.pairGroup} 페어세트: ${ex.pairLabel} 완료 후 90-120초 휴식.`;
  }

  function isMainExercise(ex, picked) {
    if (!ex.tags.includes('compound')) return false;
    if (correctivePriority(ex) > 0) return false;
    if (/오버헤드 바벨 프레스|덤벨 숄더프레스|풀업|바벨 로우/.test(ex.name)) return true;
    const mainCompounds = picked.filter(item => item.tags.includes('compound') && correctivePriority(item) === 0).slice(0, 2);
    return mainCompounds.some(item => item.name === ex.name);
  }

  function buildWeeklyLoads(ex, scheme, cfg, main, dayName, picked) {
    const alternates = main ? [] : alternateExerciseNames(ex, cfg, dayName, picked);
    const weekName = week => {
      const baseName = alternates.length ? alternates[(week - 1) % alternates.length] : ex.name;
      return ex.pairLabel ? `${ex.pairLabel}. ${baseName}` : baseName;
    };
    if (!cfg.weeklyPlan) return [];
    if (isKettlebellExercise(ex)) {
      return cfg.weeklyPlan.map(w => ({
        week: w.week,
        focus: w.focus,
        rpe: w.rpe,
        volume: w.volume,
        percent: '',
        weight: '',
        exerciseName: weekName(w.week),
        reps: scheme.reps
      }));
    }
    if (isBigThreeLift(ex.name)) {
      return bigThreeStrengthWeeks().slice(0, cfg.weeks).map(plan => ({
        week: plan.week,
        focus: plan.focus,
        rpe: plan.rpe,
        volume: plan.volume,
        percent: plan.percent,
        weight: prescribeWeight(ex, plan.percent, cfg),
        exerciseName: weekName(plan.week),
        reps: prilepinReps(plan.percent)
      }));
    }
    if (!scheme.percent || cfg.goal === 'hypertrophy') {
      const baseWeight = prescribeWeight(ex, scheme.percent, cfg);
      return cfg.weeklyPlan.map(w => ({
        week: w.week,
        focus: weeklyFocusLabel(ex, w.focus),
        rpe: w.rpe,
        volume: weeklyVolumeLabel(ex, w.volume),
        percent: '',
        weight: isBodyweightExercise(ex) ? '' : baseWeight ? String(roundToHalf(parseFloat(baseWeight) + (w.week - 1) * 2.5)) : '',
        exerciseName: weekName(w.week),
        reps: cfg.goal === 'hypertrophy' && ex.unit !== 'time' ? bodyweightReps(ex, '10-12') : ''
      }));
    }
    return cfg.weeklyPlan.map(w => {
      const percent = clamp(scheme.percent + w.delta, 40, 95);
      const reps = strengthPercentReps(percent, cfg);
      return {
        week: w.week,
        focus: w.focus,
        rpe: w.rpe,
        volume: w.volume,
        percent,
        weight: prescribeWeight(ex, percent, cfg),
        exerciseName: weekName(w.week),
        reps
      };
    });
  }

  function isBodyweightExercise(ex) {
    return ex.tags?.includes('bodyweight') || ex.equipment?.includes('bodyweight');
  }

  function weeklyVolumeLabel(ex, fallback) {
    if (!isBodyweightExercise(ex)) return fallback;
    if (ex.tags.includes('corrective') || ex.tags.includes('mobility')) return '움직임 준비';
    if (ex.tags.includes('core') || /암워킹|플랭크|데드버그|버드독|행잉/.test(ex.name)) return '코어 안정화';
    if (ex.tags.includes('conditioning') || ex.tags.includes('cardio')) return '컨디셔닝';
    if (ex.tags.includes('power')) return '파워/민첩성';
    return '기능성 보조';
  }

  function weeklyFocusLabel(ex, fallback) {
    if (!isBodyweightExercise(ex)) return fallback;
    if (ex.tags.includes('corrective') || ex.tags.includes('mobility')) return '움직임 준비';
    if (ex.tags.includes('core') || /암워킹|플랭크|데드버그|버드독|행잉/.test(ex.name)) return '코어 안정화';
    if (ex.tags.includes('conditioning') || ex.tags.includes('cardio')) return '컨디셔닝';
    if (ex.tags.includes('power')) return '파워/민첩성';
    return '기능성 패턴';
  }

  function bodyweightReps(ex, fallback) {
    if (!isBodyweightExercise(ex)) return fallback;
    if (ex.tags.includes('conditioning') || /암워킹|점핑잭|사이드스텝/.test(ex.name)) return '20-40초';
    if (ex.tags.includes('core') || ex.tags.includes('corrective')) return '8-12';
    return '10-15';
  }

  function strengthPercentReps(percent, cfg) {
    if (cfg.goal !== 'strength') return '';
    return prilepinReps(percent);
  }

  function isBigThreeLift(name) {
    return /^(스쿼트|벤치프레스|컨벤셔널 데드리프트|데드리프트)$/.test(name) || /바벨 백 스쿼트|파워리프팅 스쿼트/.test(name);
  }

  function bigThreeStrengthWeeks() {
    return [
      { week: 1, focus: '적응/기술', percent: 75, rpe: 'RPE 7', volume: '중간 볼륨' },
      { week: 2, focus: '볼륨 축적', percent: 77.5, rpe: 'RPE 7-8', volume: '중간 볼륨' },
      { week: 3, focus: '강도 상승', percent: 80, rpe: 'RPE 8', volume: '중간 볼륨' },
      { week: 4, focus: '강도 축적', percent: 82.5, rpe: 'RPE 8', volume: '중간 볼륨' },
      { week: 5, focus: '고강도 진입', percent: 85, rpe: 'RPE 8', volume: '낮은-중간 볼륨' },
      { week: 6, focus: '고강도 축적', percent: 87.5, rpe: 'RPE 8-9', volume: '낮은 볼륨' },
      { week: 7, focus: '피크 준비', percent: 90, rpe: 'RPE 9', volume: '낮은 볼륨' },
      { week: 8, focus: '피크/확인', percent: 92.5, rpe: 'RPE 9', volume: '매우 낮은 볼륨' }
    ];
  }

  function prilepinReps(percent) {
    if (percent >= 90) return '2-4';
    if (percent >= 85) return '5';
    if (percent >= 80) return '5-6';
    if (percent >= 75) return '6-8';
    return '8';
  }

  function isKettlebellExercise(ex) {
    return ex.tags?.includes('kettlebell') || /케틀벨|캐틀벨/.test(ex.name || '');
  }

  function alternateExerciseNames(ex, cfg, dayName, picked) {
    if (correctivePriority(ex) > 0 || ex.tags.includes('cardio') || ex.tags.includes('mobility')) return [ex.name];
    const pickedNames = new Set(picked.map(item => item.name));
    const keyTags = ['horizontal-push','vertical-push','vertical-pull','horizontal-pull','rear-delt','elbow-extension','elbow-flexion','knee-dominant','hinge','single-leg','hip-dominant','core','isolation'];
    const sharedTags = keyTags.filter(tag => ex.tags.includes(tag));
    const requiredTags = sharedTags.filter(tag => tag !== 'isolation');
    const samePattern = catalog
      .filter(item => item.name !== ex.name)
      .filter(item => allowed(item, cfg) && allowedForDay(item, dayName))
      .filter(item => {
        if (requiredTags.length) return requiredTags.some(tag => item.tags.includes(tag));
        if (sharedTags.includes('isolation')) return item.category === ex.category && item.tags.includes('isolation');
        return item.category === ex.category || sharedTags.some(tag => item.tags.includes(tag));
      })
      .filter(item => !pickedNames.has(item.name) || item.category === ex.category)
      .sort((a, b) => scoreExercise(b, dayName, sharedTags[0] || '', cfg) - scoreExercise(a, dayName, sharedTags[0] || '', cfg))
      .map(item => item.name);
    return [ex.name, ...samePattern].filter((name, i, arr) => arr.indexOf(name) === i).slice(0, 4);
  }

  function schemeFor(cfg, main, ex) {
    const goal = cfg.goal;
    const level = cfg.level;
    if (ex.tags.includes('corrective')) return s(level === 'beginner' ? 2 : 3, '8-12', 'RPE 4-6', '45-75초', 45);
    if (ex.tags.includes('olympic')) return s(ex.tags.includes('power') ? 5 : 4, ex.tags.includes('jerk') ? '2-3' : '2-4', 'RPE 6-8', '2-3분', ex.tags.includes('snatch') ? 70 : 75);
    if (ex.tags.includes('kettlebell') && ex.tags.includes('conditioning')) return s(4, '10-20 또는 20-40초', 'RPE 6-8', '60-120초', null);
    if (ex.tags.includes('kettlebell')) return s(main ? 4 : 3, main ? '6-10' : '8-12', 'RPE 6-8', '60-120초', null);
    if (goal === 'strength') return main ? s(5, '5-8', 'RPE 7-9', '2-4분', 82) : s(3, '5-8', 'RPE 7-8', '90-150초', 75);
    if (hasGoal(cfg, 'fatloss')) return main ? s(3, '8-12', 'RPE 7-8', '60-90초', 68) : s(3, '12-15', 'RPE 7-8', '45-75초', 60);
    if (hasGoal(cfg, 'endurance')) return s(3, '12-20', 'RPE 6-8', '45-75초', 55);
    if (goal === 'rehab' || goal === 'posture' || hasGoal(cfg, 'corrective')) return s(level === 'beginner' ? 2 : 3, '10-15', 'RPE 5-7', '60-90초', 50);
    if (isBigThreeLift(ex.name)) return s(4, '5-8', 'RPE 7-9', '2-3분', 75);
    return s(main ? 4 : 3, '10-12', 'RPE 7-9', main ? '90-150초' : '60-90초', 65);
  }

  function s(sets, reps, rpe, rest, percent) {
    return { sets, reps, rpe, rest, percent };
  }

  function prescribeWeight(ex, percent, cfg) {
    if (!percent || !cfg.oneRms) return '';
    const key = oneRmKey(ex.name);
    const oneRm = key ? parseFloat(cfg.oneRms[key] || cfg.oneRms.main || 0) : 0;
    if (!oneRm) return '';
    return String(roundToHalf((oneRm * percent) / 100));
  }

  function oneRmKey(name) {
    const baseName = String(name || '').replace(/^[A-Z]\d\.\s*/, '').trim();
    if (/팔로프|케이블 크런치|싯업|플랭크|데드버그/.test(baseName)) return '';
    if (/스쿼트|프론트 스쿼트|오버헤드 스쿼트|레그프레스/.test(baseName)) return 'squat';
    if (/벤치|플로어 프레스|푸시업|딥스/.test(baseName)) return 'bench';
    if (/컨벤셔널 데드리프트|데드리프트$|^데드리프트$|바벨 데드리프트|클린 풀|스내치 풀/.test(baseName) && !/루마니안/.test(baseName)) return 'deadlift';
    if (/오버헤드 바벨 프레스|덤벨 숄더프레스|케틀벨 프레스|푸시 저크|스플릿 저크/.test(baseName)) return 'press';
    if (/스내치/.test(baseName)) return 'snatch';
    if (/클린|저크/.test(baseName)) return 'cleanJerk';
    return '';
  }

  function roundToHalf(value) {
    return Math.round(value / 2.5) * 2.5;
  }

  function cueFor(ex, cfg) {
    if (cfg.goal === 'strength') return '기술이 무너지면 중량을 유지하거나 감량';
    if (ex.tags.includes('olympic')) return '바 속도와 받는 자세 우선. 실패 직전까지 밀지 않음';
    if (hasGoal(cfg, 'fatloss')) return '밀도 유지, 호흡 회복 후 다음 세트';
    if (cfg.goal === 'rehab') return '통증 없는 범위, 느린 이완 구간 우선';
    if (ex.tags.includes('corrective')) return '통증 없는 범위, 호흡과 정렬 유지';
    if (ex.tags.includes('kettlebell')) return '힙힌지와 락아웃 품질 우선, 허리 과신전 금지';
    if (ex.tags.includes('compound')) return '마지막 1-3회 여유를 남기며 점진 증량';
    return '반동보다 관절 정렬과 수축감 우선';
  }

  function needsCardio(cfg, dayName) {
    if (cfg.excludeCardio) return false;
    return hasGoal(cfg, 'fatloss') || hasGoal(cfg, 'endurance') || dayName.includes('컨디셔닝');
  }

  function cardioPrescription(cfg) {
    if (isKettlebellType(cfg.trainingType)) {
      return {
        name: cfg.trainingType === 'doubleKettlebell' ? '더블 케틀벨 스윙 인터벌' : '싱글 케틀벨 스윙 인터벌',
        unit: 'time',
        sets: [{ set: 1, reps: '8-12분', weight: '' }],
        note: '20-30초 수행 / 40-60초 휴식. 자세가 무너지면 즉시 중단'
      };
    }
    const reps = cfg.goal === 'endurance' ? '20-30분' : '10-20분';
    return {
      name: cfg.equipment === 'home' ? '빠른 걷기 또는 스텝업' : '싸이클',
      unit: 'time',
      sets: [{ set: 1, reps, weight: '' }],
      note: '말은 가능하지만 노래는 어려운 강도. 체중감량/심폐 보조 볼륨'
    };
  }

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function hasGoal(cfg, goal) {
    return Array.isArray(cfg.goals) && cfg.goals.includes(goal);
  }

  function isKettlebellType(type) {
    return ['kettlebell', 'singleKettlebell', 'doubleKettlebell'].includes(type);
  }

  try {
    if (typeof EXERCISE_DB !== 'undefined') {
      catalog.forEach(ex => {
        if (!EXERCISE_DB[ex.category]) EXERCISE_DB[ex.category] = [];
        if (!EXERCISE_DB[ex.category].includes(ex.name)) EXERCISE_DB[ex.category].push(ex.name);
      });
    }
  } catch {
    // The generator can still run if the manual library is unavailable.
  }

  return { generate, catalog, evidence };
})();
