
import { Project, Section } from '../types';
import { initialSections } from './initialData';
import { newId, deepCopy } from './initialData';

const copySectionForProject = (sectionTemplate: Section): Section => {
    const newSection = deepCopy(sectionTemplate);
    newSection.id = newId('proj-sec');
    newSection.content.forEach(contentItem => {
        contentItem.tasks.forEach(task => { 
            task.id = newId('sec-task');
            task.actualHours = Math.random() > 0.5 ? task.estimateHours + Math.floor(Math.random() * 3) - 1 : undefined;
        });
        contentItem.subcategories.forEach(sub => {
            sub.id = newId('sec-sub');
            sub.tasks.forEach(task => { 
                task.id = newId('sec-task');
                task.actualHours = Math.random() > 0.5 ? task.estimateHours + Math.floor(Math.random() * 3) - 1 : undefined;
            });
        });
    });
    return newSection;
};

const conceptSectionTemplate = initialSections.find(s => s.id === 'sec-concept-1')!;
const designSectionTemplate = initialSections.find(s => s.id === 'sec-design-2')!;
const devSectionTemplate = initialSections.find(s => s.id === 'sec-development-3')!;

export const initialProjects: Project[] = [
  // Residential Renovation
  {
    id: newId('proj'),
    name: 'Modern Downtown Apartment',
    clientAddress: '123 Main St, Anytown, USA',
    projectType: 'Residential Renovation',
    projectDescription: 'Full renovation of a 2-bedroom downtown apartment with a focus on modern aesthetics and smart home integration.',
    spaces: [],
    stages: [
      {
        id: newId('stage'),
        name: 'Phase 1: Design & Planning',
        sections: [ copySectionForProject(conceptSectionTemplate), copySectionForProject(designSectionTemplate) ],
      },
      {
        id: newId('stage'),
        name: 'Phase 2: Execution',
        sections: [ copySectionForProject(devSectionTemplate) ],
      }
    ]
  },
  {
    id: newId('proj'),
    name: 'Suburban Family Home Expansion',
    clientAddress: '101 Maple Drive, Suburbia',
    projectType: 'Residential Renovation',
    projectDescription: 'A two-story expansion for a growing family, including a new master suite and an open-concept kitchen and living area.',
    spaces: [],
    stages: [
      {
        id: newId('stage'),
        name: 'Stage 1: Architectural Design',
        sections: [ copySectionForProject(conceptSectionTemplate) ],
      },
      {
        id: newId('stage'),
        name: 'Stage 2: Interior Finishes',
        sections: [ copySectionForProject(designSectionTemplate) ],
      },
      {
        id: newId('stage'),
        name: 'Stage 3: Construction Documentation',
        sections: [ copySectionForProject(devSectionTemplate) ],
      }
    ]
  },

  // Commercial Fit-out
  {
    id: newId('proj'),
    name: 'Sunrise Cafe & Bakery',
    clientAddress: '456 Oak Ave, Metropolis',
    projectType: 'Commercial Fit-out',
    projectDescription: 'Complete interior design and fit-out for a new cafe and bakery. The theme is bright, airy, and welcoming, with a mix of industrial and natural elements.',
    spaces: [],
    stages: [
      {
        id: newId('stage'),
        name: 'Full Project Lifecycle',
        sections: [ copySectionForProject(conceptSectionTemplate), copySectionForProject(designSectionTemplate), copySectionForProject(devSectionTemplate) ],
      },
    ]
  },
  {
    id: newId('proj'),
    name: 'Tech Startup Office Space',
    clientAddress: '789 Innovation Way, Silicon Valley',
    projectType: 'Commercial Fit-out',
    projectDescription: 'Design of a dynamic and collaborative office space for a fast-growing tech startup, featuring breakout zones, a modern kitchen, and flexible workstations.',
    spaces: [],
    stages: [
      {
        id: newId('stage'),
        name: 'Phase 1: Concept & Space Planning',
        sections: [ copySectionForProject(conceptSectionTemplate) ],
      },
      {
        id: newId('stage'),
        name: 'Phase 2: Design & Sourcing',
        sections: [ copySectionForProject(designSectionTemplate) ],
      }
    ]
  },

  // New Build Styling
  {
    id: newId('proj'),
    name: 'Coastal Holiday Home',
    clientAddress: '789 Beach Rd, Summerland',
    projectType: 'New Build Styling',
    projectDescription: 'Interior styling for a newly built holiday home. The focus is on creating a relaxed, coastal vibe with durable, family-friendly furnishings.',
    spaces: [],
    stages: [
      {
        id: newId('stage'),
        name: 'Stage 1: Concept and Sourcing',
        sections: [ copySectionForProject(conceptSectionTemplate) ],
      },
      {
        id: newId('stage'),
        name: 'Stage 2: Implementation',
        sections: [ copySectionForProject(designSectionTemplate) ],
      }
    ]
  },
  {
    id: newId('proj'),
    name: 'Minimalist Urban Loft',
    clientAddress: '321 Cityview Plaza, Apt 12',
    projectType: 'New Build Styling',
    projectDescription: 'Styling a new loft apartment with a minimalist aesthetic, focusing on clean lines, a neutral color palette, and high-quality, multi-functional furniture.',
    spaces: [],
    stages: [
       {
        id: newId('stage'),
        name: 'Full Styling Project',
        sections: [ copySectionForProject(conceptSectionTemplate), copySectionForProject(designSectionTemplate) ],
      }
    ]
  }
];