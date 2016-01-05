import UnificationError from './unificationerror.js';

export class Var {
  identifier: string;
  type: string;

  constructor(identifier: string){
    this.identifier = identifier;
    this.type = "Var";
  }

  makeCopyWithFreshVarNames(delta){
    if(!delta.hasOwnProperty(this.identifier)){
      delta[this.identifier] = `_${this.identifier}${delta.__nextVarToken++}`;
    }
    return new Var(delta[this.identifier]);
  }

  rewrite(subst){
    if(subst.has(this.identifier)){
        return subst.get(this.identifier);
    } else {
        return this;
    }
  }

  unify(other, subst){
    switch(other.type){
    case "Var":
      if(this.identifier === other.identifier){
          return subst;
      } else {
          if(subst.has(other.identifier) || subst.has(this.identifier)){
              var t1 = subst.get(this.identifier) || this;
              var t2 = subst.get(other.identifier) || other;
              return t1.unify(t2, subst);
          } else {
              return subst.set(this.identifier, other);
          }
      }

    case "Clause":
    case "Number":
      return varUnify(this, other, subst);

    default:
      throw new UnificationError(`unification failed. unknown type combination ${this.type}, ${other.type}`);
    }
  }

  equals(other){
    return (other instanceof Var) &&
        this.identifier === other.identifier;
  }

  toString(){
    return `v(${this.identifier})`;
  }
}

Var.sugar = function(unsugared){
  return unsugared;
}

export function v(identifier: string): Var{
  return new Var(identifier);
}

function varUnify(variable, other, subst){
  if(subst.has(variable.identifier)){ //should be unifying
      return subst.get(variable.identifier).unify(other, subst);
  } else {
      subst = subst.set(variable.identifier, other.rewrite(subst));
      var delta = new Map([[variable.identifier, other.rewrite(subst)]]);
      while(delta.size !== 0){
          var newSubst = subst.map(t => t.rewrite(delta)).merge(delta);
          delta = new Map();
          for(var k  of newSubst.keys()){
              if(!subst.get(k).equals(newSubst.get(k))){
                  delta = delta.set(k, newSubst.get(k));
              }
          }
          subst = newSubst;
      }

      return subst;
  }
}
