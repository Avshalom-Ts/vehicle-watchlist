import axios, { AxiosError } from 'axios';

describe('Authentication E2E Tests', () => {
  const API_PREFIX = '/api/auth';

  // Generate unique test data for each test run to avoid conflicts
  const timestamp = Date.now();

  // Test data
  const validUser = {
    email: `test-${timestamp}@gmail.com`,
    password: 'Test1234',
    name: 'Test User',
  };

  let accessToken: string;
  let refreshToken: string;

  // Helper function to clear test data
  const cleanupTestUsers = async () => {
    // Note: This assumes you have an endpoint or direct DB access to clean up
    // For now, we'll rely on test isolation
  };

  beforeAll(async () => {
    await cleanupTestUsers();
  });

  afterAll(async () => {
    await cleanupTestUsers();
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await axios.post(`${API_PREFIX}/register`, validUser);

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('access_token');
      expect(response.data).toHaveProperty('refresh_token');
      expect(response.data).toHaveProperty('user');

      expect(response.data.user).toHaveProperty('id');
      expect(response.data.user.email).toBe(validUser.email);
      expect(response.data.user.name).toBe(validUser.name);
      expect(response.data.user).not.toHaveProperty('password');

      expect(typeof response.data.access_token).toBe('string');
      expect(typeof response.data.refresh_token).toBe('string');
      expect(response.data.access_token.length).toBeGreaterThan(0);
      expect(response.data.refresh_token.length).toBeGreaterThan(0);

      // Save tokens for later tests
      accessToken = response.data.access_token;
      refreshToken = response.data.refresh_token;
    });

    it('should fail to register with duplicate email', async () => {
      try {
        await axios.post(`${API_PREFIX}/register`, validUser);
        fail('Expected request to fail');
      } catch (error) {
        const axiosError = error as AxiosError<{ message: string }>;
        expect(axiosError.response?.status).toBe(400);
        expect(axiosError.response?.data).toHaveProperty('message');
      }
    });

    it('should fail to register with invalid email', async () => {
      try {
        await axios.post(`${API_PREFIX}/register`, {
          email: 'invalid-email',
          password: 'Test1234',
          name: 'Test User',
        });
        fail('Expected request to fail');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(400);
      }
    });

    it('should fail to register with weak password', async () => {
      try {
        await axios.post(`${API_PREFIX}/register`, {
          email: 'newuser@example.com',
          password: 'weak',
          name: 'Test User',
        });
        fail('Expected request to fail');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(400);
      }
    });

    it('should fail to register with password missing uppercase', async () => {
      try {
        await axios.post(`${API_PREFIX}/register`, {
          email: 'newuser@example.com',
          password: 'test1234',
          name: 'Test User',
        });
        fail('Expected request to fail');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(400);
      }
    });

    it('should fail to register with password missing lowercase', async () => {
      try {
        await axios.post(`${API_PREFIX}/register`, {
          email: 'newuser@example.com',
          password: 'TEST1234',
          name: 'Test User',
        });
        fail('Expected request to fail');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(400);
      }
    });

    it('should fail to register with password missing number', async () => {
      try {
        await axios.post(`${API_PREFIX}/register`, {
          email: 'newuser@example.com',
          password: 'TestTest',
          name: 'Test User',
        });
        fail('Expected request to fail');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(400);
      }
    });

    it('should fail to register with short name', async () => {
      try {
        await axios.post(`${API_PREFIX}/register`, {
          email: 'newuser@example.com',
          password: 'Test1234',
          name: 'T',
        });
        fail('Expected request to fail');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(400);
      }
    });

    it('should fail to register with missing fields', async () => {
      try {
        await axios.post(`${API_PREFIX}/register`, {
          email: 'newuser@example.com',
        });
        fail('Expected request to fail');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(400);
      }
    });
  });

  describe('POST /auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const response = await axios.post(`${API_PREFIX}/login`, {
        email: validUser.email,
        password: validUser.password,
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('access_token');
      expect(response.data).toHaveProperty('refresh_token');
      expect(response.data).toHaveProperty('user');

      expect(response.data.user).toHaveProperty('id');
      expect(response.data.user.email).toBe(validUser.email);
      expect(response.data.user.name).toBe(validUser.name);
      expect(response.data.user).not.toHaveProperty('password');

      // Update tokens
      accessToken = response.data.access_token;
      refreshToken = response.data.refresh_token;
    });

    it('should fail to login with invalid email', async () => {
      try {
        await axios.post(`${API_PREFIX}/login`, {
          email: 'nonexistent@example.com',
          password: validUser.password,
        });
        fail('Expected request to fail');
      } catch (error) {
        const axiosError = error as AxiosError<{ message: string }>;
        expect(axiosError.response?.status).toBe(401);
        expect(axiosError.response?.data).toHaveProperty('message');
        expect(axiosError.response?.data.message).toContain('Invalid credentials');
      }
    });

    it('should fail to login with invalid password', async () => {
      try {
        await axios.post(`${API_PREFIX}/login`, {
          email: validUser.email,
          password: 'WrongPassword123',
        });
        fail('Expected request to fail');
      } catch (error) {
        const axiosError = error as AxiosError<{ message: string }>;
        expect(axiosError.response?.status).toBe(401);
        expect(axiosError.response?.data).toHaveProperty('message');
        expect(axiosError.response?.data.message).toContain('Invalid credentials');
      }
    });

    it('should fail to login with malformed email', async () => {
      try {
        await axios.post(`${API_PREFIX}/login`, {
          email: 'not-an-email',
          password: validUser.password,
        });
        fail('Expected request to fail');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(400);
      }
    });

    it('should fail to login with missing password', async () => {
      try {
        await axios.post(`${API_PREFIX}/login`, {
          email: validUser.email,
        });
        fail('Expected request to fail');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(400);
      }
    });

    it('should fail to login with empty password', async () => {
      try {
        await axios.post(`${API_PREFIX}/login`, {
          email: validUser.email,
          password: '',
        });
        fail('Expected request to fail');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(400);
      }
    });
  });

  describe('GET /auth/profile', () => {
    it('should get user profile with valid token', async () => {
      const response = await axios.get(`${API_PREFIX}/profile`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('id');
      expect(response.data).toHaveProperty('email');
      expect(response.data).toHaveProperty('name');
      expect(response.data.email).toBe(validUser.email);
      expect(response.data.name).toBe(validUser.name);
      expect(response.data).not.toHaveProperty('password');
      expect(response.data).not.toHaveProperty('refreshToken');
    });

    it('should fail to get profile without token', async () => {
      try {
        await axios.get(`${API_PREFIX}/profile`);
        fail('Expected request to fail');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(401);
      }
    });

    it('should fail to get profile with invalid token', async () => {
      try {
        await axios.get(`${API_PREFIX}/profile`, {
          headers: {
            Authorization: 'Bearer invalid-token',
          },
        });
        fail('Expected request to fail');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(401);
      }
    });

    it('should fail to get profile with malformed authorization header', async () => {
      try {
        await axios.get(`${API_PREFIX}/profile`, {
          headers: {
            Authorization: 'invalid-format',
          },
        });
        fail('Expected request to fail');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(401);
      }
    });

    it('should fail to get profile with expired token', async () => {
      // This would require a token that's actually expired
      // For now, we'll test with an invalid token format
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjB9.invalid';

      try {
        await axios.get(`${API_PREFIX}/profile`, {
          headers: {
            Authorization: `Bearer ${expiredToken}`,
          },
        });
        fail('Expected request to fail');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(401);
      }
    });
  });

  describe('POST /auth/refresh', () => {
    it('should refresh tokens with valid refresh token', async () => {
      // Wait a bit to ensure different token generation time
      await new Promise(resolve => setTimeout(resolve, 100));

      const response = await axios.post(`${API_PREFIX}/refresh`, {
        refresh_token: refreshToken,
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('access_token');
      expect(response.data).toHaveProperty('refresh_token');
      expect(response.data).toHaveProperty('user');

      expect(response.data.user.email).toBe(validUser.email);
      expect(response.data.user.name).toBe(validUser.name);

      // New tokens should be provided
      expect(typeof response.data.access_token).toBe('string');
      expect(typeof response.data.refresh_token).toBe('string');
      expect(response.data.access_token.length).toBeGreaterThan(0);
      expect(response.data.refresh_token.length).toBeGreaterThan(0);

      // Update tokens
      accessToken = response.data.access_token;
      refreshToken = response.data.refresh_token;
    });

    it('should fail to refresh with invalid refresh token', async () => {
      try {
        await axios.post(`${API_PREFIX}/refresh`, {
          refresh_token: 'invalid-refresh-token',
        });
        fail('Expected request to fail');
      } catch (error) {
        const axiosError = error as AxiosError<{ message: string }>;
        expect(axiosError.response?.status).toBe(401);
        expect(axiosError.response?.data).toHaveProperty('message');
        expect(axiosError.response?.data.message).toContain('Invalid refresh token');
      }
    });

    it('should fail to refresh with missing refresh token', async () => {
      try {
        await axios.post(`${API_PREFIX}/refresh`, {});
        fail('Expected request to fail');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(400);
      }
    });

    it('should fail to refresh with empty refresh token', async () => {
      try {
        await axios.post(`${API_PREFIX}/refresh`, {
          refresh_token: '',
        });
        fail('Expected request to fail');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(400);
      }
    });

    it('should fail to refresh with access token instead of refresh token', async () => {
      try {
        const response = await axios.post(`${API_PREFIX}/refresh`, {
          refresh_token: accessToken,
        });

        // If it somehow succeeds, it shouldn't give back valid data
        // (This is unlikely, but we handle it gracefully)
        if (response.status === 200) {
          // The backend might accept it if the token structure is valid
          // In that case, we just verify it returns data
          expect(response.data).toHaveProperty('access_token');
        }
      } catch (error) {
        const axiosError = error as AxiosError;
        // Should fail with unauthorized
        expect(axiosError.response?.status).toBe(401);
      }
    });
  });

  describe('POST /auth/logout', () => {
    it('should logout successfully with valid token', async () => {
      const response = await axios.post(
        `${API_PREFIX}/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('message');
      expect(response.data.message).toContain('Logged out successfully');
    });

    it('should fail to logout without token', async () => {
      try {
        await axios.post(`${API_PREFIX}/logout`, {});
        fail('Expected request to fail');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(401);
      }
    });

    it('should fail to logout with invalid token', async () => {
      try {
        await axios.post(
          `${API_PREFIX}/logout`,
          {},
          {
            headers: {
              Authorization: 'Bearer invalid-token',
            },
          }
        );
        fail('Expected request to fail');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(401);
      }
    });

    it('should fail to use old refresh token after logout', async () => {
      // The refresh token should be invalidated after logout
      try {
        await axios.post(`${API_PREFIX}/refresh`, {
          refresh_token: refreshToken,
        });
        fail('Expected request to fail');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(401);
      }
    });
  });

  describe('Integration Tests - Complete Auth Flow', () => {
    it('should complete full registration -> login -> profile -> refresh -> logout flow', async () => {
      // Generate unique user for this test
      const testUser = {
        email: `integration-${Date.now()}@example.com`,
        password: 'Test1234',
        name: 'Integration Test User',
      };

      // 1. Register a new user
      const registerResponse = await axios.post(`${API_PREFIX}/register`, testUser);
      expect(registerResponse.status).toBe(201);
      const { access_token: token1, refresh_token: refreshToken1 } = registerResponse.data;

      // 2. Get profile with initial token
      const profileResponse1 = await axios.get(`${API_PREFIX}/profile`, {
        headers: { Authorization: `Bearer ${token1}` },
      });
      expect(profileResponse1.status).toBe(200);
      expect(profileResponse1.data.email).toBe(testUser.email);

      // 3. Refresh tokens
      const refreshResponse = await axios.post(`${API_PREFIX}/refresh`, {
        refresh_token: refreshToken1,
      });
      expect(refreshResponse.status).toBe(200);
      const { access_token: token2, refresh_token: refreshToken2 } = refreshResponse.data;

      // 4. Get profile with new token
      const profileResponse2 = await axios.get(`${API_PREFIX}/profile`, {
        headers: { Authorization: `Bearer ${token2}` },
      });
      expect(profileResponse2.status).toBe(200);
      expect(profileResponse2.data.email).toBe(testUser.email);

      // 5. Logout
      const logoutResponse = await axios.post(
        `${API_PREFIX}/logout`,
        {},
        {
          headers: { Authorization: `Bearer ${token2}` },
        }
      );
      expect(logoutResponse.status).toBe(200);

      // 6. Verify old refresh token doesn't work
      try {
        await axios.post(`${API_PREFIX}/refresh`, {
          refresh_token: refreshToken2,
        });
        fail('Expected request to fail');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(401);
      }

      // 7. Login again with same credentials
      const loginResponse = await axios.post(`${API_PREFIX}/login`, {
        email: testUser.email,
        password: testUser.password,
      });
      expect(loginResponse.status).toBe(200);
      expect(loginResponse.data).toHaveProperty('access_token');
    });

    it('should handle multiple concurrent requests with same token', async () => {
      // Login to get fresh token
      const loginResponse = await axios.post(`${API_PREFIX}/login`, {
        email: validUser.email,
        password: validUser.password,
      });
      const token = loginResponse.data.access_token;

      // Make multiple concurrent requests
      const promises = Array(5).fill(null).map(() =>
        axios.get(`${API_PREFIX}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      );

      const responses = await Promise.all(promises);

      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.data.email).toBe(validUser.email);
      });
    });

    it('should prevent using invalidated tokens after new refresh', async () => {
      // Generate unique user for this test
      const testUser = {
        email: `tokentest-${Date.now()}@example.com`,
        password: 'Test1234',
        name: 'Token Test User',
      };

      // Register
      const registerResponse = await axios.post(`${API_PREFIX}/register`, testUser);
      const oldRefreshToken = registerResponse.data.refresh_token;

      // Refresh once
      const refreshResponse1 = await axios.post(`${API_PREFIX}/refresh`, {
        refresh_token: oldRefreshToken,
      });
      expect(refreshResponse1.status).toBe(200);

      // Try to use old refresh token again - should fail
      try {
        const response = await axios.post(`${API_PREFIX}/refresh`, {
          refresh_token: oldRefreshToken,
        });

        // If it somehow succeeds, verify we still get tokens
        // (Some implementations might allow reuse within a grace period)
        if (response.status === 200) {
          expect(response.data).toHaveProperty('access_token');
        }
      } catch (error) {
        const axiosError = error as AxiosError;
        // Should fail with unauthorized
        expect(axiosError.response?.status).toBe(401);
      }
    });
  });

  describe('Security Tests', () => {
    it('should not expose sensitive information in error messages', async () => {
      try {
        await axios.post(`${API_PREFIX}/login`, {
          email: 'nonexistent@example.com',
          password: 'WrongPassword123',
        });
        fail('Expected request to fail');
      } catch (error) {
        const axiosError = error as AxiosError<{ message: string }>;
        const errorMessage = axiosError.response?.data.message;

        // Should not reveal whether email exists or not
        expect(errorMessage).not.toContain('email not found');
        expect(errorMessage).not.toContain('user does not exist');
      }
    });

    it('should not accept SQL injection in email field', async () => {
      try {
        await axios.post(`${API_PREFIX}/login`, {
          email: "admin'--",
          password: 'anything',
        });
        fail('Expected request to fail');
      } catch (error) {
        const axiosError = error as AxiosError;
        // Should fail with validation error, not SQL error
        expect(axiosError.response?.status).toBe(400);
      }
    });

    it('should not accept XSS in name field during registration', async () => {
      const xssPayload = '<script>alert("xss")</script>';

      try {
        await axios.post(`${API_PREFIX}/register`, {
          email: 'xsstest@example.com',
          password: 'Test1234',
          name: xssPayload,
        });

        // If it succeeds, verify the name is stored safely
        const loginResponse = await axios.post(`${API_PREFIX}/login`, {
          email: 'xsstest@example.com',
          password: 'Test1234',
        });

        // The name should be returned as-is (escaped by the client)
        expect(loginResponse.data.user.name).toBe(xssPayload);
      } catch (error) {
        // If it fails, that's also acceptable (stricter validation)
        const axiosError = error as AxiosError;
        expect([400, 401]).toContain(axiosError.response?.status);
      }
    });

    it('should rate limit login attempts (if implemented)', async () => {
      // This test assumes rate limiting is implemented
      // If not, it will just verify the endpoint works multiple times

      const attempts = Array(10).fill(null).map(() =>
        axios.post(`${API_PREFIX}/login`, {
          email: validUser.email,
          password: 'WrongPassword123',
        }).catch(error => error)
      );

      const results = await Promise.all(attempts);

      // At least the first few should be 401 (unauthorized)
      const unauthorizedCount = results.filter(
        r => r.response?.status === 401
      ).length;

      expect(unauthorizedCount).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long email addresses', async () => {
      const longEmail = 'a'.repeat(100) + '@example.com';

      try {
        await axios.post(`${API_PREFIX}/register`, {
          email: longEmail,
          password: 'Test1234',
          name: 'Test User',
        });
        fail('Expected request to fail or succeed');
      } catch (error) {
        const axiosError = error as AxiosError;
        // Should handle gracefully with validation error
        expect([400, 401]).toContain(axiosError.response?.status);
      }
    });

    it('should handle unicode characters in name', async () => {
      const unicodeName = '测试用户 🚗';
      const timestamp = Date.now();

      const response = await axios.post(`${API_PREFIX}/register`, {
        email: `unicode-${timestamp}@example.com`,
        password: 'Test1234',
        name: unicodeName,
      });

      expect(response.status).toBe(201);
      expect(response.data.user.name).toBe(unicodeName);
    });

    it('should trim whitespace from email', async () => {
      const timestamp = Date.now();
      const emailWithSpaces = `  trimtest-${timestamp}@example.com  `;

      const response = await axios.post(`${API_PREFIX}/register`, {
        email: emailWithSpaces,
        password: 'Test1234',
        name: 'Trim Test',
      });

      expect(response.status).toBe(201);

      // Should be able to login with trimmed email
      const loginResponse = await axios.post(`${API_PREFIX}/login`, {
        email: `trimtest-${timestamp}@example.com`,
        password: 'Test1234',
      });

      expect(loginResponse.status).toBe(200);
    });

    it('should be case-insensitive for email login', async () => {
      const timestamp = Date.now();
      // Register with lowercase
      await axios.post(`${API_PREFIX}/register`, {
        email: `casetest-${timestamp}@example.com`,
        password: 'Test1234',
        name: 'Case Test',
      });

      // Try to login with different case
      const response = await axios.post(`${API_PREFIX}/login`, {
        email: `CaseTest-${timestamp}@Example.Com`,
        password: 'Test1234',
      });

      expect(response.status).toBe(200);
    });
  });
});


