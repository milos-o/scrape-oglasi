const express = require("express");
const getWebsiteContent = require("./scraper");
const cron = require("./cron");
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Go to /nekretnine and scraping will be initiated");
})


app.get("/nekretnine", async function (req, res) {
  cron()
  const result = await getWebsiteContent();
  res.send(result);
  
})

app.listen(PORT, (err, data) => {
  if (!err) console.log("Connected")
})

process.on("unhandledRejection", err => {
  console.log(err);
  process.exit(1);
});