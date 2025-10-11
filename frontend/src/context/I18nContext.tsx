import { createContext, useContext, useEffect, useMemo, useState } from 'react'

type Lang = 'en' | 'tr' | 'de' | 'fr'

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
    confirmDelete: 'Möchtest du dieses Element wirklich löschen?'
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
    confirmDelete: 'Voulez-vous vraiment supprimer cet élément ?'
  }
}

type I18nValue = {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nValue | undefined>(undefined)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => (localStorage.getItem('lang') as Lang) || 'en')
  const setLang = (l: Lang) => {
    setLangState(l)
    localStorage.setItem('lang', l)
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
