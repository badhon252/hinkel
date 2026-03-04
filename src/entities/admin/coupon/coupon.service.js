import { AppError } from '../../../utility/AppError.js';
import { Coupon } from './coupon.model.js';

const createCouponIntoDb = async (payload) => {
  const existing = await Coupon.findOne({
    codeName: payload.codeName?.toUpperCase().trim()
  });
  if (existing)
    throw new AppError('Coupon with this code name already exists', 409);

  if (new Date(payload.expiryDate) <= new Date()) {
    throw new AppError('Expiry date must be in the future', 400);
  }

  const coupon = await Coupon.create(payload);
  return coupon;
};

const ALLOWED_SORT_FIELDS = [
  'createdAt',
  'expiryDate',
  'discountAmount',
  'usesLimit',
  'usedCount'
];
const getAllCouponsFromDb = async (query) => {
  const {
    page = 1,
    limit = 10,
    discountType,
    isExpired,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = query;

  const safePage = Math.max(1, Number(page));
  const safeLimit = Math.min(Math.max(1, Number(limit)), 100);
  const safeSortBy = ALLOWED_SORT_FIELDS.includes(sortBy)
    ? sortBy
    : 'createdAt';
  const safeSortOrder = sortOrder === 'asc' ? 1 : -1;

  const filter = {};

  if (discountType) {
    filter.discountType = discountType;
  }

  if (isExpired === 'true') {
    filter.expiryDate = { $lt: new Date() };
  } else if (isExpired === 'false') {
    filter.expiryDate = { $gte: new Date() };
  }

  const skip = (safePage - 1) * safeLimit;
  const sort = { [safeSortBy]: safeSortOrder };

  const [countResult, couponsResult] = await Promise.allSettled([
    Coupon.countDocuments(filter),
    Coupon.find(filter).sort(sort).skip(skip).limit(safeLimit).lean()
  ]);

  if (
    countResult.status === 'rejected' ||
    couponsResult.status === 'rejected'
  ) {
    throw new AppError('Failed to fetch coupons', 500);
  }

  const totalDocs = countResult.value;
  const coupons = couponsResult.value;
  const totalPages = Math.ceil(totalDocs / safeLimit);

  return {
    data: coupons,
    meta: {
      totalDocs,
      totalPages,
      currentPage: safePage,
      limit: safeLimit,
      hasNextPage: safePage < totalPages,
      hasPrevPage: safePage > 1
    }
  };
};

const getCouponByIdFromDb = async (id) => {
  const coupon = await Coupon.findById(id);
  if (!coupon) throw new AppError('Coupon not found', 404);
  return coupon;
};

const getCouponByCodeFromDb = async (codeName) => {
  const coupon = await Coupon.findOne({
    codeName: codeName?.toUpperCase().trim()
  });
  if (!coupon) throw new AppError('Invalid coupon code', 404);

  if (new Date() > new Date(coupon.expiryDate)) {
    throw new AppError('Coupon has expired', 400);
  }

  if (coupon.usedCount >= coupon.usesLimit) {
    throw new AppError('Coupon usage limit has been reached', 400);
  }

  return coupon;
};

const updateCouponIntoDb = async (id, payload) => {
  if (payload.usesLimit !== undefined && payload.usesLimit < 0) {
    throw new AppError('Uses limit cannot be negative', 400);
  }

  if (payload.codeName) {
    const existing = await Coupon.findOne({
      codeName: payload.codeName.toUpperCase().trim(),
      _id: { $ne: id }
    });
    if (existing)
      throw new AppError('Coupon with this code name already exists', 409);
  }

  const updated = await Coupon.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true
  });
  if (!updated) throw new AppError('Coupon not found', 404);
  return updated;
};

const incrementCouponUsedCount = async (codeName) => {
  const updated = await Coupon.findOneAndUpdate(
    { codeName: codeName.toUpperCase().trim() },
    { $inc: { usedCount: 1 } },
    { new: true }
  );
  return updated;
};

const deleteCouponFromDb = async (id) => {
  const deleted = await Coupon.findByIdAndDelete(id);
  if (!deleted) throw new AppError('Coupon not found', 404);
  return deleted;
};

export const couponService = {
  createCouponIntoDb,
  getAllCouponsFromDb,
  getCouponByIdFromDb,
  getCouponByCodeFromDb,
  updateCouponIntoDb,
  deleteCouponFromDb,
  incrementCouponUsedCount
};
