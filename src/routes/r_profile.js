import connect from "../db.js";
import storage from "./r_image-storage";

//Change user profile cover image
let updateCoverImage = async (req, res) => {
    let imageID = req.body.id;
    let username = req.jwt.username;
    if (imageID) {
        try {
            let db = await connect();
            //find user
            let user = await db
                .collection("users")
                .findOne({ username: username });
            if (user) {
                //delete previous user profile cover image
                storage.setBodyID(user.profile.coverImageID);
                await storage.remove();
                //set new user profile cover ID
                await db
                    .collection("users")
                    .updateOne(
                        { _id: user._id },
                        { $set: { "profile.coverImageID": imageID } }
                    );
                console.log(
                    "Profile cover updated with id { " + imageID + " }"
                );
                res.status(200).send(
                    "Profile cover updated with id { " + imageID + " }"
                );
            } else {
                res.status(404);
            }
        } catch (e) {
            res.status(500).json(e);
        }
    } else {
        res.status(400);
    }
};

//Change user profile avatar image
let updateAvatarImage = async (req, res) => {
    let imageID = req.body.id;
    let username = req.jwt.username;
    if (imageID) {
        try {
            let db = await connect();
            //find user
            let user = await db
                .collection("users")
                .findOne({ username: username });
            if (user) {
                //delete previous user profile avatar image
                console.log(user.profile.avatarImageID);
                storage.setBodyID(user.profile.avatarImageID);
                await storage.remove();
                //set new user profile avatar ID
                await db
                    .collection("users")
                    .updateOne(
                        { _id: user._id },
                        { $set: { "profile.avatarImageID": imageID } }
                    );
                console.log(
                    "Profile avatar updated with id { " + imageID + " }"
                );
                res.status(200).send(
                    "Profile avatar updated with id { " + imageID + " }"
                );
            } else {
                res.status(404);
            }
        } catch (e) {
            res.status(500).json(e);
        }
    } else {
        res.status(400);
    }
};

//Change user profile avatar image
let updateDescription = async (req, res) => {
    console.log("YAY");
    let description = req.body.description;
    let username = req.jwt.username;
    if (description) {
        try {
            let db = await connect();
            //find user
            let user = await db
                .collection("users")
                .findOne({ username: username });
            if (user) {
                await db
                    .collection("users")
                    .updateOne(
                        { _id: user._id },
                        { $set: { "profile.description": description } }
                    );
                console.log("Description changed!");
                res.status(200).send("Description changed!");
            } else {
                res.status(404);
            }
        } catch (e) {
            res.status(500).json(e);
        }
    } else {
        res.status(400);
    }
};

export default { updateCoverImage, updateAvatarImage, updateDescription };
