import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre, { network } from "hardhat";

describe("CrowdFunding", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployOneYearLockFixture() {

    // Contracts are deployed using the first signer/account by default
    const [owner, testAccount1, testAccount2] = await hre.ethers.getSigners();

    // deploy crowd token
    const crowdTokenFactory = await hre.ethers.getContractFactory("CrowdToken");
    const crowdToken = await crowdTokenFactory.deploy();

    const crowdFundingFactory = await hre.ethers.getContractFactory("CrowdFunding");
    const crowdFunding = await crowdFundingFactory.deploy(
      hre.ethers.parseEther('10'),
      60*60*24*30,
      crowdToken
    );
    return { crowdToken, crowdFunding, owner, testAccount1, testAccount2 };
  }

  describe("Deployment", function () {
    it("Should set the right unlockTime", async function () {
      const { crowdToken, crowdFunding, owner, testAccount1, testAccount2} = await loadFixture(deployOneYearLockFixture);

      console.log(`crowdToken: ${await crowdToken.getAddress()}`);
      console.log(`crowdFunding: ${await crowdFunding.getAddress()}`);

      const targetAmount = await crowdFunding.targetAmount();
      console.log(`targetAmount: ${targetAmount}`);

      const ownerBalance = await crowdToken.balanceOf(owner.address);
      console.log(`ownerCrowdTokenBalance: ${ownerBalance}`);

      const otherAccountBalance = await crowdToken.balanceOf(testAccount1.address);
      console.log(`testAccountCrowdTokenBalance: ${otherAccountBalance}`);

      // approve crowdFunding to spend 1 ether
      await crowdToken.connect(owner).approve(crowdFunding.getAddress(), hre.ethers.parseEther('10000'));

      // contribute 1 ether
      const res = await crowdFunding.connect(testAccount1).contribute({value: hre.ethers.parseEther('1')});

      // check owner crowdToken balance
      const otherAccountCrowdTokenBalance2 = await crowdToken.balanceOf(testAccount1.address);
      expect(otherAccountCrowdTokenBalance2).to.equal(hre.ethers.parseEther('10000'));

      // testAccount2 contribute 10 ether
      await expect(crowdFunding.connect(testAccount2).contribute({value: hre.ethers.parseEther('10')})).to.be.revertedWith('The contribution exceeds the target');


      //before contribute must approve crowdFunding to spend more ether
      await crowdToken.approve(crowdFunding.getAddress(), hre.ethers.parseEther('90000'));

      // testAccount2 contribute 9 ether

      await crowdFunding.connect(testAccount2).contribute({value: hre.ethers.parseEther('9')});

      // check ended status
      const ended = await crowdFunding.ended();
      expect(ended).to.equal(true);

      // continue contribute after ended
      await expect(crowdFunding.connect(testAccount2).contribute({value: hre.ethers.parseEther('1')})).to.be.revertedWith('The crowdfunding has ended');
    });

    it("Withdraw ether not reach target amount", async function () {
      const { crowdToken, crowdFunding, owner, testAccount1, testAccount2} = await loadFixture(deployOneYearLockFixture);

      // approve crowdFunding to spend 1 ether
      await crowdToken.connect(owner).approve(crowdFunding.getAddress(), hre.ethers.parseEther('10000'));

      // contribute 1 ether
      const res = await crowdFunding.connect(testAccount1).contribute({value: hre.ethers.parseEther('1')});

      // withdraw
      await network.provider.send("evm_increaseTime", [60*60*24*30+1]);

      // owner check goalReached
      const goalReached = await crowdFunding.checkGoalReached();

      // get balance before withdraw
      const contributeBalance = await crowdFunding.contributions(testAccount1.address);
      const exchangeRate = await crowdFunding.exchangeRate();


      console.log(`contributeBalance: ${contributeBalance}`);
      expect(contributeBalance).to.equal(hre.ethers.parseEther('1'));

      // approve crowdFunding to spend 10000 ether
      await crowdToken.connect(testAccount1).approve(crowdFunding.getAddress(), contributeBalance*exchangeRate);

      await crowdFunding.connect(testAccount1).withdraw();

      // get balance after withdraw
      await expect(crowdFunding.connect(testAccount1).withdraw()).to.be.revertedWith('Nothing to withdraw');
      // get testAccount1 balance
      expect(await crowdToken.balanceOf(testAccount1.address)).to.equal(hre.ethers.parseEther('0'));
    
    });
  });
});
