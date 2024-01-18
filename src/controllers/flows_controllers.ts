import { RequestHandler } from "express";
import FlowModel from "../models/Flow";
import HttpError from "../utils/HttpError";
import mongoose from "mongoose";
import UserModel from "../models/User";
import { Progress, Visibility } from "../utils/enum";

export const getFlow: RequestHandler = async (req, res, next) => {
  const flowId = req.params.flowId;
  const authenticatedUserId = req.session.userId;

  try {
    if (!mongoose.isValidObjectId(flowId)) {
      throw new HttpError(400, "Flow id is not valid");
    }

    const flow = await FlowModel.findById(flowId);
    if (!flow) {
      throw new HttpError(404, "Flow not found");
    }

    if (!flow.userId.equals(authenticatedUserId)) {
      throw new HttpError(401, "Not Authorized");
    }

    res.status(200).json(flow);
  } catch (error) {
    next(error);
  }
};

export const createFlow: RequestHandler = async (req, res, next) => {
  const flowName: string = "Untitiled";
  const authenticatedUserId = req.session.userId;

  const newFlowDetail = {
    flow: {
      nodes: [],
      edges: [],
      viewport: {
        x: 0,
        y: 0,
        zoom: 1,
      },
    },
  };

  const newFlow = {
    userId: authenticatedUserId,
    flow: newFlowDetail,
  };

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const flowAdded = await FlowModel.create([newFlow], { session });
    const user = await UserModel.findById(authenticatedUserId).session(session);

    user!.flows.push({
      flowId: flowAdded[0]._id,
      name: flowName,
      progress: Progress.PENDING,
      visibility: Visibility.PROTECTED,
    });

    await user!.save({ session });

    await session.commitTransaction();

    res.status(201).json({ flowAdded, user, flowName });
  } catch (error) {
    await session.abortTransaction();
    next(new HttpError(401, "Failed to create the flow"));
  } finally {
    session.endSession();
  }
};

export const UpdateFlowName: RequestHandler = async (req, res, next) => {
  const flowId = req.params.flowId;
  const newName: string = req.body.name;
  const authenticatedUserId = req.session.userId;

  try {
    if (!mongoose.isValidObjectId(flowId)) {
      throw new HttpError(400, "Flow id is not valid");
    }

    const flow = await FlowModel.findById(flowId);
    if (!flow) {
      throw new HttpError(404, "Flow not found");
    }

    if (!flow.userId.equals(authenticatedUserId)) {
      throw new HttpError(401, "Not Authorized");
    }

    if (!newName || newName.trim() === "") {
      throw new HttpError(400, "Flow must have a name");
    }

    const user = await UserModel.findOneAndUpdate(
      { _id: authenticatedUserId, "flows.flowId": flowId },
      { $set: { "flows.$.name": newName } },
      { new: true }
    );

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const updateFlowProgress: RequestHandler = async (req, res, next) => {
  const flowId = req.params.flowId;
  const progress = req.body.progress;
  const authenticatedUserId = req.session.userId;

  try {
    if (!mongoose.isValidObjectId(flowId)) {
      throw new HttpError(400, "Flow id is not valid");
    }

    const flow = await FlowModel.findById(flowId);
    if (!flow) {
      throw new HttpError(404, "Flow not found");
    }

    if (!flow.userId.equals(authenticatedUserId)) {
      throw new HttpError(401, "Not Authorized");
    }

    if (!progress) {
      throw new HttpError(400, "Progress is missing");
    }

    if (!Object.values(Progress).includes(progress)) {
      throw new HttpError(400, "Invalid progress type");
    }

    const user = await UserModel.findOneAndUpdate(
      { _id: authenticatedUserId, "flows.flowId": flowId },
      { $set: { "flows.$.progress": progress } },
      { new: true }
    );
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const updateFlowDetail: RequestHandler = async (req, res, next) => {
  const flowId = req.params.flowId;
  const flowBody = req.body.flowBody;
  const authenticatedUserId = req.session.userId;

  try {
    if (!mongoose.isValidObjectId(flowId)) {
      throw new HttpError(400, "Flow id is not valid");
    }

    const existingFlow = await FlowModel.findById(flowId);

    if (!existingFlow) {
      throw new HttpError(404, "Flow not found");
    }

    if (!existingFlow.userId.equals(authenticatedUserId)) {
      throw new HttpError(401, "Not Authorized");
    }

    existingFlow.flow = flowBody;

    const updatedFlow = existingFlow.save();

    res.status(200).json(updatedFlow);
  } catch (error) {
    next(error);
  }
};

export const deleteFlow: RequestHandler = async (req, res, next) => {
  const flowId = req.params.flowId;
  const authenticatedUserId = req.session.userId;

  try {
    if (!mongoose.isValidObjectId(flowId)) {
      throw new HttpError(400, "Flow id is not valid");
    }

    const existingFlow = await FlowModel.findById(flowId);

    if (!existingFlow) {
      throw new HttpError(404, "Flow not found");
    }

    if (!existingFlow.userId.equals(authenticatedUserId)) {
      throw new HttpError(401, "Not Authorized");
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      authenticatedUserId,
      {
        $pull: { flows: { flowId: existingFlow._id } },
      },
      { new: true }
    );

    await existingFlow.deleteOne();

    console.log(updatedUser);

    res.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
};
