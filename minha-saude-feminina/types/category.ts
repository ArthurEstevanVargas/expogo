export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateCategoryRequest = {
  name: string;
  slug: string;
  description: string;
  displayOrder?: number;
};

export type UpdateCategoryRequest = Partial<CreateCategoryRequest>;
