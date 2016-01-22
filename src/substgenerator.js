import { Map } from 'immutable';

import Rule from './rule.js';
import Clause from './clause.js';
import { Var, Atom } from './var.js';
import Number from './number.js';
import UnificationError from './unificationerror.js';

var types = [Number, Clause, Var];

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
    lastClause.terms = terms.map(term => {
      for(let i = 0; i < types.length; i++){
        let type = types[i];
        let sugared = type.sugar(term);
        if(sugared !== term){
          return sugared;
        }
      }
      return term;
    });

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

//TODO: this code is really ugly. rework plz

class ClauseProcessor {
  currentItem: Clause | Generator;

  rest: Array<Clause>;
  restGenerator: ClauseProcessor;

  rules: Array<Rule>;
  relevantRules: Array<Rule>;

  subst: Map<string, any>;
  solutionsSeen: Array<Map<string, any>>;
  freeVars: Array<string>;

  constructor(currentItem, rest, rules, subst, solutionsSeen, freeVars){
    this.currentItem = currentItem.type === "Clause" ?
      currentItem:
      currentItem(subst); //TODO: this may be a generator

    this.terminationCondition = currentItem.type === "Clause" ?
      () => this.relevantRules.length === 0:
      (next) => next.done;

    this.rest = rest;
    this.restGenerator = null;

    this.rules = rules;
    this.relevantRules = this.currentItem.type === "Clause" ?
      rules.filter((r)=> this.currentItem.identifier === r.head.identifier):
      null;

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
      let nextRules = this.rest;
      let nextSubst;

      //if the current item is a generator, we just take the solution it generates
      // given the current substitution as our prospective solution.
      if(this.currentItem.constructor.name === "Generator" ||
        ("next" in this.currentItem && this.currentItem.next instanceof Function)){
        nextSubst = this.currentItem.next();
      }

      while(!this.terminationCondition(nextSubst)){

        //this section handles the head unificaiton and the body of the clause structure
        if(this.currentItem.type === "Clause"){
          let r = this.relevantRules.shift().makeCopyWithFreshVarNames();
          // console.info("\nGENERATOR:",this.clause.toString(), r.head.toString(), `[${r.body.map(x=>x.toString()).join(',')}]`, this.subst.toString());

          //unify r.head
          let solution;
          try{
            solution = this.currentItem.unify(r.head, this.subst);
          } catch(e) {
            if(e.hasOwnProperty("isUnificationError") && e.isUnificationError){//instanceof UnificationError){
              // console.info("FAIL");
              continue;
            } else {
              throw e;
            }
          }

          nextSubst = solution;

          if(typeof r.body === "function"){
            let call = (subst, ...clauses) => {
              if(clauses.length < 1){
                throw new Error("Improper use of call. Must pass at least one clause");
              }

              return new ClauseProcessor(clauses[0], clauses.slice(1),
                                         this.rules, subst,
                                         this.solutionsSeen, getFreeVars(clauses));
            }

            //what if were binding something other than vars?
            //let bindings = r.head.terms.map(())
            let bindings = getBindings(r.head.terms, solution);
            let next = r.body(solution, call, ...bindings);

            if(next === false){
              continue; //TODO: is this a correct impl of backtrack?
            } else if( next instanceof Map ){
              nextSubst = next;
            } else if( next.constructor.name === "GeneratorFunction" ||
                       next instanceof Function){
              nextRules = nextRules.concat(next);
            } else if(Array.isArray(next)){
              nextSubst = next.shift();
              nextRules = nextRules.concat(next);
            } else if(next !== true){
              throw new Error("invalid return from native rule implementation");
            }
          } else if(Array.isArray(r.body)){
            nextRules = nextRules.concat(r.body);
          }
        } else if (this.currentItem.constructor.name === "Generator" ||
          ("next" in this.currentItem && this.currentItem.next instanceof Function)){
            nextSubst = nextSubst.value;
        }

        //logic to see if we passthrough to another generator or if we are at
        // the end of the generator chain
        if(nextRules.length > 0){
          this.restGenerator = new ClauseProcessor(nextRules[0], nextRules.slice(1),
                                                    this.rules, nextSubst,
                                                    this.solutionsSeen, this.freeVars);
          nextSubst = this.restGenerator.next();
          if(!nextSubst.done){
            return nextSubst;
          }

        } else {
          // console.info("candidate:", solution.toString());
          if(!this.solutionsSeen.find(sbst => equivalentSolns(nextSubst, sbst, this.freeVars))){
            // console.info("accepted");
            this.solutionsSeen.push(nextSubst);
            return {
              value: nextSubst,
              done: false
            };
          }
        }

      }

    }

    return {done: true};
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

function getBindings(query, subst){
    if(query instanceof Array){
        return query.map(q => getBindings(q, subst)).reduce((a,b) => a.concat(b), []);
    } else if(query instanceof Clause){
        return query.terms.map(t => getBindings(t, subst)).reduce((a,b) => a.concat(b), []);
    } else if(query instanceof Var){
        let bound = subst.get(query.identifier);
        if(bound){
          return [bound];
        } else { //return the var if unbound
          return [query];
        }
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
