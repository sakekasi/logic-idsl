let $ = new RuleSet();

$.rule(
  $('person')(a('saketh')),
  $('person')(a('sai')),
  $('person')(a('hema')),
  $('person')(a('gautham')),
  $('person')(a('srr')),
  $('person')(a('raghavan'))
);

$.rule(
  $('parent')(a('sai'), a('saketh')),
  $('parent')(a('sai'), a('gautham')),
  $('parent')(a('hema'), a('saketh')),
  $('parent')(a('hema'), a('gautham')),
  $('parent')(a('srr'), a('sai')),
  $('parent')(a('raghavan'), a('hema'))
);

$.rule(
  $('grandparent')(v('X'), v('Y')).if(
    $('person')(v('X')),
    $('person')(v('Y')),
    $('person')(v('Z')),
    $('parent')(v('Z'), v('Y')),
    $('parent')(v('X'), v('Z'))
  ),
  $('sibling')(v('X'), v('Y')).if(
    $('person')(v('X')),
    $('person')(v('Y')),
    $('person')(v('Z')),
    $('parent')(v('Z'), v('X')),
    $('parent')(v('Z'), v('Y'))
  )
);

let q = $.query(
  $('grandparent')(v('X'), a('saketh'))
);

q.next();
//X: srr
q.next();
//X: raghavan
q.next();
//DONE
