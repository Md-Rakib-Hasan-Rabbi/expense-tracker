const { z } = require('zod');

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const objectIdSchema = z.string().regex(objectIdRegex, 'Invalid ID format');

module.exports = {
  z,
  objectIdSchema,
};
