import React from "react";

function CredentialsTable() {
    const credentials = [
        {
            username: "user1",
            email: "user1@example.com",
            personalAccessToken: "abc123",
        },
        {
            username: "user2",
            email: "user2@example.com",
            personalAccessToken: "def456",
        },
        {
            username: "user3",
            email: "user3@example.com",
            personalAccessToken: "ghi789",
        },
    ];

    return (
        <div>
            <h1>Github Credentials:</h1>
            <table>
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Personal Access Token</th>
                    </tr>
                </thead>
                <tbody>
                    {credentials.map((credential, index) => (
                        <tr key={index}>
                            <td>{credential.username}</td>
                            <td>{credential.email}</td>
                            <td>{credential.personalAccessToken}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default CredentialsTable;
