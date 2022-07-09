"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _db = _interopRequireDefault(require("./db.js"));

var _bcrypt = _interopRequireDefault(require("bcrypt"));

var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));

//Kreiranje indexa prilikom boot-a aplikacije
createIndexOnLoad();
var _default = {
  registerUser: function registerUser(userData) {
    return (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var db, doc, result;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return (0, _db["default"])();

            case 2:
              db = _context.sent;
              _context.t0 = userData.username;
              _context.t1 = userData.email;
              _context.next = 7;
              return encrypt(userData.password);

            case 7:
              _context.t2 = _context.sent;
              doc = {
                username: _context.t0,
                email: _context.t1,
                password: _context.t2
              };
              _context.prev = 9;
              _context.next = 12;
              return db.collection("users").insertOne(doc);

            case 12:
              result = _context.sent;

              if (!(result && result.insertedId)) {
                _context.next = 15;
                break;
              }

              return _context.abrupt("return", result.insertedId);

            case 15:
              _context.next = 23;
              break;

            case 17:
              _context.prev = 17;
              _context.t3 = _context["catch"](9);
              console.log(_context.t3);

              if (!(_context.t3.code == 11000)) {
                _context.next = 23;
                break;
              }

              console.log("ERROR 1100");
              throw new Error("User already exists!");

            case 23:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[9, 17]]);
    }))();
  },
  authenticateUser: function authenticateUser(email, password, rememberMe) {
    return (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
      var db, user, tokenDuration, token;
      return _regenerator["default"].wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return (0, _db["default"])();

            case 2:
              db = _context2.sent;
              _context2.next = 5;
              return db.collection("users").findOne({
                email: email
              });

            case 5:
              user = _context2.sent;
              _context2.t0 = user && user.password;

              if (!_context2.t0) {
                _context2.next = 11;
                break;
              }

              _context2.next = 10;
              return checkUser(password, user.password);

            case 10:
              _context2.t0 = _context2.sent;

            case 11:
              if (!_context2.t0) {
                _context2.next = 20;
                break;
              }

              delete user.password;
              tokenDuration = "1h";
              if (rememberMe) tokenDuration = "30d";
              token = _jsonwebtoken["default"].sign(user, process.env.JWT_SECRET, {
                algorithm: "HS512",
                expiresIn: tokenDuration
              });
              console.log("Successful login!");
              return _context2.abrupt("return", {
                token: token,
                email: user.email,
                username: user.username
              });

            case 20:
              throw new Error("Cannot authenticate");

            case 21:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2);
    }))();
  },
  verify: function verify(req, res, next) {
    try {
      var authorization = req.headers.authorization.split(" ");
      var type = authorization[0];
      var token = authorization[1];
      console.log(type, token);

      if (type !== "Bearer") {
        res.status(401).send(); //Ako nije  bearer, vrati 401

        return false;
      } else {
        req.jwt = _jsonwebtoken["default"].verify(token, process.env.JWT_SECRET); //Ako je sve OK, ako verify prode, exctractaj podatke u req.jwt i idi next()

        return next();
      }
    } catch (e) {
      return res.status(401).send(); //Ako dode do bilo kakvog excpetiona, vrati 401
    }
  }
};
exports["default"] = _default;

function createIndexOnLoad() {
  return _createIndexOnLoad.apply(this, arguments);
}

function _createIndexOnLoad() {
  _createIndexOnLoad = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3() {
    var db;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return (0, _db["default"])();

          case 2:
            db = _context3.sent;
            _context3.next = 5;
            return db.collection("users").createIndex({
              username: 1
            }, {
              unique: true
            });

          case 5:
            _context3.next = 7;
            return db.collection("users").createIndex({
              email: 1
            }, {
              unique: true
            });

          case 7:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));
  return _createIndexOnLoad.apply(this, arguments);
}

var saltRounds = 10;

function encrypt(_x) {
  return _encrypt.apply(this, arguments);
}

function _encrypt() {
  _encrypt = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(plainTextPassword) {
    var hashedPassword;
    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.next = 2;
            return _bcrypt["default"].hash(plainTextPassword, saltRounds);

          case 2:
            hashedPassword = _context4.sent;
            return _context4.abrupt("return", hashedPassword);

          case 4:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));
  return _encrypt.apply(this, arguments);
}

function checkUser(_x2, _x3) {
  return _checkUser.apply(this, arguments);
}

function _checkUser() {
  _checkUser = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5(password, passwordHash) {
    var match;
    return _regenerator["default"].wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.next = 2;
            return _bcrypt["default"].compare(password, passwordHash);

          case 2:
            match = _context5.sent;
            console.log(match);
            return _context5.abrupt("return", match);

          case 5:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5);
  }));
  return _checkUser.apply(this, arguments);
}