export type Pos = { x: number; y: number };

export type Sample = Pos;

export type HistoryItem = {
  id: string;
  raw: string;
  optimized: string;
  dateISO: string;
  samplesBefore: Sample[];
  samplesAfter: Sample[];
  success: boolean;
  message?: string;
};

export type SimulatorState = {
  gridSize: number;
  pos: Pos;
  carrying: boolean;
  samples: Sample[];
  speedMs: number;
  running: boolean;
};
