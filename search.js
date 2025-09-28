// Agent(e) Search Engine - ASCII Art Interactive Interface
(function(){
    // Initialize ASCII art interface
    function initASCIIInterface() {
        // Add interactive functionality to search bar
        const searchBar = document.querySelector('.search-bar-ascii pre');
        if (searchBar) {
            searchBar.addEventListener('click', function() {
                // Create a real input field overlay
                createSearchInput();
            });
        }

        // Add functionality to buttons
        const buttons = document.querySelector('.buttons-ascii pre');
        if (buttons) {
            buttons.addEventListener('click', function(e) {
                // Single button - Search
                performSearch();
            });
        }

        // Add glitch effects
        addGlitchEffects();
        
        // Add typing animation to logo
        animateLogo();
    }

    function createSearchInput() {
        // Remove existing input if any
        const existingInput = document.querySelector('.search-input-overlay');
        if (existingInput) {
            existingInput.remove();
        }

        // Create input overlay
        const inputOverlay = document.createElement('div');
        inputOverlay.className = 'search-input-overlay';
        inputOverlay.innerHTML = `
            <div class="input-container">
                <input type="text" placeholder="Digite sua pesquisa..." autofocus>
                <div class="input-buttons">
                    <button class="search-btn">Buscar</button>
                </div>
            </div>
        `;

        // Style the overlay
        inputOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        `;

        const inputContainer = inputOverlay.querySelector('.input-container');
        inputContainer.style.cssText = `
            background: #000;
            border: 2px solid #ffffff;
            padding: 2rem;
            border-radius: 0;
            max-width: 600px;
            width: 90%;
            text-align: center;
        `;

        const input = inputOverlay.querySelector('input');
        input.style.cssText = `
            width: 100%;
            padding: 1rem;
            font-size: 1.2rem;
            background: #000;
            border: 1px solid #ffffff;
            color: #ffffff;
            font-family: 'Courier New', monospace;
            outline: none;
            margin-bottom: 1rem;
        `;

        const buttons = inputOverlay.querySelector('.input-buttons');
        buttons.style.cssText = `
            display: flex;
            gap: 1rem;
            justify-content: center;
        `;

        const searchBtn = inputOverlay.querySelector('.search-btn');
        
        searchBtn.style.cssText = `
            padding: 0.8rem 1.5rem;
            background: #000;
            border: 1px solid #ffffff;
            color: #ffffff;
            font-family: 'Courier New', monospace;
            cursor: pointer;
            transition: all 0.3s ease;
        `;
        
        searchBtn.addEventListener('mouseenter', function() {
            this.style.background = '#ffffff';
            this.style.color = '#000000';
        });
        
        searchBtn.addEventListener('mouseleave', function() {
            this.style.background = '#000000';
            this.style.color = '#ffffff';
        });

        // Add event listeners
        searchBtn.addEventListener('click', function() {
            const query = input.value.trim();
            if (query) {
                performSearch(query);
                inputOverlay.remove();
            }
        });


        // Close on escape or click outside
        inputOverlay.addEventListener('click', function(e) {
            if (e.target === inputOverlay) {
                inputOverlay.remove();
            }
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                inputOverlay.remove();
            }
        });

        document.body.appendChild(inputOverlay);
        input.focus();
    }

    function performSearch(query = '') {
        if (!query) {
            query = prompt('Digite sua pesquisa:');
        }
        if (query) {
            // Simulate search - in a real implementation, this would redirect to search results
            console.log('Searching for:', query);
            alert(`Buscando por: "${query}"\n\n(Esta é uma demonstração - em uma implementação real, isso redirecionaria para os resultados de busca)`);
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
            createSearchInput();
        }
        
        // Enter key on search bar
        if (e.key === 'Enter' && e.target.classList.contains('search-bar-ascii')) {
            createSearchInput();
        }
    });

    // Add hover effects for better UX
    const searchBar = document.querySelector('.search-bar-ascii');
    if (searchBar) {
        searchBar.title = 'Clique para pesquisar (Ctrl+K)';
    }

    const buttons = document.querySelector('.buttons-ascii');
    if (buttons) {
        buttons.title = 'Clique nos botões para pesquisar';
    }

})();
