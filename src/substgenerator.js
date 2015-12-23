import { Map } from 'immutable';

import Rule from './rule.js';
import Clause from './clause.js';
import { Var, Atom } from './primitives.js';

export default function SubstGenerator(ruleSet: RuleSet, ...clauses: Array<Clause>){
  let me = function(){};

  me.ruleSet = ruleSet;
  me.q_clauses = [];

  me.addClause = function(clause){
    me.q_clauses.push(clause);
    if(me.q_clauses.length === 1){
      me.makeProcessor();
    }
  };

  me.makeProcessor = function(){
    me.processor = new ClauseProcessor(
      me.q_clauses[0],
      me.q_clauses.slice(1),
      me.ruleSet.rules,
      new Map(),
      [],
      getFreeVars(me.q_clauses)
    );
  }

  me.addTerms = function(terms){
    let lastClause = me.q_clauses[me.q_clauses.length - 1];
    lastClause.terms = terms;
    me.makeProcessor();
  };

  clauses.forEach((clause) =>
    me.addClause(clause)
  );

  let substGenerator;

  let handler = {
    get(target, identifier){
      if(target[identifier] !== undefined
         || target.hasOwnProperty(identifier)){
        return target[identifier];
      }

      target.addClause(target.ruleSet[identifier]);
      return substGenerator;
    },

    apply(target, thisArg, terms){
      target.addTerms(terms);
      return substGenerator;
    }
  };

  substGenerator = new Proxy(me, handler);

  me.next = function(){
    let nextSubst = me.processor.next();
    if(!nextSubst.done){ //remove intermediate variables
      nextSubst.value = nextSubst.value.filter((_,k)=> k.charAt(0) !== "_");
    }
    return nextSubst;
  };

  return substGenerator;
}

class ClauseProcessor {
  clause: Clause;

  rest: Array<Clause>;
  restGenerator: ClauseProcessor;

  rules: Array<Rule>;
  relevantRules: Array<Rule>;

  subst: Map<string, any>;
  solutionsSeen: Array<Map<string, any>>;
  freeVars: Array<string>;

  constructor(clause, rest, rules, subst, solutionsSeen, freeVars){
    this.clause = clause;
    this.rest = rest;
    this.restGenerator = null;

    this.rules = rules;
    this.relevantRules = rules.filter((r)=> this.clause.identifier === r.head.identifier);//.values();

    this.subst = subst;
    this.solutionsSeen = solutionsSeen;
    this.freeVars = freeVars;
  }

  next(){ //generates all substitutions for this clause, given a substitution
    let nextSubst;

    if(this.restGenerator &&
        !(nextSubst = this.restGenerator.next()).done ){
          return nextSubst;

    } else {
      while(this.relevantRules.length > 0){
        let r = this.relevantRules.shift().makeCopyWithFreshVarNames();
        // console.info("\nGENERATOR:",this.clause.toString(), r.head.toString(), `[${r.body.map(x=>x.toString()).join(',')}]`, this.subst.toString());

        //unify r.head
        let solution;
        try{
          solution = unify(this.clause, r.head, this.subst);//FIX: issue in here
        } catch(e) {
          if(e.hasOwnProperty("isUnificationError") && e.isUnificationError){//instanceof UnificationError){
            // console.info("FAIL");
            continue;
          } else {
            throw e;
          }
        }

        //push r.body
        let nextRules = this.rest.concat(r.body);
        if(nextRules.length > 0){
          this.restGenerator = new ClauseProcessor(nextRules[0], nextRules.slice(1),
                                                    this.rules, solution,
                                                    this.solutionsSeen, this.freeVars);
          nextSubst = this.restGenerator.next();
          if(!nextSubst.done){
            return nextSubst;
          }

        } else {
          // console.info("candidate:", solution.toString());
          if(!this.solutionsSeen.find(sbst => equivalentSolns(solution, sbst, this.freeVars))){
            // console.info("accepted");
            this.solutionsSeen.push(solution);
            return {
              value: solution,
              done: false
            };
          }
        }
      }
      return {done: true};
    }
  }

}

function getFreeVars(query){
    if(query instanceof Array){
        return query.map(q => getFreeVars(q)).reduce((a,b) => a.concat(b), []);
    } else if(query instanceof Clause){
        return query.terms.map(q => getFreeVars(q)).reduce((a,b) => a.concat(b), []);
    } else if(query instanceof Var){
        return [query.identifier];
    }
};

function equivalentSolns(a, b, freeVars){
    return freeVars.map(v => {
        if(a.has(v) && b.has(v)){
            return a.get(v).equals(b.get(v));
        }
        return false;
    }).reduce((a,b) => a && b, true);
};

function unify(term1, term2, subst){
    // console.info("UNIFY", term1.toString(), term2.toString(), subst.toString());
    if(term1.type === "Var" && term2.type === "Var"){
        if(term1.identifier === term2.identifier){
            return subst;
        } else {
            if(subst.has(term2.identifier) || subst.has(term1.identifier)){
                var t1 = subst.get(term1.identifier) || term1;
                var t2 = subst.get(term2.identifier) || term2;
                return unify(t1, t2, subst);
            } else {
                return subst.set(term1.identifier, term2);
            }
        }
    } else if(term1.type === "Var" && term2.type === "Clause"){
        if(subst.has(term1.identifier)){ //should be unifying
            return unify(subst.get(term1.identifier), term2, subst);
        } else {
            subst = subst.set(term1.identifier, term2.rewrite(subst));
            var delta = new Map([[term1.identifier, term2.rewrite(subst)]]);
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
    } else if(term2.type === "Var" && term1.type === "Clause"){
      return unify(term2, term1, subst);
    } else if(term1.type === "Clause" && term2.type === "Clause"){
        if(term1.identifier === term2.identifier){
            for(var i = 0; i< term1.terms.length; i++){
                subst = unify(term1.terms[i], term2.terms[i].rewrite(subst), subst);
            }
            return subst;
        } else {
            throw new UnificationError("unification failed");
        }
    } else {
      throw new UnificationError(`unification failed. unknown type combination ${term1.type}, ${term2.type}`);
    }
    // else if(term1 instanceof Atom && term2 instanceof Atom){
    //   if(term1.identifier === term2.identifier){
    //     return subst;
    //   } else {
    //     throw new UnificationError(`unification failed. ${term1} !== ${term2}`);
    //   }
    // } else if( term1 instanceof Atom && term2.type === "Clause" ) {
    //   throw new UnificationError(`unification failed. ${term1} !== ${term2}`);
    // } else if( term1.type === "Clause" && term2 instanceof Atom ) {
    //   throw new UnificationError(`unification failed. ${term1} !== ${term2}`);
    // }
}

class UnificationError extends Error{
  constructor(msg){
    super(msg);
    this.isUnificationError = true;
  }
}
