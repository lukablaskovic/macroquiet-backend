import auth from "../auth";

let getToken = (req, res) => {
  res.json(req.jwt.email);
};

let updateToken = (req, res) => {
  let userdata = req.body;
  try {
    let tokenData = auth.setToken(userdata.username, userdata.email);
    res.json(tokenData);
  } catch (e) {
    res.status(401).json({ error: e.message });
  }
};

export default { getToken, updateToken };
