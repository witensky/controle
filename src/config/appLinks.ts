const DEFAULT_APK_URL = 'https://github.com/witensky/controle/releases/latest/download/myflow-release.apk';

const resolveApkUrl = () => {
  const envUrl = import.meta.env.VITE_APK_URL?.trim();
  return envUrl && envUrl.length > 0 ? envUrl : DEFAULT_APK_URL;
};

export const APP_LINKS = {
  apk: resolveApkUrl(),
} as const;

export const APP_LINK_LABELS = {
  apk: 'Télécharger l’APK',
} as const;
