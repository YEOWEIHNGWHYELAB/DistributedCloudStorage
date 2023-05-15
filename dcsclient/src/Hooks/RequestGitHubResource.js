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
    const getResourceList = useCallback(({ query = "" } = {}) => {
        setLoading(true);

        axios.get(`/${endpoint}/${query}`, SetHeaderToken())
            .then((res) => {
                setLoading(false);

                if (res.data.results) {
                    setResourceList(res.data);
                } else {
                    setResourceList({
                        results: res.data
                    });
                }
            }).catch(handleRequestResourceError)
    }, [endpoint, handleRequestResourceError, setLoading]);

    const addResource = useCallback((values, successCallback) => {
        setLoading(true);

        axios.post(`/${endpoint}`, values, SetHeaderToken())
            .then(() => {
                setLoading(false);
                enqueueSnackbar(`${resourceLabel} added`);
                if (successCallback) {
                    successCallback();
                }
            }).catch(handleRequestResourceError);
    }, [endpoint, enqueueSnackbar, resourceLabel, handleRequestResourceError, setLoading]);

    const updateResource = useCallback((values) => {
        setLoading(true);

        axios.patch(`/${endpoint}`, values, SetHeaderToken())
            .then((res) => {
                /**
                 * Replacing the task to be updated inside the list with the 
                 * data obtained from the API, so the list will be displayed 
                 * with the updated task
                 */
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

    const deleteResource = useCallback((id) => {
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

    return {
        addResource,
        resourceList,
        getResourceList,
        addResource,
        updateResource,
        deleteResource,
        error
    }
}