import { Container, Service } from 'typedi';

import * as ResponseHelper from '@/ResponseHelper';
import { VariablesRequest } from '@/requests';
import { Authorized, Delete, Get, Licensed, Patch, Post, RestController } from '@/decorators';
import {
	VariablesService,
	VariablesLicenseError,
	VariablesValidationError,
} from './variables.service.ee';
import { RequireGlobalScope } from '@/decorators/Scopes';

@Service()
@Authorized()
@RestController('/variables')
export class VariablesController {
	constructor(private variablesService: VariablesService) {}

	@Get('/')
	@RequireGlobalScope('variable:list')
	async getVariables() {
		return Container.get(VariablesService).getAllCached();
	}

	@Post('/')
	@Licensed('feat:variables')
	@RequireGlobalScope('variable:create')
	async createVariable(req: VariablesRequest.Create) {
		const variable = req.body;
		delete variable.id;
		try {
			return await Container.get(VariablesService).create(variable);
		} catch (error) {
			if (error instanceof VariablesLicenseError) {
				throw new ResponseHelper.BadRequestError(error.message);
			} else if (error instanceof VariablesValidationError) {
				throw new ResponseHelper.BadRequestError(error.message);
			}
			throw error;
		}
	}

	@Get('/:id(\\w+)')
	@RequireGlobalScope('variable:read')
	async getVariable(req: VariablesRequest.Get) {
		const id = req.params.id;
		const variable = await Container.get(VariablesService).getCached(id);
		if (variable === null) {
			throw new ResponseHelper.NotFoundError(`Variable with id ${req.params.id} not found`);
		}
		return variable;
	}

	@Patch('/:id(\\w+)')
	@Licensed('feat:variables')
	@RequireGlobalScope('variable:update')
	async updateVariable(req: VariablesRequest.Update) {
		const id = req.params.id;
		const variable = req.body;
		delete variable.id;
		try {
			return await Container.get(VariablesService).update(id, variable);
		} catch (error) {
			if (error instanceof VariablesLicenseError) {
				throw new ResponseHelper.BadRequestError(error.message);
			} else if (error instanceof VariablesValidationError) {
				throw new ResponseHelper.BadRequestError(error.message);
			}
			throw error;
		}
	}

	@Delete('/:id(\\w+)')
	@RequireGlobalScope('variable:delete')
	async deleteVariable(req: VariablesRequest.Delete) {
		const id = req.params.id;
		await Container.get(VariablesService).delete(id);

		return true;
	}
}
