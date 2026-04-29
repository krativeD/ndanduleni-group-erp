// Check authentication
async function checkAuth() {
    const { data: { session }, error } = await supabaseClient.auth.getSession();
    
    if (error || !session) {
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
    
    const userName = document.getElementById('userName');
    const userAvatar = document.getElementById('userAvatar');
    const userRole = document.getElementById('userRole');
    
    if (userName) {
        userName.textContent = user.user_metadata?.full_name || user.email.split('@')[0];
    }
    
    if (userAvatar) {
        userAvatar.textContent = (user.user_metadata?.full_name || user.email)[0].toUpperCase();
    }
    
    try {
        const { data: profile } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
        
        if (profile && userRole) {
            userRole.textContent = profile.role || 'Employee';
        }
    } catch (error) {
        console.log('Profile fetch error:', error.message);
        if (userRole) {
            userRole.textContent = 'User';
        }
    }
}

// Update current date
function updateDate() {
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        const now = new Date();
        const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
        dateElement.textContent = now.toLocaleDateString('en-US', options);
    }
}

// Navigation System
function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const pages = document.querySelectorAll('.page');
    const moduleCards = document.querySelectorAll('.module-card');
    
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const pageName = item.dataset.page;
            navigateToPage(pageName, item, navItems, pages);
        });
    });
    
    moduleCards.forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.classList.contains('module-btn')) {
                return;
            }
            const pageName = card.dataset.page;
            const targetNav = document.querySelector(`.nav-item[data-page="${pageName}"]`);
            navigateToPage(pageName, targetNav, navItems, pages);
        });
        
        const btn = card.querySelector('.module-btn');
        if (btn) {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const pageName = card.dataset.page;
                const targetNav = document.querySelector(`.nav-item[data-page="${pageName}"]`);
                navigateToPage(pageName, targetNav, navItems, pages);
            });
        }
    });
}

function navigateToPage(pageName, navItem, allNavItems, allPages) {
    allNavItems.forEach(nav => nav.classList.remove('active'));
    if (navItem) {
        navItem.classList.add('active');
    }
    
    allPages.forEach(page => page.classList.remove('active'));
    const targetPage = document.getElementById(`${pageName}-page`);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    if (window.innerWidth <= 1024) {
        toggleSidebar(false);
    }
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

// Button animations
function initializeButtonAnimations() {
    const buttons = document.querySelectorAll('.module-btn');
    
    buttons.forEach(btn => {
        btn.addEventListener('mousedown', function() {
            btn.style.transform = 'scale(0.95)';
        });
        
        btn.addEventListener('mouseup', function() {
            btn.style.transform = '';
        });
        
        btn.addEventListener('mouseleave', function() {
            btn.style.transform = '';
        });
    });
}

// Search functionality
function initializeSearch() {
    const searchInput = document.querySelector('.search-input');
    const searchBtn = document.querySelector('.search-btn');
    
    function performSearch() {
        const query = searchInput.value.trim().toLowerCase();
        if (!query) return;
        
        const moduleCards = document.querySelectorAll('.module-card');
        let found = false;
        
        moduleCards.forEach(card => {
            const title = card.querySelector('.module-title')?.textContent.toLowerCase() || '';
            const desc = card.querySelector('.module-desc')?.textContent.toLowerCase() || '';
            
            if (title.includes(query) || desc.includes(query)) {
                card.style.boxShadow = '0 0 20px var(--accent-blue)';
                card.style.transform = 'scale(1.02)';
                found = true;
                
                setTimeout(() => {
                    card.style.boxShadow = '';
                    card.style.transform = '';
                }, 2000);
            }
        });
        
        if (found) {
            const overviewNav = document.querySelector('.nav-item[data-page="overview"]');
            const allNavItems = document.querySelectorAll('.nav-item');
            const allPages = document.querySelectorAll('.page');
            navigateToPage('overview', overviewNav, allNavItems, allPages);
        } else {
            alert(`No modules found for "${query}"`);
        }
    }
    
    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
}

// Notification system
function initializeNotifications() {
    const notificationBtn = document.querySelector('.notification-btn');
    
    if (notificationBtn) {
        notificationBtn.addEventListener('click', () => {
            alert('Notifications feature coming soon!\n\nYou have 5 unread notifications');
        });
    }
}

// Logout function
async function handleLogout() {
    const { error } = await supabaseClient.auth.signOut();
    if (!error) {
        window.location.href = 'index.html';
    } else {
        console.error('Logout error:', error);
        alert('Failed to logout. Please try again.');
    }
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    const session = await checkAuth();
    if (!session) return;
    
    await loadUserData();
    loadTheme();
    updateDate();
    initializeNavigation();
    initializeButtonAnimations();
    initializeSearch();
    initializeNotifications();
    
    document.addEventListener('click', (e) => {
        const sidebar = document.getElementById('sidebar');
        const menuToggle = document.querySelector('.menu-toggle');
        
        if (window.innerWidth <= 1024 && 
            sidebar && !sidebar.contains(e.target) && 
            menuToggle && !menuToggle.contains(e.target) &&
            sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
        }
    });
    
    window.addEventListener('resize', () => {
        if (window.innerWidth > 1024) {
            const sidebar = document.getElementById('sidebar');
            if (sidebar) {
                sidebar.classList.remove('open');
            }
        }
    });
});
