function getToken() {
    const JWTToken = localStorage.getItem("JWTToken");

    // If no token return empty object
    if (!JWTToken) {
        return {};
    }

    return {
        headers: {
            authorization: `${JWTToken}`
        }
    }
}

export default getToken;
