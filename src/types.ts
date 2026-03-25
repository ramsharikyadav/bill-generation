export interface LineItem {
  id: string;
  date: string;
  description: string;
  sac: string;
  qty: number;
  rate: number;
  amount: number;
}

export interface CustomerInfo {
  name: string;
  address: string;
  city: string;
  gstn: string;
}

export interface InvoiceData {
  invoiceNumber: string;
  date: string;
  customer: CustomerInfo;
  items: LineItem[];
  terms: string[];
}

export const DEFAULT_TERMS = [
  "Interest @ 18% p.a will be charged if the payment is not made within the stipulated time."
];

export const BANK_DETAILS = {
  name: "SHAWN ELIZEY",
  bankName: "HDFC BANK",
  accountNo: "50200072952751",
  branch: "JABALPUR, A/C TYPE-CURRENT",
  ifsc: "HDFC0000224"
};

export const COMPANY_DETAILS = {
  name: "SHAWN ELIZEY",
  subName: "A joint venture of N. M. Auto Parts Pvt. Ltd.",
  address: "Medical Collage to Old Tilwara Bridge Road, Bargi Hills Jabalpur (MP) 482003",
  gstn: "23AADCN2081L1ZI",
  contact: "Phone No. (O) 0761 2679444/777 - Email: shawnelizey@gmail.com"
};
