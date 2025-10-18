export type Child = {
  id: string;
  name: string;
  age: number;
  balance: number;
  dailyBrushGoal: number;
  priceIncrease: number;
  currentToothValue: number;
  teeth: Array<{
    id: string;
    toothType: string;
    valueAtLoss: number;
    paid: boolean;
    lostDate: string;
  }>;
  brushSessions: Array<{
    id: string;
    timestamp: string;
    verified: boolean;
  }>;
  transactions: Array<{
    id: string;
    amount: number;
    description: string;
    createdAt: string;
  }>;
};

export type Family = {
  id: string;
  name: string;
  demoCode: string;
  parentName: string;
  children: Child[];
};
