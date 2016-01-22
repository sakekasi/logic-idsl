import UnificationError from './unificationerror.js';

export default function Number(number){
  let me = function(){};

  me.value = number;
  me.type = "Number";

  me.makeCopyWithFreshVarNames = function(delta){
    return new Number(me.value);
  };

  me.rewrite = function(subst){
    return new Number(me.value);
  };

  me.unify = function(other, subst){
    switch(other.type){
    case "Var":
      return other.unify(me, subst);

    case "Clause":
      throw new UnificationError("unification failed");

    case "Number":
      if(me.value === other.value){ //=== may lead to floating point issues
        return subst;
      } else {
        throw new UnificationError(`unification failed. can't unify ${me.value} and ${other.value}`);
      }

    default:
      throw new UnificationError(`unification failed. unknown type combination ${me.type}, ${other.type}`);

    }
  };

  me.equals = function(other){
    return (other.type === "Number") &&
      this.value === other.value;
  };

  me.toString = function(){
    return me.value.toString();
  }

  me.evaluate = function(){
    return me;//.value;
  }

  return me;
}

Number.sugar = function(unsugared){
  if( typeof unsugared === "number" ){
    return new Number(unsugared);
  } else {
    return unsugared;
  }
}
