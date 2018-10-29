'use strict'

module.exports = downloadPackages;

const cheerio = require('cheerio');
const request = require('request');
const download = require('download-tarball');
const getNpmTarballUrl = require('get-npm-tarball-url');
const exec = require('child_process').exec;
const scrapePackages = require('./utils/scraper.js');

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
    console.log('list: ',list);
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

downloadPackages(39, ()=>console.log('packages loaded'));
//downloadPackages(10, ()=>console.log('packages are in packages directory!'));
