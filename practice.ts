

function withCoke(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
) {
    const original = descriptor.value;

    descriptor.value = function (...args: any[]) {
        return original.apply(this, args) + 180;
    };

    return descriptor;
}

function withCheese(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
) {
    const original = descriptor.value;

    descriptor.value = function (...args: any[]) {
        return original.apply(this, args) + 2; // cheese costs $2
    };

    return descriptor;
}

class Pizza {

    @withCheese
    @withCoke
    getPrice() {
        return 10;
    }
}

const pizza = new Pizza();
console.log(pizza.getPrice()); // 12