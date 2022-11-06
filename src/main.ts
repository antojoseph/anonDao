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



  console.log("Bob in the group , this will pass"); 
  const txn3 = await Mina.transaction(deployerAccount, () => {
    zkAppInstance.publishMessage(Field.fromNumber(750),users.Bob);
    zkAppInstance.sign(zkAppPrivateKey);
  });
  await txn3.send().wait();

  const num3 = zkAppInstance.message.get();
  console.log('Message:', num3.toString());

  // ----------------------------------------------------

     console.log("SuperBob in the group , this will pass"); 
     const txn6 = await Mina.transaction(deployerAccount, () => {
       zkAppInstance.publishMessage(Field.fromNumber(850),users.SuperBob);
       zkAppInstance.sign(zkAppPrivateKey);
     });
     await txn6.send().wait();



  const num6 = zkAppInstance.message.get();
  console.log('Message:', num6.toString());

   // ----------------------------------------------------
  console.log("MegaBob is in the group , this will not revert");
  const txn5 = await Mina.transaction(deployerAccount, () => {
   zkAppInstance.publishMessage(Field.fromNumber(950),users.MegaBob);
   zkAppInstance.sign(zkAppPrivateKey);
 });
 try{
   await txn5.send().wait();
   const num5 = zkAppInstance.message.get();
   console.log('Message:', num5.toString());
 }catch(ex){
   console.log(ex);
 }


   // ----------------------------------------------------

  console.log("Jack is not in the group , will try update message to 1050; this will revert");
  console.log("core dump , need better error handling") 
  // const txn4 = await Mina.transaction(deployerAccount, () => {
  //   zkAppInstance.publishMessage(Field.fromNumber(1050),users.Jack);
  //   zkAppInstance.sign(zkAppPrivateKey);
  // });
  // try{
  //   await txn4.send().wait();
  //   const num4 = zkAppInstance.message.get();
  //   console.log('state after txn4:', num4.toString());
  // }catch(ex){
  //   console.log(ex);
  // }

  // ----------------------------------------------------

    console.log("Bob Voting on Message");
    const txn99 = await Mina.transaction(deployerAccount, () => {
        zkAppInstance.upVoteOnMessage(users.Bob);
        zkAppInstance.sign(zkAppPrivateKey);
    });
    await txn99.send().wait();

    const num99 = zkAppInstance.VoteCount.get();
    console.log('VoteCount:', num99.toString());


    // ----------------------------------------------------

  console.log("SuperBob Voting on Message"); 
  const txn9 = await Mina.transaction(deployerAccount, () => {
    zkAppInstance.downVoteOnMessage(users.SuperBob);
    zkAppInstance.sign(zkAppPrivateKey);
  });
  await txn9.send().wait();

  const num9 = zkAppInstance.VoteCount.get();
  console.log('VoteCount:', num9.toString());

  // ----------------------------------------------------

  console.log("MegaBob Voting on Message"); 
  const txn10 = await Mina.transaction(deployerAccount, () => {
    zkAppInstance.upVoteOnMessage(users.MegaBob);
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

  console.log('Shutting down');

  await shutdown();
})();
