const cheerio = require('cheerio');
const request = require('request');

async function scrapePackages (count) {
  const queries = findQueries(count);
  const htmlArray = [];
  let parsedHtml = [];
  for (let i = 0; i < queries.length; i++) {
    htmlArray.push(await makeRequest(queries[i]));
  }

  for (let i = 0; i < htmlArray.length; i++) {
    parsedHtml = parsedHtml.concat(await parseHtml(htmlArray[i]));
  }
  // console.log('parsed: ',parsedHtml.slice(0, count));
  return parsedHtml.slice(0, count);
}

function makeRequest(currCount) {
  return new Promise((resolve, reject) => {
    request(`https://www.npmjs.com/browse/depended?offset=${currCount}`, (err, response, html) => {
      if (err) return reject('error occurred');
      resolve(html);
    });
  });
}

function parseHtml(html) {
  const data = [];
  let $ = cheerio.load(html);
  // scrape for the name and rank of dependencies
  $('main').find('div > div > section > div > div > a').each((idx, el) => {
      const currPackage = {
        name: $(el).text()
      }
      // push the created object of each package into the data array
      data.push(currPackage);
  });
  // now grab the version for each of the packages and save in the package object
  $('main').find('div > div > section > div > div > span').each((idx, el) => {
      const spanText = $(el).text();
      const currVersion = spanText.split(' ')[1];
      data[idx]['version'] = currVersion;
  });
  // console.log('data: ',data);
  return data;
}

function findQueries(count) {
// this func returns an array of all the urls needed
  const urlArray = [0];
  let amount = Math.ceil(count / 36);
  // console.log(amount);
  let packageNum = 36;
  for (let i = 0; i < amount; i++) {
    urlArray.push(packageNum);
    packageNum += 36;
  }
  return urlArray;
}

module.exports = scrapePackages;
scrapePackages(39);
