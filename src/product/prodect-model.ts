interface Image {
  id: string;
  url: string;
}

export type CreateProductRequest = {
  name: string;
  slug: string;
  description: string;
  image: Image;
  price: number;
  brandId: string;
  categoryId: string;
};

export type UpdateProductRequest = {
  name?: string;
  slug?: string;
  description?: string;
  image?: Image;
  price?: number;
  brandId?: string;
  categoryId?: string;
};

export type SearchProductRequest = {
  category?: string[] | undefined;
  brand?: string[] | undefined;
  page: number;
};
