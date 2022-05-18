/**
 * A template for making custom types which can easily be validated and transformed to a standard
 */
export abstract class Type {

    protected readonly value: string;

    constructor(value: string) {
        this.value = value;
    }

    /**
     * Transforms the provided value to a standard
     */
    public transform(): string {
        return this.value;
    };

    /**
     * Validates that the provided value is valid
     */
    public abstract validate(): boolean;
}