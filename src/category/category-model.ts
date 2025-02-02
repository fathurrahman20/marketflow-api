export type CreateCategoryRequest = {
  name: string;
};

export type UpdateCategoryRequest = {
  id: number;
  name?: string;
};
