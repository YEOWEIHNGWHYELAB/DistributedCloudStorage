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
    const [pageMax, setPageMax] = useState(0);
    const [error, setError] = useState(null);

    const loadingOverlay = useContext(LoadingOverlayResourceContext);
    const { enqueueSnackbar } = useSnackbar();
    const { setLoading } = loadingOverlay;

    function deleteSelectedResultID(results, idToDelete) {
        const idSet = new Set(idToDelete);
        return results.filter(result => !idSet.has(result.id));
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
                enqueueSnackbar(`All ${resourceLabel} listed!`);

                if (res.data) {
                    setResourceList({
                        results: res.data
                    });
                }
            }).catch(handleRequestResourceError);
    }, [endpoint, handleRequestResourceError, setLoading]);

    const getFilesPaginated = useCallback((values) => {
        setLoading(true);

        axios.post(`/${endpoint}pag`, values, SetHeaderToken())
            .then((res) => {
                setLoading(false);
                enqueueSnackbar(`${resourceLabel} obtained`);

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

    const addFiles = useCallback((values, successCallback) => {
        setLoading(true);

        axios.post(`/${endpoint}/files`, values, SetHeaderToken())
            .then(() => {
                setLoading(false);
                enqueueSnackbar(`${resourceLabel} added`);
                if (successCallback) {
                    successCallback();
                }
            }).catch(handleRequestResourceError);
    }, [endpoint, enqueueSnackbar, resourceLabel, handleRequestResourceError, setLoading]);

    const updateFile = useCallback((values) => {
        setLoading(true);

        axios.patch(`/${endpoint}/files`, values, SetHeaderToken())
            .then((res) => {
                const updatedResourceID = values.id;
                const newResourceList = {
                    results: resourceList.results.map((r) => {
                        if (r.id === updatedResourceID) {
                            return values;
                        }

                        return r;
                    })
                }

                setResourceList(newResourceList);
                setLoading(false);
                enqueueSnackbar(`${resourceLabel} updated`);
            }).catch(handleRequestResourceError)
    }, [endpoint, enqueueSnackbar, resourceLabel, handleRequestResourceError, setLoading, resourceList]);

    const deleteFile = useCallback((id) => {
        setLoading(true);
        axios.delete(`/${endpoint}/files/${id}`, SetHeaderToken())
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

    return {
        resourceList,
        pageMax,
        addFiles,
        getAllFiles,
        getFilesPaginated,
        updateFile,
        deleteFile,
        error
    }
}