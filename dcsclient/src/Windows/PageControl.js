import {
    Button as MUIButton,
    FormControl,
    MenuItem,
    Select as SelectMUI,
} from "@mui/material";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";

export function pageNavigator(
    handlePageChange,
    filePage,
    getPageButtons,
    pageMax
) {
    return (
        <div>
            <MUIButton
                style={{
                    border: "2px solid #555",
                    margin: "2px",
                    borderRadius: "4px",
                    padding: "8px",
                    width: "5%",
                    boxSizing: "border-box",
                }}
                onClick={() => handlePageChange(filePage - 1)}
                disabled={filePage == 1}
            >
                &lt;
            </MUIButton>

            {getPageButtons()}

            <MUIButton
                style={{
                    border: "2px solid #555",
                    margin: "2px",
                    borderRadius: "4px",
                    padding: "8px",
                    width: "5%",
                    boxSizing: "border-box",
                }}
                onClick={() => handlePageChange(filePage + 1)}
                disabled={filePage == pageMax}
            >
                &gt;
            </MUIButton>
        </div>
    );
}

export function pageLimitGoToControl(
    FormContainer,
    filePageLimit,
    handleLimitChange,
    handleChangeNavPage,
    pageSelected,
    pageMax,
    handleGoToPage
) {
    return (
        <FormContainer>
            <SelectMUI
                value={filePageLimit}
                onChange={handleLimitChange}
                style={{
                    height: "40px",
                    verticalAlign: "middle",
                }}
            >
                <MenuItem value={1}>1 in Page</MenuItem>
                <MenuItem value={5}>5 in Page</MenuItem>
                <MenuItem value={10}>10 in Page</MenuItem>
                <MenuItem value={50}>50 in Page</MenuItem>
                <MenuItem value={100}>100 in Page</MenuItem>
                <MenuItem value={1000}>1000 in Page</MenuItem>
            </SelectMUI>

            <form>
                <input
                    placeholder="Page"
                    type="number"
                    className="gotopage-input"
                    onChange={handleChangeNavPage}
                    value={pageSelected}
                    min={1}
                    max={pageMax}
                    required
                ></input>

                <FontAwesomeIcon
                    icon={faArrowRight}
                    onClick={handleGoToPage}
                    className="gotopage-icon"
                />
            </form>
        </FormContainer>
    );
}

export function paginationButtons(pageMax, filePage, handlePageChange) {
    return () => {
        const pageButtons = [];
        const maxVisibleButtons = 5;

        const maxPageButtonCount = Math.min(pageMax, maxVisibleButtons);
        const sideButtonsCount = Math.floor((maxPageButtonCount - 1) / 2);

        let startPage = Math.max(filePage - sideButtonsCount, 1);

        const endPage = Math.min(startPage + maxPageButtonCount - 1, pageMax);

        if (endPage - startPage + 1 < maxPageButtonCount) {
            startPage = Math.max(endPage - maxPageButtonCount + 1, 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pageButtons.push(
                <MUIButton
                    style={{
                        border: "2px solid #555",
                        margin: "2px",
                        borderRadius: "4px",
                        padding: "8px",
                        boxSizing: "border-box",
                    }}
                    key={i}
                    onClick={() => handlePageChange(i)}
                    disabled={filePage == i}
                >
                    {i}
                </MUIButton>
            );
        }

        return pageButtons;
    };
}

export function pageGoToNavigator(pageSelected, filePage, pageMax, setPage) {
    return () => {
        if (pageSelected == filePage) {
            alert("Already on the page!");
        } else if (pageSelected >= 1 && pageSelected <= pageMax) {
            setPage(pageSelected);
        } else {
            if (pageMax === 1) {
                alert("There is only 1 page!");
                return;
            }
            alert(`Page number must be between 1 and ${pageMax}!`);
        }
    };
}

export function formContainerStyle() {
    return styled(FormControl)`
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-end;
    `;
}
