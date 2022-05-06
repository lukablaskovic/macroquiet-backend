import mongo from "mongodb";

let connection_string =
  "mongodb+srv://admin:6VKpRNUZ2cvEY9xK@cluster0.bhxeo.mongodb.net/stranded-away";
let client = new mongo.MongoClient(connection_string, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log("Database connected successfully!");
  // za sada ništa nećemo raditi, samo zatvaramo pristup sljedećom naredbom
  client.close();
});
