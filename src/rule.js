export default class Rule{
  ruleSet: RuleSet;
  head: Clause;
  body: Array<Clause>;

  constructor(ruleSet, head, body){
    this.ruleSet = ruleSet;
    this.head = head;
    this.body = body;
  }

  makeCopyWithFreshVarNames(){
    let newBody = [];
    let delta = {
      __nextVarToken: this.ruleSet.nextVarToken
    };

    let newHead = this.head.makeCopyWithFreshVarNames(delta);
    for(let clause of this.body){
        let newClause = clause.makeCopyWithFreshVarNames(delta);
        newBody.push(newClause);
    }
    return new Rule(this.ruleSet, newHead, newBody);
  }

  toString(){
    return `${this.head} :-
      ${this.body.join('\n  ')}`;
  }
}
