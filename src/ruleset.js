export default function RuleSet() Function {
  let me = function(identifier){
    if(!this.ruleHeads.has(identifier)){
      this.add(identifier);
    }

    return function(...terms){
      return new Clause(me, identifier, ...terms);
    }
  };

  me.rule = function(...rules: Array<Rule | Clause>): void{
    rules.forEach(rule => {
      if(!(rule instanceof Rule || rule instanceof Clause)){
        throw new Error("RuleSet.rule() only accepts Rules and Clauses");
      }
    });

    rules.map((rule) => rule instanceof Rule ?
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

  me.ruleHeads = new Set();
  me.rules = [];
  me.nextVarToken = 0;

  return me;
}
