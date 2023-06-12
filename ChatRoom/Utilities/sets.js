class ValueSets {
  constructor() {
    this.values = [];
  }
  add(value) {
    const found = this.values.some((obj) => isEqual(obj, value));
    if (!found) {
      this.values.push(value);
    }
  }
  has(value) {
    return this.values.some((obj) => isEqual(obj, value));
  }
  forEach(callback) {
    this.values.forEach(callback);
  }
}
function isEqual(obj1, obj2) {
  return JSON.stringify(obj1) == JSON.stringify(obj2);
}

module.exports = ValueSets;
