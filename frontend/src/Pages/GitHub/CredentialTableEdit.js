import { useState, useEffect } from "react";
import {
    BrowserRouter as Router,
    Switch,
    Route,
    useNavigate,
} from "react-router-dom";
import axios from "axios";

const elements = [
    {
        id: 1,
        name: "User 1",
        email: "user1@example.com",
        credentials: "user1_credentials",
    },
    {
        id: 2,
        name: "User 2",
        email: "user2@example.com",
        credentials: "user2_credentials",
    },
    {
        id: 3,
        name: "User 3",
        email: "user3@example.com",
        credentials: "user3_credentials",
    },
];

function ListPage() {
    const navigate = useNavigate();
    const [selectedElements, setSelectedElements] = useState([]);
    const [jsonData, setJsonData] = useState("");

    // Parse the JSON data from the state object
    useEffect(() => {
        //const state = navigate.getState();
        //const data = state?.data ?? "";
        setJsonData(elements);
    }, [navigate]);

    function handleDelete() {
        const confirmation = window.confirm(
            "Are you sure you want to delete the selected elements?"
        );
        if (confirmation) {
            const data = { ids: selectedElements };
            axios
                .delete("/api/elements", { data })
                .then((response) => {
                    console.log(response);
                })
                .catch((error) => {
                    console.error(error);
                });
        }
    }

    function handleSingleDelete(id) {
        const confirmation = window.confirm(
            `Are you sure you want to delete the element with ID ${id}?`
        );
        if (confirmation) {
            const data = { ids: [id] };
            axios
                .delete("/api/elements", { data })
                .then((response) => {
                    console.log(response);
                })
                .catch((error) => {
                    console.error(error);
                });
        }
    }

    // Parse the JSON data from the state object
    useEffect(() => {
        //const state = navigate.getState();
        //const data = state?.data ?? "";
        setJsonData(elements);
    }, [navigate]);

    // Parse the JSON data and update the selectedElements state
    useEffect(() => {
        try {
            const parsedData = JSON.parse(jsonData);
            setSelectedElements(parsedData);
        } catch (error) {
            console.error(error);
        }
    }, [jsonData]);

    return (
        <div>
            {elements.map((element) => (
                <div key={element.id}>
                    <input
                        type="checkbox"
                        onChange={(event) => {
                            const isChecked = event.target.checked;
                            setSelectedElements((prevSelectedElements) => {
                                if (isChecked) {
                                    return [
                                        ...prevSelectedElements,
                                        element.id,
                                    ];
                                } else {
                                    return prevSelectedElements.filter(
                                        (id) => id !== element.id
                                    );
                                }
                            });
                        }}
                        checked={selectedElements.includes(element.id)}
                    />
                    <span>{element.name}</span>
                    <span>{element.email}</span>
                    <span>{element.credentials}</span>
                    <button onClick={() => handleSingleDelete(element.id)}>
                        Delete
                    </button>
                </div>
            ))}
            <button onClick={handleDelete}>Delete Selected Elements</button>
        </div>
    );
}

export default ListPage;
