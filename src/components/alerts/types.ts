export interface Alert {
    _id: string;
    symbol: string;
    condition: "Above" | "Below";
    price: number;
    active: boolean;
    note?: string;
  }