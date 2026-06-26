// src/Exceptions/ApiException.ts
var HTTP_STATUS = {
  BAD_REQUEST: 400
};
var ApiException = class extends Error {
  code = HTTP_STATUS.BAD_REQUEST;
  constructor(message, code = HTTP_STATUS.BAD_REQUEST) {
    super(message);
    this.code = code;
  }
  getMessage() {
    return this.message;
  }
  getCode() {
    return this.code;
  }
};

// src/Exceptions/ValidationException.ts
var ValidationException = class extends ApiException {
  constructor(errors) {
    super("Validation failed", 422);
    this.errors = errors;
  }
  errors;
  getErrors() {
    return this.errors;
  }
};

// src/BaseDto.ts
var BaseDto = class {
  static schema;
  static validate(data) {
    const result = this.schema.safeParse(data);
    if (!result.success) {
      throw new ValidationException(this.formatErrors(result.error));
    }
    return result.data;
  }
  static formatErrors(error) {
    const formatted = {};
    for (const issue of error.issues) {
      const path = issue.path.join(".");
      if (!formatted[path]) formatted[path] = [];
      formatted[path].push(issue.message);
    }
    return formatted;
  }
};

// src/ValueObjects/UniqueEntityID.ts
import { v4 as uuid } from "uuid";

// src/ValueObjects/Identifier.ts
import { Buffer } from "buffer";
var Identifier = class {
  constructor(value) {
    this.value = value;
    this.value = value;
  }
  value;
  equals(id) {
    if (id === null || id === void 0) {
      return false;
    }
    if (!(id instanceof this.constructor)) {
      return false;
    }
    return id.toValue() === this.value;
  }
  toString() {
    return String(this.value);
  }
  toValue() {
    return this.value;
  }
  _uuidToInt(uuid2) {
    let buffer = Buffer.from(uuid2);
    const result = buffer.readUInt32BE(0);
    return result;
  }
};

// src/ValueObjects/UniqueEntityID.ts
var UniqueEntityID = class extends Identifier {
  constructor(id) {
    super();
    this.value = id ? id : uuid();
  }
};

// src/Entity.ts
var isEntity = (v) => {
  return v instanceof Entity;
};
var Entity = class {
  _id;
  _version;
  properties;
  constructor(props, id) {
    this._id = id ? id : new UniqueEntityID();
    this.properties = props;
  }
  get id() {
    return this._id;
  }
  get version() {
    return this._version;
  }
  incrementVersion() {
    if (this._version && typeof this._version === "number") {
      this._version += 1;
    }
  }
  equals(object) {
    if (object == null || object == void 0) {
      return false;
    }
    if (this === object) {
      return true;
    }
    if (!isEntity(object)) {
      return false;
    }
    return this._id.equals(object._id);
  }
  getChanges(original, updated) {
    const changes = {};
    const compareObjects = (o, u, path = "") => {
      if (typeof o === "object" && typeof u === "object" && o !== null && u !== null) {
        if (Array.isArray(o) && Array.isArray(u)) {
          if (o.length !== u.length || o.some((v, i) => v !== u[i])) {
            changes[path] = { original: o, updated: u };
          }
        } else {
          const allKeys = /* @__PURE__ */ new Set([
            ...Object.keys(o),
            ...Object.keys(u)
          ]);
          allKeys.forEach((key) => {
            const newPath = path ? `${path}.${key}` : key;
            if (!(key in o)) {
              changes[newPath] = {
                original: void 0,
                updated: u[key]
              };
            } else if (!(key in u)) {
              changes[newPath] = {
                original: o[key],
                updated: void 0
              };
            } else {
              compareObjects(o[key], u[key], newPath);
            }
          });
        }
      } else {
        if (o !== u) {
          changes[path] = { original: o, updated: u };
        }
      }
    };
    compareObjects(original, updated);
    return changes;
  }
  toPrimitives() {
    return this.properties;
  }
  toJsonString() {
    return JSON.stringify(this.properties);
  }
};

// src/IResponse.ts
var Links = class _Links {
  self;
  next;
  prev;
  constructor({
    self,
    next,
    prev
  }) {
    this.self = self;
    this.next = next;
    this.prev = prev;
  }
  static fromJson = (json) => new _Links({
    self: json.self,
    next: json.next,
    prev: json.prev
  });
};
var Meta = class _Meta {
  current_page;
  total_items;
  total;
  per_page;
  path;
  constructor({
    current_page,
    total_items,
    total,
    per_page,
    path
  }) {
    this.current_page = current_page;
    this.total_items = total_items;
    this.total = total;
    this.per_page = per_page;
    this.path = path;
  }
  static fromJson = (json) => new _Meta({
    current_page: json.current_page,
    total_items: json.total_items,
    total: json.total,
    per_page: json.per_page,
    path: json.path
  });
};

// src/PaginatedResourceResponse.ts
var PaginatedResourceResponse = class {
  constructor(data, total = 0, parameter) {
    this.data = data;
    this.total = total;
    this.parameter = parameter;
  }
  data;
  total;
  parameter;
  get meta() {
    return {
      current_page: this.current_page,
      per_page: this.per_page,
      total_count: this.total,
      total_items: this.data.length
    };
  }
  get links() {
    return {
      self: this._url(this.current_page),
      prev: this.prevPageUrl,
      next: this.nextPageUrl
    };
  }
  get current_page() {
    return Number(this.parameter.getPagingParameters().getPage());
  }
  get per_page() {
    return Number(this.parameter.getPagingParameters().getSize());
  }
  _url(page) {
    const route = this.parameter.getRouteParameter();
    const paging = `page[number]=${page}&page[size]=${this.per_page}`;
    let query = this.query_string;
    query = query.length ? `${query}&${paging}` : `${paging}`;
    return `${route.getPath()}?${query}`;
  }
  get nextPageUrl() {
    const total_pages = Math.ceil(this.total / this.per_page);
    if (this.current_page < total_pages) {
      return this._url(this.current_page + 1);
    }
    return null;
  }
  get prevPageUrl() {
    if (this.current_page > 1) {
      return this._url(this.current_page - 1);
    }
    return null;
  }
  get query_string() {
    return this.parameter.toQueryString([
      "paging",
      "route",
      "cache",
      "download"
    ]);
  }
  toResponse() {
    return {
      success: true,
      data: this.data,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      meta: this.meta,
      links: this.links
    };
  }
};

// src/Commands/CommandNotRegisteredError.ts
var CommandNotRegisteredError = class extends Error {
  constructor(command) {
    super(
      `The command <${command.constructor.name}> hasn't a command handler associated`
    );
  }
};

// src/Commands/CommandHandlers.ts
var CommandHandlers = class {
  constructor(resolver) {
    this.resolver = resolver;
  }
  resolver;
  async get(command) {
    const commandHandler = await this.resolver.resolve(command);
    if (!commandHandler) {
      throw new CommandNotRegisteredError(command);
    }
    return commandHandler;
  }
};

// src/Commands/InMemoryCommandBus.ts
var InMemoryCommandBus = class {
  constructor(commandHandlers) {
    this.commandHandlers = commandHandlers;
  }
  commandHandlers;
  async dispatch(command) {
    const handler = await this.commandHandlers.get(command);
    return await handler.handle(command);
  }
};

// src/Queries/QueryNotRegisteredError.ts
var QueryNotRegisteredError = class extends Error {
  constructor(query) {
    super(
      `The query <${query.constructor.name}> hasn't a query handler associated`
    );
  }
};

// src/Queries/QueryHandlers.ts
var QueryHandlers = class {
  constructor(resolver) {
    this.resolver = resolver;
  }
  resolver;
  async get(query) {
    const queryHandler = await this.resolver.resolve(query);
    if (!queryHandler) {
      throw new QueryNotRegisteredError(query);
    }
    return queryHandler;
  }
};

// src/Queries/InMemoryQueryBus.ts
var InMemoryQueryBus = class {
  constructor(queryHandlersInformation) {
    this.queryHandlersInformation = queryHandlersInformation;
  }
  queryHandlersInformation;
  async ask(query) {
    const handler = await this.queryHandlersInformation.get(query);
    return await handler.handle(query);
  }
};

// src/Container/index.ts
var Container = class {
  registrations = /* @__PURE__ */ new Map();
  singleton(token, factory) {
    this.registrations.set(token.key, {
      factory,
      singleton: true
    });
  }
  transient(token, factory) {
    this.registrations.set(token.key, {
      factory,
      singleton: false
    });
  }
  async resolve(token) {
    return this.resolveWithChain(token, /* @__PURE__ */ new Set());
  }
  // `chain` tracks only the tokens being resolved along *this* dependency
  // path. Tracking it as shared container state (a single `resolving` Set)
  // caused false "circular dependency" errors: two unrelated concurrent
  // resolutions of the same token (e.g. two requests each resolving
  // HttpAdapter — common, and especially frequent during dev hot-reload
  // bursts) would race on that shared Set and trip the cycle guard even
  // though neither was actually circular. Threading a fresh chain per
  // top-level call keeps concurrent resolutions independent while still
  // catching real cycles within a single chain.
  async resolveWithChain(token, chain) {
    const registration = this.registrations.get(token.key);
    if (!registration) {
      console.log(`Token not registered: ${token.name}`);
      if (process.env.NODE_ENV == "development") {
        throw new Error(`Token not registered: ${token.name}`);
      } else {
        throw new Error(
          "Something went wrong while processing your request. If it keeps happening, please reach out to support."
        );
      }
    }
    if (chain.has(token.key)) {
      console.log(`Circular dependency detected: ${token.name}`);
      if (process.env.NODE_ENV == "development") {
        throw new Error(`Circular dependency detected: ${token.name}`);
      } else {
        throw new Error(
          "Something went wrong while processing your request. If it keeps happening, please reach out to support."
        );
      }
    }
    const nextChain = new Set(chain);
    nextChain.add(token.key);
    const scopedResolver = {
      resolve: (nextToken) => this.resolveWithChain(nextToken, nextChain)
    };
    if (registration.singleton) {
      if (!registration.instance) {
        registration.instance = registration.factory(
          scopedResolver
        );
      }
      return registration.instance;
    }
    return await registration.factory(scopedResolver);
  }
};

// src/Container/createToken.ts
function createToken(name) {
  return {
    name,
    key: Symbol.for(name)
  };
}

// src/Container/Tokens.ts
var CORE_DI_SYMBOLS = {
  HttpAdapter: createToken("HttpAdapter"),
  IPermissionService: createToken("IPermissionService"),
  IAuthenticationService: createToken(
    "IAuthenticationService"
  )
};

// src/Decorators/Route/index.ts
var controllerRegistry = /* @__PURE__ */ new Map();
var routeRegistry = /* @__PURE__ */ new Map();
function Controller(path) {
  return function(target) {
    controllerRegistry.set(target, {
      path
    });
  };
}
function createMappingDecorator(method) {
  return (path = "") => {
    return function(target, propertyKey) {
      const controllerClass = target.constructor;
      const routes = routeRegistry.get(controllerClass) ?? [];
      routes.push({
        path,
        requestMethod: method,
        methodName: propertyKey,
        controllerClass
      });
      routeRegistry.set(controllerClass, routes);
    };
  };
}
var Get = createMappingDecorator("GET");
var Post = createMappingDecorator("POST");
var Put = createMappingDecorator("PUT");
var Patch = createMappingDecorator("PATCH");
var Delete = createMappingDecorator("DELETE");

// src/Decorators/Parameters/index.ts
var parameterRegistry = /* @__PURE__ */ new Map();
function createParamDecorator(type) {
  return (name, DtoClass) => {
    return (target, propertyKey, parameterIndex) => {
      if (!propertyKey) return;
      const controllerClassMethod = target.constructor.prototype;
      let existingParams = parameterRegistry.get(
        controllerClassMethod
      );
      const meta = {
        index: parameterIndex,
        type,
        name,
        methodName: propertyKey,
        dto: DtoClass,
        pipes: []
      };
      if (!existingParams) {
        parameterRegistry.set(controllerClassMethod, [meta]);
      } else {
        existingParams.push(meta);
      }
    };
  };
}
var Param = createParamDecorator("PARAM");
var Query = createParamDecorator("QUERY");
var Header = createParamDecorator("HEADER");
var Body = (DtoClass) => {
  return (target, propertyKey, parameterIndex) => {
    if (!propertyKey) return;
    const controllerClassMethod = target.constructor.prototype;
    let existingParams = parameterRegistry.get(
      controllerClassMethod
    );
    const meta = {
      index: parameterIndex,
      type: "BODY",
      name: DtoClass,
      methodName: propertyKey,
      dto: DtoClass,
      pipes: []
    };
    if (!existingParams) {
      parameterRegistry.set(controllerClassMethod, [meta]);
    } else {
      existingParams.push(meta);
    }
  };
};
var Files = () => {
  return (target, propertyKey, parameterIndex) => {
    if (!propertyKey) return;
    const controllerClassMethod = target.constructor.prototype;
    let existingParams = parameterRegistry.get(
      controllerClassMethod
    );
    const meta = {
      index: parameterIndex,
      type: "FILES",
      methodName: propertyKey,
      pipes: [],
      factory: (req) => req.files ?? []
    };
    if (!existingParams) {
      parameterRegistry.set(controllerClassMethod, [meta]);
    } else {
      existingParams.push(meta);
    }
  };
};

// src/Decorators/Module/index.ts
var moduleRegistry = /* @__PURE__ */ new Map();
function Module(metadata) {
  return (target) => {
    moduleRegistry.set(target, metadata);
  };
}

// src/UseCase/Either.ts
var Either = class _Either {
  constructor(value) {
    this.value = value;
  }
  value;
  isLeft() {
    return this.value.kind === "left";
  }
  isRight() {
    return this.value.kind === "right";
  }
  fold(leftFn, rightFn) {
    switch (this.value.kind) {
      case "left":
        return leftFn(this.value.leftValue);
      case "right":
        return rightFn(this.value.rightValue);
    }
  }
  map(fn) {
    return this.flatMap((r) => _Either.right(fn(r)));
  }
  flatMap(fn) {
    return this.fold(
      (leftValue) => _Either.left(leftValue),
      (rightValue) => fn(rightValue)
    );
  }
  mapLeft(fn) {
    return this.flatMapLeft((l) => _Either.left(fn(l)));
  }
  flatMapLeft(fn) {
    return this.fold(
      (leftValue) => fn(leftValue),
      (rightValue) => _Either.right(rightValue)
    );
  }
  get(errorMessage) {
    return this.getOrThrow(errorMessage);
  }
  getOrThrow(errorMessage) {
    const throwFn = () => {
      throw Error(
        errorMessage ? errorMessage : "An error has occurred retrieving value: " + JSON.stringify(this.value)
      );
    };
    return this.fold(
      () => throwFn(),
      (rightValue) => rightValue
    );
  }
  getLeft() {
    const throwFn = () => {
      throw Error("The value is right: " + JSON.stringify(this.value));
    };
    return this.fold(
      (leftValue) => leftValue,
      () => throwFn()
    );
  }
  getRight() {
    const throwFn = () => {
      throw Error("The value is left: " + JSON.stringify(this.value));
    };
    return this.fold(
      () => throwFn(),
      (rightValue) => rightValue
    );
  }
  getOrElse(defaultValue) {
    return this.fold(
      () => defaultValue,
      (someValue) => someValue
    );
  }
  static left(value) {
    return new _Either({ kind: "left", leftValue: value });
  }
  static right(value) {
    return new _Either({ kind: "right", rightValue: value });
  }
};

// src/UseCase/UseCaseError.ts
var UseCaseError = class {
  code;
  message;
  error;
  constructor(message, code, error) {
    this.message = message;
    this.code = code;
    this.error = error;
  }
};

// src/UseCase/EitherAsync.ts
var EitherAsync = class _EitherAsync {
  constructor(promiseValue) {
    this.promiseValue = promiseValue;
  }
  promiseValue;
  map(fn) {
    return this.flatMap(async (r) => Either.right(fn(r)));
  }
  flatMap(fn) {
    return new _EitherAsync(async () => {
      const value = await this.promiseValue();
      return value.fold(
        async (rightValue) => Either.left(rightValue),
        (rightValue) => fn(rightValue)
      );
    });
  }
  mapLeft(fn) {
    return this.flatMapLeft(async (l) => Either.left(fn(l)));
  }
  flatMapLeft(fn) {
    return new _EitherAsync(async () => {
      const value = await this.promiseValue();
      return value.fold(
        (leftValue) => fn(leftValue),
        async (rightValue) => Either.right(rightValue)
      );
    });
  }
  run() {
    return this.promiseValue();
  }
  static fromEither(value) {
    return new _EitherAsync(() => Promise.resolve(value));
  }
  static fromPromise(value) {
    return new _EitherAsync(() => value);
  }
};

// src/Exceptions/BadRequestException.ts
var BadRequestException = class extends ApiException {
  constructor(message) {
    super(message, HTTP_STATUS.BAD_REQUEST);
  }
};

// src/Exceptions/SessionExpiredException.ts
var SessionExpiredException = class extends ApiException {
  constructor(message = "You need to be logged in to view the page. Please sign in to your account to access this content.") {
    super(message, 406);
  }
};

// src/Exceptions/TokenExpiredException.ts
var TokenExpiredException = class extends ApiException {
  constructor() {
    super("The token has expired", 406);
  }
};

// src/Exceptions/UnAuthorizedException.ts
var UnAuthorizedException = class extends ApiException {
  constructor(message = "Invalid or expired access token.") {
    super(message, 401);
  }
};

// src/Exceptions/InputParser.ts
var InputParseError = class extends Error {
  constructor(message, options) {
    super(message, options);
  }
};

// src/Exceptions/index.ts
var DataError;
((DataError2) => {
  DataError2.DEFAULT_ERROR_MESSAGE = "Looks like something went wrong on our end. If the issue persist, please shoot us a note so we can help out. We apologize for the inconvenience.";
  DataError2.DEFAULT_AUTH_ERROR_MESSAGE = "Looks like something went wrong! We're having trouble understanding your request. Would you like to try again, or can we help you find something else?";
  class UnhandledError extends UseCaseError {
    constructor(error) {
      super(DataError2.DEFAULT_ERROR_MESSAGE, 400, error);
    }
  }
  DataError2.UnhandledError = UnhandledError;
  class QueryError extends UseCaseError {
    constructor(message, code, error) {
      message = message ? message : DataError2.DEFAULT_ERROR_MESSAGE;
      super(
        message,
        code ? code : 400,
        error ? error : new Error(message)
      );
    }
  }
  DataError2.QueryError = QueryError;
  class CommandError extends UseCaseError {
    constructor(message, code, error) {
      message = message ? message : DataError2.DEFAULT_ERROR_MESSAGE;
      super(
        message,
        code ? code : 400,
        error ? error : new Error(message)
      );
    }
  }
  DataError2.CommandError = CommandError;
  class AuthenticationError extends UseCaseError {
    constructor(message, code, error) {
      message = message ? message : "Authentication Failed.";
      super(
        message,
        code ? code : 406,
        error ? error : new Error(message)
      );
    }
  }
  DataError2.AuthenticationError = AuthenticationError;
})(DataError || (DataError = {}));

// src/ValueObjects/ValueObject.ts
import { shallowEqual } from "shallow-equal-object";
var ValueObject = class {
  properties;
  constructor(properties) {
    this.properties = Object.freeze(properties);
  }
  equals(vo) {
    if (vo === null || vo === void 0) {
      return false;
    }
    if (vo.properties === void 0) {
      return false;
    }
    return shallowEqual(this.properties, vo.properties);
  }
};

// src/ValueObjects/AnyValueObject.ts
var AnyValueObject = class {
  value;
  constructor(value) {
    this.value = value;
  }
};

// src/ValueObjects/EnumValueObject.ts
var EnumValueObject = class {
  constructor(value, validValues) {
    this.validValues = validValues;
    this.value = value;
    this.checkValueIsValid(value);
  }
  validValues;
  value;
  checkValueIsValid(value) {
    if (!this.validValues.includes(value)) {
      this.throwErrorForInvalidValue(value);
    }
  }
};

// src/ValueObjects/StringValueObject.ts
var StringValueObject = class {
  value;
  constructor(value) {
    this.value = value;
  }
};

// src/ValueObjects/InvalidArgumentError.ts
var InvalidArgumentError = class extends Error {
};

// src/Validators/Password.ts
import { randomInt } from "crypto";
var PASSWORD_MIN_LENGTH = 11;
var PASSWORD_PATTERN = new RegExp(
  `^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^a-zA-Z0-9\\s])[^\\s]{${PASSWORD_MIN_LENGTH},}$`
);
var PASSWORD_REQUIREMENTS_MESSAGE = `Password must be at least ${PASSWORD_MIN_LENGTH} characters and include an uppercase letter, a lowercase letter, a number, and a special character`;
var LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
var UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
var DIGITS = "0123456789";
var SPECIAL = "!@#$%^&*()-_=+?";
var ALL_CHARS = LOWERCASE + UPPERCASE + DIGITS + SPECIAL;
function pickRandom(charset) {
  return charset[randomInt(charset.length)];
}
function generateSecurePassword(length = PASSWORD_MIN_LENGTH) {
  const chars = [
    pickRandom(LOWERCASE),
    pickRandom(UPPERCASE),
    pickRandom(DIGITS),
    pickRandom(SPECIAL)
  ];
  for (let i = chars.length; i < length; i++) {
    chars.push(pickRandom(ALL_CHARS));
  }
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}

// src/Query/Parameters/CacheParameter.ts
var CacheParameter = class {
  status;
  clear;
  expiration;
  key;
  tags;
  constructor(parameters) {
    this.status = parameters && parameters.has("status") ? parameters.get("status") : false;
    this.clear = parameters && parameters.has("clear") ? parameters.get("clear") : false;
    this.expiration = parameters && parameters.has("expiration") ? parameters.get("expiration") : 1;
    this.key = parameters && parameters.has("key") ? parameters.get("key") : null;
    this.tags = parameters && parameters.has("tags") ? parameters.get("tags") : [];
  }
  getStatus() {
    return this.status;
  }
  isClear() {
    return this.clear;
  }
  getExpiration() {
    return this.expiration;
  }
  getKey() {
    return this.key;
  }
  getTags() {
    return this.tags;
  }
  toQueryString() {
    let query = `cache[status]=${this.status}&cache[clear]=${this.clear}&cache[expiration]=${this.expiration}`;
    if (this.key) {
      query += `cache[key]=${this.key}`;
    }
    if (this.tags.length) {
      query += `cache[tags]=${this.tags.join(",")}`;
    }
    return query;
  }
};

// src/Query/Parameters/DownloadParameter.ts
var DownloadParameter = class {
  _format;
  _isDownload;
  //private _allowedFormat: Array<string> = new Array<string>(...['CSV', 'XLS', 'XLSX', 'JSON'])
  constructor(parameters) {
    this._format = parameters && parameters.has("format") ? parameters.get("format").toUpperCase() : "JSON";
    this._isDownload = parameters && parameters.has("status") && parameters.get("status");
  }
  getFormat() {
    return this._format;
  }
  isDownload() {
    return this._isDownload;
  }
  toQueryString() {
    return `download[format]=${this._format}`;
  }
};

// src/Query/Parameters/FilterField.ts
var FilterField = class extends StringValueObject {
  constructor(value) {
    super(value);
  }
};

// src/Query/Parameters/FilterOperator.ts
var Operator = /* @__PURE__ */ ((Operator3) => {
  Operator3["EQUAL"] = "=";
  Operator3["NOT_EQUAL"] = "!=";
  Operator3["GT"] = ">";
  Operator3["GTE"] = ">=";
  Operator3["LT"] = "<";
  Operator3["LTE"] = "<=";
  Operator3["CONTAINS"] = "ILIKE";
  Operator3["NOT_CONTAINS"] = "NOT ILIKE";
  Operator3["BETWEEN"] = "BETWEEN";
  Operator3["OR"] = "OR";
  Operator3["IN"] = "IN";
  Operator3["NOT_IN"] = "NOT IN";
  Operator3["NAMED_EQ"] = "eq";
  Operator3["NAMED_NOT_EQ"] = "not_eq";
  Operator3["NAMED_GT"] = "gt";
  Operator3["NAMED_GTE"] = "gte";
  Operator3["NAMED_LT"] = "lt";
  Operator3["NAMED_LTE"] = "lte";
  Operator3["NAMED_CONTAINS"] = "contains";
  Operator3["NAMED_NOT_CONTAINS"] = "not_contains";
  Operator3["NAMED_BETWEEN"] = "between";
  Operator3["NAMED_OR"] = "or";
  Operator3["NAMED_IN"] = "in";
  Operator3["NAMED_NOT_IN"] = "not_in";
  return Operator3;
})(Operator || {});
var FilterOperator = class _FilterOperator extends EnumValueObject {
  constructor(value) {
    super(value, Object.values(Operator));
  }
  static fromValue(value) {
    for (const operatorValue of Object.values(Operator)) {
      if (value === operatorValue.toString()) {
        return new _FilterOperator(operatorValue);
      }
    }
    throw new InvalidArgumentError(
      `The filter operator ${value} is invalid`
    );
  }
  isPositive() {
    return this.value !== "!=" /* NOT_EQUAL */ && this.value !== "NOT ILIKE" /* NOT_CONTAINS */;
  }
  throwErrorForInvalidValue(value) {
    throw new InvalidArgumentError(
      `The filter operator ${value} is invalid`
    );
  }
  static equal() {
    return this.fromValue("=" /* EQUAL */);
  }
};

// src/Query/Parameters/FilterValue.ts
var FilterValue = class extends AnyValueObject {
  constructor(value) {
    super(value);
  }
};

// src/Query/Parameters/Filter.ts
var Filter = class _Filter {
  field;
  operator;
  value;
  constructor(field, operator, value) {
    this.field = field;
    this.operator = operator;
    this.value = value;
  }
  static fromValues(values) {
    const field = values.get("field");
    const operator = values.get("operator");
    const value = values.get("value");
    if (!field || !operator || !value) {
      throw new InvalidArgumentError(`The filter is invalid`);
    }
    return new _Filter(
      new FilterField(field),
      FilterOperator.fromValue(operator),
      new FilterValue(value)
    );
  }
};

// src/Query/Parameters/FilterParameters.ts
var FilterParameters = class {
  filters;
  constructor(filters) {
    this.filters = filters;
  }
  getFilters() {
    return this.filters;
  }
  addFilter(column, operation, value) {
    if (!Array.isArray(this.filters) || this.filters.length == 0) {
      this.filters = new Array();
    }
    this.filters.push(
      new Filter(
        new FilterField(column),
        FilterOperator.fromValue(operation),
        new FilterValue(value)
      )
    );
  }
  getFilter(column) {
    if (Array.isArray(this.filters) && this.filters.length) {
      const filter = this.filters.find(
        (filter2) => filter2.field.value == column
      );
      return filter;
    }
    return null;
  }
  hasFilter(column) {
    if (Array.isArray(this.filters) && this.filters.length) {
      const filter = this.getFilter(column);
      return filter !== void 0 && filter !== null;
    }
    return false;
  }
  toQueryString() {
    return this.filters ? this.filters.map((filter) => {
      const operator = filter.operator ? `[${filter.operator.value}]` : "";
      return `filter[${filter.field.value}]${operator}=${filter.value.value}`;
    }).join("&") : "";
  }
};

// src/Query/Parameters/index.ts
var Parameters = class {
  _includes;
  _filterParameters;
  _sortParameters;
  _pagingParameters;
  _routeParameters;
  _cacheParameters;
  _userParameter;
  _downloadParameter;
  _fieldSetParameters;
  constructor(filterParameters, includes, pagingParameters, sortParameters, routeParameters, cacheParameters, userParameter, downloadParameter, fieldSetParameters) {
    this._filterParameters = filterParameters;
    this._includes = includes;
    this._pagingParameters = pagingParameters;
    this._sortParameters = sortParameters;
    this._routeParameters = routeParameters;
    this._cacheParameters = cacheParameters;
    this._userParameter = userParameter;
    this._downloadParameter = downloadParameter;
    this._fieldSetParameters = fieldSetParameters;
  }
  getFieldSetParameters() {
    return this._fieldSetParameters;
  }
  getDownloadParameters() {
    return this._downloadParameter;
  }
  getUserParameter() {
    return this._userParameter;
  }
  getFilterParameters() {
    return this._filterParameters;
  }
  getIncludes() {
    return this._includes;
  }
  getPagingParameters() {
    return this._pagingParameters;
  }
  getSortParameters() {
    return this._sortParameters;
  }
  getRouteParameter() {
    return this._routeParameters;
  }
  getCacheParameters() {
    return this._cacheParameters;
  }
  hasFieldSets() {
    return this._fieldSetParameters !== void 0 && this._fieldSetParameters !== null;
  }
  hasIncludes() {
    return this._includes !== void 0 && this._includes !== null && Array.isArray(this._includes) && this._includes.length > 0;
  }
  hasFilters() {
    return this._filterParameters !== void 0 && this._filterParameters !== null;
  }
  hasSort() {
    return Array.isArray(this._sortParameters) && this._sortParameters.length > 0;
  }
  hasSortField(field) {
    return this.hasSort() && this._sortParameters.find((s) => s.getField() == field) !== void 0;
  }
  removeSortParameter(field) {
    this._sortParameters = this._sortParameters.filter(
      (p) => p.getField() != field
    );
  }
  toQueryString(exclude = []) {
    let query = "";
    if (!exclude.includes("includes") && Array.isArray(this._includes) && this._includes.length) {
      query += "include=" + this._includes.join(",");
    }
    if (!exclude.includes("filters") && this._filterParameters) {
      query += (query.length ? "&" : "") + this._filterParameters.toQueryString();
    }
    if (!exclude.includes("paging") && this._pagingParameters) {
      query += (query.length ? "&" : "") + this._pagingParameters.toQueryString();
    }
    if (!exclude.includes("sort") && Array.isArray(this._sortParameters) && this._sortParameters.length) {
      query += (query.length ? "&" : "") + "sort=" + this._sortParameters.map((p) => p.toQueryString()).join(",");
    }
    if (!exclude.includes("cache") && this._cacheParameters) {
      query += (query.length ? "&" : "") + this._cacheParameters.toQueryString();
    }
    if (!exclude.includes("route") && this._routeParameters) {
      query += (query.length ? "&" : "") + this._routeParameters.toQueryString();
    }
    if (!exclude.includes("download") && this._downloadParameter) {
      query += (query.length ? "&" : "") + this._downloadParameter.toQueryString();
    }
    if (!exclude.includes("fieldsets") && this._fieldSetParameters) {
      query += (query.length ? "&" : "") + this._fieldSetParameters.toQueryString();
    }
    return query;
  }
};

// src/Query/Parameters/PagingParameter.ts
var PagingParameter = class {
  page;
  size;
  constructor(parameters) {
    this.page = parameters && parameters.has("number") ? parameters.get("number") : 1;
    this.size = parameters && parameters.has("size") ? parameters.get("size") : 50;
  }
  getPage() {
    return this.page;
  }
  getSize() {
    return this.size;
  }
  toQueryString() {
    return `page[number]=${this.getPage()}&page[size]=${this.getSize()}`;
  }
};

// src/Query/Parameters/RouteParameter.ts
import { URLSearchParams } from "url";
var RouteParameter = class {
  name;
  path;
  parameter;
  constructor(name, path, parameter) {
    this.name = name;
    this.path = path;
    this.parameter = parameter;
  }
  getName() {
    return this.name;
  }
  getPath() {
    return this.path;
  }
  getParameter() {
    return this.parameter;
  }
  toQueryString() {
    const entries = Object.entries(this.parameter ?? {});
    const searchParams = entries ? new URLSearchParams(Array.from(entries)).toString() : "";
    return `route[name]=${this.name}&route[path]=${this.path}${searchParams ? "&" + searchParams : ""}`;
  }
};

// src/Query/Parameters/SortParameter.ts
var SortParameter = class {
  _sortField;
  _isAscending;
  constructor(sortField, isAscending) {
    this._sortField = sortField;
    this._isAscending = isAscending;
  }
  getField() {
    return this._sortField;
  }
  isAscending() {
    return this._isAscending;
  }
  isDescending() {
    return !this._isAscending;
  }
  toQueryString() {
    return `${this.isAscending() ? "-" : ""}${this._sortField}`;
  }
};

// src/Query/Parameters/UserParameter.ts
var UserParameter = class {
  constructor(user) {
    this.user = user;
  }
  user;
  getId() {
    return this.user instanceof Map ? this.user.get("id") : this.user.id.toString();
  }
  getUser() {
    return this.user;
  }
  toQueryString() {
    return `user[id]=${this.getId()}`;
  }
};

// src/Query/Parameters/FieldSetParameters.ts
var FieldSetParameters = class {
  constructor(fields) {
    this.fields = fields;
  }
  fields;
  toQueryString() {
    return this.fields.map((field) => field.toQueryString()).join("&");
  }
  getFieldSets() {
    return this.fields;
  }
  getFieldSetByEntity(entity) {
    return this.fields.find((f) => f.entity == entity);
  }
};

// src/Query/Parameters/FieldSet.ts
var FieldSet = class {
  constructor(entity, columns) {
    this.entity = entity;
    this.columns = columns;
  }
  entity;
  columns;
  toQueryString() {
    return `fields[${this.entity}]=${this.columns.join(",")}`;
  }
};

// src/Query/index.ts
var OPERATOR_MAP = {
  contains: "contains" /* NAMED_CONTAINS */,
  equals: "=" /* EQUAL */,
  not_eq: "not_eq" /* NAMED_NOT_EQ */,
  gt: "gt" /* NAMED_GT */,
  lt: "lt" /* NAMED_LT */,
  gte: "gte" /* NAMED_GTE */,
  lte: "lte" /* NAMED_LTE */,
  between: "between" /* NAMED_BETWEEN */
};
var QueryParameters = class {
  parse(parameters) {
    return new Parameters(
      this.getFilterParameters(parameters.get("filter")),
      this.getIncludeParameter(parameters.get("include")),
      this.getPagingParameter(parameters.get("page")),
      this.getSortParameter(parameters.get("sort")),
      this.getRouteParameters(parameters.get("route")),
      this.getCacheParameters(parameters.get("cache")),
      this.getUserParameters(parameters.get("user")),
      this.getDownloadParameter(parameters.get("download")),
      this.getFieldSetParameters(parameters.get("fields"))
    );
  }
  getDownloadParameter(parameters) {
    return new DownloadParameter(parameters);
  }
  getFilterParameters(parameter) {
    const filters = this._parseFilters(parameter);
    return new FilterParameters(filters);
  }
  getIncludeParameter(parameter) {
    if (Array.isArray(parameter)) {
      return parameter;
    }
    let includes = [];
    if (parameter && parameter.length) {
      includes = parameter.trim().split(",");
    }
    return includes;
  }
  getSortParameter(parameter) {
    let sortParameters = new Array();
    if (parameter && parameter.length) {
      const sorts = Array.isArray(parameter) ? parameter : parameter.trim().split(",");
      for (let sort of sorts) {
        const param = sort.trim().charAt(0);
        const isDesc = param == "-";
        const field = sort.replace("-", "").replace("+", "");
        sortParameters.push(new SortParameter(field, !isDesc));
      }
    }
    return sortParameters;
  }
  getPagingParameter(parameters) {
    return new PagingParameter(parameters);
  }
  getRouteParameters(parameters) {
    return new RouteParameter(
      this._getParamOrNull("name", parameters),
      this._getParamOrNull("path", parameters),
      this._getParamOrNull("parameters", parameters)
    );
  }
  getUserParameters(parameters) {
    return new UserParameter(parameters);
  }
  getFieldSetParameters(parameters) {
    if (parameters) {
      const fieldSets = [];
      for (const [key, value] of parameters) {
        const fieldSet = new FieldSet(key, value);
        fieldSets.push(fieldSet);
      }
      return new FieldSetParameters(fieldSets);
    }
    return null;
  }
  getCacheParameters(parameters) {
    return new CacheParameter(parameters);
  }
  _getArrayParamOrNull(key, parameters) {
    const value = this._getParamOrNull(key, parameters);
    if (null !== value && !Array.isArray(parameters)) {
      throw new BadRequestException(
        "Value should be either an array or null."
      );
    }
    return value;
  }
  _getParamOrNull(key, parameters) {
    return parameters && parameters.has(key) ? parameters.get(key) : null;
  }
  _getStringParamOrNull(key, parameters) {
    const value = this._getParamOrNull(key, parameters);
    if (null !== value && typeof value === "string") {
      throw new BadRequestException(
        "Value should be either a string or null."
      );
    }
    return value;
  }
  _parseFilters(params) {
    if (!params) {
      return new Array();
    }
    const filters = new Array();
    for (const [key, value] of params) {
      const operator = value[0];
      const filterValue = value[1];
      switch (operator) {
        case "contains" /* NAMED_CONTAINS */:
        case "ILIKE" /* CONTAINS */:
          filters.push(
            new Filter(
              new FilterField(key),
              FilterOperator.fromValue("ILIKE"),
              new FilterValue(filterValue)
            )
          );
          break;
        case "not_contains" /* NAMED_NOT_CONTAINS */:
        case "NOT ILIKE" /* NOT_CONTAINS */:
          filters.push(
            new Filter(
              new FilterField(key),
              FilterOperator.fromValue("NOT ILIKE"),
              new FilterValue(filterValue)
            )
          );
          break;
        case "gt" /* NAMED_GT */:
        case ">" /* GT */:
          filters.push(
            new Filter(
              new FilterField(key),
              FilterOperator.fromValue(">"),
              new FilterValue(filterValue)
            )
          );
          break;
        case "gte" /* NAMED_GTE */:
        case ">=" /* GTE */:
          filters.push(
            new Filter(
              new FilterField(key),
              FilterOperator.fromValue(">="),
              new FilterValue(filterValue)
            )
          );
          break;
        case "lt" /* NAMED_LT */:
        case "<" /* LT */:
          filters.push(
            new Filter(
              new FilterField(key),
              FilterOperator.fromValue("<"),
              new FilterValue(filterValue)
            )
          );
          break;
        case "lte" /* NAMED_LTE */:
        case "<=" /* LTE */:
          filters.push(
            new Filter(
              new FilterField(key),
              FilterOperator.fromValue("<="),
              new FilterValue(filterValue)
            )
          );
          break;
        case "between" /* NAMED_BETWEEN */:
        case "BETWEEN" /* BETWEEN */:
          filters.push(
            new Filter(
              new FilterField(key),
              FilterOperator.fromValue("BETWEEN"),
              new FilterValue(filterValue)
            )
          );
          break;
        case "not_eq" /* NAMED_NOT_EQ */:
        case "!=" /* NOT_EQUAL */:
          filters.push(
            new Filter(
              new FilterField(key),
              FilterOperator.fromValue("!="),
              new FilterValue(filterValue)
            )
          );
          break;
        case "eq" /* NAMED_EQ */:
        case "=" /* EQUAL */:
        default:
          filters.push(
            new Filter(
              new FilterField(key),
              FilterOperator.fromValue("="),
              new FilterValue(filterValue)
            )
          );
          break;
      }
    }
    return filters;
  }
};
var QueryParser = class {
  static parse(flatRecord) {
    const query = /* @__PURE__ */ new Map();
    for (const [flatKey, rawValue] of Object.entries(flatRecord)) {
      if (rawValue === void 0 || rawValue === null) continue;
      let value = typeof rawValue === "string" && rawValue.includes(",") ? rawValue.split(",").map((item) => item.trim()) : rawValue;
      const keys = flatKey.match(/[^[\]]+/g);
      if (!keys) {
        query.set(flatKey, value);
        continue;
      }
      const [group, field, operatorSegment] = keys;
      if (group === "filter" && field) {
        if (!query.has("filter")) {
          query.set("filter", /* @__PURE__ */ new Map());
        }
        const filterMap = query.get("filter");
        const operator = operatorSegment ? OPERATOR_MAP[operatorSegment.toLowerCase()] ?? "=" /* EQUAL */ : "=" /* EQUAL */;
        filterMap.set(field, [operator, value]);
        continue;
      }
      if (keys.length === 1) {
        if (group === "sort" && !Array.isArray(value)) {
          value = [value];
        }
        query.set(group, value);
      } else {
        if (!query.has(group)) {
          query.set(group, /* @__PURE__ */ new Map());
        }
        const groupMap = query.get(group);
        groupMap.set(field, value);
      }
    }
    return query;
  }
};

// src/Query/Validator/Types.ts
var Operator2 = /* @__PURE__ */ ((Operator3) => {
  Operator3["EQUALS"] = "=";
  Operator3["CONTAINS"] = "contains";
  Operator3["STARTS_WITH"] = "startswith";
  Operator3["ENDS_WITH"] = "endswith";
  Operator3["GT"] = "gt";
  Operator3["GTE"] = "gte";
  Operator3["LT"] = "lt";
  Operator3["LTE"] = "lte";
  Operator3["IN"] = "in";
  Operator3["NOT"] = "not";
  return Operator3;
})(Operator2 || {});
var FilterValueType = /* @__PURE__ */ ((FilterValueType2) => {
  FilterValueType2["UUID"] = "uuid";
  FilterValueType2["STRING"] = "string";
  FilterValueType2["NUMBER"] = "number";
  FilterValueType2["BOOLEAN"] = "boolean";
  FilterValueType2["DATE"] = "date";
  FilterValueType2["ENUM"] = "enum";
  return FilterValueType2;
})(FilterValueType || {});

// src/Query/Validator/Registry.ts
var querySchemaRegistry = /* @__PURE__ */ new Map();
function buildRegistryKey(target, methodName) {
  return `${target.name}.${String(methodName)}`;
}
function registerQuerySchema(target, methodName, config) {
  const key = buildRegistryKey(target, methodName);
  querySchemaRegistry.set(key, { target, methodName, config });
}
function getQuerySchema(target, methodName) {
  const key = buildRegistryKey(target, methodName);
  return querySchemaRegistry.get(key);
}

// src/Query/Validator/QuerySchema.ts
function QuerySchema(config) {
  return (target, propertyKey, _descriptor) => {
    registerQuerySchema(
      target.constructor,
      propertyKey,
      config
    );
  };
}

// src/Query/Validator/SchemaBuilder.ts
import { z } from "zod";
function buildValueSchema(field, cfg) {
  switch (cfg.type) {
    case "uuid" /* UUID */:
      return z.uuid({
        message: `filter[${field}]: value must be a valid UUID`
      });
    case "number" /* NUMBER */:
      return z.string().regex(/^\d+(\.\d+)?$/, {
        message: `filter[${field}]: value must be numeric`
      }).transform(Number);
    case "boolean" /* BOOLEAN */:
      return z.enum(
        { true: "true", false: "false" },
        {
          error: () => `filter[${field}]: value must be "true" or "false"`
        }
      ).transform((v) => v === "true");
    case "date" /* DATE */:
      return z.coerce.date({
        error: `filter[${field}]: value must be an ISO 8601 date`
      });
    case "enum" /* ENUM */: {
      const values = cfg.enumValues ?? [];
      if (values.length === 0) {
        throw new Error(
          `QuerySchema: filter field "${field}" has type ENUM but no enumValues defined`
        );
      }
      const enumObj = Object.fromEntries(
        values.map((v) => [v, v])
      );
      return z.enum(enumObj, {
        error: () => `filter[${field}]: value must be one of: ${values.join(", ")}`
      });
    }
    case "string" /* STRING */:
    default:
      return z.string().min(1, {
        message: `filter[${field}]: value must not be empty`
      });
  }
}
function buildOperatorSchema(field, cfg) {
  const allowedOperators = cfg.operators ?? ["=" /* EQUALS */];
  const valueSchema = buildValueSchema(field, cfg);
  const operatorObj = Object.fromEntries(
    allowedOperators.map((op) => [op, op])
  );
  return z.tuple([
    z.enum(operatorObj, {
      error: () => `filter[${field}]: operator must be one of: ${allowedOperators.join(", ")}`
    }),
    valueSchema
  ]);
}
function buildZodSchema(config) {
  const shape = {};
  if (config.filters && Object.keys(config.filters).length > 0) {
    shape["filter"] = z.map(z.string(), z.tuple([z.string(), z.any()])).optional().superRefine((filterMap, ctx) => {
      if (!filterMap) return;
      for (const [field, tuple] of filterMap.entries()) {
        if (!config.filters[field]) {
          ctx.addIssue({
            code: "custom",
            message: `filter[${field}]: unsupported filter field`,
            path: [field]
          });
          continue;
        }
        const result = buildOperatorSchema(
          field,
          config.filters[field]
        ).safeParse(tuple);
        if (!result.success) {
          for (const issue of result.error.issues) {
            ctx.addIssue({
              ...issue,
              path: [field, ...issue.path ?? []]
            });
          }
        }
      }
    });
  }
  if (config.includes && config.includes.length > 0) {
    const includeObj = Object.fromEntries(
      config.includes.map((v) => [v, v])
    );
    shape["include"] = z.enum(includeObj, {
      error: (ctx) => `include: "${ctx.input}" is not a supported relation. Allowed: ${config.includes.join(", ")}`
    }).optional();
  }
  if (config.fields && Object.keys(config.fields).length > 0) {
    shape["fields"] = z.map(z.string(), z.array(z.string())).optional().superRefine((fieldsMap, ctx) => {
      if (!fieldsMap) return;
      for (const [alias, columns] of fieldsMap.entries()) {
        if (!config.includes?.includes(alias)) {
          ctx.addIssue({
            code: "custom",
            message: `fields[${alias}]: "${alias}" is not in the include list`,
            path: [alias]
          });
          continue;
        }
        const fieldsetCfg = config.fields[alias];
        if (!fieldsetCfg) {
          ctx.addIssue({
            code: "custom",
            message: `fields[${alias}]: no column config defined for this relation`,
            path: [alias]
          });
          continue;
        }
        for (const col of columns) {
          if (!fieldsetCfg.columns.includes(col)) {
            ctx.addIssue({
              code: "custom",
              message: `fields[${alias}]: column "${col}" is not allowed. Allowed: ${fieldsetCfg.columns.join(", ")}`,
              path: [alias, col]
            });
          }
        }
      }
    });
  }
  if (config.pagination !== false) {
    shape["page"] = z.map(z.string(), z.string()).optional().superRefine((pageMap, ctx) => {
      if (!pageMap) return;
      const allowed = ["number", "size"];
      for (const [key, val] of pageMap.entries()) {
        if (!allowed.includes(key)) {
          ctx.addIssue({
            code: "custom",
            message: `page[${key}]: unsupported page key. Allowed: ${allowed.join(", ")}`,
            path: [key]
          });
          continue;
        }
        if (!/^\d+$/.test(val) || Number(val) < 1) {
          ctx.addIssue({
            code: "custom",
            message: `page[${key}]: must be a positive integer`,
            path: [key]
          });
        }
      }
    });
  }
  if (config.sort && config.sort.length > 0) {
    const sortFieldSchema = z.string().optional().superRefine((val, ctx) => {
      const rawField = val.startsWith("-") ? val.slice(1) : val;
      if (rawField.length < 2) {
        ctx.addIssue({
          code: "custom",
          minimum: 2,
          type: "string",
          inclusive: true,
          message: `Field name '${rawField}' is too short. Minimum length is 3 characters.`
        });
        return;
      }
      if (rawField.length > 30) {
        ctx.addIssue({
          code: "custom",
          maximum: 30,
          type: "string",
          inclusive: true,
          message: `Field name '${rawField}' is too long. Maximum length is 30 characters.`
        });
        return;
      }
      if (!config.sort.includes(rawField)) {
        ctx.addIssue({
          code: "custom",
          message: `Invalid sort field ${rawField}. Allowed fields: ${config.sort.join(", ")}`
        });
      }
    }).transform((val) => {
      return val.startsWith("-") ? val.slice(1) : val;
    });
    shape["sort"] = z.array(sortFieldSchema).optional();
  }
  return z.object(shape);
}

// src/Query/Validator/QueryValidator.ts
var QueryValidationException = class extends Error {
  status = 400;
  details;
  constructor(details) {
    super("Invalid query parameters");
    this.name = "QueryValidationException";
    this.details = details;
  }
  toResponse() {
    return {
      code: 400,
      error: "Bad Request",
      message: this.message,
      errors: this.details
    };
  }
};
function validateQuery(controllerClass, methodName, query) {
  const schemaMeta = getQuerySchema(controllerClass, methodName);
  if (!schemaMeta) return;
  const zodSchema = buildZodSchema(schemaMeta.config);
  const toValidate = {};
  for (const [key, val] of query.entries()) {
    if (key === "user" || key === "route") continue;
    toValidate[key] = val;
  }
  const result = zodSchema.safeParse(toValidate);
  if (!result.success) {
    const errors = result.error.issues.map(
      (issue) => ({
        field: issue.path.join(".") || "query",
        message: issue.message
      })
    );
    throw new QueryValidationException(errors);
  }
}

// src/Http/index.ts
var HttpRequestEngine = class {
  constructor(container) {
    this.container = container;
  }
  container;
  initialized = false;
  globalMiddlewareTokens = [];
  routesRegistry = [];
  _adapter = null;
  registerMiddlewares(globalMiddleware) {
    if (this.initialized) return;
    this.globalMiddlewareTokens = globalMiddleware;
    this.initialized = true;
  }
  registerCommands(commands) {
    for (const command of commands) {
      this.container.transient(command.token, command.factory);
    }
    return this;
  }
  registerQueries(queries) {
    for (const query of queries) {
      this.container.transient(query.token, query.factory);
    }
    return this;
  }
  registerControllers(controllers) {
    for (const definition of controllers) {
      const metadata = controllerRegistry.get(definition.controllerClass);
      const routes = routeRegistry.get(
        definition.controllerClass
      );
      if (routes) {
        for (const route of routes) {
          const prefix = metadata.path.replace(/^\/|\/$/g, "");
          const path = route.path.replace(/^\/|\/$/g, "");
          this.routesRegistry.push({
            ...route,
            path: `/${[prefix, path].filter(Boolean).join("/")}`,
            controllerClass: definition.controllerClass,
            controllerToken: definition.token
          });
        }
      }
      if (definition.factory) {
        this.container.transient(definition.token, definition.factory);
      }
    }
    return this;
  }
  async provide(token) {
    return this.container.resolve(token);
  }
  async onHandleApiRequest(nativeReq, _nativeRes) {
    const adapter = await this.resolveAdapter();
    const req = await adapter.parseRequest(nativeReq);
    try {
      const route = this.matchRoute(req);
      if (!route) throw new ApiException("Route not found.");
      req.params = this.extractParams(route.path, req.url);
      const args = await this.resolveMethodArguments(req, route);
      return await this.executePipeline(nativeReq, req, route, args);
    } catch (error) {
      console.log("[nextforge HttpRequestEngine]", error);
      return adapter.sendResponse(
        nativeReq,
        this.handleException(error, req)
      );
    }
  }
  async onHandleRequest(nativeReq, nativeRes) {
    const adapter = await this.resolveAdapter();
    const req = await adapter.parseRequest(nativeReq);
    const permissionService = await this.container.resolve(
      CORE_DI_SYMBOLS.IPermissionService
    );
    if (permissionService.getPermissions().isNotProtectedUrl({ method: req.method, url: req.url })) {
      return adapter.sendNextResponse(nativeRes, {
        status: 200,
        headers: { ...nativeReq.headers }
      });
    }
    try {
      const response = await this.executePipeline(nativeReq, req);
      if (response?.isLeft?.()) {
        const data = response.getLeft();
        return adapter.sendNextResponseRedirect(
          this.buildRedirectUrl(400, data.message, req)
        );
      }
      return response;
    } catch (error) {
      const { body } = this.handleException(error, req);
      return adapter.sendNextResponseRedirect(
        this.buildRedirectUrl(body.code, body.message, req)
      );
    }
  }
  async resolveAdapter() {
    if (!this._adapter) {
      this._adapter = await this.container.resolve(
        CORE_DI_SYMBOLS.HttpAdapter
      );
    }
    return this._adapter;
  }
  matchRoute(req) {
    const rawUrl = req.url.split("?")[0];
    return this.routesRegistry.find((route) => {
      if (route.requestMethod !== req.method) return false;
      const pattern = route.path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/:([a-zA-Z_][a-zA-Z0-9_]*)/g, "([^/]+)");
      return new RegExp(`^${pattern}$`).test(rawUrl);
    });
  }
  extractParams(routePath, incomingUrl) {
    const paramNames = [];
    const nameMatcher = /:([a-zA-Z0-9_]+)/g;
    let m;
    while ((m = nameMatcher.exec(routePath)) !== null) {
      paramNames.push(m[1]);
    }
    const pattern = routePath.replace(/\//g, "\\/").replace(/:[a-zA-Z0-9_]+/g, "([^\\/]+)");
    const values = new RegExp(`^${pattern}$`).exec(incomingUrl);
    if (!values) return {};
    return Object.fromEntries(
      paramNames.map((name, i) => [name, values[i + 1]])
    );
  }
  async resolveMethodArguments(req, route) {
    const allParams = parameterRegistry.get(route.controllerClass.prototype) ?? [];
    const params = allParams.filter(
      (p) => p.methodName === route.methodName
    );
    const args = [];
    for (const param of params) {
      args[param.index] = this.resolveArg(param, req);
    }
    return args;
  }
  resolveArg(param, req) {
    switch (param.type) {
      case "PARAM": {
        const value = param.name ? req.params[param.name] : req.params;
        if (param.dto && value) {
          param.dto.validate({ [param.name]: value });
        }
        return value;
      }
      case "QUERY":
        return param.name ? req.query[param.name] : req.query;
      case "HEADER":
        return param.name ? req.headers[param.name.toLowerCase()] : req.headers;
      case "BODY": {
        if (param.name && typeof param.name === "function") {
          return param.name.validate(req.body);
        }
        return req.body;
      }
      case "FILES":
      case "CUSTOM":
        return param.factory ? param.factory(req) : void 0;
      default:
        return void 0;
    }
  }
  async runMiddlewares(nativeReq, req) {
    for (const meta of this.globalMiddlewareTokens) {
      const middleware = await this.container.resolve(
        meta.token
      );
      const response = await middleware.use(req);
      if (!response) continue;
      if (response.isLeft()) {
        throw new ApiException(
          response.getLeft().message
        );
      }
    }
  }
  async buildGetParameters(req, route) {
    const authService = await this.container.resolve(
      CORE_DI_SYMBOLS.IAuthenticationService
    );
    const user = await authService.getUser();
    const query = req.query ? QueryParser.parse(req.query) : /* @__PURE__ */ new Map();
    if (!query.has("sort")) query.set("sort", ["-created_at"]);
    if (!query.has("route"))
      query.set("route", {
        name: route.methodName,
        path: req.url,
        parameter: req.params
      });
    validateQuery(route.controllerClass, route.methodName, query);
    query.set("user", user);
    query.set(
      "route",
      /* @__PURE__ */ new Map([
        ["name", route.methodName],
        ["path", route.path],
        ["parameters", req.query]
      ])
    );
    return new QueryParameters().parse(query);
  }
  async executePipeline(nativeReq, req, route, methodArgs = []) {
    const adapter = await this.resolveAdapter();
    await this.runMiddlewares(nativeReq, req);
    if (!route) {
      return adapter.sendNextResponse(nativeReq, {
        status: 200,
        headers: { ...nativeReq.headers }
      });
    }
    if (route.requestMethod === "GET") {
      methodArgs.push(await this.buildGetParameters(req, route));
    }
    const controller = await this.container.resolve(
      route.controllerToken ?? route.controllerClass
    );
    const response = await controller[route.methodName](...methodArgs);
    return this.mapResponseToHttp(nativeReq, adapter, response);
  }
  mapResponseToHttp(nativeReq, adapter, response) {
    if (response.isRight()) {
      return adapter.sendResponse(nativeReq, {
        status: 200,
        headers: { ...nativeReq.headers },
        body: response.getRight()
      });
    }
    const data = response.getLeft();
    const body = {};
    let code = 400;
    switch (data.kind) {
      case "NoRecordFoundError":
        code = 200;
        body.data = [];
        body.message = data.message;
        break;
      case "ValidationError":
        code = 422;
        body.message = data.message;
        body.errors = data.errors;
        break;
      default:
        body.message = data.message;
        if (data.kind === "UnexpectedError") {
          console.log("[nextforge Query Error]", data.error);
        }
    }
    body.code = code;
    return adapter.sendResponse(nativeReq, {
      status: code,
      headers: { "Content-Type": "application/json" },
      body
    });
  }
  buildRedirectUrl(code, message, req) {
    const host = req.headers["host"] || "localhost:3000";
    const protocol = host.startsWith("localhost") ? "http://" : "https://";
    const url = new URL("/error", `${protocol}${host}`);
    url.searchParams.set("code", code.toString());
    url.searchParams.set("message", message);
    return url;
  }
  handleException(error, _req) {
    if (error instanceof QueryValidationException) {
      return {
        status: 422,
        headers: { "Content-Type": "application/json" },
        body: error.toResponse()
      };
    }
    if (error instanceof ValidationException) {
      return {
        status: 422,
        headers: { "Content-Type": "application/json" },
        body: {
          message: error.getMessage(),
          code: 422,
          errors: error.getErrors()
        }
      };
    }
    if (error instanceof ApiException) {
      return {
        status: error.getCode(),
        headers: { "Content-Type": "application/json" },
        body: { message: error.getMessage(), code: error.getCode() }
      };
    }
    if (error instanceof SessionExpiredException) {
      return {
        status: 401,
        headers: { "Content-Type": "application/json" },
        body: { message: error.message, code: 401 }
      };
    }
    if (error instanceof UnAuthorizedException) {
      return {
        status: 403,
        headers: { "Content-Type": "application/json" },
        body: { message: error.message, code: 403 }
      };
    }
    if (error?.message === "ForbiddenExceptionTriggered") {
      return {
        status: 403,
        headers: { "Content-Type": "application/json" },
        body: { message: "Forbidden access denied", code: 403 }
      };
    }
    return {
      status: 500,
      headers: { "Content-Type": "application/json" },
      body: {
        message: error?.message ?? "Internal Server Error",
        code: 500
      }
    };
  }
};

// src/Domains/Users/index.ts
var Users_exports = {};

// src/Domains/Roles/index.ts
var Roles_exports = {};

// src/Domains/Permissions/index.ts
var Permissions_exports = {};
export {
  AnyValueObject,
  ApiException,
  BadRequestException,
  BaseDto,
  Body,
  CORE_DI_SYMBOLS,
  CommandHandlers,
  DataError as ConcreteDataError,
  Container,
  Controller,
  Delete,
  Either,
  EitherAsync,
  Entity,
  EnumValueObject,
  Files,
  FilterValueType,
  Get,
  HTTP_STATUS,
  Header,
  HttpRequestEngine,
  Identifier,
  InMemoryCommandBus,
  InMemoryQueryBus,
  InputParseError,
  InvalidArgumentError,
  Links,
  Meta,
  Module,
  Operator2 as Operator,
  PASSWORD_MIN_LENGTH,
  PASSWORD_PATTERN,
  PASSWORD_REQUIREMENTS_MESSAGE,
  PaginatedResourceResponse,
  Param,
  Parameters,
  Permissions_exports as Permissions,
  Post,
  Put,
  Query,
  QueryHandlers,
  QueryParameters,
  QueryParser,
  QuerySchema,
  QueryValidationException,
  Roles_exports as Roles,
  SessionExpiredException,
  StringValueObject,
  TokenExpiredException,
  UnAuthorizedException,
  UniqueEntityID,
  UseCaseError,
  UserParameter,
  Users_exports as Users,
  ValidationException,
  ValueObject,
  buildRegistryKey,
  createToken,
  generateSecurePassword,
  getQuerySchema,
  moduleRegistry,
  querySchemaRegistry,
  registerQuerySchema,
  validateQuery
};
//# sourceMappingURL=index.js.map