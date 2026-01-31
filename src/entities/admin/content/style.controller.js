import { catchAsync } from "../../../utility/catchAsync.js";
import { sendResponse } from "../../../utility/sendResponse.js";
import { styleService } from "./style.service.js";


const postStyle = catchAsync(async (req, res) => {
    const { title, subtitle, badgeText } = req.body;

    if (!title || !subtitle || !badgeText) {
        return sendResponse(res, {
            statusCode: 400,
            message: "title, subtitle, badgeText are required",
            errors: [
                !title ? { field: "title", message: "title is required" } : null,
                !subtitle ? { field: "subtitle", message: "subtitle is required" } : null,
                !badgeText ? { field: "badgeText", message: "badgeText is required" } : null,
            ].filter(Boolean),
        });
    }

    const created = await styleService.createStyle({ title, subtitle, badgeText });

    return sendResponse(res, {
        statusCode: 201,
        message: "Style created successfully",
        data: created,
    });
});

const getStyle = catchAsync(async (req, res) => {
    const items = await styleService.getStyles();

    return sendResponse(res, {
        statusCode: 200,
        message: "Styles fetched successfully",
        data: items,
        meta: { count: items.length },
    });
});

const patchStyle = catchAsync(async (req, res) => {
    const { id } = req.params;

    const updated = await styleService.updateStyle(id, req.body);

    if (!updated) {
        return sendResponse(res, {
            statusCode: 404,
            message: "Style not found",
        });
    }

    return sendResponse(res, {
        statusCode: 200,
        message: "Style updated successfully",
        data: updated,
    });
});

const removeStyle = catchAsync(async (req, res) => {
    const { id } = req.params;

    const deleted = await styleService.deleteStyle(id);

    if (!deleted) {
        return sendResponse(res, {
            statusCode: 404,
            message: "Style not found",
        });
    }

    return sendResponse(res, {
        statusCode: 200,
        message: "Style deleted successfully",
        data: deleted, // optional; remove if you don't want to return deleted doc
    });
});

export const styleController = {
    postStyle,
    getStyle,
    patchStyle,
    removeStyle,
};
