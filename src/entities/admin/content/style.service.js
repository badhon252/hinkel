import { styleModel } from "./style.model.js";


const createStyle = async (data) => {
    return styleModel.create(data);
};

const getStyles = async () => {
    return styleModel.find().sort({ createdAt: -1 });
};

const updateStyle = async (id, data) => {
    return styleModel.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

const deleteStyle = async (id) => {
    return styleModel.findByIdAndDelete(id);
};

const getStyleById = async (id) => {
    return styleModel.findById(id);
};

export const styleService = {
    createStyle,
    getStyles,
    updateStyle,
    deleteStyle,
    getStyleById

}