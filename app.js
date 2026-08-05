// Variáveis globais
let batches = [];
let deferredPrompt = null;

// Mapeamento de aves
const birdTypeNames = {
    'chicken': 'Galinha',
    'duck': 'Pato',
    'quail': 'Codorna',
    'goose': 'Ganso',
    'swan': 'Cisne',
    'peacock': 'Pavão',
    'pheasant': 'Faisão'
};

const incubationPeriods = {
    'chicken': 21,
    'duck': 28,
    'quail': 17,
    'goose': 30,
    'swan': 35,
    'peacock': 28,
    'pheasant': 24
};

// Variáveis de controle do alarme
let alarmeJaTocouNestaHora = false;
let intervaloVerificacaoViragem = null;

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Iniciando IncubadoraPRO...');
    
    if (window.matchMedia('(display-mode: standalone)').matches) {
        console.log('📱 App já está instalado');
        document.getElementById('install-btn').style.display = 'none';
    }
    
    loadData();
    setupEventListeners();
    updateTime();
    updateSensorData();
    setupPWA();
    iniciarVerificacaoViragem(); // Inicia o sistema de alarme real
    
    console.log('✅ Pronto!');
});

// Carregar dados do localStorage
function loadData() {
    try {
        const saved = localStorage.getItem('incubadora-batches');
        if (saved) {
            batches = JSON.parse(saved);
        }
        renderBatches();
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
    }
}

// Configurar eventos
function setupEventListeners() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const page = btn.dataset.page;
            navigateToPage(page);
        });
    });
}

// Navegação entre páginas
function navigateToPage(pageId) {
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    
    document.querySelector(`[data-page="${pageId}"]`).classList.add('active');
    document.getElementById(pageId).classList.add('active');
}

// Atualizar tempo
function updateTime() {
    const updateClock = () => {
        const now = new Date();
        document.getElementById('current-time').textContent = now.toLocaleTimeString('pt-BR');
    };
    
    updateClock();
    setInterval(updateClock, 1000);
}

// Atualizar dados dos sensores (mantém o original sem alterar lógica de viragem)
function updateSensorData() {
    const temp = (36.5 + Math.random() * 2).toFixed(1);
    document.getElementById('temp-value').textContent = temp;
    document.getElementById('temp-fill').style.width = `${(temp - 36) * 50}%`;
    
    const humidity = Math.floor(50 + Math.random() * 10);
    document.getElementById('humidity-value').textContent = humidity;
    document.getElementById('humidity-fill').style.width = `${(humidity - 50) * 10}%`;
    
    // Calcula a próxima viragem (a cada 2 horas, sempre no minuto 00)
    const now = new Date();
    const nextTurn = new Date(now);
    nextTurn.setHours(now.getHours() + 2);
    nextTurn.setMinutes(0);
    nextTurn.setSeconds(0);
    document.getElementById('next-turn').textContent = nextTurn.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});
    
    setTimeout(updateSensorData, 5000);
}

// ========================================================
// SISTEMA DE ALARME DE VIRAGEM (NOVO)
// Verifica a cada 1 segundo se chegou a hora de virar
// ========================================================
function iniciarVerificacaoViragem() {
    // Verifica se o usuário permitiu notificações
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }

    intervaloVerificacaoViragem = setInterval(() => {
        const agora = new Date();
        const minutos = agora.getMinutes();
        const segundos = agora.getSeconds();

        // A viragem acontece quando o minuto é 00 (ex: 14:00, 16:00, 18:00...)
        if (minutos === 0 && segundos === 0) {
            
            // Garante que o alarme só toque UMA VEZ a cada hora
            if (!alarmeJaTocouNestaHora) {
                alarmeJaTocouNestaHora = true;
                
                // Atualiza a tela
                document.getElementById('turn-status').textContent = 'Virando...';
                
                // Dispara o alarme
                dispararAlarmeViragem();
                
                // Volta ao normal após 10 segundos
                setTimeout(() => {
                    document.getElementById('turn-status').textContent = 'Aguardando';
                }, 10000);
            }
        } 
        
        // Reseta a flag quando passar do minuto 00
        if (minutos !== 0) {
            alarmeJaTocouNestaHora = false;
        }
    }, 1000); // Verifica a cada 1 segundo para não perder o minuto exato
}

// Dispara o alarme com som e vibração
function dispararAlarmeViragem() {
    console.log('🚨 ALARME DE VIRAGEM DISPARADO!');
    
    // 1. Vibra o celular (padrão: 2 segundos)
    if (navigator.vibrate) {
        // Padrão: vibra 500ms, pausa 300ms, vibra 500ms, pausa 300ms, vibra 500ms
        navigator.vibrate([500, 300, 500, 300, 500]);
    }

    // 2. Toca o som de alarme
    tocarSomAlarme();

    // 3. Dispara notificação do sistema (se permitido)
    if ('Notification' in window && Notification.permission === 'granted') {
        try {
            new Notification('🥚 Hora da Viragem!', {
                body: 'Está na hora de virar os ovos da incubadora.',
                icon: 'png192.png',
                requireInteraction: true // Não some sozinho
            });
        } catch (e) {
            // Em alguns navegadores pode falhar silenciosamente
        }
    }

    // 4. Mostra o toast dentro do app
    showNotification('🚨 Hora da Viragem!', 'Vire os ovos da incubadora agora.');
}

// Toca um beep de alarme usando Web Audio API (não precisa de arquivo externo)
function tocarSomAlarme() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioContext();
        
        // Cria 3 bips agudos e urgentes
        for (let i = 0; i < 3; i++) {
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();
            
            // Conecta o oscilador no controle de volume
            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);
            
            // Som agudo e urgente (880Hz)
            oscillator.frequency.value = 880;
            oscillator.type = 'sine';
            
            // Volume alto
            gainNode.gain.value = 1.0;
            
            // Tempo de início com atraso entre os bips
            const inicio = ctx.currentTime + (i * 0.6);
            oscillator.start(inicio);
            oscillator.stop(inicio + 0.4); // Cada bip dura 0.4 segundos
        }
    } catch (e) {
        console.warn('Não foi possível tocar o som do alarme:', e);
    }
}

// ========================================================
// FIM DO SISTEMA DE ALARME
// ========================================================

// Configurar PWA
function setupPWA() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => {
                console.log('✅ Service Worker registrado com sucesso:', registration);
            })
            .catch(error => {
                console.error('❌ Erro ao registrar Service Worker:', error);
            });
    }
    
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        document.getElementById('install-btn').style.display = 'flex';
    });
    
    document.getElementById('install-btn').addEventListener('click', () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('✅ Usuário aceitou a instalação');
                } else {
                    console.log('❌ Usuário recusou a instalação');
                }
                deferredPrompt = null;
            });
        }
    });
    
    window.addEventListener('appinstalled', () => {
        document.getElementById('install-btn').style.display = 'none';
        showNotification('🎉 Instalado', 'App instalado com sucesso!');
    });
}

// Renderizar lotes
function renderBatches() {
    const container = document.getElementById('batches-container');
    
    if (batches.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-egg"></i>
                <p>Nenhum lote cadastrado</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = batches.map(batch => {
        const days = Math.floor((new Date() - new Date(batch.startDate)) / (1000*60*60*24));
        const incubationDays = incubationPeriods[batch.birdType] || 21;
        const progress = Math.min(100, (days / incubationDays) * 100);
        const status = days < incubationDays ? 'Ativo' : 'Concluído';
        
        return `
            <div class="batch-item">
                <div class="batch-header">
                    <div class="batch-title">Lote #${batch.id}</div>
                    <div class="batch-status">${status}</div>
                </div>
                <div class="batch-info">
                    <div>🐔 ${birdTypeNames[batch.birdType]} - ${batch.eggCount} ovos</div>
                    <div>📅 Início: ${new Date(batch.startDate).toLocaleDateString('pt-BR')}</div>
                    <div>📊 Progresso: ${progress.toFixed(0)}%</div>
                </div>
                <div class="batch-actions">
                    <button class="icon-btn" onclick="viewBatchDetails(${batch.id})" title="Ver detalhes">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="icon-btn" onclick="editBatch(${batch.id})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="icon-btn delete" onclick="deleteBatch(${batch.id})" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Modal functions
function openBatchModal() {
    document.getElementById('modal-title').textContent = 'Novo Lote';
    document.getElementById('batch-form').reset();
    document.getElementById('batch-id').value = '';
    document.getElementById('batch-modal').style.display = 'flex';
}

function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

// Ver detalhes do lote
function viewBatchDetails(id) {
    const batch = batches.find(b => b.id === id);
    if (!batch) return;
    
    const days = Math.floor((new Date() - new Date(batch.startDate)) / (1000*60*60*24));
    const incubationDays = incubationPeriods[batch.birdType] || 21;
    const progress = Math.min(100, (days / incubationDays) * 100);
    const hatchDate = new Date(batch.startDate);
    hatchDate.setDate(hatchDate.getDate() + incubationDays);
    
    const detailsHTML = `
        <div class="batch-details">
            <div class="detail-row">
                <span class="detail-label">ID do Lote:</span>
                <span class="detail-value">#${batch.id}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Tipo de Ave:</span>
                <span class="detail-value">${birdTypeNames[batch.birdType]}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Data de Início:</span>
                <span class="detail-value">${new Date(batch.startDate).toLocaleDateString('pt-BR')}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Quantidade de Ovos:</span>
                <span class="detail-value">${batch.eggCount}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Dias de Incubação:</span>
                <span class="detail-value">${days} dias</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Previsão de Eclosão:</span>
                <span class="detail-value">${hatchDate.toLocaleDateString('pt-BR')}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Progresso:</span>
                <span class="detail-value">${progress.toFixed(1)}%</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progress}%"></div>
            </div>
            ${batch.notes ? `
            <div class="detail-row">
                <span class="detail-label">Observações:</span>
                <span class="detail-value">${batch.notes}</span>
            </div>
            ` : ''}
        </div>
    `;
    
    document.getElementById('batch-details-content').innerHTML = detailsHTML;
    document.getElementById('details-modal').style.display = 'flex';
}

// Editar lote
function editBatch(id) {
    const batch = batches.find(b => b.id === id);
    if (!batch) return;
    
    document.getElementById('modal-title').textContent = 'Editar Lote';
    document.getElementById('batch-id').value = batch.id;
    document.getElementById('bird-type').value = batch.birdType;
    document.getElementById('start-date').value = batch.startDate;
    document.getElementById('egg-count').value = batch.eggCount;
    document.getElementById('notes').value = batch.notes || '';
    document.getElementById('batch-modal').style.display = 'flex';
}

// Salvar lote
function saveBatch(event) {
    event.preventDefault();
    
    const batchId = document.getElementById('batch-id').value;
    const batchData = {
        birdType: document.getElementById('bird-type').value,
        startDate: document.getElementById('start-date').value,
        eggCount: parseInt(document.getElementById('egg-count').value),
        notes: document.getElementById('notes').value
    };
    
    if (batchId) {
        const index = batches.findIndex(b => b.id == batchId);
        if (index !== -1) {
            batches[index] = { ...batches[index], ...batchData };
        }
    } else {
        batchData.id = batches.length > 0 ? Math.max(...batches.map(b => b.id)) + 1 : 1;
        batches.push(batchData);
    }
    
    try {
        localStorage.setItem('incubadora-batches', JSON.stringify(batches));
        renderBatches();
        closeModal();
        showNotification('✅ Sucesso', batchId ? 'Lote atualizado com sucesso!' : 'Lote salvo com sucesso!');
    } catch (error) {
        console.error('Erro ao salvar dados:', error);
        showNotification('❌ Erro', 'Não foi possível salvar os dados');
    }
}

// Excluir lote
function deleteBatch(id) {
    if (confirm('Tem certeza que deseja excluir este lote?')) {
        batches = batches.filter(b => b.id !== id);
        try {
            localStorage.setItem('incubadora-batches', JSON.stringify(batches));
            renderBatches();
            showNotification('✅ Sucesso', 'Lote excluído com sucesso!');
        } catch (error) {
            console.error('Erro ao excluir dados:', error);
            showNotification('❌ Erro', 'Não foi possível excluir os dados');
        }
    }
}

// Limpar dados (preserva chave e histórico do chat)
function clearData() {
    if (confirm('Tem certeza que deseja limpar todos os dados?')) {
        var apiKey = localStorage.getItem('incubadora_groq_api_key');
        var chatHist = localStorage.getItem('incubadora_chat_history');
        
        localStorage.clear();
        
        if (apiKey) localStorage.setItem('incubadora_groq_api_key', apiKey);
        if (chatHist) localStorage.setItem('incubadora_chat_history', chatHist);
        
        batches = [];
        renderBatches();
        showNotification('✅ Sucesso', 'Dados limpos com sucesso!');
    }
}

// Notificações
function showNotification(title, message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <div style="font-weight: 600; margin-bottom: 0.3rem;">${title}</div>
        <div style="font-size: 0.9rem; color: #666;">${message}</div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Fechar modal ao clicar fora (ignora elementos do chat)
window.onclick = function(event) {
    if (event.target.closest('.chat-window') || event.target.closest('.api-modal-overlay') || event.target.closest('.chat-fab')) {
        return;
    }
    if (event.target.classList.contains('modal')) {
        closeModal();
    }
            }
