export type Watch = {
  id: string;
  name: string;
  image: string;
};

const COUNT = 33;

export const WATCHES: Watch[] = Array.from({ length: COUNT }, (_, i) => {
  const n = String(i + 1).padStart(2, "0");
  return {
    id: `w-${n}`,
    name: `Watch ${n}`,
    image: `/watches/w-${n}.png`,
  };
});

const byId = new Map(WATCHES.map((w) => [w.id, w]));

export function getWatchById(id: string): Watch | undefined {
  return byId.get(id);
}

export function isValidWatchId(id: string): boolean {
  return byId.has(id);
}

export function pickRandomPair(): [Watch, Watch] {
  if (WATCHES.length < 2) {
    throw new Error("Catalog needs at least two watches");
  }
  const i = Math.floor(Math.random() * WATCHES.length);
  let j = Math.floor(Math.random() * WATCHES.length);
  while (j === i) {
    j = Math.floor(Math.random() * WATCHES.length);
  }
  const first = WATCHES[i]!;
  const second = WATCHES[j]!;
  return Math.random() < 0.5 ? [first, second] : [second, first];
}
