import http from 'k6/http';

// Generate random string
function randomString(length) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Generate random user data
function generateRandomUser() {
  const timestamp = Date.now();
  const random = randomString(8);

  return {
    first_name: `User${randomString(4)}`,
    last_name: `Test${randomString(4)}`,
    email: `user_${timestamp}_${random}@test.com`,
    password: 'Password123!',
  };
}

export default function () {
  const url = 'http://localhost:3000/api/v1/users';
  const userData = generateRandomUser();
  const payload = JSON.stringify(userData);

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const response = http.post(url, payload, params);

  // Optional: Log response for debugging
  if (response.status !== 201) {
    console.log(`Failed to create user: ${response.status} - ${response.body}`);
  }
}
