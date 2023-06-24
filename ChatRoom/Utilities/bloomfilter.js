// class BloomFilter {
//   constructor(size, hashFunctions) {
//     this.size = size;
//     this.hashFunctions = hashFunctions;
//     this.filter = new Array(size).fill(false);
//   }
//   add(element) {
//     this.hashFunctions.forEach((hashFn) => {
//       const index = this.getIndex(hashFn, element);
//       this.filter[index] = true;
//     });
//   }
//   mightContain(element) {
//     return this.hashFunctions.every((hashFn) => {
//       const index = this.getIndex(hashFn, element);
//       return this.filter[index];
//     });
//   }
//   getIndex(hashFn, element) {
//     const hash = createHash("sha1").update(element).digest("hex");
//     const hashCode = parseInt(hash, 16);
//     return hashCode % this.size;
//   }
// }

const { ScalableBloomFilter } = require("bloom-filters");
const { sequelize } = require("../Models/dbConnection");

class BloomFilter {
  constructor() {
    this.filter = new ScalableBloomFilter();
    sequelize.query("select name from Users").then((res) => {
      res[0].map((val) => {
        this.filter.add(val.name);
        console.log(val.name);
      });
    });
  }
  add(element) {
    this.filter.add(element);
  }
  mightContain(element) {
    return this.filter.has(element);
  }
}

module.exports = new BloomFilter();
