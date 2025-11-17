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
  estimateHours: number;
  estimateCost: number;
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
