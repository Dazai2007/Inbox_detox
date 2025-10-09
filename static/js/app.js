// Global variables
let authToken = localStorage.getItem('authToken');
let currentUser = null;

// API Base URL
const API_BASE = window.location.origin;

// Show/hide functions
// Demo kaldırıldı; örnek görseller için scroll
function goExamples() {
    const el = document.getElementById('examples');
    if (el) window.scrollTo({ top: el.offsetTop - 60, behavior: 'smooth' });
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
    const navbarNav = document.querySelector('#navbarNavList');
    navbarNav.innerHTML = `
        <li class="nav-item">
            <a class="nav-link" href="#examples"><span data-i18n="nav.examples">Examples</span></a>
        </li>
        <li class="nav-item">
            <a class="nav-link" href="#features"><span data-i18n="nav.features">Features</span></a>
        </li>
        <li class="nav-item">
            <a class="nav-link" href="#about"><span data-i18n="nav.about">About</span></a>
        </li>
        <li class="nav-item">
            <a class="nav-link" href="#contact"><span data-i18n="nav.contact">Contact</span></a>
        </li>
        <li class="nav-item">
            <a class="nav-link" href="#pricing"><span data-i18n="nav.pricing">Pricing</span></a>
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
        <li class="nav-item dropdown ms-2">
            <a class="nav-link dropdown-toggle" href="#" id="langDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                <i class="fas fa-globe me-1"></i><span id="currentLangLabel">EN</span>
            </a>
            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="langDropdown">
                <li><a class="dropdown-item" href="#" data-lang="en">English</a></li>
                <li><a class="dropdown-item" href="#" data-lang="tr">Türkçe</a></li>
                <li><a class="dropdown-item" href="#" data-lang="fr">Français</a></li>
                <li><a class="dropdown-item" href="#" data-lang="de">Deutsch</a></li>
            </ul>
        </li>
    `;
    // re-apply selected language to new nodes
    try { applyLang(localStorage.getItem(I18N_KEY) || 'en'); } catch {}
}

function updateUIForLoggedOutUser() {
    const navbarNav = document.querySelector('#navbarNavList');
    navbarNav.innerHTML = `
        <li class="nav-item">
            <a class="nav-link" href="#examples"><span data-i18n="nav.examples">Examples</span></a>
        </li>
        <li class="nav-item">
            <a class="nav-link" href="#about"><span data-i18n="nav.about">About</span></a>
        </li>
        <li class="nav-item">
            <a class="nav-link" href="#contact"><span data-i18n="nav.contact">Contact</span></a>
        </li>
        <li class="nav-item">
            <a class="nav-link" href="#pricing"><span data-i18n="nav.pricing">Pricing</span></a>
        </li>
        <li class="nav-item" id="navLoginLi">
            <a class="nav-link" href="#" onclick="showLogin()"><span data-i18n="nav.login">Login</span></a>
        </li>
        <li class="nav-item" id="navSignupLi">
            <a class="nav-link btn btn-outline-light ms-2 px-3" href="#" onclick="showSignup()"><span data-i18n="nav.signup">Sign Up</span></a>
        </li>
        <li class="nav-item dropdown ms-2">
            <a class="nav-link dropdown-toggle" href="#" id="langDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                <i class="fas fa-globe me-1"></i><span id="currentLangLabel">EN</span>
            </a>
            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="langDropdown">
                <li><a class="dropdown-item" href="#" data-lang="en">English</a></li>
                <li><a class="dropdown-item" href="#" data-lang="tr">Türkçe</a></li>
                <li><a class="dropdown-item" href="#" data-lang="fr">Français</a></li>
                <li><a class="dropdown-item" href="#" data-lang="de">Deutsch</a></li>
            </ul>
        </li>
    `;
    // re-apply selected language to new nodes
    try { applyLang(localStorage.getItem(I18N_KEY) || 'en'); } catch {}
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
// i18n dictionaries and helpers
const I18N_KEY = 'inbox_detox_lang';
const dict = {
    en: { 'nav.examples':'Examples','nav.features':'Features','nav.about':'About','nav.contact':'Contact','nav.pricing':'Pricing','nav.login':'Login','nav.signup':'Sign Up','hero.title':'Declutter Your Inbox with AI','hero.subtitle':'Let artificial intelligence summarize and categorize your emails instantly. Transform email overload into organized, actionable insights.','hero.examples_btn':'See Examples','hero.cta_btn':'Get Started Free','examples.title':'Example Screens','examples.subtitle':'Sample AI summaries and priority-ranked emails','examples.card1.title':'Gmail Summary Panel','examples.card1.text':'Long emails become short, clear summaries in seconds.','examples.card2.title':'Priority Score','examples.card2.text':'Messages are ranked by urgency and importance.','examples.card3.title':'Analytics & Charts','examples.card3.text':'Daily volumes, sender breakdowns, and trends.','features.title':'Powerful Features','features.subtitle':'Everything you need to manage your inbox efficiently','features.card1.title':'Smart Summarization','features.card1.text':'Get concise summaries of lengthy emails in seconds using advanced AI.','features.card2.title':'Auto Categorization','features.card2.text':'Automatically sort emails into categories: important, meetings, invoices, and more.','features.card3.title':'Analytics & Insights','features.card3.text':'Track email patterns and get insights into your communication habits.','about.title':'About Us','about.text':'Inbox Detox is a SaaS that declutters your inbox with AI. It summarizes long threads, surfaces important messages, and visualizes your daily email habits.','about.list1':'Easy Gmail connection','about.list2':'AI summaries and priority scores','about.list3':'Daily/weekly reports and trends','contact.title':'Contact','contact.subtitle':'Write to us for questions and partnerships.','contact.form.name':'Full Name','contact.form.email':'Email','contact.form.message':'Message','contact.form.send':'Send (soon)','footer.tagline':'AI-powered email management for everyone.','footer.copyright':'© 2024 Inbox Detox. All rights reserved.' },
    tr: { 'nav.examples':'Örnekler','nav.features':'Özellikler','nav.about':'Hakkımızda','nav.contact':'İletişim','nav.pricing':'Fiyatlandırma','nav.login':'Giriş','nav.signup':'Kayıt Ol','hero.title':'Gelen Kutunu Yapay Zeka ile Sadeleştir','hero.subtitle':'Yapay zeka e-postalarınızı anında özetler ve kategorize eder. Karmaşayı, düzenli ve aksiyon alınabilir içgörülere dönüştürün.','hero.examples_btn':'Örnekleri Gör','hero.cta_btn':'Ücretsiz Başla','examples.title':'Örnek Görseller','examples.subtitle':'AI özetleri ve önem sırasına göre e-postalar','examples.card1.title':'Gmail Özet Paneli','examples.card1.text':'Uzun e-postalar saniyeler içinde kısa ve net özetlere dönüşür.','examples.card2.title':'Önem Skoru','examples.card2.text':'Mesajlar aciliyet ve önem derecesine göre sıralanır.','examples.card3.title':'Analitik ve Grafikler','examples.card3.text':'Günlük adetler, gönderen dağılımı ve trendler.','features.title':'Güçlü Özellikler','features.subtitle':'Gelen kutunuzu verimli yönetmek için gereken her şey','features.card1.title':'Akıllı Özetleme','features.card1.text':'Gelişmiş yapay zeka ile uzun e-postaları saniyeler içinde özetleyin.','features.card2.title':'Otomatik Kategorileme','features.card2.text':'E-postaları önemli, toplantı, fatura ve daha fazlasına ayırın.','features.card3.title':'Analitik ve İçgörüler','features.card3.text':'E-posta alışkanlıklarınızı takip edin ve içgörüler elde edin.','about.title':'Hakkımızda','about.text':'Inbox Detox, gelen kutunuzu yapay zeka ile sadeleştiren bir SaaS’tır. Uzun yazışmaları özetler, önemli mesajları öne çıkarır ve günlük alışkanlıklarınızı görselleştirir.','about.list1':'Gmail ile kolay bağlantı','about.list2':'AI özetleri ve önem skorları','about.list3':'Günlük/haftalık raporlar ve trendler','contact.title':'İletişim','contact.subtitle':'Sorular ve iş birlikleri için bize yazın.','contact.form.name':'Ad Soyad','contact.form.email':'E-posta','contact.form.message':'Mesaj','contact.form.send':'Gönder (yakında)','footer.tagline':'Herkes için yapay zekalı e-posta yönetimi.','footer.copyright':'© 2024 Inbox Detox. Tüm hakları saklıdır.' },
    fr: { 'nav.examples':'Exemples','nav.features':'Fonctionnalités','nav.about':'À propos','nav.contact':'Contact','nav.pricing':'Tarifs','nav.login':'Connexion','nav.signup':'Inscription','hero.title':'Désencombrez votre boîte mail avec l’IA','hero.subtitle':'L’IA résume et classe vos emails instantanément. Transformez la surcharge en informations exploitables.','hero.examples_btn':'Voir les exemples','hero.cta_btn':'Commencer gratuitement','examples.title':'Exemples d’écrans','examples.subtitle':'Exemples de résumés IA et d’emails classés par priorité','examples.card1.title':'Panneau de résumé Gmail','examples.card1.text':'Les longs emails deviennent des résumés courts et clairs en quelques secondes.','examples.card2.title':'Score de priorité','examples.card2.text':'Les messages sont classés par urgence et importance.','examples.card3.title':'Analyses & graphiques','examples.card3.text':'Volumes quotidiens, répartition des expéditeurs et tendances.','features.title':'Fonctionnalités puissantes','features.subtitle':'Tout ce qu’il faut pour gérer votre boîte efficacement','features.card1.title':'Résumé intelligent','features.card1.text':'Obtenez des résumés concis des longs emails grâce à l’IA.','features.card2.title':'Catégorisation automatique','features.card2.text':'Classez automatiquement les emails: importants, réunions, factures, etc.','features.card3.title':'Analyses & insights','features.card3.text':'Suivez vos habitudes et obtenez des insights.','about.title':'À propos de nous','about.text':'Inbox Detox est un SaaS qui désencombre votre boîte avec l’IA. Il résume, met en avant l’important et visualise vos habitudes quotidiennes.','about.list1':'Connexion Gmail facile','about.list2':'Résumés IA et scores de priorité','about.list3':'Rapports quotidiens/hebdomadaires et tendances','contact.title':'Contact','contact.subtitle':'Écrivez-nous pour des questions et partenariats.','contact.form.name':'Nom complet','contact.form.email':'E-mail','contact.form.message':'Message','contact.form.send':'Envoyer (bientôt)','footer.tagline':'Gestion des emails par IA pour tous.','footer.copyright':'© 2024 Inbox Detox. Tous droits réservés.' },
    de: { 'nav.examples':'Beispiele','nav.features':'Funktionen','nav.about':'Über uns','nav.contact':'Kontakt','nav.pricing':'Preise','nav.login':'Anmelden','nav.signup':'Registrieren','hero.title':'Entrümpeln Sie Ihr Postfach mit KI','hero.subtitle':'KI fasst E-Mails sofort zusammen und kategorisiert sie. Verwandeln Sie Überlastung in klare, umsetzbare Erkenntnisse.','hero.examples_btn':'Beispiele ansehen','hero.cta_btn':'Kostenlos starten','examples.title':'Beispielansichten','examples.subtitle':'KI-Zusammenfassungen und priorisierte E-Mails','examples.card1.title':'Gmail-Zusammenfassung','examples.card1.text':'Lange E-Mails werden in Sekunden zu kurzen, klaren Zusammenfassungen.','examples.card2.title':'Prioritäts-Score','examples.card2.text':'Nach Dringlichkeit und Wichtigkeit sortiert.','examples.card3.title':'Analysen & Diagramme','examples.card3.text':'Tägliche Volumina, Senderverteilung und Trends.','features.title':'Leistungsstarke Funktionen','features.subtitle':'Alles für effizientes Postfach-Management','features.card1.title':'Intelligente Zusammenfassung','features.card1.text':'Knackige Zusammenfassungen langer E-Mails dank KI.','features.card2.title':'Automatische Kategorisierung','features.card2.text':'Automatisch in Wichtig, Meetings, Rechnungen u.a. sortieren.','features.card3.title':'Analysen & Einblicke','features.card3.text':'Verfolgen Sie Muster und erhalten Sie Einblicke.','about.title':'Über uns','about.text':'Inbox Detox ist ein SaaS, das Ihr Postfach mit KI entrümpelt. Es fasst lange Threads zusammen, hebt Wichtiges hervor und visualisiert Ihre Gewohnheiten.','about.list1':'Einfache Gmail-Verbindung','about.list2':'KI-Zusammenfassungen und Prioritätsscores','about.list3':'Tägliche/Wöchentliche Berichte und Trends','contact.title':'Kontakt','contact.subtitle':'Schreiben Sie uns für Fragen und Partnerschaften.','contact.form.name':'Vollständiger Name','contact.form.email':'E-Mail','contact.form.message':'Nachricht','contact.form.send':'Senden (bald)','footer.tagline':'KI-gestütztes E-Mail-Management für alle.','footer.copyright':'© 2024 Inbox Detox. Alle Rechte vorbehalten.' }
};

function applyLang(lang) {
    const pack = dict[lang] || dict.en;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (key && pack[key]) {
            el.textContent = pack[key];
        }
    });
    const label = document.getElementById('currentLangLabel');
    if (label) label.textContent = (lang || 'en').toUpperCase();
    localStorage.setItem(I18N_KEY, lang);
}

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    if (authToken) {
        getCurrentUser().then(() => {
            if (currentUser) {
                updateUIForLoggedInUser();
            }
        });
    }

    // Demo kaldırıldı

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

        // Initialize language from storage (or default 'en') and hook dropdown clicks
        const initialLang = localStorage.getItem(I18N_KEY) || 'en';
        applyLang(initialLang);
        document.querySelectorAll('[data-lang]').forEach(el => {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                const lang = el.getAttribute('data-lang');
                if (lang) applyLang(lang);
            });
        });
});