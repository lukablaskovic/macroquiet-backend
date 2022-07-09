"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

require("dotenv/config");

var _express = _interopRequireDefault(require("express"));

var _db = _interopRequireDefault(require("./db.js"));

var _cors = _interopRequireDefault(require("cors"));

var _auth = _interopRequireDefault(require("./auth.js"));

//import storage from "./memory_storage.js";
var app = (0, _express["default"])();
app.use((0, _cors["default"])()); //Omoguci CORS na svim rutama

app.use(_express["default"].json()); //automatski dekodiraj JSON poruke

var port = process.env.PORT || 3000; //JWT token

app.get("/tajna", [_auth["default"].verify], function (req, res) {
  res.json(req.jwt.email);
}); //Authenticate existing user

app.post("/auth", /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(req, res) {
    var userCredentials, result;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            userCredentials = req.body;
            _context.prev = 1;
            _context.next = 4;
            return _auth["default"].authenticateUser(userCredentials.email, userCredentials.password, userCredentials.rememberMe);

          case 4:
            result = _context.sent;
            res.json(result);
            _context.next = 11;
            break;

          case 8:
            _context.prev = 8;
            _context.t0 = _context["catch"](1);
            res.status(401).json({
              error: _context.t0.message
            });

          case 11:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[1, 8]]);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}()); //Register new user

app.post("/users", /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(req, res) {
    var user, id;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            user = req.body;
            _context2.prev = 1;
            _context2.next = 4;
            return _auth["default"].registerUser(user);

          case 4:
            id = _context2.sent;
            _context2.next = 11;
            break;

          case 7:
            _context2.prev = 7;
            _context2.t0 = _context2["catch"](1);
            res.status(500).json({
              error: _context2.t0.message
            });
            return _context2.abrupt("return");

          case 11:
            res.json({
              id: id
            });

          case 12:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[1, 7]]);
  }));

  return function (_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}()); //Fetch from database storage

app.get("/storage", /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(req, res) {
    var query, db, cursor, results;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            query = String(req.query.data);
            _context3.next = 3;
            return (0, _db["default"])();

          case 3:
            db = _context3.sent;
            _context3.next = 6;
            return db.collection(query).find();

          case 6:
            cursor = _context3.sent;
            _context3.next = 9;
            return cursor.toArray();

          case 9:
            results = _context3.sent;
            res.json(results);

          case 11:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));

  return function (_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}());
app.listen(port, function () {
  console.log("Listening on ".concat(port));
}); //REST MOCK
//TO BE IMPLEMENTED
//****User interface****//
//user profile

app.get("/u", function (req, res) {
  return res.json(data.currentUser);
});
app.get("/u/:username", function (req, res) {
  return res.json(data.oneUser);
}); //available games

app.get("/games:gameName", function (req, res) {
  return res.json(data.gameDetails);
});
app.get("/games:gameName/download", function (req, res) {
  return res.json(data.gameDetails.fileForDownload);
}); //scoreboard

app.get("/games/:gameName/scoreboard", function (req, res) {
  return res.json(data.game.scoreboard);
}); //****Admin interface****/
//add new post

app.post("/post", function (req, res) {
  res.statusCode = 201;
  res.setHeader("Location", "/posts/21");
  res.send();
}); //add new game details

app.post("/games", function (req, res) {
  res.statusCode = 201;
  res.setHeader("Location", "/games/newGameName");
  res.send();
}); //+ backend dio za povezivanje/autentifikaciju/modulaciju podataka unutar same Unity igre