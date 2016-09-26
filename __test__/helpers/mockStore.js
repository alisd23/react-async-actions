const asyncAction = (func) =>
  new Promise(resolve => {
    setTimeout(() => {
      func();
      resolve();
    }, 0);
  });

export default () => ({
  addFruit: jest.fn(),
  addFruitAsync(fruit) {
    return asyncAction(() => this.addFruit(fruit));
  },
  addFruitSync(fruit) {
    return this.addFruit(fruit);
  }
});
