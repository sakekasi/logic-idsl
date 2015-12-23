export class Var {
  identifier: string;
  type: string;

  constructor(identifier: string){
    this.identifier = identifier;
    this.type = "Var";
  }

  makeCopyWithFreshVarNames(delta){
    if(!delta.hasOwnProperty(this.identifier)){
      delta[this.identifier] = `_${this.identifier}${delta.__nextVarToken++}`;
    }
    return new Var(delta[this.identifier]);
  }

  rewrite(subst){
    if(subst.has(this.identifier)){
        return subst.get(this.identifier);
    } else {
        return this;
    }
  }

  equals(other){
    return (other instanceof Var) &&
        this.identifier === other.identifier;
  }

  toString(){
    return `v(${this.identifier})`;
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

  rewrite(){
    return this;
  }

  equals(other){
    return (other instanceof Atom) &&
        this.identifier === other.identifier;
  }

  toString(){
    return `a(${this.identifier})`;
  }
}

export function a(identifier: string): Atom{
  return new Atom(identifier);
}
