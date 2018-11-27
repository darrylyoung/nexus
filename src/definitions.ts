import { assertValidName, GraphQLScalarType } from "graphql";
import {
  DirectiveTypeDef,
  EnumTypeDef,
  InputObjectTypeDef,
  InterfaceTypeDef,
  ObjectTypeDef,
  UnionTypeDef,
} from "./core";
import * as Types from "./types";
import { enumShorthandMembers } from "./utils";

/**
 * A GraphQL object type has a name and fields, but at some point those fields have
 * to resolve to some concrete data. That's where the scalar types come in:
 * they represent the leaves of the query.
 *
 * @see https://graphql.github.io/learn/schema/#scalar-types
 */
export function scalarType(
  name: string,
  options: Types.ScalarOpts
): GraphQLScalarType {
  return new GraphQLScalarType({ name: assertValidName(name), ...options });
}

/**
 * The most basic components of a GraphQL schema are object types, which just represent
 * a kind of object you can fetch from your service, and what fields it has.
 *
 * @see https://graphql.github.io/learn/schema/#object-types-and-fields
 */
export function objectType<
  GenTypes = GraphQLiteralGen,
  TypeName extends string = any
>(
  name: TypeName,
  fn: (t: ObjectTypeDef<GenTypes, TypeName>) => void
): ObjectTypeDef<GenTypes, TypeName> {
  const factory = new ObjectTypeDef<GenTypes, TypeName>(assertValidName(name));
  fn(factory);
  return factory;
}

/**
 * Like many type systems, GraphQL supports interfaces. An Interface is an
 * abstract type that includes a certain set of fields that a type must
 * include to implement the interface.
 *
 * In GraphQLiteral, you do not need to redefine the interface fields on the
 * implementing object types, instead you may use `.implements(interfaceName)`
 * and all of the interface fields will be added to the type.
 *
 * const Node = interfaceType('Node', t => {
 *   t.id('id', { description: 'GUID for a resource' });
 * });
 *
 * const User = objectType('User', t => {
 *   t.implements('Node');
 * });
 *
 * @see https://graphql.github.io/learn/schema/#interfaces
 */
export function interfaceType<
  GenTypes = GraphQLiteralGen,
  TypeName extends string = any
>(
  name: TypeName,
  fn: (t: InterfaceTypeDef<GenTypes, TypeName>) => void
): InterfaceTypeDef<GenTypes, TypeName> {
  const factory = new InterfaceTypeDef<GenTypes, TypeName>(
    assertValidName(name)
  );
  fn(factory);
  return factory;
}

/**
 * Union types are very similar to interfaces, but they don't get to specify
 * any common fields between the types.
 *
 * There are two ways to create a GraphQLUnionType with GraphQLiteralUnion:
 *
 * As an array of types to satisfy the union:
 *
 * const SearchResult = GraphQLiteralUnion('SearchResult', ['Human', 'Droid', 'Starship'])
 *
 * As a function, where other unions can be mixed in:
 *
 * const CombinedResult = GraphQLiteralUnion('CombinedResult', t => {
 *   t.mix('SearchResult')
 *   t.members('OtherType', 'AnotherType')
 * })
 *
 * @see https://graphql.org/learn/schema/#union-types
 */
export function unionType<
  GenTypes = GraphQLiteralGen,
  TypeName extends string = any
>(
  name: TypeName,
  fn: (t: UnionTypeDef<GenTypes, TypeName>) => void
): UnionTypeDef<GenTypes, TypeName> {
  const factory = new UnionTypeDef<GenTypes>(assertValidName(name));
  fn(factory);
  return factory;
}

/**
 * A Enum is a special GraphQL type that represents a set of symbolic names (members)
 * bound to unique, constant values. There are three ways to create a GraphQLEnumType
 * with GraphQLiteralEnum:
 *
 * As an array of enum values:
 *
 * const Episode = GraphQLiteralEnum('Episode', ['NEWHOPE', 'EMPIRE', 'JEDI'])
 *
 * As an object, with a mapping of enum values to internal values:
 *
 * const Episode = GraphQLiteralEnum('Episode', {
 *   NEWHOPE: 4,
 *   EMPIRE: 5,
 *   JEDI: 6
 * });
 *
 * As a function, where other enums can be mixed in:
 *
 * const Episode = GraphQLiteralEnum('Episode', (t) => {
 *   t.mix('OneThroughThree')
 *   t.mix('FourThroughSix')
 *   t.mix('SevenThroughNine')
 *   t.members(['OTHER'])
 *   t.description('All Movies in the Skywalker saga, or OTHER')
 * })
 *
 * @see https://graphql.github.io/learn/schema/#enumeration-types
 */
export function enumType<
  GenTypes = GraphQLiteralGen,
  TypeName extends string = any
>(
  name: TypeName,
  fn:
    | ((arg: EnumTypeDef<GenTypes>) => void)
    | string[]
    | Record<string, string | number | object | boolean>
): EnumTypeDef<GenTypes> {
  const factory = new EnumTypeDef<GenTypes>(assertValidName(name));
  if (typeof fn === "function") {
    fn(factory);
  } else {
    factory.members(enumShorthandMembers(fn));
  }
  return factory;
}

/**
 * Defines a complex object which can be passed as an input value.
 *
 * Unlike object types, input types do not have arguments, and they do not
 * have resolvers, backing types, etc.
 *
 * @see https://graphql.org/learn/schema/#input-types
 */
export function inputObjectType<
  GenTypes = GraphQLiteralGen,
  TypeName extends string = any
>(
  name: TypeName,
  fn: (t: InputObjectTypeDef<GenTypes>) => void
): InputObjectTypeDef<GenTypes> {
  const factory = new InputObjectTypeDef<GenTypes>(assertValidName(name));
  fn(factory);
  return factory;
}

/**
 * Defines an argument that can be used in any object or interface type
 *
 * Takes the GraphQL type name and any options. The value returned from this
 * argument can be reused in any valid GraphQLiteral `args` object value
 *
 * @see https://graphql.github.io/learn/schema/#arguments
 */
export function arg<GenTypes = GraphQLiteralGen>(
  type: Types.AllInputTypes<GenTypes> | Types.BaseScalars,
  options?: Types.ArgOpts
): Types.ArgDefinition {
  // This isn't wrapped for now because it's not a named type, it's really
  // just an object that can be reused in multiple locations.
  return {
    type,
    ...options,
  };
}

/**
 * Alias for `arg("String", options)`
 */
export function stringArg(options?: Types.ArgOpts): Types.ArgDefinition {
  return arg("String", options);
}

/**
 * Alias for `arg("Int", options)`
 */
export function intArg(options?: Types.ArgOpts): Types.ArgDefinition {
  return arg("Int", options);
}

/**
 * Alias for `arg("Float", options)`
 */
export function floatArg(options?: Types.ArgOpts): Types.ArgDefinition {
  return arg("Float", options);
}

/**
 * Alias for `arg("ID", options)`
 */
export function idArg(options?: Types.ArgOpts): Types.ArgDefinition {
  return arg("ID", options);
}

/**
 * Alias for `arg("Boolean", options)`
 */
export function booleanArg(options?: Types.ArgOpts): Types.ArgDefinition {
  return arg("Boolean", options);
}

/**
 * Defines a directive that can be used by the schema. Directives should
 * be rarely used, as they only function for external consumers of the schema.
 */
export function directiveType<
  GenTypes = GraphQLiteralGen,
  DirectiveName extends string = any
>(
  name: DirectiveName,
  config:
    | Types.DirectiveConfig<GenTypes, DirectiveName>
    | ((arg: DirectiveTypeDef<GenTypes>) => void)
): DirectiveTypeDef<GenTypes> {
  const directive = new DirectiveTypeDef<GenTypes>(assertValidName(name));
  if (typeof config === "function") {
    config(directive);
  } else {
    directive.locations(...config.locations);
  }
  return directive;
}
