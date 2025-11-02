// src/api/signup.js
export async function signup(email, password, fullName, phone = "") {
  const [firstName, ...rest] = fullName.split(" ");
  const lastName = rest.join(" ");

  const response = await fetch("http://localhost:5000/api/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      firstName,
      lastName,
      email,
      phone,
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Signup failed");
  }

  return data;
}
