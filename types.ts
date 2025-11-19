
// For Category Templates
export interface CategoryTask {
  id: string;
  name: string;
}
export interface CategorySubcategory {
  id:string;
  name: string;
  tasks: CategoryTask[];
}
export interface Category {
  id: string;
  name: string;
  description: string;
  subcategories: CategorySubcategory[];
  tasks: CategoryTask[];
}

// For Project Sections
export interface SectionTask {
  id: string;
  name: string;
  estimateHours: number; // Suggested Hours
  estimateCost: number; // Cost Per Hour
  actualHours?: number; // User-estimated hours
  isNew?: boolean;
}
export interface SectionSubcategory {
  id: string;
  name: string;
  tasks: SectionTask[];
}
export interface SectionContentItem {
  categoryId: string;
  name: string;
  tasks: SectionTask[];
  subcategories: SectionSubcategory[];
}
export interface Section {
  id: string;
  name: string;
  description: string;
  content: SectionContentItem[];
}

// Form Data Types for Modals
export type CategoryTaskFormData = Omit<CategoryTask, 'id'> & { id?: string };
export type CategorySubcategoryFormData = Omit<CategorySubcategory, 'id' | 'tasks'> & { id?: string, tasks: CategoryTaskFormData[] };
export type CategoryFormData = Omit<Category, 'id' | 'subcategories' | 'tasks'> & { id?: string, tasks: CategoryTaskFormData[], subcategories: CategorySubcategoryFormData[] };

// Customer Data
export interface CustomerData {
    name: string;
    email: string;
    phone?: string;
    businessName?: string;
    location?: string;
    languages?: string;
    experience?: number;
    specializations?: string[];
    bio?: string;
}

// Project Management
export interface ProjectStage {
  id: string;
  name: string;
  sections: Section[]; // These are deep copies with editable tasks
}

export type SpaceSizeType = 'Small' | 'Medium' | 'Large' | 'Custom';

export interface SpaceDetails {
    id: string;
    name: string;
    sizeType: SpaceSizeType;
    customDimensions?: {
        length: number;
        width: number;
        height: number;
    };
}

export interface Project {
  id: string;
  name: string;
  clientAddress: string;
  projectType: string;
  projectDescription: string;
  stages: ProjectStage[];
  
  // New fields from wizard
  budgetMin?: number;
  budgetMax?: number;
  currency?: string;
  timelineMin?: number;
  timelineMax?: number;
  spaces: SpaceDetails[];
  totalArea?: number;
  qualityLevel?: 'Standard' | 'Premium' | 'Luxury';
}

// Admin Management
export interface ProjectType {
  id: string;
  name: string;
}