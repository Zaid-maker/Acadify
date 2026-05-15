import mongoose from "mongoose";

const liveSessionSchema = new mongoose.Schema({
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['live', 'ended'],
        default: 'live'
    },
    roomName: {
        type: String,
        required: true,
        unique: true
    },
    startTime: {
        type: Date,
        default: Date.now
    },
    endTime: {
        type: Date
    },
    participants: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        joinedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, { timestamps: true });

export default mongoose.model('LiveSession', liveSessionSchema);
