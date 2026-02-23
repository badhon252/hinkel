import express from "express";
import { couponController } from "./coupon.controller.js";
import { couponValidation } from "./coupon.validation.js";

const router = express.Router();

router.post("/create", couponValidation.createCouponValidation, couponController.createCoupon);
router.get("/all", couponController.getAllCoupons);
router.get("/:couponId", couponValidation.couponIdValidation, couponController.getCouponById);
router.put("/update/:couponId", couponValidation.updateCouponValidation, couponController.updateCoupon);
router.delete("/delete/:couponId", couponValidation.couponIdValidation, couponController.deleteCoupon);

export const couponRoutes = router;