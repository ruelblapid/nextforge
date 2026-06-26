# nextforge

Reusable CQRS / DI / DDD-lite core for Next.js apps, extracted from `asset-scan`'s `src/Shared`.

Provides:
- **CQRS bus** — `ICommand`/`ICommandHandler`/`ICommandBus`, `IQuery`/`IQueryHandler`/`IQueryBus`, in-memory implementations
- **DI container** — `Container`, `createToken`, module/provider/controller registration
- **Decorator-based routing** — `@Controller`, `@Get`/`@Post`/`@Put`/`@Delete`, `@Param`/`@Query`/`@Body`/`@Header`/`@Files`, `@Module`
- **HTTP engine** — `HttpRequestEngine` (transport-agnostic core, with a couple of Next.js-flavored adapter hooks)
- **Query/filter engine** — `QueryParameters`, `QueryParser`, filter/sort/paging/fieldset parameters, Zod-backed `@QuerySchema` validation
- **Either-based error handling** — `Either`, `EitherAsync`, `UseCaseError`
- **Value objects** — `Entity`, `Identifier`, `UniqueEntityID`, `ValueObject`, `EnumValueObject`, `StringValueObject`
- **HTTP exceptions** — `ApiException`, `BadRequestException`, `UnAuthorizedException`, `SessionExpiredException`, `ValidationException`, `TokenExpiredException`
- **Optional Users/Roles/Permissions contracts** under `Users`/`Roles`/`Permissions` namespaces — trimmed of any app-specific fields (no `client_id`, no Supabase-specific shape). Implement these against whatever ORM/auth provider the project uses.

## What's deliberately NOT here

- Any concrete ORM/database implementation (Prisma, Drizzle, etc.) — `IRepository`/`IDatabase` are interfaces only, by design, so this library never locks a consumer into one ORM.
- App-specific config (env var names, branding, page-permission catalogs) — write your own per-project `IConfigurationProvider` against the typed shapes in `Configuration/`.
- The Next.js page/layout auth-guard pattern (`enforcePortalAccess`-style code) — that's app glue, not a library concern.

## Usage

```ts
import { Container, createToken, InMemoryCommandBus, CommandHandlers } from 'nextforge';
```

## Scripts

- `npm run build` — bundle to `dist/` (ESM + CJS + `.d.ts`) via tsup
- `npm run test` — run the vitest suite
- `npm run typecheck` — `tsc --noEmit`
- `npm run lint` — eslint over `src/`
