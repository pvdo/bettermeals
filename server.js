const express = require("express"); //Load Express.js
const app = express();
const ds = require("./data.js"); //Load data.js
const expressHB = require("express-handlebars"); //Load Express hbs

const HTTP_PORT = process.env.PORT || 8080; //

function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}

// -----SET UP HANDLEBARS

app.set("views", "./views");
app.engine(".hbs", expressHB({ extname: "hbs" })); //Setting up rendering engine

app.set("view engine", ".hbs");

// ------Access to images

app.use(express.static("public"));
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

// ------- Respond to the submitted forms
app.post("/loginSub", (req, res) => {
  res.redirect("/");
});

app.post("/registrationSub", (req, res) => {
  res.redirect("/");
});

// app.use((req, res) => {
//   res.status(404).sendFile(path.join(__dirname, "./views/notFound.html"));
// });

app.listen(HTTP_PORT, onHttpStart);
