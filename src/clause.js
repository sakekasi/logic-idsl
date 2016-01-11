import Rule from './rule.js';

import Number from './number.js';
import { Var } from './var.js';

var types = [Number, Clause, Var];

import UnificationError from './unificationerror.js';

export default function Clause(ruleSet, identifier, terms){
  let me = function(){};

  me.ruleSet = ruleSet;
  me.identifier = identifier;
  me.terms = terms || [];
  me.type = "Clause";

  let clause;

  var handler = {
    apply(target, thisArg, terms){
      // return new Clause(target.ruleSet, target.identifier, terms);
      target.terms = terms.map(term => {
        for(let i = 0; i < types.length; i++){
          let type = types[i];
          let sugared = type.sugar(term);
          if(sugared !== term){
            return sugared;
          }
        }
        return term;
      });

      return target;
    }
  }

  clause = new Proxy(me, handler);

  me.if = function(...clauses){
    //TODO: do some error checking here
    return new Rule(this.ruleSet, this, clauses);
  }

  me.makeCopyWithFreshVarNames = function(delta){
    let newTerms = [];

    for(let term of this.terms){
        let newTerm = term.makeCopyWithFreshVarNames(delta);
        newTerms.push(newTerm);
    }
    return new Clause(this.ruleSet, this.identifier, newTerms);
  };

  me.rewrite = function(subst){
    return new Clause(this.ruleSet, this.identifier, this.terms.map(a => a.rewrite(subst)));
  };

  me.unify = function(other, subst){
    switch(other.type){
    case "Var":
      return other.unify(me, subst);

    case "Clause":
      if(me.identifier === other.identifier){
          for(var i = 0; i< me.terms.length; i++){
              subst = me.terms[i].unify(other.terms[i].rewrite(subst), subst);
          }
          return subst;
      } else {
          throw new UnificationError("unification failed");
      }

    case "Number":
      return other.unify(me, subst);

    default:
      throw new UnificationError(`unification failed. unknown type combination ${me.type}, ${other.type}`);
    }
  };

  me.equals = function(other){
    return (other.type === "Clause") &&
      this.identifier === other.identifier &&
      this.terms.reduce((a,b,i) => a && (b.equals(other.terms[i])), true);
  }

  me.toString = function(){
    return `${me.identifier}(${
      me.terms.join(',')
    })`;
  };

  me.evaluate = function(subst){
    switch(me.identifier){
      case "plus":
        if(me.terms.length === 1){
          return  new Number(+(me.terms[0].evaluate().value));
        } else if(me.terms.length === 2){
          return new Number(
            (me.terms[0].evaluate().value) +
            (me.terms[1].evaluate().value)
          );
        }
        break;

      case "minus":
        if(me.terms.length === 1){
          return  new Number(-(me.terms[0].evaluate().value));
        } else if(me.terms.length === 2){
          return new Number(
            (me.terms[0].evaluate().value) -
            (me.terms[1].evaluate().value)
          );
        }
        break;

      case "times":
        if(me.terms.length === 2){
          return new Number(
            (me.terms[0].evaluate().value) *
            (me.terms[1].evaluate().value)
          );
        }
        break;

      case "divide":
        if(me.terms.length === 2){
          return new Number(
            (me.terms[0].evaluate().value) /
            (me.terms[1].evaluate().value)
          );
        }
        break;

      case "modulo":
        if(me.terms.length === 2){
          return new Number(
            (me.terms[0].evaluate().value) %
            (me.terms[1].evaluate().value)
          );
        }
        break;

    }

    throw new Error(`cannot evaluate clause ${me.toString()}`);
  };

  return clause;
}

Clause.sugar = function(unsugared){
  return unsugared;
}
