import React, { useEffect, useState } from "react";
import axios from "axios";

import setHeaderToken from "../../../Contexts/SetHeaderToken";

const MainLanding = () => {
    const [user, setUser] = useState("");

    const getAuthUser = () => {
        axios
            .get("/auth/whoami", setHeaderToken())
            .then((res) => {
                setUser(res.data);
            });
    };

    useEffect(() => {
        if (!user) {
            getAuthUser();
        }
    }, [user]);

    return (
        <div>
            <h2 style={{ textAlign: "left" }}>Welcome back {user.username}!</h2>
        </div>
    );
};

export default MainLanding;
