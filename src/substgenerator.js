import { Map } from 'immutable';


export default class SubstGenerator{
  ruleSet: RuleSet;
  q_clauses: Array<Clause>;
  processingStack: Array<ClauseProcessor>;

  constructor(ruleSet: RuleSet, q_clauses: List<Clause>){
    this.ruleSet = ruleSet;
    this.q_clauses = q_clauses;
  }

  next(){ //combinatorial set of solns to all clauses

  }
}

class ClauseProcessor {
  clause: Clause;

  rest: Array<Clause>; //TODO: make this type decl more specific
  restGenerator: ClauseProcessor;

  rules: rules;
  relevantRules: Array<Rule>;

  subst: Map<string, any>;
  solutionsSeen: Array<Map<string, any>>;

  constructor(clause, rest, rules, subst, solutionsSeen){
    this.clause = clause;
    this.rest = rest;
    this.restGenerator = null;

    this.rules = rules;
    this.relevantRules = rules.filter((r)=> this.clause.identifier === r.head.identifier).values();

    this.subst = subst;
    this.solutionsSeen = solutionsSeen;
  }

  next(){ //generates all substitutions for this clause, given a substitution
    let nextSubst;

    if(restGenerator &&
        !(nextSubst = restGenerator.next()).done ){
          return nextSubst.value;

    } else {
      while(this.relevantRules.length > 0){
        let r = this.relevantRules.shift().makeCopyWithFreshVarNames();
        console.info(this.clause.toString(), r.head.toString(), this.subst.toString());

        //unify r.head
        let solution = unify(this.clause, r.head, this.subst);

        //push r.body
        let nextRules = this.rest.concat(r.body);
        if(nextRules.length > 0){
          this.restGenerator = new ClauseProcessor(nextRules[0], nextRules.slice(1), this.rules, this.subst);
          nextSubst = this.restGenerator.next();
          if(!nextSubst.done){
            return nextSubst.value;
          }

        } else {
          console.info("candidate:", solution.toString());
          if(!this.solutionsSeen.find(sbst => equivalentSolns(solution, sbst, this.freeVars))){
            console.info("accepted");
            this.solutionsSeen.push(solution);
            return {
              value: solution,
              done: false
            }; //TODO: add filter for equivalent solutions
          }
        }
      }
      return {done: true};
    }
  }

}


      for(let i = r.body.length-1; i>=0; i--){
        this.unificationStack.push(r.body[i])
      }
      this.unificationStack.push(r.head);

      console.info(this.query.toString(), r.head.toString(), this.subst.toString());

      while(!(this.unificationStack.length > 0)){

      }


        try{
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
