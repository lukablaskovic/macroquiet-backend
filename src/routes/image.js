import { model, Schema } from "mongoose";

let imageSchema = new Schema({
    name: {
        type: String,
        reqired: true
    },
    img: {
        type: String,
        required: true
    }
});

export default model("image", imageSchema);