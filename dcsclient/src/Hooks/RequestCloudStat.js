import { useCallback, useState, useContext } from "react";
import axios from "axios";
import { useSnackbar } from "notistack";
import HTTPAPIError from "../Errors/HTTPAPIError";
import { LoadingOverlayResourceContext } from "../Contexts/LoadingOverlayResource";
import SetHeaderToken from "../Contexts/SetHeaderToken";


export default function RequestCloudStat({ endpoint, resourceLabel }) {
    const [statList, setStatList] = useState(null);
    const [error, setError] = useState(null);

    const loadingOverlay = useContext(LoadingOverlayResourceContext);
    const { enqueueSnackbar } = useSnackbar();
    const { setLoading } = loadingOverlay;

    const handleRequestResourceError = useCallback((err) => {
        const formattedError = HTTPAPIError(err);
        setError(formattedError);
        setLoading(false);
        enqueueSnackbar(formattedError);
        window.location.href = '/auth/login';
    }, [enqueueSnackbar, setError, setLoading]);

    const getFileStat = useCallback((successCallBack) => {
        setLoading(true);

        axios.get(`/${endpoint}`, SetHeaderToken())
            .then((res) => {
                setLoading(false);

                if (res.data) {
                    setStatList(res.data);

                    if (successCallBack) {
                        successCallBack();
                    }
                }
            })
            .catch(handleRequestResourceError);
    }, [endpoint, handleRequestResourceError, setLoading]);

    return {
        statList,
        getFileStat,
        error
    }
}