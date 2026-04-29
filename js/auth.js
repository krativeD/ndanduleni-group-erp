// Supabase Configuration
const SUPABASE_URL = 'https://eifftlxxlcwkmfzmjpaa.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_SXxc4M6e53WmwtjUTI-gLg_1UXPR-NQ';

// Initialize Supabase client only once
let supabaseClient;
try {
    if (!supabaseClient) {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
} catch (error) {
    console.error('Error initializing Supabase:', error);
}
// In the login success handler, change:
window.location.href = '/dashboard.html';

// DOM Elements (with existence check)
function getElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.warn(`Element with id '${id}' not found`);
    }
    return element;
}

const loginForm = getElement('loginForm');
const forgotPasswordForm = getElement('forgotPasswordForm');
const emailInput = getElement('email');
const passwordInput = getElement('password');
const loginButton = getElement('loginButton');
const errorMessage = getElement('errorMessage');
const resetEmailInput = getElement('resetEmail');
const resetMessage = getElement('resetMessage');
const resetError = getElement('resetError');

// Check if user is already logged in
async function checkSession() {
    try {
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        if (error) {
            console.error('Session check error:', error);
            return;
        }
        if (session) {
            // User is already logged in, redirect to dashboard
            window.location.href = '/dashboard.html';
        }
    } catch (error) {
        console.error('Session check failed:', error);
    }
}

// Login Form Submit
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = emailInput ? emailInput.value.trim() : '';
        const password = passwordInput ? passwordInput.value : '';
        
        // Reset error message
        if (errorMessage) {
            errorMessage.style.display = 'none';
        }
        
        // Basic validation
        if (!email || !password) {
            showError('Please enter both email and password');
            return;
        }
        
        // Disable button and show loading state
        setLoadingState(true);
        
        try {
            const { data, error } = await supabaseClient.auth.signInWithPassword({
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
                console.log('Login successful:', user.email);
                
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
            } else if (error.message) {
                errorMsg = error.message;
            }
            
            showError(errorMsg);
        } finally {
            setLoadingState(false);
        }
    });
}

// Forgot Password Form Submit
if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = resetEmailInput ? resetEmailInput.value.trim() : '';
        
        // Reset messages
        if (resetMessage) resetMessage.style.display = 'none';
        if (resetError) resetError.style.display = 'none';
        
        // Basic validation
        if (!email) {
            if (resetError) {
                resetError.textContent = 'Please enter your email address';
                resetError.style.display = 'block';
            }
            return;
        }
        
        try {
            const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password.html`
            });
            
            if (error) {
                throw error;
            }
            
            // Show success message
            if (resetMessage) {
                resetMessage.textContent = 'Password reset link has been sent to your email.';
                resetMessage.style.display = 'block';
            }
            
            // Clear input
            if (resetEmailInput) resetEmailInput.value = '';
            
        } catch (error) {
            console.error('Reset password error:', error);
            if (resetError) {
                resetError.textContent = 'Failed to send reset email. Please try again.';
                resetError.style.display = 'block';
            }
        }
    });
}

// Helper Functions
function showError(message) {
    if (errorMessage) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }
}

function setLoadingState(isLoading) {
    if (loginButton) {
        if (isLoading) {
            loginButton.disabled = true;
            loginButton.innerHTML = '<span class="loading-spinner"></span>Logging in...';
        } else {
            loginButton.disabled = false;
            loginButton.innerHTML = 'Log in';
        }
    }
}

// Make these functions globally accessible
window.showForgotPassword = function() {
    if (loginForm) loginForm.style.display = 'none';
    if (forgotPasswordForm) forgotPasswordForm.style.display = 'block';
    if (errorMessage) errorMessage.style.display = 'none';
};

window.showLoginForm = function() {
    if (forgotPasswordForm) forgotPasswordForm.style.display = 'none';
    if (loginForm) loginForm.style.display = 'block';
    if (resetMessage) resetMessage.style.display = 'none';
    if (resetError) resetError.style.display = 'none';
};

// Logout function (to be used in other pages)
window.logout = async function() {
    try {
        const { error } = await supabaseClient.auth.signOut();
        if (!error) {
            window.location.href = '/index.html';
        }
    } catch (error) {
        console.error('Logout error:', error);
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('Ndanduleni Group ERP - Login Portal Initialized');
    checkSession();
});
