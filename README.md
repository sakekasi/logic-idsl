# Logic IDSL

This is an internal DSL (domain specific language) for JavaScript which enables prolog-like logic programming natively within JS. It was created as an extension of the log assignment in CS137A, Prototyping Programming Languages, offered at UCLA.

## Quickstart

Dependencies: Node.js, Firefox (for proxy support)

### Building

```
$ pwd
.../logic-idsl/

$ npm i -g webpack
$ npm i

$ webpack
```

### Using

To try out the DSL, open `test/test.html` in Firefox. For more examples on its use, take a look at some of the tests being run.

`test/test.html` exposes the `RuleSet` symbol as a global. Try writing your own programs in the console of `test/test.html`, or include `index.js` in your own projects.

## Example Program

```
var _ = new RuleSet();

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

var it = _.query
  .grandfather(_.X, _.Y)
;  
```

Here, chained statements which begin with 'rule' intern logical rules (e.g. `father(orville, abe)`, `parent(X, Y).if( father(X, Y) )`) in the RuleSet. The RuleSet is then queried to produce an iterator of possible solutions.
