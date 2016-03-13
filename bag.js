'use strict';

// Bag: Collection of products
module.exports = class Bag {
  constructor(dimensions) {
    this.dimensions = dimensions;
    this.volume = dimensions && dimensions.reduce((volume, dimension) => {
      return volume * dimension;
    }, 1);

    this.totalPrice = 0;
    this.totalVolume = 0;
    this.totalWeight = 0;
    this.products = [];
  };

  add (product) {
    this.products.push(product);
    this.totalPrice += product.price;
    this.totalVolume += product.volume;
    this.totalWeight += product.weight;
  };

  removeLast (number) {
    for (let i = 0; i < number; i++) {
      const product = this.products.pop();
      this.totalPrice -= product.price;
      this.totalVolume -= product.volume;
      this.totalWeight -= product.weight;
    }
  };

  idsSum () {
    return this.products.reduce((sum, product) => sum + product.id, 0);
  };

  toString () {
    const ids = this.products.reduce((a, product) => {
      a.push(product.id);
      return a;
    }, []);
    return `totalPrice: ${this.totalPrice} freeSpace: ${this.volume - this.totalVolume} ids: ${ids}`;
  };

  static compare (a, b) {
    if (a.totalPrice > b.totalPrice) {
      return 1;
    }
    if (a.totalPrice < b.totalPrice) {
      return -1;
    }

    if (a.totalWeight < b.totalWeight) {
      return 1;
    }
    if (a.totalWeight > b.totalWeight) {
      return -1;
    }

    return 0;
  };
}