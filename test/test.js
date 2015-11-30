var assert = require('assert');

var RuleSet = require('../src/ruleset.js').default;
var Clause = require('../src/clause.js').default;
var primitives = require('../src/primitives.js');

var v = primitives.v;
var a = primitives.a;

describe('Basic Syntax', function(){
  var $;

  beforeEach(function(){
    $ = new RuleSet();
  });

  it('$("p")() -> clause', function(){
    var clause = $("p")();

    // assert(clause instanceof Clause);
    assert.equal(clause.terms.length, 0);
    assert.equal(clause.identifier, "p");
  });

  it('$("p")().if($("q")()) -> rule', function(){
    var rule = $("p")().if(
      $("q")()
    );

    assert.equal(rule.head.identifier, "p");
    assert.equal(rule.head.terms.length, 0);
    assert.equal(rule.body.length, 1);
  })
})

describe('Some Programs', function(){
  var $;

  beforeEach(function(){
    $ = new RuleSet();
  });

  it('duh 1/3', function(){
    $.rule(
      $('p')()
    );

    var it = $.query(
      $('p')()
    );

    var next = it.next();
    assert(!next.done);
    assert.equal(next.value.size, 0)
  });

  it('duh 2/3', function(){
    $.rule(
      $('p')()
    );

    var it = $.query(
      $('q')()
    );

    var next = it.next();
    assert(next.done);
  });

  it('duh 3/3', function(){
    $.rule(
      $('p')(),
      $('q')()
    );

    var it = $.query(
      $('p')(),
      $('q')()
    );

    var next = it.next();
    assert(!next.done);
    assert.equal(next.value.size, 0);
  });

  it('alice and bob are people', function(){
    $.rule(
      $('person')(a('alice')),
      $('person')(a('bob'))
    );

    var it = $.query(
      $('person')(v('X'))
    );

    var next = it.next();
    assert(!next.done);
    while(!next.done){
      console.log(next);
      next = it.next();
    }
  });


  it('sick and tired', function(){
    $.rule(
      $('sick')(a('joe')),
      $('sick')(a('frank')),
      $('sick')(a('eddie'))
    );

    $.rule(
      $('tired')(a('joe')),
      $('tired')(a('eddie'))
    );

    var it = $.query(
      $('sick')(v('X')),
      $('tired')(v('X'))
    );

    var next = it.next();
    assert(!next.done);
    while(!next.done){
      console.log(next);
      next = it.next();
    }
  });


  it('grandfather', function(){
    $.rule(
      $('father')(a('orville'), a('abe')),
      $('father')(a('abe'), a('homer')),
      $('father')(a('homer'), a('bart')),
      $('father')(a('homer'), a('lisa')),
      $('father')(a('homer'), a('maggie'))
    );

    $.rule(
      $('parent')(v('X'), v('Y')).if(
        $('father')(v('X'), v('Y'))
      ),
      $('grandfather')(v('X'), v('Y')).if(
        $('father')(v('X'), v('Z')),
        $('parent')(v('Z'), v('Y'))
      )
    );

    var it = $.query(
      $('grandfather')(v('X'), v('Y'))
    );

    var next = it.next();
    assert(!next.done);
    while(!next.done){
      console.log(next);
      next = it.next();
    }
  });
});
