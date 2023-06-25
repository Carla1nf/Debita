const { ethers } = require("hardhat");

async function main() {
  const options = {
    gasPrice: 125 * 10 ** 9,
    // Other transaction options...
  };
  
  const Debita = await ethers.getContractFactory("DebitaV1");
  const Ownerships = await ethers.getContractFactory("Ownerships");
  const debita_Address = await Debita.deploy(options);
  const ownerships = await Ownerships.deploy(options);
  console.log(debita_Address.target, 'DEBITA');
  console.log(ownerships.target, 'OWNERSHIPS');

  await ownerships.setDebitaContract(debita_Address.target, options);
  await debita_Address.setNFTContract(ownerships.target, options);
  console.log('FINISHED');

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
