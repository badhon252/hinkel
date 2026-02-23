import { body, param } from "express-validator";

const createCouponValidation = [
    body("codeName")
        .notEmpty().withMessage("Code name is required")
        .isString().withMessage("Code name must be a string")
        .trim(),

    body("expiryDate")
        .notEmpty().withMessage("Expiry date is required")
        .isISO8601().withMessage("Expiry date must be a valid date")
        .custom((value) => {
            if (new Date(value) <= new Date()) {
                throw new Error("Expiry date must be in the future");
            }
            return true;
        }),

    body("usesLimit")
        .notEmpty().withMessage("Uses limit is required")
        .isInt({ min: 1 }).withMessage("Uses limit must be a whole number and at least 1"),

    body("discountType")
        .notEmpty().withMessage("Discount type is required")
        .isIn(["percentage", "flat"]).withMessage("Discount type must be either 'percentage' or 'flat'"),

    body("discountAmount")
        .notEmpty().withMessage("Discount amount is required")
        .isFloat({ min: 0.01 }).withMessage("Discount amount must be greater than 0")
        .custom((value, { req }) => {
            if (req.body.discountType === "percentage" && value > 100) {
                throw new Error("Percentage discount cannot exceed 100");
            }
            return true;
        }),
];

const updateCouponValidation = [
    param("couponId")
        .isMongoId().withMessage("Invalid coupon ID"),

    body("codeName")
        .optional()
        .isString().withMessage("Code name must be a string")
        .trim(),

    body("expiryDate")
        .optional()
        .isISO8601().withMessage("Expiry date must be a valid date")
        .custom((value) => {
            if (new Date(value) <= new Date()) {
                throw new Error("Expiry date must be in the future");
            }
            return true;
        }),

    body("usesLimit")
        .optional()
        .isInt({ min: 1 }).withMessage("Uses limit must be a whole number and at least 1"),

    body("discountType")
        .optional()
        .isIn(["percentage", "flat"]).withMessage("Discount type must be either 'percentage' or 'flat'"),

    body("discountAmount")
        .optional()
        .isFloat({ min: 0.01 }).withMessage("Discount amount must be greater than 0")
        .custom((value, { req }) => {
            if (req.body.discountType === "percentage" && value > 100) {
                throw new Error("Percentage discount cannot exceed 100");
            }
            return true;
        }),
];

const couponIdValidation = [
    param("couponId")
        .isMongoId().withMessage("Invalid coupon ID"),
];

export const couponValidation = {
    createCouponValidation,
    updateCouponValidation,
    couponIdValidation,
};