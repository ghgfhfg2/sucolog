const API = '/api';

let topics = [];
let currentTopicId = null;
let currentStatus = 'all';
let currentQuery = '';

const topicListEl = document.getElementById('topicList');
const jobsBodyEl = document.getElementById('jobsBody');
const currentTopicNameEl = document.getElementById('currentTopicName');
const statusFilterEl = document.getElementById('statusFilter');
const searchInputEl = document.getElementById('searchInput');

async function api(path, options) {
  const res = await fetch(`${API}${path}`, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'request failed');
  return data;
}

function notifyWarning(data) {
  if (data?.warning) alert(data.warning);
}

function formatDate(v) {
  if (!v) return '-';
  return new Date(v).toLocaleString('ko-KR');
}

function humanizeSchedule(schedule) {
  if (!schedule) return '-';

  const p = schedule.trim().split(/\s+/);
  if (p.length !== 5) return schedule;

  const [m, h, dom, mon, dow] = p;
  const pad2 = (v) => String(v).padStart(2, '0');

  if (m.startsWith('*/') && h === '*' && dom === '*' && mon === '*' && dow === '*') {
    return `${m.slice(2)}분마다`;
  }

  if (m === '*' && h === '*' && dom === '*' && mon === '*' && dow === '*') return '매분';

  if (/^\d+$/.test(m) && h === '*' && dom === '*' && mon === '*' && dow === '*') {
    return `매시 ${pad2(m)}분`;
  }

  if (/^\d+$/.test(m) && /^\d+$/.test(h) && dom === '*' && mon === '*' && dow === '*') {
    return `매일 ${pad2(h)}:${pad2(m)}`;
  }

  if (/^\d+$/.test(m) && /^\d+$/.test(h) && dom === '*' && mon === '*' && /^\d+$/.test(dow)) {
    const days = ['일', '월', '화', '수', '목', '금', '토', '일'];
    return `매주 ${days[Number(dow)]}요일 ${pad2(h)}:${pad2(m)}`;
  }

  if (/^\d+$/.test(m) && /^\d+$/.test(h) && /^\d+$/.test(dom) && mon === '*' && dow === '*') {
    return `매월 ${Number(dom)}일 ${pad2(h)}:${pad2(m)}`;
  }

  return schedule;
}

function summarizeCommand(command) {
  if (!command) return '-';
  if (command.includes('/etc/cron.hourly')) return '서버 기본 시간별 유지보수 작업';
  if (command.includes('/etc/cron.daily')) return '서버 기본 일간 유지보수 작업';
  if (command.includes('/etc/cron.weekly')) return '서버 기본 주간 유지보수 작업';
  if (command.includes('/etc/cron.monthly')) return '서버 기본 월간 유지보수 작업';
  if (command.includes('e2scrub_all_cron')) return '디스크 상태를 주기적으로 점검하는 작업';
  if (command.includes('e2scrub_all')) return '디스크 점검(e2scrub) 실행 작업';

  return '사용자 지정 커맨드를 실행하는 작업';
}

function displayName(job) {
  const cmd = job.command || '';
  if (cmd.includes('/etc/cron.hourly')) return '시스템 · 시간별 유지보수';
  if (cmd.includes('/etc/cron.daily')) return '시스템 · 일간 유지보수';
  if (cmd.includes('/etc/cron.weekly')) return '시스템 · 주간 유지보수';
  if (cmd.includes('/etc/cron.monthly')) return '시스템 · 월간 유지보수';
  if (cmd.includes('e2scrub_all_cron')) return '시스템 · e2scrub 주간 점검';
  if (cmd.includes('e2scrub_all')) return '시스템 · e2scrub 일간 점검';
  return job.name;
}

async function loadTopics() {
  topics = await api('/topics');
  if (!currentTopicId && topics.length) currentTopicId = topics[0].id;
  renderTopics();
}

function renderTopics() {
  topicListEl.innerHTML = '';

  topics.forEach((topic) => {
    const li = document.createElement('li');
    li.className = `topic ${topic.id === currentTopicId ? 'active' : ''}`;
    li.innerHTML = `<span>${topic.name}</span><span>${topic.jobCount}</span>`;
    li.onclick = () => {
      currentTopicId = topic.id;
      renderTopics();
      loadJobs();
    };
    topicListEl.appendChild(li);
  });

  const current = topics.find((t) => t.id === currentTopicId);
  currentTopicNameEl.textContent = current ? `주제: ${current.name}` : '주제 선택';
}

async function loadJobs() {
  if (!currentTopicId) return;

  const jobs = await api(
    `/jobs?topicId=${currentTopicId}&status=${currentStatus}&q=${encodeURIComponent(currentQuery)}`
  );

  jobsBodyEl.innerHTML = '';
  jobs.forEach((job) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${displayName(job)}</strong><br/><small class="muted">원본: ${job.name}</small></td>
      <td><strong>${humanizeSchedule(job.schedule)}</strong><br/><small class="muted"><code>${job.schedule}</code></small></td>
      <td title="${job.command}">${job.description || summarizeCommand(job.command)}</td>
      <td><span class="pill ${job.enabled ? 'on' : 'off'}">${job.enabled ? '활성' : '중지'}</span></td>
      <td>${job.lastStatus}</td>
      <td>${formatDate(job.lastRunAt)}</td>
      <td>
        <div class="actions">
          <button data-action="run">실행</button>
          <button data-action="toggle">${job.enabled ? '중지' : '재개'}</button>
          <button data-action="edit">수정</button>
          <button data-action="delete">삭제</button>
        </div>
      </td>
    `;

    tr.querySelector('[data-action="run"]').onclick = async () => {
      const result = await api(`/jobs/${job.id}/run`, { method: 'POST' });
      notifyWarning(result);
      await loadJobs();
    };

    tr.querySelector('[data-action="toggle"]').onclick = async () => {
      const result = await api(`/jobs/${job.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: job.enabled ? 0 : 1 }),
      });
      notifyWarning(result);
      await loadJobs();
      await loadTopics();
    };

    tr.querySelector('[data-action="edit"]').onclick = async () => {
      const name = prompt('잡 이름', job.name);
      if (!name) return;
      const schedule = prompt('크론 스케줄', job.schedule);
      if (!schedule) return;
      const description = prompt('작업 설명(한 줄)', job.description || summarizeCommand(job.command));
      if (!description) return;
      const result = await api(`/jobs/${job.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, schedule, description }),
      });
      notifyWarning(result);
      await loadJobs();
    };

    tr.querySelector('[data-action="delete"]').onclick = async () => {
      if (!confirm('정말 삭제할까요?')) return;
      const result = await api(`/jobs/${job.id}`, { method: 'DELETE' });
      notifyWarning(result);
      await loadJobs();
      await loadTopics();
    };

    jobsBodyEl.appendChild(tr);
  });
}

statusFilterEl.onchange = () => {
  currentStatus = statusFilterEl.value;
  loadJobs();
};

searchInputEl.oninput = () => {
  currentQuery = searchInputEl.value;
  loadJobs();
};

document.getElementById('importBtn').onclick = async () => {
  const result = await api('/jobs/import', { method: 'POST' });
  notifyWarning(result);
  alert(`가져오기 완료: 총 ${result.total}개 중 ${result.imported}개 추가, ${result.skipped}개 중복 건너뜀`);
  await loadTopics();
  await loadJobs();
};

document.getElementById('syncBtn').onclick = async () => {
  const result = await api('/jobs/sync', { method: 'POST' });
  alert(`크론 반영 완료: ${result.jobs}개 활성 잡 적용`);
};

document.getElementById('addTopicBtn').onclick = async () => {
  const name = prompt('새 주제 이름');
  if (!name) return;
  await api('/topics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  await loadTopics();
};

document.getElementById('addJobBtn').onclick = async () => {
  if (!currentTopicId) return alert('주제를 먼저 선택하세요.');
  const name = prompt('잡 이름');
  if (!name) return;
  const schedule = prompt('크론 스케줄', '*/5 * * * *');
  if (!schedule) return;
  const command = prompt('실행 커맨드', 'echo hello');
  if (!command) return;
  const description = prompt('작업 설명(한 줄)', '사용자 지정 커맨드를 실행합니다.');
  if (!description) return;

  const result = await api('/jobs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topicId: currentTopicId, name, schedule, command, description }),
  });

  notifyWarning(result);
  await loadJobs();
  await loadTopics();
};

(async function init() {
  try {
    await loadTopics();
    await loadJobs();
  } catch (e) {
    alert(`초기화 실패: ${e.message}`);
  }
})();
