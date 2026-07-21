/**
 * The shared domain error hierarchy (architecture.md, "Domain errors"). Features
 * extend these with their own; they never redefine the hierarchy.
 *
 * The `setPrototypeOf` call keeps `instanceof` working for subclasses of the
 * built-in `Error` — without it, a downlevelled build silently makes every
 * `err instanceof ValidationError` check false.
 */
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** Input that would produce an entity violating a domain invariant. */
export class ValidationError extends DomainError {}

/** A referenced entity does not exist. */
export class NotFoundError extends DomainError {}

/** The operation conflicts with the current state (e.g. a duplicate identity). */
export class ConflictError extends DomainError {}
