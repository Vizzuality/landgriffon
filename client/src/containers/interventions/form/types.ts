import type * as yup from 'yup';
import type schemaValidation from './schema-validation';

export type SubSchema = yup.InferType<typeof schemaValidation>;
