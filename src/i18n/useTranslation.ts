// i18n 훅

import { useSettingsStore } from '../stores/settingsStore'
import { translations, type Language, type Translations } from './translations'

export function useTranslation(): Translations & { language: Language } {
  const { settings } = useSettingsStore()
  const language = settings.language || 'ko'

  return {
    ...translations[language],
    language,
  }
}

// 언어별 번역 가져오기 (컴포넌트 외부에서 사용)
export function getTranslation(language: Language): Translations {
  return translations[language]
}
