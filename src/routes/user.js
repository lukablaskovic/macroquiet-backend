import auth from "../auth";
//Register new user
let register = async (req, res) => {
  let user = req.body;
  let id;

  try {
    id = await auth.registerUser(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
    return;
  }
  res.json({ id: id });
};

//Change user username
let changeUsername = async (req, res) => {
  let changes = req.body;
  let old_username = req.jwt.username;
  if (changes) {
    let result = await auth.changeUserUsername(
      old_username,
      changes.new_username
    );
    if (result) {
      res.status(201).send();
    } else {
      res.status(500).json({ error: "Cannot change username!" });
    }
  } else {
    res.status(400).json({ error: "Wrong query!" });
  }
};

//Change user email
let changeEmail = async (req, res) => {
  let changes = req.body;
  let username = req.jwt.username;
  if (changes) {
    let result = await auth.changeUserEmail(username, changes.new_email);

    if (result) {
      res.status(201).send();
    } else {
      res.status(500).json({ error: "Cannot change email!" });
    }
  } else {
    res.status(400).json({ error: "Wrong query!" });
  }
};

//Change user password
let changePassword = async (req, res) => {
  let changes = req.body;

  if (changes.username && changes.new_password && changes.old_password) {
    let result = await auth.changeUserPassword(
      changes.username,
      changes.old_password,
      changes.new_password
    );

    if (result) {
      res.status(201).send();
    } else {
      res.status(500).json({ error: "Cannot change password!" });
    }
  } else {
    res.status(400).json({ error: "Wrong query!" });
  }
};

export default { register, changeUsername, changeEmail, changePassword };
