export class Var {
  identifier: string;

  constructor(identifier: string){
    this.identifier = identifier;
  }

  makeCopyWithFreshVarNames(delta){
    if(!delta.hasOwnProperty(this.identifier)){
      delta[this.identifier] = `_${this.identifier}${delta.__nextVarToken++}`;
    }
    return new Var(delta[this.identifier]);
  }
}

export function v(identifier: string): Var{
  return new Var(identifier);
}

export class Atom {
  identifier: string;

  constructor(identifier: string){
    this.identifier = identifier;
  }

  makeCopyWithFreshVarNames(){
    return this;
  }
}

export function a(identifier: string): Atom{
  return new Atom(identifier);
}
