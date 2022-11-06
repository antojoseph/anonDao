import {
  Field,
  SmartContract,
  state,
  State,
  method,
  DeployArgs,
  Poseidon,
  Permissions,
  isReady,
  Encoding,
  PrivateKey,
  PublicKey,
  UInt64
} from 'snarkyjs';

export { isReady, Field, Encoding };
  
// Wait till our SnarkyJS instance is ready
await isReady;

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


export class IncrementSecret extends SmartContract {
  @state(Field) message = State<Field>();
  @state(Field) VoteCount = State<Field>();
  @state(PublicKey) user1 = State<PublicKey>();
  @state(PublicKey) user2 = State<PublicKey>();
  @state(PublicKey) user3 = State<PublicKey>();

  deploy(args: DeployArgs) {
    super.deploy(args);
    this.setPermissions({
      ...Permissions.default(),
      editState: Permissions.proofOrSignature(),
    });
  }

  @method init() {
    this.user1.set(users['Bob'].toPublicKey());
    this.user2.set(users['SuperBob'].toPublicKey());
    this.user3.set(users['MegaBob'].toPublicKey());
    this.message.set(Field(0));
    this.VoteCount.set(Field(0));

  }



  @method publishMessage(message: Field, signerPrivateKey: PrivateKey) {
    // Compute signerPublicKey from signerPrivateKey argument
    const signerPublicKey = signerPrivateKey.toPublicKey();
    // Get approved public keys
    const user1 = this.user1.get();
    this.user1.assertEquals(this.user1.get());
    const user2 = this.user2.get();
    this.user2.assertEquals(this.user2.get());
    const user3 = this.user3.get();
    this.user3.assertEquals(this.user3.get());
    // Assert that signerPublicKey is one of the approved public keys
    signerPublicKey
    .equals(user1)
    .or(signerPublicKey.equals(user2))
    .or(signerPublicKey.equals(user3))
    .assertEquals(true);
    // Update on-chain message variable
    this.message.set(message);

}

@method voteOnMessage(voterPrivateKey: PrivateKey, voteType: Field){
  const signerPublicKey = voterPrivateKey.toPublicKey();
    // Get approved public keys
    const user1 = this.user1.get();
    this.user1.assertEquals(this.user1.get());
    const user2 = this.user2.get();
    this.user2.assertEquals(this.user2.get());
    const user3 = this.user3.get();
    this.user3.assertEquals(this.user3.get());
    // Assert that signerPublicKey is one of the approved public keys
    signerPublicKey
    .equals(user1)
    .or(signerPublicKey.equals(user2))
    .or(signerPublicKey.equals(user3))
    .assertEquals(true);

  const currentMessage = this.message.get();
  this.message.assertEquals(currentMessage);

  const currentVoterCount = this.VoteCount.get();
  this.VoteCount.assertEquals(this.VoteCount.get());
  // you have 1 hour to cast your vote from the very first vote
  const now = this.network.timestamp.get();
  this.network.timestamp.assertBetween(now, now.add(60 * 60 * 1000));

  if (voteType.equals(Field(1)).toBoolean()){
    const latestVoteCount = currentVoterCount.add(1);
    this.VoteCount.set(latestVoteCount);
  }

  }

  @method checkVotes(){
      // Pass the DAO Vote at threashold 2
      // Do stuff at this point, we set voteCount to 1337 as pass condition

  this.VoteCount.assertEquals(Field.fromNumber(2));
  this.VoteCount.set(Field.fromNumber(1337));
  }



  @method mintNewTokens(receiverAddress: PublicKey) {
        this.experimental.token.mint({
          address:receiverAddress,
          amount: 100_000,
        });
      }
  @method burnTokens(addressToDecrease: PublicKey) {
        this.experimental.token.burn({
          address: addressToDecrease,
          amount: 100_000,
        });
      }


}

  
