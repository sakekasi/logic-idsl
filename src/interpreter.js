import { Set } from 'immutable';

type ruleSetAble = SetIterable<Rule> | IndexedIterable<Rule> | Array<Rule> | Iterator<Rule> | Object;

export default class RuleSet extends Set<Rule>{
  constructor(rules=null : ruleSetAble?){
    if(rules){
      this.rules = new List(rules);
    } else {
      this.rules = new List();
    }
  }

  query(q_clauses: List<Clause>): SubstGenerator{
    return new SubstGenerator(this, q_clauses);
  }
}
