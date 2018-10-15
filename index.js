'use strict'

module.exports = downloadPackages;

const cheerio = require('cheerio');
const request = require('request');
const download = require('download-tarball');
const getNpmTarballUrl = require('get-npm-tarball-url');
const exec = require('child_process').exec;

// array where package information will be held as objects
const data = [];

// this function scrapes the top ten most depended dependencies from the npmjs page
function scrapePackages (count) {
  return new Promise((resolve, reject) => {
    request('https://www.npmjs.com/browse/depended', (err, response, html) => {
      if (err) return reject('error occurred');
      let $ = cheerio.load(html);
      // scrape for the name and rank of dependencies
      $('main').find('div > div > section > div > div > a').each((idx, el) => {
        if (data.length < count) {
          const currPackage = {
            rank: idx+1,
            name: $(el).text()
          }
          // push the created object of each package into the data array
          data.push(currPackage);
        }
        });
        // now grab the version for each of the packages and save in the package object
        $('main').find('div > div > section > div > div > span').each((idx, el) => {
          if (idx < count) {
            const spanText = $(el).text();
            const currVersion = spanText.split(' ')[1];
            data[idx]['version'] = currVersion;
          }
      });
      resolve(data);
    });
  });
}

// this function downloads the tarball for each package and extracts them into the package directory
async function handleTarball(pkgObj) {
  const currName = pkgObj['name'];
  const currVersion = pkgObj['version']
  const url = await getNpmTarballUrl.default(currName, currVersion);

  await download({
   url: url,
   dir: `./packages/${currName}`
  }).then(() => {
   // this executable moves package files up one level directly into the package folder
   exec(`mv packages/${currName}/package/* packages/${currName}/`);
   console.log(`${currName} is now downloaded and extracted!`);
  }).catch(err => {
   console.log('the package could not be downloaded properly');
   console.log(err);
  });
}

// this function implements the helper functions
async function downloadPackages(count, callback) {
  let list;
  try {
    list = await scrapePackages(count);
    exec('rm packages/_gitignore');
    // iterate through the list to download and extract the tarballs to the packages directory
    for (let pkg = 0; pkg < list.length; pkg++) {
      await handleTarball(list[pkg]);
    }
  await callback();
  } catch(err) {
    console.log('thrown value: ', err);
  }
  return list;
}

