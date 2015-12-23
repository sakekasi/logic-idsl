import RuleSet from './ruleset.js';
import * as primitives from './primitives.js';
import Clause from './clause.js';
import Rule from './rule.js';

global.RuleSet = RuleSet;
global.v = primitives.v;
global.a = primitives.a;
global.Var = primitives.Var;
global.Clause = Clause;
global.Rule = Rule;
