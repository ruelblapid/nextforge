import { ZodType } from 'zod';
import { NextApiRequest } from 'next';

declare abstract class BaseDto<T> {
    static schema: ZodType;
    static validate<T>(data: unknown): T;
    private static formatErrors;
}

interface IDocument {
    [field: string]: any;
}

/**
 * Copyright (C) RBL Solution 2026
 * All Rights Reserved.
 */
declare class Identifier<T> {
    protected value?: T;
    constructor(value?: T);
    equals(id?: Identifier<T>): boolean;
    toString(): string;
    toValue(): T;
    protected _uuidToInt(uuid: string): number;
}

declare class UniqueEntityID extends Identifier<any> {
    constructor(id?: any);
}

/**
 * Copyright (C) RBL Solution 2026
 * All Rights Reserved.
 */

declare abstract class Entity<T = any> {
    protected readonly _id: UniqueEntityID;
    protected _version: number | undefined;
    readonly properties: T;
    constructor(props: T, id?: UniqueEntityID);
    get id(): UniqueEntityID;
    get version(): number | undefined;
    incrementVersion(): void;
    equals(object?: Entity<T>): boolean;
    getChanges(original: IDocument, updated: IDocument): IDocument;
    toPrimitives(): T;
    toJsonString(): string;
}

type IEntityPropertyType = {
    [key: string]: string | number | Date | boolean | object | undefined | null;
};

/**
 * Copyright (C) RBL Solution 2026
 * All Rights Reserved.
 */
interface ILogger {
    debug(message: string, ...meta: any[]): void;
    error(message: string, ...meta: any[]): void;
    info(message: string, ...meta: any[]): void;
}

declare class Links {
    self: string;
    next: string;
    prev: string;
    constructor({ self, next, prev, }: {
        self: string;
        next: string;
        prev: string;
    });
    static fromJson: (json: any) => Links;
}
declare class Meta {
    current_page: number;
    total_items: number;
    total: number;
    per_page: number;
    path: string;
    constructor({ current_page, total_items, total, per_page, path, }: {
        current_page: number;
        total_items: number;
        total: number;
        per_page: number;
        path: string;
    });
    static fromJson: (json: any) => Meta;
}
interface IResponse<T = any> {
    success: boolean;
    data?: T;
    timestamp?: string;
    message?: string;
    code?: number;
    meta?: Record<string, number>;
    links?: Record<string, string>;
}

interface UnexpectedError {
    kind: 'UnexpectedError';
    error?: Error;
    message?: string;
}
interface NoRecordFoundError {
    kind: 'NoRecordFoundError';
    message: string;
}
interface QueryError {
    kind: 'QueryError';
    message: string;
}
interface ValidationError {
    kind: 'ValidationError';
    message: string;
    errors?: Record<string, string>[];
}
interface ServerError {
    kind: 'ServerError';
    error: Error;
    errorCode: number;
}
interface AuthenticationError {
    kind: 'AuthenticationError';
    message: string;
    error?: Error;
}
interface UnauthorizedError {
    kind: 'UnauthorizedError';
    message: string;
    code?: number | string;
}
interface BadRequestError {
    kind: 'BadRequestError';
    message: string;
    code?: number;
}
interface ErrorData {
    message: string;
    source: string;
    value: string;
}
interface ErrorFold {
    kind: 'ErrorFold';
    error: ErrorData[];
}
interface IUseCaseError {
    kind?: 'IUseCaseError';
    code?: number;
    title?: string;
    message: string;
    error?: Error;
}
type DataError$1 = UnexpectedError | NoRecordFoundError | ServerError | AuthenticationError | UnauthorizedError | BadRequestError | ErrorFold | IUseCaseError | QueryError | ValidationError;

declare class Either<L, R> {
    private readonly value;
    private constructor();
    isLeft(): boolean;
    isRight(): boolean;
    fold<T>(leftFn: (left: L) => T, rightFn: (right: R) => T): T;
    map<T>(fn: (r: R) => T): Either<L, T>;
    flatMap<T>(fn: (right: R) => Either<L, T>): Either<L, T>;
    mapLeft<T>(fn: (l: L) => T): Either<T, R>;
    flatMapLeft<T>(fn: (left: L) => Either<T, R>): Either<T, R>;
    get(errorMessage?: string): R;
    getOrThrow(errorMessage?: string): R;
    getLeft(): L;
    getRight(): R;
    getOrElse(defaultValue: R): R;
    static left<L, R>(value: L): Either<L, R>;
    static right<L, R>(value: R): Either<L, R>;
}

declare abstract class UseCaseError implements IUseCaseError {
    readonly code: number;
    readonly message: string;
    readonly error: Error;
    constructor(message: string, code?: number, error?: Error);
}

type QueryResponse<T = any> = Either<DataError$1, IResponse<T>>;
type CommandResponse<T = any> = Either<DataError$1, IResponse<T>>;
interface IUseCase {
    execute(request?: IDocument): Promise<QueryResponse | CommandResponse>;
}

/**
 * Copyright (C) RBL Solution 2026
 * All Rights Reserved.
 */

interface IMailer {
    send(from: string, to: string, subject: string, content: string, cc: string): Promise<CommandResponse>;
}

/**
 * Copyright (C) RBL Solution 2026
 * All Rights Reserved.
 */
declare class CacheParameter {
    private status;
    private clear;
    private expiration;
    private key;
    private tags;
    constructor(parameters: Map<string, any>);
    getStatus(): boolean;
    isClear(): boolean;
    getExpiration(): number;
    getKey(): string;
    getTags(): string[];
    toQueryString(): string;
}

/**
 * Copyright (C) RBL Solution 2026
 * All Rights Reserved.
 */
declare class DownloadParameter {
    private _format;
    private _isDownload;
    constructor(parameters: Map<string, any>);
    getFormat(): string;
    isDownload(): boolean;
    toQueryString(): string;
}

/**
 * Copyright (C) RBL Solution 2026
 * All Rights Reserved.
 */
declare class StringValueObject {
    readonly value: string;
    constructor(value: string);
}

/**
 * Copyright (C) RBL Solution 2026
 * All Rights Reserved.
 */

declare class FilterField extends StringValueObject {
    constructor(value: string);
}

/**
 * Copyright (C) RBL Solution 2026
 * All Rights Reserved.
 */
declare abstract class EnumValueObject<T> {
    readonly validValues: T[];
    readonly value: T;
    constructor(value: T, validValues: T[]);
    checkValueIsValid(value: T): void;
    protected abstract throwErrorForInvalidValue(value: T): void;
}

/**
 * Copyright (C) RBL Solution 2026
 * All Rights Reserved.
 */

declare enum Operator$1 {
    EQUAL = "=",
    NOT_EQUAL = "!=",
    GT = ">",
    GTE = ">=",
    LT = "<",
    LTE = "<=",
    CONTAINS = "ILIKE",
    NOT_CONTAINS = "NOT ILIKE",
    BETWEEN = "BETWEEN",
    OR = "OR",
    IN = "IN",
    NOT_IN = "NOT IN",
    NAMED_EQ = "eq",
    NAMED_NOT_EQ = "not_eq",
    NAMED_GT = "gt",
    NAMED_GTE = "gte",
    NAMED_LT = "lt",
    NAMED_LTE = "lte",
    NAMED_CONTAINS = "contains",
    NAMED_NOT_CONTAINS = "not_contains",
    NAMED_BETWEEN = "between",
    NAMED_OR = "or",
    NAMED_IN = "in",
    NAMED_NOT_IN = "not_in"
}
declare class FilterOperator extends EnumValueObject<Operator$1> {
    constructor(value: Operator$1);
    static fromValue(value: string): FilterOperator;
    isPositive(): boolean;
    protected throwErrorForInvalidValue(value: Operator$1): void;
    static equal(): FilterOperator;
}

/**
 * Copyright (C) RBL Solution 2026
 * All Rights Reserved.
 */
declare class AnyValueObject {
    readonly value: any;
    constructor(value: any);
}

/**
 * Copyright (C) RBL Solution 2026
 * All Rights Reserved.
 */

declare class FilterValue extends AnyValueObject {
    constructor(value: any);
}

declare class Filter {
    readonly field: FilterField;
    readonly operator: FilterOperator;
    readonly value: FilterValue;
    constructor(field: FilterField, operator: FilterOperator, value: FilterValue);
    static fromValues(values: Map<string, string>): Filter;
}

/**
 * Copyright (C) RBL Solution 2026
 * All Rights Reserved.
 */

declare class FilterParameters {
    private filters;
    constructor(filters: Array<Filter>);
    getFilters(): Array<Filter>;
    addFilter(column: string, operation: string, value: any): void;
    getFilter(column: string): Filter;
    hasFilter(column: string): boolean;
    toQueryString(): string;
}

/**
 * Copyright (C) RBL Solution 2026
 * All Rights Reserved.
 */
declare class PagingParameter {
    private page;
    private size;
    constructor(parameters: Map<string, number>);
    getPage(): number;
    getSize(): number;
    toQueryString(): string;
}

/**
 * Copyright (C) RBL Solution 2026
 * All Rights Reserved.
 */
declare class RouteParameter {
    private name;
    private path;
    private parameter;
    constructor(name: string, path: string, parameter?: Map<string, any>);
    getName(): string;
    getPath(): string;
    getParameter(): Map<string, any>;
    toQueryString(): string;
}

/**
 * Copyright (C) RBL Solution 2026
 * All Rights Reserved.
 */
declare class SortParameter {
    private _sortField;
    private _isAscending;
    constructor(sortField: string, isAscending: boolean);
    getField(): string;
    isAscending(): boolean;
    isDescending(): boolean;
    toQueryString(): string;
}

interface IIdentifiable {
    id: {
        toString(): string;
    } | string;
}
declare class UserParameter<TUser extends IIdentifiable = IIdentifiable> {
    private user;
    constructor(user: Map<string, any> | TUser);
    getId(): string;
    getUser(): Map<string, any> | TUser;
    toQueryString(): string;
}

declare class FieldSet {
    entity: string;
    columns: string[];
    constructor(entity: string, columns: string[]);
    toQueryString(): string;
}

declare class FieldSetParameters {
    fields: FieldSet[];
    constructor(fields: FieldSet[]);
    toQueryString(): string;
    getFieldSets(): FieldSet[];
    getFieldSetByEntity(entity: string): FieldSet;
}

/**
 * Copyright (C) RBL Solution 2026
 * All Rights Reserved.
 */

interface IParameters {
    getFilterParameters(): FilterParameters;
    getIncludes(): string[];
    getPagingParameters(): PagingParameter;
    getSortParameters(): Array<SortParameter>;
    getCacheParameters(): CacheParameter;
    getRouteParameter(): RouteParameter;
    getUserParameter(): UserParameter;
    getDownloadParameters(): DownloadParameter;
    getFieldSetParameters(): FieldSetParameters;
    toQueryString(exclude?: string[]): string;
    hasFieldSets(): boolean;
    hasIncludes(): boolean;
    hasFilters(): boolean;
    removeSortParameter(field: string): void;
    hasSort(): boolean;
    hasSortField(field: string): boolean;
}
declare class Parameters implements IParameters {
    private _includes;
    private _filterParameters;
    private _sortParameters;
    private _pagingParameters;
    private _routeParameters;
    private _cacheParameters;
    private _userParameter;
    private _downloadParameter;
    private _fieldSetParameters;
    constructor(filterParameters: FilterParameters, includes?: string[], pagingParameters?: PagingParameter, sortParameters?: Array<SortParameter>, routeParameters?: RouteParameter, cacheParameters?: CacheParameter, userParameter?: UserParameter, downloadParameter?: DownloadParameter, fieldSetParameters?: FieldSetParameters);
    getFieldSetParameters(): FieldSetParameters;
    getDownloadParameters(): DownloadParameter;
    getUserParameter(): UserParameter;
    getFilterParameters(): FilterParameters;
    getIncludes(): string[];
    getPagingParameters(): PagingParameter;
    getSortParameters(): Array<SortParameter>;
    getRouteParameter(): RouteParameter;
    getCacheParameters(): CacheParameter;
    hasFieldSets(): boolean;
    hasIncludes(): boolean;
    hasFilters(): boolean;
    hasSort(): boolean;
    hasSortField(field: string): boolean;
    removeSortParameter(field: string): void;
    toQueryString(exclude?: string[]): string;
}

interface IDatabase<TUserContext = unknown> {
    get(): Promise<IDatabase<TUserContext>>;
    close(): void;
    getName(): string;
    getInstance(): Promise<any>;
    getStorage(): any;
    setUserContext(context: TUserContext): void;
    getUserContext(): TUserContext;
    getAdminInstance(): Promise<any>;
    setTransactionContext(transaction: any): void;
    getTransactionContext(): any;
}
interface IDatabaseManager<TUserContext = unknown> {
    getDatabase(): IDatabase<TUserContext>;
    getAuthDatabase(): IDatabase<TUserContext>;
    getStorage(): IDatabase<TUserContext>;
}

/**
 * Copyright (C) RBL Solution 2026
 * All Rights Reserved.
 */

interface IRepository {
    getList(parameter: IParameters): Promise<QueryResponse>;
    getById(record_id: string, parameter?: IParameters): Promise<QueryResponse>;
    create(document: IDocument): Promise<CommandResponse>;
    update(record_id: string, document: Partial<IDocument>): Promise<CommandResponse>;
    delete(record_id: string, document?: IDocument): Promise<CommandResponse>;
    transaction(callback: Function): Promise<CommandResponse>;
    getDatabase(): IDatabase;
    flush(tags?: string[]): Promise<void>;
}

/**
 * Copyright (C) RBL Solution 2026
 * All Rights Reserved.
 */
interface HttpFile {
    fieldName: string;
    originalName: string;
    mimeType: string;
    size: number;
    buffer?: Buffer;
    stream?: ReadableStream;
}

interface IStorageService {
    upload(file: HttpFile, path: string): Promise<string>;
    getPublicAssetUrl(filePath: string): Promise<string>;
    getPrivateAssetUrl(filePath: string): Promise<string>;
}

declare class PaginatedResourceResponse {
    private readonly data;
    private readonly total;
    private readonly parameter;
    constructor(data: any, total: number, parameter: IParameters);
    get meta(): Record<string, number>;
    get links(): Record<string, string | null>;
    get current_page(): number;
    get per_page(): number;
    private _url;
    private get nextPageUrl();
    private get prevPageUrl();
    private get query_string();
    toResponse(): IResponse;
}

interface Token<T> {
    readonly key: symbol;
    readonly name: string;
}
interface Resolver {
    resolve<T>(token: Token<T>): Promise<T>;
}
type Factory<T> = (resolver: Resolver) => T;

/**
 * Copyright (C) RBL Solution 2026
 * All Rights Reserved.
 */

interface ICommand<T = any> extends Token<T> {
}

/**
 * Copyright (C) RBL Solution 2026
 * All Rights Reserved.
 */

interface ICommandHandler<T extends ICommand> {
    handle(command: T): Promise<CommandResponse>;
}

/**
 * Copyright (C) RBL Solution 2026
 * All Rights Reserved.
 */

declare class CommandHandlers {
    private resolver;
    constructor(resolver: Resolver);
    get(command: ICommand): Promise<ICommandHandler<ICommand>>;
}

/**
 * Copyright (C) RBL Solution 2026
 * All Rights Reserved.
 */

interface ICommandBus {
    dispatch(command: ICommand): Promise<CommandResponse>;
}

/**
 * Copyright (C) RBL Solution 2026
 * All Rights Reserved.
 */

declare class InMemoryCommandBus implements ICommandBus {
    private commandHandlers;
    constructor(commandHandlers: CommandHandlers);
    dispatch(command: ICommand): Promise<CommandResponse>;
}

/**
 * Copyright (C) RBL Solution 2026
 * All Rights Reserved.
 */

interface IQuery<T = any> extends Token<T> {
}

/**
 * Copyright (C) RBL Solution 2026
 * All Rights Reserved.
 */

interface IQueryHandler<Q extends IQuery> {
    handle(query: Q): Promise<QueryResponse>;
}

/**
 * Copyright (C) RBL Solution 2026
 * All Rights Reserved.
 */

declare class QueryHandlers {
    private resolver;
    constructor(resolver: Resolver);
    get(query: IQuery): Promise<IQueryHandler<IQuery>>;
}

/**
 * Copyright (C) RBL Solution 2026
 * All Rights Reserved.
 */

interface IQueryBus {
    ask(query: IQuery): Promise<QueryResponse>;
}

/**
 * Copyright (C) RBL Solution 2026
 * All Rights Reserved.
 */

declare class InMemoryQueryBus implements IQueryBus {
    private queryHandlersInformation;
    constructor(queryHandlersInformation: QueryHandlers);
    ask(query: IQuery): Promise<QueryResponse>;
}

declare class Container implements Resolver {
    private readonly registrations;
    singleton<T>(token: Token<T>, factory: Factory<T>): void;
    transient<T>(token: Token<T>, factory: Factory<T>): void;
    resolve<T>(token: Token<T>): Promise<T>;
    private resolveWithChain;
}
interface ModuleContainer {
    load(container: Container): Promise<void>;
}
interface ProviderDefinition<T> {
    token: Token<T>;
    factory?: Factory<T>;
    singleton?: boolean;
}
interface ControllerDefinition<T> {
    token: Token<T>;
    factory?: Factory<T>;
    controllerClass: new (...args: any[]) => T;
}
interface CommandDefinition<T> {
    token: Token<T>;
    factory?: Factory<T>;
}
interface QueryDefinition<T> {
    token: Token<T>;
    factory?: Factory<T>;
}

declare function createToken<T>(name: string): Token<T>;

interface HttpRequest {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    url: string;
    headers: Record<string, string | string[] | undefined>;
    query: Record<string, any>;
    params: Record<string, any>;
    cookies: Record<string, any>;
    body: any;
    files?: HttpFile[];
}
interface AuthenticatedHttpRequest<TUser = unknown> extends NextApiRequest {
    user?: TUser;
    parameter?: IParameters;
}

/**
 * Copyright (C) RBL Solution 2026
 * All Rights Reserved.
 */
interface HttpResponse {
    status: number;
    headers: Record<string, string>;
    body?: any;
}

interface HttpAdapter {
    parseRequest(nativeReq: any, ...args: any[]): Promise<HttpRequest>;
    sendResponse(nativeRes: any, response: HttpResponse): Promise<any>;
    sendNextResponse(nativeRes: any, response: HttpResponse): Promise<any>;
    sendNextResponseRedirect(url: URL): Promise<any>;
}

interface IPermissions {
    isNotProtectedUrl(request: {
        method: string;
        url: string;
    }): boolean;
}
interface IPermissionService {
    getPermissions(): IPermissions;
}
interface IAuthenticationService<TUser = unknown> {
    getUser(): Promise<TUser | null>;
}

declare const CORE_DI_SYMBOLS: {
    HttpAdapter: Token<HttpAdapter>;
    IPermissionService: Token<IPermissionService>;
    IAuthenticationService: Token<IAuthenticationService<unknown>>;
};

declare function Controller(path: string): (target: Function) => void;
declare const Get: (path?: string) => any;
declare const Post: (path?: string) => any;
declare const Put: (path?: string) => any;
declare const Delete: (path?: string) => any;

type DtoConstructor = typeof BaseDto & (new () => any);
declare const Param: (name?: string, DtoClass?: DtoConstructor) => ParameterDecorator;
declare const Query: (name?: string, DtoClass?: DtoConstructor) => ParameterDecorator;
declare const Header: (name?: string, DtoClass?: DtoConstructor) => ParameterDecorator;
declare const Body: (DtoClass?: DtoConstructor) => ParameterDecorator;
declare const Files: () => ParameterDecorator;

interface ModuleMetadata {
    imports?: Function[];
    providers?: ProviderDefinition<any>[] | Function[];
    controllers?: ControllerDefinition<any>[] | Function[];
}
declare const moduleRegistry: Map<Function, ModuleMetadata>;
declare function Module(metadata: ModuleMetadata): ClassDecorator;

declare class EitherAsync<L, R> {
    private readonly promiseValue;
    private constructor();
    map<T>(fn: (r: R) => T): EitherAsync<L, T>;
    flatMap<T>(fn: (right: R) => Promise<Either<L, T>>): EitherAsync<L, T>;
    mapLeft<T>(fn: (l: L) => T): EitherAsync<T, R>;
    flatMapLeft<T>(fn: (left: L) => Promise<Either<T, R>>): EitherAsync<T, R>;
    run(): Promise<Either<L, R>>;
    static fromEither<L, R>(value: Either<L, R>): EitherAsync<L, R>;
    static fromPromise<L, R>(value: Promise<Either<L, R>>): EitherAsync<L, R>;
}

/**
 * Copyright (C) RBL Solution 2026
 * All Rights Reserved.
 *
 *
 * @author Ruel B. Lapid <ruel@anchor-tag.com>
 * @version 1.0.0
 * @since 1.0.0
 */
declare const HTTP_STATUS: {
    BAD_REQUEST: number;
};
declare class ApiException extends Error {
    protected code: number;
    constructor(message: string, code?: number);
    getMessage(): string;
    getCode(): number;
}

/**
 * Copyright (C) RBL Solution 2026
 * All Rights Reserved.
 *
 *
 * @author Ruel B. Lapid <ruel@anchor-tag.com>
 * @version 1.0.0
 * @since 1.0.0
 */

declare class BadRequestException extends ApiException {
    constructor(message: string);
}

declare class SessionExpiredException extends ApiException {
    constructor(message?: string);
}

declare class TokenExpiredException extends ApiException {
    constructor();
}

declare class UnAuthorizedException extends ApiException {
    constructor(message?: string);
}

declare class ValidationException extends ApiException {
    readonly errors: Record<string, string[]>;
    constructor(errors: Record<string, string[]>);
    getErrors(): Record<string, string[]>;
}

declare class InputParseError extends Error {
    constructor(message: string, options?: ErrorOptions);
}

declare namespace DataError {
    const DEFAULT_ERROR_MESSAGE: string;
    const DEFAULT_AUTH_ERROR_MESSAGE: string;
    class UnhandledError extends UseCaseError {
        constructor(error?: Error);
    }
    class QueryError extends UseCaseError {
        constructor(message?: string, code?: number, error?: Error);
    }
    class CommandError extends UseCaseError {
        constructor(message?: string, code?: number, error?: Error);
    }
    class AuthenticationError extends UseCaseError {
        constructor(message?: string, code?: number, error?: Error);
    }
}

interface ValueObjectProps {
    [index: string]: any;
}
declare abstract class ValueObject<T extends ValueObjectProps> {
    readonly properties: T;
    constructor(properties: T);
    equals(vo?: ValueObject<T>): boolean;
}

/**
 * Copyright (C) RBL Solution 2026
 * All Rights Reserved.
 */
declare class InvalidArgumentError extends Error {
}

declare const PASSWORD_MIN_LENGTH = 11;
declare const PASSWORD_PATTERN: RegExp;
declare const PASSWORD_REQUIREMENTS_MESSAGE = "Password must be at least 11 characters and include an uppercase letter, a lowercase letter, a number, and a special character";
/**
 * Generates a random password that satisfies PASSWORD_PATTERN: one char
 * from each required category, padded with random characters from the
 * full set, then shuffled so the required characters aren't always in
 * the same position.
 */
declare function generateSecurePassword(length?: number): string;

interface MiddlewareMeta {
    token: any;
}
interface Middleware {
    use(req: HttpRequest): void | Promise<QueryResponse>;
}

declare class HttpRequestEngine {
    private container;
    private initialized;
    private globalMiddlewareTokens;
    private routesRegistry;
    private _adapter;
    constructor(container: Container);
    registerMiddlewares(globalMiddleware: MiddlewareMeta[]): void;
    registerCommands(commands: CommandDefinition<any>[]): this;
    registerQueries(queries: QueryDefinition<any>[]): this;
    registerControllers(controllers: ControllerDefinition<any>[]): this;
    provide<T>(token: Token<T>): Promise<T>;
    onHandleApiRequest(nativeReq: any, _nativeRes?: any): Promise<any>;
    onHandleRequest(nativeReq: any, nativeRes?: any): Promise<any>;
    private resolveAdapter;
    private matchRoute;
    private extractParams;
    private resolveMethodArguments;
    private resolveArg;
    private runMiddlewares;
    private buildGetParameters;
    private executePipeline;
    private mapResponseToHttp;
    private buildRedirectUrl;
    private handleException;
}

interface IQueryParameters {
    parse(parameter: Map<string, any>): IParameters;
}
declare class QueryParameters implements IQueryParameters {
    parse(parameters: Map<string, any>): IParameters;
    private getDownloadParameter;
    private getFilterParameters;
    private getIncludeParameter;
    private getSortParameter;
    private getPagingParameter;
    private getRouteParameters;
    private getUserParameters;
    private getFieldSetParameters;
    private getCacheParameters;
    _getArrayParamOrNull(key: string, parameters?: Map<string, any>): any;
    _getParamOrNull(key: string, parameters?: Map<string, any>): any;
    _getStringParamOrNull(key: string, parameters?: Map<string, any>): string;
    protected _parseFilters(params?: Map<string, any>): Array<Filter>;
}
type FilterMap = Map<string, [Operator$1, any]>;
type QueryMap = Map<string, any>;
declare class QueryParser {
    static parse(flatRecord: Record<string, any>): QueryMap;
}

declare enum Operator {
    EQUALS = "=",
    CONTAINS = "contains",
    STARTS_WITH = "startswith",
    ENDS_WITH = "endswith",
    GT = "gt",
    GTE = "gte",
    LT = "lt",
    LTE = "lte",
    IN = "in",
    NOT = "not"
}
declare enum FilterValueType {
    UUID = "uuid",
    STRING = "string",
    NUMBER = "number",
    BOOLEAN = "boolean",
    DATE = "date",
    ENUM = "enum"
}
interface FilterFieldConfig {
    operators?: Operator[];
    type: FilterValueType;
    enumValues?: string[];
}
interface FieldsetConfig {
    /** The allowed column names for this include alias. */
    columns: string[];
}
interface QuerySchemaConfig {
    /**
     * Allowed filter fields and their rules.
     * Key = field name (e.g. 'level_id', 'site_id')
     */
    filters?: Record<string, FilterFieldConfig>;
    /**
     * Allowed include values (table names or aliases).
     * e.g. ['test', 'test2']
     */
    includes?: string[];
    /**
     * Allowed fieldset keys and their permitted columns.
     * Key must match an entry in `includes`.
     * e.g. { test: { columns: ['id', 'name'] } }
     */
    fields?: Record<string, FieldsetConfig>;
    /**
     * Whether pagination is allowed on this route.
     * Allowed keys are always 'number' and 'size'.
     * Defaults to true.
     */
    pagination?: boolean;
    sort?: string[];
}
type ParsedFilter = Map<string, [Operator, any]>;
interface ValidatedQuery {
    filter?: ParsedFilter;
    include?: string[];
    fields?: Map<string, string[]>;
    page?: {
        number?: number;
        size?: number;
    };
    sort?: string;
}

interface QuerySchemaMetadata {
    target: Function;
    methodName: string | symbol;
    config: QuerySchemaConfig;
}
declare const querySchemaRegistry: Map<string, QuerySchemaMetadata>;
/** Build the registry key for a given controller + method pair. */
declare function buildRegistryKey(target: Function, methodName: string | symbol): string;
/** Register a QuerySchemaConfig for a controller method. */
declare function registerQuerySchema(target: Function, methodName: string | symbol, config: QuerySchemaConfig): void;
/** Retrieve a QuerySchemaConfig for a controller method. Returns undefined if not registered. */
declare function getQuerySchema(target: Function, methodName: string | symbol): QuerySchemaMetadata | undefined;

/**
 * Registers a query validation schema against a controller method.
 * The router reads this before building IParameters and throws
 * BadRequestException on violation.
 *
 * @example
 * \@Get('')
 * \@QuerySchema({
 *   filters: {
 *     level_id: { type: FilterValueType.UUID },
 *     site_id:  { type: FilterValueType.UUID, operators: [Operator.CONTAINS] },
 *   },
 *   includes: ['anchors', 'sites'],
 *   fields: {
 *     anchors: { columns: ['id', 'name'] },
 *   },
 *   pagination: true,
 * })
 * async getList(parameters?: IParameters): Promise<CommandResponse> { ... }
 */
declare function QuerySchema(config: QuerySchemaConfig): MethodDecorator;

interface QueryValidationError {
    field: string;
    message: string;
}
declare class QueryValidationException extends Error {
    readonly status = 400;
    readonly details: QueryValidationError[];
    constructor(details: QueryValidationError[]);
    toResponse(): {
        code: number;
        error: string;
        message: string;
        errors: QueryValidationError[];
    };
}
/**
 * Validates a parsed QueryMap against the @QuerySchema config registered
 * for the given controller + method.
 *
 * Call this in the router right after QueryParser.parse() and before
 * queryParser.parse(query) builds IParameters.
 *
 * Throws QueryValidationException on failure — the router should catch it
 * and return a 400 response.
 *
 * @param controllerClass  The controller class (e.g. SiteLevelsController)
 * @param methodName       The handler method name (e.g. 'getList')
 * @param query            The QueryMap returned by QueryParser.parse()
 */
declare function validateQuery(controllerClass: Function, methodName: string, query: QueryMap): void;

interface IOTPConfiguration {
    email: boolean;
    sms: boolean;
    mfa: boolean;
}
interface IAuthConfiguration {
    driver: string;
    url: string;
    client_id?: string;
    client_secret: string;
    service_role_key?: string;
    client_role?: string;
    otp?: IOTPConfiguration;
}
interface ICookieConfiguration {
    name: string;
    refresh_token?: string;
    path?: string;
    httpOnly: boolean;
    secure: boolean;
    sameSite?: 'lax' | 'strict' | 'none';
    maxAge: number;
}
interface IPagingConfiguration {
    page: number;
    size: number;
}
interface IApplicationConfiguration {
    name?: string;
    host?: string;
    terms?: string;
    privacy?: string;
    environment: string;
    session_timeout: number;
    jwt_secret?: string;
    jwks?: string;
    cookie: ICookieConfiguration;
    paging?: IPagingConfiguration;
}
interface ICacheServerConfiguration {
    enabled: boolean;
    driver: string;
    url: string;
    token: string;
    maxSize?: number;
    expiration: number;
}
interface IStorageConfiguration {
    enabled: boolean;
    driver: string;
    url: string;
    bucket?: string;
    client_secret?: string;
    signed_url_expiration?: number;
}
interface IDatabaseConfiguration {
    driver?: string;
    dialect?: string;
    name?: string;
    host?: string;
    port?: number;
    username?: string;
    password?: string;
    database?: string;
    url?: string;
    ssl?: boolean;
    max?: number;
    idleTimeoutMillis?: number;
    connectionTimeoutMillis?: number;
    maxUses?: number;
    pool?: boolean;
}
interface IMailerCredential {
    key: string;
    password: string;
}
interface IMailerConfiguration {
    enabled?: boolean;
    host: string;
    port: number;
    from?: string;
    cc?: string;
    credentials?: IMailerCredential;
}
interface IConfigurationProvider<T = any> {
    get<K extends keyof T>(key: K): T[K];
    load(...files: string[]): void;
    validate(): void;
}

interface IUserProperties {
    user_id: string;
    display_name: string;
    role: string;
    role_id: string;
    status: string;
    last_sign_in_at: Date;
}
interface IUserRegistrationProperties {
    user_id?: string;
    display_name: string;
    role_id: string;
    status: string;
    email: string;
    password?: string;
    confirm_password?: string;
    email_confirm?: boolean;
}
interface UserSummaryResponse {
    user_id: string;
    display_name: string;
    email: string;
    role: string;
    role_id: string;
    status: string;
    last_sign_in_at: Date;
    created_at?: string | null;
    updated_at?: string | null;
    deleted_at?: string | null;
}
interface IUserRepository extends IRepository {
    getUserTenants?(user_id: string): Promise<string[]>;
}

type index$2_IUserProperties = IUserProperties;
type index$2_IUserRegistrationProperties = IUserRegistrationProperties;
type index$2_IUserRepository = IUserRepository;
type index$2_UserSummaryResponse = UserSummaryResponse;
declare namespace index$2 {
  export type { index$2_IUserProperties as IUserProperties, index$2_IUserRegistrationProperties as IUserRegistrationProperties, index$2_IUserRepository as IUserRepository, index$2_UserSummaryResponse as UserSummaryResponse };
}

type IRoleProperties = {
    role_id?: string;
    tenant_id?: string | null;
    code?: string;
    name?: string;
    description?: string | null;
    is_system?: boolean;
    status?: string;
    version?: number;
    created_at?: Date;
    updated_at?: Date | null;
    deleted_at?: Date | null;
};
type IRoleDocument = {
    tenant_id?: string | null;
    code: string;
    name: string;
    description?: string | null;
    is_system: boolean;
    status: string;
    permission_ids?: string[];
};
interface RoleSummaryResponse {
    role_id: string;
    tenant_id?: string | null;
    code: string;
    name: string;
    description?: string | null;
    is_system: boolean;
    status: string;
    version?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    deleted_at?: string | null;
}
interface RoleDropdownItemResponse {
    role_id: string;
    name: string;
}
interface IRoleRepository extends IRepository {
    getRoleByCode(code: string, parameter?: IParameters): Promise<QueryResponse>;
    getRolePermissions(role_id: string): Promise<string[]>;
}

type index$1_IRoleDocument = IRoleDocument;
type index$1_IRoleProperties = IRoleProperties;
type index$1_IRoleRepository = IRoleRepository;
type index$1_RoleDropdownItemResponse = RoleDropdownItemResponse;
type index$1_RoleSummaryResponse = RoleSummaryResponse;
declare namespace index$1 {
  export type { index$1_IRoleDocument as IRoleDocument, index$1_IRoleProperties as IRoleProperties, index$1_IRoleRepository as IRoleRepository, index$1_RoleDropdownItemResponse as RoleDropdownItemResponse, index$1_RoleSummaryResponse as RoleSummaryResponse };
}

type IPermissionProperties = {
    permission_id?: string;
    code?: string;
};
type IPermissionDocument = {
    code: string;
};
interface PermissionSummaryResponse {
    permission_id: string;
    code: string;
}
interface IPermissionRepository extends IRepository {
}

type index_IPermissionDocument = IPermissionDocument;
type index_IPermissionProperties = IPermissionProperties;
type index_IPermissionRepository = IPermissionRepository;
type index_PermissionSummaryResponse = PermissionSummaryResponse;
declare namespace index {
  export type { index_IPermissionDocument as IPermissionDocument, index_IPermissionProperties as IPermissionProperties, index_IPermissionRepository as IPermissionRepository, index_PermissionSummaryResponse as PermissionSummaryResponse };
}

export { AnyValueObject, ApiException, type AuthenticatedHttpRequest, BadRequestException, BaseDto, Body, CORE_DI_SYMBOLS, type CommandDefinition, CommandHandlers, type CommandResponse, DataError as ConcreteDataError, Container, Controller, type ControllerDefinition, type DataError$1 as DataError, Delete, Either, EitherAsync, Entity, EnumValueObject, type Factory, type FieldsetConfig, Files, type FilterFieldConfig, type FilterMap, FilterValueType, Get, HTTP_STATUS, Header, type HttpAdapter, type HttpFile, type HttpRequest, HttpRequestEngine, type HttpResponse, type IApplicationConfiguration, type IAuthConfiguration, type IAuthenticationService, type ICacheServerConfiguration, type ICommand, type ICommandBus, type ICommandHandler, type IConfigurationProvider, type ICookieConfiguration, type IDatabase, type IDatabaseConfiguration, type IDatabaseManager, type IDocument, type IEntityPropertyType, type IIdentifiable, type ILogger, type IMailer, type IMailerConfiguration, type IMailerCredential, type IOTPConfiguration, type IPagingConfiguration, type IParameters, type IPermissionService, type IPermissions, type IQuery, type IQueryBus, type IQueryHandler, type IQueryParameters, type IRepository, type IResponse, type IStorageConfiguration, type IStorageService, type IUseCase, Identifier, InMemoryCommandBus, InMemoryQueryBus, InputParseError, InvalidArgumentError, Links, Meta, type Middleware, type MiddlewareMeta, Module, type ModuleContainer, type ModuleMetadata, Operator, PASSWORD_MIN_LENGTH, PASSWORD_PATTERN, PASSWORD_REQUIREMENTS_MESSAGE, PaginatedResourceResponse, Param, Parameters, type ParsedFilter, index as Permissions, Post, type ProviderDefinition, Put, Query, type QueryDefinition, QueryHandlers, type QueryMap, QueryParameters, QueryParser, type QueryResponse, QuerySchema, type QuerySchemaConfig, type QuerySchemaMetadata, type QueryValidationError, QueryValidationException, type Resolver, index$1 as Roles, SessionExpiredException, StringValueObject, type Token, TokenExpiredException, UnAuthorizedException, UniqueEntityID, UseCaseError, UserParameter, index$2 as Users, type ValidatedQuery, ValidationException, ValueObject, buildRegistryKey, createToken, generateSecurePassword, getQuerySchema, moduleRegistry, querySchemaRegistry, registerQuerySchema, validateQuery };
