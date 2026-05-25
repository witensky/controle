# Myflow

## Build Android APK

Avant de générer l'APK, il faut toujours reconstruire le web puis synchroniser Capacitor:

```bash
npm run android:sync
```

Pour générer un APK debug installable:

```bash
npm run android:apk
```

Si Gradle affiche `SDK location not found`, vérifie que ce fichier existe:

```text
android/local.properties
```

Avec ce contenu sur cette machine:

```text
sdk.dir=C:/Users/user/AppData/Local/Android/Sdk
```

L'APK sera généré dans:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```
