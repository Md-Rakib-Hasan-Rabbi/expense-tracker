const { z } = require('zod');

const objectIdRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const objectIdSchema = z.string().regex(objectIdRegex, 'Invalid ID format');

module.exports = {
  z,
  objectIdSchema,
};
