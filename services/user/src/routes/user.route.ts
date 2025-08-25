import { Router } from 'express';
import { UserController } from '../controller/user.controller';
import { validate } from '@/middleware/validation';
import { apiRateLimit } from '@/middleware/security';
import { env } from '@/config/env';
import {
  CreateUserSchema,
  UpdateUserSchema,
  UserParamsSchema,
  UserQuerySchema,
} from '../validation/user.validation';

const router = Router();
const userController = new UserController();

if (env.RATE_LIMIT_ENABLED) {
  router.use(apiRateLimit);
}

router.get(
  '/',
  validate({ query: UserQuerySchema }),
  userController.getUsers
);

router.get(
  '/search',
  validate({ query: UserQuerySchema }),
  userController.searchUsers
);

router.get(
  '/:id',
  validate({ params: UserParamsSchema }),
  userController.getUserById
);

router.post(
  '/',
  validate({ body: CreateUserSchema }),
  userController.createUser
);

router.put(
  '/:id',
  validate({ 
    params: UserParamsSchema, 
    body: UpdateUserSchema 
  }),
  userController.updateUser
);

router.patch(
  '/:id/activate',
  validate({ params: UserParamsSchema }),
  userController.activateUser
);

router.patch(
  '/:id/deactivate',
  validate({ params: UserParamsSchema }),
  userController.deactivateUser
);

router.delete(
  '/:id',
  validate({ params: UserParamsSchema }),
  userController.deleteUser
);

export default router;