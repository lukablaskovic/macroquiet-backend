import connect from "../../services/mongoClient.js";

//Change user profile avatar image
let updateDescription = async (req, res) => {
  let description = req.body.description;
  let username = req.jwt.username;
  if (description) {
    try {
      let db = await connect();
      //find user
      let user = await db.collection("users").findOne({ username: username });
      if (user) {
        await db
          .collection("users")
          .updateOne(
            { _id: user._id },
            { $set: { "profile.description": description } }
          );
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

export default { updateDescription };
