import { createContext, useContext, useEffect, useMemo, useState } from 'react'

type Lang = 'en' | 'tr' | 'de' | 'fr' | 'ar'

type Dict = Record<string, string>

const dictionaries: Record<Lang, Dict> = {
  en: {
    signIn: 'Sign In',
    toAccessYour: 'To access your Nexa',
    singleSignOn: 'Single Sign-On',
    connectGoogle: 'Link Gmail (login required)',
    connectGoogleAuthed: 'Link Gmail (Google)',
    signInWithGoogle: 'Sign in with Google',
    or: 'OR',
    email: 'E-mail',
    password: 'Password',
    rememberMe: 'Remember me',
    forgotPassword: 'Forgot your password?',
    dontHaveAccount: "Don’t have an account?",
    createAccount: 'Create account',
    signingIn: 'Signing in…',
    show: 'Show',
    hide: 'Hide',
    loginFailed: 'Login failed',
    registerFailed: 'Registration failed',
    registerSuccess: 'Registration successful. Please verify your email (if required), then login.',
    gmailLoginRequired: 'Please login first to link Gmail. This starts Gmail integration (not SSO).',
    googleStartFailed: 'Could not start Google sign-in',
    captchaInfo: 'This step helps us keep bots out.',
    // Categories
    'cat.important': 'Important',
    'cat.invoice': 'Invoice',
    'cat.meeting': 'Meeting',
    'cat.spam': 'Spam',
    'cat.newsletter': 'Newsletter',
    'cat.social': 'Social',
    'cat.promotion': 'Promotion',
    'cat.other': 'Other',
    // Common actions
    delete: 'Delete',
    confirmDelete: 'Are you sure you want to delete this item?',
    'nav.features': 'Features',
    'nav.dashboard': 'Dashboard',
    'nav.pricing': 'Pricing',
    'nav.cta': 'Start for free',
    'hero.badge': 'Next-gen email management',
    'hero.headingLine1': 'End Email Chaos',
    'hero.headingLine2': 'with Nexivo',
    'hero.description.intro': 'Take control of your inbox with ',
    'hero.description.brand': 'Nexivo',
    'hero.description.body': '. AI-powered triage, automated categorisation, and ',
    'hero.description.efficiency': '70% more efficient',
    'hero.description.outro': ' email management.',
    'hero.cta.primary': '🚀 Start free trial',
    'hero.cta.secondary': '📞 Request demo',
    'hero.stat.users': 'Happy users',
    'hero.stat.successRate': 'Success rate',
    'hero.stat.rating': 'User rating',
    'hero.stat.support': 'Support',
    'language.select': 'Language',
  },
  tr: {
    signIn: 'Giriş Yap',
    toAccessYour: 'Nexa erişimi için',
    singleSignOn: 'Kurumsal Giriş',
    connectGoogle: 'Gmail Bağla (giriş gerekli)',
    connectGoogleAuthed: 'Gmail Bağla (Google)',
    signInWithGoogle: 'Google ile giriş yap',
    or: 'VEYA',
    email: 'E-posta Adresi',
    password: 'Parola',
    rememberMe: 'Beni hatırla',
    forgotPassword: 'Parolanı mı unuttun?',
    dontHaveAccount: 'Hesabın yok mu?',
    createAccount: 'Hesap oluştur',
    signingIn: 'Giriş yapılıyor…',
    show: 'Göster',
    hide: 'Gizle',
    loginFailed: 'Giriş başarısız',
    registerFailed: 'Kayıt başarısız',
    registerSuccess: 'Kayıt başarılı. Lütfen e-postayı (gerekliyse) doğrulayın ve sonra giriş yapın.',
    gmailLoginRequired: 'Gmail bağlamak için önce giriş yapın. Bu işlem SSO değil, Gmail entegrasyonunu başlatır.',
    googleStartFailed: 'Google ile giriş başlatılamadı',
    captchaInfo: 'Bu adım botları engellememize yardımcı olur.',
    // Categories
    'cat.important': 'Önemli',
    'cat.invoice': 'Fatura',
    'cat.meeting': 'Toplantı',
    'cat.spam': 'Spam',
    'cat.newsletter': 'Bülten',
    'cat.social': 'Sosyal',
    'cat.promotion': 'Kampanya',
    'cat.other': 'Diğer',
    // Common actions
    delete: 'Sil',
    confirmDelete: 'Bu kaydı silmek istediğine emin misin?',
    'nav.features': 'Özellikler',
    'nav.dashboard': 'Dashboard',
    'nav.pricing': 'Fiyatlar',
    'nav.cta': 'Ücretsiz Başla',
    'hero.badge': 'Yeni nesil email yönetimi',
    'hero.headingLine1': 'Email Karmaşasına',
    'hero.headingLine2': 'Son Verin',
    'hero.description.intro': '',
    'hero.description.brand': 'Nexivo',
    'hero.description.body': ' ile gelen kutunuzu akıllıca yönetin. Yapay zeka destekli sıralama, otomatik kategorilendirme ve ',
    'hero.description.efficiency': '%70 daha verimli',
    'hero.description.outro': ' email yönetimi.',
    'hero.cta.primary': '🚀 Ücretsiz Deneyin',
    'hero.cta.secondary': '📞 Demo İste',
    'hero.stat.users': 'Mutlu Kullanıcı',
    'hero.stat.successRate': 'Başarı Oranı',
    'hero.stat.rating': 'Kullanıcı Puanı',
    'hero.stat.support': 'Destek',
    'language.select': 'Dil',
  }
  ,
  de: {
    signIn: 'Anmelden',
    toAccessYour: 'Zugriff auf dein Nexa',
    singleSignOn: 'Single Sign-On',
    connectGoogle: 'Gmail verknüpfen (Anmeldung erforderlich)',
    connectGoogleAuthed: 'Gmail verknüpfen (Google)',
    signInWithGoogle: 'Mit Google anmelden',
    or: 'ODER',
    email: 'E-Mail',
    password: 'Passwort',
    rememberMe: 'Angemeldet bleiben',
    forgotPassword: 'Passwort vergessen?',
    dontHaveAccount: 'Noch kein Konto?',
    createAccount: 'Konto erstellen',
    signingIn: 'Anmeldung…',
    show: 'Anzeigen',
    hide: 'Verbergen',
    loginFailed: 'Anmeldung fehlgeschlagen',
    registerFailed: 'Registrierung fehlgeschlagen',
    registerSuccess: 'Registrierung erfolgreich. Bitte E-Mail (falls erforderlich) bestätigen und anschließend anmelden.',
    gmailLoginRequired: 'Bitte zuerst anmelden, um Gmail zu verknüpfen. Dies ist keine SSO-Anmeldung.',
    googleStartFailed: 'Google-Anmeldung konnte nicht gestartet werden',
    captchaInfo: 'Dieser Schritt hilft uns, Bots fernzuhalten.',
    'cat.important': 'Wichtig',
    'cat.invoice': 'Rechnung',
    'cat.meeting': 'Meeting',
    'cat.spam': 'Spam',
    'cat.newsletter': 'Newsletter',
    'cat.social': 'Sozial',
    'cat.promotion': 'Aktion',
    'cat.other': 'Sonstiges',
    delete: 'Löschen',
    confirmDelete: 'Möchtest du dieses Element wirklich löschen?',
    'nav.features': 'Funktionen',
    'nav.dashboard': 'Dashboard',
    'nav.pricing': 'Preise',
    'nav.cta': 'Kostenlos starten',
    'hero.badge': 'Nächste Generation E-Mail-Management',
    'hero.headingLine1': 'Beende das E-Mail-Chaos',
    'hero.headingLine2': 'mit Nexivo',
    'hero.description.intro': 'Behalte dein Postfach im Griff mit ',
    'hero.description.brand': 'Nexivo',
    'hero.description.body': '. KI-gestütztes Priorisieren, automatische Kategorisierung und ',
    'hero.description.efficiency': '70% effizienteres',
    'hero.description.outro': ' E-Mail-Management.',
    'hero.cta.primary': '🚀 Kostenlos testen',
    'hero.cta.secondary': '📞 Demo anfordern',
    'hero.stat.users': 'Zufriedene Nutzer',
    'hero.stat.successRate': 'Erfolgsquote',
    'hero.stat.rating': 'Nutzerbewertung',
    'hero.stat.support': 'Support',
    'language.select': 'Sprache',
  },
  fr: {
    signIn: 'Se connecter',
    toAccessYour: 'Pour accéder à votre Nexa',
    singleSignOn: 'Authentification unique',
    connectGoogle: 'Lier Gmail (connexion requise)',
    connectGoogleAuthed: 'Lier Gmail (Google)',
    signInWithGoogle: 'Se connecter avec Google',
    or: 'OU',
    email: 'E-mail',
    password: 'Mot de passe',
    rememberMe: 'Se souvenir de moi',
    forgotPassword: 'Mot de passe oublié ?',
    dontHaveAccount: "Pas de compte ?",
    createAccount: 'Créer un compte',
    signingIn: 'Connexion…',
    show: 'Afficher',
    hide: 'Masquer',
    loginFailed: 'Échec de la connexion',
    registerFailed: "Échec de l'inscription",
    registerSuccess: "Inscription réussie. Veuillez vérifier votre e-mail (si nécessaire), puis connectez-vous.",
    gmailLoginRequired: "Veuillez d'abord vous connecter pour lier Gmail. Ce n'est pas une SSO.",
    googleStartFailed: "Impossible de démarrer la connexion Google",
    captchaInfo: "Cette étape nous aide à empêcher les robots.",
    'cat.important': 'Important',
    'cat.invoice': 'Facture',
    'cat.meeting': 'Réunion',
    'cat.spam': 'Spam',
    'cat.newsletter': 'Newsletter',
    'cat.social': 'Social',
    'cat.promotion': 'Promotion',
    'cat.other': 'Autre',
    delete: 'Supprimer',
    confirmDelete: 'Voulez-vous vraiment supprimer cet élément ?',
    'nav.features': 'Fonctionnalités',
    'nav.dashboard': 'Tableau de bord',
    'nav.pricing': 'Tarifs',
    'nav.cta': 'Commencer gratuitement',
    'hero.badge': 'Gestion d’e-mails nouvelle génération',
    'hero.headingLine1': 'Mettez fin au chaos des e-mails',
    'hero.headingLine2': 'avec Nexivo',
    'hero.description.intro': 'Gérez votre boîte mail intelligemment avec ',
    'hero.description.brand': 'Nexivo',
    'hero.description.body': '. Triage propulsé par l’IA, catégorisation automatique et ',
    'hero.description.efficiency': 'une gestion des e-mails 70 % plus efficace',
    'hero.description.outro': '.',
    'hero.cta.primary': '🚀 Essai gratuit',
    'hero.cta.secondary': '📞 Demander une démo',
    'hero.stat.users': 'Utilisateurs satisfaits',
    'hero.stat.successRate': 'Taux de réussite',
    'hero.stat.rating': 'Note des utilisateurs',
    'hero.stat.support': 'Assistance',
    'language.select': 'Langue',
  },
  ar: {
    signIn: 'تسجيل الدخول',
    toAccessYour: 'للوصول إلى Nexa الخاص بك',
    singleSignOn: 'تسجيل الدخول الموحد',
    connectGoogle: 'ربط Gmail (يتطلب تسجيل الدخول)',
    connectGoogleAuthed: 'ربط Gmail (Google)',
    signInWithGoogle: 'تسجيل الدخول باستخدام Google',
    or: 'أو',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    rememberMe: 'تذكرني',
    forgotPassword: 'هل نسيت كلمة المرور؟',
    dontHaveAccount: 'لا تملك حسابًا؟',
    createAccount: 'إنشاء حساب',
    signingIn: 'جارٍ تسجيل الدخول…',
    show: 'إظهار',
    hide: 'إخفاء',
    loginFailed: 'فشل تسجيل الدخول',
    registerFailed: 'فشل التسجيل',
    registerSuccess: 'تم التسجيل بنجاح. يرجى التحقق من بريدك الإلكتروني (إن لزم)، ثم سجّل الدخول.',
    gmailLoginRequired: 'يرجى تسجيل الدخول أولاً لربط Gmail. هذه العملية ليست تسجيل دخول موحد.',
    googleStartFailed: 'تعذر بدء تسجيل الدخول عبر Google',
    captchaInfo: 'تساعدنا هذه الخطوة على منع الروبوتات.',
    'cat.important': 'مهم',
    'cat.invoice': 'فاتورة',
    'cat.meeting': 'اجتماع',
    'cat.spam': 'رسائل مزعجة',
    'cat.newsletter': 'نشرة بريدية',
    'cat.social': 'اجتماعي',
    'cat.promotion': 'ترويج',
    'cat.other': 'أخرى',
    delete: 'حذف',
    confirmDelete: 'هل أنت متأكد أنك تريد حذف هذا العنصر؟',
    'nav.features': 'المزايا',
    'nav.dashboard': 'لوحة التحكم',
    'nav.pricing': 'الأسعار',
    'nav.cta': 'ابدأ مجانًا',
    'hero.badge': 'إدارة بريد إلكتروني متقدمة',
    'hero.headingLine1': 'ضع حدًا لفوضى البريد',
    'hero.headingLine2': 'مع Nexivo',
    'hero.description.intro': 'تحكّم في صندوق بريدك مع ',
    'hero.description.brand': 'Nexivo',
    'hero.description.body': '. فرز ذكي مدعوم بالذكاء الاصطناعي، وتصنيف تلقائي، و',
    'hero.description.efficiency': 'إدارة بريد أكثر كفاءة بنسبة 70%',
    'hero.description.outro': '.',
    'hero.cta.primary': '🚀 جرّب مجانًا',
    'hero.cta.secondary': '📞 اطلب عرضًا توضيحيًا',
    'hero.stat.users': 'مستخدمون سعداء',
    'hero.stat.successRate': 'معدل النجاح',
    'hero.stat.rating': 'تقييم المستخدمين',
    'hero.stat.support': 'دعم متواصل',
    'language.select': 'اللغة',
  },
}

type I18nValue = {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nValue | undefined>(undefined)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('lang') as Lang | null
      if (stored && stored in dictionaries) return stored
    }
    return 'en'
  })

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    }
  }, [lang])

  const setLang = (l: Lang) => {
    setLangState(l)
    if (typeof window !== 'undefined') {
      localStorage.setItem('lang', l)
    }
  }

  const t = useMemo(() => {
    const dict = dictionaries[lang]
    return (key: string) => dict[key] || key
  }, [lang])
  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
