const {
    time,
    loadFixture,
    impersonateAccount,
  } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");
  const { ethers } = require("hardhat");
  
  describe("Lock", function () {  
  
  it("Deploying Contract", async () => {
    const [owner, otherAccount] = await ethers.getSigners();
    const Debita = await ethers.getContractFactory("DebitaV1");
    const debita_Address = await Debita.deploy();
  
  }),
  it("Deploying Token and testing payments + claiming With USDT AND USDC", async () => {
    const [owner, otherAccount, owner3] = await ethers.getSigners();
    const accounts = "0x3381b11f6865f23e0Ad37A92B4CD4aEBe9E4f86a";
    const usdtAccount = "0x9ade1c17d25246c405604344f89e8f23f8c1c632";
    const Debita = await ethers.getContractFactory("DebitaV1");
    const Ownerships = await ethers.getContractFactory("Ownerships");
    const token = await ethers.getContractFactory("DebitaERC20");
    const debita_Address = await Debita.deploy();
    const ownerships = await Ownerships.deploy();
    const usdc = await token.attach("0x04068DA6C83AFCFA0e13ba15A6696662335D5B75");
    const usdt = await token.attach("0x049d68029688eAbF473097a2fC38ef61633A3C7A");
    const address = await ethers.getImpersonatedSigner(accounts);
    const usdtAddress = await ethers.getImpersonatedSigner(usdtAccount);
    await ownerships.setDebitaContract(debita_Address.target);
    await debita_Address.setNFTContract(ownerships.target);
    const balanceBefore = await usdc.balanceOf(owner.address);

    // Transfer USDC to Testing Accounts 
    await usdc.connect(address).transfer(owner.address, 100000);
    await usdc.connect(address).transfer(otherAccount.address, 100000);

    // Transfer USDT to Testing Accounts
    await usdt.connect(usdtAddress).transfer(owner.address, 100000);
    await usdt.connect(usdtAddress).transfer(otherAccount.address, 100000);

    const balance = await usdc.balanceOf(owner.address);
    expect(balance - balanceBefore).to.be.equal(100000);
   
    // Approve Tokens to manipulate with Debita Address
    await usdt.approve(
        debita_Address.target,
        100000
      )

      await usdt.connect(otherAccount).approve(
        debita_Address.target,
        100000
      )

    await usdc.approve(
        debita_Address.target,
        100000
      )

      await usdc.connect(otherAccount).approve(
        debita_Address.target,
        100000
      )

      // Approve malicious tokens
      await usdc.connect(owner3).approve(
        debita_Address.target,
        100000
      );
      await usdt.connect(owner3).approve(
        debita_Address.target,
        100000
      );
   
      await debita_Address.createLenderOption(
        usdc.target,
        [usdc.target],
        [30000],
        10000,
        100,
        86400,
        5,
        []
      )
      
   
      await debita_Address.createLenderOption(
        usdt.target,
        [usdt.target],
        [30000],
        10000,
        100,
        86400,
        5,
        []
      )

      await expect(debita_Address.connect(owner3).createLenderOption(
        usdt.target,
        [usdt.target],
        [30000],
        10000,
        100,
        86400,
        5,
        []
      )).to.be.reverted

      await debita_Address.connect(otherAccount).acceptLenderOffer(1);
      const balanceAfter = await usdt.balanceOf(owner.address); 
      await expect(debita_Address.connect(owner3).acceptLenderOffer(2)).to.be.reverted;
      await debita_Address.connect(otherAccount).acceptLenderOffer(2);


      const addressOf1 = await ownerships.ownerOf(2);
      expect(addressOf1).to.equal(otherAccount.address);
      await debita_Address.connect(otherAccount).payDebt(1);
      const before = await usdc.balanceOf(debita_Address.target);
      await debita_Address.claimDebt(1);
      const after = await usdc.balanceOf(debita_Address.target);
      expect(before - after).to.be.equal((10000 * 1.1) / 5); // Claim the first payment 
      await debita_Address.connect(otherAccount).payDebt(1);
      await debita_Address.connect(otherAccount).payDebt(1);
      await debita_Address.connect(otherAccount).payDebt(1);
      await debita_Address.connect(otherAccount).payDebt(1); // Pay all debts
      const before2 = await usdc.balanceOf(debita_Address.target);
      
      await debita_Address.connect(otherAccount).claimCollateralasBorrower(1);
      const after2 = await usdc.balanceOf(debita_Address.target);
      expect(before2 - after2).to.be.equal(30000)

  
  })
  });
  