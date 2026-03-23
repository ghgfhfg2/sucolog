(function () {
  const searchInput = document.getElementById('problem-search');
  const difficultyFilter = document.getElementById('difficulty-filter');
  const categoryFilter = document.getElementById('category-filter');
  const problemGrid = document.getElementById('problem-grid');
  const problemCount = document.getElementById('problem-count');
  const emptyState = document.getElementById('problem-empty');

  if (!searchInput || !difficultyFilter || !categoryFilter || !problemGrid) return;

  const cards = Array.from(problemGrid.querySelectorAll('.problem-card'));

  searchInput.addEventListener('input', applyFilters);
  difficultyFilter.addEventListener('change', applyFilters);
  categoryFilter.addEventListener('change', applyFilters);

  applyFilters();

  function applyFilters() {
    const keyword = searchInput.value.trim().toLowerCase();
    const difficulty = difficultyFilter.value;
    const category = categoryFilter.value;

    let visibleCount = 0;

    cards.forEach((card) => {
      const title = card.dataset.title || '';
      const description = card.dataset.description || '';
      const cardDifficulty = card.dataset.difficulty || '';
      const cardCategory = card.dataset.category || '';

      const matchesKeyword = !keyword || title.includes(keyword) || description.includes(keyword);
      const matchesDifficulty = difficulty === 'all' || cardDifficulty === difficulty;
      const matchesCategory = category === 'all' || cardCategory === category;
      const visible = matchesKeyword && matchesDifficulty && matchesCategory;

      card.style.display = visible ? '' : 'none';
      if (visible) visibleCount += 1;
    });

    problemCount.textContent = `총 ${visibleCount}개 문제 표시 중`;
    emptyState.classList.toggle('is-hidden', visibleCount !== 0);
  }
})();
