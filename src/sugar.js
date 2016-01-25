import Number from './number.js';
import { Var } from './var.js';
import Clause from './clause.js';


var types = [Number, Clause, Var]

export function desugar(ruleSet, item){
  for(let type of types){
    let desugared = type.desugar(ruleSet, item);
    if(desugared !== item){
      return desugared;
    }
  }

  return item;
}

export function sugar(ruleSet, item){
  for(let type of types){
    let sugared = type.sugar(ruleSet, item);
    if(sugared !== item){
      return sugared;
    }
  }

  return item;
}

export class Rest{
  constructor(value){
    this.value = value;
  }
}

export function rest(value){
  return new Rest(value);
}
