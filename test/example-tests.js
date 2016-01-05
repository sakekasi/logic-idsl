var assert = chai.assert;

describe('Some Programs', function(){
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
    _.rule
      .person(_.alice)
      .person(_.bob)
    ;

    var it = _.query
      .person(_.X)
    ;

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

    _.rule
      .sick(_.joe)
      .sick(_.frank)
      .sick(_.eddie)
    ;

    _.rule
      .tired(_.joe)
      .tired(_.eddie)
    ;

    var it = _.query
      .sick(_.X)
      .tired(_.X)
    ;

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

    _.rule
      .nat(_.z)
      .nat(_.s(_.X)).if(
        _.nat(_.X)
      )
    ;

    var it = _.query
      .nat(_.X)
    ;

    var solutions = ["z()", "s(z())", "s(s(z()))", "s(s(s(z())))", "s(s(s(s(z()))))"];

    for(var i = 0; i < 5; i++){
      var next = it.next();
      console.log(next.value.toString());

      assert.strictEqual(next.value.get("X").toString(), solutions[i]);
    }
  });

  it('cons and car', function(){
    console.log('cons and car');

    _.rule
      .car(_.cons(_.X, _.Y), _.X)
    ;

    var it = _.query
      .car(_.cons(_.a, _.nil), _.X)
    ;

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

    _.rule
      .father(_.abe, _.homer)
      .father(_.homer, _.bart)
      .father(_.homer, _.lisa)
      .father(_.homer, _.maggie)
    ;

    _.rule
      .parent(_.X, _.Y).if(
        _.father(_.X, _.Y)
      )
    ;

    var it = _.query
      .parent(_.X, _.Y)
    ;

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

    _.rule
      .father(_.orville, _.abe)
      .father(_.abe, _.homer)
      .father(_.homer, _.bart)
      .father(_.homer, _.lisa)
      .father(_.homer, _.maggie)
    ;

    _.rule
      .parent(_.X, _.Y).if(
        _.father(_.X, _.Y)
      )
      .grandfather(_.X, _.Y).if(
        _.father(_.X, _.Z),
        _.parent(_.Z, _.Y)
      )
    ;

    var it = _.query
      .grandfather(_.X, _.Y)
    ;

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
