import { IsEnum } from 'class-validator';

export const IsQueryBool = () =>
  IsEnum([0, 1], {
    message: ({ property }) => `Allowed values for ${property} are 0 (false) and 1 (true)`,
  });
