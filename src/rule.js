import Number from './number.js';
import Clause from './clause.js';
import { Var } from './var.js';

import {sugar, desugar} from './sugar.js';


//since rules are self-modifying on call, etc, one should not
//interact with rule objects directly.

export default function Rule(ruleSet, head, body){
  let me = function(){};

  me.ruleSet = ruleSet;
  me.head = head;
  me.body = body || [];
  me.type = "Rule";

  let rule;

  let handler = {
    has(target, identifier){
      return true;
    },

    get(target, identifier){
      if(target[identifier] !== undefined
         || target.hasOwnProperty(identifier)){
        return target[identifier];
      }

      return target.ruleSet.rule[identifier]; //may be wrong
    },

    apply(target, thisArg, terms){
      target.head.terms = terms.map(term => desugar(me.ruleSet, term));

      return rule;
    }
  }

  rule = new Proxy(me, handler);

  me.if = function(...clauses){
    if(clauses.length === 1
       && typeof clauses[0] === "function"
       && !("type" in clauses[0])){
      me.body = clauses[0]; //set it to the native function
    } else {
      me.body = clauses;
    }

    return me.ruleSet.rule; //allow chaining
  };

  me.makeCopyWithFreshVarNames = function(){
    let newBody;
    let delta = {
      __nextVarToken: me.ruleSet.nextVarToken
    };

    let newHead = me.head.makeCopyWithFreshVarNames(delta);
    if(Array.isArray(me.body)){
      newBody = [];
      for(let clause of me.body){
          let newClause = clause.makeCopyWithFreshVarNames(delta);
          newBody.push(newClause);
      }
    } else {
      newBody = me.body;
    }

    me.ruleSet.nextVarToken = delta.__nextVarToken;
    return new Rule(me.ruleSet, newHead, newBody);
  };

  me.toString = function(){
    return `${me.head} :-
      ${me.body.join('\n  ')}`;
  };

  return rule;
}
