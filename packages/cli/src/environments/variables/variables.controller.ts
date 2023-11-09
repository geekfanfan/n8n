import express from 'express';
import { Container } from 'typedi';

import * as ResponseHelper from '@/ResponseHelper';
import { AuthError, BadRequestError, NotFoundError } from '@/ResponseErrors';
import type { VariablesRequest } from '@/requests';
import { VariablesService } from './variables.service';
import { EEVariablesController } from './variables.controller.ee';
import { Logger } from '@/Logger';

export const variablesController = express.Router();

variablesController.use('/', EEVariablesController);
variablesController.use(EEVariablesController);

variablesController.get(
	'/',
	ResponseHelper.send(async () => {
		return Container.get(VariablesService).getAllCached();
	}),
);

variablesController.post(
	'/',
	ResponseHelper.send(async () => {
		throw new BadRequestError('No variables license found');
	}),
);

variablesController.get(
	'/:id(\\w+)',
	ResponseHelper.send(async (req: VariablesRequest.Get) => {
		const id = req.params.id;
		const variable = await Container.get(VariablesService).getCached(id);
		if (variable === null) {
			throw new NotFoundError(`Variable with id ${req.params.id} not found`);
		}
		return variable;
	}),
);

variablesController.patch(
	'/:id(\\w+)',
	ResponseHelper.send(async () => {
		throw new BadRequestError('No variables license found');
	}),
);

variablesController.delete(
	'/:id(\\w+)',
	ResponseHelper.send(async (req: VariablesRequest.Delete) => {
		const id = req.params.id;
		if (req.user.globalRole.name !== 'owner') {
			Container.get(Logger).info(
				'Attempt to delete a variable blocked due to lack of permissions',
				{
					id,
					userId: req.user.id,
				},
			);
			throw new AuthError('Unauthorized');
		}
		await Container.get(VariablesService).delete(id);

		return true;
	}),
);
