const express = require("express"); //Load Express.js
const app = express();
const ds = require("./data.js"); //Load data.js
const expressHB = require("express-handlebars"); //Load Express hbs
const bodyParser = require("body-parser");
var nodemailer = require("nodemailer");

const HTTP_PORT = process.env.PORT || 8081; //

function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}

// -----SET UP HANDLEBARS

app.set("views", "./views");
app.engine(".hbs", expressHB({ extname: "hbs" })); //Setting up rendering engine

app.set("view engine", ".hbs");

// ------Access to images

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
// ------ ROUTING
// ------Respond the GET with the webpages

app.get("/", (req, res) => {
  var mealsData = ds.getData();
  res.render("index", { data: mealsData });
});

app.get("/meals", (req, res) => {
  var mealsData = ds.getData();
  res.render("meals", { data: mealsData });
});

app.get("/dashboard", (req, res) => {
  res.render("dashboard");
});
app.get("/form", (req, res) => {
  res.render("form");
});
app.get("/register", (req, res) => {
  res.render("register");
});
// ------- Respond to the submitted forms
// app.post("/submit", (req, res) => {
//   res.redirect("/dashboard");
// });

//Login post
app.post("/form", (req, res) => {
  ds.login(req.body)
    .then(() => {
      res.redirect("/");
    })
    .catch((inData) => {
      res.render("form", { message: inData });
    });
});

//Register Post
app.post("/register", (req, res) => {
  ds.register(req.body)
    .then((inData) => {
      //SEND EMAIL
      var transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "bettermealsfake@gmail.com",
          pass: "Senha1234",
        },
      });

      var mailOptions = {
        from: "bettermealsfake@gmail.com",
        to: req.body.regEmail,
        subject: "Welcome",
        text: "We are glad to see you here!!",
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log("Email sent: " + info.response);
        }
      });
      //Redirect to dashboard
      res.render("dashboard", { user: inData });
    })
    .catch((inData) => {
      res.render("register", { reg: inData });
    });
});

// app.use((req, res) => {
//   res.status(404).sendFile(path.join(__dirname, "./views/notFound.html"));
// });

app.listen(HTTP_PORT, onHttpStart);
