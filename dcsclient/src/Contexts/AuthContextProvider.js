import React, { useEffect, useMemo, useState, createContext } from 'react';
import PropTypes from "prop-types";
import axios from "axios";

import setHeaderToken from "./SetHeaderToken";

export const AuthContext = createContext({
    isAuthenticated: null,
    setIsAuthenticated: () => {},
    user: null,
    setUser: () => {}
})

export default function AuthContextProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [user, setUser] = useState(null);

    const loadAuthUser = () => {
        const JWTToken = localStorage.getItem("JWTToken");

        if (!JWTToken) {
            setIsAuthenticated(false);
            return;
        }

        axios.get("/auth/whoami", setHeaderToken())
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
    }, [isAuthenticated, setIsAuthenticated, user, setUser]);

    useEffect(() => {
        loadAuthUser();
    }, [user, isAuthenticated]);

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
