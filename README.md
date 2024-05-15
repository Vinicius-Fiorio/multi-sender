# Multi Sender Reverse 
**Pré requisitos**
 - [Node JS](https://nodejs.org/en)
 - Os NFTs precisam estar 'unhide' no perfil da OS

**Como utilizar**
 - Baixe ou clone o repositório
 - Entre no terminal na pasta do repositório
 - Digite `npm i`
 - No arquivo `.env` configure como desejar:
   - `RPC_BLOCKCHAIN`: RPC para realizar transaçoes
   - `CHAIN`: blockchain que será usada(valor de 1 a 9)
     - 1: Ethereum
     - 2: Arbitrum
     - 3: Base
     - 4: Blast
     - 5: Binance Smart Chain
     - 6: Avalanche
     - 7: Polygon
     - 8: Optimism
     - 9: Zora
   - `SEND_FROM`: chave privada de todas as wallets separadas por vírgula
   - `RECEIVER_ADDRESS`: endereço que vai receber as transferências
   - `CONTRACT_ADDRESS`: contrato da coleção ou token
   - `TYPE`: NFT ou TOKEN, utilize token para ERC20
   - `AUTH_OPENSEA_API`: API OpenSea. [Como ter uma API OS](https://docs.opensea.io/reference/api-keys)
 - Após configurar o arquivo volte ao terminal e digite `node index.js`. O script começara a visualizar as NFTs e realizar as transferências