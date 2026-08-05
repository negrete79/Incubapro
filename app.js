let batches = [];
let deferredPrompt = null;

const birdTypeNames = { 
    'chicken': 'Galinha', 'duck': 'Pato', 'quail': 'Codorna', 
    'goose': 'Ganso', 'swan': 'Cisne', 'peacock': 'Pavão', 'pheasant': 'Faisão',
    'cockatiel': 'Calopsita' 
};

const incubationPeriods = { 
    'chicken': 21, 'duck': 28, 'quail': 17, 'goose': 30, 
    'swan': 35, 'peacock': 28, 'pheasant': 24, 'cockatiel': 20 
};

// NOVO: Tabela de dias ideais para ovoscopia por ave
const ovoscopiaDays = {
    'chicken': [7, 14, 18],
    'duck': [7, 14, 25],
    'quail': [5, 10, 15],
    'goose': [7, 15, 27],
    'swan': [7, 18, 32],
    'peacock': [7, 14, 25],
    'pheasant': [7, 14, 21],
    'cockatiel': [5, 10, 17]
};

let alarmeJaTocouNestaHora = false;
let ovoscopiaJaVerificadaHoje = false;

// ==========================================
// INICIALIZAÇÃO
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
        document.getElementById('install-btn').style.display = 'none';
    }
    loadData();
    setupEventListeners();
    updateTime();
    updateSensorData();
    setupPWA();
    iniciarVerificacaoViragem();
    iniciarVerificacaoOvoscopia(); // NOVO
});

// ==========================================
// CÁLCULO DE DATAS
// ==========================================
function getLocalDate(dateStr) {
    if (!dateStr) return new Date();
    const parts = dateStr.split('-');
    return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
}

function getDaysDiff(dateStr) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = getLocalDate(dateStr);
    startDate.setHours(0, 0, 0, 0);
    const diffMs = today - startDate;
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

// ==========================================
// DADOS E NAVEGAÇÃO
// ==========================================
function loadData() {
    try {
        const saved = localStorage.getItem('incubadora-batches');
        if (saved) batches = JSON.parse(saved);
        renderBatches();
    } catch (e) { batches = []; }
}

function setupEventListeners() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => navigateToPage(btn.dataset.page));
    });
}

function navigateToPage(pageId) {
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.querySelector(`[data-page="${pageId}"]`).classList.add('active');
    document.getElementById(pageId).classList.add('active');
}

// ==========================================
// RELÓGIO E SENSORES SIMULADOS
// ==========================================
function updateTime() {
    const updateClock = () => { document.getElementById('current-time').textContent = new Date().toLocaleTimeString('pt-BR'); };
    updateClock(); setInterval(updateClock, 1000);
}

function updateSensorData() {
    const temp = (36.5 + Math.random() * 2).toFixed(1);
    document.getElementById('temp-value').textContent = temp;
    document.getElementById('temp-fill').style.width = `${(temp - 36) * 50}%`;
    const humidity = Math.floor(50 + Math.random() * 10);
    document.getElementById('humidity-value').textContent = humidity;
    document.getElementById('humidity-fill').style.width = `${(humidity - 50) * 10}%`;
    const now = new Date(); const nextTurn = new Date(now); nextTurn.setHours(now.getHours() + 2); nextTurn.setMinutes(0);
    document.getElementById('next-turn').textContent = nextTurn.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    setTimeout(updateSensorData, 5000);
}

// ==========================================
// ALARME DE VIRAGEM
// ==========================================
function iniciarVerificacaoViragem() {
    if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission();
    setInterval(() => {
        const agora = new Date();
        if (agora.getMinutes() === 0 && agora.getSeconds() === 0) {
            if (!alarmeJaTocouNestaHora) {
                alarmeJaTocouNestaHora = true;
                document.getElementById('turn-status').textContent = 'Virando...';
                if (navigator.vibrate) navigator.vibrate([500, 300, 500, 300, 500]);
                try { const ctx = new (window.AudioContext || window.webkitAudioContext)(); for (let i = 0; i < 3; i++) { const osc = ctx.createOscillator(); const gain = ctx.createGain(); osc.connect(gain); gain.connect(ctx.destination); osc.frequency.value = 880; osc.type = 'sine'; gain.gain.value = 1.0; const inicio = ctx.currentTime + (i * 0.6); osc.start(inicio); osc.stop(inicio + 0.4); }} catch(e) {}
                if ('Notification' in window && Notification.permission === 'granted') { try { new Notification('🥚 Hora da Viragem!', { body: 'Vire os ovos da incubadora agora.', icon: 'png192.png', requireInteraction: true }); } catch(e) {} }
                showNotification('🚨 Hora da Viragem!', 'Vire os ovos da incubadora agora.');
                setTimeout(() => { document.getElementById('turn-status').textContent = 'Aguardando'; }, 10000);
            }
        }
        if (agora.getMinutes() !== 0) alarmeJaTocouNestaHora = false;
    }, 1000);
}

// ==========================================
// NOVO: SISTEMA DE ALARME DE OVOSCOPIA
// ==========================================
function iniciarVerificacaoOvoscopia() {
    // Verifica a cada 30 minutos para não sobrecarregar
    setInterval(() => {
        const hoje = new Date();
        if (hoje.getHours() === 8 && !ovoscopiaJaVerificadaHoje) { // Dispara às 8h da manhã
            ovoscopiaJaVerificadaHoje = true;
            verificarAlertasOvoscopia();
        }
        if (hoje.getHours() !== 8) ovoscopiaJaVerificadaHoje = false;
    }, 60000);
}

function verificarAlertasOvoscopia() {
    batches.forEach(batch => {
        const days = getDaysDiff(batch.startDate);
        const diasParaOvoscopia = ovoscopiaDays[batch.birdType] || [7, 14, 18];
        
        // Verifica se hoje é um dos dias de ovoscopia
        if (diasParaOvoscopia.includes(days)) {
            if (!batch.ovoscopiaDone || !batch.ovoscopiaDone.includes(days)) {
                
                if (navigator.vibrate) navigator.vibrate([1000, 500, 1000]); // Vibração diferente da viragem
                
                // Som agudo e longo de alerta
                try {
                    const ctx = new (window.AudioContext || window.webkitAudioContext)();
                    const osc = ctx.createOscillator(); const gain = ctx.createGain();
                    osc.connect(gain); gain.connect(ctx.destination);
                    osc.frequency.value = 1200; osc.type = 'square'; gain.gain.value = 0.6;
                    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.8);
                } catch(e) {}

                const nomeAve = birdTypeNames[batch.birdType] || batch.birdType;
                const msg = `🔍 Dia de Ovoscopia! Lote #${batch.id} (${nomeAve}) está no dia ${days}.`;
                
                if ('Notification' in window && Notification.permission === 'granted') {
                    try { new Notification('🔍 Ovoscopia Hoje!', { body: msg, icon: 'png192.png', requireInteraction: true }); } catch(e) {}
                }

                // Notificação com botão para dar como feita
                const n = document.createElement('div'); n.className = 'notification';
                n.innerHTML = `<div style="font-weight:600;margin-bottom:0.3rem;">🔍 Ovoscopia Pendente</div>
                              <div style="font-size:0.9rem;color:#666;">${msg}</div>
                              <button class="notification-btn" onclick="markOvoscopiaDone(${batch.id}, ${days}); this.parentElement.style.opacity='0'; setTimeout(()=>this.parentElement.remove(), 300);">Dar como Feita</button>`;
                document.body.appendChild(n);
                setTimeout(() => { if(document.body.contains(n)) { n.style.opacity = '0'; setTimeout(() => n.remove(), 300); }}, 20000);
            }
        }
    });
}

// ==========================================
// PWA (INSTALAÇÃO)
// ==========================================
function setupPWA() {
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(e => {});
    window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredPrompt = e; document.getElementById('install-btn').style.display = 'flex'; });
    document.getElementById('install-btn').addEventListener('click', () => { if (deferredPrompt) { deferredPrompt.prompt(); deferredPrompt.userChoice.then(() => { deferredPrompt = null; }); }});
    window.addEventListener('appinstalled', () => { document.getElementById('install-btn').style.display = 'none'; showNotification('🎉 Instalado', 'App instalado com sucesso!'); });
}

// ==========================================
// LOTES
// ==========================================
function renderBatches() {
    const container = document.getElementById('batches-container');
    if (batches.length === 0) { container.innerHTML = '<div class="empty-state"><i class="fas fa-egg"></i><p>Nenhum lote cadastrado</p></div>'; return; }

    container.innerHTML = batches.map(batch => {
        const days = getDaysDiff(batch.startDate);
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
                    <div>🥚 ${birdTypeNames[batch.birdType]} - ${batch.eggCount} ovos</div>
                    <div>📅 Início: ${getLocalDate(batch.startDate).toLocaleDateString('pt-BR')}</div>
                    <div>📊 Progresso: ${progress.toFixed(0)}% (Dia ${days})</div>
                </div>
                <div class="batch-actions">
                    <button class="icon-btn" onclick="viewBatchDetails(${batch.id})"><i class="fas fa-eye"></i></button>
                    <button class="icon-btn" onclick="editBatch(${batch.id})"><i class="fas fa-edit"></i></button>
                    <button class="icon-btn delete" onclick="deleteBatch(${batch.id})"><i class="fas fa-trash"></i></button>
                </div>
            </div>`;
    }).join('');
}

function openBatchModal() {
    document.getElementById('modal-title').textContent = 'Novo Lote';
    document.getElementById('batch-form').reset();
    document.getElementById('batch-id').value = '';
    const hoje = new Date(); const ano = hoje.getFullYear(); const mes = String(hoje.getMonth() + 1).padStart(2, '0'); const dia = String(hoje.getDate()).padStart(2, '0');
    document.getElementById('start-date').value = `${ano}-${mes}-${dia}`;
    document.getElementById('batch-modal').style.display = 'flex';
}

function closeModal() { document.querySelectorAll('.modal').forEach(modal => { modal.style.display = 'none'; }); }

function viewBatchDetails(id) {
    const batch = batches.find(b => b.id === id); if (!batch) return;
    const days = getDaysDiff(batch.startDate);
    const incubationDays = incubationPeriods[batch.birdType] || 21;
    const progress = Math.min(100, (days / incubationDays) * 100);
    const hatchDate = getLocalDate(batch.startDate); hatchDate.setDate(hatchDate.getDate() + incubationDays);
    
    // NOVO: Calcula e mostra o status da ovoscopia nos detalhes
    const diasOvoscopia = ovoscopiaDays[batch.birdType] || [7, 14, 18];
    let ovoscopiaHtml = '<div style="margin-top:15px; padding-top:15px; border-top:1px solid #eee;"><strong>🔍 Dias de Ovoscopia:</strong><ul style="margin:5px 0 0 20px; padding:0; list-style:none;">';
    
    diasOvoscopia.forEach(dia => {
        const jaFeita = batch.ovoscopiaDone && batch.ovoscopiaDone.includes(dia);
        const isHoje = days === dia;
        let statusTxt = '';
        if (jaFeita) statusTxt = '<span style="color:#2e7d32;"> ✅ Concluída</span>';
        else if (isHoje) statusTxt = '<span style="color:#d32f2f; font-weight:bold;"> ⚠️ FAZER HOJE!</span>';
        else if (days > dia) statusTxt = '<span style="color:#f57c00;"> ⏩ Pulada</span>';
        else statusTxt = `<span style="color:#999;"> (Em ${dia - days} dias)</span>`;
        
        ovoscopiaHtml += `<li style="margin-bottom:5px;">Dia ${dia}:${statusTxt}</li>`;
    });
    ovoscopiaHtml += '</ul></div>';

    document.getElementById('batch-details-content').innerHTML = `
        <div class="batch-details">
            <div class="detail-row"><span class="detail-label">ID:</span><span class="detail-value">#${batch.id}</span></div>
            <div class="detail-row"><span class="detail-label">Ave:</span><span class="detail-value">${birdTypeNames[batch.birdType]}</span></div>
            <div class="detail-row"><span class="detail-label">Início:</span><span class="detail-value">${getLocalDate(batch.startDate).toLocaleDateString('pt-BR')}</span></div>
            <div class="detail-row"><span class="detail-label">Ovos:</span><span class="detail-value">${batch.eggCount}</span></div>
            <div class="detail-row"><span class="detail-label">Dias incubando:</span><span class="detail-value">${days} dias</span></div>
            <div class="detail-row"><span class="detail-label">Eclosão prevista:</span><span class="detail-value">${hatchDate.toLocaleDateString('pt-BR')}</span></div>
            <div class="detail-row"><span class="detail-label">Progresso:</span><span class="detail-value">${progress.toFixed(1)}%</span></div>
            <div class="progress-bar"><div class="progress-fill" style="width: ${progress}%"></div></div>
            ${batch.notes ? `<div class="detail-row"><span class="detail-label">Obs:</span><span class="detail-value">${batch.notes}</span></div>` : ''}
            ${ovoscopiaHtml}
        </div>`;
    document.getElementById('details-modal').style.display = 'flex';
}

function editBatch(id) {
    const batch = batches.find(b => b.id === id); if (!batch) return;
    document.getElementById('modal-title').textContent = 'Editar Lote';
    document.getElementById('batch-id').value = batch.id;
    document.getElementById('bird-type').value = batch.birdType;
    document.getElementById('start-date').value = batch.startDate;
    document.getElementById('egg-count').value = batch.eggCount;
    document.getElementById('notes').value = batch.notes || '';
    document.getElementById('batch-modal').style.display = 'flex';
}

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
        if (index !== -1) batches[index] = { ...batches[index], ...batchData }; 
    } else { 
        batchData.id = batches.length > 0 ? Math.max(...batches.map(b => b.id)) + 1 : 1; 
        batches.push(batchData); 
    }
    try { localStorage.setItem('incubadora-batches', JSON.stringify(batches)); renderBatches(); closeModal(); showNotification('✅ Sucesso', batchId ? 'Lote atualizado!' : 'Lote salvo!'); } catch (e) { showNotification('❌ Erro', 'Não foi possível salvar.'); }
}

function deleteBatch(id) {
    if (confirm('Tem certeza que deseja excluir este lote?')) {
        batches = batches.filter(b => b.id !== id);
        try { localStorage.setItem('incubadora-batches', JSON.stringify(batches)); renderBatches(); showNotification('✅ Sucesso', 'Lote excluído!'); } catch (e) {}
    }
}

// ==========================================
// LIMPEZA E NOTIFICAÇÕES
// ==========================================
function clearData() {
    if (confirm('Tem certeza que deseja limpar todos os dados? Isso exclui os lotes, mas mantém a chave da IA e o chat.')) {
        var apiKey = localStorage.getItem('incubadora_groq_api_key');
        var chatHist = localStorage.getItem('incubadora_chat_history');
        localStorage.clear();
        if (apiKey) localStorage.setItem('incubadora_groq_api_key', apiKey);
        if (chatHist) localStorage.setItem('incubadora_chat_history', chatHist);
        batches = []; renderBatches(); showNotification('✅ Sucesso', 'Dados limpos!');
    }
}

function showNotification(title, message) {
    const n = document.createElement('div'); n.className = 'notification';
    n.innerHTML = `<div style="font-weight:600;margin-bottom:0.3rem;">${title}</div><div style="font-size:0.9rem;color:#666;">${message}</div>`;
    document.body.appendChild(n);
    setTimeout(() => { n.style.opacity = '0'; setTimeout(() => n.remove(), 300); }, 3000);
}
