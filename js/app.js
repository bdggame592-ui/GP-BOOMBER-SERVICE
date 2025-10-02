class BomberService {
    constructor() {
        this.isRunning = false;
        this.intervalId = null;
        this.apiUrl = 'https://bomber-api-j4tnx.onrender.com/num=';
        this.protectedNumbers = ["8053226707"];
        this.callCount = 0;
        
        this.initializeElements();
        this.attachEventListeners();
        this.updateStatus('idle');
    }

    initializeElements() {
        this.phoneInput = document.getElementById('phoneInput');
        this.startBtn = document.getElementById('startBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.statusElement = document.getElementById('status');
        this.logContainer = document.getElementById('logContainer');
    }

    attachEventListeners() {
        this.startBtn.addEventListener('click', () => this.start());
        this.stopBtn.addEventListener('click', () => this.stop());
        
        // Input validation - only numbers
        this.phoneInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
        });
    }

    updateStatus(status) {
        this.statusElement.className = `status status-${status}`;
        
        switch(status) {
            case 'idle':
                this.statusElement.textContent = 'Idle';
                this.startBtn.disabled = false;
                this.stopBtn.disabled = true;
                break;
            case 'running':
                this.statusElement.textContent = 'Running';
                this.startBtn.disabled = true;
                this.stopBtn.disabled = false;
                break;
            case 'stopped':
                this.statusElement.textContent = 'Stopped';
                this.startBtn.disabled = false;
                this.stopBtn.disabled = true;
                break;
            case 'blocked':
                this.statusElement.textContent = 'Blocked (Protected Number)';
                this.startBtn.disabled = true;
                this.stopBtn.disabled = true;
                break;
        }
    }

    addLog(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${type}`;
        logEntry.textContent = `[${timestamp}] ${message}`;
        
        this.logContainer.appendChild(logEntry);
        this.logContainer.scrollTop = this.logContainer.scrollHeight;
        
        // Keep only last 50 logs
        const logs = this.logContainer.querySelectorAll('.log-entry');
        if (logs.length > 50) {
            logs[0].remove();
        }
    }

    validatePhoneNumber(phoneNumber) {
        if (!phoneNumber) {
            this.addLog('Error: Please enter a phone number', 'error');
            return false;
        }

        if (phoneNumber.length !== 10) {
            this.addLog('Error: Phone number must be 10 digits', 'error');
            return false;
        }

        if (this.protectedNumbers.includes(phoneNumber)) {
            this.updateStatus('blocked');
            this.addLog(`Blocked: ${phoneNumber} is a protected number`, 'error');
            return false;
        }

        return true;
    }

    async makeApiCall(phoneNumber) {
        try {
            const response = await fetch(`${this.apiUrl}${phoneNumber}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                mode: 'cors'
            });

            this.callCount++;
            
            if (response.ok) {
                this.addLog(`Call #${this.callCount}: Success`, 'success');
                return true;
            } else {
                this.addLog(`Call #${this.callCount}: Error - ${response.status}`, 'error');
                return false;
            }
        } catch (error) {
            this.callCount++;
            this.addLog(`Call #${this.callCount}: Network Error - ${error.message}`, 'error');
            return false;
        }
    }

    start() {
        const phoneNumber = this.phoneInput.value.trim();
        
        if (!this.validatePhoneNumber(phoneNumber)) {
            return;
        }

        if (this.isRunning) {
            this.addLog('Service is already running', 'info');
            return;
        }

        this.isRunning = true;
        this.updateStatus('running');
        this.addLog('Service started', 'success');

        // Make immediate first call
        this.makeApiCall(phoneNumber);

        // Set up interval for subsequent calls (every 2 seconds)
        this.intervalId = setInterval(async () => {
            if (this.isRunning) {
                await this.makeApiCall(phoneNumber);
            }
        }, 2000);
    }

    stop() {
        if (!this.isRunning) {
            return;
        }

        this.isRunning = false;
        
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        this.updateStatus('stopped');
        this.addLog('Service stopped', 'info');
    }

    // Method to add protected numbers dynamically
    addProtectedNumber(number) {
        if (!this.protectedNumbers.includes(number)) {
            this.protectedNumbers.push(number);
            this.addLog(`Added ${number} to protected numbers`, 'info');
        }
    }

    // Method to remove protected numbers
    removeProtectedNumber(number) {
        const index = this.protectedNumbers.indexOf(number);
        if (index > -1) {
            this.protectedNumbers.splice(index, 1);
            this.addLog(`Removed ${number} from protected numbers`, 'info');
        }
    }

    // Get current protected numbers
    getProtectedNumbers() {
        return [...this.protectedNumbers];
    }
}

// Initialize the bomber service when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.bomberService = new BomberService();
    
    // Add some example protected numbers (you can modify these)
    window.bomberService.addProtectedNumber("8053226707");
    window.bomberService.addProtectedNumber("1234567890");
    
    console.log('GP Bomber Services initialized');
    console.log('Protected numbers:', window.bomberService.getProtectedNumbers());
});
