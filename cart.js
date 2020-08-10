//empty cart
var shoppingCart = [];

//add package from db to the cart
module.exports.addPack = (inPack) => {
  return new Promise((resolve, reject) => {
    shoppingCart.push(inPack);
    resolve(shoppingCart.length);
  });
};

//Remove package
module.exports.removePack = (inPack) => {
  return new Promise((resolve, reject) => {
    console.log(shoppingCart);
    for (var i = 0; i < shoppingCart.length; i++) {
      if (shoppingCart[i].packageTitle == inPack) {
        shoppingCart.splice(i, 1);
        i = shoppingCart.length;
      }
    }
    resolve();
  });
};

//return array
module.exports.getCart = () => {
  return new Promise((resolve, reject) => {
    resolve(shoppingCart);
  });
};
//Empty cart
module.exports.emptyCart = () => {
  return new Promise((resolve, reject) => {
    shoppingCart = [];
  });
};

//Calculate the total price
module.exports.getTotal = () => {
  return new Promise((resolve, reject) => {
    var totalPrice = 0;
    if (shoppingCart) {
      shoppingCart.forEach((pack) => {
        totalPrice += pack.price;
      });
    }
    resolve(totalPrice);
  });
};
