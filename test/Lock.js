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

  const feePerPayment = (((600000000000 * 0.1) * 8) / 100) / 5;
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
  expect(before - after).to.be.equal(((600000000000 * 1.1) / 5) - feePerPayment)
  await debita_Address.connect(otherAccount).payDebt(1);
  await debita_Address.connect(otherAccount).payDebt(1);
  await debita_Address.connect(otherAccount).payDebt(1);
  await debita_Address.connect(otherAccount).payDebt(1);
  const before2 = await token_Address.balanceOf(debita_Address.target);
  await debita_Address.connect(otherAccount).claimCollateralasBorrower(1);
  const after2 = await token_Address.balanceOf(debita_Address.target);
  expect(before2 - after2).to.be.equal(300000000000)
  await debita_Address.claimDebt(1);



  await debita_Address.createLenderOption(
    "0x0000000000000000000000000000000000000000",
    ["0x0000000000000000000000000000000000000000"],
    [300000000000],
    600000000000,
    100,
    86400,
    5,
    [], {value: 600000000000}
  );
  
  await debita_Address.connect(owner3).acceptLenderOffer(2, {value: 300000000000});
  const balanceBefore = await ethers.provider.getBalance(owner.address);
  await debita_Address.connect(owner3).payDebt(2, {value: (600000000000 * 1.1) / 5});
  await debita_Address.connect(owner3).payDebt(2, {value: (600000000000 * 1.1) / 5});
  const balanceAfter = await ethers.provider.getBalance(owner.address);
  await expect(balanceAfter - balanceBefore).to.be.equal((((600000000000 * 0.1) * 0.08) / 5) * 2);

  const balanceBefore_1 = await ethers.provider.getBalance(owner.address);
  const data = await debita_Address.claimDebt(2);
  const tx = await data.wait();
  const balanceAfter_2 = await ethers.provider.getBalance(owner.address);
  expect((balanceAfter_2 - balanceBefore_1 + (tx.gasUsed * tx.gasPrice))).to.be.equal((((600000000000) * 1.092) / 5) * 2)

  const balanceBefore_3 = await ethers.provider.getBalance(owner.address);
  const data_3 = await ownerships.tokenURI(3);
  await debita_Address.connect(owner3).payDebt(2, {value: (600000000000 * 1.1) / 5});
  await debita_Address.connect(owner3).payDebt(2, {value: (600000000000 * 1.1) / 5});
  await debita_Address.connect(owner3).payDebt(2, {value: (600000000000 * 1.1) / 5});
  const balanceAfter_3 = await ethers.provider.getBalance(owner.address);
  await expect(balanceAfter_3 - balanceBefore_3).to.be.equal((((600000000000 * 0.1) * 0.08) / 5) * 3);

  const balanceBefore_4 = await ethers.provider.getBalance(owner.address);
  const data_1 = await debita_Address.claimDebt(2);
  const tx_1 = await data_1.wait();
  const balanceAfter_4 = await ethers.provider.getBalance(owner.address);
  expect((balanceAfter_4 - balanceBefore_4 + (tx_1.gasUsed * tx_1.gasPrice))).to.be.equal((((600000000000) * 1.092) / 5) * 3)
  await debita_Address.connect(owner3).claimCollateralasBorrower(2);

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
 const balanceBefore = await token_Address.balanceOf(owner.address);
 const balanceBefore_2 = await token_Address.balanceOf(owner4.address);

 await expect(debita_Address.connect(owner4).acceptLenderOffer(3)).not.to.be.reverted
 const balanceAfter = await token_Address.balanceOf(owner.address);
 const balanceAfter_2 = await token_Address.balanceOf(owner4.address);

 await expect(balanceAfter - balanceBefore).to.be.equal(600000000000 * 0.008)
 await expect((balanceAfter_2 - balanceBefore_2)).to.be.equal((600000000000 * 0.992) - 300000000000)


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

  await token_Address.connect(owner5).mint(valueInWei);
  await token_Address.connect(owner5).approve(
    debita_Address.target,
    valueInWei
  );

  await debita_Address.connect(owner5).createCollateralOffer(
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

 
  await debita_Address.createCollateralOffer(
    "0x0000000000000000000000000000000000000000",
    ["0x0000000000000000000000000000000000000000"],
    ["30000000000000000"],
    30000000000,
    10,
    86400,
    5,
    [owner4.address, owner3.address], {value: "30000000000000000"}
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
 const before = await token_Address.balanceOf(owner.address);
 await debita_Address.connect(owner3).acceptCollateralOffer(1);
 const after = await token_Address.balanceOf(owner.address);
 expect(after- before).to.be.equal(600000000000 * 0.008)

 await debita_Address.connect(owner5).payDebt(1);
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
 await debita_Address.connect(owner3).acceptCollateralOffer(5, {value: "30000000000000000"});

 await time.increase(1000000000);
 const balanceBefore = await token_Address.balanceOf(owner4.address);
 await debita_Address.connect(owner4).claimCollateralasLender(3);
 const balanceAfter = await token_Address.balanceOf(owner4.address);

 const balanceBefore_5 = await ethers.provider.getBalance(owner3.address);
 await debita_Address.connect(owner3).claimCollateralasLender(4);
 const balanceAfter_5 = await ethers.provider.getBalance(owner3.address);

 await expect(balanceAfter - balanceBefore).to.be.equal(300000000000 * 0.98)

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
    1000,
    86400,
    3,
    [],{
      value: `${3.2 * 10 ** 16}`
    }
  );
  await debita_Address.connect(owner3).acceptCollateralOffer(2, {value: `${6 * 10 ** 18}`});

  await debita_Address.payDebt(1, {value:`${4 * 10 ** 18}`})
  const data = await ownerships.tokenURI(1);
  console.log(data);

  await expect(debita_Address.connect(owner4).payDebt(1, {value:`${4 * 10 ** 18}`})).to.be.reverted;
  await ownerships.transferFrom(owner.address, owner4.address, 2);
  await expect(debita_Address.payDebt(1, {value:`${4 * 10 ** 18}`})).to.be.reverted;
  await expect(debita_Address.connect(owner4).payDebt(1, {value:`${4 * 10 ** 18}`})).not.to.be.reverted;

}),
it("Test Barrier against Taxable Tokens", async () => {
  const [owner, otherAccount, owner3, owner4, owner5  ] = await ethers.getSigners();
  const Debita = await ethers.getContractFactory("DebitaV1");
  const Token_1 = await ethers.getContractFactory("DebitaERC20Tax");
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

  await expect(debita_Address.createCollateralOffer(
    token_Address.target,
    [token_Address.target],
    [30000000000],
    60000000000,
    10,
    86400,
    5,
    [owner3.address]
  )).to.be.revertedWith('Taxable Token');

  await expect(debita_Address.createLenderOption(
    token_Address.target,
    [token_Address.target],
    [30000000000],
    60000000000,
    10,
    86400,
    5,
    [owner3.address]
  )).to.be.revertedWith('Taxable Token');

  await debita_Address.createCollateralOffer(
    token_Address.target,
    ["0x0000000000000000000000000000000000000000"],
    [`${3.2 * 10 ** 16}`],
    `${1 * 10 ** 17}`,
    1000,
    86400,
    3,
    [],{
      value: `${3.2 * 10 ** 16}`
    }
  );
  
  // Shouldn't be able to accept it
  await expect(debita_Address.acceptCollateralOffer(1)).to.be.revertedWith("Taxable Token");

  await debita_Address.createLenderOption(
    "0x0000000000000000000000000000000000000000",
    [token_Address.target],
    [`${3.2 * 10 ** 16}`],
    `${1 * 10 ** 17}`,
    1000,
    86400,
    3,
    [],{
      value: `${1 * 10 ** 17}`
    }
  );
    // Shouldn't be able to accept it
  await expect(debita_Address.acceptLenderOffer(1)).to.be.revertedWith("Taxable Token");

  // Now Test it as second Collateral 
  await debita_Address.createLenderOption(
    "0x0000000000000000000000000000000000000000",
    ["0x0000000000000000000000000000000000000000", token_Address.target],
    [`${3.2 * 10 ** 16}`, `${300000}`],
    `${1 * 10 ** 17}`,
    1000,
    86400,
    3,
    [],{
      value: `${1 * 10 ** 17}`
    }
  );
  
  // Accept Lender should be rejected
  await expect(debita_Address.acceptLenderOffer(2, {value: `${3.2 * 10 ** 16}`})).to.be.revertedWith("Taxable Token");


  await expect(debita_Address.createCollateralOffer(
    token_Address.target,
    ["0x0000000000000000000000000000000000000000", token_Address.target],
    [`${3.2 * 10 ** 16}`, `${300000}`],
    60000000000,
    10,
    86400,
    5,
    [owner3.address]
  )).to.be.revertedWith('Taxable Token');
})




});
