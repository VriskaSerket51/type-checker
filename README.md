# typescript-type-checker

typescript-type-checker is Runtime Type Checker for Typescript.

It generates runtime type checking sanitizer script for Typescript.

typescript-type-checker supports all default types, arrays, and custom types.

## How to use

> args:
> * --src: Input directory which contains .ts files
> * --out: Output directory which sanitizer script will be saved to
> * --strict: Whether use strict mode. In strict mode, script does not check string value can be converted to number or boolean
>
> example: <br />
> $ typescript-type-checker --src "./src/lib" --out "./out/sanitizer.ts" --strict

Then you can get sanitizer script at "./out/sanitizer.ts".

## Example

`./src/lib/example.ts`
```typescript
export interface Foo {
    number: number;
    boolean: boolean;
    maybeString?: string;
    bar: Bar;
}

interface Bar {
    numbers: number[];
}
```

### With strict mode

```typescript
function sanitizeFoo(checker: any) {
    if (
        typeof checker.number != "number" ||
        typeof checker.boolean != "boolean" ||
        (checker.maybeString != undefined &&
            typeof checker.maybeString != "string") ||
        !sanitizeBar(checker.bar)
    ) {
        return false;
    }
    return true;
}

function sanitizeBar(checker: any) {
    if (!sanitizenumberArray(checker.numbers)) {
        return false;
    }
    return true;
}

function sanitizenumberArray(checker: any) {
    if (!Array.isArray(checker)) {
        return false;
    }

    for (let i = 0; i < checker.length; i++) {
        if (typeof checker[i] != "number") {
            return false;
        }
    }
    return true;
}
```

### Without strict mode

```typescript
function sanitizeFoo(checker: any) {
    if (
        typeof checker.number == "string" &&
        Boolean(checker.number.trim()) &&
        !Number.isNaN(Number(checker.number))
    ) {
        checker.number = Number(checker.number);
    }

    if (
        typeof checker.boolean == "string" &&
        (checker.boolean == "true" || checker.boolean == "false")
    ) {
        checker.boolean = checker.boolean == "true";
    }

    if (
        typeof checker.number != "number" ||
        typeof checker.boolean != "boolean" ||
        (checker.maybeString != undefined &&
            typeof checker.maybeString != "string") ||
        !sanitizeBar(checker.bar)
    ) {
        return false;
    }
    return true;
}

function sanitizeBar(checker: any) {
    if (!sanitizenumberArray(checker.numbers)) {
        return false;
    }
    return true;
}

function sanitizenumberArray(checker: any) {
    if (!Array.isArray(checker)) {
        return false;
    }

    for (let i = 0; i < checker.length; i++) {
        if (typeof checker[i] != "number") {
            return false;
        }
    }
    return true;
}
```
