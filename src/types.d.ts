declare global {
  interface VYLO {
    newDiob(): any;
    delDiob(diob: any): void;
    newObject(type: string, ...args: any[]): any;
    delObject(obj: any): void;
    Type: {
      getVariable(type: string, variable: string): any;
      getInheritances(type: string): string[];
    };
    World: {
      getCodeType(): string;
    };
    Client: {
      removeInterfaceElement(name: string, element: any, remove: boolean): void;
    };
  }
  
  const VYLO: VYLO;
}

export {};
