import { useCallback, useState, useContext } from "react";
import axios from "axios";
import { useSnackbar } from "notistack";

import formatHttpApiError from "src/helpers/formatHttpApiError";
import { LoadingOverlayResourceContext } from "src/components/LoadingOverlayResource";
import getCommonOptions from "src/helpers/axios/getCommonOptions";

export default function useRequestResource({ endpoint, resourceLabel }) {
    const [resourceList, setResourceList] = useState({
        results: []
    });
    
    const [resource, setResource] = useState(null);
    const [error, setError] = useState(null);
    const { enqueueSnackbar } = useSnackbar();
    const loadingOverlay = useContext(LoadingOverlayResourceContext);
    const { setLoading } = loadingOverlay;

    const handleRequestResourceError = useCallback((err) => {
        const formattedError = formatHttpApiError(err);
        setError(formattedError);
        setLoading(false);
        enqueueSnackbar(formattedError);
    }, [enqueueSnackbar, setError, setLoading])

    // Callback lets us recreate function when dependencies created 
    const getResourceList = useCallback(({ query = "" } = {}) => {
        setLoading(true);
        axios.get(`/${endpoint}/${query}`, getCommonOptions())
            .then((res) => {
                setLoading(false);
                if (res.data.results) {
                    setResourceList(res.data);
                } else {
                    setResourceList({
                        results: res.data
                    })
                }
            }).catch(handleRequestResourceError)
    }, [endpoint, handleRequestResourceError, setLoading])

    const addResource = useCallback((values, successCallback) => {
        setLoading(true);
        axios.post(`/${endpoint}/`, values, getCommonOptions())
            .then(() => {
                setLoading(false);
                enqueueSnackbar(`${resourceLabel} added`)
                if (successCallback) {
                    successCallback();
                }
            }).catch(handleRequestResourceError)
    }, [endpoint, enqueueSnackbar, resourceLabel, handleRequestResourceError, setLoading])

    const getResource = useCallback((id) => {
        setLoading(true);
        axios.get(`/${endpoint}/${id}/`, getCommonOptions())
            .then((res) => {
                setLoading(false);
                const { data } = res;
                setResource(data);
            }).catch(handleRequestResourceError)
    }, [endpoint, handleRequestResourceError, setLoading])

    const updateResource = useCallback((id, values, successCallback) => {
        setLoading(true);
        axios.patch(`/${endpoint}/${id}/`, values, getCommonOptions())
            .then((res) => {
                /**
                 * Replacing the task to be updated inside the list with the 
                 * data obtained from the API, so the list will be displayed 
                 * with the updated task
                 */
                const updated = res.data;
                const newResourceList = {
                    results: resourceList.results.map((r) => {
                        if (r.id === id) {
                            return updated;
                        }
                        return r;
                    }),
                    count: resourceList.count
                }
                setResourceList(newResourceList);
                setLoading(false);
                enqueueSnackbar(`${resourceLabel} updated`)
                if (successCallback) {
                    successCallback();
                }
            }).catch(handleRequestResourceError)
    }, [endpoint, enqueueSnackbar, resourceLabel, handleRequestResourceError, setLoading, resourceList])

    const deleteResource = useCallback((id) => {
        setLoading(true);
        axios.delete(`/${endpoint}/${id}/`, getCommonOptions())
            .then(() => {
                setLoading(false);
                enqueueSnackbar(`${resourceLabel} deleted`)
                const newResourceList = {
                    results: resourceList.results.filter((r) => {
                        return r.id !== id
                    })
                }
                setResourceList(newResourceList);
            }).catch(handleRequestResourceError)
    }, [endpoint, resourceList, enqueueSnackbar, resourceLabel, handleRequestResourceError, setLoading])

    return {
        resourceList,
        getResourceList,
        addResource,
        resource,
        getResource,
        updateResource,
        deleteResource,
        error
    }
}