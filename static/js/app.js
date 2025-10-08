// Global variables
let authToken = localStorage.getItem('authToken');
let currentUser = null;

// API Base URL
const API_BASE = window.location.origin;

// Show/hide functions
function showDemo() {
    document.getElementById('demo').style.display = 'block';
    window.scrollTo({ top: document.getElementById('demo').offsetTop - 60, behavior: 'smooth' });
}

function showLogin() {
    const modal = new bootstrap.Modal(document.getElementById('loginModal'));
    modal.show();
}

function showSignup() {
    const modal = new bootstrap.Modal(document.getElementById('signupModal'));
    modal.show();
}

// Authentication functions
async function register(email, password, fullName) {
    try {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                password: password,
                full_name: fullName
            })
        });

        if (response.ok) {
            const userData = await response.json();
            showAlert('Registration successful! Please login.', 'success');
            bootstrap.Modal.getInstance(document.getElementById('signupModal')).hide();
            showLogin();
        } else {
            const error = await response.json();
            showAlert(error.detail || 'Registration failed', 'danger');
        }
    } catch (error) {
        showAlert('Network error. Please try again.', 'danger');
    }
}

async function login(email, password) {
    try {
        const formData = new FormData();
        formData.append('username', email);
        formData.append('password', password);

        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const data = await response.json();
            authToken = data.access_token;
            localStorage.setItem('authToken', authToken);
            
            // Get user info
            await getCurrentUser();
            
            showAlert('Login successful!', 'success');
            bootstrap.Modal.getInstance(document.getElementById('loginModal')).hide();
            updateUIForLoggedInUser();
        } else {
            const error = await response.json();
            showAlert(error.detail || 'Login failed', 'danger');
        }
    } catch (error) {
        showAlert('Network error. Please try again.', 'danger');
    }
}

async function getCurrentUser() {
    if (!authToken) return null;

    try {
        const response = await fetch(`${API_BASE}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            currentUser = await response.json();
            return currentUser;
        } else {
            logout();
            return null;
        }
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
}

function logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    updateUIForLoggedOutUser();
}

function updateUIForLoggedInUser() {
    // Update navigation
    const navbarNav = document.querySelector('#navbarNav .navbar-nav');
    navbarNav.innerHTML = `
        <li class="nav-item">
            <a class="nav-link" href="#features">Features</a>
        </li>
        <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                ${currentUser.full_name || currentUser.email}
            </a>
            <ul class="dropdown-menu">
                <li><a class="dropdown-item" href="#" onclick="showDashboard()">Dashboard</a></li>
                <li><a class="dropdown-item" href="#" onclick="logout()">Logout</a></li>
            </ul>
        </li>
    `;
}

function updateUIForLoggedOutUser() {
    const navbarNav = document.querySelector('#navbarNav .navbar-nav');
    navbarNav.innerHTML = `
        <li class="nav-item">
            <a class="nav-link" href="#features">Features</a>
        </li>
        <li class="nav-item">
            <a class="nav-link" href="#pricing">Pricing</a>
        </li>
        <li class="nav-item">
            <a class="nav-link" href="#" onclick="showLogin()">Login</a>
        </li>
        <li class="nav-item">
            <a class="nav-link btn btn-outline-light ms-2 px-3" href="#" onclick="showSignup()">Sign Up</a>
        </li>
    `;
}

// Email analysis function
async function analyzeEmail(subject, content) {
    const endpoint = authToken ? '/emails/analyze' : '/emails/demo-analyze';
    const headers = {
        'Content-Type': 'application/json',
    };

    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                subject: subject,
                content: content
            })
        });

        if (response.ok) {
            return await response.json();
        } else {
            const error = await response.json();
            throw new Error(error.detail || 'Analysis failed');
        }
    } catch (error) {
        throw error;
    }
}

// Utility functions
function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3`;
    alertDiv.style.zIndex = '9999';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alertDiv);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.parentNode.removeChild(alertDiv);
        }
    }, 5000);
}

function getCategoryBadgeClass(category) {
    const categoryClasses = {
        'important': 'bg-danger',
        'invoice': 'bg-warning',
        'meeting': 'bg-info',
        'spam': 'bg-dark',
        'newsletter': 'bg-secondary',
        'social': 'bg-primary',
        'promotion': 'bg-success',
        'other': 'bg-secondary'
    };
    return categoryClasses[category] || 'bg-secondary';
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    if (authToken) {
        getCurrentUser().then(() => {
            if (currentUser) {
                updateUIForLoggedInUser();
            }
        });
    }

    // Demo form submission
    const demoForm = document.getElementById('demoForm');
    if (demoForm) {
        demoForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const subject = document.getElementById('emailSubject').value;
            const content = document.getElementById('emailContent').value;

            if (!content || content.trim().length === 0) {
                alert('Please paste an email content.');
                return;
            }

            try {
                const res = await fetch('/emails/demo-analyze', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ subject, content })
                });

                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    throw new Error(err.detail || 'Analysis failed');
                }

                const data = await res.json();

                // Show results
                document.getElementById('analysisResult').style.display = 'block';
                document.getElementById('emailSummary').innerText = data.summary || '-';
                document.getElementById('emailCategory').innerText = data.category || '-';
                document.getElementById('confidenceScore').innerText = data.confidence_score ?? '-';
            } catch (error) {
                console.error(error);
                alert(error.message || 'Unexpected error');
            }
        });
    }

    // Login form submission
    document.getElementById('loginForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        await login(email, password);
    });

    // Signup form submission
    document.getElementById('signupForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const fullName = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        
        await register(email, password, fullName);
    });
});