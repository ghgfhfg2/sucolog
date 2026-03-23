(function () {
  const page = document.querySelector('.problem-page');
  if (!page) return;

  const editor = document.getElementById('editor');
  const runBtn = document.getElementById('run-btn');
  const resetBtn = document.getElementById('reset-btn');
  const output = document.getElementById('results-output');

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
    output.textContent = '초기 코드로 되돌렸습니다.';
  });

  runBtn.addEventListener('click', () => {
    try {
      const userFactory = new Function(`${editor.value}\nreturn typeof ${functionName} !== 'undefined' ? ${functionName} : null;`);
      const userFn = userFactory();

      if (typeof userFn !== 'function') {
        output.textContent = `실패: ${functionName} 함수를 찾지 못했습니다.`;
        return;
      }

      const lines = [];
      let passed = 0;

      for (let i = 0; i < testCases.length; i += 1) {
        const testCase = testCases[i];
        const actual = userFn.apply(null, testCase.input || []);
        const expected = testCase.output;
        const ok = isEqual(actual, expected);

        if (ok) passed += 1;

        lines.push([
          `#${i + 1} ${ok ? 'PASS' : 'FAIL'}`,
          `input: ${safeStringify(testCase.input)}`,
          `expected: ${safeStringify(expected)}`,
          `actual: ${safeStringify(actual)}`,
        ].join('\n'));
      }

      output.textContent = [`총 ${passed}/${testCases.length} 통과`, '', ...lines].join('\n\n');
    } catch (error) {
      output.textContent = `실행 오류: ${error && error.message ? error.message : String(error)}`;
    }
  });

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
