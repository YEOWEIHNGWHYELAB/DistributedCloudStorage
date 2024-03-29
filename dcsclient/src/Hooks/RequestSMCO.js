import { useCallback, useState, useContext } from "react";
import axios from "axios";
import { useSnackbar } from "notistack";
import HTTPAPIError from "../Errors/HTTPAPIError";
import { LoadingOverlayResourceContext } from "../Contexts/LoadingOverlayResource";
import SetHeaderToken from "../Contexts/SetHeaderToken";


export default function RequestSMCO({ resourceLabel }) {
    const [resourceList, setResourceList] = useState({
        results: [],
        numFile: 0
    });

    const [buildDirList, setBuildDirList] = useState({
        buildDir: []
    });

    const [error, setError] = useState(null);

    const loadingOverlay = useContext(LoadingOverlayResourceContext);
    const { enqueueSnackbar } = useSnackbar();
    const { setLoading } = loadingOverlay;

    function deleteSelectedResultID(results, idToDelete) {
        const idSet = new Set(idToDelete);
        return results.filter(result => !idSet.has((result.id) ? result.id : result.video_id));
    }

    const handleRequestResourceError = useCallback((err) => {
        const formattedError = HTTPAPIError(err);
        setError(formattedError);
        setLoading(false);
        enqueueSnackbar(formattedError);
        window.location.href = '/auth/login';
    }, [enqueueSnackbar, setError, setLoading]);

    const getAllDirBuilder = useCallback((successCallback) => {
        setLoading(true);

        axios.get(`/smco/filespag`, SetHeaderToken())
            .then((res) => {
                setLoading(false);

                if (res.data) {
                    setBuildDirList({
                        buildDir: res.data.lvlorderdir,
                        dirLoad: true
                    });

                    if (successCallback) {
                        successCallback();
                    }
                }
            }).catch(handleRequestResourceError);
    }, [handleRequestResourceError, setLoading]);

    const getAllFiles = useCallback((values, successCallback) => {
        setLoading(true);

        axios.post(`/smco/filespag`, values, SetHeaderToken())
            .then((res) => {
                setLoading(false);

                if (res.data) {
                    setResourceList({
                        results: res.data.results,
                        numFile: res.data.filecount,
                        resLoad: true
                    });

                    if (successCallback) {
                        successCallback();
                    }
                }
            }).catch(handleRequestResourceError);
    }, [handleRequestResourceError, setLoading]);

    const moveFiles = useCallback((fileToMove, successCallback) => {
        setLoading(true);

        axios.post(`/smco/cdfiles`, fileToMove, SetHeaderToken())
            .then(() => {
                setLoading(false);
                enqueueSnackbar(`Items moved!`);

                if (successCallback) {
                    successCallback();
                }
            }).catch(handleRequestResourceError);
    }, [enqueueSnackbar, resourceLabel, handleRequestResourceError, setLoading]);

    const moveFolder = useCallback((folderToMove, successCallback) => {
        setLoading(true);

        axios.post(`/smco/cdfolder`, folderToMove, SetHeaderToken())
            .then(() => {
                setLoading(false);

                if (successCallback) {
                    successCallback();
                }
            }).catch(handleRequestResourceError);
    }, [enqueueSnackbar, resourceLabel, handleRequestResourceError, setLoading]);

    const renameFile = useCallback((fileToRename, successCallback) => {
        setLoading(true);

        axios.patch(`/smco/renamefiles`, fileToRename, SetHeaderToken())
            .then(() => {
                setLoading(false);

                if (successCallback) {
                    successCallback();
                }
            })
            .catch(handleRequestResourceError);
    }, [enqueueSnackbar, resourceLabel, handleRequestResourceError, setLoading]);

    const renameFolder = useCallback((folderToRename, successCallback) => {
        setLoading(true);

        axios.patch(`/smco/renamefolder`, folderToRename, SetHeaderToken())
            .then(() => {
                setLoading(false);

                if (successCallback) {
                    successCallback();
                }
            })
            .catch(handleRequestResourceError);
    }, [enqueueSnackbar, resourceLabel, handleRequestResourceError, setLoading]);

    const deleteFolder = useCallback((folderToDelete, successCallback) => {
        setLoading(true);

        axios.post(`/smco/deletedir`, folderToDelete, SetHeaderToken())
            .then(() => {
                setLoading(false);

                if (successCallback) {
                    successCallback();
                }
            })
            .catch(handleRequestResourceError);
    }, [enqueueSnackbar, resourceLabel, handleRequestResourceError, setLoading]);

    const deleteMulFiles = useCallback((selectedIDs, isDeletion, endpoint, successCallback) => {
        setLoading(true);
        
        axios.post(`/${endpoint}`, { id: selectedIDs, is_deletion: isDeletion}, SetHeaderToken())
            .then(() => {
                setLoading(false);

                if (successCallback) {
                    successCallback();
                }
            }).catch(handleRequestResourceError);
    }, [enqueueSnackbar, resourceLabel, handleRequestResourceError, setLoading]);

    return {
        resourceList,
        buildDirList,
        getAllFiles,
        getAllDirBuilder,
        moveFiles,
        moveFolder,
        renameFile,
        renameFolder,
        deleteFolder,
        deleteMulFiles,
        error
    }
}