import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema({
    title: String,
    section: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Section',
    },
    videoUrl: {
        type: String,
        required: true,
        validate: {
            validator: function (value) {
                return /^https?:\/\/.+/.test(value);
            },
            message: "Invalid video URL",
        },
    },
    description: {
        type: String,
        default: "",
    },
    order: Number,
})

export default mongoose.model('Lecture', lectureSchema);
