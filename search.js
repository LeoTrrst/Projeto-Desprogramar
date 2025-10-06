// Agent(e) Search Engine - ASCII Art Interactive Interface
(function(){
    // Initialize ASCII art interface
    function initASCIIInterface() {
        // Get the search input and button elements
        const searchInput = document.getElementById('searchInput');
        const searchButton = document.getElementById('searchButton');

        // Add functionality to search button
        if (searchButton) {
            searchButton.addEventListener('click', function() {
                const query = searchInput ? searchInput.value.trim() : '';
                performSearch(query);
            });
        }

        // Add functionality to search input (Enter key)
        if (searchInput) {
            searchInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    const query = this.value.trim();
                    performSearch(query);
                }
            });
        }

        // Add glitch effects
        addGlitchEffects();
        
        // Add typing animation to logo
        animateLogo();
    }

    function performSearch(query = '') {
        if (!query) {
            // If no query provided, focus the input field
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.focus();
            }
            return;
        }
        
        if (query) {
            // Simulate search - in a real implementation, this would redirect to search results
            console.log('Searching for:', query);
            
            // Add a visual feedback effect
            const searchButton = document.getElementById('searchButton');
            if (searchButton) {
                searchButton.style.background = '#00ff00';
                searchButton.style.color = '#000000';
                searchButton.textContent = 'Buscando...';
                
                setTimeout(() => {
                    searchButton.style.background = '#000000';
                    searchButton.style.color = '#ffffff';
                    searchButton.textContent = 'Buscar';
                }, 2000);
            }
            
            // Show search result (in a real implementation, this would redirect to search results)
            setTimeout(() => {
                alert(`Buscando por: "${query}"\n\n(Esta é uma demonstração - em uma implementação real, isso redirecionaria para os resultados de busca)`);
            }, 1000);
        }
    }

    function addGlitchEffects() {
        const logo = document.querySelector('.logo-ascii pre');
        if (logo) {
            // Random glitch effect
            setInterval(() => {
                if (Math.random() < 0.1) { // 10% chance every interval
                    logo.style.animation = 'none';
                    setTimeout(() => {
                        logo.style.animation = 'glitch 0.3s ease-in-out';
                    }, 10);
                }
            }, 2000);
        }
    }

    function animateLogo() {
        const logo = document.querySelector('.logo-ascii pre');
        if (logo) {
            // Add a subtle pulsing effect
            logo.style.animation = 'pulse 3s ease-in-out infinite';
        }
    }

    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.8; }
        }
        
        .search-input-overlay {
            animation: fadeIn 0.3s ease-in-out;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
    `;
    document.head.appendChild(style);

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initASCIIInterface);
    } else {
        initASCIIInterface();
    }

    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + K to focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.focus();
            }
        }
    });

    // Add hover effects for better UX
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.title = 'Digite sua pesquisa (Ctrl+K para focar)';
    }

    const searchButton = document.getElementById('searchButton');
    if (searchButton) {
        searchButton.title = 'Clique para pesquisar';
    }

})();
