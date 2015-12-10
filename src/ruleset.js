import Clause from './clause.js';
import Rule from './rule.js';
import SubstGenerator from './substgenerator.js';

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

  let handler = {
    get: function(target, identifier){
      if(target.hasOwnProperty(identifier)){
        return target.identifier;
      }

      if(!target.ruleHeads.has(identifier)){
        target.ruleHeads.add(identifier);
      }

      return new Clause(target, identifier);
    }
  }

  me.rule = function(...rules: Array<Rule | Clause>): void{
    // rules.forEach(rule => {
    //   if(!(rule instanceof Rule || rule instanceof Clause)){
    //     console.error(rule.constructor.toString());
    //     throw new Error("RuleSet.rule() only accepts Rules and Clauses");
    //   }
    // });

    rules = rules.map((rule) => rule.hasOwnProperty("head") ?
        rule :
        new Rule(me, rule, [])
    )
    me.rules = me.rules.concat(rules);
  };

  me.query = function(...clauses: Array<Clause>){
    clauses.forEach(clause => {
      if(!clause instanceof Clause){
        throw new Error("RuleSet.query() only accepts Clauses");
      }
    });

    return new SubstGenerator(me, clauses);
  };

  return new Proxy(me, handler);
}
