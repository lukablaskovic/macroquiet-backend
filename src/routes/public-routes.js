import { Router } from "express";
import connect from "../services/mongoClient.js";

// /api/public
const router = Router();

const publicData = Array.of("carousel", "timeline");
router.get("/data/:name", async (req, res) => {
  let db = await connect();
  let dataName = String(req.params.name);

  let filter = {};
  if (publicData.includes(dataName)) {
    for (const [key, value] of Object.entries(req.query)) {
      filter[key] =
        value === "true"
          ? true
          : value === "false"
          ? false
          : isNaN(value)
          ? value
          : parseInt(value);
    }

    try {
      let cursor = await db.collection(dataName).find(filter);
      let result = await cursor.toArray();
      res.status(200).json(result);
    } catch (e) {
      res.status(400).json({ error: e });
    }
  } else {
    res.status(401);
  }
});
export default router;
