async function test() {
    const loginRes = await fetch('http://localhost:8081/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@citywatch.in', password: 'Admin@123' })
    });
    const loginData = await loginRes.json();
    console.log("Login:", loginRes.status, loginData);
    if (!loginData.token) return;

    const res = await fetch('http://localhost:8081/api/admin/complaints?page=0&size=10', {
        headers: { 'Authorization': `Bearer ${loginData.token}` }
    });
    console.log("Admin Complaints Status:", res.status);
    const data = await res.json();
    console.log("Data:", JSON.stringify(data, null, 2).substring(0, 1000));
}
test();
