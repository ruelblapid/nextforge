import { createToken } from './createToken';
import { HttpAdapter } from '../Http/HttpAdapter';
import { IAuthenticationService, IPermissionService } from '../Auth';

export const CORE_DI_SYMBOLS = {
	HttpAdapter: createToken<HttpAdapter>('HttpAdapter'),
	IPermissionService: createToken<IPermissionService>('IPermissionService'),
	IAuthenticationService: createToken<IAuthenticationService>(
		'IAuthenticationService'
	),
};
