import styled from "styled-components";


export function credTableStyle() {
    const StyledTable = styled.table`
        width: 100%;
        border-collapse: collapse;
        margin-top: 24px;
    `;

    const StyledHeaderRow = styled.tr`
        height: 40px;
        font-weight: bold;
        font-size: 14px;
        color: red;
    `;

    const StyledHeaderCell = styled.th`
        padding: 8px;
        text-align: left;
        cursor: pointer;
        border: 2px solid #ddd;

        &:hover {
            background-color: #ddd;
        }

        &.sortable {
            position: relative;

            &:after {
                content: "";
                display: inline-block;
                margin-left: 6px;
                width: 0;
                height: 0;
                border-left: 6px solid transparent;
                border-right: 6px solid transparent;
                border-top: 6px solid #aaa;
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                right: 8px;
            }

            &.asc:after {
                border-top: none;
                border-bottom: 6px solid #aaa;
            }

            &.desc:after {
                border-top: 6px solid #aaa;
                border-bottom: none;
            }
        }
    `;

    const StyledRow = styled.tr`
        height: 48px;
    `;

    const StyledCell = styled.td`
        border: 2px solid #ddd;
        padding: 8px;
        font-size: 14px;
    `;

    return {
        StyledTable,
        StyledHeaderRow,
        StyledHeaderCell,
        StyledRow,
        StyledCell,
    };
}
