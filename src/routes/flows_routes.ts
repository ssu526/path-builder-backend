import express from "express";
import {
  createFlow,
  deleteFlow,
  getFlow,
  updateFlowDetail,
  UpdateFlowName,
  updateFlowProgress,
} from "../controllers/flows_controllers";

const router = express.Router();

router.get("/:flowId", getFlow);
router.post("/create", createFlow);
router.put("/name/:flowId", UpdateFlowName);
router.put("/progress/:flowId", updateFlowProgress);
router.put("/detail/:flowId", updateFlowDetail);
router.delete("/:flowId", deleteFlow);

export default router;
