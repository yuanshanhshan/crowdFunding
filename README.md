# CrowdFunding Hardhat Project
> The current contract is in the development and maintenance phase. Although it has passed the tests, it is not recommended for direct use. Please handle with care.  

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

## 1.Test 
```shell
npx hardhat test
```

## 2. Deploy contract (bsc testnet)
### Update Setting(.env)
```shell
TESTNET_PRIVATE_KEY=
# optional
TESTNET_RPC=
# verify contract 
ETHERSCAN_API_KEY=

```
### Deploy contract

```shell
npx hardhat ignition deploy ignition/modules/CrowdFunding.ts --network bscTestnet
```
#### Deploy contract Information 
```shell
Hardhat Ignition 🚀

Deploying [ CrowdFunding ]

Batch #1
  Executed CrowdFunding#CrowdToken

Batch #2
  Executed CrowdFunding#CrowdFunding

[ CrowdFunding ] successfully deployed 🚀

Deployed Addresses

CrowdFunding#CrowdToken - 0x30E7486a3F138A6b225fCB76007E7f131C374B61
CrowdFunding#CrowdFunding - 0x497706C48e46B90a900211e35829e7E988101EC4
```

### Verify Contract 
```shell
npx hardaht verify <contractAddress> --network bscTestnet
```



## Contract 
https://testnet.bscscan.com/address/0x30E7486a3F138A6b225fCB76007E7f131C374B61

https://testnet.bscscan.com/address/0x497706C48e46B90a900211e35829e7E988101EC4#code

