'use strict';

function assert(val, err=new TypeError()) {
    if (!val) {
        throw err;
    }
}

function getSpeciesConstructor(obj) {
    return obj.constructor[Symbol.species];
}

function isSet(obj) {
    const methodNames = ['has', 'add', 'forEach', 'delete', 'keys', 'values', 'entries'];
    return !!(
        obj &&
        methodNames.every(key=>key in obj && typeof obj[key] === 'function') &&
        'size' in obj &&
        typeof obj.size === 'number' &&
        Number.isInteger(obj.size)
    );
}

function subtract(...iterables) {
    assert(isSet(this));
    const subConstructor = getSpeciesConstructor(this);
    const ret = new subConstructor(this);
    for(const iterable of iterables) {
        for (const element of iterable) {
            if (ret.has(element)) {
                ret.delete(element);
            }
        }
    }

    return ret;
}

function filter(predicate, thisArg = null) {
    assert(typeof predicate === 'function');
    assert(isSet(this));
    const ret = new (getSpeciesConstructor(this));
    for (const element of this) {
        if (Reflect.apply(predicate, thisArg, [element, element, this])) {
            ret.add(element);
        }
    }
    return ret;
}

function map(mapFunction, thisArg = null) {
    assert(typeof mapFunction === 'function');
    assert(isSet(this));
    const ret = new (getSpeciesConstructor(this));
    for (const element of this) {
        ret.add(Reflect.apply(mapFunction, thisArg, [element, element, this]))
    }
    return ret;
}

function some(predicate, thisArg = null) {
    assert(typeof predicate === 'function');
    assert(isSet(this));
    for (const element of this) {
        if (Reflect.apply(predicate, thisArg, [element, element, this])) {
            return true;
        }
    }
    return false;
}

function find(predicate, thisArg = null) {
    assert(typeof predicate === 'function');
    assert(isSet(this));
    for (const element of this) {
        if (Reflect.apply(predicate, thisArg, [element, element, this])) {
            return element;
        }
    }
    return undefined;
}

function every(predicate, thisArg = null) {
    assert(typeof predicate === 'function');
    assert(isSet(this));
    for (const element of this) {
        if (!Reflect.apply(predicate, thisArg, [element, element, this])) {
            return false;
        }
    }
    return true;
}

function union(...iterables) {
    assert(isSet(this));
    assert(iterables.length > 0);
    const subConstructor = getSpeciesConstructor(this);
    const ret = new subConstructor();
    const setIterables = [this].concat(iterables);
    for (const _set of setIterables) {
        for (const element of _set) {
            ret.add(element);
        }
    }
    return ret;
}

function intersect(...iterables) {
    assert(isSet(this));
    assert(iterables.length > 0);
    const subConstructor = getSpeciesConstructor(this);
    const ret = new subConstructor();
    const setIterables = [this, ...iterables].map(iterable => new subConstructor(iterable));
    for (const _set of setIterables) {
        for (const element of _set) {
            if (setIterables.every(_set=>_set.has(element))) {
                ret.add(element);
            }
        }
    }
    return ret;
}

function xor(...iterables) {
    assert(isSet(this));
    assert(iterables.length > 0);
    const subConstructor = getSpeciesConstructor(this); // readability
    const ret = new subConstructor();
    const setIterables = [this].concat(iterables).map(iterable=>new subConstructor(iterable));
    for (const _set of setIterables) {
        for (const element of _set) {
            if (setIterables.filter(_set=>_set.has(element)).length === 1) {
                ret.add(element);
            }
        }
    }
    return ret;
}

function addElements(...args) {
    assert(isSet(this));
    for (const element of args) {
        this.add(element);
    }
    return this;
}

function removeElements(...args) {
    assert(isSet(this));
    for (const element of args) {
        this.delete(element);
    }
    return this;
}

function isSupersetOf(iterable) {
    assert(isSet(this));
    for (const element of iterable) {
        if(!this.has(element)) {
            return false;
        }
    }
    return true;
}


assert(typeof Set === 'function');
const prototypeMethods = [
    ['map', map],
    ['filter', filter],
    ['some', some],
    ['xor', xor],
    ['intersect', intersect],
    ['every', every],
    ['find', find],
    ['subtract', subtract],
    ['addElements', addElements],
    ['removeElements', removeElements],
    ['union', union],
    ['isSupersetOf', isSupersetOf]
];
const staticMethods = [
    ['isSet', isSet]
];
for (const [key, value] of prototypeMethods) {
    Object.defineProperty(Set.prototype, key, {
        value
    });
}
for (const [key, value] of staticMethods) {
    Object.defineProperty(Set, key, {
        value
    });
}
