const cron = require('node-cron');
const ScraperFile = require('./scraper');
const cheerio = require('cheerio');
const fs = require('fs'),
const csv = require('fast-csv');

const parsedResults = [];
const linkovi = [];
let pageCounter = 0;
let resultCount = 0;
const url = `https://www.realitica.com/?cur_page=${pageCounter}&for=Najam&pZpa=Crna+Gora&pState=Crna+Gora&type%5B%5D=&lng=hr`;
const path = __dirname + '/Accommodation.csv';

cron.schedule("* * * * *", function () {
    
    
let allId = [];
let csvStream = csv.parseFile("./Accommodation.csv", { headers: true })
    .on("data", function(record){
        csvStream.pause();
            let oglasId = record.Id;
            allId.push(oglasId);
      
        csvStream.resume();

    }).on("end", function(){
        console.log("Job is done!");
    }).on("error", function(err){
        console.log(err);
    });






  stats;
try {
  stats = fs.statSync(path); // da li fajl postoji
  if(stats){
    const getWebsiteContent = async (url) => {
        try {
          const response = await axios.get(url);
          const $ = cheerio.load(response.data);
          // New Lists
          $("body")
            .find("div.thumb_div > a")
            .toArray()
            .map((x) => {
              const count = resultCount++;
              const link = $(x).attr("href");
      
              parsedResults.push(link);
            });
      
          const nextPageLink = $("td.browse_tool_curpage")
            .next()
            .find("a")
            .attr("href");
          pageCounter++;
      
          if (nextPageLink === undefined) {
            exportResults(parsedResults);
            return false;
          }
      
          getWebsiteContent(nextPageLink);
        } catch (error) {
          exportResults(parsedResults);
          console.error(error);
        }
      };
      
const exportResults = (results) => {
    results.forEach(url => {
        let res = url.split("/");
        const id = res[5];
        allId.forEach( stariOglas => {
            if(stariOglas !== id){
                ScraperFile.appendNewItem(url);
            }
        })
    });
}}

    
}
catch (e) {
  console.log("File does not exist.");
}
    


});