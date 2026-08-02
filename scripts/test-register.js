async function run() {
  try {
    const res = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: `test+automated+${Date.now()}@example.com`,
        password: 'password123',
        confirmPassword: 'password123',
      }),
    });

    const text = await res.text();
    console.log('STATUS', res.status);
    console.log(text);
  } catch (err) {
    console.error(err);
  }
}

run();
