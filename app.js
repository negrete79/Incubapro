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

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Iniciando IncubadoraPRO...');
    
    // Verificar se já está instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
        document.getElementById('install-btn').style.display = 'none';
    }
    
    loadData();
    setupEventListeners();
    updateTime();
    updateSensorData();
    setupPWA();
    
    console.log('✅ Pronto!');
});

// Carregar dados
function loadData() {
    const saved = localStorage.getItem('incubadora-batches');
    if (saved) {
        batches = JSON.parse(saved);
    }
    renderBatches();
}

// Configurar eventos
function setupEventListeners() {
    // Navegação
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const page = btn.dataset.page;
            navigateToPage(page);
        });
    });
}

// Navegação
function navigateToPage(pageId) {
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    
    document.querySelector(`[data-page="${pageId}"]`).classList.add('active');
    document.getElementById(pageId).classList.add('active');
}

// Atualizar tempo
function updateTime() {
    const now = new Date();
    document.getElementById('current-time').textContent = now.toLocaleTimeString('pt-BR');
    setInterval(() => {
        const now = new Date();
        document.getElementById('current-time').textContent = now.toLocaleTimeString('pt-BR');
    }, 1000);
}

// Atualizar sensores
function updateSensorData() {
    // Temperatura
    const temp = (36.5 + Math.random() * 2).toFixed(1);
    document.getElementById('temp-value').textContent = temp;
    document.getElementById('temp-fill').style.width = `${(temp - 36) * 50}%`;
    
    // Umidade
    const humidity = Math.floor(50 + Math.random() * 10);
    document.getElementById('humidity-value').textContent = humidity;
    document.getElementById('humidity-fill').style.width = `${(humidity - 50) * 10}%`;
    
    // Próxima viragem
    const now = new Date();
    const nextTurn = new Date(now);
    nextTurn.setHours(now.getHours() + 2);
    nextTurn.setMinutes(0);
    document.getElementById('next-turn').textContent = nextTurn.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});
    
    // Verificar viragem
    if (now.getMinutes() === 0 && now.getSeconds() < 5) {
        document.getElementById('turn-status').textContent = 'Virando...';
        setTimeout(() => {
            document.getElementById('turn-status').textContent = 'Aguardando';
            showNotification('✅ Viragem concluída', 'Os ovos foram virados');
        }, 3000);
    }
    
    // Repetir a cada 5 segundos
    setTimeout(updateSensorData, 5000);
}

// Configurar PWA
function setupPWA() {
    // Registrar Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js').catch(() => {});
    }
    
    // Evento de instalação
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        document.getElementById('install-btn').style.display = 'flex';
    });
    
    // Botão de instalação
    document.getElementById('install-btn').addEventListener('click', () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then(() => {
                document.getElementById('install-btn').style.display = 'none';
            });
        }
    });
    
    // App instalado
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

// Modal
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
        // Editar lote existente
        const index = batches.findIndex(b => b.id == batchId);
        if (index !== -1) {
            batches[index] = { ...batches[index], ...batchData };
        }
    } else {
        // Adicionar novo lote
        batchData.id = batches.length > 0 ? Math.max(...batches.map(b => b.id)) + 1 : 1;
        batches.push(batchData);
    }
    
    localStorage.setItem('incubadora-batches', JSON.stringify(batches));
    
    renderBatches();
    closeModal();
    showNotification('✅ Sucesso', batchId ? 'Lote atualizado com sucesso!' : 'Lote salvo com sucesso!');
}

// Excluir lote
function deleteBatch(id) {
    if (confirm('Tem certeza que deseja excluir este lote?')) {
        batches = batches.filter(b => b.id !== id);
        localStorage.setItem('incubadora-batches', JSON.stringify(batches));
        renderBatches();
        showNotification('✅ Sucesso', 'Lote excluído com sucesso!');
    }
}

// Limpar dados
function clearData() {
    if (confirm('Tem certeza que deseja limpar todos os dados?')) {
        localStorage.clear();
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

// Fechar modal ao clicar fora
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        closeModal();
    }
            }
