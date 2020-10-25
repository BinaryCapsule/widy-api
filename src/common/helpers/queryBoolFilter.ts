import { Any } from 'typeorm';

export const queryBoolFilter = value => (value !== undefined ? Boolean(value) : Any([true, false]));
