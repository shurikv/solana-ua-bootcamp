// This uses "@metaplex-foundation/mpl-token-metadata@2" to create tokens
import "dotenv/config";
import {
  getKeypairFromEnvironment,
  getExplorerLink,
} from "@solana-developers/helpers";
import {
  Connection,
  clusterApiUrl,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";

// Yes, createCreate! We're making an instruction for createMetadataV3...
import { createUpdateMetadataAccountV2Instruction } from "@metaplex-foundation/mpl-token-metadata";

const user = getKeypairFromEnvironment("SECRET_KEY");

const connection = new Connection(clusterApiUrl("devnet"));

console.log(
  `🔑 We've loaded our keypair securely, using an env file! Our public key is: ${user.publicKey.toBase58()}`
);

const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
  );
  
  // Subtitute in your token mint account from create-token-mint.ts
  const tokenMintAccount = new PublicKey(
    "2SLrBSTsEHeTPeECpiXNsMzLL8VgWDwoSgeZCArx4kYR"
  );
  
  const metadataData = {
    name: "Shurik training token2",
    symbol: "SHSOL",
    // Arweave / IPFS / Pinata etc link using metaplex standard for off-chain data
    uri: "https://arweave.net/1234",
    sellerFeeBasisPoints: 0,
    creators: null,
    collection: null,
    uses: null,
  };
  
  const metadataPDAAndBump = PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      tokenMintAccount.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID
  );
  
  const metadataPDA = metadataPDAAndBump[0];
  
  const transaction = new Transaction();
  
  const createUpdateMetadataAccountInstruction =
    createUpdateMetadataAccountV2Instruction(
      {
        metadata: metadataPDA,
        updateAuthority: user.publicKey,
      },
      {
        updateMetadataAccountArgsV2: {
            data: metadataData,
            updateAuthority: user.publicKey,
            primarySaleHappened: null,
            isMutable: true
        }
      }
    );
  
  transaction.add(createUpdateMetadataAccountInstruction);

  await sendAndConfirmTransaction(
    connection,
    transaction,
    [user]
  );
  
  const tokenMintLink = getExplorerLink(
    "address",
    tokenMintAccount.toString(),
    "devnet"
  );
  
  console.log(`✅ Look at the token mint again: ${tokenMintLink}!`);
  