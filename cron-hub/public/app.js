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
      <td>${job.name}</td>
      <td><code>${job.schedule}</code></td>
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
      const result = await api(`/jobs/${job.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, schedule }),
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

  const result = await api('/jobs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topicId: currentTopicId, name, schedule, command }),
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
