export type CreateTransactionRequest = {
  name: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
};

export type CreateTransactionItemRequest = {
  productId: string;
  quantity: number;
  price: number;
};
