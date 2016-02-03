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

  it('can create a rule with a function body', function(){
    with(_){
      rule
        .true.if(function(){
          return true;
        });
    }

    assert.strictEqual(_.rules.length, 1, "ruleSet has 1 rule");

    assert.strictEqual(_.rules[0].type, "Rule", "interned rule is a Rule");
    assert.strictEqual(_.rules[0].head.identifier, "true", "interned rule head has identifier 'true'");
    assert.strictEqual(_.rules[0].head.terms.length, 0, "interned rule head is an Atom");

    assert.typeOf(_.rules[0].body, "function", "rule body is a function");
    assert.ok(_.rules[0].body(), "calling rule body returns true");
    assert.strictEqual(_.rules[0].ruleSet, _, "interned rule refers to ruleSet");
  });

  it('desugars a Number to its value', function(){
    with(_){
      rule
        .isNumber(5)
      ;
    }

    var it = (()=>{with(_){
      return query
        .isNumber(X)
      ;
    }})();

    var next = it.next();
    assert.ok(!next.done, "the query returns a substitution");
    assert.isDefined(next.value, "there is a substitution in the iterator");
    assert.isNumber(next.value.get("X"), "the Number is desugared to a number");
    assert.strictEqual(next.value.get("X"), 5);
  });

  it('[1,2,3,4,5] -> cons(1, cons(2, cons(3, cons(4, cons(5, NIL)))))', function(){
    var test = _.test([1,2,3,4,5]);

    assert.strictEqual(test.terms[0].type, "Clause", "test's term is a Clause");
    assert.strictEqual(test.terms[0].identifier, "cons", "test's identifier is a cons");
    assert.strictEqual(test.terms[0].toString(), "cons(1,cons(2,cons(3,cons(4,cons(5,nil())))))");
  });

  it('[H, rest(T)] -> cons(H, T)', function(){
    var test = _.test([_.H, rest(_.T)]);

    assert.strictEqual(test.terms[0].type, "Clause", "test's term is a Clause");
    assert.strictEqual(test.terms[0].identifier, "cons", "test's identifier is a cons");
    assert.strictEqual(test.terms[0].toString(), "cons(v(H),v(T))");
  });

  it('[1,2,3,Z, rest(Y)] -> cons(1, cons(2, cons(3, cons(Z, Y))))', function(){
    var test = _.test([1,2,3,_.Z, rest(_.Y)]);

    assert.strictEqual(test.terms[0].type, "Clause", "test's term is a Clause");
    assert.strictEqual(test.terms[0].identifier, "cons", "test's identifier is a cons");
    assert.strictEqual(test.terms[0].toString(), "cons(1,cons(2,cons(3,cons(v(Z),v(Y)))))");
  });

  it('desugars arrays to their original form', function(){
    var arr = [1,2,3,4,5];
    _.rule
      .arr(arr)
    ;

    var it = _.query
      .arr(_.X)
    ;

    var next = it.next();

    assert.ok(!next.done, "query returns results");
    assert.isArray(next.value.get("X"), "list desugared");
    assert.strictEqual(arr.length, next.value.get("X").length, "input and output lists have the same length");

    arr.forEach((v, i) =>{
      assert.strictEqual(v, next.value.get("X")[i], `element ${i} is the same between lists`);
    });
  });

  it('allows for use of reserved keywords', function(){
    with(_.reserved){
      rule
        .one([1, rest(nil)])
      ;
    }

    var it = _.query
      .one([1])
    ;

    var next = it.next();

    assert.ok(!next.done, 'query returns results');
  });

  it('allows for passthrough of values (get)', function(){
    var a = 35;

    with(_.reserved({
      a: a
    })){
      rule
        .thirtyFive(a)
      ;
    }

    var it = _.query
      .thirtyFive(a)
    ;

    var next = it.next();

    assert.ok(!next.done, 'query returns results');
  });

  //TODO: this semantics is ridiculous. numbers can't be changed, but objects can?
  it('allows for passthrough of value (set)', function(){
    var a = 35;
    var b = {hi: "there"};

    with(_.reserved({
      a: a,
      b: b
    })){
      a = 4;
      b.hi = "world";
    }

    assert.strictEqual(a, 35);
    assert.strictEqual(b.hi, "world");
  });

  it('has preamble predicates defined', function(){
    var predicateNames = [
      "true",
      "fail",
      "is",
      "unify",
      "eq",
      "g", "ge",
      "l", "le",

      "isList",
      "length",
      "nth",
      "has",
      "remove",
      "append",
      "concat",
      "push",
      "pop"
    ];

    for(var i = 0; i < predicateNames.length; i++){
      assert.ok(_.ruleHeads.has(predicateNames[i]),
        "ruleSet has "+predicateNames.length;
      )
    }
  });

});
