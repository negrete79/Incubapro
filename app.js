// Variáveis globais
let batches = [];
let reminders = [];
let currentFilter = 'all';
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
    console.log('Iniciando IncubaPRO...');
    initializeApp();
    setupEventListeners();
    loadBatches();
    loadReminders();
    updateTime();
    updateSensorData();
    setupPWA();
    updateIdealTemperature();
    
    console.log('IncubaPRO iniciado com sucesso!');
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
    console.log('Configurando event listeners...');
    
    // Navegação
    document.querySelectorAll('.nav-btn').forEach(button => {
        button.addEventListener('click', () => {
            const pageId = button.getAttribute('data-page');
            navigateToPage(pageId);
        });
    });
    
    // Botão de adicionar lote
    const addBatchBtn = document.getElementById('add-batch-btn');
    if (addBatchBtn) {
        addBatchBtn.addEventListener('click', openAddBatchModal);
    }
    
    const emptyAddBtn = document.querySelector('.empty-add-btn');
    if (emptyAddBtn) {
        emptyAddBtn.addEventListener('click', openAddBatchModal);
    }
    
    // Modais
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', closeModal);
    });
    
    // Formulário de lote
    const batchForm = document.getElementById('batch-form');
    if (batchForm) {
        batchForm.addEventListener('submit', saveBatch);
    }
    
    // Botões de cancelar
    const cancelBtn = document.querySelector('.cancel-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeModal);
    }
    
    const closeDetailsBtn = document.querySelector('.close-details-btn');
    if (closeDetailsBtn) {
        closeDetailsBtn.addEventListener('click', closeModal);
    }
    
    const cancelDeleteBtn = document.querySelector('.cancel-delete-btn');
    if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener('click', closeModal);
    }
    
    // Confirmação de exclusão
    const confirmDeleteBtn = document.querySelector('.confirm-delete-btn');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', deleteBatch);
    }
    
    // Filtros de lembretes
    document.querySelectorAll('.filter-btn').forEach(button => {
        button.addEventListener('click', () => {
            currentFilter = button.getAttribute('data-filter');
            updateReminderFilter();
        });
    });
    
    // Configurações
    const tempUnit = document.getElementById('temp-unit');
    if (tempUnit) {
        tempUnit.addEventListener('change', saveSettings);
    }
    
    const turnFrequency = document.getElementById('turn-frequency');
    if (turnFrequency) {
        turnFrequency.addEventListener('change', saveSettings);
    }
    
    const tempAlerts = document.getElementById('temp-alerts');
    if (tempAlerts) {
        tempAlerts.addEventListener('change', saveSettings);
    }
    
    const turnReminders = document.getElementById('turn-reminders');
    if (turnReminders) {
        turnReminders.addEventListener('change', saveSettings);
    }
    
    console.log('Event listeners configurados!');
}

// Navegação entre páginas
function navigateToPage(pageId) {
    console.log('Navegando para:', pageId);
    
    // Remover active de todos os botões e páginas
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    
    // Adicionar active ao botão e página clicados
    const navBtn = document.querySelector(`.nav-btn[data-page="${pageId}"]`);
    if (navBtn) {
        navBtn.classList.add('active');
    }
    
    const page = document.getElementById(pageId);
    if (page) {
        page.classList.add('active');
    }
    
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
    const currentTimeElement = document.getElementById('current-time');
    if (currentTimeElement) {
        currentTimeElement.textContent = timeString;
    }
}

// Simular dados de sensores
function updateSensorData() {
    // Obter temperatura ideal para o lote ativo
    let idealTemp = 37.5; // Padrão
    if (batches.length > 0) {
        const activeBatch = batches.find(batch => {
            const daysSinceStart = Math.floor((new Date() - new Date(batch.startDate)) / (1000 * 60 * 60 * 24));
            return daysSinceStart < 21;
        });
        
        if (activeBatch) {
            idealTemp = idealTemperatures[activeBatch.birdType] || 37.5;
        }
    }
    
    // Temperatura simulada (variação em torno da ideal)
    const temp = (idealTemp - 1 + Math.random() * 2).toFixed(1);
    const tempValueElement = document.getElementById('temp-value');
    if (tempValueElement) {
        tempValueElement.textContent = temp;
    }
    
    // Umidade simulada (50-60%)
    const humidity = (50 + Math.random() * 10).toFixed(0);
    const humidityValueElement = document.getElementById('humidity-value');
    if (humidityValueElement) {
        humidityValueElement.textContent = humidity;
    }
    
    // Atualizar barras de status
    const tempPercent = ((temp - (idealTemp - 2)) / 4) * 100;
    const humidityPercent = ((humidity - 50) / 10) * 100;
    
    const tempFill = document.querySelector('.temp-fill');
    if (tempFill) {
        tempFill.style.width = `${Math.max(0, Math.min(100, tempPercent))}%`;
    }
    
    const humidityFill = document.querySelector('.humidity-fill');
    if (humidityFill) {
        humidityFill.style.width = `${Math.max(0, Math.min(100, humidityPercent))}%`;
    }
    
    // Verificar alertas
    checkAlerts(parseFloat(temp), parseInt(humidity));
}

// Atualizar temperatura ideal no dashboard
function updateIdealTemperature() {
    let idealTemp = 37.5; // Padrão
    
    if (batches.length > 0) {
        const activeBatch = batches.find(batch => {
            const daysSinceStart = Math.floor((new Date() - new Date(batch.startDate)) / (1000 * 60 * 60 * 24));
            return daysSinceStart < 21;
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
    const tempAlertsEnabled = document.getElementById('temp-alerts');
    const isChecked = tempAlertsEnabled ? tempAlertsEnabled.checked : true;
    
    if (isChecked) {
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
    nextTurn.setHours(now.getHours() + 2);
    nextTurn.setMinutes(0);
    nextTurn.setSeconds(0);
    
    const timeString = nextTurn.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const nextTurnElement = document.getElementById('next-turn');
    if (nextTurnElement) {
        nextTurnElement.textContent = timeString;
    }
    
    // Verificar se é hora de virar
    if (now.getMinutes() === 0 && now.getSeconds() < 10) {
        const turnStatusElement = document.getElementById('turn-status');
        if (turnStatusElement) {
            turnStatusElement.textContent = 'Virando...';
            setTimeout(() => {
                turnStatusElement.textContent = 'Aguardando';
                showNotification('Viragem de Ovos', 'Os ovos foram virados com sucesso!', 'success');
            }, 5000);
        }
    }
}

// Configurar PWA
function setupPWA() {
    console.log('Configurando PWA...');
    
    // Evento de instalação
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        const installBtn = document.getElementById('install-btn');
        if (installBtn) {
            installBtn.style.display = 'flex';
        }
        console.log('Evento beforeinstallprompt capturado');
    });
    
    // Botão de instalação
    const installBtn = document.getElementById('install-btn');
    if (installBtn) {
        installBtn.addEventListener('click', () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        console.log('Usuário aceitou a instalação');
                    }
                    deferredPrompt = null;
                });
                installBtn.style.display = 'none';
            }
        });
    }
    
    // Verificar se o app já está instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
        console.log('Aplicativo já está instalado');
        const installBtn = document.getElementById('install-btn');
        if (installBtn) {
            installBtn.style.display = 'none';
        }
    }
    
    // Para testes: mostrar botão de instalação após 5 segundos
    setTimeout(() => {
        if (!window.matchMedia('(display-mode: standalone)').matches) {
            const installBtn = document.getElementById('install-btn');
            if (installBtn && installBtn.style.display === 'none') {
                console.log('Mostrando botão de instalação para testes');
                installBtn.style.display = 'flex';
            }
        }
    }, 5000);
    
    console.log('PWA configurado!');
}

// Funções de Lotes
function loadBatches() {
    const savedBatches = localStorage.getItem('incubadora-batches');
    if (savedBatches) {
        try {
            batches = JSON.parse(savedBatches);
        } catch (e) {
            console.error('Erro ao carregar lotes:', e);
            batches = [];
        }
    }
}

function saveBatches() {
    try {
        localStorage.setItem('incubadora-batches', JSON.stringify(batches));
    } catch (e) {
        console.error('Erro ao salvar lotes:', e);
    }
}

function renderBatches() {
    const container = document.getElementById('batches-container');
    if (!container) return;
    
    if (batches.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-egg"></i>
                <p>Nenhum lote cadastrado</p>
                <button class="btn primary empty-add-btn">Adicionar primeiro lote</button>
            </div>
        `;
        const emptyAddBtn = container.querySelector('.empty-add-btn');
        if (emptyAddBtn) {
            emptyAddBtn.addEventListener('click', openAddBatchModal);
        }
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
    const modalTitle = document.getElementById('modal-title');
    const batchForm = document.getElementById('batch-form');
    const batchModal = document.getElementById('batch-modal');
    
    if (modalTitle) modalTitle.textContent = 'Adicionar Novo Lote';
    if (batchForm) batchForm.reset();
    const batchId = document.getElementById('batch-id');
    if (batchId) batchId.value = '';
    if (batchModal) batchModal.style.display = 'flex';
}

function editBatch(id) {
    const batch = batches.find(b => b.id === id);
    if (!batch) return;
    
    const modalTitle = document.getElementById('modal-title');
    const batchId = document.getElementById('batch-id');
    const birdType = document.getElementById('bird-type');
    const startDate = document.getElementById('start-date');
    const eggCount = document.getElementById('egg-count');
    const incubator = document.getElementById('incubator');
    const notes = document.getElementById('notes');
    const batchModal = document.getElementById('batch-modal');
    
    if (modalTitle) modalTitle.textContent = 'Editar Lote';
    if (batchId) batchId.value = batch.id;
    if (birdType) birdType.value = batch.birdType;
    if (startDate) startDate.value = batch.startDate;
    if (eggCount) eggCount.value = batch.eggCount;
    if (incubator) incubator.value = batch.incubator;
    if (notes) notes.value = batch.notes || '';
    if (batchModal) batchModal.style.display = 'flex';
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
                <p>${idealTemperatures[bat
