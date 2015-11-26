function Rule(ruleSet, head, body){
  let me = {};

  me.makeCopyWithFreshVarNames = function(){
    let newBody = [];
    let delta = {
      __nextVarToken = ruleSet.nextVarToken;
    };

    let newHead = this.head.makeCopyWithFreshVarNames(delta);
    for(let clause of this.body){
        let newClause = clause.makeCopyWithFreshVarNames(delta);
        newBody.push(newClause);
    }
    return new Rule(ruleSet, newHead, newBody);
  }

  me.head = head;
  me.body = body;
}
