document.addEventListener('DOMContentLoaded', () => {
  const keywordInput = document.getElementById('keywordInput');
  const searchBtn = document.getElementById('searchBtn');
  const keywordError = document.getElementById('keywordError');
  const urlContainer = document.getElementById('urlContainer');
  const urlList = document.getElementById('urlList');
  const contentList = document.getElementById('contentList');
  const contentDisplay = document.getElementById('contentDisplay');

  // Загрузка сохраненного контента
  loadSavedContent();

  // Обработчик поиска
  searchBtn.addEventListener('click', searchByKeyword);

  // Поиск по ключевому слову
  async function searchByKeyword() {
    const keyword = keywordInput.value.trim();
    if (!keyword) {
      showError(keywordError, 'Please enter a keyword');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/urls?keyword=${encodeURIComponent(keyword)}`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Failed to fetch URLs');
      if (!data.urls || data.urls.length === 0) throw new Error('No URLs found');

      displayUrls(data.urls);
    } catch (err) {
      showError(keywordError, err.message);
    }
  }

  // Отображение URL
  function displayUrls(urls) {
    urlList.innerHTML = '';
    urls.forEach(url => {
      const li = document.createElement('li');
      li.textContent = url;
      li.addEventListener('click', () => downloadAndSaveContent(url));
      urlList.appendChild(li);
    });
    urlContainer.style.display = 'block';
  }

  // Загрузка и сохранение контента
  async function downloadAndSaveContent(url) {
    try {
      const response = await fetch(`http://localhost:3001/api/download?url=${encodeURIComponent(url)}`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Download failed');

      saveContent({
        url: url,
        content: data.content,
        size: data.size,
        timestamp: new Date().toISOString()
      });

      loadSavedContent();
      alert(`Content from ${url} saved successfully!`);
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  }

  // Сохранение в LocalStorage
  function saveContent(item) {
    const savedItems = JSON.parse(localStorage.getItem('savedContent') || '[]');
    savedItems.push(item);
    localStorage.setItem('savedContent', JSON.stringify(savedItems));
  }

  // Загрузка из LocalStorage
  function loadSavedContent() {
    contentList.innerHTML = '';
    const savedItems = JSON.parse(localStorage.getItem('savedContent') || '[]');

    savedItems.forEach(item => {
      const li = document.createElement('li');
      li.innerHTML = `
        <strong>${item.url}</strong><br>
        <small>${new Date(item.timestamp).toLocaleString()} • ${item.size} bytes</small>
      `;
      li.addEventListener('click', () => displayContent(item.content));
      contentList.appendChild(li);
    });
  }

  // Отображение контента
  function displayContent(content) {
    contentDisplay.textContent = content;
  }

  // Показать ошибку
  function showError(element, message) {
    element.textContent = message;
    setTimeout(() => element.textContent = '', 3000);
  }
});