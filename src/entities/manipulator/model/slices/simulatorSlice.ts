import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { GRID_SIZE, INITIAL_SAMPLES } from "../../../../shared/constants";
import type { Pos, Sample, SimulatorState } from "../types/types";

function randInt(max: number) {
  return Math.floor(Math.random() * max);
}
function same(a: Pos, b: Pos) {
  return a.x === b.x && a.y === b.y;
}

const generateSamples = (n: number, grid: number): Sample[] => {
  const res: Sample[] = [];
  while (res.length < n) {
    const s = { x: randInt(grid), y: randInt(grid) };
    if (!res.some((t) => same(t, s)) && !(s.x === 0 && s.y === 0)) res.push(s);
  }
  return res;
};

const initialState: SimulatorState & { lastPickupPos?: Pos | null } = {
  gridSize: GRID_SIZE,
  pos: { x: 0, y: 0 },
  carrying: false,
  samples: [],
  speedMs: 200,
  running: false,
  lastPickupPos: null,
};

export const resetWorld = createAsyncThunk(
  "sim/reset",
  async (_, { dispatch }) => {
    dispatch(
      setState({
        ...initialState,
        samples: generateSamples(INITIAL_SAMPLES, GRID_SIZE),
      })
    );
  }
);

type StepCtx = {
  get: () => SimulatorState & { lastPickupPos?: Pos | null };
  set: (p: Partial<SimulatorState & { lastPickupPos?: Pos | null }>) => void;
  delay: (ms: number) => Promise<void>;
};

async function moveTo(ctx: StepCtx, target: Pos) {
  const s = ctx.get();
  const current = s.pos;
  const delay = ctx.get().speedMs / 2;

  if (current.x < target.x) {
    for (let x = current.x; x < target.x; x++) {
      ctx.set({ pos: { x: x + 1, y: current.y } });
      await ctx.delay(delay);
    }
  } else {
    for (let x = current.x; x > target.x; x--) {
      ctx.set({ pos: { x: x - 1, y: current.y } });
      await ctx.delay(delay);
    }
  }

  const newPos = ctx.get().pos;
  if (newPos.y < target.y) {
    for (let y = newPos.y; y < target.y; y++) {
      ctx.set({ pos: { x: target.x, y: y + 1 } });
      await ctx.delay(delay);
    }
  } else {
    for (let y = newPos.y; y > target.y; y--) {
      ctx.set({ pos: { x: target.x, y: y - 1 } });
      await ctx.delay(delay);
    }
  }
}

async function runCommand(
  cmd: string,
  ctx: StepCtx
): Promise<{ ok: boolean; message?: string }> {
  const s = ctx.get();

  if ("ЛПВН".includes(cmd)) {
    const { gridSize } = s;
    let { x, y } = s.pos;

    if (cmd === "Л") x--;
    if (cmd === "П") x++;
    if (cmd === "В") y--;
    if (cmd === "Н") y++;

    if (x < 0 || y < 0 || x >= gridSize || y >= gridSize) {
      const prev = s.lastPickupPos;
      if (s.carrying && prev) {
        await moveTo(ctx, prev);
        ctx.set({
          carrying: false,
          samples: [...s.samples, { ...prev }],
          lastPickupPos: null,
        });
        await ctx.delay(300);
        await moveTo(ctx, { x: 0, y: 0 });
      }

      return { ok: false, message: "Вы указали неверное направление" };
    }

    ctx.set({ pos: { x, y } });
    await ctx.delay(ctx.get().speedMs);
    return { ok: true };
  }

  if (cmd === "О") {
    const i = s.samples.findIndex((t) => same(t, s.pos));
    if (i === -1) return { ok: false, message: "На клетке нет образца" };

    const next = [...s.samples];
    next.splice(i, 1);
    ctx.set({ carrying: true, samples: next, lastPickupPos: { ...s.pos } });
    await ctx.delay(ctx.get().speedMs);
    return { ok: true };
  }

  if (cmd === "Б") {
    if (!s.carrying) return { ok: false, message: "Вы не взяли образец" };

    const isOccupied = s.samples.some((t) => same(t, s.pos));

    if (isOccupied) {
      const prev = s.lastPickupPos;
      if (prev) {
        await moveTo(ctx, prev);
        ctx.set({
          carrying: false,
          samples: [...s.samples, { ...prev }],
          lastPickupPos: null,
        });
        await ctx.delay(300);
        await moveTo(ctx, { x: 0, y: 0 });
        return {
          ok: false,
          message: "Клетка занята. Образец возвращён на прежнее место",
        };
      } else {
        ctx.set({
          carrying: false,
          samples: [...s.samples, { x: 0, y: 0 }],
          lastPickupPos: null,
        });
        await moveTo(ctx, { x: 0, y: 0 });
        return {
          ok: false,
          message: "Клетка занята. Образец возвращён в исходную позицию",
        };
      }
    }

    ctx.set({
      carrying: false,
      samples: [...s.samples, { ...s.pos }],
      lastPickupPos: null,
    });
    await ctx.delay(ctx.get().speedMs);
    return { ok: true };
  }

  return { ok: false, message: "Неизвестная команда" };
}

function expandSequence(s: string): string {
  const src = s.replace(/\s+/g, "");
  let i = 0;
  function parseSeq(): string {
    let out = "";
    while (i < src.length && src[i] !== ")") {
      if (/\d/.test(src[i])) {
        let kStr = "";
        while (i < src.length && /\d/.test(src[i])) kStr += src[i++];
        const k = parseInt(kStr, 10);
        if (src[i] === "(") {
          i++;
          const inner = parseSeq();
          if (src[i] === ")") i++;
          out += inner.repeat(k);
        } else {
          const ch = src[i++];
          out += ch.repeat(k);
        }
      } else if ("ЛПВНОБ".includes(src[i])) {
        out += src[i++];
      } else if (src[i] === "(") {
        i++;
        const inner = parseSeq();
        if (src[i] === ")") i++;
        out += inner;
      } else {
        i++;
      }
    }
    return out;
  }
  return parseSeq();
}

export const runSequence = createAsyncThunk(
  "sim/runSequence",
  async (sequence: string, { getState, dispatch }) => {
    dispatch(setState({ running: true }));

    const get = () => (getState() as any).simulator as SimulatorState;
    const set = (p: Partial<SimulatorState>) => dispatch(setState(p));
    const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
    const ctx: StepCtx = { get, set, delay };

    const expanded = expandSequence(sequence);
    let ok = true;
    let message: string | undefined;

    for (const ch of expanded) {
      const res = await runCommand(ch, ctx);
      if (!res.ok) {
        ok = false;
        message = res.message;
        break;
      }
    }

    const stateAfter = get();
    const finalSamples = stateAfter.samples.map((s) => ({ ...s }));
    const finalPos = { ...stateAfter.pos };
    const finalCarrying = stateAfter.carrying;

    await moveTo(ctx, { x: 0, y: 0 });
    dispatch(setState({ running: false }));

    if (ok && !message)
      message =
        "Операция выполнена успешно. Манипулятор вернулся в исходную позицию.";

    return { ok, message, expanded, finalSamples, finalPos, finalCarrying };
  }
);

const simulatorSlice = createSlice({
  name: "simulator",
  initialState,
  reducers: {
    setState(state, action: PayloadAction<Partial<SimulatorState>>) {
      Object.assign(state, action.payload);
    },
    setSpeed(state, action: PayloadAction<number>) {
      const min = 100;
      const max = 1000;
      state.speedMs = Math.max(min, Math.min(max, action.payload));
    },
  },
});

const { reducer: simulatorReducer, actions } = simulatorSlice;
export const { setState, setSpeed } = actions;
export default simulatorReducer;
