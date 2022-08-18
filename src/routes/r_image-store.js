import { ObjectId } from "mongodb";
import connect from "../db.js";

let bodyID = null;

let fetch = async (req, res) => {
  let query = String(req.query.data);

  let db = await connect();
  let cursor = await db.collection(query).find();
  let results = await cursor.toArray();

  res.json(results);
};

function setBodyID(id) {
  bodyID = id;
}

function subdivideImage(n, l, img) {
  let fragments = [];
  for (var i = 0; i < n; i++) {
    fragments.push(img.slice(0, l));
    img = img.slice(l);
  }
  fragments[fragments.length - 1] =
    fragments[fragments.length - 1] + img.slice(0, l);
  return fragments;
}

let storeAndGetFragmentsID = async (db, fragments, name) => {
  let fragmentsIDs = [];
  for (var i = 0; i < fragments.length; i++) {
    let frg = fragments[i];
    //creating fragment document with unique id
    let imageFragment = {
      frg,
    };
    let newImageFragment = await db
      .collection("imageFragments")
      .insertOne(imageFragment); //saves image in mongodb
    let fragmentID = newImageFragment.insertedId;
    fragmentsIDs.push(fragmentID);
    let response =
      "Succesfully uploaded image { " +
      name +
      " } fragment [" +
      (i + 1) +
      "] with id { " +
      fragmentID +
      " }";
    console.log(response);
  }
  return fragmentsIDs;
};

let storeImage = async (db, frgIDs, name, img) => {
  img = img ? img : "fragmented"; //creating image document with unique
  let fragmentsIDs = frgIDs;
  let image = fragmentsIDs
    ? {
        name,
        img,
        fragmentsIDs,
      }
    : {
        name,
        img,
      };
  let newImage = await db.collection("images").insertOne(image); //saves fragmented image in mongodb
  return {
    msg:
      "Succesfully uploaded " +
      (frgIDs ? "fragmented" : "") +
      "image { " +
      name +
      " } with id { " +
      newImage.insertedId +
      " }",
    id: newImage.insertedId,
  };
};

let upload = async (req, res) => {
  let { name, img } = req.body; //retrieving image name and image base64 data
  let imgSize = encodeURI(img).split(/%..|./).length - 1; //calculating image size
  try {
    let db = await connect(); //connecting to mongoDB
    if (imgSize < 1048576) {
      let response = await storeImage(db, false, name, img); ///storing  image into mongoDB

      console.log(response.msg);
      res.status(201).send({ id: response.id });
      return;
    }
    //uploading image.size > 1mb | dividing image into fragments
    else {
      let db = await connect(); //connecting to mongoDB
      let n = (parseInt(imgSize / 1048576) + 1) * 2; //divide image size by 1mb
      console.log("Subdividing image " + name + " into " + n + " fragments!");
      let l = img.length / n; //save length of divided image part

      let fragments = subdivideImage(n, l, img); //storing and dividing image into fragments

      let fragmentsIDs = await storeAndGetFragmentsID(db, fragments, name); //storing fragmentIDs into array and storing fragments into mongoDB

      let response = await storeImage(db, fragmentsIDs, name, false); //storing fragmented image into mongoDB with fragmentIDs array

      console.log(response.msg);
      res.status(201).send({ id: response.id });
      return;
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
    return;
  }
};

let download = async (req, res) => {
  console.log(req.query);
  if (req.query.id == "")
    try {
      res.status(201).send("");
      return;
    } catch {
      res.status(400).json({ error: "Download error: " + e });
      return;
    }
  let query = String(req.query.id);
  let db = await connect();
  try {
    // find image with id
    let image = await db
      .collection("images")
      .findOne({ _id: new ObjectId(query) });

    if (image.img != "fragmented") {
      res.status(201).json(image); // return image if not fragmented
      return;
    } else {
      //if fragmented, merge image fragments
      image.img = "";
      for (let i = 0; i < image.fragmentsIDs.length; i++) {
        let fragment = await db
          .collection("imageFragments")
          .findOne({ _id: new ObjectId(image.fragmentsIDs[i]) });
        image.img += fragment.frg;
      }

      res.status(201).json(image); //return merged image
      return;
    }
  } catch (e) {
    res.status(400).json({ error: "Download error: " + e });
    return;
  }
};

let remove = async (req, res) => {
  let query;
  if (bodyID == null) query = String(req.query.id);
  else query = bodyID;

  let db = await connect();
  try {
    //find image with id
    let image = await db
      .collection("images")
      .findOne({ _id: new ObjectId(query) });
    if (image == null) return;
    if (image.img != "fragmented") {
      // delete image if not fragmented
      await db.collection("images").deleteOne({ _id: new ObjectId(query) });
      console.log(
        "Removed image { " + image.name + " } with id { " + query + " }"
      );
      if (bodyID != null) return;
      res
        .status(201)
        .json("Removed image { " + image.name + " } with id { " + query + " }");
      return;
    } else {
      // delete each fragment if image is fragmented
      for (let i = 0; i < image.fragmentsIDs.length; i++) {
        await db
          .collection("imageFragments")
          .deleteOne({ _id: new ObjectId(image.fragmentsIDs[i]) });
        console.log(
          "Removed image { " +
            image.name +
            " } fragment [" +
            (i + 1) +
            "] with id { " +
            image.fragmentsIDs[i] +
            " }"
        );
      }

      // delete fragmented image
      await db.collection("images").deleteOne({ _id: new ObjectId(query) });
      console.log(
        "Removed fragmented image { " +
          image.name +
          " } with id { " +
          query +
          " }"
      );
      if (bodyID != null) return;
      res
        .status(201)
        .json(
          "Removed fragmented image { " +
            image.name +
            " } with id { " +
            query +
            " }"
        );
      return;
    }
  } catch (e) {
    console.log(e);
    if (bodyID != null) return;
    res.status(400).json({ error: "Removing error: " + e });
    return;
  }
};
export default { upload, download, remove, setBodyID, fetch };
