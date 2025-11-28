/* Reset e Variáveis */
:root {
    --primary-color: #1565C0;
    --primary-dark: #0D47A1;
    --primary-light: #42a5f5;
    --secondary-color: #FF6F00;
    --success-color: #4CAF50;
    --warning-color: #FFC107;
    --danger-color: #F44336;
    --text-color: #333333;
    --text-light: #666666;
    --bg-color: #F5F5F5;
    --card-bg: #FFFFFF;
    --border-color: #E0E0E0;
    --shadow: 0 2px 4px rgba(0,0,0,0.1);
    --shadow-hover: 0 4px 8px rgba(0,0,0,0.15);
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    background-color: var(--bg-color);
    color: var(--text-color);
    line-height: 1.6;
}

.app-container {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}

/* Cabeçalho */
.app-header {
    background-color: var(--primary-color);
    color: white;
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: var(--shadow);
    position: sticky;
    top: 0;
    z-index: 100;
}

.logo {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.logo i {
    font-size: 2rem;
    color: var(--warning-color);
}

.logo h1 {
    font-size: 1.75rem;
    font-weight: 700;
}

.logo span {
    color: var(--warning-color);
}

.header-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.install-btn {
    background-color: var(--success-color);
    color: white;
    border: none;
    padding: 0.6rem 1.2rem;
    border-radius: 0.5rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
    transition: all 0.3s ease;
    box-shadow: var(--shadow);
}

.install-btn:hover {
    background-color: #45a049;
    transform: translateY(-2px);
    box-shadow: var(--shadow-hover);
}

.status-indicator {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background-color: rgba(255,255,255,0.1);
    padding: 0.4rem 0.8rem;
    border-radius: 1rem;
}

.status-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: var(--success-color);
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.7; transform: scale(1.1); }
    100% { opacity: 1; transform: scale(1); }
}

/* Navegação */
.app-nav {
    background-color: var(--primary-dark);
    display: flex;
    justify-content: space-around;
    padding: 0.5rem 0;
    box-shadow: var(--shadow);
    position: sticky;
    top: 73px;
    z-index: 99;
}

.nav-btn {
    background: none;
    border: none;
    color: white;
    padding: 0.75rem 1rem;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    transition: all 0.3s ease;
    border-radius: 0.5rem;
    flex: 1;
}

.nav-btn:hover {
    background-color: rgba(255, 255, 255, 0.1);
}

.nav-btn.active {
    background-color: rgba(255, 255, 255, 0.2);
    border-bottom: 3px solid var(--warning-color);
}

.nav-btn i {
    font-size: 1.25rem;
}

.nav-btn span {
    font-size: 0.875rem;
    font-weight: 500;
}

/* Conteúdo principal */
.app-main {
    flex: 1;
    padding: 1.5rem;
    padding-bottom: 5rem;
}

.page {
    display: none;
    animation: fadeIn 0.5s ease;
}

.page.active {
    display: block;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1rem;
}

.page-header h2 {
    color: var(--primary-color);
    font-size: 2rem;
    font-weight: 700;
}

.current-time {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--primary-dark);
    background-color: var(--bg-color);
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    box-shadow: var(--shadow);
}

/* Dashboard */
.dashboard-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.card {
    background: var(--card-bg);
    border-radius: 1rem;
    padding: 1.5rem;
    box-shadow: var(--shadow);
    transition: all 0.3s ease;
    border: 1px solid var(--border-color);
}

.card:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-hover);
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    color: var(--primary-color);
}

.card-header h3 {
    font-size: 1.25rem;
    font-weight: 600;
}

.card-header i {
    font-size: 1.5rem;
    color: var(--primary-light);
}

.card-value {
    font-size: 3rem;
    font-weight: 700;
    margin-bottom: 1rem;
    color: var(--primary-dark);
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
}

.unit {
    font-size: 1.5rem;
    color: var(--text-light);
    font-weight: 400;
}

/* Status bar */
.status-bar {
    height: 8px;
    background-color: var(--border-color);
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 0.75rem;
}

.status-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--primary-light), var(--primary-color));
    width: 0%;
    transition: width 0.5s ease;
}

.temp-fill {
    background: linear-gradient(90deg, #FF9800, var(--secondary-color));
}

.humidity-fill {
    background: linear-gradient(90deg, #2196F3, #03A9F4);
}

/* Turn card */
.turn-status {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.turn-icon {
    font-size: 3rem;
    color: var(--primary-color);
    animation: rotate 20s linear infinite;
}

@keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

.turn-timer {
    color: var(--text-light);
    font-weight: 500;
}

/* Status list */
.status-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.status-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    background-color: var(--bg-color);
    border-radius: 0.5rem;
}

.status-item i {
    color: var(--primary-color);
    font-size: 1.25rem;
}

.status-item strong {
    color: var(--success-color);
}

/* Chart container */
.chart-container {
    background: var(--card-bg);
    border-radius: 1rem;
    padding: 1.5rem;
    box-shadow: var(--shadow);
    margin-top: 2rem;
}

.chart-container h3 {
    color: var(--primary-color);
    margin-bottom: 1rem;
    font-weight: 600;
}

/* Grids */
.incubators-grid,
.batches-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1.5rem;
}

.incubator-card,
.batch-card {
    background: var(--card-bg);
    border-radius: 1rem;
    padding: 1.5rem;
    box-shadow: var(--shadow);
    transition: all 0.3s ease;
    border: 1px solid var(--border-color);
    position: relative;
    overflow: hidden;
}

.incubator-card::before,
.batch-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 5px;
    height: 100%;
    background-color: var(--primary-color);
}

.incubator-card:hover,
.batch-card:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-hover);
}

.incubator-header,
.batch-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.incubator-title,
.batch-title {
    font-weight: 700;
    color: var(--primary-color);
    font-size: 1.25rem;
}

.incubator-status,
.batch-status {
    padding: 0.25rem 0.75rem;
    border-radius: 1rem;
    font-size: 0.875rem;
    font-weight: 600;
}

.status-online {
    background-color: #E8F5E9;
    color: var(--success-color);
}

.status-offline {
    background-color: #FFEBEE;
    color: var(--danger-color);
}

.status-active {
    background-color: #E8F5E9;
    color: var(--success-color);
}

.status-pending {
    background-color: #FFF3E0;
    color: var(--secondary-color);
}

.status-completed {
    background-color: #E3F2FD;
    color: var(--primary-color);
}

.incubator-info,
.batch-info {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    color: var(--text-light);
    font-size: 0.95rem;
}

.incubator-info i,
.batch-info i {
    color: var(--primary-color);
    width: 20px;
}

.incubator-actions,
.batch-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-top: 1.5rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border-color);
}

/* Empty state */
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    text-align: center;
    color: var(--text-light);
    grid-column: 1 / -1;
}

.empty-state i {
    font-size: 4rem;
    margin-bottom: 1.5rem;
    color: var(--primary-light);
    opacity: 0.5;
}

.empty-state p {
    font-size: 1.25rem;
    margin-bottom: 2rem;
}

/* Reminders */
.filter-tabs {
    display: flex;
    gap: 0.5rem;
    background-color: var(--bg-color);
    padding: 0.25rem;
    border-radius: 0.5rem;
}

.filter-btn {
    background: none;
    border: none;
    color: var(--text-color);
    padding: 0.5rem 1rem;
    border-radius: 0.25rem;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 500;
}

.filter-btn.active {
    background-color: var(--primary-color);
    color: white;
}

.reminders-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.reminder-item {
    background: var(--card-bg);
    border-radius: 1rem;
    padding: 1.5rem;
    box-shadow: var(--shadow);
    display: flex;
    align-items: center;
    gap: 1.5rem;
    transition: all 0.3s ease;
    border: 1px solid var(--border-color);
}

.reminder-item:hover {
    transform: translateX(5px);
    box-shadow: var(--shadow-hover);
}

.reminder-item.completed {
    opacity: 0.7;
}

.reminder-item.completed .reminder-content h4 {
    text-decoration: line-through;
}

.reminder-icon {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--primary-light), var(--primary-color));
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.25rem;
    flex-shrink: 0;
}

.reminder-content {
    flex: 1;
}

.reminder-content h4 {
    margin-bottom: 0.25rem;
    color: var(--primary-color);
    font-weight: 600;
}

.reminder-content p {
    color: var(--text-light);
    font-size: 0.95rem;
}

.reminder-actions {
    display: flex;
    gap: 0.5rem;
}

/* Settings */
.settings-container {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.settings-section {
    background: var(--card-bg);
    border-radius: 1rem;
    padding: 2rem;
    box-shadow: var(--shadow);
}

.settings-section h3 {
    margin-bottom: 1.5rem;
    color: var(--primary-color);
    padding-bottom: 1rem;
    border-bottom: 2px solid var(--border-color);
    font-size: 1.5rem;
    font-weight: 600;
}

.setting-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.25rem 0;
    border-bottom: 1px solid var(--border-color);
}

.setting-item:last-child {
    border-bottom: none;
}

.setting-info h4 {
    margin-bottom: 0.5rem;
    color: var(--text-color);
    font-weight: 600;
}

.setting-info p {
    color: var(--text-light);
    font-size: 0.95rem;
}

/* Toggle switch */
.toggle-switch {
    position: relative;
    display: inline-block;
    width: 60px;
    height: 30px;
}

.toggle-switch input {
    opacity: 0;
    width: 0;
    height: 0;
}

.slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: .4s;
    border-radius: 30px;
}

.slider:before {
    position: absolute;
    content: "";
    height: 22px;
    width: 22px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: .4s;
    border-radius: 50%;
}

input:checked + .slider {
    background-color: var(--primary-color);
}

input:checked + .slider:before {
    transform: translateX(30px);
}

/* Select input */
.select-input {
    padding: 0.75rem 1rem;
    border: 2px solid var(--border-color);
    border-radius: 0.5rem;
    background-color: white;
    min-width: 180px;
    font-size: 1rem;
    transition: border-color 0.3s ease;
}

.select-input:focus {
    outline: none;
    border-color: var(--primary-color);
}

/* Rodapé */
.app-footer {
    background-color: var(--primary-dark);
    color: white;
    text-align: center;
    padding: 2rem 1rem;
    margin-top: auto;
}

.social-links {
    margin-top: 1rem;
}

.social-link {
    color: white;
    margin: 0 0.75rem;
    text-decoration: none;
    font-size: 1.5rem;
    transition: all 0.3s ease;
}

.social-link:hover {
    color: var(--warning-color);
    transform: translateY(-3px);
}

/* Modais */
.modal {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    justify-content: center;
    align-items: center;
    z-index: 1000;
    backdrop-filter: blur(5px);
}

.modal-content {
    background: var(--card-bg);
    border-radius: 1rem;
    padding: 2rem;
    max-width: 500px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    animation: slideIn 0.3s ease;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

@keyframes slideIn {
    from {
        transform: translateY(-50px);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid var(--border-color);
}

.modal-header h3 {
    color: var(--primary-color);
    font-size: 1.5rem;
    font-weight: 700;
}

.close-modal {
    background: none;
    border: none;
    font-size: 1.75rem;
    cursor: pointer;
    color: var(--text-light);
    transition: color 0.3s ease;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
}

.close-modal:hover {
    color: var(--danger-color);
    background-color: var(--bg-color);
}

/* Formulários */
.form-group {
    margin-bottom: 1.5rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: var(--text-color);
}

.form-group input,
.form-group select,
.form-group textarea {
    width: 100%;
    padding: 0.875rem 1rem;
    border: 2px solid var(--border-color);
    border-radius: 0.5rem;
    font-family: inherit;
    font-size: 1rem;
    transition: all 0.3s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(21, 101, 192, 0.1);
}

.form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--border-color);
}

/* Botões */
.btn {
    padding: 0.875rem 1.75rem;
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.3s ease;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1rem;
}

.btn:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-hover);
}

.btn:active {
    transform: translateY(0);
}

.btn.primary {
    background-color: var(--primary-color);
    color: white;
}

.btn.primary:hover {
    background-color: var(--primary-dark);
}

.btn.secondary {
    background-color: var(--bg-color);
    color: var(--text-color);
    border: 2px solid var(--border-color);
}

.btn.secondary:hover {
    background-color: var(--border-color);
}

.btn.danger {
    background-color: var(--danger-color);
    color: white;
}

.btn.danger:hover {
    background-color: #d32f2f;
}

.btn-icon {
    background: none;
    border: none;
    color: var(--primary-color);
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 0.5rem;
    transition: all 0.3s ease;
    font-size: 1.25rem;
}

.btn-icon:hover {
    background-color: var(--bg-color);
    color: var(--primary-dark);
}

/* Notificações */
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--card-bg);
    padding: 1.25rem;
    border-radius: 0.75rem;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
    z-index: 2000;
    max-width: 350px;
    animation: slideInRight 0.3s ease;
    border-left: 4px solid var(--success-color);
}

@keyframes slideInRight {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

.notification.success {
    border-left-color: var(--success-color);
}

.notification.error {
    border-left-color: var(--danger-color);
}

.notification.warning {
    border-left-color: var(--warning-color);
}

.notification-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
}

.notification-title {
    font-weight: 700;
    color: var(--text-color);
}

.notification-close {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text-light);
    font-size: 1.25rem;
    padding: 0.25rem;
    border-radius: 0.25rem;
    transition: all 0.3s ease;
}

.notification-close:hover {
    color: var(--text-color);
    background-color: var(--bg-color);
}

.notification-message {
    color: var(--text-light);
    line-height: 1.5;
}

/* Detalhes do lote */
.batch-details {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
}

.detail-item {
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--border-color);
}

.detail-item:last-child {
    border-bottom: none;
}

.detail-item h4 {
    color: var(--primary-color);
    margin-bottom: 0.5rem;
    font-weight: 600;
}

.progress-bar {
    height: 12px;
    background-color: var(--border-color);
    border-radius: 6px;
    overflow: hidden;
    margin: 0.75rem 0;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--primary-light), var(--primary-color));
    width: 0%;
    transition: width 0.5s ease;
}

/* Responsividade */
@media (max-width: 768px) {
    .app-header {
        flex-direction: column;
        gap: 1rem;
        padding: 1rem;
    }
    
    .app-nav {
        top: auto;
        position: relative;
        flex-wrap: wrap;
    }
    
    .nav-btn {
        min-width: 80px;
    }
    
    .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }
    
    .dashboard-grid {
        grid-template-columns: 1fr;
    }
    
    .incubators-grid,
    .batches-grid {
        grid-template-columns: 1fr;
    }
    
    .setting-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }
    
    .modal-content {
        width: 95%;
        padding: 1.5rem;
    }
    
    .notification {
        right: 10px;
        left: 10px;
        max-width: none;
    }
    
    .form-actions {
        flex-direction: column;
    }
    
    .btn {
        width: 100%;
        justify-content: center;
    }
}

@media (max-width: 480px) {
    .app-main {
        padding: 1rem;
    }
    
    .card-value {
        font-size: 2.5rem;
    }
    
    .nav-btn span {
        font-size: 0.75rem;
    }
    
    .nav-btn i {
        font-size: 1.1rem;
    }
}
