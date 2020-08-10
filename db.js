const mongoose = require("mongoose"); // load mongoose
const bcrypt = require("bcryptjs"); // load bcrypy(encryp password)

//create mongoose schema variable
let Schema = mongoose.Schema;

//Package Collection
let packageSchema = new Schema({
  image: String,
  packageTitle: {
    type: String,
    unique: true,
  },
  price: Number,
  category: String,
  numberOfMeals: Number,
  synopsis: String,
  top: Boolean,
});

//Customer Collection
let customerSchema = new Schema({
  fname: String,
  lname: String,
  email: {
    type: String,
    unique: true,
  },
  pass: String,
  clerk: Boolean,
});

//Clerk Collection
let clerkSchema = new Schema({
  fname: String,
  lname: String,
  email: {
    type: String,
    unique: true,
  },
  pass: String,
  clerk: Boolean,
});

//Variable to hold the collection connections
let Packages;
let Customers;
let Clerks;

//Open the database and the collections
module.exports.openSchemas = function (connectDB) {
  connectDB.once("open", () => {
    Packages = connectDB.model("Packages", packageSchema);
    Customers = connectDB.model("Customers", customerSchema);
    Clerks = connectDB.model("Clerks", clerkSchema);
  });
};

// ----------------------------PACKAGES FUNCTIONS--------------------------------------- //
//FIND ONE PACKAGE FROM THE DB
module.exports.getOnePackage = (packName) => {
  return new Promise((resolve, reject) => {
    Packages.find({ packageTitle: packName })
      .exec()
      .then((pack) => {
        if (pack.length != 0) {
          resolve(pack.map((item) => item.toObject()));
        }
      });
  }).catch(() => "Package not found");
};

//ADD PACKAGE
module.exports.addPackage = function (data) {
  return new Promise((resolve, reject) => {
    data.top = data.top ? true : false;

    for (var entry in data) {
      if (data[entry] == "") data[entry] = null;
    }

    var newPackage = new Packages(data);

    newPackage.save((err) => {
      if (err) {
        console.log("Error");
        var alreadyRegistered = true;
        reject(alreadyRegistered);
      } else {
        console.log("Meal " + data.packageTitle + " saved.");
        resolve();
      }
    });
  });
};

//UPDATE PACKAGE INFO
module.exports.updatePackage = function (data) {
  return new Promise((resolve, reject) => {
    console.log(data);
    if (data.top == "on") {
      data.top = true;
    }

    Packages.updateOne(
      { packageTitle: data.packageTitle },
      {
        $set: {
          price: data.price,
          synopsis: data.synopsis,
          category: data.category,
          numberOfMeals: data.numberOfMeals,
          top: data.top,
        },
      }
    )
      .exec()
      .then(() => {
        console.log("Package updated");
        resolve();
      });
  });
};

//DELETE PACKAGE
module.exports.deletePackage = function (data) {
  return new Promise((resolve, reject) => {
    console.log("Delete " + data.packageTitle);
    Packages.deleteOne({ packageTitle: data.packageTitle })
      .exec()
      .then(() => {
        console.log("Package " + data.packageTitle + " deleted");
        resolve();
      });
  });
};

// ----------------------------USERS FUNCTIONS--------------------------------------- //

//GET ALL CUSTOMERS
module.exports.getCustomers = function () {
  return new Promise((resolve, reject) => {
    Customers.find()
      .exec()
      .then((allCustomers) => {
        resolve(filteredMongoose(allCustomers));
      })
      .catch((err) => {
        console.log("Error retrieving user" + err);
        reject();
      });
  });
};

//GET ALL CLERKS
module.exports.getClerks = function () {
  return new Promise((resolve, reject) => {
    Clerks.find()
      .exec()
      .then((allClerks) => {
        resolve(filteredMongoose(allClerks));
      })
      .catch((err) => {
        console.log("Error retrieving clerk" + err);
        reject();
      });
  });
};

// GET ALL USERS
module.exports.getUsers = function () {
  return new Promise((resolve, reject) => {
    var allCust;
    var allClerks;
    var allUsers;
    getCustomers()
      .then((data) => {
        allCust = data;
      })
      .then(getClerks)
      .then((data) => {
        allClerks = data;
        allUsers = allCust.concat(allClerks);
        resolve(allUsers);
      });
  });
};
//COMPARE USER
module.exports.alreadyRegister = function (allUsers, email) {
  return new Promise((resolve, reject) => {
    var alreadyRegister;
    console.log("already Function");
    var userFound = allUsers.find((user) => user.email === email)
      ? allUsers.find((user) => user.email === email)
      : undefined;

    if (userFound) {
      console.log("reject");
      alreadyRegister = true;
      reject(this.alreadyRegister);
      return;
    } else {
      console.log("resolve");
      alreadyRegister = false;
      resolve(this.alreadyRegister);
      return;
    }
  });
};

//ADD USER(CLERK OR CUSTOMER)
module.exports.addUser = function (data) {
  return new Promise((resolve, reject) => {
    var error = false;
    data.clerk = data.clerk ? true : false;

    for (var entry in data) {
      if (data[entry] == "") data[entry] = null;
    }
    if (data.clerk) {
      var newClerk = new Clerks(data);

      bcrypt
        .genSalt(10)
        .then((salt) => bcrypt.hash(newClerk.pass, salt))
        .then((hash) => {
          newClerk.pass = hash;
          newClerk.save((err) => {
            if (err) {
              console.log(newClerk.save);
              console.log("Error");
              error = true;
              reject(error);
            } else {
              console.log("User " + data.fName + " saved.");
              resolve();
            }
          });
        })
        .catch((err) => {
          console.log(err);
          reject("Hashing error");
        });
    } else {
      var newCustomer = new Customers(data);
      bcrypt
        .genSalt(10)
        .then((salt) => bcrypt.hash(newCustomer.pass, salt))
        .then((hash) => {
          newCustomer.pass = hash;

          newCustomer.save((err) => {
            if (err) {
              console.log("Error");
              error = true;
              reject(error);
            } else {
              console.log("User " + data.fName + " saved.");
              resolve();
            }
          });
        })
        .catch((err) => {
          console.log(err);
          reject("Hashing error");
        });
    }
  });
};

module.exports.getPackages = function () {
  return new Promise((resolve, reject) => {
    Packages.find()
      .exec()
      .then((allPackages) => {
        resolve(filteredMongoose(allPackages));
      })
      .catch((err) => {
        console.log("Error retrieving meals" + err);
        reject();
      });
  });
};

const filteredMongoose = (mongooseDocuments) => {
  const tempArray = [];
  if (mongooseDocuments.length !== 0) {
    mongooseDocuments.forEach((document) => {
      var temp = document.toObject();
      temp.id = document._id.toString();
      tempArray.push(temp);
    });
  }
  return tempArray;
};
