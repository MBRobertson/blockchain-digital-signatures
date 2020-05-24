const SimpleStorage = artifacts.require("./SimpleStorage.sol");

contract("SimpleStorage", accounts => {
  it("...should store the value 89.", async () => {
    const simpleStorageInstance = await SimpleStorage.deployed();

    // Set value of 89
    await simpleStorageInstance.set("123", { from: accounts[0] });

    // Get stored value
    const storedData = await simpleStorageInstance.getSignature.call();

    assert.equal(storedData, "123", "The value 123 was not stored.");
  });
});
