import { couponService } from "./coupon.service.js";
import { catchAsync } from "../../../utility/catchAsync.js";
import { sendResponse } from "../../../utility/sendResponse.js";

const createCoupon = catchAsync(async (req, res) => {
    const created = await couponService.createCouponIntoDb(req.body);

    return sendResponse(res, {
        statusCode: 201,
        message: "Coupon created successfully",
        data: created,
    });
});

const getAllCoupons = catchAsync(async (req, res) => {
    const result = await couponService.getAllCouponsFromDb(req.query);

    return sendResponse(res, {
        statusCode: 200,
        message: "Coupons fetched successfully",
        data: result.data,
        meta: result.meta,
    });
});

const getCouponById = catchAsync(async (req, res) => {
    const coupon = await couponService.getCouponByIdFromDb(req.params.couponId);

    return sendResponse(res, {
        statusCode: 200,
        message: "Coupon fetched successfully",
        data: coupon,
    });
});

const updateCoupon = catchAsync(async (req, res) => {
    const updated = await couponService.updateCouponIntoDb(req.params.couponId, req.body);

    return sendResponse(res, {
        statusCode: 200,
        message: "Coupon updated successfully",
        data: updated,
    });
});

const deleteCoupon = catchAsync(async (req, res) => {
    const deleted = await couponService.deleteCouponFromDb(req.params.couponId);

    return sendResponse(res, {
        statusCode: 200,
        message: "Coupon deleted successfully",
        data: deleted,
    });
});

export const couponController = {
    createCoupon,
    getAllCoupons,
    getCouponById,
    updateCoupon,
    deleteCoupon,
};