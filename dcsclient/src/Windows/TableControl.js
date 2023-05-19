export function sortResourceList(resourceList, sortField, sortDirection, isReturned) {
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

export function sortTableColumn(sortField, setSortDirection, sortDirection, setSortField) {
    return (field) => {
        if (field === sortField) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
        }
    };
}
