export default function Clause(ruleSet, identifier, terms){
  let me = {};
  // function(identifier){
  //   return ruleSet(identifier);
  // }

  me.if = function(...clauses){
    //TODO: do some error checking here
    return new Rule(ruleSet, me, clauses);
  }

  me.makeCopyWithFreshVarNames = function(delta){
    let newTerms = [];

    for(let term of this.terms){
        let newTerm = term.makeCopyWithFreshVarNames(delta);
        newArgs.push(newTerm);
    }
    return new Clause(ruleset, this.identifier, newTerms);
  }

  //TODO: support chaining with .and and .or

  me.identifier = identifier;
  me.terms = terms;
}
