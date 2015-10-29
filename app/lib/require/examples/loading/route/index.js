function Route(name) {

    this.name = name;
    this.path = require.resolve("../src/");
}

module.exports = Route;
