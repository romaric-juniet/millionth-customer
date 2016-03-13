'use strict';

module.exports = class Product {
  constructor(id, price, length, width, height, weight) {
    this.id = id;
    this.price = price;
    this.length = length;
    this.width = width;
    this.height = height;
    this.weight = weight;

    this.volume = length * width * height;
    this.priceVolumeRatio = price / this.volume;
  }

  doesFitIn (bag) {
    // If volume is bigger than tote's volume: doesn't fit
    if (this.volume > bag.volume) {
      return false;
    }

    // If dimensions of the object are too big, return false
    const sortedToteDimensions = bag.dimensions.sort();
    const sortedProductDimensions = [this.width, this.length, this.height].sort();
    for (let index = 0 ; index < 3 ; index++) {
      if (sortedProductDimensions > sortedToteDimensions) {
        return false;
      }
    }

    // All checks passed, return true
    return true;
  };

  static compareRatio (a, b) {
    if (a.priceVolumeRatio > b.priceVolumeRatio) {
      return 1;
    }
    if (a.priceVolumeRatio < b.priceVolumeRatio) {
      return -1;
    }
    return 0;
  };
}
