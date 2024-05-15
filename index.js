require('dotenv').config();
const ethers = require('ethers');
const { NFT_ABI, TOKEN_ABI, CHAINS, EXPLORERS } = require("./utils/abi");

const TYPE = process.env.TYPE;
const CONTRACT_ABI = TYPE == "NFT" ? NFT_ABI : TOKEN_ABI;

const RPC_BLOCKCHAIN = process.env.RPC_BLOCKCHAIN;

const PROVIDER = new ethers.JsonRpcProvider(RPC_BLOCKCHAIN);

const wal = process.env.SEND_FROM.split(",")
const WALLETS = new Array();

wal.forEach(pk => {
  const wallet = new ethers.Wallet(pk, PROVIDER)
  WALLETS.push(wallet)
})

const CHAIN = CHAINS[process.env.CHAIN];
const EXPLORER = EXPLORERS[process.env.CHAIN]

if(CHAIN == "" || CHAIN == undefined){
  console.log("Selecione uma blockchain válida:")
  console.log("  1: Ethereum\n  2: Arbitrum\n  3: Base\n  4: Blast\n  5: Binance Smart Chain\n  6: Avalanche\n  7: Polygon\n  8: Optimism\n  9: Zora\n")
  process.exit(0)
}
  
const CONTRACT = new ethers.Contract(process.env.CONTRACT_ADDRESS, CONTRACT_ABI, PROVIDER);

async function getNFTS(ownerAddress, contractAddress){
  const nftIds = new Array();

  let hasNext = true;
  let nextPage = "";

  try {
    while(hasNext){
      const reponse  = await fetch(`https://api.opensea.io/api/v2/chain/${CHAIN}/account/${ownerAddress}/nfts?limit=150${nextPage != "" ? `&next=${nextPage}` : ""}`, {
        headers: {
          'x-api-key': process.env.AUTH_OPENSEA_API
        }
      })
    
      const data = await reponse.json()
  
      data.nfts.forEach(nft => {
        if(nft.contract.toLowerCase() == contractAddress.toLowerCase()){
          const url = nft.opensea_url.split("/");
          const id = url[url.length - 1];
  
          nftIds.push(id)
        }
      })
  
      if(!data.hasOwnProperty("next"))
        hasNext = false;
      else
        nextPage = data.next
    }
  } catch (error) {
    console.log("Ocorreu um erro ao tentar obter NFTs do endereço: ", error)
  }
  
  return nftIds
}

async function transferFromNft(signerWallet, id){
  const contractSigner = CONTRACT.connect(signerWallet);
  try{
    const tx = await contractSigner.transferFrom(
      signerWallet.address, 
      process.env.RECEIVER_ADDRESS,
      id
    );

    await tx.wait();
    console.log(`\x1b[42mTransferencia realizada\u001b[0m\ntokenId: ${id}\n${signerWallet.address} para ${process.env.RECEIVER_ADDRESS}\nTx Hash: ${EXPLORER}${tx.hash}`);
  }catch(error){
    console.log(`\x1b[41mFalha ao transferir\u001b[0m\nToken: ${id} de ${signerWallet.address} para ${process.env.RECEIVER_ADDRESS}`);
  }
}

async function transferFromToken(signerWallet){
  const contractSigner = CONTRACT.connect(signerWallet);
  try{
    const amount = await CONTRACT.balanceOf(signerWallet.address);

    const tx = await contractSigner.transfer(
      process.env.RECEIVER_ADDRESS,
      amount
    );

    await tx.wait();
    console.log(`\x1b[42mTransferencia realizada\u001b[0m\nQuantidade: ${amount} de ${signerWallet.address} para ${process.env.RECEIVER_ADDRESS}\nTx Hash: ${EXPLORER}${tx.hash}`);
  }catch(error){
    console.log(`\x1b[41mFalha ao transferir\u001b[0m\n${signerWallet.address} para ${process.env.RECEIVER_ADDRESS}`);
  }
}

async function main(){
 
  for(let i = 0; i< WALLETS.length; i++){
    const wallet = WALLETS[i];

    if(process.env.TYPE == "NFT"){
      const tokensIds = await getNFTS(wallet.address, process.env.CONTRACT_ADDRESS);
      console.log(`${wallet.address} possui esses tokens: ${tokensIds}`);

      let count = 0;
      while(count < tokensIds.length){
        const id = tokensIds[count];
        await transferFromNft(wallet, id);

        count++;
      }
    }

    else if(process.env.TYPE == "TOKEN")
      transferFromToken(WALLETS[i])
  }
}

main();