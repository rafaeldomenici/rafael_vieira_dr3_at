export interface ItemIterface {
  uid: string;
  title: string;
  description: string;
  etapas?: Array<string>;
  ingredientes?: Array<string>;
  images?: Array<string>;
  createdAt?: string;
  sync?: number;
}

export interface ItemImageInterface {
  uid: string;
  image: string;
  itemUid: string;
  createdAt?: string;
  sync?: number;
}