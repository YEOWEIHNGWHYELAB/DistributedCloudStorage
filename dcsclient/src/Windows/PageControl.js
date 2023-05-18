import {
    Button as MUIButton,
    MenuItem,
    Select as SelectMUI,
} from "@mui/material";
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
                disabled={filePage === 1}
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
                disabled={filePage === pageMax}
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
