import Clause from './clause.js';
import Rule from './rule.js';
import SubstGenerator from './substgenerator.js';
import { Var } from './var.js';

//TODO: find some way to identify type of stuff

export default function RuleSet(): Function {
  let me = function(identifier){
    if(!me.ruleHeads.has(identifier)){
      me.ruleHeads.add(identifier);
    }

    return function(...terms){
      return new Clause(me, identifier, terms);
    }
  };

  me.ruleHeads = new Set();
  me.rules = [];
  me.nextVarToken = 0;

  let ruleSet; //proxy for me

  let handler = {//override 'has' for use within with
    has(target, identifier){
      return true;
    },

    get(target, identifier){
      if(target[identifier] !== undefined
         || target.hasOwnProperty(identifier)){
        return target[identifier];
      }

      if(typeof identifier !== "string"){
        return target[identifier]; //shoudl be undefined
      } else if(identifier.charAt(0) === identifier.charAt(0).toUpperCase()){
        return new Var(identifier);
      } else {
        return new Clause(ruleSet, identifier);
      }
    }
  }

  ruleSet = new Proxy(me, handler);

  let ruleHandler = {
    has(target, identifier){
      return true;
    },

    get(target, identifier){
      if(target[identifier] !== undefined
         || target.hasOwnProperty(identifier)){
        return target[identifier];
      }

      let newClause = ruleSet[identifier];
      let newRule = new Rule(ruleSet, newClause, [])
      me.rules.push(newRule);
      me.ruleHeads.add(identifier);

      return newRule;
    }
  };

  me.rule = new Proxy({}, ruleHandler);

  let queryHandler = {
    has(target,identifier){
      return true;
    },

    get(target, identifier){
      let newClause = handler.get(me, identifier);

      return new SubstGenerator(ruleSet, newClause);
    }
  }

  me.query = new Proxy({}, queryHandler);
  return ruleSet;
}
