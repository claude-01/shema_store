/**
 * SHEMA STORE - Authentication
 * Handle user login and registration
 */

document.addEventListener('DOMContentLoaded', () => {
    attachAuthFormListeners();
});

/**
 * Attach form listeners
 */
function attachAuthFormListeners() {
    const loginForm = document.querySelector('#loginForm');
    const registerForm = document.querySelector('#registerForm');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
}

/**
 * Handle login
 */
async function handleLogin(e) {
    e.preventDefault();

    const email = document.querySelector('input[name="email"]')?.value;
    const password = document.querySelector('input[name="password"]')?.value;

    if (!email || !password) {
        showAlert('Please fill in all fields', 'error');
        return;
    }

    try {
        const response = await api.login(email, password);
        
        showAlert('Login successful!', 'success');
        window.currentUser = response.user;
        
        // Redirect to return URL or home
        const redirect = new URLSearchParams(window.location.search).get('redirect');
        window.location.href = redirect || 'index.html';
    } catch (error) {
        showAlert(error.data?.message || 'Login failed', 'error');
        console.error(error);
    }
}

/**
 * Handle registration
 */
async function handleRegister(e) {
    e.preventDefault();

    const userData = {
        firstName: document.querySelector('input[name="firstName"]')?.value,
        lastName: document.querySelector('input[name="lastName"]')?.value,
        email: document.querySelector('input[name="email"]')?.value,
        phone: document.querySelector('input[name="phone"]')?.value,
        password: document.querySelector('input[name="password"]')?.value,
        confirmPassword: document.querySelector('input[name="confirmPassword"]')?.value
    };

    // Validate
    if (!userData.firstName || !userData.lastName || !userData.email || !userData.password) {
        showAlert('Please fill in all fields', 'error');
        return;
    }

    if (userData.password !== userData.confirmPassword) {
        showAlert('Passwords do not match', 'error');
        return;
    }

    try {
        await api.register(userData);
        
        showAlert('Registration successful! Logging you in...', 'success');
        
        // Auto-login after registration
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
    } catch (error) {
        showAlert(error.data?.message || 'Registration failed', 'error');
        console.error(error);
    }
}
