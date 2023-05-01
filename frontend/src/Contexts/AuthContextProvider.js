import React, { useEffect, useMemo, useState, createContext } from 'react';
import PropTypes from "prop-types";
import axios from "axios";

import getToken from "./GetToken";

export const AuthContext = createContext({
    isAuthenticated: null,
    setIsAuthenticated: () => { },
    user: null,
    setUser: () => { }
})

export default function AuthContextProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [user, setUser] = useState(null);

    const loadAuthUser = () => {
        const authToken = localStorage.getItem("AuthToken");

        if (!authToken) {
            setIsAuthenticated(false);
            return;
        }

        axios.get("/auth/users/me/", getToken())
            .then((res) => {
                setUser(res.data);
                setIsAuthenticated(true);
            }).catch(() => {
                setIsAuthenticated(false);
            });
    }

    const providerValue = useMemo(() => {
        return {
            isAuthenticated,
            setIsAuthenticated,
            user,
            setUser
        }
    }, [isAuthenticated, setIsAuthenticated, user, setUser])

    useEffect(() => {
        if (!user && (isAuthenticated === null || isAuthenticated === true)) {
            loadAuthUser()
        }
    }, [user, isAuthenticated])

    // Do not include this in deployment!
    // console.log(providerValue);

    return (
        <AuthContext.Provider value={providerValue}>
            {children}
        </AuthContext.Provider>
    )
}

AuthContextProvider.propTypes = {
    children: PropTypes.node
}
