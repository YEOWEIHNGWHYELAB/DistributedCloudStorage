import { useCallback, useState, useContext } from "react";
import axios from "axios";
import { useSnackbar } from "notistack";
import HTTPAPIError from "../Errors/HTTPAPIError";
import { LoadingOverlayResourceContext } from "../Contexts/LoadingOverlayResource";
import SetHeaderToken from "../Contexts/SetHeaderToken";


export default function RequestResource({ endpoint, resourceLabel }) {
    const [resourceList, setResourceList] = useState({
        results: []
    });
    const [ytDescriptionMeta, setYTDescriptionMeta] = useState("");
    const [ytPrivacyMeta, setYTPrivacyMeta] = useState("");
    const [pageMax, setPageMax] = useState(0);
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

    // Callback lets us recreate function when dependencies created 
    const getAllFiles = useCallback(() => {
        setLoading(true);

        axios.get(`/${endpoint}`, SetHeaderToken())
            .then((res) => {
                setLoading(false);

                if (res.data) {
                    setResourceList({
                        results: res.data
                    });
                }
            }).catch(handleRequestResourceError);
    }, [endpoint, handleRequestResourceError, setLoading]);

    const getYTMetaInfo = useCallback((id, successCallback) => {
        setLoading(true);

        axios.get(`/google/youtube/videos/metainfo/${id}`, SetHeaderToken())
            .then((res) => {
                setLoading(false);

                if (res.data.results) {
                    setYTDescriptionMeta(res.data.results.description);
                    setYTPrivacyMeta(res.data.results.privacy_status);

                    if (successCallback) {
                        successCallback();
                    }
                }
            }).catch(handleRequestResourceError);
    }, [endpoint, handleRequestResourceError, setLoading]);

    const getFilesPaginated = useCallback((values) => {
        setLoading(true);

        axios.post(`/${endpoint}pag`, values, SetHeaderToken())
            .then((res) => {
                setLoading(false);

                if (res.data.results) {
                    setResourceList({
                        results: res.data.results
                    });
                }

                if (res.data.maxpage) {
                    setPageMax(res.data.maxpage);
                }
            }).catch(handleRequestResourceError);
    }, [endpoint, enqueueSnackbar, resourceLabel, handleRequestResourceError, setLoading]);

    const addYTVideo = useCallback((singleForm, successCallback) => {
        setLoading(true);

        axios.post(`/${endpoint}`, singleForm, SetHeaderToken())
            .then(() => {
                setLoading(false);
                enqueueSnackbar(`${resourceLabel} uploaded`);
                
                if (successCallback) {
                    successCallback();
                }
            }).catch(handleRequestResourceError);
    }, [endpoint, enqueueSnackbar, resourceLabel, handleRequestResourceError, setLoading]);

    const addFile = useCallback((singleForm, successCallback) => {
        setLoading(true);

        axios.post(`/${endpoint}`, singleForm, SetHeaderToken())
            .then(() => {
                setLoading(false);
                enqueueSnackbar(`${resourceLabel} uploaded`);
                if (successCallback) {
                    successCallback();
                }
            }).catch(handleRequestResourceError);
    }, [endpoint, enqueueSnackbar, resourceLabel, handleRequestResourceError, setLoading]);

    const addMulFiles = useCallback((formData, successCallback) => {
        setLoading(true);

        axios.post(`/${endpoint}/mul`, formData, SetHeaderToken())
            .then(() => {
                setLoading(false);
                enqueueSnackbar(`All selected ${resourceLabel} uploaded!`);

                // If there is a call back defined, call it...
                if (successCallback) {
                    successCallback();
                }
            }).catch(handleRequestResourceError);

    }, [endpoint, enqueueSnackbar, resourceLabel, handleRequestResourceError, setLoading]);

    const downloadFiles = useCallback((fileIDs, successCallback) => {
        setLoading(true);

        axios.post(`/${endpoint}/getfiles`, fileIDs, SetHeaderToken())
            .then((res) => {
                setLoading(false);
                enqueueSnackbar(`Selected ${resourceLabel} downloaded!`);

                if (successCallback) {
                    successCallback(res.data);
                }
            }).catch(handleRequestResourceError);

    }, [endpoint, enqueueSnackbar, resourceLabel, handleRequestResourceError, setLoading]);

    const updateFile = useCallback((values) => {
        setLoading(true);

        axios.patch(`/${endpoint}`, values, SetHeaderToken())
            .then((res) => {
                const updatedResourceID = values.id;

                const newResourceList = {
                    results: resourceList.results.map((r) => {
                        if (r.id === updatedResourceID) {
                            r.filename = values.new_filename;
                        }

                        return r;
                    })
                }

                setResourceList(newResourceList);
                setLoading(false);
                enqueueSnackbar(`${resourceLabel}name updated`);
            }).catch(handleRequestResourceError)
    }, [endpoint, enqueueSnackbar, resourceLabel, handleRequestResourceError, setLoading, resourceList]);

    const updateVideo = useCallback((values) => {
        setLoading(true);

        axios.patch(`/${endpoint}`, values, SetHeaderToken())
            .then((res) => {
                const updatedResourceID = values.video_id;

                const newResourceList = {
                    results: resourceList.results.map((r) => {
                        if (r.video_id == updatedResourceID) {
                            r.title = values.title;
                        }

                        return r;
                    })
                }

                setResourceList(newResourceList);
                setLoading(false);
                enqueueSnackbar(`Video name updated`);
            }).catch(handleRequestResourceError)
    }, [endpoint, enqueueSnackbar, resourceLabel, handleRequestResourceError, setLoading, resourceList]);

    const deleteFile = useCallback((id) => {
        setLoading(true);

        axios.delete(`/${endpoint}/${id}`, SetHeaderToken())
            .then(() => {
                setLoading(false);
                enqueueSnackbar(`${resourceLabel} deleted`);

                const newResourceList = {
                    results: resourceList.results.filter((r) => {
                        return r.id !== id
                    })
                };

                setResourceList(newResourceList);
            })
            .catch(handleRequestResourceError);
    }, [endpoint, resourceList, enqueueSnackbar, resourceLabel, handleRequestResourceError, setLoading]);

    const deleteMulFiles = useCallback((selectedIDs, isDeletion) => {
        setLoading(true);

        const messageStatus = isDeletion ? "deleted" : "restored";
        
        axios.post(`/${endpoint}/muldel`, { id: selectedIDs, is_deletion: isDeletion}, SetHeaderToken())
            .then(() => {
                setLoading(false);
                enqueueSnackbar(`Selected ${resourceLabel} ${messageStatus}!`);

                const newResourceList = {
                    results: deleteSelectedResultID(resourceList.results, selectedIDs)
                };

                setResourceList(newResourceList);
            }).catch(handleRequestResourceError);
    }, [endpoint, resourceList, enqueueSnackbar, resourceLabel, handleRequestResourceError, setLoading]);

    return {
        resourceList,
        ytDescriptionMeta,
        ytPrivacyMeta,
        pageMax,
        addYTVideo,
        addFile,
        addMulFiles,
        downloadFiles,
        getAllFiles,
        getFilesPaginated,
        getYTMetaInfo,
        updateFile,
        updateVideo,
        deleteFile,
        deleteMulFiles,
        error
    }
}