// Check authentication
async function checkAuth() {
    const { data: { session }, error } = await supabaseClient.auth.getSession();
    
    if (error || !session) {
        // Redirect to login if not authenticated
        window.location.href = 'index.html';
        return null;
    }
    
    return session;
}

// Load user data
async function loadUserData() {
    const session = await checkAuth();
    if (!session) return;
    
    const user = session.user;
    
    // Update user info in sidebar
    const userName = document.getElementById('userName');
    const userAvatar = document.getElementById('userAvatar');
    const userRole = document.getElementById('userRole');
    
    if (userName) {
        userName.textContent = user.user_metadata?.full_name || user.email.split('@')[0];
    }
    
    if (userAvatar) {
        userAvatar.textContent = (user.user_metadata?.full_name || user.email)[0].toUpperCase();
    }
    
    // Fetch profile from database
    const { data: profile } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
    
    if (profile && userRole) {
        userRole.textContent = profile.role || 'Employee';
    }
}

// Navigation System
function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const pages = document.querySelectorAll('.page');
    
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const pageName = item.dataset.page;
            
            // Update active nav item
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Show corresponding page
            pages.forEach(page => page.classList.remove('active'));
            const targetPage = document.getElementById(`${pageName}-page`);
            if (targetPage) {
                targetPage.classList.add('active');
            }
            
            // Close sidebar on mobile
            if (window.innerWidth <= 1024) {
                toggleSidebar(false);
            }
        });
    });
}

// Sidebar Toggle
function toggleSidebar(force) {
    const sidebar = document.getElementById('sidebar');
    if (typeof force === 'boolean') {
        if (force) {
            sidebar.classList.add('open');
        } else {
            sidebar.classList.remove('open');
        }
    } else {
        sidebar.classList.toggle('open');
    }
}

// Theme Toggle
function toggleTheme() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme');
    
    if (currentTheme === 'dark') {
        body.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
    } else {
        body.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    }
}

// Load saved theme
function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
    }
}

// Pagination System
function initializePagination() {
    // Main pagination
    setupPagination('.pagination-section .pagination');
    
    // Table pagination
    setupPagination('.table-pagination .pagination');
}

function setupPagination(selector) {
    const pagination = document.querySelector(selector);
    if (!pagination) return;
    
    const buttons = pagination.querySelectorAll('ul li');
    const previous = pagination.querySelector('button:first-child');
    const next = pagination.querySelector('button:last-child');
    
    let currentIndex = 0;
    
    // Initial state
    updateButtonState();
    
    // Number buttons
    buttons.forEach((btn, i) => {
        btn.addEventListener('click', () => {
            currentIndex = i;
            updateActiveClass();
            updateButtonState();
            handlePageChange(currentIndex + 1);
        });
    });
    
    // Previous button
    previous.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateActiveClass();
            updateButtonState();
            handlePageChange(currentIndex + 1);
        }
    });
    
    // Next button
    next.addEventListener('click', () => {
        if (currentIndex < buttons.length - 1) {
            currentIndex++;
            updateActiveClass();
            updateButtonState();
            handlePageChange(currentIndex + 1);
        }
    });
    
    function updateActiveClass() {
        buttons.forEach(btn => btn.classList.remove('active'));
        buttons[currentIndex].classList.add('active');
    }
    
    function updateButtonState() {
        previous.disabled = currentIndex === 0;
        next.disabled = currentIndex === buttons.length - 1;
    }
}

function handlePageChange(pageNumber) {
    console.log(`Navigating to page ${pageNumber}`);
    // Here you would typically fetch data for the new page
    // For now, we'll just log it
}

// Button animation
function initializeButtonAnimations() {
    const buttons = document.querySelectorAll('button:not(.menu-toggle):not(.notification-btn):not(.theme-toggle)');
    
    buttons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            // Add pressed effect
            btn.style.transform = 'scale(0.95)';
            setTimeout(() => {
                btn.style.transform = '';
            }, 200);
        });
    });
}

// Search functionality
function initializeSearch() {
    const searchInput = document.querySelector('.search-input');
    const searchBtn = document.querySelector('.search-btn');
    
    function performSearch() {
        const query = searchInput.value.trim();
        if (query) {
            console.log(`Searching for: ${query}`);
            // Implement actual search functionality here
            alert(`Searching for: ${query}`);
        }
    }
    
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
}

// Notification system
function initializeNotifications() {
    const notificationBtn = document.querySelector('.notification-btn');
    
    notificationBtn.addEventListener('click', () => {
        alert('Notifications feature coming soon!');
    });
}

// Logout function
async function handleLogout() {
    const { error } = await supabaseClient.auth.signOut();
    if (!error) {
        window.location.href = 'index.html';
    } else {
        console.error('Logout error:', error);
    }
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication first
    const session = await checkAuth();
    if (!session) return;
    
    // Load user data
    await loadUserData();
    
    // Load theme
    loadTheme();
    
    // Initialize all systems
    initializeNavigation();
    initializePagination();
    initializeButtonAnimations();
    initializeSearch();
    initializeNotifications();
    
    // Close sidebar on outside click (mobile)
    document.addEventListener('click', (e) => {
        const sidebar = document.getElementById('sidebar');
        const menuToggle = document.querySelector('.menu-toggle');
        
        if (window.innerWidth <= 1024 && 
            !sidebar.contains(e.target) && 
            !menuToggle.contains(e.target) &&
            sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 1024) {
            document.getElementById('sidebar').classList.remove('open');
        }
    });
});
