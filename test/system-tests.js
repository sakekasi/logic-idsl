var assert = chai.assert;

describe('Syntactic Operations', function(){
  var _;

  beforeEach(function(){
    _ = new RuleSet();
  });

  it('can create a var', function(){
    var X = _.X;
    assert.instanceOf(X, Var);
  });

  it('can create a clause', function(){
    var test = _.test;

    assert.strictEqual(test.type, "Clause", "test is a Clause");
    assert.strictEqual(test.identifier, "test", "test's identifier is 'test'");
    assert.strictEqual(test.terms.length, 0, "test is an Atom");
  });

  it('can create a clause with arguments', function(){
    var a = _.a;
    var test = _.test(a);

    assert.strictEqual(test.type, "Clause", "test is a Clause");
    assert.strictEqual(test.identifier, "test", "test's identifier is 'test'");
    assert.strictEqual(test.terms.length, 1, "test has 1 term");

    assert.strictEqual(test.terms[0].identifier, "a", "test's term has identifier 'a'");
    assert.strictEqual(test.terms[0].terms.length, 0, "test's term is an Atom");
  });

  it('interns a rule in the ruleset', function(){
    var internedRule = _.rule.test;

    assert.strictEqual(_.rules.length, 1, "ruleSet has 1 rule");

    assert.strictEqual(internedRule, _.rules[0], "returned rule is same as interned rule");

    assert.strictEqual(_.rules[0].type, "Rule", "interned rule is a Rule");
    assert.strictEqual(_.rules[0].head.identifier, "test", "interned rule head has identifier 'test'");
    assert.strictEqual(_.rules[0].head.terms.length, 0, "interned rule head is an Atom");

    assert.strictEqual(_.rules[0].body.length, 0, "interned rule has no body");
    assert.strictEqual(_.rules[0].ruleSet, _, "interned rule refers to ruleSet");
  });

  it('interns a rule with arguments in the ruleset', function(){
    var internedRule = _.rule.test(_.a);

    assert.strictEqual(_.rules.length, 1, "ruleSet has 1 rule");

    assert.strictEqual(internedRule, _.rules[0], "returned rule is same as interned rule");

    assert.strictEqual(_.rules[0].type, "Rule", "interned rule is a Rule");
    assert.strictEqual(_.rules[0].head.identifier, "test", "interned rule head has identifier 'test'");
    assert.strictEqual(_.rules[0].head.terms.length, 1, "interned rule head has 1 term");

    assert.strictEqual(_.rules[0].head.terms[0].identifier, "a", "interned rule head's term has identifier 'a'");
    assert.strictEqual(_.rules[0].head.terms[0].terms.length, 0, "interned rule head's term is an Atom");

    assert.strictEqual(_.rules[0].body.length, 0, "interned rule has no body");
    assert.strictEqual(_.rules[0].ruleSet, _, "interned rule refers to ruleSet");
  });

  it('interns a rule with args and body in the ruleset', function(){
    var newRule = _.rule.nat(_.s(_.X));

    assert.strictEqual(_.rules.length, 1, "ruleSet has 1 rule");
    assert.strictEqual(_.rules[0].ruleSet, _, "interned rule refers to ruleSet");

    assert.strictEqual(_.rules[0].type, "Rule", "interned rule is a Rule");
    assert.strictEqual(_.rules[0].head.identifier, "nat", "interned rule head has identifier 'nat'");
    assert.strictEqual(_.rules[0].head.terms.length, 1, "interned rule head has 1 term");

    assert.strictEqual(_.rules[0].head.terms[0].identifier, "s", "interned rule head's term has identifier 's'");
    assert.strictEqual(_.rules[0].head.terms[0].terms.length, 1, "interned rule head's term has 1 term");

    assert.instanceOf(_.rules[0].head.terms[0].terms[0], Var, "interned rule head's term's term is a Var");
    assert.strictEqual(_.rules[0].head.terms[0].terms[0].identifier, "X", "interned rule head's term's term has identifier 'X'");

    assert.strictEqual(_.rules[0].body.length, 0, "interned rule has no body");

    var rule = newRule.if(
          _.nat(_.X)
      )
    ;

    assert.strictEqual(rule, _.rule, "'if' returns ruleSet.rule");
    assert.strictEqual(_.rules.length, 1, "ruleSet has 1 rule");

    assert.strictEqual(_.rules[0].body.length, 1, "interned rule has body length 1");

    assert.strictEqual(_.rules[0].body[0].type, "Clause", "interned rule's body clause is a Clause");
    assert.strictEqual(_.rules[0].body[0].identifier, "nat", "interned rule's body clause has identifier 'nat'");
    assert.strictEqual(_.rules[0].body[0].terms.length, 1, "interned rule's body clause has 1 term");

    assert.instanceOf(_.rules[0].body[0].terms[0], Var, "interned rule's body clause's term is a Var");
    assert.strictEqual(_.rules[0].body[0].terms[0].identifier, "X", "interned rule's body clause's term has identifier 'X'");
  });

  it('interns several chained rules', function(){
    var interned_a = _.rule.a;

    assert.strictEqual(_.rules.length, 1, "ruleSet has 1 rule");
    assert.strictEqual(interned_a, _.rules[0], "interned rule is same as one returned");
    assert.strictEqual(_.rules[0].ruleSet, _, "interned rule refers to ruleSet")

    assert.strictEqual(_.rules[0].type, "Rule", "interned rule is a Rule");
    assert.strictEqual(_.rules[0].head.identifier, "a", "interned rule head has identifier 'a'");
    assert.strictEqual(_.rules[0].head.terms.length, 0, "interned rule head has no terms");

    var interned_b = interned_a.b

    assert.strictEqual(_.rules.length, 2, "ruleSet has 2 rules");
    assert.strictEqual(interned_b, _.rules[1], "interned rule is same as one returned");
    assert.strictEqual(_.rules[1].ruleSet, _, "interned rule refers to ruleSet")

    assert.strictEqual(_.rules[1].type, "Rule", "interned rule is a Rule");
    assert.strictEqual(_.rules[1].head.identifier, "b", "interned rule head has identifier 'b'");
    assert.strictEqual(_.rules[1].head.terms.length, 0, "interned rule head has no terms");

    var interned_c = interned_b.c;

    //TODO: comparing unequal clauses leads to infinite recursion in chai assertions

    assert.strictEqual(_.rules.length, 3, "ruleSet has 3 rules");
    assert.strictEqual(interned_c, _.rules[2], "interned rule is same as one returned");
    assert.strictEqual(_.rules[2].ruleSet, _, "interned rule refers to ruleSet")

    assert.strictEqual(_.rules[2].type, "Rule", "interned rule is a Rule");
    assert.strictEqual(_.rules[2].head.identifier, "c", "interned rule head has identifier 'c'");
    assert.strictEqual(_.rules[2].head.terms.length, 0, "interned rule head has no terms");
  });

  it('comparing clauses', function(){
    var a = _.a;
    var b = _.b;

    assert.strictEqual(a, a, "a === a");
    assert.strictEqual(b, b, "b === b");
    assert.notStrictEqual(a, b, "a !== b");
    assert.notStrictEqual(b, a, "b !== a");
  });

  it('works inside a with statement', function(){
    with(_){
      rule
        .person(alice)
        .person(bob)
      ;
    }

    var it = _.query
      .person(_.X)
    ;

    var solutions = ["alice()", "bob()"];
    var i = 0;

    var next = it.next();
    assert.ok(!next.done, "next isn't done");
    while(!next.done){
      console.log(next.value.toString());
      assert.strictEqual(next.value.get("X").toString(), solutions[i]);

      next = it.next();
      i++;
    }
  });

});
