import { PaymentMethod, Status } from "@prisma/client";

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

export type TransactionType = {
  id: string;
  user_id: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  status: Status;
  snap_redirect_url: string;
  snap_token: string;
  payment_type: string;
};
