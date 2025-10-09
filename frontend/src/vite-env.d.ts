// Minimal Vite env typings to avoid pulling full vite/client types (which include Node types)
interface ImportMetaEnv {
	readonly VITE_APP_TITLE?: string
	readonly VITE_API_URL?: string
	// add more env vars as needed
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}
