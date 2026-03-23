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
    try {
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
        const ok = isEqual(actual, expected);

        if (ok) passed += 1;

        items.push({
          index: i + 1,
          ok,
          input: safeStringify(testCase.input),
          expected: safeStringify(expected),
          actual: safeStringify(actual),
        });
      }

      renderResults(items, passed, testCases.length);
    } catch (error) {
      renderError(`실행 오류: ${error && error.message ? error.message : String(error)}`);
    }
  });

  renderIdle('아직 실행하지 않았습니다.');

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

  function renderResults(items, passed, total) {
    const allPassed = passed === total;
    summary.innerHTML = allPassed
      ? `<span class="status-success">총 ${passed}/${total} 통과</span>`
      : `<span class="status-warning">총 ${passed}/${total} 통과</span>`;

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

  function isEqual(a, b) {
    return safeStringify(a) === safeStringify(b);
  }

  function safeStringify(value) {
    try {
      return JSON.stringify(value);
    } catch (error) {
      return String(value);
    }
  }
})();
