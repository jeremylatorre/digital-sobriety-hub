const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const htmlPath = path.join(__dirname, '../rgesn.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const dom = new JSDOM(html);
const document = dom.window.document;

const themes = [
    { id: 'strategy', name: 'Stratégie', selector: '#strategie' },
    { id: 'specifications', name: 'Spécifications', selector: '#specifications' },
    { id: 'architecture', name: 'Architecture', selector: '#architecture' },
    { id: 'ux-ui', name: 'UX/UI', selector: '#uxui' },
    { id: 'contents', name: 'Contenus', selector: '#contenus' },
    { id: 'frontend', name: 'Frontend', selector: '#frontend' },
    { id: 'backend', name: 'Backend', selector: '#backend' },
    { id: 'hosting', name: 'Hébergement', selector: '#hebergement' },
    { id: 'algorithm', name: 'Algorithmie', selector: '#algorithmie' },
];

const criteria = [];

themes.forEach(theme => {
    const themeHeader = document.querySelector(theme.selector);
    if (!themeHeader) {
        console.log(`Theme header not found: ${theme.selector}`);
        return;
    }
    console.log(`Processing theme: ${theme.name}`);

    let currentElement = themeHeader.nextElementSibling;
    let themeCriteriaCount = 0;

    while (currentElement && currentElement.tagName !== 'H2') {
        if (currentElement.tagName === 'UL' && currentElement.classList.contains('fr-accordions-group')) {
            const accordions = currentElement.querySelectorAll('.fr-accordion');
            accordions.forEach(accordion => {
                const btn = accordion.querySelector('.fr-accordion__btn');
                const titleText = btn.textContent.trim();
                // Format: "1.1 – Title..."
                // Allow for different dash types and potentially missing spaces
                const match = titleText.match(/^(\d+\.\d+)\s*[–-]\s*(.+)$/);
                if (!match) {
                    console.log(`Skipping invalid title format: "${titleText}"`);
                    return;
                }

                const number = match[1];
                const title = match[2];
                const id = `c${number.replace('.', '-')}`;

                console.log(`Found criterion: ${number}`);
                themeCriteriaCount++;

                const collapse = accordion.querySelector('.fr-collapse');

                // Extract metadata table
                const table = collapse.querySelector('.fr-table');
                let level = 'recommended'; // Default
                if (table) {
                    const rows = table.querySelectorAll('tbody tr td');
                    // Order: Difficulty, Priority, Target, Roles
                    // Priority is index 1
                    if (rows[1]) {
                        const priority = rows[1].textContent.trim().toLowerCase();
                        if (priority.includes('prioritaire')) level = 'essential';
                        else if (priority.includes('modérée')) level = 'recommended';
                        else level = 'advanced'; // Assumption
                    }
                }

                // Helper to extract section content
                const getSectionContent = (keyword) => {
                    const paragraphs = Array.from(collapse.querySelectorAll('p'));
                    const headerP = paragraphs.find(p => p.textContent.includes(keyword));
                    if (headerP && headerP.nextElementSibling && headerP.nextElementSibling.classList.contains('fr-highlight')) {
                        return headerP.nextElementSibling.innerHTML.trim();
                    }
                    return '';
                };

                const objective = getSectionContent('Objectif');
                const implementation = getSectionContent('Mise en œuvre');
                const verification = getSectionContent('Moyen de test ou de contrôle');

                criteria.push({
                    id,
                    number,
                    title,
                    description: title, // Using title as description for now if no separate desc
                    level,
                    theme: theme.id,
                    objective,
                    implementation,
                    verification,
                    resources: []
                });
            });
        }
        currentElement = currentElement.nextElementSibling;
    }
    console.log(`Theme ${theme.name}: ${themeCriteriaCount} criteria`);
});

const output = `import { Referential } from '../core/domain/Referential';

export const RGESN_REFERENTIAL: Referential = {
  id: 'rgesn',
  name: 'Référentiel Général d\\'Écoconception de Services Numériques (RGESN)',
  version: '2024',
  description: 'Version 2024 du RGESN pilotée par la DINUM, le Ministère de la Transition Écologique, l\\'ADEME et l\\'INR.',
  lastUpdate: '2024-05-28',
  source: 'https://ecoresponsable.numerique.gouv.fr/publications/referentiel-general-ecoconception/',
  themes: [
${themes.map(t => `    { id: '${t.id}', name: '${t.name}', description: '${t.name}' }`).join(',\n')}
  ],
  criteria: ${JSON.stringify(criteria, null, 2).replace(/"(\w+)":/g, '$1:')}
};
`;

fs.writeFileSync(path.join(__dirname, '../src/data/rgesn.ts'), output);
console.log(`Extracted ${criteria.length} criteria.`);
