const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Lock", function () {

const valueInEther = 3;

    

it("Deploying Contract", async () => {
  const [owner, otherAccount] = await ethers.getSigners();
  const Debita = await ethers.getContractFactory("DebitaV1");
  const debita_Address = await Debita.deploy();

}),
it("Deploying Token and testing payments + claiming", async () => {
  const [owner, otherAccount, owner3] = await ethers.getSigners();
  const Debita = await ethers.getContractFactory("DebitaV1");
  const Ownerships = await ethers.getContractFactory("Ownerships");
  const token = await ethers.getContractFactory("DebitaERC20");
  const debita_Address = await Debita.deploy();
  const ownerships = await Ownerships.deploy();
  const token_Address = await token.deploy();
  await ownerships.setDebitaContract(debita_Address.target);
  await debita_Address.setNFTContract(ownerships.target);
  const valueInWei = ethers.parseUnits(`${valueInEther}`);
  await token_Address.mint(valueInWei);
  const balance = await token_Address.balanceOf(owner.address);
  expect(balance).to.equal(valueInWei);
  await token_Address.approve(
    debita_Address.target,
    valueInWei
  )
  await debita_Address.createLenderOption(
    token_Address.target,
    [token_Address.target],
    [300000000000],
    600000000000,
    100,
    86400,
    5,
    []
  )
  await token_Address.connect(otherAccount).mint(valueInWei);
  await token_Address.connect(otherAccount).approve(
    debita_Address.target,
    valueInWei
  )
  await debita_Address.connect(otherAccount).acceptLenderOffer(1);
  const addressOf1 = await ownerships.ownerOf(2);
  expect(addressOf1).to.equal(otherAccount.address);
  await debita_Address.connect(otherAccount).payDebt(1);
  const before = await token_Address.balanceOf(debita_Address.target);
  await debita_Address.claimDebt(1);
  const after = await token_Address.balanceOf(debita_Address.target);
  expect(before - after).to.be.equal((600000000000 * 1.1) / 5)
  await debita_Address.connect(otherAccount).payDebt(1);
  await debita_Address.connect(otherAccount).payDebt(1);
  await debita_Address.connect(otherAccount).payDebt(1);
  await debita_Address.connect(otherAccount).payDebt(1);
  const before2 = await token_Address.balanceOf(debita_Address.target);
  
  await debita_Address.connect(otherAccount).claimCollateralasBorrower(1);
  const after2 = await token_Address.balanceOf(debita_Address.target);
  expect(before2 - after2).to.be.equal(300000000000)

}),

it("Checking Whitelist", async () => {
  const [owner, otherAccount, owner3, owner4, owner5  ] = await ethers.getSigners();
  const Debita = await ethers.getContractFactory("DebitaV1");
  const Token_1 = await ethers.getContractFactory("DebitaERC20");
  const Ownerships = await ethers.getContractFactory("Ownerships");
  const debita_Address = await Debita.deploy();
  const token_Address = await Token_1.deploy();
  const ownerships = await Ownerships.deploy();
  await ownerships.setDebitaContract(debita_Address.target);
  await debita_Address.setNFTContract(ownerships.target);
  const valueInWei = ethers.parseUnits(`${valueInEther}`);
  await token_Address.mint(valueInWei);
  await token_Address.approve(
    debita_Address.target,
    valueInWei
  );
  await debita_Address.createLenderOption(
    token_Address.target,
    [token_Address.target],
    [300000000000],
    600000000000,
    10,
    86400,
    5,
    [owner3.address]
  );

  await debita_Address.createLenderOption(
    token_Address.target,
    [token_Address.target],
    [300000000000],
    600000000000,
    10,
    86400,
    5,
    [owner4.address, owner3.address]
  );

  await debita_Address.createLenderOption(
    token_Address.target,
    [token_Address.target],
    [300000000000],
    600000000000,
    10,
    86400,
    5,
    [owner4.address, owner3.address]
  );

  await debita_Address.createLenderOption(
    token_Address.target,
    [token_Address.target],
    [300000000000],
    600000000000,
    10,
    86400,
    5,
    [owner4.address, owner3.address]
  );

  await debita_Address.cancelLenderOffer(4);
  await token_Address.connect(otherAccount).mint(valueInWei);
  await token_Address.connect(otherAccount).approve(
    debita_Address.target,
    valueInWei
  );
  await token_Address.connect(owner3).mint(valueInWei);
  await token_Address.connect(owner3).approve(
    debita_Address.target,
    valueInWei
  )
 await expect(debita_Address.connect(otherAccount).acceptLenderOffer(1)).to.be.reverted
 await debita_Address.connect(owner3).acceptLenderOffer(1)

 await token_Address.connect(owner4).mint(valueInWei);
 await token_Address.connect(owner4).approve(
   debita_Address.target,
   valueInWei
 )

 await expect(debita_Address.connect(otherAccount).acceptLenderOffer(2)).to.be.reverted
 await expect(debita_Address.connect(otherAccount).acceptLenderOffer(3)).to.be.reverted
 await expect(debita_Address.connect(owner3).acceptLenderOffer(2)).not.to.be.reverted
 await expect(debita_Address.connect(owner4).acceptLenderOffer(3)).not.to.be.reverted

}),

it("Checking Whitelist Collateral", async () => {
  const [owner, otherAccount, owner3, owner4, owner5  ] = await ethers.getSigners();
  const Debita = await ethers.getContractFactory("DebitaV1");
  const Token_1 = await ethers.getContractFactory("DebitaERC20");
  const Ownerships = await ethers.getContractFactory("Ownerships");
  const debita_Address = await Debita.deploy();
  const token_Address = await Token_1.deploy();
  const ownerships = await Ownerships.deploy();
  await ownerships.setDebitaContract(debita_Address.target);
  await debita_Address.setNFTContract(ownerships.target);
  const valueInWei = ethers.parseUnits(`${valueInEther}`);
  await token_Address.mint(valueInWei);
  await token_Address.approve(
    debita_Address.target,
    valueInWei
  );

  await debita_Address.createCollateralOffer(
    token_Address.target,
    [token_Address.target],
    [300000000000],
    600000000000,
    10,
    86400,
    5,
    [owner3.address]
  );

  await debita_Address.createCollateralOffer(
    token_Address.target,
    [token_Address.target],
    [300000000000],
    600000000000,
    10,
    86400,
    5,
    [owner4.address, owner3.address]
  );

  await debita_Address.createCollateralOffer(
    token_Address.target,
    [token_Address.target],
    [300000000000],
    600000000000,
    10,
    86400,
    5,
    [owner4.address, owner3.address]
  );

  await debita_Address.createCollateralOffer(
    token_Address.target,
    [token_Address.target],
    [300000000000],
    600000000000,
    10,
    86400,
    5,
    [owner4.address, owner3.address]
  );
  
  
  await debita_Address.cancelCollateralOffer(4);

  await token_Address.connect(otherAccount).mint(valueInWei);
  await token_Address.connect(otherAccount).approve(
    debita_Address.target,
    valueInWei
  );
  await token_Address.connect(owner3).mint(valueInWei);
  await token_Address.connect(owner3).approve(
    debita_Address.target,
    valueInWei
  )
 await expect(debita_Address.connect(otherAccount).acceptCollateralOffer(1)).to.be.reverted
 await debita_Address.connect(owner3).acceptCollateralOffer(1);
 await debita_Address.payDebt(1);
 await debita_Address.connect(owner3).claimDebt(1);


 await token_Address.connect(owner4).mint(valueInWei);
 await token_Address.connect(owner4).approve(
   debita_Address.target,
   valueInWei
 )

 await expect(debita_Address.connect(otherAccount).acceptCollateralOffer(3)).to.be.reverted
 await expect(debita_Address.connect(otherAccount).acceptCollateralOffer(2)).to.be.reverted
 await expect(debita_Address.connect(owner3).acceptCollateralOffer(3)).not.to.be.reverted
 await expect(debita_Address.connect(owner4).acceptCollateralOffer(2)).not.to.be.reverted
 await time.increase(1000000000);
 await debita_Address.connect(owner4).claimCollateralasLender(3);

}),
it("Cancel Offer", async () => {
  const [owner, otherAccount, owner3, owner4, owner5  ] = await ethers.getSigners();
  const Debita = await ethers.getContractFactory("DebitaV1");
  const Token_1 = await ethers.getContractFactory("DebitaERC20");
  const Ownerships = await ethers.getContractFactory("Ownerships");
  const debita_Address = await Debita.deploy();
  const token_Address = await Token_1.deploy();
  const ownerships = await Ownerships.deploy();
  await ownerships.setDebitaContract(debita_Address.target);
  await expect( debita_Address.connect(otherAccount).setNFTContract(ownerships.target)).to.be.reverted;
  await debita_Address.setNFTContract(ownerships.target);
  await expect( debita_Address.setNFTContract(ownerships.target)).to.be.reverted;
  const valueInWei = ethers.parseUnits(`${valueInEther}`);
  await token_Address.mint(valueInWei);
  await token_Address.approve(
    debita_Address.target,
    valueInWei
  );
  const b  = await owner.provider.getBalance(owner.address)
  await debita_Address.createLenderOption(
    "0x0000000000000000000000000000000000000000",
    ["0x0000000000000000000000000000000000000000"],
    [300000000000],
    600000000000,
    10,
    86400,
    1,
    [],{
      value: 600000000000
    }
  );

  await debita_Address.createCollateralOffer(
    "0x0000000000000000000000000000000000000000",
    ["0x0000000000000000000000000000000000000000"],
    [300000000000],
    600000000000,
    10,
    86400,
    1,
    [],{
      value: 300000000000
    }
  );
  await debita_Address.cancelLenderOffer(1);
  await debita_Address.cancelCollateralOffer(1);
  await debita_Address.createCollateralOffer(
    "0x0000000000000000000000000000000000000000",
    ["0x0000000000000000000000000000000000000000"],
    [`${3.2 * 10 ** 16}`],
    `${6 * 10 ** 18}`,
    100,
    86400,
    3,
    [],{
      value: `${3.2 * 10 ** 16}`
    }
  );
  await debita_Address.connect(owner3).acceptCollateralOffer(2, {value: `${6 * 10 ** 18}`});
  await debita_Address.payDebt(1, {value:`${2.2 * 10 ** 18}`})
  await expect(debita_Address.connect(owner4).payDebt(1, {value:`${2.2 * 10 ** 18}`})).to.be.reverted;
  await ownerships.transferFrom(owner.address, owner4.address, 2);
  await expect(debita_Address.payDebt(1, {value:`${2.2 * 10 ** 18}`})).to.be.reverted;
  await expect(debita_Address.connect(owner4).payDebt(1, {value:`${2.2 * 10 ** 18}`})).not.to.be.reverted;
  await time.increase(1000000000);
  await debita_Address.connect(owner3).claimCollateralasLender(1);
  const data = await ownerships.tokenURI(1);
  console.log(data);
})

});
