# Scripts d'Import des Référentiels

## Import du RGESN depuis Excel

### Installation

```bash
npm install xlsx
```

### Utilisation

1. **Placer le fichier Excel dans le dossier du projet**

2. **Exécuter le script d'import**
```bash
node scripts/import-rgesn-excel.js rgesn_2024_outil_declaration_ecoconception.xlsx public/referentials/rgesn.json
```

3. **Le script va :**
   - Extraire automatiquement les 91 critères du fichier Excel
   - Générer le fichier JSON avec la structure correcte
   - Mapper les thèmes et niveaux de priorité

### Post-traitement

Le script extrait automatiquement :
- ✅ Le numéro du critère (ex: 1.1, 1.2, etc.)
- ✅ Le titre du critère
- ✅ Le thème associé
- ✅ Le niveau de priorité

Les champs suivants doivent être enrichis manuellement (en consultant le PDF officiel) :
- ⚠️ `objective` : Objectif du critère
- ⚠️ `implementation` : Mise en œuvre recommandée
- ⚠️ `verification` : Moyen de test ou de contrôle
- ⚠️ `resources` : Liens vers ressources complémentaires

### Structure générée

```json
{
  "id": "rgesn-1.1",
  "number": "1.1",
  "title": "Le service numérique a-t-il...",
  "description": "Critère 1.1 du RGESN",
  "level": "essential",
  "theme": "strategy",
  "objective": "Objectif à définir",
  "implementation": "Mise en œuvre à définir",
  "verification": "Moyen de contrôle à définir",
  "resources": []
}
```

## Enrichissement des critères

Pour enrichir les critères avec les informations détaillées, consultez le PDF officiel :
https://ecoresponsable.numerique.gouv.fr/docs/2024/rgesn-mai2024/referentiel_general_ecoconception_des_services_numeriques_version_2024.pdf

Chaque critère dans le PDF contient :
- **Objectif** : Pourquoi ce critère est important
- **Mise en œuvre** : Comment l'implémenter
- **Moyen de test ou de contrôle** : Comment vérifier la conformité
- **Ressources** : Liens utiles (optionnel)

## Validation

Après génération, validez que :
- ✅ 91 critères sont présents
- ✅ Les thèmes sont correctement mappés
- ✅ Les niveaux de priorité sont cohérents
- ✅ La syntaxe JSON est valide

```bash
# Compter les critères
cat public/referentials/rgesn.json | grep '"id": "rgesn-' | wc -l
# Devrait afficher: 91
```
