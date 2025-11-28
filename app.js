// Variáveis globais
let batches = [];
let reminders = [];
let currentFilter = 'all';
let wsConnection = null;
let deferredPrompt = null;

// Mapeamento de nomes de aves
const birdTypeNames = {
    'chicken': 'Galinha',
    'duck': 'Pato',
    'quail': 'Codorna',
    'goose': 'Ganso',
    'swan': 'Cisne',
    'peacock': 'Pavão',
    'pheasant': 'Faisão'
};

// Temperaturas ideais para cada tipo de ave
const idealTemperatures = {
    'chicken': 37.5,
    'duck': 37.5,
    'quail': 37.5,
    'goose': 37.5,
    'swan': 37.5,
    'peacock': 37.5,
    'pheasant': 37.5
};

// Períodos de incubação para cada tipo de ave (em dias)
const incubationPeriods = {
    'chicken': 21,
    'duck': 28,
    'quail': 17,
    'goose': 30,
    'swan': 35,
    'peacock': 28,
    'pheasant': 24
};

// Inicialização do aplicativo
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    loadBatches();
    loadReminders();
    updateTime();
    updateSensorData();
    setupPWA();
    updateIdealTemperature();
});

// Função principal de inicialização
function initializeApp() {
    // Verificar suporte a notificações
    if ('Notification' in window) {
        Notification.requestPermission();
    }
    
    // Carregar configurações salvas
    loadSettings();
    
    // Iniciar atualizações periódicas
    setInterval(updateTime, 1000);
    setInterval(updateSensorData, 5000);
    setInterval(updateTurnTimer, 60000); // Atualizar a cada minuto
}

// Configurar event listeners
function setupEventListeners() {
    // Navegação
    document.querySelectorAll('.nav-btn').forEach(button => {
        button.addEventListener('click', () => {
            const pageId = button.getAttribute('data-page');
            navigateToPage(pageId);
        });
    });
    
    // Botão de adicionar lote
    document.getElementById('add-batch-btn').addEventListener('click', openAddBatchModal);
    document.querySelector('.empty-add-btn').addEventListener('click', openAddBatchModal);
    
    // Modais
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', closeModal);
    });
    
    // Formulário de lote
    document.getElementById('batch-form').addEventListener('submit', saveBatch);
    
    // Botões de cancelar
    document.querySelector('.cancel-btn').addEventListener('click', closeModal);
    document.querySelector('.close-details-btn').addEventListener('click', closeModal);
    document.querySelector('.cancel-delete-btn').addEventListener('click', closeModal);
    
    // Confirmação de exclusão
    document.querySelector('.confirm-delete-btn').addEventListener('click', deleteBatch);
    
    // Filtros de lembretes
    document.querySelectorAll('.filter-btn').forEach(button => {
        button.addEventListener('click', () => {
            currentFilter = button.getAttribute('data-filter');
            updateReminderFilter();
        });
    });
    
    // Configurações
    document.getElementById('temp-unit').addEventListener('change', saveSettings);
    document.getElementById('turn-frequency').addEventListener('change', saveSettings);
    document.getElementById('temp-alerts').addEventListener('change', saveSettings);
    document.getElementById('turn-reminders').addEventListener('change', saveSettings);
}

// Navegação entre páginas
function navigateToPage(pageId) {
    // Remover active de todos os botões e páginas
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    
    // Adicionar active ao botão e página clicados
    document.querySelector(`.nav-btn[data-page="${pageId}"]`).classList.add('active');
    document.getElementById(pageId).classList.add('active');
    
    // Atualizar conteúdo específico da página
    if (pageId === 'batches') {
        renderBatches();
    } else if (pageId === 'reminders') {
        renderReminders();
    } else if (pageId === 'dashboard') {
        updateIdealTemperature();
    }
}

// Atualizar relógio
function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('pt-BR');
    document.getElementById('current-time').textContent = timeString;
}

// Simular dados de sensores
function updateSensorData() {
    // Se não houver conexão WebSocket, usar dados simulados
    if (!wsConnection || wsConnection.readyState !== WebSocket.OPEN) {
        // Obter temperatura ideal para o lote ativo
        let idealTemp = 37.5; // Padrão
        if (batches.length > 0) {
            const activeBatch = batches.find(batch => {
                const daysSinceStart = Math.floor((new Date() - new Date(batch.startDate)) / (1000 * 60 * 60 * 24));
                return daysSinceStart < 21; // Considerando ativo até 21 dias
            });
            
            if (activeBatch) {
                idealTemp = idealTemperatures[activeBatch.birdType] || 37.5;
            }
        }
        
        // Temperatura simulada (variação em torno da ideal)
        const temp = (idealTemp - 1 + Math.random() * 2).toFixed(1);
        document.getElementById('temp-value').textContent = temp;
        
        // Umidade simulada (50-60%)
        const humidity = (50 + Math.random() * 10).toFixed(0);
        document.getElementById('humidity-value').textContent = humidity;
        
        // Atualizar barras de status
        const tempPercent = ((temp - (idealTemp - 2)) / 4) * 100;
        const humidityPercent = ((humidity - 50) / 10) * 100;
        
        document.querySelector('.temp-fill').style.width = `${Math.max(0, Math.min(100, tempPercent))}%`;
        document.querySelector('.humidity-fill').style.width = `${Math.max(0, Math.min(100, humidityPercent))}%`;
        
        // Verificar alertas
        checkAlerts(parseFloat(temp), parseInt(humidity));
    }
}

// Atualizar temperatura ideal no dashboard
function updateIdealTemperature() {
    let idealTemp = 37.5; // Padrão
    
    if (batches.length > 0) {
        const activeBatch = batches.find(batch => {
            const daysSinceStart = Math.floor((new Date() - new Date(batch.startDate)) / (1000 * 60 * 60 * 24));
            return daysSinceStart < 21; // Considerando ativo até 21 dias
        });
        
        if (activeBatch) {
            idealTemp = idealTemperatures[activeBatch.birdType] || 37.5;
        }
    }
    
    // Atualizar o texto no dashboard
    const idealTempElement = document.getElementById('ideal-temp');
    if (idealTempElement) {
        idealTempElement.textContent = idealTemp;
    }
}

// Verificar alertas de temperatura e umidade
function checkAlerts(temp, humidity) {
    const tempAlertsEnabled = document.getElementById('temp-alerts').checked;
    
    if (tempAlertsEnabled) {
        // Obter temperatura ideal para o lote ativo
        let idealTemp = 37.5;
        if (batches.length > 0) {
            const activeBatch = batches.find(batch => {
                const daysSinceStart = Math.floor((new Date() - new Date(batch.startDate)) / (1000 * 60 * 60 * 24));
                return daysSinceStart < 21;
            });
            
            if (activeBatch) {
                idealTemp = idealTemperatures[activeBatch.birdType] || 37.5;
            }
        }
        
        if (temp < idealTemp - 0.5 || temp > idealTemp + 0.5) {
            showNotification('Alerta de Temperatura', `Temperatura fora do ideal: ${temp}°C (ideal: ${idealTemp}°C)`, 'warning');
        }
    }
}

// Atualizar temporizador de viragem
function updateTurnTimer() {
    const now = new Date();
    const nextTurn = new Date(now);
    nextTurn.setHours(now.getHours() + 2); // Próxima viragem em 2 horas
    nextTurn.setMinutes(0);
    nextTurn.setSeconds(0);
    
    const timeString = nextTurn.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    document.getElementById('next-turn').textContent = timeString;
    
    // Verificar se é hora de virar
    if (now.getMinutes() === 0 && now.getSeconds() < 10) {
        document.getElementById('turn-status').textContent = 'Virando...';
        setTimeout(() => {
            document.getElementById('turn-status').textContent = 'Aguardando';
            showNotification('Viragem de Ovos', 'Os ovos foram virados com sucesso!', 'success');
        }, 5000);
    }
}

// Configurar PWA
function setupPWA() {
    // Evento de instalação
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        document.getElementById('install-btn').style.display = 'block';
        console.log('Evento beforeinstallprompt capturado');
    });
    
    // Botão de instalação
    document.getElementById('install-btn').addEventListener('click', () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('Usuário aceitou a instalação');
                }
                deferredPrompt = null;
            });
            document.getElementById('install-btn').style.display = 'none';
        }
    });
    
    // Verificar se o app já está instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
        console.log('Aplicativo já está instalado');
        document.getElementById('install-btn').style.display = 'none';
    }
    
    // Para testes: mostrar botão de instalação após 5 segundos
    setTimeout(() => {
        if (!window.matchMedia('(display-mode: standalone)').matches && 
            document.getElementById('install-btn').style.display === 'none') {
            console.log('Mostrando botão de instalação para testes');
            document.getElementById('install-btn').style.display = 'block';
        }
    }, 5000);
}

// Funções de Lotes
function loadBatches() {
    const savedBatches = localStorage.getItem('incubadora-batches');
    if (savedBatches) {
        batches = JSON.parse(savedBatches);
    }
}

function saveBatches() {
    localStorage.setItem('incubadora-batches', JSON.stringify(batches));
}

function renderBatches() {
    const container = document.getElementById('batches-container');
    
    if (batches.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-egg"></i>
                <p>Nenhum lote cadastrado</p>
                <button class="btn primary empty-add-btn">Adicionar primeiro lote</button>
            </div>
        `;
        document.querySelector('.empty-add-btn').addEventListener('click', openAddBatchModal);
        return;
    }
    
    container.innerHTML = batches.map(batch => {
        const hatchDate = calculateHatchDate(batch);
        return `
        <div class="batch-card" data-id="${batch.id}">
            <div class="batch-header">
                <div class="batch-title">Lote #${batch.id}</div>
                <div class="batch-status ${getStatusClass(batch)}">${getStatusText(batch)}</div>
            </div>
            <div class="batch-info">
                <div><i class="fas fa-egg"></i> ${birdTypeNames[batch.birdType] || batch.birdType} - ${batch.eggCount} ovos</div>
                <div><i class="fas fa-calendar"></i> Início: ${formatDate(batch.startDate)}</div>
                <div><i class="fas fa-thermometer-half"></i> Incubadora #${batch.incubator}</div>
                <div><i class="fas fa-calendar-check"></i> Previsão: ${formatDate(hatchDate.toISOString().split('T')[0])}</div>
            </div>
            <div class="batch-actions">
                <button class="btn-icon" onclick="viewBatchDetails(${batch.id})">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-icon" onclick="editBatch(${batch.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon" onclick="confirmDeleteBatch(${batch.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `}).join('');
}

function calculateHatchDate(batch) {
    const startDate = new Date(batch.startDate);
    const incubationDays = incubationPeriods[batch.birdType] || 21;
    const hatchDate = new Date(startDate);
    hatchDate.setDate(startDate.getDate() + incubationDays);
    return hatchDate;
}

function getStatusClass(batch) {
    const daysSinceStart = Math.floor((new Date() - new Date(batch.startDate)) / (1000 * 60 * 60 * 24));
    const incubationDays = incubationPeriods[batch.birdType] || 21;
    
    if (daysSinceStart < incubationDays - 2) {
        return 'status-active';
    } else if (daysSinceStart < incubationDays + 3) {
        return 'status-pending';
    } else {
        return 'status-completed';
    }
}

function getStatusText(batch) {
    const daysSinceStart = Math.floor((new Date() - new Date(batch.startDate)) / (1000 * 60 * 60 * 24));
    const incubationDays = incubationPeriods[batch.birdType] || 21;
    
    if (daysSinceStart < incubationDays - 2) {
        return 'Ativo';
    } else if (daysSinceStart < incubationDays + 3) {
        return 'Eclodindo';
    } else {
        return 'Concluído';
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

function openAddBatchModal() {
    document.getElementById('modal-title').textContent = 'Adicionar Novo Lote';
    document.getElementById('batch-form').reset();
    document.getElementById('batch-id').value = '';
    document.getElementById('batch-modal').style.display = 'flex';
}

function editBatch(id) {
    const batch = batches.find(b => b.id === id);
    if (!batch) return;
    
    document.getElementById('modal-title').textContent = 'Editar Lote';
    document.getElementById('batch-id').value = batch.id;
    document.getElementById('bird-type').value = batch.birdType;
    document.getElementById('start-date').value = batch.startDate;
    document.getElementById('egg-count').value = batch.eggCount;
    document.getElementById('incubator').value = batch.incubator;
    document.getElementById('notes').value = batch.notes || '';
    
    document.getElementById('batch-modal').style.display = 'flex';
}

function saveBatch(e) {
    e.preventDefault();
    
    const batchId = document.getElementById('batch-id').value;
    const batchData = {
        birdType: document.getElementById('bird-type').value,
        startDate: document.getElementById('start-date').value,
        eggCount: parseInt(document.getElementById('egg-count').value),
        incubator: document.getElementById('incubator').value,
        notes: document.getElementById('notes').value
    };
    
    if (batchId) {
        // Editar lote existente
        const index = batches.findIndex(b => b.id === parseInt(batchId));
        if (index !== -1) {
            batches[index] = { ...batches[index], ...batchData };
        }
    } else {
        // Adicionar novo lote
        const newBatch = {
            id: batches.length > 0 ? Math.max(...batches.map(b => b.id)) + 1 : 1,
            ...batchData
        };
        batches.push(newBatch);
    }
    
    saveBatches();
    renderBatches();
    closeModal();
    showNotification('Sucesso', 'Lote salvo com sucesso!', 'success');
    
    // Atualizar temperatura ideal se estiver no dashboard
    if (document.getElementById('dashboard').classList.contains('active')) {
        updateIdealTemperature();
    }
}

function viewBatchDetails(id) {
    const batch = batches.find(b => b.id === id);
    if (!batch) return;
    
    const daysSinceStart = Math.floor((new Date() - new Date(batch.startDate)) / (1000 * 60 * 60 * 24));
    const incubationDays = incubationPeriods[batch.birdType] || 21;
    const progress = Math.min(100, (daysSinceStart / incubationDays) * 100);
    const hatchDate = calculateHatchDate(batch);
    
    const content = `
        <div class="batch-details">
            <div class="detail-item">
                <h4>ID do Lote</h4>
                <p>#${batch.id}</p>
            </div>
            <div class="detail-item">
                <h4>Tipo de Ave</h4>
                <p>${birdTypeNames[batch.birdType] || batch.birdType}</p>
            </div>
            <div class="detail-item">
                <h4>Data de Início</h4>
                <p>${formatDate(batch.startDate)}</p>
            </div>
            <div class="detail-item">
                <h4>Quantidade de Ovos</h4>
                <p>${batch.eggCount}</p>
            </div>
            <div class="detail-item">
                <h4>Incubadora</h4>
                <p>#${batch.incubator}</p>
            </div>
            <div class="detail-item">
                <h4>Dias de Incubação</h4>
                <p>${daysSinceStart} dias</p>
            </div>
            <div class="detail-item">
                <h4>Previsão de Eclosão</h4>
                <p>${formatDate(hatchDate.toISOString().split('T')[0])}</p>
            </div>
            <div class="detail-item">
                <h4>Temperatura Ideal</h4>
                <p>${idealTemperatures[batch.birdType] || 37.5}°C</p>
            </div>
            <div class="detail-item">
                <h4>Progresso</h4>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
                <p>${progress.toFixed(1)}%</p>
            </div>
            ${batch.notes ? `
            <div class="detail-item">
                <h4>Observações</h4>
                <p>${batch.notes}</p>
            </div>
            ` : ''}
        </div>
    `;
    
    document.querySelector('.batch-details-content').innerHTML = content;
    document.getElementById('batch-details-modal').style.display = 'flex';
}

function confirmDeleteBatch(id) {
    document.getElementById('delete-confirm-modal').setAttribute('data-id', id);
    document.getElementById('delete-confirm-modal').style.display = 'flex';
}

function deleteBatch() {
    const modal = document.getElementById('delete-confirm-modal');
    const id = parseInt(modal.getAttribute('data-id'));
    
    batches = batches.filter(b => b.id !== id);
    saveBatches();
    renderBatches();
    closeModal();
    showNotification('Sucesso', 'Lote excluído com sucesso!', 'success');
    
    // Atualizar temperatura ideal se estiver no dashboard
    if (document.getElementById('dashboard').classList.contains('active')) {
        updateIdealTemperature();
    }
}

// Funções de Lembretes
function loadReminders() {
    const savedReminders = localStorage.getItem('incubadora-reminders');
    if (savedReminders) {
        reminders = JSON.parse(savedReminders);
    } else {
        // Criar lembretes padrão
        reminders = [
            {
                id: 1,
                title: 'Virar ovos - Lote #1',
                time: '14:00',
                date: new Date().toISOString().split('T')[0],
                completed: false,
                type: 'turn'
            },
            {
                id: 2,
                title: 'Verificar temperatura - Lote #2',
                time: '18:00',
                date: new Date().toISOString().split('T')[0],
                completed: false,
                type: 'temperature'
            }
        ];
        saveReminders();
    }
}

function saveReminders() {
    localStorage.setItem('incubadora-reminders', JSON.stringify(reminders));
}

function renderReminders() {
    const container = document.getElementById('reminders-list');
    const today = new Date().toISOString().split('T')[0];
    
    let filteredReminders = reminders;
    
    if (currentFilter === 'today') {
        filteredReminders = reminders.filter(r => r.date === today);
    } else if (currentFilter === 'week') {
        const weekFromNow = new Date();
