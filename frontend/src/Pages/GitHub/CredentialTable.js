import React, { useEffect, useState } from "react";
import RequestResource from "../../Hooks/RequestResource";
import styled from 'styled-components';
import { CopyToClipboard } from "react-copy-to-clipboard";


const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 24px;
`;

const StyledHeaderRow = styled.tr`
  background-color: #f4f4f4;
  border-top: 1px solid #ddd;
  border-bottom: 1px solid #ddd;
  height: 40px;
  font-weight: bold;
  font-size: 14px;
  color: #555;
`;

const StyledHeaderCell = styled.th`
  padding: 8px;
  text-align: left;
  cursor: pointer;

  &:hover {
    background-color: #ddd;
  }

  &.sortable {
    position: relative;

    &:after {
      content: '';
      display: inline-block;
      margin-left: 6px;
      width: 0;
      height: 0;
      border-left: 6px solid transparent;
      border-right: 6px solid transparent;
      border-top: 6px solid #aaa;
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      right: 8px;
    }

    &.asc:after {
      border-top: none;
      border-bottom: 6px solid #aaa;
    }

    &.desc:after {
      border-top: 6px solid #aaa;
      border-bottom: none;
    }
  }
`;

const StyledRow = styled.tr`
  height: 48px;

  &:nth-child(even) {
    background-color: #f9f9f9;
  }
`;

const StyledCell = styled.td`
  padding: 8px;
  font-size: 14px;
`;


function CredentialsTable() {
    const { getResourceList, resourceList, deleteResource } = RequestResource({
        endpoint: "github/list",
        resourceLabel: "GitHub Credentials",
    });

    useEffect(() => {
        getResourceList();
    }, [getResourceList]);

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

    /*
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
            title: "Action",
            dataIndex: "edit",
            render: () => <Button>Edit</Button>,
        },
    ];

    return (
        <div style={{ padding: 20}}>
            <h1 style={{ textAlign: "left" }}>My GitHub Credentials</h1>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <Search
                    placeholder="Search by username or email"
                    onSearch={handleSearch}
                    style={{ 
                        width: 300, 
                        marginRight: 20,
                    }}
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
    */
    const [sortField, setSortField] = useState('');
    const [sortDirection, setSortDirection] = useState('asc');

    const handleSort = (field) => {
        if (field === sortField) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const sortedCredentials = data.sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];
        if (aValue < bValue) {
            return sortDirection === 'asc' ? -1 : 1;
        } else if (aValue > bValue) {
            return sortDirection === 'asc' ? 1 : -1;
        } else {
            return 0;
        }
    });

    return (
        <StyledTable>
            <thead>
                <StyledHeaderRow>
                    <StyledHeaderCell>ID</StyledHeaderCell>
                    <StyledHeaderCell
                        className={sortField === 'username' ? `sortable ${sortDirection}` : 'sortable'}
                        onClick={() => handleSort('username')}
                    >
                        Username
                    </StyledHeaderCell>
                    <StyledHeaderCell
                        className={sortField === 'email' ? `sortable ${sortDirection}` : 'sortable'}
                        onClick={() => handleSort('email')}
                    >
                        Email
                    </StyledHeaderCell>
                    <StyledHeaderCell>Personal Access Token</StyledHeaderCell>
                </StyledHeaderRow>
            </thead>
            <tbody>
                {sortedCredentials.map((credential) => (
                    <StyledRow key={credential.id}>
                        <StyledCell>{credential.id}</StyledCell>
                        <StyledCell>{credential.username}</StyledCell>
                        <StyledCell>{credential.email}</StyledCell>
                        <StyledCell>{credential.personalAccessToken}</StyledCell>
                    </StyledRow>
                ))}
            </tbody>
        </StyledTable>
    );
}

export default CredentialsTable;
