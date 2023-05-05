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
    const [resource, setResource] = useState(null);
    const [error, setError] = useState(null);

    const loadingOverlay = useContext(LoadingOverlayResourceContext);
    const { enqueueSnackbar } = useSnackbar();
    const { setLoading } = loadingOverlay;

    const handleRequestResourceError = useCallback((err) => {
        const formattedError = HTTPAPIError(err);
        setError(formattedError);
        setLoading(false);
        enqueueSnackbar(formattedError);
    }, [enqueueSnackbar, setError, setLoading])

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

    const getResource = useCallback((id) => {
        setLoading(true);

        axios.get(`/${endpoint}/${id}/`, SetHeaderToken())
            .then((res) => {
                setLoading(false);
                const { data } = res;
                setResource(data);
            }).catch(handleRequestResourceError)
    }, [endpoint, handleRequestResourceError, setLoading]);

    const updateResource = useCallback((values, successCallback) => {
        setLoading(true);

        axios.patch(`/${endpoint}`, values, SetHeaderToken())
            .then((res) => {
                /**
                 * Replacing the task to be updated inside the list with the 
                 * data obtained from the API, so the list will be displayed 
                 * with the updated task
                 */
                const updated = res.data;
                const newResourceList = {
                    results: resourceList.results.map((r) => {
                        if (values.id === r.id) {
                            return updated;
                        }

                        return r;
                    }),
                    count: resourceList.count
                }

                setResourceList(newResourceList);
                setLoading(false);
                enqueueSnackbar(`${resourceLabel} updated`);

                if (successCallback) {
                    successCallback();
                }
            }).catch(handleRequestResourceError)
    }, [endpoint, enqueueSnackbar, resourceLabel, handleRequestResourceError, setLoading, resourceList]);

    /**
     * In general, it is not recommended to embed IDs into the request body of a DELETE request. 
     * According to the HTTP specification, the DELETE method should not have a request body, since 
     * it is intended to delete a resource identified by the URI. Instead, the resource to be 
     * deleted should be identified in the URI itself.
     * 
     * However, some API designs may choose to allow DELETE requests with a request body, in which 
     * case you can embed the IDs to delete in the request body. To do this using Axios, you can pass 
     * an object with the IDs as a property to the axios.delete method.
     * 
     * If you really want to perform multiple delete for a delete heavy application, use POST instead.
     */
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
        resource,
        getResource,
        updateResource,
        deleteResource,
        error
    }
}