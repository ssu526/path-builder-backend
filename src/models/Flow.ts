import { InferSchemaType, Schema, model } from "mongoose";

const flowSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    flow: {
      type: JSON,
      required: true,
    },
  },
  { timestamps: true }
);

export type Flow = InferSchemaType<typeof flowSchema>;

const FlowModel = model<Flow>("Flow", flowSchema);

export default FlowModel;
