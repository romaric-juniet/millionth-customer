'use strict';

let LoadCsvFile = require('./load-csv-file');
let Product = require('./product');
let Bag = require('./bag');

console.time('Total');

// Load data from csv file
let promise = LoadCsvFile.loadCsv('products.csv');

// Call main processing
promise = promise.then(array => {
  main(array);
  console.timeEnd('Total');
});

// Error handling
promise = promise.catch(error => {
  console.error(error);
  console.error(error.stack);
  return Promise.reject(error);
});

// Main processing
function main(array) {
  // Create the tote
  let bag = new Bag([45, 30, 35]);

  // Filter the products that fit individually
  let products = array.map(item => new Product (...item));
  products = products.filter(product => product.doesFitIn(bag));

  // Print some statistics about the original product selection
  console.log(someStatistics(products));
  console.log();

  // Step 1: Fill the bag with the best ratios until it is full
  fillBagWithBestRatio(products, bag);

  /* 
    Step 2: We may have some space left in the bag, and it's room for improvement
    The best products (in term of ratio) are at the begging of the array.
    It may exist a better combination for last products: More space taken, but higer value.
    So, we remove the last quarter (arbitrarly, can be tuned) and we try every combination of 
    the 20 best products not in the array. 20 Because it finishes in a decent time (-1 halves the processing time).
  */
  const clearedProductsCount = bag.products.length / 4;
  bag.removeLast(clearedProductsCount);
  console.log('Removed count: ' + clearedProductsCount);

  // Build a list of 15 good products that are not in the bag
  products = products.sort(Product.compareRatio).reverse();
  products = products.filter(product => bag.products.indexOf(product) === -1);
  products = products.slice(0, 15);

  // Feed the combinatory algorithm with the prepared list of 20 products
  bag = fillBagWithCombinatory(products, bag);

  // Print the optimized bag and the statistics of the bag
  console.log(bag.toString());
  console.log(someStatistics(bag.products));
  console.log(`Email address is ${bag.idsSum()}@redmart.com`);
}

// Fill a bag with the products with the best ratios until it is full
function fillBagWithBestRatio(products, bag) {
  // Sort the products by ratio desc
  const sortedProducts = Array.from(products).sort(Product.compareRatio).reverse();

  // Take all the best ratios until there is no more room
  sortedProducts.forEach(product => {
    if (product.volume < (bag.volume - bag.totalVolume)) {
      bag.add(product);
    }
  });

  return bag;
}

// Fills a bag by combining products.
// Warning: time complexity of O(2^(products.length))
// Room for a lot of improvements here
function fillBagWithCombinatory(products, inputBag) {
  // Warnings
  if (products.length > 20) {
    console.warn('more than 20 products is slow');
  }
  const max_safe = Math.log2(Number.MAX_SAFE_INTEGER);
  if (products.length > max_safe) {
    console.warn(`more than ${max_safe} products is not safe`);
  }

  // Temporary sub-bag to find the best
  // A sub-bag is a combination of products that have to fit in inputbag
  let bestSubBag = new Bag();

  // Available volume in inputBag
  const availableVolume = inputBag.volume - inputBag.totalVolume

  // Generate "mappings", representing a set of products.
  // If mapping==[3,5,11], we take the 3rd, 5th and 11th product
  // We try all posible combinations of products
  for (let mapping of generateBitPositions(products.length)) {
    // Makes a bag out of the array of positions
    let subBag = mapping.reduce((bag, position) => {
      bag.add(products[position]);
      return bag;
    }, new Bag());

    // If the bag is better than the best bag
    if (Bag.compare(subBag, bestSubBag) === 1) {
      // And the subbag fits in the input bag
      if (subBag.totalVolume <= availableVolume) {
        bestSubBag = subBag;
      }
    }
  }

  // Add the optimal combination found in the input bag
  bestSubBag.products.forEach(product => inputBag.add(product));

  return inputBag;

  /*
    Generates binary numbers from 0 to 2^maxValue
    Binary numbers are return in the form of an array of positions of the 1 in the binary number
    Generate values like [], [0], [0, 1], [2], [0, 2], [1, 2], [0, 1, 2]
  */
  function* generateBitPositions(maxValue) {
    // Maximum value 
    const max = Math.pow(2, maxValue) - 1;
    
    // Powers of 2 composing the number
    let b;

    // Result, array
    let result;
    for (let number = 0 ; number <= max; number++) {
      // Yield the array of positions for number
      b = 1;
      result = [];
      while (b <= number) {
        if (b & number){
          result.push(Math.log2(b));
        }
        b <<= 1;
      }

      yield result;
    }

    return;
  }
}

// Just some statistics on an array of products
function someStatistics(products) {
  const count = products.length;
  let statsHash = {
    //count: products.length,
    volumeMin: products[0].volume,
    volumeAverage: 0,
    volumeMax: products[0].volume,

    priceMin: products[0].price,
    priceAverage: 0,
    priceMax: products[0].price,

    weightMin: products[0].weight,
    weightAverage: 0,
    weightMax: products[0].weight,

    priceVolumeRatioMin: products[0].priceVolumeRatio,
    priceVolumeRatioAverage: 0,
    priceVolumeRatioMax: products[0].priceVolumeRatio
  };

  products = products.reduce((hash, product) => {
    hash.volumeAverage += product.volume;
    hash.volumeMin = Math.min(hash.volumeMin, product.volume);
    hash.volumeMax = Math.max(hash.volumeMax, product.volume);
    
    hash.priceAverage += product.price;
    hash.priceMin = Math.min(hash.priceMin, product.price);
    hash.priceMax = Math.max(hash.priceMax, product.price);
    
    hash.weightAverage += product.weight;
    hash.weightMin = Math.min(hash.weightMin, product.weight);
    hash.weightMax = Math.max(hash.weightMax, product.weight);
    
    hash.priceVolumeRatioAverage += product.priceVolumeRatio;
    hash.priceVolumeRatioMin = Math.min(hash.priceVolumeRatioMin, product.priceVolumeRatio);
    hash.priceVolumeRatioMax = Math.max(hash.priceVolumeRatioMax, product.priceVolumeRatio);

    return hash;
  }, statsHash);

  statsHash.volumeAverage = Math.round(statsHash.volumeAverage / count);
  statsHash.priceAverage = Math.round(statsHash.priceAverage / count);
  statsHash.weightAverage = Math.round(statsHash.weightAverage / count);
  statsHash.priceVolumeRatioAverage = statsHash.priceVolumeRatioAverage / count;
  statsHash.count = count;

  return statsHash;
}
