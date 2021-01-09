const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const chalk = require("chalk");
const writeStream = fs.createWriteStream("Accommodation.csv");
writeStream.write(`Id,   Url,   Naslov,   Vrsta,   Podrucje,   Oglasio,   Mobilni,   Zadnja Promjena,   Slika, Opis\n`);

const parsedResults = [];
const linkovi = [];
let pageCounter = 0;
let resultCount = 0;
const url = `https://www.realitica.com/?cur_page=${pageCounter}&for=Najam&pZpa=Crna+Gora&pState=Crna+Gora&type%5B%5D=&lng=hr`;
/*
console.log(
  chalk.yellow.bgBlue(
    `\n  Scraping of ${chalk.underline.bold(url)} initiated...\n`
  )
);
*/
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

    if (nextPageLink === undefined) {//pageCounter === pageLimit
      exportResults(parsedResults);
      return false;
    }

    getWebsiteContent(nextPageLink);
  } catch (error) {
    exportResults(parsedResults);
    console.error(error);
  }
};

const exportResults = (parsedResults) => {
  parsedResults.forEach((element) => {
    axios.get(element).then((response) => {
      const $ = cheerio.load(response.data);
     
      let tekst = $("body").find("#listing_body").text();
      let slike = $("body").find("#rea_blueimp > a > img").attr("src");
      let nizSlika = [];
      nizSlika.push(slike);
     
      const url = element;
      let naslov = $("body").find("h2").text();
      naslov = naslov.replace(/[^a-zA-Z0-9]/g, " ");
      const oglasio = $("body").find("#aboutAuthor > a").text();
      const mobilni = $("body").find("#aboutAuthor").text();
      let res = element.split("/");
      const id = res[5];
      const broj = brojTelefona(mobilni);
      let opisTekst = opisTeksta(tekst);
      opisTekst = opisTekst.replace(/[^a-zA-Z0-9]/g, " ");
      const podrucje = podrucjeText(tekst);
      const divDatum = $("body").find("#listMap").next().text();
      const zadnjaPromjena = datum(divDatum);
      const vrsta = vrstaOglasa(tekst);
    //  fs.createWriteStream('accounts.csv', { flags: 'a' });
      // Write Row To CSV
      writeStream.write(
        `${id}, ${url}, ${naslov}, ${vrsta}, ${podrucje}, ${oglasio}, ${broj}, ${zadnjaPromjena}, ${nizSlika}, ${opisTekst} \n`
      );
    });
  });
};

const appendNewItem = (url) => {
  axios.get(url).then((response) => {
    const $ = cheerio.load(response.data);
   
    let tekst = $("body").find("#listing_body").text();
    let slike = $("body").find("#rea_blueimp > a > img").attr("src");
    let nizSlika = [];
    nizSlika.push(slike);
   
    const url = element;
    let naslov = $("body").find("h2").text();
    naslov = naslov.replace(/[^a-zA-Z0-9]/g, " ");
    const oglasio = $("body").find("#aboutAuthor > a").text();
    const mobilni = $("body").find("#aboutAuthor").text();
    let res = element.split("/");
    const id = res[5];
    const broj = brojTelefona(mobilni);
    let opisTekst = opisTeksta(tekst);
    opisTekst = opisTekst.replace(/[^a-zA-Z0-9]/g, " ");
    const podrucje = podrucjeText(tekst);
    const divDatum = $("body").find("#listMap").next().text();
    const zadnjaPromjena = datum(divDatum);
    const vrsta = vrstaOglasa(tekst);
    
    // Write Row To CSV
    writeStream.append(
      `${id}, ${url}, ${naslov}, ${vrsta}, ${podrucje}, ${oglasio}, ${broj}, ${zadnjaPromjena}, ${nizSlika}, ${opisTekst} \n`, {flags: 'a'}
    );
  });
}

const reversedNum = num => parseFloat(num.toString().split('').reverse().join('')) * Math.sign(num); // funkcija da okrenem broj

// funkcija koja izvlaci broj iz teksta
const brojTelefona = (broj) => {
  let brojevi = [];
  let rezultat = 0;
  let br = 0;
  let regex = /\d+/;
  let temp = 1;

  for (let i = 0; i < broj.length; i++) {
    if (regex.test(broj[i])) {
      brojevi.push(broj[i]);
    }
  }

  if (brojevi[br] == 3) {
    while (br < 11) {
      rezultat = rezultat + brojevi[br] * temp;
      temp *= 10;
      br++;
    }
  } else {
    while (br < 9) {
      rezultat = rezultat + brojevi[br] * temp;
      temp *= 10;
      br++;
    }
  }
  const reversedNum = num => parseFloat(num.toString().split('').reverse().join('')) * Math.sign(num)

  return reversedNum(rezultat);
};

// opis oglasa
const opisTeksta = (string) => {
  let opisTekst = [];
  let broj = 4;
  let j;
  for (let i = 0; i < string.length; i++) {
    if (string[i] === "O") {
      if (string[broj + i] === ":") {
        j = broj + i;
        j++;
        while (j < string.length) {
          if (string[j] === ":") break;
          if(string[j] === "  " || string[j] === "\n") j++;
          opisTekst.push(string[j]);
          j++;
        }
      }
    }
  }
  const rezultat = [];
  for (let j = 0; j < opisTekst.length - 8; j++) {
    rezultat[j] = opisTekst[j];
  }
  let tekst = rezultat.join("");
  return tekst.replace(/\r?\n|\r/g, " ");
};
// podrucje oglasa
const podrucjeText = (string) => {
  let opisTekst = [];
  let broj = 8;
  let j;
  let ind = 0;
  for (let i = 0; i < string.length; i++) {
    if (string[i] === "P") {
      if (string[broj + i] === ":") {
        j = broj + i;
        j++;
        ind++;
        while (j < string.length) {
          if (string[j] === ":") {
            break;
          } else {
            opisTekst.push(string[j]);
            j++;
          }
        }
        if (ind > 0) break;
      }
    }
  }

  const rezultat = [];
  for (let j = 0; j < opisTekst.length - 8; j++) {
      if(opisTekst[j] === ",")
          j++;

        rezultat[j] = opisTekst[j];
  }
  let tekst = rezultat.join("");
  return tekst;
};
// zadnji datum promjene oglasa
const datum = (string) => {
let opisTekst = [];
let broj = 8;
let j;
let ind = 0;
for (let i = 0; i < string.length; i++) {
  if (string[i] === "P") {
    if (string[broj + i] === ":") {
      j = broj + i;
      j++;
      ind++;
      while (j < string.length) {
        if (string[j] === ":") {
          break;
        } else {
          opisTekst.push(string[j]);
          j++;
        }
      }
      if (ind > 0) break;
    }
  }
}

const rezultat = [];
for (let j = 0; j < opisTekst.length - 4; j++) {
  rezultat[j] = opisTekst[j];
}
let tekst = rezultat.join("");
tekst = tekst.replace(/[^a-zA-Z0-9]/g, " ")
return tekst;
}
// vrsta oglasa
const vrstaOglasa = (string) => {
  let opisTekst = [];
let broj = 5;
let j;
let ind = 0;
for (let i = 0; i < string.length; i++) {
  if (string[i] === "V") {
    if (string[broj + i] === ":") {
      j = broj + i;
      j++;
      ind++;
      while (j < string.length) {
        if (string[j] === ":") {
          break;
        } else {
          opisTekst.push(string[j]);
          j++;
        }
      }
      if (ind > 0) break;
    }
  }
}

const rezultat = [];
for (let j = 0; j < opisTekst.length - 8; j++) {
  rezultat[j] = opisTekst[j];
}
let tekst = rezultat.join("");
return tekst
}

getWebsiteContent(url);

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});

module.exports = getWebsiteContent;
module.exports.appendNewItem = appendNewItem;