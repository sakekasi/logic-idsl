export default class UnificationError extends Error{
  constructor(msg){
    super(msg);
    this.isUnificationError = true;
  }
}
