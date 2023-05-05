import React, { useEffect, useState } from "react";
import RequestResource from "../../Hooks/RequestResource";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClipboard } from "@fortawesome/free-solid-svg-icons";
import { Box, Button as MUIButton, Dialog, DialogActions, DialogTitle, IconButton, Typography, Pagination } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { Button } from "react-bootstrap";

const StyledTable = styled.table`
    width: 100%;
    border-collapse: collapse;
    margin-top: 24px;
`;

const StyledHeaderRow = styled.tr`
    height: 40px;
    font-weight: bold;
    font-size: 14px;
    color: red;
`;

const StyledHeaderCell = styled.th`
    padding: 8px;
    text-align: left;
    cursor: pointer;
    border: 2px solid #ddd;

    &:hover {
        background-color: #ddd;
    }

    &.sortable {
        position: relative;

        &:after {
            content: "";
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
    border: 2px solid #ddd;
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
    
    const [open, setOpen] = useState(false);

    const handleDeleteClose = () => {
        setOpen(false);
    }

    const handleDelete = (id) => {
        console.log(id);
        setOpen(true);
        //deleteResource(id);
    }

    const [sortField, setSortField] = useState("github_username");
    const [sortDirection, setSortDirection] = useState("asc");

    const [searchTerm, setSearchTerm] = useState("");

    function copyToClipboard(personalAccessToken) {
        navigator.clipboard.writeText(personalAccessToken);
    }

    const handleSort = (field) => {
        if (field === sortField) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("na");
        }
    };

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    
    function handleDelete22() {
        const confirmation = window.confirm(
            "Are you sure you want to delete the selected elements?"
        );
        if (confirmation) {
            //const data = { ids: selectedElements };
            /*
            axios
                .delete("/api/elements", { data })
                .then((response) => {
                    console.log(response);
                })
                .catch((error) => {
                    console.error(error);
                });*/
        }
    }

    function handleSingleDelete(id) {
        const confirmation = window.confirm(
            `Are you sure you want to delete the element with ID ${id}?`
        );
        if (confirmation) {
            //const data = { ids: [id] };
            /*
            axios
                .delete("/api/elements", { data })
                .then((response) => {
                    console.log(response);
                })
                .catch((error) => {
                    console.error(error);
                });*/
        }
    }

    // filter the credentials array based on the search term
    const filteredCredentials = resourceList.results.filter((credential) => {
        return (
            credential.github_username
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            credential.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    const sortedCredentials = filteredCredentials.sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];

        if (aValue < bValue) {
            return sortDirection === "asc" ? -1 : 1;
        } else if (aValue > bValue) {
            return sortDirection === "asc" ? 1 : -1;
        } else {
            return 0;
        }
    });

    return (
        <div>
            <Dialog open={open} onClose={handleDeleteClose}>
                <DialogTitle>
                    Are you sure you want to delete this Task?
                </DialogTitle>
                <DialogActions>
                    <MUIButton 
                        onClick={handleDelete}
                    >
                        YES!
                    </MUIButton>

                    <MUIButton 
                        onClick={handleDeleteClose}
                    >
                        NO!
                    </MUIButton>
                </DialogActions>
            </Dialog>

            <h2 style={{ textAlign: "left" }}>My GitHub Credentials</h2>

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

            <StyledTable>
                <thead>
                    <StyledHeaderRow>
                        <StyledHeaderCell
                            className={
                                sortField === "github_username"
                                    ? `sortable ${sortDirection}`
                                    : "sortable"
                            }
                            onClick={() => handleSort("github_username")}
                            style={{ sortField }}
                        >
                            Username
                        </StyledHeaderCell>

                        <StyledHeaderCell
                            className={
                                sortField === "email"
                                    ? `sortable ${sortDirection}`
                                    : "sortable"
                            }
                            onClick={() => handleSort("email")}
                        >
                            Email
                        </StyledHeaderCell>

                        <StyledHeaderCell>
                            Personal Access Token 📋
                        </StyledHeaderCell>

                        <StyledHeaderCell>Actions</StyledHeaderCell>
                    </StyledHeaderRow>
                </thead>
                <tbody>
                    {sortedCredentials.map((credential) => (
                        <StyledRow key={credential.github_username}>
                            <StyledCell>
                                {credential.github_username}
                            </StyledCell>
                            <StyledCell>{credential.email}</StyledCell>
                            <StyledCell>
                                <IconButton
                                    onClick={() =>
                                        copyToClipboard(credential.access_token)
                                    }
                                >
                                    <FontAwesomeIcon
                                        icon={faClipboard}
                                        title="Copy"
                                    />
                                </IconButton>
                            </StyledCell>
                            <StyledCell>
                                <IconButton
                                    //onClick={() => handleDelete(credential.id)}
                                >
                                    <EditIcon />
                                </IconButton>

                                <IconButton
                                    onClick={() => handleDelete(credential.id)}
                                >
                                    <DeleteIcon />
                                </IconButton>  
                            </StyledCell>
                        </StyledRow>
                    ))}
                </tbody>
            </StyledTable>
        </div>
    );
}

export default CredentialsTable;
