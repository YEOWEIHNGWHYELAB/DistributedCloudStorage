import { Button as MUIButton } from "@mui/material";

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
