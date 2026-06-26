// Core primitives
export { BaseDto } from './BaseDto';
export { Entity } from './Entity';
export type { default as IDocument } from './IDocument';
export type { IEntityPropertyType } from './IEntityPropertyType';
export type { ILogger } from './ILogger';
export type { IMailer } from './IMailer';
export type { default as IRepository } from './IRepository';
export { Links, Meta } from './IResponse';
export type { IResponse } from './IResponse';
export type { IStorageService } from './IStorageService';
export { PaginatedResourceResponse } from './PaginatedResourceResponse';
export type { IDatabase, IDatabaseManager } from './Database';

// CQRS bus
export * from './Commands';
export * from './Queries';

// DI container
export { Container } from './Container';
export type {
	ModuleContainer,
	ProviderDefinition,
	ControllerDefinition,
	CommandDefinition,
	QueryDefinition,
} from './Container';
export type { Token, Resolver, Factory } from './Container/Types';
export { createToken } from './Container/createToken';
export { CORE_DI_SYMBOLS } from './Container/Tokens';

// Decorator-based routing
export {
	Controller,
	Get,
	Post,
	Put,
	Delete,
	Param,
	Query,
	Body,
	Header,
	Files,
} from './Decorators';
export { Module, moduleRegistry } from './Decorators/Module';
export type { ModuleMetadata } from './Decorators/Module';

// Either / use-case plumbing
export { Either, UseCaseError } from './UseCase';
export type {
	IUseCase,
	CommandResponse,
	QueryResponse,
	DataError,
} from './UseCase';
export { EitherAsync } from './UseCase/EitherAsync';

// Exceptions
export {
	default as ApiException,
	HTTP_STATUS,
} from './Exceptions/ApiException';
export { default as BadRequestException } from './Exceptions/BadRequestException';
export { default as SessionExpiredException } from './Exceptions/SessionExpiredException';
export { default as TokenExpiredException } from './Exceptions/TokenExpiredException';
export { default as UnAuthorizedException } from './Exceptions/UnAuthorizedException';
export { default as ValidationException } from './Exceptions/ValidationException';
export { InputParseError } from './Exceptions/InputParser';
export { DataError as ConcreteDataError } from './Exceptions';

// Value objects
export { Identifier } from './ValueObjects/Identifier';
export { UniqueEntityID } from './ValueObjects/UniqueEntityID';
export { ValueObject } from './ValueObjects/ValueObject';
export { AnyValueObject } from './ValueObjects/AnyValueObject';
export { EnumValueObject } from './ValueObjects/EnumValueObject';
export { StringValueObject } from './ValueObjects/StringValueObject';
export { InvalidArgumentError } from './ValueObjects/InvalidArgumentError';

// Validators
export * from './Validators/Password';

// HTTP layer (Next.js-flavored adapter)
export type { HttpAdapter } from './Http/HttpAdapter';
export type { HttpFile } from './Http/HttpFile';
export type { HttpRequest, AuthenticatedHttpRequest } from './Http/HttpRequest';
export type { HttpResponse } from './Http/HttpResponse';
export type { Middleware, MiddlewareMeta } from './Http/Middleware';
export { HttpRequestEngine } from './Http';

// Query / filter / sort engine
export { QueryParameters, QueryParser } from './Query';
export type { IQueryParameters, FilterMap, QueryMap } from './Query';
export { default as Parameters } from './Query/Parameters';
export type { IParameters } from './Query/Parameters';
export { default as UserParameter } from './Query/Parameters/UserParameter';
export type { IIdentifiable } from './Query/Parameters/UserParameter';
export * from './Query/Validator';

// Auth contracts (implement these per project)
export type {
	IPermissions,
	IPermissionService,
	IAuthenticationService,
} from './Auth';

// Configuration contracts
export * from './Configuration';

// Optional Users/Roles/Permissions domain contracts
export * as Users from './Domains/Users';
export * as Roles from './Domains/Roles';
export * as Permissions from './Domains/Permissions';
