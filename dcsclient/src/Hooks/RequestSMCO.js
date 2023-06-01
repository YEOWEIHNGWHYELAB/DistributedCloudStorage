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

    const getAllDirBuilder = useCallback(() => {
        setLoading(true);

        axios.get(`/smco/filespag`, SetHeaderToken())
            .then((res) => {
                setLoading(false);

                if (res.data) {
                    setBuildDirList({
                        buildDir: res.data.lvlorderdir
                    });
                }
            }).catch(handleRequestResourceError);
    }, [handleRequestResourceError, setLoading]);

    const getAllFiles = useCallback((values) => {
        setLoading(true);

        axios.post(`/smco/filespag`, values, SetHeaderToken())
            .then((res) => {
                setLoading(false);

                if (res.data) {
                    setResourceList({
                        results: res.data.results,
                        numFile: res.data.filecount
                    });
                }
            }).catch(handleRequestResourceError);
    }, [handleRequestResourceError, setLoading]);

    return {
        resourceList,
        buildDirList,
        getAllFiles,
        getAllDirBuilder,
        error
    }
}