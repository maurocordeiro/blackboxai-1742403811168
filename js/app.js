// App Configuration
const APP_CONFIG = {
    MOCK_USERS: [
        { email: 'medico@dermacare.com', password: 'admin123', role: 'admin' },
        { email: 'paciente@dermacare.com', password: 'user123', role: 'user' }
    ],
    DEFAULT_THEME: {
        primaryColor: '#4F46E5',
        secondaryColor: '#6366F1',
        logo: 'https://via.placeholder.com/150'
    }
};

// App State
class AppState {
    constructor() {
        this.currentUser = null;
        this.currentSection = 'login';
        this.theme = { ...APP_CONFIG.DEFAULT_THEME };
        
        // Load saved state
        this.loadSavedState();
    }

    loadSavedState() {
        // Load user
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.currentSection = 'dashboard';
        }

        // Load theme
        const savedTheme = localStorage.getItem('appTheme');
        if (savedTheme) {
            this.theme = { ...this.theme, ...JSON.parse(savedTheme) };
        }
    }

    setUser(user) {
        this.currentUser = user;
        if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user));
        } else {
            localStorage.removeItem('currentUser');
        }
    }

    setTheme(newTheme) {
        this.theme = { ...this.theme, ...newTheme };
        localStorage.setItem('appTheme', JSON.stringify(this.theme));
        this.applyTheme();
    }

    applyTheme() {
        // Update logo
        const logoElements = document.querySelectorAll('#logoImage');
        logoElements.forEach(el => el.src = this.theme.logo);

        // Update colors
        document.documentElement.style.setProperty('--color-primary', this.theme.primaryColor);
        document.documentElement.style.setProperty('--color-secondary', this.theme.secondaryColor);

        // Update Tailwind colors
        if (window.tailwind && window.tailwind.config) {
            window.tailwind.config.theme.extend.colors.primary = this.theme.primaryColor;
            window.tailwind.config.theme.extend.colors.secondary = this.theme.secondaryColor;
        }
    }

    setSection(section) {
        this.currentSection = section;
        this.updateUI();
    }

    updateUI() {
        // Hide all sections
        const sections = ['loginSection', 'dashboardSection', 'patientSection', 'settingsSection'];
        sections.forEach(section => {
            const element = document.getElementById(section);
            if (element) {
                element.classList.add('hidden');
            }
        });

        // Show current section
        const currentElement = document.getElementById(this.currentSection + 'Section');
        if (currentElement) {
            currentElement.classList.remove('hidden');
        }

        // Update navigation if logged in
        if (this.currentUser) {
            this.updateNavigation();
        }
    }

    updateNavigation() {
        const navLinks = document.querySelectorAll('nav a');
        navLinks.forEach(link => {
            const section = link.getAttribute('data-section');
            if (section === this.currentSection) {
                link.classList.add('border-primary', 'text-gray-900');
                link.classList.remove('border-transparent', 'text-gray-500');
            } else {
                link.classList.remove('border-primary', 'text-gray-900');
                link.classList.add('border-transparent', 'text-gray-500');
            }
        });
    }

    logout() {
        this.setUser(null);
        this.setSection('login');
    }
}

// Initialize app state
const appState = new AppState();

// DOM Elements
const loginForm = document.getElementById('loginForm');
const logoUpload = document.getElementById('logoUpload');
const primaryColorInput = document.getElementById('primaryColor');
const secondaryColorInput = document.getElementById('secondaryColor');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Apply initial theme
    appState.applyTheme();

    // Setup navigation
    setupNavigation();

    // Setup login form
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Setup theme controls
    if (logoUpload) {
        logoUpload.addEventListener('change', handleLogoUpload);
    }
    if (primaryColorInput) {
        primaryColorInput.addEventListener('change', handleColorChange);
    }
    if (secondaryColorInput) {
        secondaryColorInput.addEventListener('change', handleColorChange);
    }

    // Update UI based on current state
    appState.updateUI();
});

function setupNavigation() {
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = e.target.getAttribute('data-section');
            if (section) {
                appState.setSection(section);
            }
        });
    });
}

function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    const user = APP_CONFIG.MOCK_USERS.find(u => u.email === email && u.password === password);
    
    if (user) {
        appState.setUser(user);
        appState.setSection('dashboard');
    } else {
        showNotification('Credenciais inválidas. Por favor, tente novamente.', 'error');
    }
}

function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            appState.setTheme({ logo: event.target.result });
        };
        reader.readAsDataURL(file);
    }
}

function handleColorChange(e) {
    const type = e.target.id === 'primaryColor' ? 'primaryColor' : 'secondaryColor';
    appState.setTheme({ [type]: e.target.value });
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg text-white ${
        type === 'success' ? 'bg-green-500' : 
        type === 'error' ? 'bg-red-500' : 
        'bg-blue-500'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}