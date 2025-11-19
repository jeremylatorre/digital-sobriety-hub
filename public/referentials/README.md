# Guide de Remplissage des Référentiels

## Structure d'un fichier de référentiel

Chaque référentiel est un fichier JSON contenant les critères d'évaluation. Le fichier `rgesn.json` actuel contient **8 exemples de critères** pour vous aider à démarrer.

### Structure JSON

```json
{
  "id": "identifiant-unique",
  "name": "Nom complet du référentiel",
  "version": "2.0",
  "description": "Description du référentiel",
  "lastUpdate": "2024-05-28",
  "source": "URL source officielle",
  "themes": [...],
  "criteria": [...]
}
```

### Thèmes disponibles

Les 7 thèmes du RGESN :
- `strategy` : Stratégie
- `specifications` : Spécifications
- `architecture` : Architecture
- `ux-ui` : UX/UI
- `frontend` : Frontend
- `backend` : Backend
- `hosting` : Hébergement

### Structure d'un critère

```json
{
  "id": "rgesn-1.1",
  "number": "1.1",
  "title": "Titre du critère sous forme de question",
  "description": "Description courte du critère",
  "level": "essential",
  "theme": "strategy",
  "objective": "Objectif du critère",
  "implementation": "Comment mettre en œuvre le critère",
  "verification": "Comment vérifier la conformité",
  "resources": ["https://lien1.com", "https://lien2.com"]
}
```

### Niveaux de critères

- `essential` : Critère essentiel (priorité haute)
- `recommended` : Critère recommandé (priorité moyenne)
- `advanced` : Critère avancé (priorité basse)

## Comment remplir le RGESN complet

Le RGESN version 2.0 (Mai 2024) contient **91 critères au total** répartis en 8 thématiques.

### Ressources officielles

1. **PDF complet** : https://ecoresponsable.numerique.gouv.fr/docs/2024/rgesn-mai2024/referentiel_general_ecoconception_des_services_numeriques_version_2024.pdf

2. **Outil d'évaluation Excel** : https://ecoresponsable.numerique.gouv.fr/docs/2024/rgesn-mai2024/rgesn_2024_outil_declaration_ecoconception.xlsx
   - Ce fichier Excel contient tous les critères numérotés
   - Chaque ligne correspond à un critère à ajouter

3. **Outil d'évaluation ODS** : https://ecoresponsable.numerique.gouv.fr/docs/2024/rgesn-mai2024/rgesn_2024_outil_declaration_ecoconception.ods

### Méthodologie recommandée

1. **Téléchargez le fichier Excel** depuis le lien ci-dessus
2. **Extrayez les critères** : chaque ligne du fichier Excel correspond à un critère
3. **Copiez la structure** : utilisez les 8 critères d'exemple comme template
4. **Remplissez progressivement** : ajoutez les critères un par un dans le tableau `criteria`

### Exemple de conversion Excel → JSON

Depuis le fichier Excel :
```
N° | Titre | Niveau | Thème | Objectif | Mise en œuvre | Vérification
1.1 | Le service... | Essentiel | Stratégie | ... | ... | ...
```

Vers le JSON :
```json
{
  "id": "rgesn-1.1",
  "number": "1.1",
  "title": "Le service...",
  "description": "Résumé du critère",
  "level": "essential",
  "theme": "strategy",
  "objective": "...",
  "implementation": "...",
  "verification": "...",
  "resources": []
}
```

### Conseils

- **Commencez petit** : remplissez d'abord les critères essentiels de chaque thème
- **Testez régulièrement** : rechargez l'application après avoir ajouté quelques critères
- **Respectez la syntaxe JSON** : utilisez un validateur JSON en ligne si nécessaire
- **Numérotation** : respectez la numérotation officielle (1.1, 1.2, 2.1, etc.)
- **Niveaux** : utilisez uniquement `essential`, `recommended` ou `advanced`
- **Thèmes** : utilisez uniquement les IDs listés ci-dessus

## Ajouter d'autres référentiels

Pour ajouter un nouveau référentiel (ex: WCAG, GR491, etc.) :

1. Créez un nouveau fichier JSON dans ce dossier (ex: `wcag.json`)
2. Suivez la même structure que `rgesn.json`
3. Ajoutez le référentiel dans `src/core/services/ReferentialService.ts` :

```typescript
return [
  { id: 'rgesn', name: 'RGESN...', version: '2.0' },
  { id: 'wcag', name: 'WCAG...', version: '2.1' },
];
```

## Support

Pour toute question ou aide sur le remplissage des critères, consultez :
- Documentation officielle RGESN : https://ecoresponsable.numerique.gouv.fr/
- Issues GitHub du projet (si applicable)
