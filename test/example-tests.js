var assert = chai.assert;

describe('Vars, Clauses and Numbers', function(){
  var _;
  var i;

  beforeEach(function(){
    _ = new RuleSet();
    i = 0;
  });

  it('duh 1/3', function(){
    console.log('duh 1/3');
    _.rule.p

    var it = _.query.p;

    var next = it.next();
    console.log(next.value.toString());
    assert.ok(!next.done, "next has a value (not done)");
    assert.strictEqual(next.value.size, 0, "the proposed solution has no substitutions");
  });

  it('duh 2/3', function(){
    console.log('duh 2/3');
    _.rule.p;

    var it = _.query.q;

    var next = it.next();
    console.log(next);
    assert.ok(next.done, "next has no value (done)");
  });

  it('duh 3/3', function(){
    console.log('duh 3/3');
    _.rule
      .p
      .q
    ;

    var it = _.query
      .p
      .q
    ;

    var next = it.next();
    console.log(next.value.toString());
    assert.ok(!next.done, "next has a value (not done)");
    assert.strictEqual(next.value.size, 0, "next has no substitutions");
  });

  it('alice and bob are people', function(){
    console.log('alice and bob are people');

    with(_){
      rule
        .person(alice)
        .person(bob)
      ;
    }

    var it = (() => {with(_){
      return query
        .person(X)
      ;
    }})();

    var solutions = ["alice()", "bob()"];

    var next = it.next();
    assert.ok(!next.done, "next isn't done");
    while(!next.done){
      console.log(next.value.toString());
      assert.strictEqual(next.value.get("X").toString(), solutions[i]);

      next = it.next();
      i++;
    }
  });


  it('sick and tired', function(){
    console.log('sick and tired');

    with(_){
      rule
        .sick(joe)
        .sick(frank)
        .sick(eddie)
      ;

      rule
        .tired(joe)
        .tired(eddie)
      ;
    }

    var it = (() => {with(_){
      return query
        .sick(X)
        .tired(X)
      ;
    }})();

    var solutions = ["joe()", "eddie()"];

    var next = it.next();
    assert.ok(!next.done, "next isn't done");
    while(!next.done){
      console.log(next.value.toString());
      assert.strictEqual(next.value.get("X").toString(), solutions[i]);

      next = it.next();
      i++;
    }
  });

  it('nats', function(){
    console.log('nats');

    with(_){
      rule
        .nat(z)
        .nat(s(X)).if(
          nat(X)
        )
      ;
    }

    var it = (()=>{with(_){
      return query
        .nat(X)
      ;
    }})();

    var solutions = ["z()", "s(z())", "s(s(z()))", "s(s(s(z())))", "s(s(s(s(z()))))"];

    for(var i = 0; i < 5; i++){
      var next = it.next();
      console.log(next.value.toString());

      assert.strictEqual(next.value.get("X").toString(), solutions[i]);
    }
  });

  it('cons and car', function(){
    console.log('cons and car');

    with(_){
      rule
        .car(cons(X, Y), X)
      ;
    }

    var it = (() => {with(_){
      return query
        .car(cons(a, nil), X)
      ;
    }})();

    var solutions = ["a()"];

    var next = it.next();
    assert.ok(!next.done, "next isn't done");
    while(!next.done){
      console.log(next.value.toString());
      assert.strictEqual(next.value.get("X").toString(), solutions[i]);

      next = it.next();
      i++;
    }
  });

  it('parent', function(){
    console.log('parent');

    with(_){
      rule
        .father(abe, homer)
        .father(homer, bart)
        .father(homer, lisa)
        .father(homer, maggie)
      ;

      rule
        .parent(X, Y).if(
          father(X, Y)
        )
      ;
    }

    var it = (() => {with(_){
      return query
        .parent(X, Y)
      ;
    }})();

    var xs = ["abe()", "homer()", "homer()", "homer()"];
    var ys = ["homer()", "bart()", "lisa()", "maggie()"];

    var next = it.next();
    assert.ok(!next.done, "next isn't done");
    while(!next.done){
      console.log(next.value.toString());
      assert.strictEqual(next.value.get("X").toString(), xs[i]);
      assert.strictEqual(next.value.get("Y").toString(), ys[i]);

      next = it.next();
      i++;
    }
  });

  it('grandfather', function(){
    console.log('grandfather');

    with(_){
      rule
        .father(orville, abe)
        .father(abe, homer)
        .father(homer, bart)
        .father(homer, lisa)
        .father(homer, maggie)
      ;

      rule
        .parent(X, Y).if(
          father(X, Y)
        )
        .grandfather(X, Y).if(
          father(X, Z),
          parent(Z, Y)
        )
      ;
    }

    var it = (() => {with(_){
      return query
        .grandfather(X, Y)
      ;
    }})();


    var xs = ["orville()", "abe()", "abe()", "abe()"];
    var ys = ["homer()", "bart()", "lisa()", "maggie()"];

    var next = it.next();
    assert.ok(!next.done, "next isn't done");
    while(!next.done){
      console.log(next.value.toString());
      assert.strictEqual(next.value.get("X").toString(), xs[i]);
      assert.strictEqual(next.value.get("Y").toString(), ys[i]);

      next = it.next();
      i++;
    }
  });

  it('unifying numbers', function(){
    console.log("unifying numbers");

    with(_){
      rule
        .isNumber(1)
        .isNumber(.01)
        .isNumber(3*3)
      ;
    }

    var it = _.query
      .isNumber(_.X)
    ;

    var xs = ["1", "0.01", "9"];

    var next = it.next();
    assert.ok(!next.done, "next isn't done");
    while(!next.done){
      console.log(next.value.toString());
      assert.strictEqual(next.value.get("X").toString(), xs[i]);

      next = it.next();
      i++;
    }
  });
});

describe("Native Rules", function(){
  var _;
  var i;

  beforeEach(function(){
    _ = new RuleSet();
    i = 0;
  });

  it('true', function(){
    console.log('native true');

    with(_){
      rule
        .true.if(function(){
          return true;
        })
    }

    var it = _.query
      .true;

    var next = it.next();
    console.log(next.value.toString());
    assert.ok(!next.done, "next has a value (not done)");
    assert.strictEqual(next.value.size, 0, "the proposed solution has no substitutions");
  });

  it('fail', function(){
    console.log('fail');

    with(_){
      rule
        .fail.if(function(){
          return false;
        })
    }

    var it = _.query
      .fail;

    var next = it.next();
    console.log(next);
    assert.ok(next.done, "next has no value (done)");
  });

  it('evaluate 1 + 2', function(){
    console.log('evaluate 1 + 2');

    with(_){
      rule
        .is(L, EXPR).if(function(subst, cont, L, EXPR){
          return L.unify(EXPR.evaluate(subst), subst);
        })
    }

    var it = (() => {with(_){
      return query
        .is(X, plus(1, 2))
    }})();

    var solutions = ["3"];

    var next = it.next();
    while(!next.done){
      console.log(next.value.toString());
      assert.strictEqual(next.value.get("X").toString(), solutions[i]);

      next = it.next();
      i++;
    }

  });

  it('not', function(){
    console.log('not');

    with(_){
      rule
        .not(X).if(function(subst, cont, X){
          var it = cont(subst, X);
          var next = it.next();
          return next.done;
        })
      ;

      rule
        .p
      ;
    }

    var it = (() => {with(_){
      return query
        .not(q)
      ;
    }})();

    var next = it.next();
    console.log(next.value.toString());
    assert.ok(!next.done, "next has a value (not done)");
    assert.strictEqual(next.value.size, 0, "the proposed solution has no substitutions");

    it = (() => {with(_){
      return query
        .not(p)
      ;
    }})();

    next = it.next();
    console.log(next);
    assert.ok(next.done, "next does not have a value (done)");
  });

  it('square', function(){
    console.log("square");

    _.rule
      .square(_.X, _.Y).if(function(subst, cont, X, Y){
        if(X.type === "Number" && Y.type === "Number"){
          return X.value * X.value === Y.value;
        } else if(X.type === "Number" && Y.type === "Var"){
          return Y.unify(new Number(
            X.value * X.value
          ), subst);
        } else if(X.type === "Var" && Y.type === "Number"){
          return X.unify(new Number(
            Math.sqrt(Y.value)
          ), subst);
        } else if(X.type === "Var" && Y.type === "Var"){
          return function*(subst){
            var x = 0;
            while(true){
              yield Y.unify(
                new Number(x*x),
                X.unify(new Number(x), subst)
              );

              x++;
            }
          };
        }

        return false;
      })
    ;

    var it = (() => {with(_){
      return query
        .square(2, X)
      ;
    }})();

    var solutions = ["4"];

    var next = it.next();
    while(!next.done){
      console.log(next.value.toString());
      assert.strictEqual(next.value.get("X").toString(), solutions[i], "square");

      next = it.next();
      i++;
    }

    var it = (() => {with(_){
      return query
        .square(X, 4)
      ;
    }})();

    var solutions = ["2"];
    i = 0;

    var next = it.next();
    while(!next.done){
      console.log(next.value.toString());
      assert.strictEqual(next.value.get("X").toString(), solutions[i], "sqrt");

      next = it.next();
      i++;
    }

    var it = (() => {with(_){
      return query
        .square(X, X)
      ;
    }})();

    var solutions = ["0", "1"];
    i = 0;

    var next;
    while((i < 2) && (!(next = it.next()).done) ){
      console.log(next.value.toString());
      assert.strictEqual(next.value.get("X").toString(), solutions[i], "generator");

      i++;
    }
  });
});

describe("Lists", function(){
  var _;
  var i;

  beforeEach(function(){
    _ = new RuleSet();
    i = 0;
  });

  it('permutation', function(){
    console.log("permutation");

    _.rule
      .remove(_.H, [_.H, rest(_.T)], _.T)
      .remove(_.H, [_.Y, rest(_.T)], [_.Y, rest(_.T1)]).if(
        _.remove(_.H, _.T, _.T1)
      )
    ;

    with(_){
      rule
        .insert(I, List, NewList).if(
          remove(I, NewList, List)
        )
      ;
    }

    _.rule
      .permutation([], [])
      .permutation([_.X, rest(_.L1)], _.Perm).if(
        _.permutation(_.L1, _.L2),
        _.insert(_.X, _.L2, _.Perm)
      )
    ;

    var it = (()=>{with(_){
      return query
        .permutation([1,2,3], X)
      ;
    }})();

    var answers = new Set([
      "1,2,3",
      "1,3,2",
      "2,1,3",
      "2,3,1",
      "3,1,2",
      "3,2,1"
    ]);

    var next;
    while(!((next = it.next()).done)){
      console.log(next.value.get("X").toString());
      assert.ok(answers.has(next.value.get("X").toString()), "permutation in answers");
      answers.delete(next.value.get("X").toString());
    }

    assert.strictEqual(answers.size, 0, "no elements left in answers");
  });
});
