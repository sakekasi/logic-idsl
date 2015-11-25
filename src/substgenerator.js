
export default class SubstGenerator{
  rules: RuleSet;
  q_clauses: List<Clause>;
  processingStack: Array<QueryProcessingUnit>;

  constructor(rules: RuleSet, q_clauses: List<Clause>){
    this.rules = rules;
    this.q_clauses = q_clauses;
  }


}

class QueryProcessingUnit {
  query: Clause;
  relevantRules: Set<Rule>;
  unificationStack: Array< [any, any] >; //TODO: make this type decl more specific

  constructor(query, rules, subst){
    this.query = query;
    this.relevantRules = rules.filter((r)=> this.query.name === r.head.name).values();
    this.unificationStack = [];
  }

  next(){
    var r = //TODO
  }
}

var SubstGenerator = function(queries, rules, subst, freeVars){
    this.nextQueries = queries.slice(1);
    this.rules = rules;
    this.subst = subst;
    this.freeVars = freeVars;

    this.i = 0;
    this.query = queries[0]
    this.relevantRules = rules.filter((r) => this.query.name === r.head.name);
};
SubstGenerator.prototype.nextMap = function(){
    if(this.nextClauseGenerator){
        var solution;
        while(this.nextClauseGenerator.nextMap()){
        }
        this.nextClauseGenerator = undefined;
    }

    while(this.i < this.relevantRules.length){
        var r = this.relevantRules[this.i++].makeCopyWithFreshVarNames();

        try{
            console.info(this.query.toString(), r.head.toString(), this.subst.toString());
            var newSubst = unify(this.query, r.head, this.subst);
            var newQuery = this.nextQueries.concat(r.body);
            if(newQuery.length > 0){
                this.nextClauseGenerator = new SubstGenerator(newQuery, this.rules, newSubst, this.freeVars);
                var solution;
                while(this.nextClauseGenerator.nextMap()){
                }
            } else {
                var solution = newSubst;
                console.info("candidate:", solution.toString());
                if(!solutions.find(sbst => equivalentSolns(solution, sbst, this.freeVars))){
                    console.info("accepted");
                    solutions = solutions.add(solution);
                    throw solution;
                }
            }
        } catch(e) {
            if(e instanceof UnificationError){
                console.info("unification failed");
                continue;
            } else {
                throw e;
            }
        }
    }
    return false;
};
SubstGenerator.prototype.next = function(){
    try{
        if(!this.nextMap()){
            return false;
        }
    } catch (e) {
        if(e instanceof Immutable.Map){
            return Subst.fromMap(e);
        } else {
            throw e;
        }
    }
};


Program.prototype.solve = function() {
    nextVarToken = 0;
    solutions = Immutable.Set();
    var freeVars = getFreeVars(this.query);
    var rules = this.rules;//.map(r => r.makeCopyWithFreshVarNames()); //might want to do this dynamically
    return new SubstGenerator(this.query, rules, Immutable.Map(), freeVars);
};
