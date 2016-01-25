export default function preamble(_){
  //SOME BASIC RULES
  with(_){
    rule
      .true
    ;

    rule
      .fail.if(() => false)
    ;

    rule
      .is(L, EXPR).if(function(subst, _, L, EXPR){
        return L.unify(EXPR.evaluate(subst), subst);
      })
      //TODO: might want to catch a unification error here
      .unify(L, R).if(function(subst, _, L, R){
        return L.unify(R, subst);
      })
    ;

    //arithmetic comparison operators
    rule
      .eq(L, R).if(function(subst, _, L, R){
        return L.evaluate(subst).value === R.evaluate(subst).value;
      })
      .g(L, R).if(function(subst, _, L, R){
        return L.evaluate(subst).value > R.evaluate(subst).value;
      })
      .ge(L, R).if(function(subst, _, L, R){
        return L.evaluate(subst).value >= R.evaluate(subst).value;
      })
      .l(L, R).if(function(subst, _, L, R){
        return L.evaluate(subst).value < R.evaluate(subst).value;
      })
      .le(L, R).if(function(subst, _, L, R){
        return L.evaluate(subst).value <= R.evaluate(subst).value;
      })
    ;
  }

  // [1,2,3,4,5] -> cons(1, cons(2, cons(3, cons(4, cons(5, NIL)))))
  // [H, rest(T)] -> cons(H, T)
  // [1,2,3,Z, rest(Y)] -> cons(1, cons(2, cons(3, cons(Z, Y))))

  //LIST RULES
  with(_){
    rule
      .isList(nil)
      .isList(cons(_, Rest)).if(
        isList(Rest)
      )
    ;

    rule
      .car(cons(H, _), H)
      .head(cons(H, _), H)
      .cdr(cons(_, T), T)
      .tail(cons(_, T), T)
    ;

    rule
      .length(nil, 0)
      .length(cons(_, Rest), N).if(
        length(Rest, RL),
        is(N, plus(RL, 1))
      )
    ;

    rule
      .nth(nil, _, N).if(
        fail
      )
      .nth(cons(X, _), 0, X)
      .nth(cons(_, Rest), I, N).if(
        g(I, 0),
        is(J, minus(I, 1))
        nth(Rest, J, N)
      )
    ;

    rule
      .has(nil, _).if(
        fail
      )
      .has(cons(X, _), X)
      .has(cons(_, Rest), Y).if(
        has(Rest, Y)
      )
    ;

    rule
      .remove(H, [H, rest(T)], T)
      .remove(H, [Y, rest(T)], [Y, rest(T1)]).if(
        remove(H, T, T1)
      )
    ;

    rule
      .append(nil, X, cons(X, nil))
      .append(cons(_, Rest), X, cons(_, NewRest)).if(
        append(Rest, X, NewRest)
      )
    ;

    rule
      .concat(List1, nil, NewList)
      .concat(List1, cons(First, Rest), NewList).if(
        append(List1, First, IntermediateList),
        concat(IntermediateList, Rest, NewList)
      )
    ;

    rule
      .push(L, X, cons(X, L))
      .pop(cons(H, T), T, H)
    ;
  }
}
