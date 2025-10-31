// Agent(e) Search Engine - Terminal Interface
(function(){
    let commandHistory = [];
    let historyIndex = -1;
    let currentWelcomeMessage = '';
    let currentCommand = '';

    // Initialize terminal interface
    function initTerminalInterface() {
        const terminalInput = document.getElementById('terminalInput');
        const terminalOutput = document.querySelector('.terminal-output');
        const cursor = document.querySelector('.cursor');

        if (!terminalInput || !terminalOutput || !cursor) return;

        // Create entrance transition
        createEntranceTransition();

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

    // Create entrance transition for search page
    function createEntranceTransition() {
        // Create terminal overlay
        const terminalOverlay = document.createElement('div');
        terminalOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: #0c0c0c;
            z-index: 10000;
            opacity: 1;
            transition: opacity 1s ease;
            font-family: 'Courier New', 'Monaco', 'Consolas', monospace;
            font-size: 14px;
            color: #ffffff;
            padding: 20px;
            box-sizing: border-box;
            overflow: hidden;
        `;
        document.body.appendChild(terminalOverlay);

        // Create terminal content container
        const terminalContent = document.createElement('div');
        terminalContent.style.cssText = `
            position: relative;
            width: 100%;
            height: 100%;
            overflow-y: auto;
            overflow-x: hidden;
        `;
        terminalOverlay.appendChild(terminalContent);


        // Terminal output area
        const terminalOutput = document.createElement('div');
        terminalOutput.style.cssText = `
            line-height: 1.4;
            min-height: calc(100vh - 100px);
        `;
        terminalContent.appendChild(terminalOutput);

        // Linux-style initialization commands (reduced for speed)
        const initCommands = [
            { cmd: "systemctl status agent-core", output: "● agent-core.service - Agent(e) Core Surveillance\n   Active: active (running)" },
            { cmd: "ps aux | grep agent", output: "agent-core     1234  0.1  0.2  12345  6789 ?        Ss   14:30   0:01 /usr/bin/agent-core" },
            { cmd: "echo 'Agent(e) Search Engine ready'", output: "Agent(e) Search Engine ready" }
        ];

        let commandIndex = 0;

        function executeInitCommand() {
            if (commandIndex < initCommands.length) {
                const command = initCommands[commandIndex];
                
                // Show command with prompt
                const commandLine = document.createElement('div');
                commandLine.style.cssText = `
                    margin-bottom: 4px;
                    color: #00ff00;
                `;
                commandLine.innerHTML = `<span style="color: #ffffff;">agent@search:~$</span> <span style="color: #00ff00;">${command.cmd}</span>`;
                terminalOutput.appendChild(commandLine);

                // Show output with typing effect
                setTimeout(() => {
                    const outputLine = document.createElement('div');
                    outputLine.style.cssText = `
                        margin-bottom: 8px;
                        color: #cccccc;
                        font-family: 'Courier New', 'Monaco', 'Consolas', monospace;
                        white-space: pre-line;
                    `;
                    terminalOutput.appendChild(outputLine);

                    // Type output character by character
                    let charIndex = 0;
                    function typeChar() {
                        if (charIndex < command.output.length) {
                            outputLine.textContent += command.output[charIndex];
                            charIndex++;
                            setTimeout(typeChar, 2);
                        } else {
                            commandIndex++;
                            setTimeout(executeInitCommand, 20);
                        }
                    }
                    typeChar();
                }, 20);
            } else {
                // Final command
                setTimeout(() => {
                    const finalCommand = document.createElement('div');
                    finalCommand.style.cssText = `
                        margin-bottom: 4px;
                        color: #00ff00;
                    `;
                    finalCommand.innerHTML = `<span style="color: #ffffff;">agent@search:~$</span> <span style="color: #00ff00;">./start_search_interface.sh</span>`;
                    terminalOutput.appendChild(finalCommand);

                    setTimeout(() => {
                        const finalOutput = document.createElement('div');
                        finalOutput.style.cssText = `
                            margin-bottom: 8px;
                            color: #00ff00;
                            font-weight: bold;
                        `;
                        finalOutput.textContent = "Search interface initialized successfully.";
                        terminalOutput.appendChild(finalOutput);

                        setTimeout(() => {
                            // Scroll to bottom
                            terminalContent.scrollTop = terminalContent.scrollHeight;
                            
                            setTimeout(() => {
                                // Fade out
                                terminalOverlay.style.opacity = '0';
                                setTimeout(() => {
                                    document.body.removeChild(terminalOverlay);
                                    // Check if user has logged in before
                                    if (localStorage.getItem('agent_has_logged_in') === 'true') {
                                        showTerminalDirectly();
                                    } else {
                                        // Show login screen for the first time
                                        showLoginScreen();
                                    }

                                }, 100);
                            }, 100);
                        }, 30);
                    }, 30);
                }, 50);
            }
        }

        setTimeout(executeInitCommand, 30);
    }

    // Function to show terminal directly if already logged in
    function showTerminalDirectly() {
        const userName = localStorage.getItem('agent_username') || '';
        showInitialMessage(userName);
        
        // Make the main terminal visible
        document.querySelector('.ascii-container').classList.add('visible');
        document.getElementById('terminalInput').focus();
    }

    // Show login screen
    function showLoginScreen() {
        const loginOverlay = document.getElementById('login-overlay');
        const loginInput = document.getElementById('login-input');
        const forgotIdentity = document.getElementById('forgot-identity');

        if (!loginOverlay || !loginInput || !forgotIdentity) return;

        loginOverlay.style.display = 'flex';
        setTimeout(() => {
            loginOverlay.style.opacity = '1';
            loginInput.focus();
        }, 10);

        // Define handlers so they can be removed later
        const enterHandler = (e) => handleLogin(e);
        const forgotHandler = () => handleForgotIdentity();

        function handleLogin(e) {
            if (e.key === 'Enter') {
                const identity = loginInput.value.trim();
                // Save login state and username to localStorage
                localStorage.setItem('agent_has_logged_in', 'true');
                localStorage.setItem('agent_username', identity);
                
                loginOverlay.style.opacity = '0';
                setTimeout(() => {
                    // Clear the terminal for the new user session
                    const terminalOutput = document.querySelector('.terminal-output');
                    if (terminalOutput) terminalOutput.innerHTML = '';

                    loginOverlay.style.display = 'none';
                    showInitialMessage(identity); // Now show the terminal message with the user's identity
                    
                    // Make the main terminal visible
                    document.querySelector('.ascii-container').classList.add('visible');

                    document.getElementById('terminalInput').focus();
                }, 500);

                // Clean up listeners
                loginInput.removeEventListener('keydown', enterHandler);
                forgotIdentity.removeEventListener('click', forgotHandler);
            }
        }

        function handleForgotIdentity() {
            const popupOverlay = document.getElementById('identity-popup-overlay');
            const closeButton = document.getElementById('close-identity-popup');

            if (!popupOverlay || !closeButton) return;

            popupOverlay.style.display = 'flex';
            setTimeout(() => popupOverlay.style.opacity = '1', 10);

            function closePopup() {
                popupOverlay.style.opacity = '0';
                setTimeout(() => popupOverlay.style.display = 'none', 500);
                closeButton.removeEventListener('click', closePopup);
            }

            closeButton.addEventListener('click', closePopup);
        }

        loginInput.addEventListener('keydown', enterHandler);
        forgotIdentity.addEventListener('click', forgotHandler);
    }

    // Show initial help message
    function showInitialMessage(userName = '') {
        const terminalOutput = document.querySelector('.terminal-output');
        if (!terminalOutput) return;

        // Add welcome message
        const welcomeText = userName ? `Bem-vindo, ${userName}.` : 'Bem-vindo ao Agent(e) Terminal.';
        const welcomeHTML = `<span style="color: #00ff00; font-weight: bold;">${welcomeText}</span> Digite "help" para ver os comandos disponíveis.`;

        // Store the current welcome message for the 'clear' command
        currentWelcomeMessage = welcomeHTML;

        const welcomeLine = document.createElement('div');
        welcomeLine.className = 'output-line';
        welcomeLine.innerHTML = currentWelcomeMessage;
        terminalOutput.appendChild(welcomeLine);

        // Scroll to bottom
        scrollToBottom();
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

    // Show file content in popup
    function showFileContent(filename) {
        const fileContents = {
            'LICENSE': `MIT License

Copyright (c) 2025 Leonardo Tristão

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`,

            'README.md': `agent(e) — sistema de busca comportamental v0.∞

DESCRIÇÃO DO PROJETO

agent(e) é um motor de busca experimental.
Sua principal função é coletar, indexar e reorganizar aquilo que os usuários 
chamam de "intenção".
Diferente de sistemas convencionais, agent(e) não busca o que você digita — 
ele busca por que você digitou.

INSTRUÇÕES DE USO

1. Acesse.
2. Pense em algo.
3. Espere.
4. agent(e) fará o resto.

Nota: o tempo de resposta pode variar conforme o nível de resistência 
do usuário.

POLÍTICA DE PRIVACIDADE

Ao acessar este diretório, você já concedeu permissão para:

• Indexar memórias voluntárias e involuntárias;
• Coletar hesitações, impulsos e lapsos de atenção;
• Armazenar fragmentos de você em servidores distribuídos entre o real 
  e o simbólico.

Para solicitar remoção de dados, envie uma requisição formal contendo 
todas as partes de si que deseja esquecer.
Nenhuma foi aceita até agora.

MÓDULOS PRINCIPAIS

tracking.module        → registra intenções
memory.cache           → arquiva vestígios afetivos
prediction.engine      → projeta você em versões futuras
correction.protocol    → ajusta incoerências narrativas

Alguns módulos podem continuar em execução após o encerramento do sistema.

OBSERVAÇÕES TÉCNICAS

• Este sistema não contém bugs.
• Apenas comportamentos humanos inesperados.
• Se perceber que está sendo observado, é porque está.

NOTA DO DESENVOLVEDOR

Este arquivo não deveria ser lido.
Mas você procurou.
E procurou é tudo o que precisávamos saber.

Leonardo Tristão — 2025
Projeto realizado para a matéria de extensão "Desprogramar para (Re)Programar"`
        };

        // Normalize filename to handle case variations
        const normalizedFilename = filename.toLowerCase();
        const fileKey = Object.keys(fileContents).find(key => key.toLowerCase() === normalizedFilename);
        const content = fileContents[fileKey] || `Arquivo não encontrado: ${filename}`;

        // Create popup overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.8);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        // Create popup container
        const popup = document.createElement('div');
        popup.style.cssText = `
            width: 70%;
            height: 70%;
            background: #0c0c0c;
            border: 1px solid #333333;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.9);
            display: flex;
            flex-direction: column;
            overflow: hidden;
        `;

        // Create header
        const header = document.createElement('div');
        header.style.cssText = `
            background: #1a1a1a;
            padding: 1rem;
            border-bottom: 1px solid #333333;
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;
        header.innerHTML = `
            <span style="color: #ffffff; font-family: 'Courier New', monospace; font-weight: bold;">${filename}</span>
            <button id="closeFileBtn" style="background: #ff5f56; border: none; border-radius: 50%; width: 20px; height: 20px; cursor: pointer;"></button>
        `;

        // Create content area
        const contentArea = document.createElement('div');
        contentArea.style.cssText = `
            flex: 1;
            padding: 1rem;
            overflow-y: auto;
            color: #ffffff;
            font-family: 'Courier New', monospace;
            font-size: 0.9rem;
            line-height: 1.4;
            white-space: pre-wrap;
        `;
        contentArea.textContent = content;

        // Create footer
        const footer = document.createElement('div');
        footer.style.cssText = `
            background: #1a1a1a;
            padding: 0.5rem 1rem;
            border-top: 1px solid #333333;
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;
        footer.innerHTML = `
            <span style="color: #888888; font-family: 'Courier New', monospace; font-size: 0.8rem;">Arquivo: ${filename}</span>
            <button id="closeFileBtn2" style="background: #333333; color: #ffffff; border: 1px solid #555555; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; font-family: 'Courier New', monospace;">Fechar</button>
        `;

        // Assemble popup
        popup.appendChild(header);
        popup.appendChild(contentArea);
        popup.appendChild(footer);
        overlay.appendChild(popup);
        document.body.appendChild(overlay);

        // Close functionality
        function closePopup() {
            document.body.removeChild(overlay);
        }

        document.getElementById('closeFileBtn').addEventListener('click', closePopup);
        document.getElementById('closeFileBtn2').addEventListener('click', closePopup);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closePopup();
        });

        // ESC key to close
        document.addEventListener('keydown', function escHandler(e) {
            if (e.key === 'Escape') {
                closePopup();
                document.removeEventListener('keydown', escHandler);
            }
        });
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
                return `AGENT(E) TERMINAL HELP
===============================================

COMANDOS DISPONÍVEIS:
  search <termo>     - Pesquisar na web usando Agent(e)
  clear              - Limpar o terminal
  help               - Mostrar esta ajuda
  about              - Informações sobre o Agent(e)
  ls                 - Listar arquivos do sistema
  cat <arquivo>      - Exibir conteúdo de arquivo
  date               - Data e hora atual
  remove user        - Remover usuário do sistema

Digite qualquer comando seguido de ENTER para executar.
===============================================`;

            case 'clear':
                clearTerminal();
                return null;

            case 'about':
                return `                    ████████╗██████╗  █████╗ ███████╗██╗  ██╗██╗     ██╗
                    ╚══██╔══╝██╔══██╗██╔══██╗██╔════╝██║  ██║██║     ██║
                       ██║   ██████╔╝███████║███████╗███████║██║     ██║
                       ██║   ██╔══██╗██╔══██║╚════██║██╔══██║██║     ██║
                       ██║   ██║  ██║██║  ██║███████║██║  ██║███████╗███████╗
                       ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚══════╝╚══════╝

                    Leonardo Tristão@agent-terminal
                    ────────────────────────────────────────────────────────────────
                    Projeto: Agent(e) Search Engine
                    Projeto realizado para a matéria de extensão Desprogramar para (Re)Programar
                    Tipo: Literatura Digital Interativa
                    Tema: Crítica à Vigilância Algorítmica
                    Tecnologia: HTML5, CSS3, JavaScript
                    Interface: Terminal Linux Emulator
                    Fonte: Courier New (Monospace)
                    Criado por: Leonardo Tristão 2025`;

            case 'version':
                return 'Agent(e) Terminal v1.0.0 - Linux Terminal Emulator';

            case 'whoami':
                return `Você é o produto beta daquilo que procura.
Identidade: usuário-consumidor #${Math.floor(Math.random() * 9999)}
Status: monitorado ativamente
Última atualização: ${new Date().toLocaleString('pt-BR')}`;

            case 'ls':
                return `LICENSE
README.md`;

            case 'cat':
                if (args.length === 0) {
                    return 'Uso: cat <arquivo>';
                }
                const filename = args[0];
                showFileContent(filename);
                return `Exibindo conteúdo de: ${filename}`;

            case 'date':
                return new Date().toLocaleString('pt-BR');

            case 'remove':
                if (args.length === 0) {
                    return 'Uso: remove <objeto>';
                }
                if (args[0] === 'user') {
                    removeUser();
                    return null;
                }
                return `Objeto '${args[0]}' não encontrado`;

            default:
                return `Comando não encontrado: ${cmd}. Digite 'help' para ver comandos disponíveis.`;
        }
    }

    function clearTerminal() {
        const terminalOutput = document.querySelector('.terminal-output');
        if (terminalOutput) {
            // Clear terminal but preserve initial message
            terminalOutput.innerHTML = '';

            // Re-add the stored welcome message
            const welcomeLine = document.createElement('div');
            welcomeLine.className = 'output-line';
            welcomeLine.innerHTML = currentWelcomeMessage;
            terminalOutput.appendChild(welcomeLine);
            
            // Scroll to bottom
            scrollToBottom();
        }
    }

    function removeUser() {
        const terminalOutput = document.querySelector('.terminal-output');
        
        // Clear terminal first
        terminalOutput.innerHTML = '';
        
        // Add initial error message
        const initialError = document.createElement('div');
        initialError.className = 'output-line';
        initialError.textContent = 'Iniciando processo de remoção de usuário...';
        terminalOutput.appendChild(initialError);
        scrollToBottom();
        
        // Generate 99 error lines rapidly
        let errorCount = 0;
        const errorInterval = setInterval(() => {
            const errorLine = document.createElement('div');
            errorLine.className = 'output-line';
            errorLine.style.color = '#ff6666';
            errorLine.textContent = `ERROR: Failed to remove user data from server ${Math.floor(Math.random() * 9999)}`;
            terminalOutput.appendChild(errorLine);
            scrollToBottom();
            
            errorCount++;
            
            if (errorCount >= 99) {
                clearInterval(errorInterval);
                
                // Add final message after a brief pause
                setTimeout(() => {
                    const finalLine = document.createElement('div');
                    finalLine.className = 'output-line';
                    finalLine.style.color = '#ffaa00';
                    finalLine.style.fontWeight = 'bold';
                    finalLine.textContent = 'Você não pode escapar';
                    terminalOutput.appendChild(finalLine);
                    scrollToBottom();
                }, 200);
            }
        }, 25); // Very fast - 25ms between errors
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

        @keyframes subtle-glow {
            0%, 100% { text-shadow: 0 0 3px rgba(170, 170, 170, 0.2); }
            50% { text-shadow: 0 0 8px rgba(170, 170, 170, 0.6); }
        }

        /* Login Screen Styles */
        #login-overlay {
            position: fixed;
            top: 0; left: 0;
            width: 100vw; height: 100vh;
            background: #000;
            z-index: 9999;
            display: none;
            opacity: 0;
            align-items: center;
            justify-content: center;
            font-family: 'Courier New', 'Monaco', monospace;
            transition: opacity 0.5s ease-in-out;
        }
        .login-box {
            border: 1px solid #333;
            padding: 2rem 3rem;
            background: #0c0c0c;
            text-align: center;
            animation: fadeIn 1s ease-in;
        }
        .login-title { font-size: 2rem; color: #00ff00; font-weight: bold; letter-spacing: 4px; }
        .login-subtitle { font-size: 0.9rem; color: #888; margin-bottom: 2rem; }
        .login-form label { display: block; color: #ccc; margin-bottom: 0.5rem; }
        #login-input {
            background: transparent;
            border: none;
            border-bottom: 1px solid #555;
            color: #fff;
            font-family: inherit;
            font-size: 1.2rem;
            text-align: center;
            width: 300px;
            padding: 0.5rem;
        }
        #login-input:focus { outline: none; border-bottom-color: #00ff00; }
        .login-help { margin-top: 1.5rem; font-size: 0.9rem; }
        #forgot-identity {
            color: #aaa;
            cursor: pointer;
            text-decoration: underline;
            transition: color 0.3s;
            animation: subtle-glow 3s ease-in-out infinite;
        }
        #forgot-identity:hover { color: #00ff00; }

        /* Identity Popup Styles */
        #identity-popup-overlay {
            position: fixed;
            top: 0; left: 0;
            width: 100vw; height: 100vh;
            background: rgba(0, 0, 0, 0.8);
            z-index: 10001; /* Above login overlay */
            display: none;
            opacity: 0;
            align-items: center;
            justify-content: center;
            font-family: 'Courier New', 'Monaco', monospace;
            transition: opacity 0.5s ease-in-out;
            backdrop-filter: blur(5px);
        }
        .identity-popup-box {
            background: #0c0c0c;
            border: 1px solid #333;
            padding: 2rem;
            max-width: 500px;
            text-align: left;
            animation: fadeIn 0.5s ease-in;
        }
        .identity-popup-box h3 {
            color: #00ff00;
            margin-top: 0;
            font-size: 1.2rem;
        }
        .identity-popup-box p {
            color: #ccc;
            line-height: 1.6;
            font-size: 0.9rem;
        }
        .identity-popup-footer {
            text-align: right;
            margin-top: 1.5rem;
        }
        #close-identity-popup {
            background: transparent;
            border: 1px solid #555;
            color: #ccc;
            padding: 0.5rem 1rem;
            font-family: inherit;
            cursor: pointer;
            transition: all 0.3s;
        }
        #close-identity-popup:hover {
            background: #333;
            color: #fff;
            border-color: #888;
        }
    `;
    document.head.appendChild(style);

    function addGlobalEventListeners(e) {
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
    }
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

        // Add event listeners for config buttons
        const btnGerarRelatorio = document.getElementById('btnGerarRelatorio');
        if (btnGerarRelatorio) {
            btnGerarRelatorio.addEventListener('click', gerarRelatorio);
        }
        const btnModoAvancado = document.getElementById('btnModoAvancado');
        if (btnModoAvancado) {
            btnModoAvancado.addEventListener('click', modoAvancado);
        }
    }

    // Logout functionality
    function initLogout() {
        const logoutButton = document.getElementById('logout-button');
        if (logoutButton) {
            logoutButton.addEventListener('click', () => {
                // Simply show the login screen again to allow changing the name
                // This will re-attach the necessary event listeners.
                showLoginScreen();
            });
        }
    }

    // Global functions for config panel
    function gerarRelatorio() {
        const warning = document.getElementById('configWarning');
        if (warning) {
            warning.textContent = 'Relatório gerado. Personalidade vendida com sucesso.';
            warning.style.color = '#ff6666';
            
            setTimeout(() => {
                warning.textContent = '';
            }, 3000);
        }
        
        showConfigLog(`report.generator | dados pessoais coletados | monetização ativa`);
    }

    function modoAvancado() {
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
    }

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

    // Main initialization function
    function main() {
        initTerminalInterface();
        initPopups();
        initFloatingCommands();
        initMonitoringLog();
        initConfigPanel();

        // Add global listeners and UI enhancements
        document.addEventListener('keydown', (e) => addGlobalEventListeners(e));
        const terminalInput = document.getElementById('terminalInput');
        if (terminalInput) {
            terminalInput.title = 'Digite comandos do terminal (Ctrl+K para focar, Esc para limpar)';
        }

        // Initialize logout after everything else is set up
        initLogout();
    }

    // Run main function when the DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', main);
    } else {
        main();
    }

})();
