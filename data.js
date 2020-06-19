module.exports.getData = function () {
  var meals = [
    {
      image: "images/salmon.jpg",
      mealTitle: "Keto",
      price: "$160",
      category: "Low-Carb",
      numberOfMeals: "14",
      synopsis: "Low-carb meals, get fit faster!",
      top: true,
    },
    {
      image: "images/small/beef.jpg",
      mealTitle: "Paleo",
      price: "$160",
      category: "Low-Carb",
      numberOfMeals: "14",
      synopsis: "Hunter-gather diet. Plan focus to gain muscle",
      top: false,
    },
    {
      image: "images/small/mediterranean.jpg",
      mealTitle: "Mediterranean",
      price: "$150",
      category: "Plant-Based",
      numberOfMeals: "14",
      synopsis: "Meal plan rich in vegetables and whole grains",
      top: true,
    },
    {
      image: "images/vegan.jpg",
      mealTitle: "Vegan",
      price: "$140",
      category: "Plant-Based",
      numberOfMeals: "14",
      synopsis: "All meals prepared with no-animal ingredients",
      top: true,
    },
    {
      image: "images/detox.jpg",
      mealTitle: "One Week Detox",
      price: "$75",
      category: "Special-Meal-Plans",
      numberOfMeals: "7",
      synopsis: "Temporary diet to clean your body from toxins",
      top: true,
    },
    {
      image: "images/soup.jpg",
      mealTitle: "Soup",
      price: "$95",
      category: "Special-Meal-Plans",
      numberOfMeals: "14",
      synopsis: "Specialty diet for those who can't take in solid food",
      top: false,
    },
  ];

  return meals;
};
