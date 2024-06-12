import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Favorites } from "../target/types/favorites";
import * as anchor from "@coral-xyz/anchor";
import { Favorites } from "../target/types/favorites";
import { Program, web3 } from "@coral-xyz/anchor";
import { airdropIfRequired, getCustomErrorMessage } from "@solana-developers/helpers";
import { assert } from "chai";
import { systemProgramErrors } from "./system-program-errors";
import { program } from "@coral-xyz/anchor/dist/cjs/native/system";

describe("favorites", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.Favorites as Program<Favorites>;

  it("Is initialized!", async () => {

    
    const user = web3.Keypair.generate();
    
    console.log(`User public key: ${user.publicKey}`);
    
    await airdropIfRequired(
      anchor.getProvider().connection,
      user.publicKey,
      0.5 * web3.LAMPORTS_PER_SOL,
      1 * web3.LAMPORTS_PER_SOL
    );
    
    // Here's what we want to write to the blockchain
    const favoriteNumber = new anchor.BN(23);
    const favoriteColor = "red";
    
    // Generate the PDA for the user's favorites
    const favoritesPdaAndBump = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("favorites"), user.publicKey.toBuffer()],
      program.programId
    );
    
    const favoritesPda = favoritesPdaAndBump[0];
    
    
    // Make a transaction to write to the blockchain
    let tx: string | null = null;
    try {
      tx = await program.methods
        // Call the set_favorites instruction handler
        .setFavorites(favoriteNumber, favoriteColor)
        .accounts({
          user: user.publicKey,
          favorites: favoritesPda,
        })
        // Sign the transaction
        .signers([user])
        // Send the transaction to the cluster or RPC
        .rpc();
    } catch (thrownObject) {
      // Let's properly log the error, so we can see the program involved
      // and (for well known programs) the full log message.
    
      const rawError = thrownObject as Error;
      throw new Error(getCustomErrorMessage(systemProgramErrors, rawError.message));
    }
    
    console.log(`Tx signature: ${tx}`);

    const dataFromPda = await program.account.favorites.fetch(favoritesPda);

    // And make sure it matches!
    assert.equal(dataFromPda.color, favoriteColor);
    // A little extra work to make sure the BNs are equal
    assert.equal(dataFromPda.number.toString(), favoriteNumber.toString());
    
  });
});
