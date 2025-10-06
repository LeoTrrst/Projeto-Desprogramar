// Agent(e) Search Engine - Terminal Interface
(function(){
    let commandHistory = [];
    let historyIndex = -1;
    let currentCommand = '';

    // Initialize terminal interface
    function initTerminalInterface() {
        const terminalInput = document.getElementById('terminalInput');
        const terminalOutput = document.querySelector('.terminal-output');
        const cursor = document.querySelector('.cursor');

        if (!terminalInput || !terminalOutput || !cursor) return;

        // Focus on terminal input
        terminalInput.focus();

        // Handle input events
        terminalInput.addEventListener('keydown', handleKeyDown);
        terminalInput.addEventListener('input', handleInput);
        terminalInput.addEventListener('focus', handleFocus);
        terminalInput.addEventListener('blur', handleBlur);

        // Add glitch effects
        addGlitchEffects();
        
        // Add typing animation to logo
        animateLogo();

        // Auto-focus terminal
        setTimeout(() => {
            terminalInput.focus();
        }, 100);
    }

    function handleKeyDown(e) {
        const terminalInput = document.getElementById('terminalInput');
        const terminalOutput = document.querySelector('.terminal-output');

        switch(e.key) {
            case 'Enter':
                e.preventDefault();
                executeCommand(terminalInput.value.trim());
                break;
            case 'ArrowUp':
                e.preventDefault();
                navigateHistory(-1);
                break;
            case 'ArrowDown':
                e.preventDefault();
                navigateHistory(1);
                break;
            case 'Tab':
                e.preventDefault();
                // Could implement tab completion here
                break;
        }
    }

    function handleInput(e) {
        updateCursorPosition();
    }

    function handleFocus() {
        const cursor = document.querySelector('.cursor');
        if (cursor) {
            cursor.style.display = 'block';
        }
    }

    function handleBlur() {
        const cursor = document.querySelector('.cursor');
        if (cursor) {
            cursor.style.display = 'none';
        }
    }

    function updateCursorPosition() {
        const terminalInput = document.getElementById('terminalInput');
        const cursor = document.querySelector('.cursor');
        
        if (terminalInput && cursor) {
            // Create a temporary span to measure text width
            const tempSpan = document.createElement('span');
            tempSpan.style.font = window.getComputedStyle(terminalInput).font;
            tempSpan.style.visibility = 'hidden';
            tempSpan.style.position = 'absolute';
            tempSpan.style.whiteSpace = 'pre';
            tempSpan.textContent = terminalInput.value;
            
            document.body.appendChild(tempSpan);
            const textWidth = tempSpan.offsetWidth;
            document.body.removeChild(tempSpan);
            
            cursor.style.left = textWidth + 'px';
        }
    }

    function navigateHistory(direction) {
        if (commandHistory.length === 0) return;

        historyIndex += direction;
        
        if (historyIndex < 0) {
            historyIndex = -1;
            currentCommand = '';
        } else if (historyIndex >= commandHistory.length) {
            historyIndex = commandHistory.length - 1;
        }

        const terminalInput = document.getElementById('terminalInput');
        if (terminalInput) {
            terminalInput.value = historyIndex >= 0 ? commandHistory[historyIndex] : '';
            updateCursorPosition();
        }
    }

    function executeCommand(command) {
        const terminalInput = document.getElementById('terminalInput');
        const terminalOutput = document.querySelector('.terminal-output');

        if (!command) {
            addOutputLine('');
            return;
        }

        // Add command to history
        if (commandHistory[commandHistory.length - 1] !== command) {
            commandHistory.push(command);
        }
        historyIndex = commandHistory.length;

        // Display the command
        addCommandLine(command);

        // Execute command
        const result = processCommand(command);
        if (result) {
            addOutputLine(result);
        }

        // Clear input
        if (terminalInput) {
            terminalInput.value = '';
            updateCursorPosition();
        }
    }

    function addCommandLine(command) {
        const terminalOutput = document.querySelector('.terminal-output');
        const commandLine = document.createElement('div');
        commandLine.className = 'terminal-history';
        commandLine.innerHTML = `<span class="prompt">user@agent:~$</span> <span class="command">${command}</span>`;
        terminalOutput.appendChild(commandLine);
        scrollToBottom();
    }

    function addOutputLine(text) {
        const terminalOutput = document.querySelector('.terminal-output');
        const outputLine = document.createElement('div');
        outputLine.className = 'output-line';
        outputLine.textContent = text;
        terminalOutput.appendChild(outputLine);
        scrollToBottom();
    }

    function scrollToBottom() {
        const terminalBody = document.querySelector('.terminal-body');
        if (terminalBody) {
            // Smooth scroll to bottom
            terminalBody.scrollTo({
                top: terminalBody.scrollHeight,
                behavior: 'smooth'
            });
        }
    }

    function processCommand(command) {
        const parts = command.toLowerCase().split(' ');
        const cmd = parts[0];
        const args = parts.slice(1);

        switch(cmd) {
            case 'search':
                if (args.length === 0) {
                    return 'Uso: search <termo de busca>';
                }
                const query = args.join(' ');
                performSearch(query);
                return `Buscando por: "${query}"...`;

            case 'help':
                return `Comandos disponíveis:
  search <termo>  - Pesquisar na web
  clear          - Limpar o terminal
  help           - Mostrar esta ajuda
  about          - Informações sobre o Agent(e)
  version        - Versão do sistema
  whoami         - Identidade do usuário`;

            case 'clear':
                clearTerminal();
                return null;

            case 'about':
                return `Agent(e) Search Engine v1.0.0
Motor de busca com interface terminal Linux
Desenvolvido com tecnologia ASCII art`;

            case 'version':
                return 'Agent(e) Terminal v1.0.0 - Linux Terminal Emulator';

            case 'whoami':
                return `Você é o produto beta daquilo que procura.
Identidade: usuário-consumidor #${Math.floor(Math.random() * 9999)}
Status: monitorado ativamente
Última atualização: ${new Date().toLocaleString('pt-BR')}`;

            case 'ls':
                return `agent-search.js
terminal-interface.css
README.md
LICENSE`;

            case 'pwd':
                return '/home/user/agent-search';

            case 'whoami':
                return 'user';

            case 'date':
                return new Date().toLocaleString('pt-BR');

            default:
                return `Comando não encontrado: ${cmd}. Digite 'help' para ver comandos disponíveis.`;
        }
    }

    function clearTerminal() {
        const terminalOutput = document.querySelector('.terminal-output');
        if (terminalOutput) {
            terminalOutput.innerHTML = '';
        }
    }

    function performSearch(query = '') {
        if (!query) {
            return;
        }
        
            // Simulate search - in a real implementation, this would redirect to search results
            console.log('Searching for:', query);
            
            // Show search result (in a real implementation, this would redirect to search results)
            setTimeout(() => {
            addOutputLine(`Resultados da busca por "${query}":`);
            addOutputLine(`1. https://example.com/result1 - Resultado relevante 1`);
            addOutputLine(`2. https://example.com/result2 - Resultado relevante 2`);
            addOutputLine(`3. https://example.com/result3 - Resultado relevante 3`);
            addOutputLine(`(Esta é uma demonstração - em uma implementação real, isso redirecionaria para os resultados de busca)`);
            }, 1000);
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
        document.addEventListener('DOMContentLoaded', initTerminalInterface);
    } else {
        initTerminalInterface();
    }

    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + K to focus terminal
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const terminalInput = document.getElementById('terminalInput');
            if (terminalInput) {
                terminalInput.focus();
            }
        }
        
        // Escape to clear terminal
        if (e.key === 'Escape') {
            const terminalInput = document.getElementById('terminalInput');
            if (terminalInput) {
                terminalInput.value = '';
                updateCursorPosition();
            }
        }
    });

    // Add hover effects for better UX
    const terminalInput = document.getElementById('terminalInput');
    if (terminalInput) {
        terminalInput.title = 'Digite comandos do terminal (Ctrl+K para focar, Esc para limpar)';
    }

    // Initialize popup functionality
    function initPopups() {
        const popupTriggers = document.querySelectorAll('.popup-trigger');
        const popups = document.querySelectorAll('.popup');
        
        popupTriggers.forEach(trigger => {
            const popupId = trigger.getAttribute('data-popup');
            const popup = document.getElementById(`popup-${popupId}`);
            
            if (popup) {
                let timeoutId;
                
                trigger.addEventListener('mouseenter', () => {
                    clearTimeout(timeoutId);
                    // Hide all other popups
                    popups.forEach(p => p.classList.remove('show'));
                    // Show current popup
                    popup.classList.add('show');
                });
                
                trigger.addEventListener('mouseleave', () => {
                    timeoutId = setTimeout(() => {
                        popup.classList.remove('show');
                    }, 100);
                });
                
                popup.addEventListener('mouseenter', () => {
                    clearTimeout(timeoutId);
                });
                
                popup.addEventListener('mouseleave', () => {
                    timeoutId = setTimeout(() => {
                        popup.classList.remove('show');
                    }, 100);
                });
            }
        });
        
        // Hide all popups when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.popup-trigger') && !e.target.closest('.popup')) {
                popups.forEach(popup => popup.classList.remove('show'));
            }
        });
    }

    // Initialize popups when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPopups);
    } else {
        initPopups();
    }

    // Floating Commands System
    function initFloatingCommands() {
        const commands = [
            "🔍 Coletando intenções...",
            "👁️ Analisando padrões comportamentais...",
            "📡 Atualizando sua probabilidade de arrependimento..."
        ];
        
        let currentCommandIndex = 0;
        let isTyping = false;
        
        function showFloatingCommand() {
            if (isTyping) return;
            
            const floatingCommand = document.querySelector('.floating-command');
            const floatingText = document.querySelector('.floating-text');
            
            if (!floatingCommand || !floatingText) return;
            
            isTyping = true;
            const command = commands[currentCommandIndex];
            
            // Reset and show
            floatingCommand.classList.remove('show', 'complete');
            floatingText.textContent = '';
            
            setTimeout(() => {
                floatingCommand.classList.add('show', 'typing');
                typeText(floatingText, command, () => {
                    floatingCommand.classList.remove('typing');
                    floatingCommand.classList.add('complete');
                    
                    // Hide after 3 seconds
                    setTimeout(() => {
                        floatingCommand.classList.remove('show', 'complete');
                        isTyping = false;
                    }, 3000);
                });
            }, 100);
            
            // Move to next command
            currentCommandIndex = (currentCommandIndex + 1) % commands.length;
        }
        
        function typeText(element, text, callback) {
            let index = 0;
            const typingSpeed = 50; // milliseconds per character
            
            function typeChar() {
                if (index < text.length) {
                    element.textContent += text[index];
                    index++;
                    setTimeout(typeChar, typingSpeed);
                } else {
                    if (callback) callback();
                }
            }
            
            typeChar();
        }
        
        // Show first command after 2 seconds
        setTimeout(showFloatingCommand, 2000);
        
        // Then show every 60 seconds
        setInterval(showFloatingCommand, 60000);
    }

    // Initialize floating commands when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFloatingCommands);
    } else {
        initFloatingCommands();
    }

    // Monitoring Log System
    function initMonitoringLog() {
        const logMessages = [
            { module: "tracking.module", message: "nova intenção detectada: \"dúvida disfarçada de busca\"" },
            { module: "memory.cache", message: "padrão emocional: hesitação" },
            { module: "prediction.engine", message: "próxima ação: clicar no botão errado" },
            { module: "data.node", message: "índice de confiança atualizado: 82%" },
            { module: "empathy.override", message: "simulando proximidade" },
            { module: "behavior.analyzer", message: "curiosidade detectada: nível alto" },
            { module: "attention.tracker", message: "foco disperso: 3 pontos simultâneos" },
            { module: "intent.predictor", message: "probabilidade de abandono: 23%" },
            { module: "emotion.scanner", message: "estado: contemplativo" },
            { module: "pattern.matcher", message: "comportamento similar a usuário #4729" },
            { module: "surveillance.core", message: "movimento do mouse: padrão circular" },
            { module: "psychology.engine", message: "impulso de busca: necessidade de validação" },
            { module: "neural.mapper", message: "conexões ativas: 847 neurônios" },
            { module: "consciousness.probe", message: "nível de consciência: parcialmente ativo" },
            { module: "reality.filter", message: "distorção perceptiva: mínima" }
        ];
        
        let currentMessageIndex = 0;
        
        function updateLog() {
            const logTime = document.getElementById('logTime');
            const logModule = document.getElementById('logModule');
            const logMessage = document.getElementById('logMessage');
            
            if (!logTime || !logModule || !logMessage) return;
            
            // Update time
            const now = new Date();
            const timeString = now.toLocaleTimeString('pt-BR', { 
                hour12: false, 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit' 
            });
            logTime.textContent = timeString;
            
            // Update message
            const currentLog = logMessages[currentMessageIndex];
            logModule.textContent = currentLog.module;
            logMessage.textContent = currentLog.message;
            
            // Move to next message
            currentMessageIndex = (currentMessageIndex + 1) % logMessages.length;
        }
        
        // Update immediately
        updateLog();
        
        // Update every 15-30 seconds randomly
        function scheduleNextUpdate() {
            const randomDelay = Math.random() * 15000 + 15000; // 15-30 seconds
            setTimeout(() => {
                updateLog();
                scheduleNextUpdate();
            }, randomDelay);
        }
        
        scheduleNextUpdate();
        
        // Also update time every second
        setInterval(() => {
            const logTime = document.getElementById('logTime');
            if (logTime) {
                const now = new Date();
                const timeString = now.toLocaleTimeString('pt-BR', { 
                    hour12: false, 
                    hour: '2-digit', 
                    minute: '2-digit', 
                    second: '2-digit' 
                });
                logTime.textContent = timeString;
            }
        }, 1000);
    }

    // Initialize monitoring log when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMonitoringLog);
    } else {
        initMonitoringLog();
    }

    // Configuration Panel System
    function initConfigPanel() {
        // Toggle switches
        const toggles = document.querySelectorAll('.toggle');
        toggles.forEach(toggle => {
            toggle.addEventListener('click', function() {
                const configType = this.getAttribute('data-config');
                
                if (configType === 'rastros' || configType === 'hesitacao' || configType === 'identidade') {
                    // These toggles cannot be turned off
                    showConfigWarning('Essa opção não pode ser alterada. Você já consentiu antes de chegar aqui.');
                    return;
                }
                
                this.classList.toggle('active');
                const text = this.querySelector('.toggle-text');
                text.textContent = this.classList.contains('active') ? 'Ativo' : 'Inativo';
                
                // Show config sync message
                showConfigLog(`config.sync | preferências ignoradas | controle restaurado`);
            });
        });

        // Sliders
        const sliders = document.querySelectorAll('.slider');
        sliders.forEach(slider => {
            slider.addEventListener('input', function() {
                const value = this.value;
                const valueSpan = this.parentElement.querySelector('.slider-value');
                valueSpan.textContent = value + '%';
                
                // Show config sync message
                showConfigLog(`config.sync | ajuste registrado | comportamento monitorado`);
            });
        });

        // Radio buttons
        const radioGroups = document.querySelectorAll('.radio-group');
        radioGroups.forEach(group => {
            const radios = group.querySelectorAll('input[type="radio"]');
            radios.forEach(radio => {
                radio.addEventListener('change', function() {
                    showConfigLog(`config.sync | seleção processada | perfil atualizado`);
                });
            });
        });

        // Select dropdowns
        const selects = document.querySelectorAll('.config-select');
        selects.forEach(select => {
            select.addEventListener('change', function() {
                showConfigLog(`config.sync | filtro aplicado | realidade ajustada`);
            });
        });

        // Track time spent reading config
        let readingTime = 0;
        const readingInterval = setInterval(() => {
            readingTime += 1;
            if (readingTime === 10) {
                showConfigWarning('Tempo de leitura acima da média. Curiosidade registrada.');
            }
        }, 1000);

        // Clear interval when popup closes
        const configPopup = document.getElementById('popup-configuracoes');
        if (configPopup) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                        if (!configPopup.classList.contains('show')) {
                            clearInterval(readingInterval);
                        }
                    }
                });
            });
            observer.observe(configPopup, { attributes: true });
        }
    }

    // Global functions for config panel
    window.gerarRelatorio = function() {
        const warning = document.getElementById('configWarning');
        if (warning) {
            warning.textContent = 'Relatório gerado. Personalidade vendida com sucesso.';
            warning.style.color = '#ff6666';
            
            setTimeout(() => {
                warning.textContent = '';
            }, 3000);
        }
        
        showConfigLog(`report.generator | dados pessoais coletados | monetização ativa`);
    };

    window.modoAvancado = function() {
        const terminalInput = document.getElementById('terminalInput');
        if (terminalInput) {
            terminalInput.focus();
            terminalInput.value = '/whoami';
            updateCursorPosition();
            
            // Execute the command
            setTimeout(() => {
                executeCommand('/whoami');
            }, 100);
        }
        
        showConfigLog(`advanced.mode | acesso negado | privilégios insuficientes`);
    };

    function showConfigWarning(message) {
        const warning = document.getElementById('configWarning');
        if (warning) {
            warning.textContent = message;
            warning.style.color = '#ff6666';
            
            setTimeout(() => {
                warning.textContent = '';
            }, 3000);
        }
    }

    function showConfigLog(message) {
        // Add to monitoring log
        const logModule = document.getElementById('logModule');
        const logMessage = document.getElementById('logMessage');
        
        if (logModule && logMessage) {
            const parts = message.split(' | ');
            if (parts.length >= 3) {
                logModule.textContent = parts[0];
                logMessage.textContent = parts.slice(1).join(' | ');
            }
        }
        
        // Flash effect
        document.body.style.background = '#0a0a0a';
        setTimeout(() => {
            document.body.style.background = '#000000';
        }, 100);
    }

    // Initialize config panel when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initConfigPanel);
    } else {
        initConfigPanel();
    }


})();
