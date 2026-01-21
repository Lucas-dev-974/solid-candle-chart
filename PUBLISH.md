# Guide de publication sur npm

Ce guide vous explique comment publier `ohlc-chart-solid` sur npm.

## 📋 Prérequis

1. **Compte npm** : Créez un compte sur [npmjs.com](https://www.npmjs.com/signup) si vous n'en avez pas
2. **Connexion npm** : Connectez-vous via la ligne de commande

## 🔧 Configuration

### 1. Vérifier le nom du package

Le nom `ohlc-chart-solid` doit être disponible sur npm. Vérifiez-le avec :
```bash
npm view ohlc-chart-solid
```

Si le package existe déjà, vous devrez :
- Changer le nom dans `package.json` (par exemple : `@votre-nom/ohlc-chart-solid`)
- Ou utiliser un nom différent

### 2. Ajouter les informations manquantes (optionnel)

Vous pouvez ajouter dans `package.json` :
```json
{
  "author": "Votre nom <votre.email@example.com>",
  "repository": {
    "type": "git",
    "url": "https://github.com/votre-username/candle-chart.git"
  },
  "bugs": {
    "url": "https://github.com/votre-username/candle-chart/issues"
  },
  "homepage": "https://github.com/votre-username/candle-chart#readme"
}
```

## 🏗️ Build du package

Avant de publier, vous devez construire le package :

```bash
npm run build
```

Cette commande va :
1. Construire la librairie avec Vite (`build:lib`)
2. Générer les fichiers de déclaration TypeScript (`.d.ts`) (`build:types`)

Le dossier `dist/` contiendra :
- `index.js` (format ES modules)
- `index.cjs` (format CommonJS)
- `index.d.ts` (déclarations TypeScript)

## ✅ Vérifications avant publication

### 1. Tester le build localement

Vous pouvez tester le package localement avant de le publier :

```bash
# Dans le dossier du projet
npm pack

# Cela crée un fichier .tgz que vous pouvez installer dans un autre projet
# Dans un autre projet :
npm install ../candle-chart/ohlc-chart-solid-1.0.0.tgz
```

### 2. Vérifier les fichiers inclus

Les fichiers suivants seront inclus dans le package npm (définis dans `package.json` > `files`) :
- `dist/` - Les fichiers compilés
- `src/lib/` - Les fichiers sources (pour le support TypeScript)

### 3. Vérifier la taille du package

```bash
npm pack --dry-run
```

Cela vous montre quels fichiers seront inclus sans créer le package.

## 🚀 Publication

### Première publication

1. **Connectez-vous à npm** :
```bash
npm login
```

2. **Vérifiez que vous êtes bien connecté** :
```bash
npm whoami
```

3. **Publiez le package** :
```bash
npm publish
```

Pour publier en accès public (recommandé pour les librairies open-source) :
```bash
npm publish --access public
```

### Publications suivantes

Pour publier une nouvelle version :

1. **Mettez à jour le numéro de version** dans `package.json` :
   - Version mineure : `npm version minor` (1.0.0 → 1.1.0)
   - Version majeure : `npm version major` (1.0.0 → 2.0.0)
   - Correctif : `npm version patch` (1.0.0 → 1.0.1)

2. **Rebuild et republiez** :
```bash
npm run build
npm publish
```

## 📦 Gestion des versions

Le projet utilise le [Semantic Versioning](https://semver.org/) :
- **MAJOR** : Changements incompatibles avec les versions précédentes
- **MINOR** : Nouvelles fonctionnalités compatibles avec les versions précédentes
- **PATCH** : Corrections de bugs compatibles

## 🔐 Publication avec scope (optionnel)

Si vous voulez publier sous un scope (par exemple `@votre-nom/ohlc-chart-solid`) :

1. Changez le nom dans `package.json` :
```json
{
  "name": "@votre-nom/ohlc-chart-solid"
}
```

2. Publiez avec l'option `--access public` :
```bash
npm publish --access public
```

## 🐛 Dépannage

### Erreur : "Package name already exists"
- Le nom est déjà pris, changez-le dans `package.json`

### Erreur : "You must verify your email"
- Vérifiez votre email sur npmjs.com

### Erreur : "403 Forbidden"
- Vous n'êtes pas connecté ou vous n'avez pas les permissions

### Les types TypeScript ne sont pas générés
- Vérifiez que `npm run build:types` fonctionne
- Vérifiez que `tsconfig.build.json` existe et est correct

## 📝 Checklist avant publication

- [ ] Le nom du package est disponible sur npm
- [ ] Le build fonctionne (`npm run build`)
- [ ] Les fichiers `.d.ts` sont générés dans `dist/`
- [ ] Le README.md est à jour
- [ ] La version dans `package.json` est correcte
- [ ] Vous êtes connecté à npm (`npm whoami`)
- [ ] Vous avez testé le package localement (`npm pack`)

## 🎉 Après la publication

Une fois publié, votre package sera disponible via :
```bash
npm install ohlc-chart-solid
```

Vous pouvez le voir sur : `https://www.npmjs.com/package/ohlc-chart-solid`

## 📚 Ressources

- [Documentation npm sur la publication](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [Semantic Versioning](https://semver.org/)
- [npm CLI documentation](https://docs.npmjs.com/cli/v8/commands/npm-publish)
