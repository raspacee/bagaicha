import dotenv from "dotenv";
//dotenv.config({ path: __dirname + "../../.env" });
dotenv.config();
import { v4 as uuidv4 } from "uuid";
import { Pool } from "pg";

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT!),
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
});

const data = [
  {
    food: ["Sushi Rolls", "California Roll", "Dragon Roll"],
    review:
      "I love sushi rolls! The freshness of the fish combined with the sticky rice and seaweed wrap is just perfect. My favorite is the spicy tuna roll with a hint of wasabi. Every bite is a burst of flavor!",
    created_at: "2024-04-09 08:12:34",
  },
  {
    food: ["Pasta Carbonara", "Spaghetti Bolognese", "Fettuccine Alfredo"],
    review:
      "Pasta carbonara is my go-to comfort food. The creamy sauce, crispy bacon, and Parmesan cheese blend together beautifully. It's simple yet incredibly satisfying.",
    created_at: "2024-04-07 14:45:21",
  },
  {
    food: ["Chicken Tikka Masala", "Butter Chicken", "Chicken Korma"],
    review:
      "Chicken tikka masala is a flavor explosion! The tender chicken in the creamy tomato-based sauce with aromatic spices is a delight for the taste buds. Pair it with naan bread for a perfect meal.",
    created_at: "2024-04-08 17:23:45",
  },
  {
    food: [
      "Chocolate Chip Cookies",
      "Oatmeal Raisin Cookies",
      "Double Chocolate Brownies",
    ],
    review:
      "Chocolate chip cookies are a classic treat that never gets old. The gooey chocolate chunks, soft texture, and hint of vanilla make them irresistible. Perfect with a glass of cold milk!",
    created_at: "2024-04-05 10:56:32",
  },
  {
    food: ["Pho", "Banh Mi", "Spring Rolls"],
    review:
      "Pho is my go-to soup on a chilly day. The flavorful broth, tender rice noodles, and fresh herbs create a harmonious bowl of goodness. I love adding a squeeze of lime and a dash of Sriracha for an extra kick.",
    created_at: "2024-04-12 20:30:15",
  },
  {
    food: ["Mango Sticky Rice", "Coconut Ice Cream", "Thai Mango Salad"],
    review:
      "Mango sticky rice is a heavenly dessert! The sweet, ripe mango slices atop a bed of sticky rice drizzled with coconut milk is a tropical delight. It's a perfect balance of flavors and textures.",
    created_at: "2024-04-06 12:18:57",
  },
  {
    food: ["Avocado Toast", "Egg Benedict", "Smashed Avocado Bruschetta"],
    review:
      "Avocado toast is my favorite breakfast option. The creamy avocado spread on toasted bread with a sprinkle of salt and pepper is simple yet so delicious. I often add a poached egg on top for extra protein.",
    created_at: "2024-04-09 09:40:02",
  },
  {
    food: ["Steak Frites", "Beef Wellington", "Ribeye Steak"],
    review:
      "Steak frites is a classic French dish that never disappoints. The juicy steak cooked to perfection with crispy fries on the side is a carnivore's dream. A glass of red wine complements it perfectly.",
    created_at: "2024-04-11 16:04:29",
  },
  {
    food: ["Hummus and Pita", "Falafel Platter", "Baba Ganoush"],
    review:
      "Hummus and pita is my go-to snack. The creamy hummus with a drizzle of olive oil and a sprinkle of paprika paired with warm, fluffy pita bread is a match made in heaven. Healthy and delicious!",
    created_at: "2024-04-07 13:25:50",
  },
  {
    food: ["Tacos Al Pastor", "Carnitas Tacos", "Fish Tacos"],
    review:
      "Tacos al pastor are a burst of Mexican flavors! The marinated pork, pineapple, onions, and cilantro stuffed in a warm corn tortilla are a party in my mouth. I can never have just one!",
    created_at: "2024-04-05 18:55:42",
  },
  {
    food: ["Caprese Salad", "Greek Salad", "Caesar Salad"],
    review:
      "Caprese salad is a refreshing and vibrant dish. The ripe tomatoes, fresh mozzarella, basil leaves, and balsamic glaze create a perfect harmony of flavors. It's light, healthy, and full of summer vibes.",
    created_at: "2024-04-08 10:12:07",
  },
  {
    food: ["Pad Thai", "Tom Yum Soup", "Green Curry"],
    review:
      "Pad Thai is a Thai cuisine favorite of mine. The stir-fried rice noodles with tofu, shrimp, peanuts, and tangy tamarind sauce are a flavor explosion. It's sweet, savory, and addictive!",
    created_at: "2024-04-10 15:39:18",
  },
  {
    food: ["Eggplant Parmesan", "Vegetable Lasagna", "Mushroom Risotto"],
    review:
      "Eggplant parmesan is a hearty and comforting dish. The breaded and fried eggplant slices layered with marinara sauce and melted cheese are pure comfort food. It's a vegetarian delight!",
    created_at: "2024-04-13 08:07:53",
  },
  {
    food: ["Sushi Sashimi Platter", "Nigiri Sushi", "Rainbow Roll"],
    review:
      "A sushi sashimi platter is a sushi lover's dream come true. The fresh slices of raw fish, delicate wasabi, soy sauce, and pickled ginger create a symphony of flavors and textures. It's a feast for the senses!",
    created_at: "2024-04-12 09:15:27",
  },
  {
    food: ["Gnocchi", "Ravioli", "Penne Alla Vodka"],
    review:
      "Gnocchi is a pillowy pasta delight. The soft potato dumplings tossed in a rich sauce, whether it's tomato-based or creamy, are incredibly satisfying. It's a dish that feels like a warm hug.",
    created_at: "2024-04-11 13:59:08",
  },
  {
    food: ["Korean BBQ", "Bibimbap", "Kimchi Fried Rice"],
    review:
      "Korean BBQ is a must-try culinary experience. The marinated meats grilled at the table with ssamjang sauce, kimchi, and lettuce wraps create a fun and interactive dining experience. It's flavorful and memorable.",
    created_at: "2024-04-09 20:55:40",
  },
  {
    food: ["Croissant", "Pain Au Chocolat", "Danish Pastry"],
    review:
      "A fresh croissant is pure bliss. The buttery, flaky layers and delicate texture make it a perfect pastry for breakfast or a midday treat. Pair it with a cup of coffee for the ultimate indulgence.",
    created_at: "2024-04-07 17:23:12",
  },
  {
    food: ["Shrimp Scampi", "Lobster Bisque", "Seafood Paella"],
    review:
      "Shrimp scampi is a seafood lover's delight. The tender shrimp sautéed in garlic, butter, white wine, and lemon juice served over pasta or crusty bread is a burst of Mediterranean flavors. Simply delicious!",
    created_at: "2024-04-10 10:46:55",
  },
  {
    food: ["Falafel Wrap", "Vegetarian Pizza", "Quinoa Bowl"],
    review:
      "A falafel wrap is my go-to vegetarian meal. The crispy falafel balls, fresh vegetables, creamy tahini sauce, and warm pita bread make it a filling and flavorful option. It's healthy and satisfying!",
    created_at: "2024-04-08 14:09:36",
  },
  {
    food: ["Margarita Pizza", "Pepperoni Pizza", "Vegetarian Pizza"],
    review:
      "A margarita pizza is a classic Italian favorite. The simple combination of fresh tomato sauce, mozzarella cheese, basil leaves, and a drizzle of olive oil on a thin crust is a timeless culinary delight. Buon appetito!",
    created_at: "2024-04-11 19:28:41",
  },
  {
    food: ["Ramen", "Udon Noodles", "Miso Soup"],
    review:
      "Ramen is my ultimate comfort food. The savory broth, chewy noodles, tender pork, and soft-boiled egg create a bowl of warmth and satisfaction. It's a hug in a bowl!",
    created_at: "2024-04-06 22:11:07",
  },
  {
    food: ["Fish and Chips", "Fish Tacos", "Fried Shrimp"],
    review:
      "Fish and chips are a British classic! The crispy battered fish, golden fries, and tartar sauce are a perfect combination. Best enjoyed by the seaside!",
    created_at: "2024-04-05 16:39:20",
  },
  {
    food: ["Cheeseburger", "Double Cheeseburger", "Bacon Cheeseburger"],
    review:
      "A juicy cheeseburger is my guilty pleasure. The succulent beef patty, melted cheese, fresh lettuce, tomato, and a toasted bun create a burger heaven. Add some fries on the side for a complete meal.",
    created_at: "2024-04-10 06:57:02",
  },
  {
    food: ["Lasagna", "Stuffed Shells", "Meatball Sub"],
    review:
      "Lasagna is a hearty and comforting Italian dish. The layers of pasta, rich meat sauce, creamy ricotta cheese, and melted mozzarella are a symphony of flavors. It's a family favorite!",
    created_at: "2024-04-11 11:30:44",
  },
  {
    food: ["Ice Cream Sundae", "Banana Split", "Chocolate Sundae"],
    review:
      "An ice cream sundae is a sweet treat! The combination of creamy ice cream, delicious toppings, and a drizzle of syrup creates a delightful dessert experience. Perfect for indulging!",
    created_at: "2024-04-09 15:20:12",
  },
  {
    food: ["Beef Stroganoff", "Chicken Alfredo", "Vegetable Stir Fry"],
    review:
      "Beef stroganoff is a comforting dish. The tender beef strips in a creamy sauce served over noodles or rice are a hearty and satisfying meal. It's classic comfort food at its best.",
    created_at: "2024-04-06 18:04:37",
  },
  {
    food: ["Tiramisu", "Creme Brulee", "Chocolate Mousse"],
    review:
      "Tiramisu is a classic Italian dessert. The layers of espresso-soaked ladyfingers, mascarpone cheese, and cocoa powder create a rich and indulgent treat. It's a perfect ending to a meal!",
    created_at: "2024-04-12 12:59:23",
  },
  {
    food: ["Bagel with Lox", "Egg and Cheese Bagel", "Everything Bagel"],
    review:
      "A bagel with lox is a delicious breakfast choice. The combination of smoked salmon, cream cheese, and a toasted bagel is a perfect start to the day. Add some capers and red onion for extra flavor!",
    created_at: "2024-04-10 09:18:56",
  },
  {
    food: ["Pancakes", "Waffles", "French Toast"],
    review:
      "Pancakes are a breakfast favorite. The fluffy stacks drizzled with maple syrup and topped with butter are a delightful morning treat. Add some berries or chocolate chips for extra deliciousness!",
    created_at: "2024-04-08 07:35:19",
  },
  {
    food: ["Ceviche", "Shrimp Cocktail", "Oysters Rockefeller"],
    review:
      "Ceviche is a refreshing seafood dish. The marinated fish or shrimp in citrus juices with onions, cilantro, and peppers create a tangy and flavorful appetizer. It's perfect for a summer day!",
    created_at: "2024-04-07 19:42:05",
  },
  {
    food: ["Mousse Au Chocolat", "Creme Caramel", "Apple Tart"],
    review:
      "Mousse au chocolat is a decadent dessert. The silky smooth chocolate mousse melts in your mouth, leaving a rich and satisfying taste. It's a must-try for chocolate lovers!",
    created_at: "2024-04-06 14:02:37",
  },
  {
    food: ["Chicken Caesar Salad", "Cobb Salad", "Greek Salad"],
    review:
      "Chicken Caesar salad is a classic choice. The crisp romaine lettuce, grilled chicken, Parmesan cheese, and Caesar dressing create a flavorful and satisfying salad. It's perfect for lunch or a light dinner!",
    created_at: "2024-04-05 22:45:28",
  },
  {
    food: ["Beef Tacos", "Carnitas Burrito", "Quesadillas"],
    review:
      "Beef tacos are a favorite Mexican dish. The seasoned beef, fresh toppings, and warm tortillas create a delicious and satisfying meal. Add some salsa and guacamole for extra flavor!",
    created_at: "2024-04-11 04:18:09",
  },
];

const places_id = [
  "d2c8a653-fc2c-41b9-9e00-894525ea0c54",
  "735f31bc-d1fa-421e-b7c5-d97d4541b888",
  "0d8cc1ff-5b72-49c2-8d52-bade9dfe1884",
  "1cbb4d00-e19c-4395-88ff-66409f236a2b",
  "0880664b-d21e-41c4-971f-57ba7dbc7b64",
  "67814f2d-b1a2-4d7b-8b18-c4b83588bb88",
  "f6dd490f-1ed5-4cbe-8cbb-eb81d51f838b",
  "31d4ab2d-37fa-4e2c-97ea-49e8b0d45ab0",
  "25aad2e4-fef4-4db3-bcba-b21de5223214",
];

const users_id = [
  "3507c576-76f4-4313-9ddb-a2095738b5b0",
  "e70fb7d1-ebe3-4cb7-a250-359f9646f47b",
  "e5ef7530-9551-4985-b630-6963240bda14",
  "53046ac0-a8e1-4e59-a1e0-6a8536f7f9c0",
];

const pictures_url = [
  "https://res.cloudinary.com/dqiqiczlk/image/upload/v1712744937/dub6gcp7xqu14hp1klnl.jpg",
  "https://res.cloudinary.com/dqiqiczlk/image/upload/v1712996938/hx9lqmxpdbz5jb8rwmmt.jpg",
  "https://res.cloudinary.com/dqiqiczlk/image/upload/v1712997209/zvz2nd86ryancto4b7u0.webp",
  "https://res.cloudinary.com/dqiqiczlk/image/upload/v1712997120/frxrrv8wmkigluy6rih3.jpg",
];

const main = async () => {
  for (let i = 0; i < data.length; i++) {
    const like_count = Math.floor(Math.random() * 1000) + 1;
    const rating = Math.floor(Math.random() * 5) + 1;
    const post_id = uuidv4();
    const author_id = users_id[Math.floor(Math.random() * users_id.length)];
    const place_id = places_id[Math.floor(Math.random() * places_id.length)];
    const picture_url =
      pictures_url[Math.floor(Math.random() * pictures_url.length)];
    let text =
      "insert into review (id, author_id, body, rating, picture, place_id, \
        foods_ate, created_at, like_count) values ($1, $2, $3, $4, $5, $6, $7, $8, $9)";
    let values = [
      post_id,
      author_id,
      data[i].review,
      rating.toString(),
      picture_url,
      place_id,
      data[i].food,
      data[i].created_at,
      like_count,
    ];
    await pool.query(text, values);
    console.log(`Inserted review no. ${i}`);
  }
};

main();
