import { Category, Section, SectionContentItem } from '../types';

export const initialCategories: Category[] = [
  {
    id: 'cat-general', name: 'General', description: 'Initial project setup and client communication tasks.', subcategories: [],
    tasks: [
      { id: 'task-g1', name: 'Initial Concept Research' },
      { id: 'task-g2', name: 'Client Briefing and Site Measure' },
      { id: 'task-g3', name: 'Further Concept Research' },
      { id: 'task-g4', name: 'Create Concept Presentation' },
      { id: 'task-g5', name: 'Create Budget Forecast' },
      { id: 'task-g6', name: 'Document Schematic Floor Plan' },
    ],
  },
  {
    id: 'cat-floorplans', name: 'Floor Plans', description: 'Detailed planning for layouts and electrical systems.', subcategories: [],
    tasks: [
      { id: 'task-fp1', name: 'Finalise Cabinetry Floor Plan' },
      { id: 'task-fp2', name: 'Create Schematic Lighting and Electrical Plan' },
    ],
  },
  {
    id: 'cat-designstudy', name: 'Design Study Built-In Fittings', description: 'Designing custom-built furniture and fittings.', subcategories: [],
    tasks: [
      { id: 'task-ds1', name: 'Wall-to-Wall Desk' },
      { id: 'task-ds2', name: 'Desk Return including Storage' },
      { id: 'task-ds3', name: 'Overhead Storage' },
      { id: 'task-ds4', name: 'Wall-to-Wall Library Shelving' },
      { id: 'task-ds5', name: 'Privacy Screen' },
    ],
  },
  {
    id: 'cat-materials', name: 'Specify Materials and Finishes', description: 'Selection of materials for all surfaces and structures.', subcategories: [],
    tasks: [
      { id: 'task-m1', name: 'Cabinetry Materials' },
      { id: 'task-m2', name: 'Desk Wall Finish' },
      { id: 'task-m3', name: 'Privacy Screen' },
    ],
  },
  {
    id: 'cat-fittings', name: 'Specify Fittings and Fixtures', description: 'Selection of hardware and lighting.', subcategories: [],
    tasks: [
      { id: 'task-f1', name: 'Skylight and Skylight Blind/s (SPECIFIED BY CLIENT)' },
      { id: 'task-f2', name: 'Cabinetry Internal Fittings and Door Hardware' },
      { id: 'task-f3', name: 'Electrical Fittings' },
      { id: 'task-f4', name: 'Light Fittings' },
    ],
  },
  {
    id: 'cat-furniture', name: 'Specify Furniture', description: 'Sourcing and specifying office furniture.', subcategories: [],
    tasks: [{ id: 'task-fu1', name: '2 x Office Chairs' }],
  },
  {
    id: 'cat-presentation', name: 'Presentation', description: 'Preparing and conducting the client presentation.', subcategories: [],
    tasks: [
      { id: 'task-p1', name: 'Create Presentation' },
      { id: 'task-p2', name: 'Present to Client' },
      { id: 'task-p3', name: 'Admin' },
    ],
  },
  {
    id: 'cat-documentation', name: 'Documentation', description: 'Creating detailed plans and technical drawings.', subcategories: [],
    tasks: [
        { id: 'task-d1', name: 'Floor Plan 1:20' },
        { id: 'task-d2', name: 'North Elevation 1:20' },
        { id: 'task-d3', name: 'West Elevation 1:20' },
        { id: 'task-d4', name: 'East Elevation 1:20' },
        { id: 'task-d5', name: 'North-South Section' },
        { id: 'task-d6', name: 'Detail Drawings' },
        { id: 'task-d7', name: 'Trade Scope of Works' },
    ],
  },
  {
    id: 'cat-estimation', name: 'Estimation', description: 'Managing project costs and quotes.', subcategories: [],
    tasks: [
        { id: 'task-e1', name: 'Source Quotes' },
        { id: 'task-e2', name: 'Review and Compile Quotes' },
        { id: 'task-e3', name: 'Create Project Estimate' },
    ],
  },
];


// Helper to generate IDs and default values
export const newId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
export const deepCopy = <T,>(obj: T): T => JSON.parse(JSON.stringify(obj));

const createSectionContent = (categoryIds: string[]): SectionContentItem[] => {
    return initialCategories
        .filter(cat => categoryIds.includes(cat.id))
        .map(cat => ({
            categoryId: cat.id,
            name: cat.name,
            tasks: cat.tasks.map(task => ({ ...deepCopy(task), id: newId('sec-task'), estimateHours: 1, estimateCost: 11 })),
            subcategories: cat.subcategories.map(sub => ({
                ...deepCopy(sub),
                id: newId('sec-sub'),
                tasks: sub.tasks.map(task => ({ ...deepCopy(task), id: newId('sec-task'), estimateHours: 1, estimateCost: 11 }))
            }))
        }));
};

export const initialSections: Section[] = [
    {
        id: 'sec-concept-1',
        name: 'Concept',
        description: 'Initial planning, research, and client alignment phase.',
        content: createSectionContent(['cat-general', 'cat-floorplans', 'cat-presentation', 'cat-estimation'])
    },
    {
        id: 'sec-design-2',
        name: 'Design',
        description: 'Detailed design phase for fittings, materials, and furniture.',
        content: createSectionContent(['cat-designstudy', 'cat-materials', 'cat-fittings', 'cat-furniture'])
    },
    {
        id: 'sec-development-3',
        name: 'Development',
        description: 'Creation of technical documentation and construction plans.',
        content: createSectionContent(['cat-documentation'])
    }
];