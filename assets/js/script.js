const hiddenArr = ['knfs-product.github.io'];

document.addEventListener('DOMContentLoaded', () => {
  const lazyBackgrounds = document.querySelectorAll('#slider[data-bg]');
  const spinner = document.getElementById('spinner');
  const repoList = document.getElementById('prod-list');
  const searchInput = document.getElementById('searchInput');
  const categorySelect = document.getElementById('categorySelect'); // Dropdown for category filtering

  // Function to get query parameters
  function getQueryParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name) || '';
  }

  // Initialize search input and category based on query parameters
  searchInput.value = getQueryParam('search') || '';
  categorySelect.value = getQueryParam('category') || '';

  // Lazy load background images
  if ('IntersectionObserver' in window) {
    const lazyBackgroundObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const lazyBackground = entry.target;
          lazyBackground.style.backgroundImage = `url(${lazyBackground.dataset.bg})`;
          lazyBackgroundObserver.unobserve(lazyBackground);
        }
      });
    });

    lazyBackgrounds.forEach(lazyBackground => {
      lazyBackgroundObserver.observe(lazyBackground);
    });
  } else {
    lazyBackgrounds.forEach(lazyBackground => {
      lazyBackground.style.backgroundImage = `url(${lazyBackground.dataset.bg})`;
    });
  }

  // Fetch initial prod data
  fetchRepoData('knfs-product');

  let debounceTimeout;

  searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      const searchTerm = searchInput.value.trim().toLowerCase();
      const category = categorySelect.value;
      updateURL(searchTerm, category); // Update URL with new query parameters
      fetchRepoData('knfs-product', searchTerm, category);
    }, 300); // Adjust debounce delay as needed
  });

  categorySelect.addEventListener('change', () => {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const category = categorySelect.value;
    updateURL(searchTerm, category); // Update URL with new query parameters
    fetchRepoData('knfs-product', searchTerm, category);
  });

  // Update URL without reloading the page
  function updateURL(searchTerm, category) {
    const url = new URL(window.location.href);
    url.searchParams.set('search', searchTerm);
    url.searchParams.set('category', category);
    history.replaceState(null, '', url);
  }

  // Fetch and render prod data
  function fetchRepoData(username, searchTerm = '', category = '') {
    spinner.style.display = 'block'; // Show spinner
    fetch('assets/data/data.json')
      .then(response => response.json())
      .then(repos => {
        repoList.innerHTML = '';
        repos
          .filter(prod => hiddenArr.indexOf(prod.name) === -1)
          .filter(prod => prod.name.toLowerCase().includes(searchTerm))
          .filter(prod => category === '' || prod.for.includes(category)) // Filter by category
          .forEach(prod => {
            const repoItem = document.createElement('div');
            repoItem.classList.add('col-md-6', 'mb-4');
            repoItem.innerHTML = `
              <div class="card">
                <div class="card-body">
                  <h3 class="card-title">
                    <a href="${prod.home_url}" target="_blank" class="text-decoration-none hover-underline">${prod.name}</a>
                  </h3>
                  <div class="card-description text-muted">
                    <p>${prod.description}</p>
                  </div>
                </div>
              </div>  
            `;

            repoList.appendChild(repoItem);
          });
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      })
      .finally(() => {
        spinner.style.display = 'none';
      });
  }
});
