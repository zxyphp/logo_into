export interface GeneratedImage {
  id: string;
  url: string; // Data URL
  prompt: string;
  productType: string;
  createdAt: number;
}

export enum ProductType {
  TShirt = 'T-Shirt',
  Hoodie = 'Hoodie',
  Mug = 'Coffee Mug',
  ToteBag = 'Tote Bag',
  Cap = 'Baseball Cap',
  Notebook = 'Notebook'
}

export type GenerationStatus = 'idle' | 'generating' | 'success' | 'error';
