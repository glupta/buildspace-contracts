const Ethers = require('ethers');
const { ethers } = Ethers;
const { abi, bytecode } = require('../artifacts/contracts/Buildspace.sol/Buildspace.json');
require("dotenv").config();

const NETWORK = 'MATIC';

const web3Provider = new ethers.providers.AlchemyProvider("matic", process.env.POLYGON_ALCHEMY_KEY);
const deployer = new ethers.Wallet(process.env.PRIVATE_KEY, web3Provider);
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, abi, web3Provider);

async function main() {
  console.log('Deploying contracts with the account:', await deployer.getAddress());
  console.log('Account balance:', (await deployer.getBalance()).toString());

  const Token = new ethers.ContractFactory(abi, bytecode, deployer);
  const token = await Token.deploy(config[NETWORK].BASE_TOKEN_URI);

  console.log('Token address:', token.address);
}

async function createCohort(cohortId, limit, merkleRoot) {
  const tx = await contract.createCohort(cohortId, limit, merkleRoot, {
    gasPrice: ethers.utils.parseUnits('100', 'gwei'),
  });
  console.log(tx);
  await tx.wait();
}

async function fetchCohort(cohortId, limit, merkleRoot) {
  const tx = await contract.cohorts(cohortId);
  console.log(tx);
}

async function fetchUri(tokenId) {
  const tx = await contract.tokenURI(tokenId);
  console.log(tx);
}

async function updateMerkleRoot(cohortId, merkleRoot) {
  const tx = await contract.setMerkleRoot(cohortId, merkleRoot, {
    gasPrice: ethers.utils.parseUnits('50', 'gwei'),
  });
  console.log(tx);
  await tx.wait();
}

async function createCohort(cohort_id, limit) {
  const tx = await contract.createCohort(
    cohort_id,
    limit,
    '0x0000000000000000000000000000000000000000000000000000000000000000',
    {
      gasPrice: ethers.utils.parseUnits('50', 'gwei'),
    }
  );
  console.log(tx);
  await tx.wait();
}

async function fetchOwner(address) {
  const tx = await contract.claimed(address, '');
  console.log(tx);
  return tx;
}

async function fetchOwnerCohort(address, cohort) {
  const tx = await contract.claimed(address, cohort);
  let token_id = tx.toNumber();
  if (token_id > 0) {
    console.log("Found cohort", cohort, token_id);
    await fetchUri(tx.toString());
  }
  console.log("Wrong cohort", cohort)
}

let cohorts = require('./cohorts.json');
async function checkCohort(address) {
  for (let i in cohorts) {
    for (j in cohorts[i]) {
      await fetchOwnerCohort(address, cohorts[i][j])
      .catch(() => {
        console.error("ERROR");
      });
    }
  }
}

async function runMain() {
  await fetchOwner(process.env.PUBLIC_KEY1)
  .catch(error => {
    console.error(error);
    process.exit(1);
  });

  await checkCohort(process.env.PUBLIC_KEY1)
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
}

runMain();
