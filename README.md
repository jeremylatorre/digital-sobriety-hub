# Hub de Sobriété Numérique

Une plateforme centrale pour découvrir, évaluer et mettre en œuvre les meilleures pratiques de conception d'applications web sobres, accessibles et durables.

## Objectif

Ce hub rassemble des ressources, guides et outils pour aider les développeurs et équipes à adopter les principes de l'écoconception numérique. Basé sur le référentiel général d'écoconception des services numériques (RGESN 2024), il offre une approche pratique pour créer des applications web plus légères et responsables.

## Fonctionnalités

- **Catalogue de ressources** : Découvrez des outils, guides et bonnes pratiques classés par catégories
- **Évaluation RGESN** : Évaluez vos projets selon les 91 critères du référentiel 2024
- **Filtres intelligents** : Trouvez rapidement les ressources pertinentes par tags et catégories
- **Conseils pratiques** : Apprenez des astuces pour améliorer votre impact environnemental

## Technologies

- **Frontend** : React 18 + TypeScript
- **Styling** : Tailwind CSS + shadcn/ui
- **Routing** : React Router DOM
- **Build** : Vite
- **Data** : XLSX pour l'import des référentiels

## Installation

```bash
# Cloner le projet
git clone <repository-url>
cd digital-sobriety-hub

# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev
```

## Import des Référentiels

Le projet inclut des scripts pour importer les référentiels officiels :

### Import RGESN depuis Excel
```bash
# Installer la dépendance
npm install xlsx

# Exécuter l'import
node scripts/import-rgesn-excel.js rgesn_2024_outil_declaration_ecoconception.xlsx public/referentials/rgesn.json
```

Pour plus de détails, consultez [scripts/README.md](scripts/README.md).

## Structure du Projet

```
src/
├── components/        # Composants UI réutilisables
├── core/             # Logique métier et domain models
├── hooks/            # Hooks React personnalisés
├── pages/            # Pages de l'application
└── types/            # Définitions TypeScript

public/
└── referentials/     # Données des référentiels (RGESN, etc.)

scripts/              # Scripts d'import et traitement
```

## Catégories de Ressources

- **Strategy** : Stratégie et gouvernance de l'écoconception
- **Design** : UX/UI éco-responsable
- **Frontend** : Optimisation des performances web
- **Backend** : Architecture et infrastructure durable
- **Data** : Gestion efficace des données
- **Accessibility** : Conception inclusive et accessible

## Contribuer

Les contributions sont bienvenues ! Vous pouvez :

- Ajouter de nouvelles ressources et outils
- Améliorer les descriptions existantes
- Signaler des erreurs ou suggestions
- Contribuer aux traductions

## Références

- [Référentiel Général d'Écoconception des Services Numériques 2024](https://ecoresponsable.numerique.gouv.fr/)
- [RGESN PDF officiel](https://ecoresponsable.numerique.gouv.fr/docs/2024/rgesn-mai2024/referentiel_general_ecoconception_des_services_numeriques_version_2024.pdf)

## Licence

Ce projet est sous licence MIT.
