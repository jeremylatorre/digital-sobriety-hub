/**
 * Script d'import des critères RGESN depuis le fichier Excel officiel
 * 
 * Installation des dépendances :
 * npm install xlsx
 * 
 * Utilisation :
 * node scripts/import-rgesn-excel.js <chemin-vers-excel> [chemin-sortie-json]
 * 
 * Exemple :
 * node scripts/import-rgesn-excel.js rgesn_2024_outil_declaration_ecoconception.xlsx public/referentials/rgesn.json
 */

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Mapping des thèmes
const themeMapping = {
  'Stratégie': 'strategy',
  'Spécifications': 'specifications',
  'Architecture': 'architecture',
  'UX/UI': 'ux-ui',
  'Contenus': 'ux-ui',
  'Frontend': 'frontend',
  'Backend': 'backend',
  'Hébergement': 'hosting'
};

// Mapping des niveaux
const levelMapping = {
  'Essentiel': 'essential',
  'Recommandé': 'recommended',
  'Avancé': 'advanced'
};

function parseRGESNExcel(excelPath, outputPath) {
  console.log('📖 Lecture du fichier Excel...');
  const workbook = XLSX.readFile(excelPath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  // Convertir en JSON
  const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
  console.log('🔍 Recherche de l\'en-tête...');
  let headerRowIndex = -1;
  for (let i = 0; i < Math.min(rawData.length, 20); i++) {
    const row = rawData[i];
    if (row && row.some(cell => 
      typeof cell === 'string' && 
      (cell.includes('N°') || cell.includes('Critère') || cell.toLowerCase().includes('numéro'))
    )) {
      headerRowIndex = i;
      console.log(`✓ En-tête trouvée à la ligne ${i + 1}`);
      break;
    }
  }
  
  if (headerRowIndex === -1) {
    console.error('❌ Impossible de trouver l\'en-tête du tableau');
    process.exit(1);
  }
  
  const headers = rawData[headerRowIndex];
  console.log('📋 Colonnes détectées:', headers);
  
  // Détecter les indices des colonnes importantes
  const numIndex = headers.findIndex(h => h && (h.includes('N°') || h.toLowerCase().includes('numéro')));
  const titleIndex = headers.findIndex(h => h && (h.includes('Critère') || h.toLowerCase().includes('titre')));
  const themeIndex = headers.findIndex(h => h && h.toLowerCase().includes('thématique'));
  const levelIndex = headers.findIndex(h => h && (h.toLowerCase().includes('priorité') || h.toLowerCase().includes('niveau')));
  
  console.log(`Indices des colonnes: Numéro=${numIndex}, Titre=${titleIndex}, Thème=${themeIndex}, Niveau=${levelIndex}`);
  
  // Extraction des critères
  const criteria = [];
  console.log('🔄 Extraction des critères...');
  
  for (let i = headerRowIndex + 1; i < rawData.length; i++) {
    const row = rawData[i];
    if (!row || !row[numIndex]) continue;
    
    const number = String(row[numIndex]).trim();
    if (!number || !number.match(/^\d+\.\d+$/)) continue;
    
    const title = row[titleIndex] ? String(row[titleIndex]).trim() : '';
    const themeRaw = row[themeIndex] ? String(row[themeIndex]).trim() : '';
    const levelRaw = row[levelIndex] ? String(row[levelIndex]).trim() : '';
    
    if (!title) continue;
    
    const theme = themeMapping[themeRaw] || 'strategy';
    const level = levelMapping[levelRaw] || 'recommended';
    
    const criterion = {
      id: `rgesn-${number}`,
      number: number,
      title: title,
      description: `Critère ${number} du RGESN`,
      level: level,
      theme: theme,
      objective: 'Objectif à définir',
      implementation: 'Mise en œuvre à définir',
      verification: 'Moyen de contrôle à définir',
      resources: []
    };
    
    criteria.push(criterion);
    console.log(`  ✓ ${criterion.id}: ${criterion.title.substring(0, 60)}...`);
  }
  
  console.log(`\n📊 ${criteria.length} critères extraits`);
  
  // Créer le référentiel complet
  const referential = {
    id: 'rgesn',
    name: 'RGESN - Référentiel Général d\'Écoconception de Services Numériques',
    version: '2.0',
    description: 'Le RGESN définit les critères d\'écoconception applicables aux services numériques. Il s\'inscrit dans le cadre de la loi REEN (Réduction de l\'Empreinte Environnementale du Numérique).',
    lastUpdate: '2024-05-28',
    source: 'https://ecoresponsable.numerique.gouv.fr/publications/referentiel-general-ecoconception/',
    themes: [
      {
        id: 'strategy',
        name: 'Stratégie',
        description: 'Définir et piloter une démarche d\'écoconception'
      },
      {
        id: 'specifications',
        name: 'Spécifications',
        description: 'Définir les besoins et exigences fonctionnelles'
      },
      {
        id: 'architecture',
        name: 'Architecture',
        description: 'Concevoir une architecture technique sobre'
      },
      {
        id: 'ux-ui',
        name: 'UX/UI',
        description: 'Concevoir une expérience utilisateur sobre'
      },
      {
        id: 'frontend',
        name: 'Frontend',
        description: 'Développer le frontend de manière sobre'
      },
      {
        id: 'backend',
        name: 'Backend',
        description: 'Développer le backend de manière sobre'
      },
      {
        id: 'hosting',
        name: 'Hébergement',
        description: 'Choisir un hébergement sobre et responsable'
      }
    ],
    criteria: criteria
  };
  
  // Sauvegarder le JSON
  const output = outputPath || 'rgesn-imported.json';
  fs.writeFileSync(output, JSON.stringify(referential, null, 2), 'utf-8');
  console.log(`\n✅ Référentiel sauvegardé dans: ${output}`);
  console.log('\n⚠️  Note: Les champs "objective", "implementation" et "verification" doivent être remplis manuellement');
  console.log('    en consultant le PDF officiel du RGESN.');
}

// Exécution
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.error('Usage: node import-rgesn-excel.js <chemin-excel> [chemin-sortie]');
    process.exit(1);
  }
  
  const excelPath = args[0];
  const outputPath = args[1] || 'rgesn-imported.json';
  
  if (!fs.existsSync(excelPath)) {
    console.error(`❌ Fichier non trouvé: ${excelPath}`);
    process.exit(1);
  }
  
  parseRGESNExcel(excelPath, outputPath);
}

module.exports = { parseRGESNExcel };
