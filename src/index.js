// @flow

function isPlainObject(obj: Object): boolean {
    const toString = Object.prototype.toString;
    if (toString.call(obj) !== '[object Object]') {
        return false;
    }

    const prototype = Object.getPrototypeOf(obj);
    return prototype === null ||
        prototype === Object.prototype;
}

// Ограничился 4мя объектами т.к. в реальной жизни этого будет более чем достаточно. В крайнем случае можно сделать 2 вызова последовательно.
declare function extend<T: Object>(deep: boolean, target: T): T;
declare function extend<T: Object, S1: Object>(deep: boolean, target: T, source1: S1): T & S1;
declare function extend<T: Object, S1: Object, S2: Object>(deep: boolean, target: T, source1: S1, source2: S2): T & S1 & S2;
declare function extend<T: Object, S1: Object, S2: Object, S3: Object>(deep: boolean, target: T, source1: S1, source2: S2, source3: S3): T & S1 & S2 & S3;
declare function extend<T: Object, S1: Object, S2: Object, S3: Object, S4: Object>(deep: boolean, target: T, source1: S1, source2: S2, source4: S3): T & S1 & S2 & S4;
declare function extend<T: Object>(target: T): T;
declare function extend<T: Object, S1: Object>(target: T, source1: S1): T & S1;
declare function extend<T: Object, S1: Object, S2: Object>(target: T, source1: S1, source2: S2): T & S1 & S2;
declare function extend<T: Object, S1: Object, S2: Object, S3: Object>(target: T, source1: S1, source2: S2, source3: S3): T & S1 & S2 & S3;
declare function extend<T: Object, S1: Object, S2: Object, S3: Object, S4: Object>(target: T, source1: S1, source2: S2, source3: S3, source4: S4): T & S1 & S2 & S3 & S4;
function extend(...args) {
    const hasOwnProperty = Object.prototype.hasOwnProperty;
    let target = args[0];
    let deep;
    let i;

    // Обрабатываем ситуацию глубокого копирования.
    if (typeof target === 'boolean') {
        deep = target;
        target = args[1];
        i = 2;
    } else {
        deep = false;
        i = 1;
    }

    for (; i < arguments.length; i++) {
        const obj = args[i];
        if (!obj) {
            continue;
        }

        for (const key in obj) {
            if (hasOwnProperty.call(obj, key)) {
                const val = obj[key];
                const isArray = val && Array.isArray(val);

                // Копируем "плоские" объекты и массивы рекурсивно.
                if (deep && val && (isPlainObject(val) || isArray)) {
                    const src = target[key];
                    let clone;
                    if (isArray) {
                        clone = src && Array.isArray(src) ? src : [];
                    } else {
                        clone = src && isPlainObject(src) ? src : {};
                    }
                    target[key] = extend(deep, clone, val);
                } else {
                    target[key] = val;
                }
            }
        }
    }

    return target;
};

// Реальные кейсы
const t1: {x: number} = extend({x: 1});
const t2: {x: number, y: string} = extend({x: 1}, {y: '2'});
const t3: {x: string} = extend({x: 1}, {x: '2'});
const t4: {x: {y: null, z: 0}} = extend(true, {}, {x: {y: null, z: 0}});
const t5: {x: number} = extend(true, {x: 1});
const t6: {x: number, y: string} = extend(true, {x: 1}, {y: '2'});
const t7: {x: string} = extend(true, {x: 1}, {x: '2'});
const t8: {x: {y: null, z: 5}} = extend(true, {}, {x: {y: null, z: 5}});

// Непокрытые вещи вытекающие из свойства JS: все что не является примитивом, является объектом
// В идеальном мире тут должны быть ошибки
const p1 = extend(() => 1, () => 's');
extend({x: 1}, Symbol('1'));

// Ошибки
extend(1, 2);
extend(1, {string: 1});
extend(null, {string: 1});
extend(true, undefined);
extend(true, undefined, {});
extend(true, {}, 1);
extend({}, {}, 1);
extend({}, null, {});
extend({}, {s: 1}, undefined);
extend(true, [1], ['s']);

// Известные ошибки из за кол-ва аргументов
extend({}, {}, {}, {}, {}, {}, {});
extend({}, {}, {}, {}, {}, {});