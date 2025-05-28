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

export interface VaNumber {
  va_number: string;
  bank: string;
}

export interface PaymentNotification {
  va_numbers: VaNumber[];
  transaction_time: string;
  transaction_status: string;
  transaction_id: string;
  status_message: string;
  status_code: string;
  signature_key: string;
  settlement_time: string;
  payment_type: string;
  payment_amounts: any[]; // Atau tentukan tipe yang lebih spesifik jika Anda tahu strukturnya
  order_id: string;
  merchant_id: string;
  gross_amount: string;
  fraud_status: string;
  expiry_time: string;
  currency: string;
}

// Atau sebagai type
export type TPaymentNotification = {
  va_numbers: {
    va_number: string;
    bank: string;
  }[];
  transaction_time: string;
  transaction_status: string;
  transaction_id: string;
  status_message: string;
  status_code: string;
  signature_key: string;
  settlement_time: string;
  payment_type: string;
  payment_amounts: any[]; // Atau tentukan tipe yang lebih spesifik jika Anda tahu strukturnya
  order_id: string;
  merchant_id: string;
  gross_amount: string;
  fraud_status: string;
  expiry_time: string;
  currency: string;
};
