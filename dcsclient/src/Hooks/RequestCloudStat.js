import { useCallback, useState, useContext } from "react";
import axios from "axios";
import { useSnackbar } from "notistack";
import HTTPAPIError from "../Errors/HTTPAPIError";
import { LoadingOverlayResourceContext } from "../Contexts/LoadingOverlayResource";
import SetHeaderToken from "../Contexts/SetHeaderToken";


export default function RequestCloudStat({ resourceLabel }) {
    const [error, setError] = useState(null);
    const [numytvideo, setNumytvideo] = useState(0);
    const [numytvideoDeleted, setNumytvideoDeleted] = useState(0);
    const [numghfiles, setNumghfiles] = useState(0);
    const [numGHFilesDeleted, setNumGHFilesDeleted] = useState(0);
    const [isLoadingFileData, setIsLoadingFileData] = useState(true);

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
    
    const getFileStat = useCallback(() => {
        setLoading(true);

        axios.get(`/cloudstat/filestat`, SetHeaderToken())
            .then((res) => {
                if (res.data) {
                    setNumytvideo(res.data.numytvideo);
                    setNumytvideoDeleted(res.data.numytvideo_deleted);
                    setNumghfiles(res.data.numghfiles);
                    setNumGHFilesDeleted(res.data.numGHFilesDeleted);
                    setIsLoadingFileData(false);
                }

                setLoading(false);
            })
            .catch(handleRequestResourceError);
    }, [handleRequestResourceError, setLoading]);

    return {
        numytvideo,
        numytvideoDeleted,
        numghfiles,
        numGHFilesDeleted,
        isLoadingFileData,
        getFileStat,
        error
    }
}