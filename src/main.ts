import { IncrementSecret } from './IncrementSecret.js';
import {
  isReady,
  shutdown,
  Field,
  Mina,
  PrivateKey,
  PublicKey,
  AccountUpdate,
  Poseidon,
  Encoding,
} from 'snarkyjs';

export const users = {
  Bob: PrivateKey.fromBase58(
    "EKFAdBGSSXrBbaCVqy4YjwWHoGEnsqYRQTqz227Eb5bzMx2bWu3F"
  ),
  SuperBob: PrivateKey.fromBase58(
    "EKEitxmNYYMCyumtKr8xi1yPpY3Bq6RZTEQsozu2gGf44cNxowmg"
  ),
  MegaBob: PrivateKey.fromBase58(
    "EKE9qUDcfqf6Gx9z6CNuuDYPe4XQQPzFBCfduck2X4PeFQJkhXtt"
  ), // This one says duck in it :)
  Jack: PrivateKey.fromBase58(
    "EKFS9v8wxyrrEGfec4HXycCC2nH7xf79PtQorLXXsut9WUrav4Nw"
  ),
};

(async function main() {
  await isReady;

  

  console.log('SnarkyJS loaded');

  

  const Local = Mina.LocalBlockchain();
  Mina.setActiveInstance(Local);
  const deployerAccount = Local.testAccounts[0].privateKey;
  const randomAccount = Local.testAccounts[1].privateKey;

  const salt = Field.random();

  
  // ----------------------------------------------------

  // create a destination we will deploy the smart contract to
  const zkAppPrivateKey = PrivateKey.random();
  const zkAppAddress = zkAppPrivateKey.toPublicKey();

  // create an instance of IncrementSecret - and deploy it to zkAppAddress
  const zkAppInstance = new IncrementSecret(zkAppAddress);
  const deploy_txn = await Mina.transaction(deployerAccount, () => {
    AccountUpdate.fundNewAccount(deployerAccount);
    zkAppInstance.deploy({ zkappKey: zkAppPrivateKey });
    zkAppInstance.init();
    zkAppInstance.sign(zkAppPrivateKey);
  });
  await deploy_txn.send().wait();

  // get the initial state of IncrementSecret after deployment
  // const num0 = zkAppInstance.x.get();
  // console.log('state after init:', num0.toString());

  // ----------------------------------------------------



  console.log("Member of AnonDAO , May post a Proposal"); 
  const txn3 = await Mina.transaction(deployerAccount, () => {
    zkAppInstance.publishMessage(Field(Encoding.stringToFields("DAO Proposal 1 ..")[0]),users.Bob);
    zkAppInstance.sign(zkAppPrivateKey);
  });
  await txn3.send().wait();

  const num3 = zkAppInstance.message.get();
  console.log('Message:', Encoding.stringFromFields([num3]));

  // ----------------------------------------------------

     console.log("Member of AnonDAO , May post a Proposal"); 
     const txn6 = await Mina.transaction(deployerAccount, () => {
       zkAppInstance.publishMessage(Field(Encoding.stringToFields("DAO Proposal 2 ..")[0]),users.SuperBob);
       zkAppInstance.sign(zkAppPrivateKey);
     });
     await txn6.send().wait();

  const num6 = zkAppInstance.message.get();
  console.log('Message:', Encoding.stringFromFields([num6]));

   // ----------------------------------------------------
//   console.log("Anon is in the group , May post a Proposal");
//   const txn5 = await Mina.transaction(deployerAccount, () => {
//    zkAppInstance.publishMessage(Field.fromNumber(950),users.MegaBob);
//    zkAppInstance.sign(zkAppPrivateKey);
//  });
//  try{
//    await txn5.send().wait();
//    const num5 = zkAppInstance.message.get();
//    console.log('Message:', num5.toString());
//  }catch(ex){
//    console.log(ex);
//  }


   // ----------------------------------------------------
   try{
  console.log("Anon is not in the DAO ,  this will revert");
  const txn4 = await Mina.transaction(deployerAccount, () => {
    zkAppInstance.publishMessage(Field.fromNumber(1050),users.Jack);
    zkAppInstance.sign(zkAppPrivateKey);
  });
 
    await txn4.send().wait();
    const num4 = zkAppInstance.message.get();
    console.log('state after txn4:', num4.toString());
  }catch(ex){
    console.log("Execution reverted, Anon not part of the DAO");
  }

  // ----------------------------------------------------

  console.log("Anon Voting on the Latest Proposal"); 
  const txn9 = await Mina.transaction(deployerAccount, () => {
    zkAppInstance.voteonMessage(users.SuperBob);
    zkAppInstance.sign(zkAppPrivateKey);
  });
  await txn9.send().wait();

  const num9 = zkAppInstance.VoteCount.get();
  console.log('VoteCount:', num9.toString());
  console.log("Voting ends in 1 hour from the very first Vote");

  // ----------------------------------------------------

  console.log("Anon Voting on the Latest Proposal"); 
  const txn10 = await Mina.transaction(deployerAccount, () => {
    zkAppInstance.voteonMessage(users.MegaBob);
    zkAppInstance.sign(zkAppPrivateKey);
  });
  await txn10.send().wait();

  const num10= zkAppInstance.VoteCount.get();
  console.log('VoteCount:', num10.toString());


    // ----------------------------------------------------

    console.log("Check if Vote passed with a threshold of 2"); 
    const txn11 = await Mina.transaction(deployerAccount, () => {
      zkAppInstance.checkVotes();
      zkAppInstance.sign(zkAppPrivateKey);
    });
    await txn11.send().wait();
  
    const num11= zkAppInstance.VoteCount.get();
    console.log('Vote Passed, Yaay!:', num11.toString());


    // ----------------------------------------------------
    try{
    console.log("DAO can mint some tokens "); 
    const txn12 = await Mina.transaction(randomAccount, () => {
      zkAppInstance.mintNewTokens(randomAccount.toPublicKey());
      zkAppInstance.sign(zkAppPrivateKey);
    });
    await txn12.send().wait();
  } catch(ex){
    console.log("This works on berkley testnet only!");
  }

      // ----------------------------------------------------
      try{
        console.log("DAO can Burn some tokens "); 
        const txn14 = await Mina.transaction(randomAccount, () => {
          zkAppInstance.burnTokens(randomAccount.toPublicKey());
          zkAppInstance.sign(zkAppPrivateKey);
        });
        await txn14.send().wait();
      } catch(ex){
        console.log("This works on berkley testnet only!");
      }
  
  
      // ----------------------------------------------------

  console.log('Shutting down');

  await shutdown();
})();
