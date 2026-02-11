// Dashboard JavaScript
const socket = io();\n\n// Real-time notification system\nclass NotificationManager {\n    constructor() {\n        this.notifications = [];\n        this.init();\n    }\n    \n    init() {\n        // Create notification container if it doesn't exist\n        if (!document.getElementById('notification-container')) {\n            const container = document.createElement('div');\n            container.id = 'notification-container';\n            container.className = 'position-fixed top-0 end-0 p-3';\n            container.style.zIndex = '9999';\n            document.body.appendChild(container);\n        }\n    }\n    \n    show(message, type = 'info', duration = 5000) {\n        const notification = this.createElement(message, type);\n        const container = document.getElementById('notification-container');\n        \n        container.appendChild(notification);\n        this.notifications.push(notification);\n        \n        // Animate in\n        setTimeout(() => notification.classList.add('show'), 100);\n        \n        // Auto remove\n        setTimeout(() => this.remove(notification), duration);\n        \n        return notification;\n    }\n    \n    createElement(message, type) {\n        const notification = document.createElement('div');\n        notification.className = `alert alert-${type} alert-dismissible fade`;\n        notification.setAttribute('role', 'alert');\n        \n        const icon = this.getIcon(type);\n        notification.innerHTML = `\n            <i class=\"${icon} me-2\"></i>\n            <span>${message}</span>\n            <button type=\"button\" class=\"btn-close\" data-bs-dismiss=\"alert\"></button>\n        `;\n        \n        return notification;\n    }\n    \n    getIcon(type) {\n        const icons = {\n            success: 'fas fa-check-circle',\n            danger: 'fas fa-exclamation-triangle',\n            warning: 'fas fa-exclamation-circle',\n            info: 'fas fa-info-circle'\n        };\n        return icons[type] || icons.info;\n    }\n    \n    remove(notification) {\n        if (notification && notification.parentNode) {\n            notification.classList.remove('show');\n            setTimeout(() => {\n                if (notification.parentNode) {\n                    notification.parentNode.removeChild(notification);\n                }\n                this.notifications = this.notifications.filter(n => n !== notification);\n            }, 300);\n        }\n    }\n}\n\nconst notifications = new NotificationManager();"
let documentsChart;
let paymentsChart;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    initializeCharts();
    setupSocketListeners();
    updateBotStatus();
    
    // Update every 30 seconds
    setInterval(updateStats, 30000);
});

// Socket event listeners
function setupSocketListeners() {
    socket.on('botStatusUpdate', function(status) {
        updateBotStatusDisplay(status);
        const statusText = status === 'connected' ? 'Bot is online' : 'Bot is offline';\n        const statusType = status === 'connected' ? 'success' : 'warning';\n        notifications.show(statusText, statusType);\n    });\n    \n    socket.on('newUser', function(data) {\n        updateUserCount();\n        addNewUserToTable(data);\n        notifications.show(`New user registered: ${data.name || 'Anonymous'}`, 'info');\n    });\n    \n    socket.on('newDocument', function(data) {\n        updateDocumentCount();\n        addNewDocumentToTable(data);\n        notifications.show(`Document processed: ${data.type || 'Unknown type'}`, 'success');\n        \n        // Add visual effect to document count\n        const docElement = document.getElementById('total-documents');\n        if (docElement) {\n            docElement.classList.add('highlight-update');\n            setTimeout(() => docElement.classList.remove('highlight-update'), 1000);\n        }\n    });\n    \n    socket.on('newPayment', function(data) {\n        updateRevenueCount();\n        showPaymentNotification(data);\n        notifications.show(`Payment received: €${data.amount} via ${data.method}`, 'success');\n        \n        // Confetti effect for payments\n        if (typeof confetti !== 'undefined') {\n            confetti({\n                particleCount: 100,\n                spread: 70,\n                origin: { y: 0.6 }\n            });\n        }\n    });\n    \n    socket.on('settingsUpdated', function(settings) {\n        notifications.show('Settings updated successfully!', 'success');\n    });\n    \n    socket.on('systemAlert', function(data) {\n        notifications.show(data.message, data.type || 'warning', 8000);\n    });\n    \n    socket.on('userActivity', function(data) {\n        // Real-time user activity updates\n        updateUserActivityIndicator(data);\n    });\n    \n    // Connection status\n    socket.on('connect', function() {\n        notifications.show('Dashboard connected to real-time updates', 'success', 3000);\n    });\n    \n    socket.on('disconnect', function() {\n        notifications.show('Connection lost - attempting to reconnect...', 'warning', 10000);\n    });\n    \n    socket.on('reconnect', function() {\n        notifications.show('Reconnected to real-time updates', 'success', 3000);\n    });\n}

// Initialize charts
function initializeCharts() {
    // Documents per day chart
    const documentsCtx = document.getElementById('documentsChart');
    if (documentsCtx) {
        documentsChart = new Chart(documentsCtx, {
            type: 'line',
            data: {
                labels: getLast7Days(),
                datasets: [{
                    label: 'Documents Processed',
                    data: [12, 19, 15, 25, 22, 18, 30],
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
    
    // Payment methods chart
    const paymentsCtx = document.getElementById('paymentsChart');
    if (paymentsCtx) {
        paymentsChart = new Chart(paymentsCtx, {
            type: 'doughnut',
            data: {
                labels: ['PayPal', 'Stripe', 'Free'],
                datasets: [{
                    data: [45, 25, 30],
                    backgroundColor: [
                        '#0070ba',
                        '#635bff',
                        '#28a745'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
}

// Update functions
function updateStats() {
    fetch('/api/stats')
        .then(response => response.json())
        .then(data => {
            document.getElementById('total-users').textContent = data.totalUsers;
            document.getElementById('total-documents').textContent = data.totalDocuments;
            document.getElementById('total-revenue').textContent = '€' + data.totalRevenue;
            updateBotStatusDisplay(data.botStatus);
        })
        .catch(error => console.error('Error fetching stats:', error));
}

function updateBotStatus() {
    const statusElement = document.getElementById('bot-status');
    const iconElement = document.getElementById('bot-status-icon');
    
    if (statusElement && iconElement) {
        const status = statusElement.textContent.toLowerCase();
        
        iconElement.className = 'fas fa-robot fa-2x';
        
        switch(status) {
            case 'connected':
                iconElement.classList.add('online');
                statusElement.className = 'text-success';
                break;
            case 'disconnected':
                iconElement.classList.add('offline');
                statusElement.className = 'text-danger';
                break;
            case 'connecting':
                iconElement.classList.add('connecting');
                statusElement.className = 'text-warning';
                break;
        }
    }
}

function updateBotStatusDisplay(status) {
    const statusElement = document.getElementById('bot-status');
    const iconElement = document.getElementById('bot-status-icon');
    
    if (statusElement) {
        statusElement.textContent = status.charAt(0).toUpperCase() + status.slice(1);
    }
    
    if (iconElement) {
        iconElement.className = 'fas fa-robot fa-2x';
        
        switch(status.toLowerCase()) {
            case 'connected':
                iconElement.classList.add('online');
                statusElement.className = 'text-success';
                break;
            case 'disconnected':
                iconElement.classList.add('offline');
                statusElement.className = 'text-danger';
                break;
            case 'connecting':
                iconElement.classList.add('connecting');
                statusElement.className = 'text-warning';
                break;
        }
    }
}

function updateUserCount() {
    const element = document.getElementById('total-users');
    if (element) {
        const current = parseInt(element.textContent);
        element.textContent = current + 1;
        animateNumber(element);
    }
}

function updateDocumentCount() {
    const element = document.getElementById('total-documents');
    if (element) {
        const current = parseInt(element.textContent);
        element.textContent = current + 1;
        animateNumber(element);
    }
}

function updateRevenueCount() {
    // Revenue will be updated via API call
    updateStats();
}

function animateNumber(element) {
    element.style.transform = 'scale(1.1)';
    element.style.color = '#28a745';
    setTimeout(() => {
        element.style.transform = 'scale(1)';
        element.style.color = '';
    }, 300);
}

// Table updates
function addNewUserToTable(data) {
    const tbody = document.getElementById('recent-users');
    if (tbody) {
        const row = document.createElement('tr');
        row.className = 'new-entry';
        row.innerHTML = `
            <td>${data.userId.substring(0, 12)}...</td>
            <td>0</td>
            <td>3</td>
            <td><span class="badge bg-success">Active</span></td>
        `;
        tbody.insertBefore(row, tbody.firstChild);
        
        // Remove animation class after animation completes
        setTimeout(() => row.classList.remove('new-entry'), 500);
        
        // Keep only first 10 rows
        while (tbody.children.length > 10) {
            tbody.removeChild(tbody.lastChild);
        }
    }
}

function addNewDocumentToTable(data) {
    const tbody = document.getElementById('recent-documents');
    if (tbody) {
        const row = document.createElement('tr');
        row.className = 'new-entry';
        row.innerHTML = `
            <td>${data.userId.substring(0, 12)}...</td>
            <td>Document</td>
            <td>${new Date().toLocaleString()}</td>
            <td><span class="badge bg-success">Processed</span></td>
        `;
        tbody.insertBefore(row, tbody.firstChild);
        
        // Remove animation class after animation completes
        setTimeout(() => row.classList.remove('new-entry'), 500);
        
        // Keep only first 10 rows
        while (tbody.children.length > 10) {
            tbody.removeChild(tbody.lastChild);
        }
    }
}

// Utility functions
function getLast7Days() {
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        days.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }
    return days;
}

function showNotification(message, type = 'info') {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alert.style.top = '20px';
    alert.style.right = '20px';
    alert.style.zIndex = '9999';
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alert);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (alert.parentNode) {
            alert.remove();
        }
    }, 5000);
}

function showPaymentNotification(data) {
    showNotification(`New payment: €${data.amount} via ${data.method}`, 'success');
}

// Settings page functions
function testBot() {
    showNotification('Testing bot connection...', 'info');
    // Add actual test logic here
}

function restartBot() {
    if (confirm('Are you sure you want to restart the bot?')) {
        showNotification('Restarting bot...', 'warning');
        // Add restart logic here
    }
}

function viewLogs() {
    // Open logs in new window or modal
    window.open('/logs', '_blank');
}