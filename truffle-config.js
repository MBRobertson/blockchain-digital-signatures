const path = require("path");

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
  networks: {
    develop: {
      port: 8545,
      accounts: 2,
      gas: 100000000,
      gasPrice: 0,
      defaultEtherBalance: 1000,
      account: ["0e39c6a8d4bb183737fc3e7bacf9ee410c4f68ba20b79f884ce7722cb26ff81b", "2b927f0da4f018ff1c21dc570e7af0eda6784f570b540f01e1ad4eb5261e1e5b"]
    }
  }
};
