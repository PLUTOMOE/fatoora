import { useStore } from '@/store/useStore';
import { ar } from '@/i18n/ar';

type Dictionary = typeof ar;

export function useTranslation() {
  const getTranslation = (path: string) => {
    const keys = path.split('.');
    let current: any = ar;
    
    for (const key of keys) {
      if (current[key] === undefined) {
        console.warn(`Translation key missing: ${path}`);
        return path;
      }
      current = current[key];
    }
    
    return current;
  };

  return {
    t: getTranslation,
    lang: 'ar'
  };
}
