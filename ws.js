// Configuração do WebSocket
class WebSocketManager {
    constructor() {
        this.socket = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 3000;
        this.isConnected = false;
        this.listeners = {
            open: [],
            message: [],
            close: [],
            error: []
        };
    }

    // Conectar ao servidor WebSocket
    connect(url = 'ws://localhost:8080') {
        try {
            this.socket = new WebSocket(url);
            
            this.socket.onopen = (event) => {
                this.isConnected = true;
                this.reconnectAttempts = 0;
                this.updateStatusIndicator('connected');
                this.emit('open', event);
                console.log('Conexão WebSocket estabelecida');
            };
            
            this.socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.emit('message', data);
                    this.handleMessage(data);
                } catch (error) {
                    console.error('Erro ao processar mensagem WebSocket:', error);
                }
            };
            
            this.socket.onclose = (event) => {
                this.isConnected = false;
                this.updateStatusIndicator('disconnected');
                this.emit('close', event);
                console.log('Conexão WebSocket fechada');
                
                // Tentar reconectar
                if (this.reconnectAttempts < this.maxReconnectAttempts) {
                    setTimeout(() => {
                        this.reconnectAttempts++;
                        console.log(`Tentando reconectar... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
                        this.connect(url);
                    }, this.reconnectDelay);
                }
            };
            
            this.socket.onerror = (error) => {
                this.updateStatusIndicator('error');
                this.emit('error', error);
                console.error('Erro na conexão WebSocket:', error);
            };
            
        } catch (error) {
            console.error('Erro ao criar conexão WebSocket:', error);
            this.updateStatusIndicator('error');
        }
    }

    // Enviar mensagem para o servidor
    send(data) {
        if (this.isConnected && this.socket) {
            this.socket.send(JSON.stringify(data));
        } else {
            console.warn('Não foi possível enviar mensagem. WebSocket não está conectado.');
        }
    }

    // Fechar conexão
    disconnect() {
        if (this.socket) {
            this.socket.close();
        }
    }

    // Adicionar listener de eventos
    on(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event].push(callback);
        }
    }

    // Remover listener de eventos
    off(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
        }
    }

    // Emitir evento
    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(data));
        }
    }

    // Atualizar indicador de status na UI
    updateStatusIndicator(status) {
        const statusDot = document.querySelector('.status-dot');
        const statusText = document.querySelector('.status-indicator span:last-child');
        
        if (statusDot && statusText) {
            switch (status) {
                case 'connected':
                    statusDot.style.backgroundColor = '#4caf50';
                    statusText.textContent = 'Online';
                    break;
                case 'disconnected':
                    statusDot.style.backgroundColor = '#f44336';
                    statusText.textContent = 'Offline';
                    break;
                case 'error':
                    statusDot.style.backgroundColor = '#ff9800';
                    statusText.textContent = 'Erro';
                    break;
                default:
                    statusDot.style.backgroundColor = '#9e9e9e';
                    statusText.textContent = 'Desconhecido';
            }
        }
    }

    // Processar mensagens recebidas
    handleMessage(data) {
        // Atualizar temperatura
        if (data.temperature !== undefined) {
            document.getElementById('temp-value').textContent = data.temperature;
            
            // Atualizar barra de status
            const tempPercent = ((data.temperature - 35) / 3) * 100;
            document.querySelector('.temp-fill').style.width = `${Math.max(0, Math.min(100, tempPercent))}%`;
        }
        
        // Atualizar umidade
        if (data.humidity !== undefined) {
            document.getElementById('humidity-value').textContent = data.humidity;
            
            // Atualizar barra de status
            const humidityPercent = ((data.humidity - 50) / 10) * 100;
            document.querySelector('.humidity-fill').style.width = `${Math.max(0, Math.min(100, humidityPercent))}%`;
        }
        
        // Atualizar status de viragem
        if (data.turnStatus !== undefined) {
            document.getElementById('turn-status').textContent = data.turnStatus;
        }
        
        // Atualizar status do sistema
        if (data.systemStatus) {
            const statusItems = document.querySelectorAll('.status-item strong');
            if (statusItems.length >= 3) {
                statusItems[0].textContent = data.systemStatus.connection || 'OK';
                statusItems[1].textContent = data.systemStatus.power || 'Estável';
                statusItems[2].textContent = data.systemStatus.security || 'Ativa';
            }
        }
        
        // Verificar alertas
        if (data.alerts) {
            data.alerts.forEach(alert => {
                showNotification(alert.title, alert.message, alert.type || 'warning');
            });
        }
    }
}

// Criar instância global do WebSocket
const wsManager = new WebSocketManager();

// Conectar automaticamente quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    // Tentar conectar ao WebSocket
    wsManager.connect();
    
    // Adicionar listener para mensagens
    wsManager.on('message', (data) => {
        console.log('Mensagem recebida:', data);
    });
    
    // Adicionar listener para erros
    wsManager.on('error', (error) => {
        console.error('Erro no WebSocket:', error);
    });
    
    // Adicionar listener para desconexão
    wsManager.on('close', () => {
        console.log('WebSocket desconectado');
    });
});

// Função para enviar comandos para o servidor
function sendCommand(command, data = {}) {
    wsManager.send({
        command,
        timestamp: new Date().toISOString(),
        ...data
    });
}

// Exemplo de uso:
// sendCommand('setTemperature', { value: 37.5 });
// sendCommand('setHumidity', { value: 55 });
// sendCommand('turnEggs');
