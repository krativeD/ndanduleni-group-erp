// Supabase Configuration
const SUPABASE_URL = 'https://eifftlxxlcwkmfzmjpaa.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_SXxc4M6e53WmwtjUTI-gLg_1UXPR-NQ';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM Elements
const loginForm = document.getElementById('loginForm');
const forgotPasswordForm = document.getElementById('forgotPasswordForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginButton = document.getElementById('loginButton');
const errorMessage = document.getElementById('errorMessage');
const resetEmailInput = document.getElementById('resetEmail');
const resetMessage = document.getElementById('resetMessage');
const resetError = document.getElementById('resetError');

// Check if user is already logged in
async function checkSession() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        // User is already logged in, redirect to dashboard
        window.location.href = '/dashboard.html';
    }
}

// Login Form Submit
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    // Reset error message
    errorMessage.style.display = 'none';
    
    // Basic validation
    if (!email || !password) {
        showError('Please enter both email and password');
        return;
    }
    
    // Disable button and show loading state
    setLoadingState(true);
    
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) {
            throw error;
        }
        
        // Successful login
        if (data.session) {
            // Store user data if needed
            const user = data.user;
            
            // Show success briefly then redirect
            setTimeout(() => {
                window.location.href = '/dashboard.html';
            }, 500);
        }
        
    } catch (error) {
        console.error('Login error:', error);
        
        // Handle specific error messages
        let errorMsg = 'Login failed. Please try again.';
        
        if (error.message.includes('Invalid login credentials')) {
            errorMsg = 'Invalid email or password. Please try again.';
        } else if (error.message.includes('Email not confirmed')) {
            errorMsg = 'Please confirm your email address before logging in.';
        } else if (error.message.includes('Too many requests')) {
            errorMsg = 'Too many login attempts. Please try again later.';
        }
        
        showError(errorMsg);
    } finally {
        setLoadingState(false);
    }
});

// Forgot Password Form Submit
forgotPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = resetEmailInput.value.trim();
    
    // Reset messages
    resetMessage.style.display = 'none';
    resetError.style.display = 'none';
    
    // Basic validation
    if (!email) {
        resetError.textContent = 'Please enter your email address';
        resetError.style.display = 'block';
        return;
    }
    
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password.html`
        });
        
        if (error) {
            throw error;
        }
        
        // Show success message
        resetMessage.textContent = 'Password reset link has been sent to your email.';
        resetMessage.style.display = 'block';
        
        // Clear input
        resetEmailInput.value = '';
        
    } catch (error) {
        console.error('Reset password error:', error);
        resetError.textContent = 'Failed to send reset email. Please try again.';
        resetError.style.display = 'block';
    }
});

// Helper Functions
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

function setLoadingState(isLoading) {
    if (isLoading) {
        loginButton.disabled = true;
        loginButton.innerHTML = '<span class="loading-spinner"></span>Logging in...';
    } else {
        loginButton.disabled = false;
        loginButton.innerHTML = 'Log in';
    }
}

function showForgotPassword() {
    loginForm.style.display = 'none';
    forgotPasswordForm.style.display = 'block';
    errorMessage.style.display = 'none';
}

function showLoginForm() {
    forgotPasswordForm.style.display = 'none';
    loginForm.style.display = 'block';
    resetMessage.style.display = 'none';
    resetError.style.display = 'none';
}

// Logout function (to be used in other pages)
async function logout() {
    const { error } = await supabase.auth.signOut();
    if (!error) {
        window.location.href = '/index.html';
    }
}

// Initialize
checkSession();
