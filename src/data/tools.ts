import { Tool } from '@/core/domain/Tool';

export const TOOLS: Tool[] = [
    {
        id: 'ecoindex',
        name: 'EcoIndex',
        description: 'Outil d\'analyse de l\'empreinte environnementale d\'une page web basé sur la complexité technique et le poids de la page.',
        link: 'https://www.ecoindex.fr/',
        icon: 'Leaf'
    },
    {
        id: 'greenit-analysis',
        name: 'GreenIT-Analysis',
        description: 'Extension navigateur pour analyser l\'empreinte environnementale des pages web et proposer des recommandations.',
        link: 'https://github.com/cnumr/GreenIT-Analysis',
        icon: 'TreePine'
    },
    {
        id: 'website-carbon',
        name: 'Website Carbon Calculator',
        description: 'Calculateur d\'empreinte carbone pour les sites web, estimant les émissions de CO2 par visite de page.',
        link: 'https://www.websitecarbon.com/',
        icon: 'Cloud'
    },
    {
        id: 'lighthouse',
        name: 'Google Lighthouse',
        description: 'Outil d\'audit open-source pour améliorer la qualité des pages web, incluant des métriques de performance.',
        link: 'https://developer.chrome.com/docs/lighthouse/',
        icon: 'Lightbulb'
    },
    {
        id: 'ecograder',
        name: 'EcoGrader',
        description: 'Outil d\'évaluation de la durabilité environnementale des sites web avec scoring et recommandations.',
        link: 'https://ecograder.com/',
        icon: 'Award'
    },
    {
        id: 'greenframe',
        name: 'Greenframe',
        description: 'Outil de mesure de l\'empreinte carbone des applications web en conditions réelles d\'utilisation.',
        link: 'https://greenframe.io/',
        icon: 'Gauge'
    },
    {
        id: 'bundlephobia',
        name: 'BundlePhobia',
        description: 'Analyseur de taille des packages npm pour optimiser le poids de vos dépendances JavaScript.',
        link: 'https://bundlephobia.com/',
        icon: 'Package'
    },
    {
        id: 'webpagetest',
        name: 'WebPageTest',
        description: 'Outil de test de performance web avec mesures détaillées et comparaisons multi-localisations.',
        link: 'https://www.webpagetest.org/',
        icon: 'Activity'
    },
    {
        id: 'comparia',
        name: 'Compar:ia',
        description: 'Outil comparatif de modèles LLM pour évaluer leur performance et impact environnemental.',
        link: 'https://comparia.beta.gouv.fr/',
        icon: 'Brain'
    },
    {
        id: 'ecologits',
        name: 'EcoLogits',
        description: 'Bibliothèque Python pour estimer l\'empreinte environnementale de l\'utilisation de modèles de langage (LLM).',
        link: 'https://ecologits.ai/latest/',
        icon: 'Zap'
    },
    {
        id: 'scaphandre',
        name: 'Scaphandre',
        description: 'Agent de métrologie de consommation énergétique pour surveiller la consommation des serveurs et applications.',
        link: 'https://github.com/hubblo-org/scaphandre',
        icon: 'Cpu'
    },
    {
        id: 'nosgestesclimat',
        name: 'Nos Gestes Climat',
        description: 'Calculateur d\'empreinte carbone personnelle pour évaluer et réduire son impact environnemental.',
        link: 'https://nosgestesclimat.fr/empreinte-carbone?mtm_campaign=Site&mtm_kwd=InfoGouv',
        icon: 'Calculator'
    }
];
