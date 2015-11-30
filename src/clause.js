import Rule from './rule.js';

export default class Clause{
    //TODO: support chaining with .and and .or
    ruleSet: RuleSet;
    identifier: string;
    terms: Array<any>;

    constructor(ruleSet, identifier, terms){
      this.ruleSet = ruleSet;
      this.identifier = identifier;
      this.terms = terms;
    }

    if(...clauses){
      //TODO: do some error checking here
      return new Rule(this.ruleSet, this, clauses);
    }

    makeCopyWithFreshVarNames(delta){
      let newTerms = [];

      for(let term of this.terms){
          let newTerm = term.makeCopyWithFreshVarNames(delta);
          newTerms.push(newTerm);
      }
      return new Clause(this.ruleSet, this.identifier, newTerms);
    }

    rewrite(subst){
      return new Clause(this.ruleSet, this.identifier, this.terms.map(a => a.rewrite(subst)));
    }

    equals(other){
      return (other instanceof Clause) &&
        this.identifier === other.identifier &&
        this.terms.reduce((a,b,i) => a && (b.equals(other.terms[i])), true);
    }

    toString(){
      return `${this.identifier}(${
        this.terms.join(',')
      })`;
    }
}
