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
  brandId: number;
  categoryId: number;
};

export type UpdateProductRequest = {
  name?: string;
  slug?: string;
  description?: string;
  image?: Image;
  price?: number;
  brandId?: number;
  categoryId?: number;
};
