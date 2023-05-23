import { useCallback, useState, useContext } from "react";
import axios from "axios";
import { useSnackbar } from "notistack";

import formatHttpApiError from "../Errors/HTTPAPIError";
import { AuthContext } from "../Contexts/AuthContextProvider";

export default function useRequestSendEmail() {
    const [loading, setLoading] = useState(false);
    const { enqueueSnackbar } = useSnackbar();
    const [error, setError] = useState(null);

    const handleRequestError = useCallback((err) => {
        const formattedError = formatHttpApiError(err);
        setError(formattedError);
        enqueueSnackbar(formattedError);
        setLoading(false);
    }, [enqueueSnackbar, setLoading, setError]);

    const sendEmailContactUs = useCallback((values, successCallBack) => {
        setLoading(true);

        axios.post("/email/contactus", values)
            .then((res) => {
                setLoading(false);

                if (successCallBack) {
                    successCallBack();
                }
            })
            .catch(handleRequestError);
    }, [handleRequestError, setLoading]);

    return {
        sendEmailContactUs,
        loading,
        error
    };
}
