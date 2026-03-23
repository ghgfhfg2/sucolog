(function () {
  const page = document.querySelector('.problem-page');
  if (!page) return;

  const editor = document.getElementById('editor');
  const runBtn = document.getElementById('run-btn');
  const resetBtn = document.getElementById('reset-btn');
  const summary = document.getElementById('results-summary');
  const resultsList = document.getElementById('results-list');

  const problemId = page.dataset.problemId;
  const functionName = page.dataset.functionName;
  const starterCode = JSON.parse(page.dataset.starterCode || '""');
  const testCases = JSON.parse(page.dataset.testCases || '[]');
  const storageKey = `js-coding-blog:${problemId}`;
  const runTimeoutMs = 3000;

  let currentRunId = 0;
  let activeTimeout = null;
  let activeWorker = null;
  let activeWorkerUrl = null;

  const savedCode = localStorage.getItem(storageKey);
  editor.value = savedCode || starterCode;

  editor.addEventListener('input', () => {
    localStorage.setItem(storageKey, editor.value);
  });

  resetBtn.addEventListener('click', () => {
    editor.value = starterCode;
    localStorage.setItem(storageKey, editor.value);
    renderIdle('초기 코드로 되돌렸습니다.');
  });

  runBtn.addEventListener('click', () => {
    currentRunId += 1;
    const runId = currentRunId;

    clearPendingTimeout();
    teardownWorker();

    summary.textContent = '실행 중...';
    resultsList.innerHTML = '<div class="empty-state">격리된 실행 환경에서 코드를 테스트하고 있습니다.</div>';

    if (!tryRunWithWorker(runId)) {
      runInline(runId, true);
      return;
    }

    activeTimeout = window.setTimeout(() => {
      if (runId !== currentRunId) return;
      teardownWorker();
      renderError('실행 시간이 너무 오래 걸렸습니다. 무한 루프나 긴 반복문이 있는지 확인해보세요.');
    }, runTimeoutMs);
  });

  renderIdle('아직 실행하지 않았습니다.');

  function tryRunWithWorker(runId) {
    if (typeof Worker === 'undefined' || typeof Blob === 'undefined' || typeof URL === 'undefined') {
      return false;
    }

    try {
      const worker = createRunnerWorker();
      activeWorker = worker;

      worker.onmessage = (event) => {
        const data = event.data;
        if (!data || data.type !== 'RUN_RESULT') return;

        const { runId: resultRunId, ok, items, passed, total, message } = data.payload || {};
        if (resultRunId !== currentRunId) return;

        clearPendingTimeout();
        teardownWorker();

        if (!ok) {
          renderError(message || '알 수 없는 실행 오류가 발생했습니다.');
          return;
        }

        renderResults(items || [], passed || 0, total || 0);
      };

      worker.onerror = () => {
        if (runId !== currentRunId) return;
        clearPendingTimeout();
        teardownWorker();
        runInline(runId, true);
      };

      worker.postMessage({
        type: 'RUN_CODE',
        payload: {
          runId,
          code: editor.value,
          functionName,
          testCases,
        },
      });

      return true;
    } catch (error) {
      teardownWorker();
      return false;
    }
  }

  function runInline(runId, fromFallback) {
    try {
      clearPendingTimeout();
      teardownWorker();

      const userFactory = new Function(`${editor.value}\nreturn typeof ${functionName} !== 'undefined' ? ${functionName} : null;`);
      const userFn = userFactory();

      if (typeof userFn !== 'function') {
        renderError(`실패: ${functionName} 함수를 찾지 못했습니다.`);
        return;
      }

      const items = [];
      let passed = 0;

      for (let i = 0; i < testCases.length; i += 1) {
        const testCase = testCases[i];
        const actual = userFn.apply(null, testCase.input || []);
        const expected = testCase.output;
        const ok = safeStringify(actual) === safeStringify(expected);

        if (ok) passed += 1;

        items.push({
          index: i + 1,
          ok,
          input: safeStringify(testCase.input),
          expected: safeStringify(expected),
          actual: safeStringify(actual),
        });
      }

      if (fromFallback) {
        summary.innerHTML = '<span class="status-warning">격리 실행 환경을 사용할 수 없어 기본 실행 모드로 테스트했습니다.</span>';
      }

      renderResults(items, passed, testCases.length, fromFallback);
    } catch (error) {
      renderError(`실행 오류: ${error && error.message ? error.message : String(error)}`);
    }
  }

  function createRunnerWorker() {
    const source = `
      self.onmessage = function (event) {
        var data = event.data;
        if (!data || data.type !== 'RUN_CODE') return;

        var payload = data.payload || {};
        var runId = payload.runId;
        var code = payload.code || '';
        var functionName = payload.functionName;
        var testCases = payload.testCases || [];

        try {
          var userFactory = new Function(code + '\\nreturn typeof ' + functionName + ' !== "undefined" ? ' + functionName + ' : null;');
          var userFn = userFactory();

          if (typeof userFn !== 'function') {
            self.postMessage({
              type: 'RUN_RESULT',
              payload: { runId: runId, ok: false, message: '실패: ' + functionName + ' 함수를 찾지 못했습니다.' }
            });
            return;
          }

          var passed = 0;
          var items = testCases.map(function (testCase, index) {
            var actual = userFn.apply(null, testCase.input || []);
            var expected = testCase.output;
            var ok = safeStringify(actual) === safeStringify(expected);
            if (ok) passed += 1;

            return {
              index: index + 1,
              ok: ok,
              input: safeStringify(testCase.input),
              expected: safeStringify(expected),
              actual: safeStringify(actual)
            };
          });

          self.postMessage({
            type: 'RUN_RESULT',
            payload: { runId: runId, ok: true, items: items, passed: passed, total: testCases.length }
          });
        } catch (error) {
          self.postMessage({
            type: 'RUN_RESULT',
            payload: {
              runId: runId,
              ok: false,
              message: '실행 오류: ' + (error && error.message ? error.message : String(error))
            }
          });
        }
      };

      function safeStringify(value) {
        try {
          return JSON.stringify(value);
        } catch (error) {
          return String(value);
        }
      }
    `;

    const blob = new Blob([source], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    activeWorkerUrl = url;
    return new Worker(url);
  }

  function teardownWorker() {
    if (activeWorker) {
      activeWorker.terminate();
      activeWorker = null;
    }

    if (activeWorkerUrl) {
      URL.revokeObjectURL(activeWorkerUrl);
      activeWorkerUrl = null;
    }
  }

  function clearPendingTimeout() {
    if (activeTimeout) {
      window.clearTimeout(activeTimeout);
      activeTimeout = null;
    }
  }

  function renderIdle(message) {
    summary.textContent = message;
    resultsList.innerHTML = '<div class="empty-state">예제 테스트를 실행하면 여기에서 결과를 확인할 수 있습니다.</div>';
  }

  function renderError(message) {
    summary.innerHTML = '<span class="status-fail">실행 오류</span>';
    resultsList.innerHTML = '';

    const card = document.createElement('article');
    card.className = 'result-card is-error';
    card.appendChild(buildStatus('ERROR', false));
    card.appendChild(buildLine('message', message));
    resultsList.appendChild(card);
  }

  function renderResults(items, passed, total, fromFallback) {
    const allPassed = passed === total;
    if (!fromFallback) {
      summary.innerHTML = allPassed
        ? `<span class="status-success">총 ${passed}/${total} 통과</span>`
        : `<span class="status-warning">총 ${passed}/${total} 통과</span>`;
    }

    resultsList.innerHTML = '';

    items.forEach((item) => {
      const card = document.createElement('article');
      card.className = `result-card ${item.ok ? 'is-pass' : 'is-fail'}`;
      card.appendChild(buildStatus(`#${item.index} ${item.ok ? 'PASS' : 'FAIL'}`, item.ok));
      card.appendChild(buildLine('input', item.input));
      card.appendChild(buildLine('expected', item.expected));
      card.appendChild(buildLine('actual', item.actual));
      resultsList.appendChild(card);
    });
  }

  function buildStatus(text, ok) {
    const status = document.createElement('div');
    status.className = `result-card__status ${ok ? 'status-success' : 'status-fail'}`;
    status.textContent = text;
    return status;
  }

  function buildLine(label, value) {
    const line = document.createElement('div');
    line.className = 'result-line';

    const labelEl = document.createElement('span');
    labelEl.className = 'result-line__label';
    labelEl.textContent = label;

    const valueEl = document.createElement('code');
    valueEl.className = 'result-line__value';
    valueEl.textContent = value;

    line.appendChild(labelEl);
    line.appendChild(valueEl);
    return line;
  }

  function safeStringify(value) {
    try {
      return JSON.stringify(value);
    } catch (error) {
      return String(value);
    }
  }
})();
