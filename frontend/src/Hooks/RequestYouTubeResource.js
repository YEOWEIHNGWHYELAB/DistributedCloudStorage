import { useCallback, useState, useContext } from "react";
import axios from "axios";
import { useSnackbar } from "notistack";

import HTTPAPIError from "../Errors/HTTPAPIError";
import { LoadingOverlayResourceContext } from "../Contexts/LoadingOverlayResource";
import SetHeaderToken from "../Contexts/SetHeaderToken";

export default function RequestResourceYouTube({ endpoint, resourceLabel}) {
    const [youtubeResourceList, setYoutubeResourceList] = useState({
        video: [],
        pageToken: "",
        maxPage: 10
    });
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

    const getVideoListByPageToken = useCallback(({ pageToken = "" } = {}) => {
        setLoading(true);
        axios.post(`/${endpoint}`, { "maxVideo": 10, "pageToken": pageToken}, SetHeaderToken())
            .then((res) => {
                setLoading(false);
                setYoutubeResourceList(res.data);
            }).catch(handleRequestResourceError);
    }, [endpoint, handleRequestResourceError, setLoading]);

    return {
        youtubeResourceList,
        getVideoListByPageToken,
        error
    }
}