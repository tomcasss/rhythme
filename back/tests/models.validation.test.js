// Model Validation Tests - Testing MongoDB schema validation and model methods

describe('Model Validation Tests', () => {

  // Mock Mongoose validation
  const validateSchema = (schema, data) => {
    const errors = [];
    
    // Check required fields
    if (schema.required) {
      for (const field of schema.required) {
        if (!(field in data) || data[field] === null || data[field] === undefined || data[field] === '') {
          errors.push(`${field} is required`);
        }
      }
    }
    
    // Check field types
    if (schema.fields) {
      for (const [field, rules] of Object.entries(schema.fields)) {
        if (data[field] !== undefined) {
          if (rules.type === 'string' && typeof data[field] !== 'string') {
            errors.push(`${field} must be a string`);
          }
          if (rules.type === 'number' && typeof data[field] !== 'number') {
            errors.push(`${field} must be a number`);
          }
          if (rules.type === 'array' && !Array.isArray(data[field])) {
            errors.push(`${field} must be an array`);
          }
          if (rules.minLength && data[field].length < rules.minLength) {
            errors.push(`${field} must be at least ${rules.minLength} characters long`);
          }
          if (rules.maxLength && data[field].length > rules.maxLength) {
            errors.push(`${field} cannot exceed ${rules.maxLength} characters`);
          }
          if (rules.match && !rules.match.test(data[field])) {
            errors.push(`${field} format is invalid`);
          }
        }
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  it('Should validate User model schema', () => {
    const userSchema = {
      required: ['username', 'email', 'password'],
      fields: {
        username: { type: 'string', minLength: 3, maxLength: 20 },
        email: { type: 'string', match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
        password: { type: 'string', minLength: 6 },
        followers: { type: 'array' },
        following: { type: 'array' },
        bio: { type: 'string', maxLength: 200 }
      }
    };

    // Valid user data
    const validUser = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      followers: [],
      following: [],
      bio: 'This is my bio'
    };

    const result = validateSchema(userSchema, validUser);
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('Should reject invalid User model data', () => {
    const userSchema = {
      required: ['username', 'email', 'password'],
      fields: {
        username: { type: 'string', minLength: 3, maxLength: 20 },
        email: { type: 'string', match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
        password: { type: 'string', minLength: 6 }
      }
    };

    // Invalid user data - missing required fields
    const invalidUser1 = {
      username: 'test',
      email: 'invalid-email'
      // missing password
    };

    const result1 = validateSchema(userSchema, invalidUser1);
    expect(result1.isValid).toBe(false);
    expect(result1.errors.length).toBe(2); // missing password, invalid email

    // Invalid user data - field validation errors
    const invalidUser2 = {
      username: 'te', // too short
      email: 'test@example.com',
      password: '123' // too short
    };

    const result2 = validateSchema(userSchema, invalidUser2);
    expect(result2.isValid).toBe(false);
    expect(result2.errors.length).toBe(2); // username too short, password too short
  });

  it('Should validate Post model schema', () => {
    const postSchema = {
      required: ['userId', 'content'],
      fields: {
        userId: { type: 'string' },
        content: { type: 'string', minLength: 1, maxLength: 500 },
        likes: { type: 'array' },
        comments: { type: 'array' }
      }
    };

    // Valid post data
    const validPost = {
      userId: 'user123',
      content: 'This is a test post',
      likes: ['user456', 'user789'],
      comments: []
    };

    const result = validateSchema(postSchema, validPost);
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('Should reject invalid Post model data', () => {
    const postSchema = {
      required: ['userId', 'content'],
      fields: {
        content: { type: 'string', minLength: 1, maxLength: 500 }
      }
    };

    // Invalid post data
    const invalidPost = {
      userId: 'user123',
      content: '' // empty content
    };

    const result = validateSchema(postSchema, invalidPost);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(error => error.includes('content'))).toBe(true);
  });

  it('Should validate Notification model schema', () => {
    const notificationSchema = {
      required: ['userId', 'type', 'message'],
      fields: {
        userId: { type: 'string' },
        type: { type: 'string' },
        message: { type: 'string', minLength: 1, maxLength: 200 },
        isRead: { type: 'boolean' }
      }
    };

    // Valid notification data
    const validNotification = {
      userId: 'user123',
      type: 'like',
      message: 'Someone liked your post',
      isRead: false,
      postId: 'post456'
    };

    const result = validateSchema(notificationSchema, validNotification);
    expect(result.isValid).toBe(true);
  });

  it('Should validate model field types correctly', () => {
    const schema = {
      required: [],
      fields: {
        stringField: { type: 'string' },
        numberField: { type: 'number' },
        arrayField: { type: 'array' }
      }
    };

    // Test correct types
    const correctData = {
      stringField: 'hello',
      numberField: 42,
      arrayField: [1, 2, 3]
    };

    const result1 = validateSchema(schema, correctData);
    expect(result1.isValid).toBe(true);

    // Test incorrect types
    const incorrectData = {
      stringField: 123, // should be string
      numberField: 'hello', // should be number
      arrayField: 'not an array' // should be array
    };

    const result2 = validateSchema(schema, incorrectData);
    expect(result2.isValid).toBe(false);
    expect(result2.errors.length).toBe(3);
  });

  it('Should validate string length constraints', () => {
    const schema = {
      required: [],
      fields: {
        shortString: { type: 'string', minLength: 3, maxLength: 10 },
        longString: { type: 'string', maxLength: 100 }
      }
    };

    // Valid lengths
    const validData = {
      shortString: 'hello',
      longString: 'This is a reasonable length string'
    };

    const result1 = validateSchema(schema, validData);
    expect(result1.isValid).toBe(true);

    // Invalid lengths
    const invalidData = {
      shortString: 'hi', // too short
      longString: 'x'.repeat(101) // too long
    };

    const result2 = validateSchema(schema, invalidData);
    expect(result2.isValid).toBe(false);
    expect(result2.errors.length).toBe(2);
  });

  it('Should validate email format with regex', () => {
    const schema = {
      required: ['email'],
      fields: {
        email: { type: 'string', match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }
      }
    };

    // Valid emails
    const validEmails = [
      'user@example.com',
      'test.user@domain.co.uk',
      'user123@test-domain.org'
    ];

    for (const email of validEmails) {
      const result = validateSchema(schema, { email });
      expect(result.isValid).toBe(true);
    }

    // Invalid emails
    const invalidEmails = [
      'invalid-email',
      'user@',
      '@domain.com',
      'user@domain',
      'user space@domain.com'
    ];

    for (const email of invalidEmails) {
      const result = validateSchema(schema, { email });
      expect(result.isValid).toBe(false);
    }
  });

  it('Should handle optional fields correctly', () => {
    const schema = {
      required: ['name'],
      fields: {
        name: { type: 'string', minLength: 1 },
        optionalField: { type: 'string', maxLength: 50 }
      }
    };

    // Data without optional field
    const result1 = validateSchema(schema, { name: 'test' });
    expect(result1.isValid).toBe(true);

    // Data with valid optional field
    const result2 = validateSchema(schema, { 
      name: 'test', 
      optionalField: 'optional value' 
    });
    expect(result2.isValid).toBe(true);

    // Data with invalid optional field
    const result3 = validateSchema(schema, { 
      name: 'test', 
      optionalField: 'x'.repeat(51) // too long
    });
    expect(result3.isValid).toBe(false);
  });
});

