//LOGIN VALIDATION
module.exports.login = (body) => {
  return new Promise((resolve, reject) => {
    var returnObj = {
      email: body.logEmail,
      pass: body.logPassword,
      emailError: false,
      passError: false,
    };
    //Check email && password
    if (!body.logEmail && !body.logPassword) {
      returnObj.emailError = true;
      returnObj.passError = true;
      reject(returnObj);
      return;
    }
    //Check email
    if (body.logEmail == "") {
      returnObj.emailError = true;
      reject(returnObj);
      return;
    }
    //Check Password
    if (!body.logPassword) {
      returnObj.passError = true;
      reject(returnObj);
      return;
    }
    //All good
    if (body.logEmail && body.logPassword) {
      returnObj.emailError = false;
      returnObj.passError = false;
      resolve();
      return;
    }
  });
};

//REGISTER VALIDATION
module.exports.register = (body) => {
  return new Promise((resolve, reject) => {
    var returnObj = {
      //Values
      clerk: body.clerk,
      fname: body.fName,
      lname: body.lName,
      email: body.regEmail,
      pass: body.regPass,
      repeatPass: body.repeatPass,
      //Errors Flags
      fnameError: false,
      lnameError: false,
      emailError: {
        empty: false,
        isEmail: false,
      },
      passError: {
        box: false,
        empty: false,
        charLength: false,
        capital: false,
        digit: false,
        specialChar: false,
      },
      repeatPassError: false,
    };

    var flag = false;
    //Check First Name is empty
    if (!returnObj.fname) {
      returnObj.fnameError = true;
      flag = true;
    }
    //Check Last Name is empty
    if (!body.lName) {
      returnObj.lnameError = true;
      flag = true;
    }
    //Check email is empty
    if (!body.regEmail) {
      returnObj.emailError.empty = true;
      flag = true;
    }
    //Check if it is an email
    if (!body.regEmail.match(/[\w-]+@([\w-]+\.)+[\w-]+/)) {
      returnObj.emailError.isEmail = true;
      flag = true;
    }
    //Check password is empty
    if (!body.regPass) {
      returnObj.passError.empty = true;
      returnObj.passError.box = true;
      flag = true;
    }
    //Check password length
    if (body.regPass.length < 8) {
      returnObj.passError.charLength = true;
      returnObj.passError.box = true;
      flag = true;
    }
    //Check password have Capital letter
    if (!body.regPass.match(/[A-Z]/)) {
      returnObj.passError.capital = true;
      returnObj.passError.box = true;
      flag = true;
    }
    //Check password have digit
    if (!body.regPass.match(/[0-9]/)) {
      returnObj.passError.digit = true;
      returnObj.passError.box = true;
      flag = true;
    }
    //Check password have special character
    if (!body.regPass.match(/[!@#\$%\^\&*\)\(?]/)) {
      returnObj.passError.specialChar = true;
      returnObj.passError.box = true;
      flag = true;
    }
    //Check if the password is repeated
    if (!body.repeatPass.match(body.regPass)) {
      returnObj.repeatPassError = true;
      flag = true;
    }

    if (flag == true) {
      reject(returnObj);
      return;
    } else {
      resolve(returnObj);
      return;
    }
  });
};

// ADD MEAL VALIDATION
module.exports.package = (body) => {
  return new Promise((resolve, reject) => {
    var returnObj = {
      //Values
      packageTitle: body.packageTitle,
      price: body.price,
      synopsis: body.synopsis,
      category: body.category,
      numberOfMeals: body.numberOfMeals,
      top: body.top,
      image: body.image,
      //Errors Flags
      nameError: false,
      priceError: false,
      priceErrorNumber: false,
      priceErrorAbove: false,
      descriptionError: false,
      categoryError: false,
      imageError: false,
      numberErrorAbove: false,
      numberError: false,
      success: false,
    };

    var flag = false;
    //Check Name is empty
    if (!returnObj.packageTitle) {
      returnObj.nameError = true;
      flag = true;
    }
    //Check Price is empty
    if (!body.price) {
      returnObj.priceError = true;
      flag = true;
    }
    //Check Price is a number above 0
    if (body.price <= 0 || !body.price.match(/^\$?\d+(,\d{3})*(\.\d*)?$/)) {
      returnObj.priceErrorAbove = true;
      flag = true;
    }
    //Check Description
    if (!body.synopsis) {
      returnObj.descriptionError = true;
      flag = true;
    }
    //Check Category
    if (!body.category) {
      returnObj.categoryError = true;
      flag = true;
    }
    if (!body.image) {
      returnObj.imageError = true;
      flag = true;
    }
    //Check number of meals
    if (!body.numberOfMeals > 0) {
      returnObj.numberErrorAbove = true;
      flag = true;
    }
    if (flag == true) {
      reject(returnObj);
      return;
    } else {
      returnObj.success = true;
      resolve(returnObj);
      return;
    }
  });
};

// module.exports.getData = function () {
//   var meals = [
//     {
//       image: "images/salmon.jpg",
//       alt: "salmon",
//       mealTitle: "Keto",
//       price: "$160",
//       category: "Low-Carb",
//       numberOfMeals: "14",
//       synopsis: "Low-carb meals, get fit faster!",
//       top: true,
//       package: true,
//     },
//     {
//       image: "images/small/beef.jpg",
//       alt: "beef",
//       mealTitle: "Paleo",
//       price: "$160",
//       category: "Low-Carb",
//       numberOfMeals: "14",
//       synopsis: "Hunter-gather diet. Plan focus to gain muscle",
//       top: false,
//       package: true,
//     },
//     {
//       image: "images/small/mediterranean.jpg",
//       alt: "fish and vegetables",
//       mealTitle: "Mediterranean",
//       price: "$150",
//       category: "Plant-Based",
//       numberOfMeals: "14",
//       synopsis: "Meal plan rich in vegetables and whole grains",
//       top: true,
//       package: true,
//     },
//     {
//       image: "images/vegan.jpg",
//       alt: "vegan plate",
//       mealTitle: "Vegan",
//       price: "$140",
//       category: "Plant-Based",
//       numberOfMeals: "14",
//       synopsis: "All meals prepared with no-animal ingredients",
//       top: true,
//       package: true,
//     },
//     {
//       image: "images/detox.jpg",
//       alt: "vegetable cream",
//       mealTitle: "One Week Detox",
//       price: "$75",
//       category: "Special-Meal-Plans",
//       numberOfMeals: "7",
//       synopsis: "Temporary diet to clean your body from toxins",
//       top: true,
//       package: true,
//     },
//     {
//       image: "images/soup.jpg",
//       alt: "soup",
//       mealTitle: "Soup",
//       price: "$95",
//       category: "Special-Meal-Plans",
//       numberOfMeals: "14",
//       synopsis: "Specialty diet for those who can't take in solid food",
//       top: false,
//       package: true,
//     },
//     {
//       image: "images/soup.jpg",
//       alt: "soup",
//       mealTitle: "Soup",
//       price: "$10",
//       category: "Special-Meal-Plans",
//       numberOfMeals: "14",
//       synopsis: "Specialty diet for those who can't take in solid food",
//       top: false,
//       package: false,
//     },
//   ];

//   return meals;
// };
