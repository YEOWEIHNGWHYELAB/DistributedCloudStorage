import React, { useRef, useEffect, useState } from "react";
import RequestResource from "../../Hooks/RequestResource";
import styled from 'styled-components';
import { CopyToClipboard } from "react-copy-to-clipboard";


const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 24px;
`;

const StyledHeaderRow = styled.tr`
  border-top: 1px solid #ddd;
  border-bottom: 1px solid #ddd;
  height: 40px;
  font-weight: bold;
  font-size: 14px;
  color: red;
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

    const [sortField, setSortField] = useState('username');
    const [sortDirection, setSortDirection] = useState('asc');

    function copyToClipboard(personalAccessToken) {
        navigator.clipboard.writeText(personalAccessToken);
    }

    const handleSort = (field) => {
        if (field === sortField) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('na');
        }
    };

    const sortedCredentials = resourceList.results.sort((a, b) => {
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
        <div>
            <h2 style={{ textAlign: "left" }}>My GitHub Credentials</h2>

            <StyledTable>
                <thead>
                    <StyledHeaderRow>
                        <StyledHeaderCell
                            className={sortField === 'username' ? `sortable ${sortDirection}` : 'sortable'}
                            onClick={() => handleSort('username')}
                            style={{ sortField }}
                        >
                            Username
                        </StyledHeaderCell>

                        <StyledHeaderCell
                            className={sortField === 'email' ? `sortable ${sortDirection}` : 'sortable'}
                            onClick={() => handleSort('email')}
                        >
                            Email
                        </StyledHeaderCell>

                        <StyledHeaderCell>
                            Personal Access Token 📋
                        </StyledHeaderCell>
                    </StyledHeaderRow>
                </thead>
                <tbody>
                    {sortedCredentials.map((credential) => (
                        <StyledRow key={credential.username}>
                            <StyledCell>{credential.github_username}</StyledCell>
                            <StyledCell>{credential.email}</StyledCell>
                            <StyledCell>
                                <button onClick={() => copyToClipboard(credential.access_token)}>
                                    Copy
                                </button>
                            </StyledCell>
                        </StyledRow>
                    ))}
                </tbody>
            </StyledTable>
        </div>
    );
}

export default CredentialsTable;
