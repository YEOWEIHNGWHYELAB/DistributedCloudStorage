import React, { useEffect, useState } from "react";
import RequestResource from "../../Hooks/RequestResource";
import { Table, Input, Form, Button } from "react-bootstrap";
import { FitScreen, WidthFull } from "@mui/icons-material";
import { CopyToClipboard } from "react-copy-to-clipboard";

function CredentialsTable() {
    const { getResourceList, resourceList, deleteResource } = RequestResource({
        endpoint: "github/list",
        resourceLabel: "GitHub Credentials",
    });

    useEffect(() => {
        getResourceList();
    }, [getResourceList]);
    /*
    const [searchTerm, setSearchTerm] = useState("");

    const [sortColumn, setSortColumn] = useState("username");
    const [sortDirection, setSortDirection] = useState("asc");

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

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    // filter the credentials array based on the search term
    const filteredCredentials = credentials.filter((credential) => {
        return (
            credential.username
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            credential.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    // sort the filtered credentials array based on the current sort column and direction
    const sortedCredentials = [...filteredCredentials].sort((a, b) => {
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

            <input
                type="text"
                placeholder="Search by Username or Email"
                style={{
                    border: "2px solid #007bff",
                    borderRadius: "4px",
                    padding: "8px",
                    width: "100%",
                    boxSizing: "border-box",
                    color: "#007bff",
                    backgroundColor: "transparent",
                }}
                value={searchTerm}
                onChange={handleSearch}
            />

            <br/>
            <br/>

            <div className="table-container">
                <Table >
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
                                        className={`fas fa-sort-${
                                            sortDirection === "asc"
                                                ? "up"
                                                : "down"
                                        }`}
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
                                        className={`fas fa-sort-${
                                            sortDirection === "asc"
                                                ? "up"
                                                : "down"
                                        }`}
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
    */

    const data = [
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

    const { Search } = Input;

    const [searchText, setSearchText] = useState("");
    const [sortKey, setSortKey] = useState("");
    const [sortOrder, setSortOrder] = useState("");

    const handleSearch = (value) => {
        setSearchText(value);
    };

    const handleTableChange = (pagination, filters, sorter) => {
        setSortKey(sorter.columnKey);
        setSortOrder(sorter.order);
    };

    const getSortedData = () => {
        let filteredData = data.filter(
            (row) =>
                row.username.toLowerCase().includes(searchText.toLowerCase()) ||
                row.email.toLowerCase().includes(searchText.toLowerCase())
        );

        if (sortKey && sortOrder) {
            filteredData = filteredData.sort((a, b) => {
                const keyA = a[sortKey];
                const keyB = b[sortKey];
                if (typeof keyA === "string" && typeof keyB === "string") {
                    return keyA.localeCompare(keyB, undefined, {
                        numeric: true,
                    });
                }
                return keyA - keyB;
            });
            if (sortOrder === "descend") {
                filteredData.reverse();
            }
        }

        return filteredData;
    };

    const columns = [
        {
            title: "Username",
            dataIndex: "username",
            sorter: true,
            sortOrder: sortKey === "username" && sortOrder,
        },
        {
            title: "Email",
            dataIndex: "email",
            sorter: true,
            sortOrder: sortKey === "email" && sortOrder,
        },
        {
            title: "Personal Access Token",
            dataIndex: "token",
            render: (token) => (
                <CopyToClipboard text={token}>
                    <Button>Copy</Button>
                </CopyToClipboard>
            ),
        },
        {
            title: "Edit",
            dataIndex: "edit",
            render: () => <Button>Edit</Button>,
        },
    ];

    return (
        <div style={{ padding: 20 }}>
            <h1 style={{ textAlign: "center" }}>GitHub Credentials</h1>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <Search
                    placeholder="Search by username or email"
                    onSearch={handleSearch}
                    style={{ width: 300, marginRight: 20 }}
                    allowClear
                />
            </div>
            <Table
                dataSource={getSortedData()}
                columns={columns}
                onChange={handleTableChange}
                style={{ width: "100%", marginTop: 20 }}
            />
        </div>
    );
}

export default CredentialsTable;
