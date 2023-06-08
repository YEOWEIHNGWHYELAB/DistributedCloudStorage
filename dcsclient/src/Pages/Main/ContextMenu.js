function rightClickMenu(position, numFile, handleRenameClick, handleMoveToClick) {
    return <div className="context-menu" style={{ top: position.y, left: position.x, position: 'absolute' }}>
        <div
            className="context-menu-item"
            onClick={() => {
                numFile.numFile === 1 ? handleRenameClick() : alert("Please select only 1 item!");
            } }
        >
            Rename
        </div>
        <div
            className="context-menu-item"
            onClick={handleMoveToClick}
        >
            Move To
        </div>
    </div>;
}

export default rightClickMenu;
