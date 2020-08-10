// GITHUB: https://github.com/pvdo/bettermeals
// HEROKU: https://evening-tor-00537.herokuapp.com

const express = require("express"); //Load Express.js
const path = require("path");
const app = express();
const ds = require("./data.js"); //Load data.js
const db = require("./db.js"); //Load db.js
const cart = require("./cart"); //Load cart.js
const expressHB = require("express-handlebars"); //Load Express hbs
const bodyParser = require("body-parser"); //Load body-parser middleware
const multer = require("multer");
const mongoose = require("mongoose"); //Load mongooseDB
var nodemailer = require("nodemailer"); //Load node mailer
const session = require("express-session");
const { resolveContent } = require("nodemailer/lib/shared");
const MongoStore = require("connect-mongo")(session);
const bcrypt = require("bcryptjs");

// ---- SET UP MULTER STORAGE
const storage = multer.diskStorage({
  destination: "./public/images/",
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// ----SETUP IMAGE FILTER TO ACCEPT JUST IMAGES FILES
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    return cb(null, true);
  } else {
    return cb(
      new Error(
        "Not an image extension! Please, upload .png, .jpg, .jpeg, .tiff, .svg",
        400
      ),
      false
    );
  }
};
// ----EMAIL AUTHENTICATION
var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "bettermealsfake@gmail.com",
    pass: "Senha1234",
  },
});
// ---MULTER STORAGE
const upload = multer({ storage: storage, fileFilter: imageFilter });

// ----SET UP MONGO DB
var connection = mongoose.createConnection(
  "mongodb+srv://dbUser:dbBetterMeals@bettermeals.u3pql.mongodb.net/BetterMeals?retryWrites=true&w=majority",
  { useNewUrlParser: true, useUnifiedTopology: true }
);
const sessionStore = new MongoStore({
  mongooseConnection: connection,
  collection: "sessions",
});

// catch db error
connection.on("error", (err) => {
  reject(err);
});

//open schemas
db.openSchemas(connection);

const HTTP_PORT = process.env.PORT || 8080;

function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}

// -----SETUP HANDLEBARS
app.set("views", "./views");
app.engine(".hbs", expressHB({ extname: "hbs" })); //Setting up rendering engine
app.set("view engine", ".hbs");

// ------Access to images
app.use(express.static("public"));

// ------Setup body parser
app.use(bodyParser.urlencoded({ extended: true }));

// ------Setup bodyparser to receive json from Ajax
app.use(bodyParser.json());

// ------Session config
const sess_name = "sid";
app.use(
  session({
    name: sess_name,
    secret: "secret",
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);
// ------Redirect Authenticators
// if not logged in
const redirectLogin = (req, res, next) => {
  if (!req.session.fname) {
    res.redirect("/form");
  } else {
    next();
  }
};
//if already logged in
const redirectHome = (req, res, next) => {
  if (req.session.fname) {
    res.redirect("/");
  } else {
    next();
  }
};

// ------ ROUTING
// --------------------------GETS

//HOME
app.get("/", (req, res) => {
  if (!req.session.cartData) {
    req.session.cartData = {
      cart: [],
      total: 0,
      counter: 0,
    };
  }
  db.getPackages().then((packageData) => {
    res.render("index", {
      package: packageData,
      user: req.session,
    });
  });
});

//PRODUCTS
app.get("/meals", (req, res) => {
  db.getPackages().then((packageData) => {
    res.render("meals", {
      package: packageData,
      user: req.session,
    });
  });
});

//PACKAGE PAGE
app.get("/package", (req, res) => {
  if (req.query.package) {
    db.getOnePackage(req.query.package)
      .then((pack) => {
        res.render("package", { data: pack[0], user: req.session });
      })
      .catch(() => {
        console.log("error");
        res.redirect("/meals");
      });
  } else {
    console.log("error no title");
    res.redirect("/meals");
  }
});

//EDIT PACKAGE
app.get("/edit", (req, res) => {
  if (req.query.package) {
    db.getOnePackage(req.query.package)
      .then((pack) => {
        res.render("editPackage", { data: pack[0], user: req.session });
      })
      .catch(() => {
        console.log("error");
        res.redirect("/dashboard/clerk/" + req.session.fname);
      });
  } else {
    console.log("error no title");
    res.redirect("/dashboard/clerk/" + req.session.fname);
  }
});

//CHECKOUT
app.get("/checkout", (req, res) => {
  cart
    .getCart()
    .then((packages) => {
      req.session.cartData.cart = packages;

      cart
        .getTotal()
        .then((total) => {
          var isEmpty = true;
          if (req.session.cartData.cart[0]) {
            isEmpty = false;
          }
          req.session.cartData.total = total;
          res.render("checkout", {
            user: req.session,
            empty: isEmpty,
          });
        })
        .catch((err) => {
          res.send("There is total error " + err);
        });
    })
    .catch((err) => {
      res.send("There is an error " + err);
    });
});

//REMOVE ITEM
app.post("/removePackage", (req, res) => {
  cart
    .removePack(req.body.name)
    .then(cart.getTotal)
    .then((inTotal) => {
      req.session.cartData.total = inTotal;
      cart
        .getCart()
        .then((packs) => {
          req.session.cartData.cart = packs;
          req.session.cartData.counter = req.session.cartData.cart.length;
          res.json({
            user: req.session,
          });
        })
        .catch((err) => {
          res.json(res.json({ error: err }));
        });
    })
    .catch((err) => {
      res.json(res.json({ error: err }));
    });
});

//DASHBOARD: CLERK AND CUSTOMER
//Redirect to the user dashboard
app.get("/dashboard/", redirectLogin, (req, res) => {
  if (req.session.clerk) {
    res.redirect("/dashboard/clerk/" + req.session.fname);
  } else {
    res.redirect("/dashboard/user/" + req.session.fname);
  }
});
app.get("/dashboard/clerk/", redirectLogin, (req, res) => {
  if (req.session.clerk) {
    res.redirect("/dashboard/clerk/" + req.session.fname);
  } else {
    res.redirect("/dashboard/user/" + req.session.fname);
  }
});
app.get("/dashboard/user/", redirectLogin, (req, res) => {
  if (req.session.clerk) {
    res.redirect("/dashboard/clerk/" + req.session.fname);
  } else {
    res.redirect("/dashboard/user/" + req.session.fname);
  }
});
app.get("/dashboard/user/:fName", redirectLogin, (req, res) => {
  res.render("user", { user: req.session });
});
app.get("/dashboard/clerk/:fName", redirectLogin, (req, res) => {
  db.getPackages().then((packageData) => {
    res.render("clerk", {
      package: packageData,
      user: req.session,
    });
  });
});

//LOGIN
app.get("/form", redirectHome, (req, res) => {
  res.render("form", { user: req.session });
});

//REGISTER
app.get("/register", redirectHome, (req, res) => {
  res.render("register", { user: req.session });
});

// --------POST
//Login post
app.post("/form", (req, res) => {
  var allCust;
  var allClerks;
  var allUsers;
  var notFound = false;
  ds.login(req.body)
    .then(db.getCustomers)
    .then((data) => {
      allCust = data;
    })
    .then(db.getClerks)
    .then((data) => {
      allClerks = data;
      allUsers = allCust.concat(allClerks);
    })
    .then(() => {
      var userFound = allUsers.find((user) => user.email === req.body.logEmail) //find user in the database by the email
        ? allUsers.find((user) => user.email === req.body.logEmail)
        : undefined;
      if (userFound && bcrypt.compare(userFound.pass, req.body.logPassword)) {
        //if password is equal
        req.session.clerk = userFound.clerk;
        req.session.fname = userFound.fname;
        req.session.lname = userFound.lname;
        req.session.email = userFound.email;
        req.session.pass = userFound.pass;

        notFound = false;
      } else {
        notFound = true;
      }
    })
    .then(() => {
      if (!notFound) {
        res.redirect("/dashboard");
      } else {
        res.render("form", { message: inData, isFound: notFound });
      }
    })
    .catch((inData) => {
      res.render("form", { message: inData, isFound: notFound });
    });
});

//----------Register Post
app.post("/register", (req, res) => {
  var alreadyRegister = false;
  var allCust;
  var allClerks;
  var allUsers;
  db.getCustomers()
    .then((data) => {
      allCust = data;
    })
    .then(db.getClerks)
    .then((data) => {
      allClerks = data;
      allUsers = allCust.concat(allClerks);
    })
    .then(() => {
      var userFound = allUsers.find((user) => user.email === req.body.regEmail)
        ? allUsers.find((user) => user.email === req.body.regEmail)
        : undefined;
      if (userFound) {
        console.log("reject");
        alreadyRegister = true;
      } else {
        console.log("resolve");
        alreadyRegister = false;
      }
    })
    .then(() => ds.register(req.body))
    .then(db.addUser)
    .then(() => {
      //SEND EMAIL
      var mailOptions = {
        from: "bettermealsfake@gmail.com",
        to: req.body.regEmail,
        subject: "Welcome " + req.body.fName,
        text:
          "We are glad you registered with us!!" +
          "\n" +
          "Lets start a new diet!!",
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log("Email sent: " + info.response);
        }
      });
      req.session.clerk = req.body.clerk;
      req.session.fname = req.body.fName;
      req.session.lname = req.body.lName;
      req.session.email = req.body.regEmail;
      req.session.pass = req.body.pass;

      //Redirect to dashboard
      if (alreadyRegister) {
        res.render("register", { reg: req.session, dbReg: alreadyRegister });
      } else {
        res.redirect("/dashboard/");
      }
    })
    .catch((inData) => {
      res.render("register", { reg: inData, dbReg: alreadyRegister });
    });
});

//------------Add Meal
app.post("/createMeal", upload.single("image"), (req, res) => {
  if (req.file != undefined) {
    req.body.image = req.file.filename;
  }
  var success = false;
  ds.package(req.body)
    .then(() => db.addPackage(req.body))
    .then(db.getPackages)
    .then((packageData) => {
      success = true;
      res.render("clerk", {
        user: req.session,
        package: packageData,
        success: success,
      });
    })
    .catch((inData) => {
      console.log(inData);
      var foundName = true;
      if (inData.packageTitle) {
        foundName = false;
      }
      db.getPackages().then((packageData) => {
        res.render("clerk", {
          user: req.session,
          package: packageData,
          data: inData,
          name: foundName,
        });
      });
    });
});

//---------- LOGOUT
app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.redirect("/home");
    }
    cart.emptyCart();
    res.clearCookie(sess_name);
    res.redirect("/");
  });
});

//-------------- ADD TO CART
app.post("/addToCart", (req, res) => {
  db.getOnePackage(req.body.name)
    .then((pack) => {
      cart
        .addPack(pack[0])
        .then((numOfPacks) => {
          req.session.cartData.counter = numOfPacks;
          res.json({ data: numOfPacks });
        })
        .catch(() => {
          res.json({ message: "error adding" });
        });
    })
    .catch(() => {
      res.json({ message: "No items found" });
    });
});

//-------------- Edit Package
app.post("/editPackage", (req, res) => {
  db.updatePackage(req.body).then(() => {
    db.getPackages().then((packageData) => {
      res.render("clerk", {
        package: packageData,
        user: req.session,
      });
    });
  });
});

//-------------- Delete Package
app.post("/deletePackage", (req, res) => {
  console.log(req.body);
  db.deletePackage(req.body).then(() => {
    db.getPackages().then((packageData) => {
      res.render("clerk", {
        package: packageData,
        user: req.session,
      });
    });
  });
});

//-------------- Place Order
app.post("/placeOrder", (req, res) => {
  var cartToBeString = req.session.cartData.cart;
  for (var i = 0; i < cartToBeString.length; i++) {
    delete cartToBeString[i]._id;
    delete cartToBeString[i].image;
    delete cartToBeString[i].__v;
    delete cartToBeString[i].top;
  }
  var cartString = JSON.stringify(cartToBeString);
  //yourOrder = cartString.replace(/"/g, "\n\n");
  yourOrder = cartString.replace(/[,]+/g, "\n");
  yourOrder = yourOrder.replace(/[{}]+/g, "\n\n");
  yourOrder = yourOrder.replace(/["[\]]+/g, " ");
  var mailOptions = {
    from: "bettermealsfake@gmail.com",
    to: req.session.email,
    subject: "Better Meals - Your order was placed!! ",
    text:
      "Thanks for order with us " +
      req.session.fname +
      "!!" +
      "\n" +
      "Your order is: " +
      "\n" +
      yourOrder +
      "\n" +
      "Total: $" +
      req.session.cartData.total,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
  req.session.cartData.cart = [];
  cart.emptyCart();

  req.session.cartData.total = 0;
  req.session.cartData.counter = 0;

  res.redirect("/dashboard");
});

//-----REDIRECT 404
app.use(function (req, res, next) {
  res.status(404);
  res.render("404", { user: req.session });
});

//------LISTEN
app.listen(HTTP_PORT, onHttpStart);
