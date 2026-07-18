import { Schema, model, models, type Model } from "mongoose";

// Atomic sequence counter (used for human-readable order numbers).
interface CounterDoc {
  _id: string; // e.g. "order-2026"
  seq: number;
}

const CounterSchema = new Schema<CounterDoc>({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

export const Counter: Model<CounterDoc> =
  (models.Counter as Model<CounterDoc>) || model<CounterDoc>("Counter", CounterSchema);

/** Atomically increment and return the next sequence value for a key. */
export async function nextSeq(key: string): Promise<number> {
  const doc = await Counter.findByIdAndUpdate(
    key,
    { $inc: { seq: 1 } },
    { new: true, upsert: true },
  ).exec();
  return doc.seq;
}
