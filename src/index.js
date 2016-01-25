import RuleSet from './ruleset.js';
import * as primitives from './var.js';
import Clause from './clause.js';
import Rule from './rule.js';
import Number from './number.js';
import {rest} from './sugar.js';

global.RuleSet = RuleSet;
global.v = primitives.v;
// global.a = primitives.a;
global.Var = primitives.Var;
global.Clause = Clause;
global.Rule = Rule;
global.Number = Number;
global.rest = rest;
