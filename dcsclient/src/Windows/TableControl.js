export function sortResourceList(resourceList, sortField, sortDirection, isReturned = false) {
    const sortedList = resourceList.results.sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];

        if (aValue < bValue) {
            return sortDirection === "asc" ? -1 : 1;
        } else if (aValue > bValue) {
            return sortDirection === "asc" ? 1 : -1;
        } else {
            return 0;
        }
    });

    if (isReturned) {
        return sortedList;
    }
}

export function sortSMCOList(fileDir, sortField, sortDirection, isReturned = false) {
    const sortedList = fileDir.sort((a, b) => {
        const aValue = (typeof a === "string") ? a : a[sortField];
        const bValue = (typeof b === "string") ? b : b[sortField];

        if (typeof a === "string" && typeof b !== "string") {
            return -1; // a is a folder, b is a file, so a should come first
        } else if (typeof a !== "string" && typeof b === "string") {
            return 1; // a is a file, b is a folder, so b should come first
        } else {
            if (aValue < bValue) {
                return sortDirection === "asc" ? -1 : 1;
            } else if (aValue > bValue) {
                return sortDirection === "asc" ? 1 : -1;
            } else {
                return 0;
            }
        }
    });

    if (isReturned) {
        return sortedList;
    }
}

export function sortTableColumn(sortField, setSortDirection, sortDirection, setSortField) {
    return (field) => {
        if (field === sortField) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
        }
    };
}
