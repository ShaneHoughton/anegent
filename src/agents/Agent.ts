class Agent {
    name: string;

    constructor(name: string) {
        this.name = name;
    }

    greet() {
        return `Hello, my name is ${this.name}.`;
    }

}