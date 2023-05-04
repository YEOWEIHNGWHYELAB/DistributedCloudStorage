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

    const [sortColumn, setSortColumn] = useState('username');
    const [sortDirection, setSortDirection] = useState('asc');

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

    const handleSort = (column) => {
        if (column === sortColumn) {
            // if clicking on the current sort column, toggle the sort direction
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            // if clicking on a new sort column, set the sort column and direction to default values
            setSortColumn(column);
            setSortDirection("asc");
        }
    };

    // sort the credentials array based on the current sort column and direction
    const sortedCredentials = [...credentials].sort((a, b) => {
        let comparison = 0;
        if (a[sortColumn] > b[sortColumn]) {
            comparison = 1;
        } else if (a[sortColumn] < b[sortColumn]) {
            comparison = -1;
        }
        return sortDirection === "asc" ? comparison : comparison * -1;
    });

    const handleCopyToken = (token) => {
        navigator.clipboard.writeText(token);
    };

    return (
        <div className="credentials-table-wrapper">
            <h1>Github Credentials:</h1>
            <div className="table-container">
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th
                                style={{
                                    width: "25%",
                                    border: "1px solid black",
                                    cursor: "pointer",
                                }}
                                onClick={() => handleSort("username")}
                            >
                                Username{" "}
                                {sortColumn === "username" && (
                                    <i
                                        className={`fas fa-sort-${sortDirection}`}
                                    />
                                )}
                            </th>
                            <th
                                style={{
                                    width: "50%",
                                    border: "1px solid black",
                                    cursor: "pointer",
                                }}
                                onClick={() => handleSort("email")}
                            >
                                Email{" "}
                                {sortColumn === "email" && (
                                    <i
                                        className={`fas fa-sort-${sortDirection}`}
                                    />
                                )}
                            </th>
                            <th
                                style={{
                                    width: "25%",
                                    border: "1px solid black",
                                }}
                            >
                                Personal Access Token
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedCredentials.map((credential, index) => (
                            <tr key={index}>
                                <td style={{ border: "1px solid black" }}>
                                    {credential.username}
                                </td>
                                <td style={{ border: "1px solid black" }}>
                                    {credential.email}
                                </td>
                                <td
                                    style={{
                                        border: "1px solid black",
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
        </div>
    );
}

export default CredentialsTable;
