import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import dotenv from "dotenv";
import hre from 'hardhat';
dotenv.config();
const CrowdFundingModule = buildModule("CrowdFunding", (m) => {

  const CrowdToken = m.contract("CrowdToken");

  const privateKey = process.env.TESTNET_PRIVATE_KEY || "";
  console.log(`privateKey: ${privateKey}`);
  const wallet = new hre.ethers.Wallet(privateKey);
  console.log(`wallet address: ${wallet.address}`);
  const CrowdFunding = m.contract("CrowdFunding", [
    hre.ethers.parseEther('10'),
    60*60*24*30,
    CrowdToken
  ])
  console.log(`CrowdFunding constructor: ${hre.ethers.parseEther('10')}, ${60*60*24*30}, ${CrowdToken}`);
  return { CrowdToken, CrowdFunding };
});

export default CrowdFundingModule;
