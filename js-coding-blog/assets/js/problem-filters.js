(function () {
  const searchInput = document.getElementById('problem-search');
  const trackFilter = document.getElementById('track-filter');
  const difficultyFilter = document.getElementById('difficulty-filter');
  const topicFilter = document.getElementById('topic-filter');
  const problemGrid = document.getElementById('problem-grid');
  const problemCount = document.getElementById('problem-count');
  const emptyState = document.getElementById('problem-empty');

  if (!searchInput || !trackFilter || !difficultyFilter || !topicFilter || !problemGrid) return;

  const cards = Array.from(problemGrid.querySelectorAll('.problem-card'));

  searchInput.addEventListener('input', applyFilters);
  trackFilter.addEventListener('change', applyFilters);
  difficultyFilter.addEventListener('change', applyFilters);
  topicFilter.addEventListener('change', applyFilters);

  applyFilters();

  function applyFilters() {
    const keyword = searchInput.value.trim().toLowerCase();
    const track = trackFilter.value;
    const difficulty = difficultyFilter.value;
    const topic = topicFilter.value;

    let visibleCount = 0;

    cards.forEach((card) => {
      const title = card.dataset.title || '';
      const description = card.dataset.description || '';
      const tags = card.dataset.tags || '';
      const cardTrack = card.dataset.track || '';
      const cardDifficulty = card.dataset.difficulty || '';
      const cardTopic = card.dataset.topic || '';

      const matchesKeyword = !keyword || title.includes(keyword) || description.includes(keyword) || tags.includes(keyword);
      const matchesTrack = track === 'all' || cardTrack === track;
      const matchesDifficulty = difficulty === 'all' || cardDifficulty === difficulty;
      const matchesTopic = topic === 'all' || cardTopic === topic;
      const visible = matchesKeyword && matchesTrack && matchesDifficulty && matchesTopic;

      card.style.display = visible ? '' : 'none';
      if (visible) visibleCount += 1;
    });

    problemCount.textContent = `총 ${visibleCount}개 문제 표시 중`;
    emptyState.classList.toggle('is-hidden', visibleCount !== 0);
  }
})();
