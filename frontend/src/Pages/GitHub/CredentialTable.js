import React, { useEffect, useState } from "react";
import RequestResource from "../../Hooks/RequestResource";
import { Table } from "react-bootstrap";
import { FitScreen, WidthFull } from "@mui/icons-material";

function CredentialsTable() {
    const { getResourceList, resourceList, deleteResource } = RequestResource({
        endpoint: "github/list",
        resourceLabel: "GitHub Credentials",
    });

    useEffect(() => {
        getResourceList();
    }, [getResourceList]);

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

    const handleCopyToken = (token) => {
        navigator.clipboard.writeText(token);
    };

    return (
        <div style={{ margin: "0 auto", padding: "20px" }}>
            <h3> My Github Credentials: </h3>

            <Table style={{width: "100%"}}>
                <thead>
                    <tr>
                        <th
                            style={{
                                width: "25%",
                                border: "2px solid red",
                                textAlign: "left",
                            }}
                        >
                            Username
                        </th>
                        <th
                            style={{
                                width: "25%",
                                border: "2px solid red",
                                textAlign: "left",
                            }}
                        >
                            Email
                        </th>
                        <th
                            style={{
                                width: "50%",
                                border: "2px solid red",
                                textAlign: "left",
                            }}
                        >
                            Personal Access Token 📋
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {credentials.map((credential, index) => (
                        <tr key={index}>
                            <td style={{ border: "2px solid" }}>
                                {credential.username}
                            </td>
                            <td style={{ border: "2px solid" }}>
                                {credential.email}
                            </td>
                            <td
                                style={{
                                    border: "2px solid",
                                    cursor: "pointer",
                                }}
                                onClick={() =>
                                    handleCopyToken(
                                        credential.personalAccessToken
                                    )
                                }
                            >
                                {credential.personalAccessToken}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
}

export default CredentialsTable;
